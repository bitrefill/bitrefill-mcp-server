# OGG BRAIN: BITREFILL MCP

Me speak short. You read. Big meaning small word.

**What file:** Other robot read this before dig code. `AGENTS.md` = many tool (Cursor, Codex, see agents.md). Deep folder win over root. `CLAUDE.md`? Symlink here if Claude. Paper lie—**Zod+CI** true. Host IDE: Skills, MCP, subagent = *not* this repo. **This** repo = *make* MCP server, HTTP to Bitrefill. Subagent: give path + this file, no dump whole tree. Fresh token = strong token.

**Repo in one breath:** `stdio` process → MCP tools → `GET/POST` `https://api.bitrefill.com/v2` + `Authorization: Bearer ${BITREFILL_API_KEY}`. `KEY` missing → **zero tools** (v2 no anon). `zod` **only** on tool args. Response = raw JSON string, no parse-lock. Table of tools, env: `README.md`.

**Stack:** `ts` `esm` `node` `pnpm` `tsc` `eslint` `zod`.

**Run (copy):**

| Ugg need | Ogg do |
|----------|--------|
| install | `pnpm install` |
| build first always before run | `pnpm run build` |
| type | `pnpm run typecheck` |
| lint | `pnpm run lint` |
| smoke mcp (real stdio) | `pnpm run build && pnpm run smoke` |
| human poke gui | `pnpm run build && pnpm run inspector` |
| one script test inspector | `pnpm run build && pnpm run smoke:inspector` |
| all tools thump | `pnpm run test:inspector:all-tools` |

**Done?** small change: `typecheck` + `lint`. touch tools/transport: + `build` + `smoke`. **Inspector CLI:** `npx` thing want `--tool-arg k=v` many time—**not** one fat JSON. README say more.

**Where dig:**

| Ugg | Path | Why |
|-----|------|-----|
| boot mcp | `src/index.ts` | stdio |
| list tool/resource | `src/handlers/tools.ts` `src/handlers/resources.ts` | name→handler |
| zod in | `src/schemas/` | in only |
| http+bearer+error | `src/utils/api/base.ts` `src/utils/api/authenticated.ts` | v2 one way |
| call api | `src/services/` | by domain |
| type lie only | `src/types/api.ts` | ts help human not machine |
| fixed string | `src/constants/` | pay cat |
| thump mcp in node | `scripts/smoke-mcp.mjs` `scripts/*inspector*.sh` | not rest curl only |

`rg toolName src/handlers` find bone.

**New tool work order:** `schemas/` + maybe `services/` + `handlers/tools.ts` + README if user see. kebab `like-this`. v2 path match. error = `BitrefillApiError` from `base.ts`. import style = neighbor file not fight linter. **Me kill** idea unauth "public" client. v2 = Bearer or starve.

**Always:** `build` before `smoke`/`node build/index.js`. in-Zod, out-raw, policy no flip unless human shout. new tool: kebab + match doc.

**Ask big brain first:** any tool that **take money**—`buy-products` `pay-invoice` `create-esim-invoice` `pay-esim-invoice` + later pay-shaped tool. test key, read Bitrefill doc, **no** assume free sandbox. change base url / auth = ask.

**Never:** commit key, `.env`, token. `smoke` must hit **this** pack `build/index.js` stdio—not Bitrefill hosted mcp, not "only curl api" and say mcp work.

**Subagent short:** scout: read `src` `scripts` README, no edit. builder: this file + files touch only. checker: `pnpm typecheck` `pnpm lint` `pnpm build && pnpm smoke`. **Remember:** child agent test *server*; inside server already got http client. no confuse layer.

**Edit this ogg when:** script change, flag change, same dumb mistake two time—add one line, point `src/`. file fat like mammoth? nest `AGENTS.md` in folder or shove long story README—**root stay thin** for small token.

Ugg. End.
