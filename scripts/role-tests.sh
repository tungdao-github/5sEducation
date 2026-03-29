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

log "== Role Tests =="
log "Base URL: $BASE_URL"

guest_admin=$(call_api GET "$BASE_URL/api/admin/users")
assert_status "guest_admin_users" "401 403" "$guest_admin"

guest_instructor=$(call_api GET "$BASE_URL/api/instructor/courses")
assert_status "guest_instructor_courses" "401 403" "$guest_instructor"

if [[ -n "${USER_EMAIL:-}" && -n "${USER_PASSWORD:-}" ]]; then
  user_token=$(get_token "$USER_EMAIL" "$USER_PASSWORD")
  if [[ -n "$user_token" ]]; then
    user_admin=$(call_api GET "$BASE_URL/api/admin/users" "$user_token")
    assert_status "user_admin_users" "403" "$user_admin"
    user_instr=$(call_api GET "$BASE_URL/api/instructor/courses" "$user_token")
    assert_status "user_instructor_courses" "403" "$user_instr"
  fi
else
  log "[SKIP] User tests (missing USER_EMAIL/USER_PASSWORD)"
fi

if [[ -n "${INSTRUCTOR_EMAIL:-}" && -n "${INSTRUCTOR_PASSWORD:-}" ]]; then
  instr_token=$(get_token "$INSTRUCTOR_EMAIL" "$INSTRUCTOR_PASSWORD")
  if [[ -n "$instr_token" ]]; then
    instr_courses=$(call_api GET "$BASE_URL/api/instructor/courses" "$instr_token")
    assert_status "instructor_instructor_courses" "200" "$instr_courses"
  fi
else
  log "[SKIP] Instructor tests (missing INSTRUCTOR_EMAIL/INSTRUCTOR_PASSWORD)"
fi

if [[ -n "${ADMIN_EMAIL:-}" && -n "${ADMIN_PASSWORD:-}" ]]; then
  admin_token=$(get_token "$ADMIN_EMAIL" "$ADMIN_PASSWORD")
  if [[ -n "$admin_token" ]]; then
    admin_users=$(call_api GET "$BASE_URL/api/admin/users" "$admin_token")
    assert_status "admin_admin_users" "200" "$admin_users"
  fi
else
  log "[SKIP] Admin tests (missing ADMIN_EMAIL/ADMIN_PASSWORD)"
fi

log "== Done =="
