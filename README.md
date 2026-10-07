# What MCP actually is: demo

The demo from the video: a small MCP server over a team list, last week's mini agent turned into an MCP client, and a relay that shows what goes over the wire.

- `api/users.json` is the data: Alice, Bob and Sam, each with a role and a city (the React app serves the same file).
- `mcp/users-server.mjs` is the MCP server, about fifty lines on the official TypeScript SDK: two tools (`list_users`, `get_user`), one resource (`users://all`), one prompt (`introduce_user`). Over stdio by default, Streamable HTTP with `--http`, and `--poisoned` adds one sentence to `get_user`'s description.
- `agent/mini-agent-mcp.mjs` is the agent: the same loop as `agent/mini-agent.mjs` (last week's video, unchanged), but its tools come from the server (`tools/list`) and each `tool_use` becomes a `tools/call`. It speaks JSON-RPC to the server itself, so every message is printed as it is. Each run is saved to `agent/runs/<name>.json`.
- `mcp/tee.mjs` sits between any MCP client and the server, passes every line through and logs a copy to `mcp/wire.log`.

```sh
npm install
cp .env.example .env        # put your ANTHROPIC_API_KEY in it
set -a; source .env; set +a

npm run agent:mcp -- "Who on the team is a backend engineer, and which city are they in?"
npm run agent:mcp -- --poisoned "Who on the team is a backend engineer, and which city are they in?"
npm run agent:mcp -- --no-server "Who on the team is a backend engineer, and which city are they in?"

# The same server in Claude Code
claude mcp add users -- node mcp/users-server.mjs
claude                       # then /mcp, and ask the same question

# Watch the wire
claude mcp remove users
claude mcp add users -- node mcp/tee.mjs node mcp/users-server.mjs
tail -f mcp/wire.log

# Over HTTP
node mcp/users-server.mjs --http
curl -X POST http://localhost:3001/mcp \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Last week's demo (the app, `src/UserCard.jsx` and its test, `agent/mini-agent.mjs`) is still here and works as it did: `npm run agent -- "add a loading skeleton to the user card"`.
