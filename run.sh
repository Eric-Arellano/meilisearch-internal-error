#!/bin/sh
set -euo pipefail

if ! [ -f ./meilisearch ]; then
  curl -L https://install.meilisearch.com | sh
fi

rm -rf .out
./meilisearch --db-path .out/search-index.ms --no-analytics &
pid=$!

sleep 3
curl -s -X POST http://127.0.0.1:7700/indexes -H 'Content-Type: application/json' --data-binary '{"uid": "movies", "primaryKey": "id"}'
cat movies.ndjson | curl -s -X POST 'http://127.0.0.1:7700/indexes/movies/documents' --data-binary @- -H 'Content-Type: application/x-ndjson'

sleep 2
kill -9 $pid

docker build -t meilisearch-debug .
docker run -p 7700:7700 --init --rm meilisearch-debug
