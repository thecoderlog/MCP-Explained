// tee.mjs: sits between an MCP client and a stdio server. Passes every line through, and logs a copy to mcp/wire.log.
//   claude mcp add users -- node mcp/tee.mjs node mcp/users-server.mjs
//   tail -f mcp/wire.log
import fs from 'node:fs';
import readline from 'node:readline';
import { spawn } from 'node:child_process';

const log = fs.createWriteStream(new URL('./wire.log', import.meta.url), { flags: 'a' });
const t0 = Date.now();
const [command, ...args] = process.argv.slice(2);
const server = spawn(command, args, { stdio: ['pipe', 'pipe', 'inherit'] });

function relay(from, to, arrow) {
  readline.createInterface({ input: from }).on('line', (line) => {
    to.write(line + '\n');
    log.write(`${((Date.now() - t0) / 1000).toFixed(3)} ${arrow} ${line}\n`);
  });
}
relay(process.stdin, server.stdin, '→'); // client → server
relay(server.stdout, process.stdout, '←'); // server → client
process.stdin.on('end', () => server.stdin.end());
server.on('exit', (code) => log.end(() => process.exit(code ?? 0)));
