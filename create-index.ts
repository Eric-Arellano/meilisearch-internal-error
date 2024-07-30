import fs from "node:fs";

import { MeiliSearch } from "meilisearch";
import { $, cd, within, ProcessOutput, ProcessPromise } from "zx";
import { mkdirp } from "mkdirp";

const bin = `.bin`;
const meilibin = `${bin}/meilisearch`;
const meiliUrl = "http://127.0.0.1:7700";

zxMain(async () => {
  await downloadMeili();

  const meiliProcess = $`${meilibin} --db-path .out/search-index.ms --no-analytics`;

  const client = new MeiliSearch({
    host: meiliUrl,
  });
  await waitFor(() => client.isHealthy());

  await setUpIndex(client);
  await uploadIndex(`index-headings.ndjson`, "headings");

  await waitFor(() => client.isHealthy());
  await killProcess(meiliProcess);
});

async function downloadMeili(): Promise<void> {
  if (fs.existsSync(meilibin)) return;
  await within(async () => {
    await mkdirp(bin);
    cd(bin);

    // Keep version in sync with Dockerfile
    process.env.MEILI_VERSION = "v1.9.0";
    await $`sh ${__dirname}/download-meilisearch.sh`;
  });
}

async function setUpIndex(client: MeiliSearch): Promise<void> {
  await client.createIndex("headings", { primaryKey: "id" });

  const filterableAttributes = ["module", "package", "package-version"];
  await client.index("headings").updateSettings({
    searchableAttributes: ["title"],
    filterableAttributes,
  });
}

async function uploadIndex(file: string, index: string): Promise<void> {
  await $`cat ${file} | gzip | curl -s -X POST '${meiliUrl}/indexes/${index}/documents' --data-binary @- -H 'Content-Type: application/x-ndjson' -H 'Content-Encoding: gzip'`;
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

type WaitFoOptions = {
  wait?: number;
  timeout?: number;
};

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function waitFor(
  fn: () => boolean | Promise<boolean>,
  options: WaitFoOptions = {},
) {
  options = {
    wait: 10,
    ...options,
  };
  let result = false;
  let timedOut = false;
  const startTime = new Date().getTime();

  while (!result && !timedOut) {
    const currentTime = new Date().getTime();
    result = await fn();
    if (!result) await wait(options.wait!);
    if (options.timeout) {
      timedOut = currentTime - startTime > options.timeout;
    }
  }
}
