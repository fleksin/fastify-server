import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fs from "fs";

function readFileCache() {
  try {
    const json = fs.readFileSync("./cache.json", "utf-8");
    return JSON.parse(json);
  } catch (e) {
    console.log("no file cache");
    return {};
  }
}

const server = fastify({
  logger: true,
});

enum Branch {
  master = "master",
  okbchainDocs = "okbchain-docs",
  //   fortest = "okc-to-oktc",
  fortest = "for-test-webhook-only",
}

const fileCache = readFileCache();

const commitCache = {
  fleksinDocs: {
    [Branch.master]: fileCache?.fleksinDocs?.[Branch.master] || "",
    [Branch.okbchainDocs]: fileCache?.fleksinDocs?.[Branch.okbchainDocs] || "",
    [Branch.fortest]: fileCache?.fleksinDocs?.[Branch.fortest] || "",
  },
  okxDocs: {
    [Branch.master]: fileCache?.okxDocs?.[Branch.master] || "",
    [Branch.okbchainDocs]: fileCache?.okxDocs?.[Branch.okbchainDocs] || "",
    [Branch.fortest]: fileCache?.okxDocs?.[Branch.fortest] || "",
  },
};

server.get("/ping", async (request, reply) => {
  console.log("pinged!");
  return "pong\n";
});

function makeTrackHead(repo: "fleksinDocs" | "okxDocs") {
  return async function trackHead(req: FastifyRequest, rep: FastifyReply) {
    const event = req.body as any;
    const { ref = "", after = "" }: { ref: string; after: string } = event;
    console.log("ref: ", ref);
    // console.log("event: ", event);
    if (ref.endsWith(Branch.master)) {
      console.log("master push event", after);
      commitCache[repo][Branch.master] = after;
    }
    if (ref.endsWith(Branch.okbchainDocs)) {
      console.log(`${Branch.okbchainDocs} push event`, after);
      commitCache[repo][Branch.okbchainDocs] = after;
    }
    if (ref.endsWith(Branch.fortest)) {
      console.log(`${Branch.fortest} push event`, after);
      commitCache[repo][Branch.fortest] = after;
    }
    fs.writeFileSync("./cache.json", JSON.stringify(commitCache), "utf-8");
  };
}

function makeGetHead(repo: "fleksinDocs" | "okxDocs", branch: Branch) {
  return function getHead(req: FastifyRequest, rep: FastifyReply) {
    return commitCache[repo][branch];
  };
}

server.register(require("@fastify/multipart"));
server.register(require("@fastify/formbody"));

server.post("/github-webhook/fleksin/okc-docs", makeTrackHead("fleksinDocs"));
server.post("/github-webhook/okx/okc-docs", makeTrackHead("okxDocs"));

server.get(
  "/github-webhook/fleksin/get-master-head",
  makeGetHead("fleksinDocs", Branch.master)
);
server.get(
  "/github-webhook/fleksin/get-okbc-head",
  makeGetHead("fleksinDocs", Branch.okbchainDocs)
);
server.get(
  "/github-webhook/okx/get-master-head",
  makeGetHead("okxDocs", Branch.master)
);
server.get(
  "/github-webhook/okx/get-okbc-head",
  makeGetHead("okxDocs", Branch.okbchainDocs)
);
server.get(
  "/github-webhook/okx/get-test-head",
  makeGetHead("okxDocs", Branch.fortest)
);

server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
