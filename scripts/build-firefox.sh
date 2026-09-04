#!/usr/bin/env bash
set -euo pipefail

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
repo_dir=$(CDPATH= cd -- "$script_dir/.." && pwd)
output_dir="$repo_dir/dist"
env_file="$repo_dir/.env"
api_key="${WEB_EXT_API_KEY:-${AMO_API_KEY:-}}"
api_secret="${WEB_EXT_API_SECRET:-${AMO_API_SECRET:-}}"
sign=false

usage() {
  cat <<'EOF'
Usage: scripts/build-firefox.sh [options]

Builds a Firefox extension zip. Add --sign to submit it to addons.mozilla.org.

Options:
  --sign                    Sign the extension with Mozilla
  --api-key KEY             Mozilla API key (or WEB_EXT_API_KEY)
  --api-secret SECRET       Mozilla API secret (or WEB_EXT_API_SECRET)
  --env-file FILE           Read credentials from FILE instead of .env
  --output-dir DIR          Write artifacts to DIR instead of dist/
  -h, --help                Show this help
EOF
}

while (($#)); do
  case "$1" in
    --sign) sign=true; shift ;;
    --api-key) api_key=${2:?Missing value for --api-key}; shift 2 ;;
    --api-secret) api_secret=${2:?Missing value for --api-secret}; shift 2 ;;
    --env-file) env_file=$2; shift 2 ;;
    --output-dir) output_dir=$2; shift 2 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

if [[ -f "$env_file" ]]; then
  set -a
  # shellcheck disable=SC1090
  . "$env_file"
  set +a
  api_key=${api_key:-${WEB_EXT_API_KEY:-${AMO_API_KEY:-}}}
  api_secret=${api_secret:-${WEB_EXT_API_SECRET:-${AMO_API_SECRET:-}}}
fi

mkdir -p "$output_dir"
build_dir=$(mktemp -d)
cleanup() { rm -rf "$build_dir"; }
trap cleanup EXIT

cp "$repo_dir/background.js" "$repo_dir/content.js" "$repo_dir/manifest.firefox.json" "$build_dir/"
mv "$build_dir/manifest.firefox.json" "$build_dir/manifest.json"

unsigned_zip="$output_dir/planview-time-helper-firefox.zip"
(cd "$build_dir" && zip -q -r "$unsigned_zip" .)
echo "Built $unsigned_zip"

if [[ "$sign" == true ]]; then
  if [[ -z "$api_key" || -z "$api_secret" ]]; then
    echo "Signing requires --api-key and --api-secret, or WEB_EXT_API_KEY and WEB_EXT_API_SECRET in $env_file." >&2
    exit 2
  fi
  command -v npx >/dev/null || { echo "Signing requires npm/npx." >&2; exit 1; }
  npx --yes web-ext sign \
    --source-dir "$build_dir" \
    --api-key "$api_key" \
    --api-secret "$api_secret" \
    --artifacts-dir "$output_dir"
  echo "Signed artifact written to $output_dir"
fi