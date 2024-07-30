# Keep version in sync with create-index.ts
FROM getmeili/meilisearch:v1.9.0

COPY .out/search-index.ms ./data.ms/

ENV MEILI_DB_PATH=/meili_data/data.ms
