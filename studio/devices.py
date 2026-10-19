"""Shared fleet registry and individually supplied, server-only admin credentials."""

from __future__ import annotations

import os
import re
import sqlite3
import stat
from dataclasses import replace
from typing import Literal
from uuid import uuid4

from studio.db import Store
from studio.kiosk import KioskClient, normalize_url, validate_token
from studio.models import (Conflict, CredentialsRequired, Device, IdentityMismatch,
                           NotFound, RemoteRejected, ValidationError)
from studio.storage import open_directory


class CredentialStore:
    """Opaque files; never serialize this object or its refs through the API."""

    def __init__(self, store: Store):
        self.path = store.root / "credentials"

    def put(self, token: str) -> str:
        validate_token(token)
        ref = uuid4().hex
        with open_directory(self.path) as directory:
            os.fchmod(directory, 0o700)
            fd = os.open(ref, os.O_WRONLY | os.O_CREAT | os.O_EXCL | os.O_NOFOLLOW,
                         0o600, dir_fd=directory)
            with os.fdopen(fd, "wb") as target:
                target.write(token.encode("ascii"))
                target.flush()
                os.fsync(target.fileno())
            os.fsync(directory)
        return ref

    def get(self, ref: str | None) -> str:
        if ref is None or not re.fullmatch(r"[a-f0-9]{32}", ref):
            raise CredentialsRequired("Kiosk admin credentials required")
        try:
            with open_directory(self.path) as directory:
                os.fchmod(directory, 0o700)
                fd = os.open(ref, os.O_RDONLY | os.O_NOFOLLOW | os.O_NONBLOCK, dir_fd=directory)
                with os.fdopen(fd, "rb") as source:
                    info = os.fstat(source.fileno())
                    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077:
                        raise CredentialsRequired("Unsafe credential file")
                    token = source.read(8193).decode("ascii")
                    return validate_token(token)
        except (OSError, ValueError, UnicodeError, ValidationError):
            raise CredentialsRequired("Kiosk admin credentials required") from None


