#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${API_BASE_URL:-http://localhost:5158}"

log() { echo "$1"; }

call_api() {
  local method="$1"
  local url="$2"
  local token="${3:-}"
  local body="${4:-}"

  if [[ -n "$token" ]]; then
    auth_header=(-H "Authorization: Bearer $token")
  else
    auth_header=()
  fi

  if [[ -n "$body" ]]; then
    status=$(curl -s -o /tmp/resp.txt -w "%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" "${auth_header[@]}" -d "$body")
  else
    status=$(curl -s -o /tmp/resp.txt -w "%{http_code}" -X "$method" "$url" "${auth_header[@]}")
  fi

  echo "$status"
}

get_token() {
  local email="$1"
  local password="$2"
  local payload
  payload=$(printf '{"email":"%s","password":"%s"}' "$email" "$password")
  status=$(call_api POST "$BASE_URL/api/auth/login" "" "$payload")
  if [[ "$status" != "200" ]]; then
    log "Login failed for $email (status $status)"
    echo ""
    return
  fi
  token=$(cat /tmp/resp.txt | python -c "import json,sys;print(json.load(sys.stdin).get('token',''))")
  echo "$token"
}

assert_status() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  if [[ "$expected" == *"$actual"* ]]; then
    log "[PASS] $name => $actual"
  else
    log "[FAIL] $name => $actual (expected: $expected)"
  fi
}

log "== Stress Input Tests =="
log "Base URL: $BASE_URL"

long_text=$(python - <<'PY'
print("x" * 5000)
PY
)

support_payload=$(printf '{"name":"Test","email":"test@example.com","message":"%s"}' "$long_text")
support_status=$(call_api POST "$BASE_URL/api/support/messages" "" "$support_payload")
assert_status "support_message_too_long" "400" "$support_status"

register_payload='{"email":"invalid-email","password":"123","firstName":"A","lastName":"B"}'
register_status=$(call_api POST "$BASE_URL/api/auth/register" "" "$register_payload")
assert_status "register_invalid_email_password" "400" "$register_status"

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  admin_token=$(get_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
  if [[ -n "$admin_token" ]]; then
    blog_payload=$(python - <<'PY'
import json
payload = {
  "title": "t" * 250,
  "summary": "x" * 5000,
  "content": "test",
  "coverImageUrl": "https://example.com/cover.jpg",
  "authorName": "a" * 200,
  "tags": "tag," * 300,
  "locale": "en",
  "seoTitle": "s" * 300,
  "seoDescription": "d" * 2000,
  "isPublished": False
}
print(json.dumps(payload))
PY
)
    blog_status=$(call_api POST "$BASE_URL/api/admin/blog/posts" "$admin_token" "$blog_payload")
    assert_status "admin_blog_oversized_fields" "400" "$blog_status"
  fi
else
  log "[SKIP] Admin blog stress (missing ADMIN_EMAIL/ADMIN_PASSWORD)"
fi

log "== Done =="
