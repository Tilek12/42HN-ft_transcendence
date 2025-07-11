#!/bin/bash
set -e

echo "🔧 Starting local setup..."

# 1. Load env vars
ENV_FILE="./.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "❌ .env file not found. Please create it with BACKEND_PORT or FRONTEND_PORT."
  exit 1
fi

source "$ENV_FILE"

if [ -z "$BACKEND_PORT" ] || [ -z "$FRONTEND_PORT" ]; then
  echo "❌ BACKEND_PORT or FRONTEND_PORT is not set in .env file."
  exit 1
fi

# 2. Detect local IP address (macOS + fallback)
LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || hostname -I | awk '{print $1}')

if [ -z "$LOCAL_IP" ]; then
  echo "❌ Could not detect your local IP address."
  exit 1
fi

echo "🖥️  Detected local IP: $LOCAL_IP"

# 3. Append to .env if not already defined
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

append_to_env "$ENV_FILE" "LOCAL_IP" "$LOCAL_IP"

# 4. Check OpenSSL
check_openssl() {
    if ! command -v openssl &> /dev/null; then
        echo "❌ OpenSSL not found. Attempting to install via Homebrew..."

        if ! command -v brew &> /dev/null; then
            echo "❌ Homebrew not installed. Please install Homebrew first:"
            echo "    /bin/bash -c $(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            exit 1
        fi

        brew install openssl
        # Add openssl to PATH if installed but not found
        if [ -f "/usr/local/opt/openssl/bin/openssl" ]; then
            export PATH="/usr/local/opt/openssl/bin:$PATH"
        fi

        # Verify installation
        if ! command -v openssl &> /dev/null; then
            echo "❌ Failed to install OpenSSL. Please install it manually."
            exit 1
        fi
        echo "✅ OpenSSL installed successfully"
    else
        echo "✅ OpenSSL found: $(openssl version)"
    fi
}

check_openssl

# 5. Create self-signed cert for IP if not exists
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

# 6. Output usage info
echo
echo "🌐 Use this URL to access the server:"
echo "➡️  Backend:  https://$LOCAL_IP:$BACKEND_PORT"
echo "➡️  Frontend: https://$LOCAL_IP:$FRONTEND_PORT"
echo
echo "💡 You may see a browser warning — it's a self-signed certificate."
echo