class DeviceService:
    def __init__(self, store: Store, client: KioskClient | None = None):
        self.store = store
        self.credentials = CredentialStore(store)
        self.client = client if client is not None else KioskClient(self._token)

    @staticmethod
    def _device(row: sqlite3.Row) -> Device:
        return Device(row["id"], row["url"], row["role"], bool(row["active"]),
                      row["leader_id"], "ready" if row["credential_ref"] else "credentials_required",
                      row["profile_id"], bool(row["model_eligible"]))

    def _token(self, device: Device) -> str:
        with self.store.transaction() as db:
            row = db.execute("SELECT credential_ref, active, removed FROM devices WHERE id = ?", (device.id,)).fetchone()
        if row is None:
            raise CredentialsRequired("Kiosk admin credentials required")
        # A caller may still hold a pre-refresh Device snapshot. Consult current
        # registry activity before using retained credentials for any request.
        if not row["active"] or row["removed"]:
            raise RemoteRejected("Kiosk is inactive")
        return self.credentials.get(row[0])

    def get(self, device_id: str) -> Device:
        with self.store.transaction() as db:
            row = db.execute("SELECT * FROM devices WHERE id = ? AND removed=0", (device_id,)).fetchone()
        if row is None:
            raise NotFound("Device not found")
        return self._device(row)

    def list(self) -> list[Device]:
        with self.store.transaction() as db:
            return [self._device(row) for row in db.execute("SELECT * FROM devices WHERE removed=0 ORDER BY rowid")]

    def update_address(self, device_id: str, url: str) -> Device:
        url = normalize_url(url)
        self.get(device_id)
        with self.store.transaction() as db:
            db.execute("UPDATE devices SET url=?, url_override=? WHERE id=? AND removed=0", (url, url, device_id))
        return self.get(device_id)

    def remove(self, device_id: str) -> None:
        device = self.get(device_id)
        with self.store.transaction() as db:
            db.execute("UPDATE devices SET removed=1, active=0 WHERE id=?", (device_id,))
            if device.role == 'leader':
                db.execute("UPDATE devices SET removed=1, active=0 WHERE leader_id=? AND role='follower'", (device_id,))

    def add_with_password(self, url: str, password: str, role: Literal["standalone", "leader"]) -> Device:
        url = normalize_url(url)
        if role not in ("leader", "standalone"):
            raise ValidationError("Invalid configured device role")
        token = self.client.login(Device("", url, role), password)
        return self.add(url, token, role)

    def set_password(self, device_id: str, password: str) -> Device:
        # Explicit authentication may probe an inactive member, but never reactivate it.
        device = replace(self.get(device_id), active=True)
        token = self.client.login(device, password)
        return self.set_credentials(device_id, token)

    def add(self, url: str, token: str, role: Literal["standalone", "leader"]) -> Device:
        url = normalize_url(url)
        validate_token(token)
        if role not in ("leader", "standalone"):
            raise ValidationError("Invalid configured device role")
        probe = Device("", url, role)
        identity = KioskClient(lambda _: token).identity(probe)
        if identity.follows:
            role = "follower"
        elif identity.leader != (role == "leader"):
            raise Conflict("Configured role does not match kiosk")
        ref = self.credentials.put(token)
        try:
            with self.store.transaction() as db:
                existing = db.execute("SELECT * FROM devices WHERE id = ?", (identity.id,)).fetchone()
                if existing is not None and existing["role"] == "follower":
                    role = "follower"
                # Re-adding retained followers never reactivates automatic actions.
                if existing is None:
                    db.execute("INSERT INTO devices (id,url,role,credential_ref,model_eligible) VALUES (?,?,?,?,?)",
                               (identity.id, url, role, ref, role != "follower"))
                else:
                    db.execute("UPDATE devices SET url=?, url_override=?, role=?, credential_ref=?, model_eligible=?, removed=0, active=? WHERE id=?",
                               (url, url, role, ref, bool(existing["model_eligible"]) if role == "follower" else True,
                                True if existing['removed'] else existing['active'], identity.id))
        except sqlite3.IntegrityError:
            raise Conflict("Only one configured fleet leader is supported") from None
        return self.get(identity.id)

    def set_credentials(self, device_id: str, token: str) -> Device:
        device = self.get(device_id)
        validate_token(token)
        # Explicit credential administration may probe an inactive kiosk. Only
        # this identity call uses the temporary probe and newly supplied token;
        # never persist/return it or grant scrape/upload access to the record.
        identity = KioskClient(lambda _: token).identity(replace(device, active=True))
        ref = self.credentials.put(token)
        role = "follower" if device.role == "follower" or identity.follows else device.role
        with self.store.transaction() as db:
            db.execute("UPDATE devices SET credential_ref=?, role=? WHERE id=?", (ref, role, device_id))
        return self.get(device_id)

    def refresh_fleet(self, leader_id: str) -> list[Device]:
        leader = self.get(leader_id)
        if leader.role != "leader" or not leader.active:
            raise Conflict("Device is not the configured leader")
        identity = self.client.identity(leader)
        if not identity.leader or identity.follows:
            with self.store.transaction() as db:
                db.execute("UPDATE devices SET role='follower', model_eligible=0 WHERE id=?", (leader_id,))
            raise Conflict("Configured leader role changed")
        data = self.client.command(leader, "fleetStatus", {})
        if not isinstance(data.get("self"), dict) or data["self"].get("id") != leader.id:
            raise IdentityMismatch("Fleet identity changed")
        if data.get("leader") is not True or data.get("following") is not None:
            raise RemoteRejected("Kiosk no longer leads this fleet")
        # Validate the entire roster before updating anything; malformed/offline is
        # not an empty roster and must never disable every known follower.
        try:
            if not isinstance(data["profiles"], list) or not isinstance(data["followers"], list):
                raise ValueError
            profiles = {}
            for profile in data["profiles"]:
                if not isinstance(profile["id"], str) or not isinstance(profile["categories"], list):
                    raise ValueError
                profiles[profile["id"]] = "Voice Satellite" in profile["categories"]
            rows = []
            seen = {leader.id}
            for follower in data["followers"]:
                device_id = follower["id"]
                address = follower["address"]
                port = follower["port"]
                profile_id = follower["profile"]
                if (not isinstance(device_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{1,200}", device_id)
                        or device_id in seen or not isinstance(address, str)
                        or any(c in address for c in "/?#@[]\\")
                        or type(port) is not int or not 1 <= port <= 65535
                        or not isinstance(profile_id, str) or profile_id not in profiles):
                    raise ValueError
                seen.add(device_id)
                host = f"[{address}]" if ":" in address else address
                url = normalize_url(f"http://{host}:{port}")
                # fleetStatus retains invitation/left rows in its roster. Only
                # these nonmember phases disable actions; offline/error/update
                # phases still describe members and must remain retryable.
                active = follower.get("phase") not in ("left", "pending", "declined")
                rows.append((device_id, url, profile_id, profiles[profile_id], active))
        except (KeyError, TypeError, ValueError, ValidationError):
            raise RemoteRejected("Invalid fleet roster") from None
        with self.store.transaction() as db:
            # Network calls above can outlive local registry administration.
            # Recheck under the same write lock as the upsert so removal wins.
            current = db.execute("SELECT active, removed, role FROM devices WHERE id=?", (leader_id,)).fetchone()
            if current is None or current['removed'] or not current['active'] or current['role'] != 'leader':
                raise Conflict('Fleet leader changed while refreshing')
            db.execute("UPDATE devices SET active=0 WHERE role='follower' AND leader_id=?", (leader_id,))
            for device_id, url, profile_id, eligible, active in rows:
                db.execute("""INSERT INTO devices (id,url,role,leader_id,profile_id,model_eligible,active)
                              VALUES (?,?,'follower',?,?,?,?) ON CONFLICT(id) DO UPDATE SET
                               url=COALESCE(devices.url_override,excluded.url), removed=0, role='follower', active=excluded.active, leader_id=excluded.leader_id,
                              profile_id=excluded.profile_id, model_eligible=excluded.model_eligible""",
                           (device_id, url, leader_id, profile_id, eligible, active))
        return [self.get(row[0]) for row in rows]

    def publication_targets(self) -> list[Device]:
        return [device for device in self.list() if device.active and
                device.role in ("leader", "standalone") and device.credentials_status == "ready"]
