#!/bin/sh
# Fail the production image build if the public dist contains backend secrets
# or a populated OpenAI key. Bare public identifiers are allowed.
set -eu

dist="${1:?dist directory required}"

if [ ! -d "$dist" ]; then
    echo "dist directory missing: $dist" >&2
    exit 1
fi

if grep -R -a -n -E \
    -e 'REVERB_APP_SECRET' \
    -e 'APP_KEY=' \
    -e 'DB_PASSWORD=' \
    -e 'MAIL_PASSWORD=' \
    -e 'foxaldb-secret' \
    "$dist"
then
    echo "secret marker found in frontend dist" >&2
    exit 1
fi

if grep -R -a -n -E \
    -e 'VITE_OPENAI_API_KEY[[:space:]]*[:=][[:space:]]*["'\''][^"'\'']+["'\'']' \
    -e 'OPENAI_API_KEY[[:space:]]*:[[:space:]]*["'\''][^"'\'']+["'\'']' \
    "$dist"
then
    echo "OpenAI key value found in frontend dist" >&2
    exit 1
fi
