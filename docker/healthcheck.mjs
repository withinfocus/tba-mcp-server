// Container health check. The image is distroless (no shell), so this runs
// under Node directly: start a second server process, send `initialize`, and
// pass if a JSON-RPC result comes back before the timeout.
import { spawn } from "node:child_process";

const server = spawn(process.execPath, ["dist/index.js"], {
    env: {
        ...process.env,
        TBA_API_KEY: process.env.TBA_API_KEY || "healthcheck",
    },
    stdio: ["pipe", "pipe", "ignore"],
});

const finish = (code) => {
    server.kill();
    process.exit(code);
};

let output = "";
server.stdout.on("data", (chunk) => {
    output += chunk;
    if (output.includes('"result"')) finish(0);
});
server.on("error", () => finish(1));
server.on("exit", () => finish(1));
setTimeout(() => finish(1), 8000);

server.stdin.write(
    `${JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
            protocolVersion: "2025-06-18",
            capabilities: {},
            clientInfo: { name: "healthcheck", version: "1.0.0" },
        },
    })}\n`,
);
