# ⚙️ Set default target
.DEFAULT_GOAL := help

# 📌 Declare phony targets
.PHONY: \
	start stop re \
	up down clean \
	setup-local setup-ngrok \
	logs ps env-check help

# Fail immediately if any command fails
SHELL := /bin/bash -o pipefail -o errexit -o nounset

# Color codes
RED		= \033[0;31m
GREEN	= \033[0;32m
YELLOW	= \033[0;33m
BLUE	= \033[0;34m
VIOLET	= \033[0;35m
RESET	= \033[0m

# Docker compose configuration
DOCKER_COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml
COMPOSE := $(DOCKER_COMPOSE) -f $(COMPOSE_FILE)

# Environment validation
ENV_FILE := .env

## --------------------------- ##
##  Project Lifecycle Targets  ##
## --------------------------- ##

start: setup-local setup-ngrok up	## 🚀 Full start process (setup + run)

stop: clean		## 🛑 Stop all services (graceful shutdown)

re: clean start		## 🔄 Restart everything

## --------------------------- ##
##      Docker Operations      ##
## --------------------------- ##

up:		## 🐳 Start containers with build
	@printf "$(BLUE)🐳 Starting Docker containers...$(RESET)\n"
	$(COMPOSE) up --build || true
	@printf "$(RED)🛑 Containers stopped$(RESET)\n"

down:	## 🛑 Stop containers
	@printf "$(VIOLET)🛑 Stopping containers...$(RESET)\n"
	$(COMPOSE) down

clean:	## 🧹 Clean everything (volumes, images, orphans)
	@printf "$(VIOLET)🧹 Cleaning Docker artifacts...$(RESET)\n"
	$(COMPOSE) down -v --rmi local --remove-orphans

## --------------------------- ##
##        Setup Targets        ##
## --------------------------- ##

setup-local: env-check	## 🌐 Setup local environment (IP, certs, etc.)
	@printf "$(YELLOW)🔧 Setting up local development environment...$(RESET)\n"
	./scripts/setup-local.sh

setup-ngrok: env-check	## 🚪 Setup ngrok tunnel
	@printf "$(YELLOW)🌐 Setting up ngrok tunnel...$(RESET)\n"
	./scripts/setup-ngrok.sh

## --------------------------- ##
##       Utility Targets       ##
## --------------------------- ##

logs:		## 📄 View container logs
	$(COMPOSE) logs -f

ps:			## 📊 Show container status
	$(COMPOSE) ps

env-check:	## 🔍 Verify environment file exist
	@if [ ! -f $(ENV_FILE) ]; then \
		printf "$(RED)❌ Missing required .env in project root$(RESET)\n"; \
		exit 1; \
	fi

help:		## 🆘 Display this help message
	@printf "\n$(BLUE)🏓 Pong Game Management$(RESET)\n\n"
	@printf "$(YELLOW)Usage:$(RESET)\n  make <target>\n\n"
	@printf "$(YELLOW)Targets:$(RESET)\n"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / { \
		printf "  $(GREEN)%-15s$(RESET) %s\n", $$1, $$2 \
	}' $(MAKEFILE_LIST)
	@printf "\n"
