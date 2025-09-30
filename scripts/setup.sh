#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env"
TEMPLATE_FILE=".env.example"

if [[ ! -f "$TEMPLATE_FILE" ]];
then
  echo "Template $TEMPLATE_FILE not found. Aborting." >&2
  exit 1
fi

if [[ -f "$ENV_FILE" ]];
then
  read -r -p "$ENV_FILE already exists. Overwrite? [y/N] " confirm
  if [[ ! "$confirm" =~ ^[Yy]$ ]];
  then
    echo "Keeping existing $ENV_FILE."
    exit 0
  fi
fi

copy_defaults() {
  cp "$TEMPLATE_FILE" "$ENV_FILE"
}

prompt_for_value() {
  local key="$1"
  local default="$2"
  local prompt="$3"
  local value
  read -r -p "$prompt [$default]: " value
  if [[ -z "$value" ]];
  then
    value="$default"
  fi
  # Escape forward slashes for sed
  local escaped_value
  escaped_value=$(printf '%s' "$value" | sed 's/[&/]/\\&/g')
  sed -i '' "s/^$key=.*/$key=$escaped_value/" "$ENV_FILE"
}

copy_defaults

echo "\nConfigure SteganoWeb environment (leave blank to accept default).\n"

prompt_for_value "JWT_SECRET" "change-me-to-a-long-random-string" "JWT secret (min 32 chars recommended)"
prompt_for_value "SESSION_COOKIE_DOMAIN" "localhost" "Cookie domain"
prompt_for_value "FRONTEND_URL" "http://localhost:5678" "Public frontend URL"
prompt_for_value "BACKEND_URL" "http://localhost:4000" "Public backend URL"
prompt_for_value "VITE_API_URL" "http://localhost:4000" "Frontend API base URL"
prompt_for_value "ENABLE_PAYMENTS" "false" "Enable Stripe payments? (true/false)"
prompt_for_value "ENABLE_NANO_BANANA" "false" "Enable Nano Banana AI? (true/false)"

cat <<EONOTE

Updated $ENV_FILE. Review sensitive placeholders (Stripe, Google OAuth, DB credentials) before deployment.

Run the stack with:
  docker compose up --build -d

EONOTE
