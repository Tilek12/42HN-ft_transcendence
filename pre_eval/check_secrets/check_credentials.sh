#!/bin/bash

# ================================================================
# Check for hardcoded credentials, API keys, or tokens outside .env
# ================================================================

echo "🔍 Running automated secret scan..."

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"/../.. || exit 1
OUTPUT_FILE="$SCRIPT_DIR/scan_results.txt"

# Run grep to find sensitive keywords and actual hardcoded patterns
# Filter out safe matches (references to environment variables)
# e.g., process.env, dotenv.config, import.meta.env
grep -RniE "(password|secret|apikey|api_key|token|auth|credential|bearer|['\"](token\s*=\s*['\"]|secret\s*=\s*['\"]))" . \
  --exclude-dir={node_modules,.git,dist,docs,tests,./apps/src/frontend} \
  --exclude={.env,.gitignore,package-lock.json,project_structure.txt,NotesPhilipp.md,README.md,./apps/src/backend/auth/schemas.ts,docker-compose.yml} \
  --binary-files=without-match \
| grep -vE "(process\.env|dotenv|import\.meta\.env|echo\s|console)" > "$OUTPUT_FILE"

# If any suspicious lines remain, fail the test
if [[ -s "$OUTPUT_FILE" ]]; then
    echo "⚠️  Test failed: Found potential hardcoded secrets or credentials!"
    echo "----------------------------------------------------------"
    cat "$OUTPUT_FILE"
    echo "----------------------------------------------------------"
    echo "❌ Please move all secrets into your .env file and use environment variables."
    echo "📄 Filtered report: $OUTPUT_FILE"
    exit 1
else
    echo "✅ Test passed: No hardcoded credentials or secrets found outside .env file."
    echo "📄 Detailed scan: $OUTPUT_FILE"
    exit 0
fi
