#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VERSION="5.4.0"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
for bin in java curl unzip; do command -v "$bin" >/dev/null || { echo "Missing $bin; EPUBCheck NOT run" >&2; exit 2; }; done
URL="https://github.com/w3c/epubcheck/releases/download/v${VERSION}/epubcheck-${VERSION}.zip"
curl --fail --location --retry 2 --max-time 120 "$URL" -o "$TMP/epubcheck.zip"
unzip -q "$TMP/epubcheck.zip" -d "$TMP/checker"
JAR="$(find "$TMP/checker" -type f \( -name 'epubcheck.jar' -o -name 'epubcheck-*.jar' \) | head -n 1)"
test -n "$JAR" || { echo "Official EPUBCheck entrypoint not found" >&2; exit 2; }
for EPUB in "$ROOT/test-artifacts/prose.epub" "$ROOT/test-artifacts/illustrated.epub"; do
  test -s "$EPUB" || { echo "Missing fixture EPUB: $EPUB" >&2; exit 2; }
  java -jar "$JAR" "$EPUB"
done
echo "EPUBCheck v$VERSION completed for both fixtures."
