# Fail immediately if any command fails
SHELL := /bin/bash -o pipefail -o errexit -o nounset

.PHONY: start setup-local setup-ngrok docker-up clean

# Start the program
start: setup-local setup-ngrok docker-up

# Setup local environment ( local IP, mkcert, SSL, .env)
setup-local:
	@echo "🚀 Setting up local development environment..."
	./scripts/setup-local.sh

# Setup ngrok tunnel
setup-ngrok:
	@echo "🌐 Setting up ngrok tunnel..."
	./scripts/setup-ngrok.sh

# Start Docker containers
docker-up:
	@echo "🐳 Starting Docker containers..."
	docker-compose up --build

# Clean up
clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
