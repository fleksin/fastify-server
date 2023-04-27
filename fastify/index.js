"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const fs_1 = __importDefault(require("fs"));
function readFileCache() {
    try {
        const json = fs_1.default.readFileSync("./cache.json", "utf-8");
        return JSON.parse(json);
    }
    catch (e) {
        console.log("no file cache");
        return {};
    }
}
const server = (0, fastify_1.default)({
    logger: true,
});
var Branch;
(function (Branch) {
    Branch["master"] = "master";
    Branch["okbchainDocs"] = "okbchain-docs";
    //   fortest = "okc-to-oktc",
    Branch["fortest"] = "for-test-webhook-only";
})(Branch || (Branch = {}));
const fileCache = readFileCache();
const commitCache = {
    fleksinDocs: {
        [Branch.master]: ((_a = fileCache === null || fileCache === void 0 ? void 0 : fileCache.fleksinDocs) === null || _a === void 0 ? void 0 : _a[Branch.master]) || "",
        [Branch.okbchainDocs]: ((_b = fileCache === null || fileCache === void 0 ? void 0 : fileCache.fleksinDocs) === null || _b === void 0 ? void 0 : _b[Branch.okbchainDocs]) || "",
        [Branch.fortest]: ((_c = fileCache === null || fileCache === void 0 ? void 0 : fileCache.fleksinDocs) === null || _c === void 0 ? void 0 : _c[Branch.fortest]) || "",
    },
    okxDocs: {
        [Branch.master]: ((_d = fileCache === null || fileCache === void 0 ? void 0 : fileCache.okxDocs) === null || _d === void 0 ? void 0 : _d[Branch.master]) || "",
        [Branch.okbchainDocs]: ((_e = fileCache === null || fileCache === void 0 ? void 0 : fileCache.okxDocs) === null || _e === void 0 ? void 0 : _e[Branch.okbchainDocs]) || "",
        [Branch.fortest]: ((_f = fileCache === null || fileCache === void 0 ? void 0 : fileCache.okxDocs) === null || _f === void 0 ? void 0 : _f[Branch.fortest]) || "",
    },
};
server.get("/ping", (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("pinged!");
    return "pong\n";
}));
function makeTrackHead(repo) {
    return function trackHead(req, rep) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = req.body;
            const { ref = "", after = "" } = event;
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
            fs_1.default.writeFileSync("./cache.json", JSON.stringify(commitCache), "utf-8");
        });
    };
}
function makeGetHead(repo, branch) {
    return function getHead(req, rep) {
        return commitCache[repo][branch];
    };
}
server.register(require("@fastify/multipart"));
server.register(require("@fastify/formbody"));
server.post("/github-webhook/fleksin/okc-docs", makeTrackHead("fleksinDocs"));
server.post("/github-webhook/okx/okc-docs", makeTrackHead("okxDocs"));
server.get("/github-webhook/fleksin/get-master-head", makeGetHead("fleksinDocs", Branch.master));
server.get("/github-webhook/fleksin/get-okbc-head", makeGetHead("fleksinDocs", Branch.okbchainDocs));
server.get("/github-webhook/okx/get-master-head", makeGetHead("okxDocs", Branch.master));
server.get("/github-webhook/okx/get-okbc-head", makeGetHead("okxDocs", Branch.okbchainDocs));
server.get("/github-webhook/okx/get-test-head", makeGetHead("okxDocs", Branch.fortest));
server.listen({ port: 8080, host: "0.0.0.0" }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
