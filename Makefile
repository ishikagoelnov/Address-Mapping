# -----------------------------
# Project Makefile
# -----------------------------

.PHONY: help build up down restart rebuild logs clean ps shell

# Default target
help:
	@echo "Available commands:"
	@echo "  make build      - Build docker containers"
	@echo "  make up         - Start containers (detached)"
	@echo "  make down       - Stop containers"
	@echo "  make restart    - Restart containers"
	@echo "  make rebuild    - Rebuild without cache and start"
	@echo "  make logs       - Show container logs"
	@echo "  make ps         - Show running containers"
	@echo "  make clean      - Remove containers, volumes, networks"
	@echo "  make shell      - Enter backend container shell"
	@echo "  make migrate    - Run the migration in backend shell"
build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart:
	docker compose down
	docker compose up -d

rebuild:
	docker compose down
	docker compose build --no-cache
	docker compose up -d

logs:
	docker compose logs -f

ps:
	docker ps

clean:
	docker compose down -v --remove-orphans

shell:
	docker exec -it address_backend bash

migrate:
	docker exec -it address_backend alembic upgrade head