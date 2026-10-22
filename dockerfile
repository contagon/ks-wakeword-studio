# Vue/TypeScript UI build; Node.js is not needed at runtime.
FROM node:22-slim AS ui
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Base
FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# System deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev python3-pip python-is-python3 \
    git wget curl unzip patch ninja-build build-essential cmake pkg-config \
    ca-certificates nano less libgomp1 ffmpeg sox libsox-fmt-all libsndfile1 espeak-ng \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /data

# Trainer UI port
EXPOSE 8789

# Script root
WORKDIR /root/mww-scripts

# Bash environment
COPY --chown=root:root --chmod=0755 .bashrc /root/

# Root-level entrypoints
COPY --chown=root:root --chmod=0755 \
    run.sh \
    trainer_server.py \
    requirements.txt \
    /root/mww-scripts/

COPY --chown=root:root --chmod=0644 tts_config.py /root/mww-scripts/tts_config.py

# Studio package and migration resources
COPY --chown=root:root studio/ /root/mww-scripts/studio/

# CLI folder
COPY --chown=root:root cli/ /root/mww-scripts/cli/

# Make all CLI scripts executable (avoids "Permission denied")
RUN chmod -R a+x /root/mww-scripts/cli

# Static shell plus the UI bundle built in the ui stage
COPY --chown=root:root static/ /root/mww-scripts/static/
COPY --from=ui --chown=root:root /src/static/ui/ /root/mww-scripts/static/ui/

# trainer server
CMD ["/bin/bash", "-lc", "/root/mww-scripts/run.sh"]
