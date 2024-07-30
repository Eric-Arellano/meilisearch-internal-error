# Meilisearch internal error debugging

Minimal reproduction for getting these errors with Meilisearch 1.9.0:

> ERROR HTTP request{method=GET host="0.0.0.0:7700" route=/indexes query_parameters= user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15 status_code=500 error=internal: decoding failed.}: tracing_actix_web::middleware: Error encountered while processing the incoming HTTP request: ResponseError { code: 500, message: "internal: decoding failed.", error_code: "internal", error_type: "internal", error_link: "https://docs.meilisearch.com/errors#internal" }

> 2024-07-30T14:35:43.602926Z ERROR HTTP request{method=GET host="0.0.0.0:7700" route=/stats query_parameters= user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15 status_code=500 error=error while decoding: invalid type: string "2024-07-30 14:35:19.634762 +00:00:00", expected an `OffsetDateTime` at line 1 column 231}: tracing_actix_web::middleware: Error encountered while processing the incoming HTTP request: ResponseError { code: 500, message: "error while decoding: invalid type: string \"2024-07-30 14:35:19.634762 +00:00:00\", expected an `OffsetDateTime` at line 1 column 231", error_code: "internal", error_type: "internal", error_link: "https://docs.meilisearch.com/errors#internal" }

> 2024-07-30T14:44:30.209399Z  WARN HTTP request{method=POST host="0.0.0.0:7700" route=/multi-search query_parameters= user_agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Safari/605.1.15 status_code=400 error=Invalid value at `.queries[0].indexUid`: `` is not a valid index uid. Index uid can be an integer or a string containing only alphanumeric characters, hyphens (-) and underscores (_).}: tracing_actix_web::middleware: Error encountered while processing the incoming HTTP request: DeserrError { msg: "Invalid value at `.queries[0].indexUid`: `` is not a valid index uid. Index uid can be an integer or a string containing only alphanumeric characters, hyphens (-) and underscores (_).", code: InvalidIndexUid }

## To run

1. Ensure Docker is running
2. `./run.sh`
3. Go to `localhost:7700`. It will ask for the API key. Hit `Go` and you should see a decode error in the Web UI.
