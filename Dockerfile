FROM getmeili/meilisearch:v1.9.0
COPY .out/search-index.ms ./data.ms/
