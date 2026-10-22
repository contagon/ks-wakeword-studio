# Show available commands.
default:
    @just --list

# Build the local studio image.
build:
    docker compose build

# Start in the background; data stays in the $DATA host directory.
start:
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

test_venv := justfile_directory() / ".venv-test"
test_python := test_venv / "bin/python"

# Build the Vue UI into static/ui.
ui:
    [ -d frontend/node_modules ] || npm --prefix frontend ci
    npm --prefix frontend run build

# Create or refresh the lightweight test venv (no CUDA training stack).
test-venv:
    [ -x {{test_python}} ] || python3 -m venv {{test_venv}}
    {{test_python}} -m pip install -q -r requirements-dev.txt

# Type-check and build the UI, then run Python and frontend unit tests.
test: test-venv ui
    {{test_python}} -m pytest -q
    npm --prefix frontend test -- --run

# Run the Playwright browser suite against the real app (it rebuilds static/ui first).
e2e: test-venv
    [ -d frontend/node_modules ] || npm --prefix frontend ci
    cd frontend && STUDIO_TEST_PYTHON={{test_python}} npm run test:e2e

# Open a shell in the running studio container.
shell:
    docker compose exec studio bash
