#!/bin/sh
set -euo pipefail

rm -rf .out

node -r esbuild-register init-db.ts
docker build -t meilisearch-debug .
docker run -p 7700:7700 --init --rm meilisearch-debug
