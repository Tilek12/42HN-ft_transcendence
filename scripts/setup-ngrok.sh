#!/bin/bash
set -e

# Load env vars
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it with NGROK_AUTHTOKEN and NGROK_DOMAIN."
  exit 1
fi

source .env

if [ -z "$NGROK_AUTHTOKEN" ] || [ -z "$NGROK_DOMAIN" ]; then
  echo "❌ NGROK_AUTHTOKEN or NGROK_DOMAIN is not set in .env file."
  exit 1
fi

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
  echo "🛠️  Ngrok not found. Installing..."

  # Detect OS
  UNAME=$(uname)
  if [[ "$UNAME" == "Linux" ]]; then
    curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc > /dev/null
    echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list > /dev/null
    sudo apt update
    sudo apt install -y ngrok
  elif [[ "$UNAME" == "Darwin" ]]; then
    brew install ngrok
  else
    echo "❌ Unsupported OS for automatic ngrok install."
    exit 1
  fi
fi

# Set ngrok token if not exist
if ! grep -q "authtoken:" ~/.config/ngrok/ngrok.yml 2>/dev/null; then
  echo "🔐 Setting up ngrok token..."
  ngrok config add-authtoken "$NGROK_AUTHTOKEN"
else
  echo "ℹ️  Ngrok authtoken already configured, skipping..."
fi


# Check if ngrok is already running
if pgrep -x "ngrok" >/dev/null; then
  echo "ℹ️  Ngrok is already running, skipping..."
else
  # Start ngrok with reserved domain to HTTPS localhost
  echo "🌐 Starting ngrok with reserved domain: $NGROK_DOMAIN (forwarding to https://localhost:3000)"
  ngrok http --domain="$NGROK_DOMAIN" https://localhost:3000 > /dev/null &
  NGROK_PID=$!

  # Wait a few seconds to ensure it's up
  sleep 3
fi

# Inject the domain into frontend if not already exists
FRONTEND_ENV=./apps/frontend/.env
if [ ! -f "$FRONTEND_ENV" ]; then
  touch "$FRONTEND_ENV"
fi

if ! grep -q "VITE_BACKEND_URL=" "$FRONTEND_ENV"; then
  echo "VITE_BACKEND_URL=https://$NGROK_DOMAIN" >> "$FRONTEND_ENV"
  echo "📝 Added VITE_BACKEND_URL=https://$NGROK_DOMAIN to $FRONTEND_ENV"
else
  echo "ℹ️  VITE_BACKEND_URL already exists in $FRONTEND_ENV, skipping..."
fi

echo "✅ ngrok setup completed successfully"
