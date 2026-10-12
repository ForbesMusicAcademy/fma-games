#!/bin/sh
# Rebuilds test/: a full copy of the games site at games.forbesmusic.com.au/test/, for families trying a new wave before
# it goes live. Everything is copied from the site's root, except that test/fma-student.js sends to the portal's TEST
# deployment (the same spreadsheet, so progress carries over to the live games later). Run from the repo root:
#   sh tools/make-test-copy.sh
set -e
cd "$(dirname "$0")/.."
TEST_ENDPOINT="https://script.google.com/macros/s/AKfycbwDh58yTpXxjpP6Hz4fw54NUjLbap1jrBeyXleTNLf9kBCTEsJt7PIflR5PQHZ5jOgd/exec"
rm -rf test && mkdir test
for f in *; do
  case "$f" in test|tools|dev|CNAME|README.md|*.py|*.sh) continue;; esac
  cp -R "$f" test/
done
touch test/.nojekyll
sed -i '' "s#const ENDPOINT = \"[^\"]*\";#const ENDPOINT = \"$TEST_ENDPOINT\";   // TEST COPY ONLY (tools/make-test-copy.sh)#" test/fma-student.js
grep -q "TEST COPY ONLY" test/fma-student.js && echo "test/ rebuilt ($(ls test | wc -l | tr -d ' ') items), sending to the TEST deployment"
