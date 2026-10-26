# Interactive shells in the studio container (e.g. `just shell`).
[ -z "$PS1" ] && return

HISTCONTROL=ignoredups:ignorespace
shopt -s histappend checkwinsize
PS1='\u@\h:\w\$ '
alias ls='ls --color=auto' ll='ls -alF' grep='grep --color=auto'

# Per-install additions live with the data.
[ -f /data/.bashrc ] && . /data/.bashrc

if ! mountpoint -q /data ; then
    cat <<EOF >&2
=======================================================
WARNING: The /data directory is NOT mounted.
Training without /data mounted could add over 140Gb of
python packages and training files to this container's
storage. Recreate the container with '-v <host_dir>:/data'
on a device with enough free space.
=======================================================
EOF
fi

if [ -d /data/.venv ]; then
    . /data/.venv/bin/activate
else
    echo "WARNING: /data/.venv not found; run /root/mww-scripts/cli/setup_python_venv before training." >&2
fi
alias venv='[ -d /data/.venv ] && source /data/.venv/bin/activate || echo "/data/.venv does not exist yet"'
