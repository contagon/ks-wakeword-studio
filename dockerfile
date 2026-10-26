# One image definition, two variants:
#   docker build .                            # default (ubuntu:24.04, Python 3.12)
#   docker build --build-arg VARIANT=blackwell .   # RTX 50 / Blackwell (CUDA base, adds Python 3.13)
ARG VARIANT=default

# Vue/TypeScript UI build; Node.js is not needed at runtime.
FROM node:22-slim AS ui
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM ubuntu:24.04 AS system-default
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev python3-pip python-is-python3 \
    git wget curl unzip patch ninja-build build-essential cmake pkg-config \
    ca-certificates nano less libgomp1 ffmpeg sox libsox-fmt-all libsndfile1 espeak-ng \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /data

FROM nvidia/cuda:12.8.1-cudnn-devel-ubuntu24.04 AS system-blackwell
ENV DEBIAN_FRONTEND=noninteractive
ENV CUDA_HOME=/usr/local/cuda
ENV PATH=/usr/local/cuda/bin:${PATH}
ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64:${LD_LIBRARY_PATH}
ENV MWW_BLACKWELL_IMAGE=1
ENV MWW_BLACKWELL_TF=required
ENV MWW_BLACKWELL_TF_WHEEL_URL=https://github.com/chivitiH/tensorflow-blackwell-python313/releases/download/v2.22.0-selfbuilt/tensorflow-2.22.0.dev0+selfbuilt-cp313-cp313-linux_x86_64.whl
# Python 3.12 remains the main trainer/runtime venv, while Python 3.13 is used
# only for the Blackwell TensorFlow training step.
RUN apt-get update && apt-get install -y --no-install-recommends \
    software-properties-common ca-certificates curl git wget unzip patch \
    ninja-build build-essential cmake pkg-config nano less libgomp1 \
    ffmpeg sox libsox-fmt-all libsndfile1 espeak-ng \
 && add-apt-repository -y ppa:deadsnakes/ppa \
 && apt-get update \
 && apt-get install -y --no-install-recommends \
    python3.12 python3.12-venv python3.12-dev \
    python3.13 python3.13-venv python3.13-dev \
    python3-pip python-is-python3 \
 && ldconfig \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /data

FROM system-${VARIANT}

# Trainer UI port
EXPOSE 8789

# Script root
WORKDIR /root/mww-scripts

# Bash environment for interactive shells
COPY --chmod=0644 .bashrc /root/

# Server, Studio package (with its schema and catalog files), and CLI tools
COPY --chmod=0755 run.sh /root/mww-scripts/
COPY --chmod=0644 trainer_server.py requirements.txt tts_config.py /root/mww-scripts/
COPY studio/ /root/mww-scripts/studio/
COPY --chmod=0755 cli/ /root/mww-scripts/cli/

# Static shell plus the UI bundle built in the ui stage
COPY static/ /root/mww-scripts/static/
COPY --from=ui /src/static/ui/ /root/mww-scripts/static/ui/

# trainer server
CMD ["/bin/bash", "-lc", "/root/mww-scripts/run.sh"]
