import fs from "node:fs";

import { MeiliSearch } from "meilisearch";
import { $, cd, within, ProcessOutput, ProcessPromise } from "zx";
import { mkdirp } from "mkdirp";

const BIN = `.bin`;
const MEILI_BIN = `${BIN}/meilisearch`;
const MEILI_URL = "http://127.0.0.1:7700";

zxMain(async () => {
  await downloadMeili();

  const meiliProcess = $`${MEILI_BIN} --db-path .out/search-index.ms --no-analytics`;

  const client = new MeiliSearch({
    host: MEILI_URL,
  });
  await waitFor(() => client.isHealthy());

  await setUpIndex(client, "movies");
  await uploadIndex(`movies.ndjson`, "movies");

  await waitFor(() => client.isHealthy());
  await killProcess(meiliProcess);
});

async function downloadMeili(): Promise<void> {
  if (fs.existsSync(MEILI_BIN)) return;
  await within(async () => {
    await mkdirp(BIN);
    cd(BIN);

    // Keep version in sync with Dockerfile
    process.env.MEILI_VERSION = "v1.9.0";
    await $`sh ${__dirname}/download-meilisearch.sh`;
  });
}

async function setUpIndex(client: MeiliSearch, index: string): Promise<void> {
  await client.createIndex(index, { primaryKey: "id" });
  await client.index(index).updateSettings({
    searchableAttributes: ["title"],
  });
}

async function uploadIndex(file: string, index: string): Promise<void> {
  await $`cat ${file} | gzip | curl -s -X POST '${MEILI_URL}/indexes/${index}/documents' --data-binary @- -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip'`;
}

// ------------------------------------------------------------------------
// Utils
// ------------------------------------------------------------------------

function zxMain(mainFn: () => Promise<void>) {
  void mainFn().catch((e) => {
    if (!(e instanceof ProcessOutput)) {
      console.log(e);
    }
    return process.exit(1);
  });
}

async function killProcess(process: ProcessPromise) {
  try {
    // stop the server
    process.kill();
    await process;
  } catch (e) {
    if (e instanceof ProcessOutput && e.signal === "SIGTERM") {
      // ignore sigterm
    } else {
      throw e;
    }
  }
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitFor(fn: () => boolean | Promise<boolean>) {
  let result = false;
  while (!result) {
    result = await fn();
    if (!result) await wait(10);
  }
}
