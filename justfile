# Show available commands.
default:
    @just --list

# Build the local studio image.
build:
    docker compose build

# Start in the background, preserving the existing named data volume.
start:
    docker volume create ks-wakeword-studio-data > /dev/null
    docker compose up -d

# Stop the Compose service without deleting containers or data.
stop:
    docker compose stop

# Follow the studio logs.
logs:
    docker compose logs -f studio

# Show Compose service status.
status:
    docker compose ps
