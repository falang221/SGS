#!/usr/bin/env bash
set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://localhost:3001}"
ADMIN_EMAIL="${ADMIN_EMAIL:-superadmin@sgs.sn}"
ADMIN_PASSWORD="${ADMIN_PASSWORD:-admin12345}"
SCHOOL_ID="${SCHOOL_ID:-550e8400-e29b-41d4-a716-446655440000}"
FIRST_NAME="${FIRST_NAME:-Smoke}"
LAST_NAME="${LAST_NAME:-Tester}"
ROLE_LABEL="${ROLE_LABEL:-Enseignant Test}"
SYSTEM_ROLE="${SYSTEM_ROLE:-ENSEIGNANT}"
CONTRACT_TYPE="${CONTRACT_TYPE:-CDI}"
SALARY="${SALARY:-250000}"
STAFF_EMAIL="${STAFF_EMAIL:-e2e.hr.$(date +%s)@ecole.sn}"

if ! command -v node >/dev/null 2>&1; then
  echo "node is required to run this smoke test."
  exit 1
fi

echo "Checking API health on ${API_BASE_URL}..."
curl -fsS "${API_BASE_URL}/api/v1/health" >/dev/null

login_payload="$(node -e 'const [email, password] = process.argv.slice(1); process.stdout.write(JSON.stringify({ email, password }));' "${ADMIN_EMAIL}" "${ADMIN_PASSWORD}")"
login_response="$(curl -sS -X POST "${API_BASE_URL}/api/v1/auth/login" -H 'Content-Type: application/json' -d "${login_payload}")"

ACCESS_TOKEN="$(printf '%s' "${login_response}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j.accessToken||"")}catch{process.exit(1)}})')"
LOGIN_TENANT_ID="$(printf '%s' "${login_response}" | node -e 'let s="";process.stdin.on("data",d=>s+=d);process.stdin.on("end",()=>{try{const j=JSON.parse(s);process.stdout.write(j?.user?.tenantId||"")}catch{process.exit(1)}})')"
TENANT_ID="${TENANT_ID:-${LOGIN_TENANT_ID}}"

if [[ -z "${ACCESS_TOKEN}" || -z "${TENANT_ID}" ]]; then
  echo "Login failed or tenant resolution failed."
  echo "Response: ${login_response}"
  exit 1
fi

create_payload="$(node -e 'const [email, firstName, lastName, role, schoolId, salary, contractType, systemRole] = process.argv.slice(1); process.stdout.write(JSON.stringify({ email, firstName, lastName, role, schoolId, salary: Number(salary), contractType, systemRole }));' "${STAFF_EMAIL}" "${FIRST_NAME}" "${LAST_NAME}" "${ROLE_LABEL}" "${SCHOOL_ID}" "${SALARY}" "${CONTRACT_TYPE}" "${SYSTEM_ROLE}")"

echo "Creating staff ${STAFF_EMAIL} (expected 201)..."
create_one="$(curl -sS -w $'\nHTTP_STATUS:%{http_code}' -X POST "${API_BASE_URL}/api/v1/hr/create" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-tenant-id: ${TENANT_ID}" -H 'Content-Type: application/json' -d "${create_payload}")"
create_one_status="${create_one##*HTTP_STATUS:}"
create_one_body="${create_one%$'\n'HTTP_STATUS:*}"

if [[ "${create_one_status}" != "201" ]]; then
  echo "Unexpected status for first create: ${create_one_status}"
  echo "Body: ${create_one_body}"
  exit 1
fi

if ! printf '%s' "${create_one_body}" | rg -q "\"email\":\"${STAFF_EMAIL}\""; then
  echo "Created payload does not contain expected staff email."
  echo "Body: ${create_one_body}"
  exit 1
fi

echo "Creating same staff again (expected 409)..."
create_two="$(curl -sS -w $'\nHTTP_STATUS:%{http_code}' -X POST "${API_BASE_URL}/api/v1/hr/create" -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "x-tenant-id: ${TENANT_ID}" -H 'Content-Type: application/json' -d "${create_payload}")"
create_two_status="${create_two##*HTTP_STATUS:}"
create_two_body="${create_two%$'\n'HTTP_STATUS:*}"

if [[ "${create_two_status}" != "409" ]]; then
  echo "Unexpected status for duplicate create: ${create_two_status}"
  echo "Body: ${create_two_body}"
  exit 1
fi

if ! printf '%s' "${create_two_body}" | rg -q 'existe déjà|already exists'; then
  echo "Duplicate error message is missing."
  echo "Body: ${create_two_body}"
  exit 1
fi

echo "HR smoke test passed."
echo "Tenant: ${TENANT_ID}"
echo "School: ${SCHOOL_ID}"
echo "Email: ${STAFF_EMAIL}"
