#!/usr/bin/env bash
# post_json_with_csrf.sh
# Usage: ./scripts/post_json_with_csrf.sh <URL> '<json-body>'
# Example:
#   ./scripts/post_json_with_csrf.sh /welcome/ '{"city":"Mumbai"}'
#   ./scripts/post_json_with_csrf.sh http://localhost:8000/welcome/ '{"city":"Mumbai"}'

HOST="http://localhost:8000"
COOKIE_FILE="cookies.txt"

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: $0 <url> '<json-body>'"
  exit 1
fi
URL="$1"
DATA="$2"

# Fetch CSRF cookie
curl -s -c "$COOKIE_FILE" "$HOST/api/csrf/" >/dev/null
if [ ! -f "$COOKIE_FILE" ]; then
  echo "Failed to get cookie file"
  exit 1
fi

# Extract token (7th column)
TOKEN=$(awk '/csrftoken/ {print $7; exit}' "$COOKIE_FILE")
if [ -z "$TOKEN" ]; then
  echo "csrftoken not found in $COOKIE_FILE"
  exit 1
fi

echo "CSRF token: $TOKEN"

# Build full URL
if [[ "$URL" =~ ^https?:// ]]; then
  FULL_URL="$URL"
else
  HOST_TRIM=${HOST%/}
  FULL_URL="$HOST_TRIM$URL"
fi

# POST
curl -s -b "$COOKIE_FILE" -H "Content-Type: application/json" -H "X-CSRFToken: $TOKEN" -d "$DATA" -X POST "$FULL_URL"

echo
