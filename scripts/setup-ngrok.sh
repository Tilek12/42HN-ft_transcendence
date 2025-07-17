#!/bin/bash
set -e

# 1. Load env vars
if [ ! -f .env ]; then
  echo "❌ .env file not found. Please create it with BACKEND_PORT, NGROK_AUTHTOKEN and NGROK_DOMAIN."
  exit 1
fi

source .env

if [ -z "$BACKEND_PORT" ] || [ -z "$NGROK_AUTHTOKEN" ] || [ -z "$NGROK_DOMAIN" ]; then
  echo "❌ BACKEND_PORT, NGROK_AUTHTOKEN or NGROK_DOMAIN is not set in .env file."
  exit 1
fi

# 2. Check if ngrok is installed
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

# 3. Set ngrok token if not exist
if ! grep -q "authtoken:" ~/.config/ngrok/ngrok.yml 2>/dev/null; then
  echo "🔐 Setting up ngrok token..."
  ngrok config add-authtoken "$NGROK_AUTHTOKEN"
else
  echo "ℹ️  Ngrok authtoken already configured, skipping..."
fi


# 4. Check if ngrok is already running
if pgrep -x "ngrok" >/dev/null; then
  echo "ℹ️  Ngrok is already running, skipping..."
else
  # Start ngrok with reserved domain to HTTPS localhost
  echo "🌐 Starting ngrok with reserved domain: $NGROK_DOMAIN (forwarding to https://localhost:$BACKEND_PORT)"
  ngrok http --domain="$NGROK_DOMAIN" https://localhost:$BACKEND_PORT > /dev/null &
  NGROK_PID=$!

  # Wait a few seconds to ensure it's up
  sleep 3
fi

# 5. Inject the domain into .env if not already exists
ENV=./.env

if ! grep -q "VITE_NGROK_URL=" "$ENV"; then
  echo "VITE_NGROK_URL=https://$NGROK_DOMAIN" >> "$ENV"
  echo "📝 Added VITE_NGROK_URL=https://$NGROK_DOMAIN to $ENV"
else
  echo "ℹ️  VITE_NGROK_URL already exists in $ENV, skipping..."
fi

echo "✅ ngrok setup completed successfully"
