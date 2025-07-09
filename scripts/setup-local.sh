#!/bin/bash
set -e

# 1. Detect local IP address (macOS + fallback)
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
  echo "❌ Could not detect your local IP address."
  exit 1
fi

echo "🖥️  Detected local IP: $LOCAL_IP"

# 2. Write to .env files (only if variable doesn't exist)
append_to_env() {
    local file="$1"
    local key="$2"
    local value="$3"

    if [ ! -f "$file" ]; then
        touch "$file"
    fi

    if ! grep -q "^$key=" "$file"; then
        echo "$key=$value" >> "$file"
        echo "✅ Added $key to $file"
    else
        echo "ℹ️ $key already exists in $file"
    fi
}

ENV_GLOBAL="./.env"
ENV_BACKEND="./apps/backend/.env"
ENV_FRONTEND="./apps/frontend/.env"

append_to_env "$ENV_GLOBAL" "LOCAL_IP" "$LOCAL_IP"
append_to_env "$ENV_BACKEND" "LOCAL_IP" "$LOCAL_IP"
append_to_env "$ENV_FRONTEND" "LOCAL_IP" "$LOCAL_IP"

# 3. Create self-signed cert for IP if not exists
CERT_DIR="./cert"
mkdir -p "$CERT_DIR"

KEY_FILE="$CERT_DIR/key.pem"
CERT_FILE="$CERT_DIR/cert.pem"

if [[ ! -f "$KEY_FILE" || ! -f "$CERT_FILE" ]]; then
  echo "🔐 Generating self-signed HTTPS certificate for $LOCAL_IP..."
  openssl req -x509 -newkey rsa:2048 -sha256 -days 365 -nodes \
    -keyout "$KEY_FILE" \
    -out "$CERT_FILE" \
    -subj "/C=DE/ST=Dev/L=LAN/O=42/CN=$LOCAL_IP" \
    -addext "subjectAltName=IP:$LOCAL_IP"
  echo "✅ Certificate created at $CERT_DIR"
else
  echo "✅ Existing certificate found at $CERT_DIR"
fi

# 4. Output usage info
echo
echo "🌐 Use this URL to access the server:"
echo "➡️  Backend:  https://$LOCAL_IP:3000"
echo "➡️  Frontend: https://$LOCAL_IP:8080"
echo
echo "💡 You may see a browser warning — it's a self-signed certificate."
echo
