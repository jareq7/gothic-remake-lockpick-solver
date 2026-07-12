#!/usr/bin/env bash
# Runs every suite against the live index.html. Any failure fails the run.
set -u
cd "$(dirname "$0")"
fail=0
for t in *.test.js; do
  printf '\033[1m── %s\033[0m\n' "$t"
  node "$t" || fail=1
  echo
done
if [ $fail -eq 0 ]; then
  printf '\033[32mWSZYSTKIE ZESTAWY PRZESZŁY\033[0m\n'
else
  printf '\033[31mSĄ BŁĘDY\033[0m\n'
fi
exit $fail
