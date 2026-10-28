# @krawlup/skills

Agent skills for [krawlup](https://krawlup.com) - the agent-native growth & revenue-first analytics platform. Continuous SEO, AEO, and competitor insights your AI coding agent fixes directly via MCP, with built-in cookieless analytics.

[![npm](https://img.shields.io/npm/v/@krawlup/skills)](https://www.npmjs.com/package/@krawlup/skills)
[![license](https://img.shields.io/npm/l/@krawlup/skills)](https://github.com/krawlup/krawlup-skills/blob/main/LICENSE)

Two skills, each a self-contained `SKILL.md` following the standard [agent skills](https://github.com/anthropics/skills) convention (`name` + `description` frontmatter, markdown body):

| Skill | What your agent learns |
|---|---|
| [`krawlup-mcp`](skills/krawlup-mcp/SKILL.md) | Connect to the krawlup MCP server (OAuth 2.1 or agent keys) and use all 26 tools: run the free site report on any website, check what the founder's plan allows, audit products, read AI fix cards, trigger rescans, submit and publish listings, pull first-party analytics. |
| [`krawlup-analytics-setup`](skills/krawlup-analytics-setup/SKILL.md) | Install krawlup's cookieless analytics tag on any site - copy-paste snippet or the [`@krawlup/analytics-tag`](https://www.npmjs.com/package/@krawlup/analytics-tag) npm library - and wire up custom conversion goals. |

## Install

```bash
npx @krawlup/skills                    # installs into ./skills
npx @krawlup/skills --dir .claude/skills
npx @krawlup/skills --force            # overwrite existing folders
```

Or copy a skill folder manually - no code, just markdown.

## Connect in 30 seconds

```bash
claude mcp add --transport http krawlup https://api.krawlup.com/mcp
```

Any MCP client works: point it at `https://api.krawlup.com/mcp` (streamable HTTP). Authenticate with an agent key from the dashboard (Dashboard → Agent access) or one browser approval via OAuth. The catalog reads are public; `krawlup-mcp` covers scopes, rate limits, and every tool.

## What your agent can do

- **Check the plan** - read the founder's subscription status, abilities, limits and usage meters before doing anything else
- **Audit any website** - run the free site report (2 scans per agent per month) and read the full report: performance, AEO, CRO, SEO crawl
- **Audit** - pull performance, AEO, and CRO scores, failing checks, and scan history for each product
- **Fix** - read the structured AI fix cards and apply them in your codebase
- **Rescan** - trigger a fresh scan and poll until results land (spends the plan's scan budget)
- **Publish** - add products by URL and flip them public on the [directory](https://krawlup.com/directory)

## krawlup

- [krawlup.com](https://krawlup.com) - agent-native growth & revenue-first analytics for SaaS and indie products
- [MCP server docs](https://krawlup.com/mcp) - the official tool reference these skills are kept in step with
- [Free site report](https://krawlup.com/site-report) - SEO/AEO audit of any URL, no account needed
- [Pricing](https://krawlup.com/pricing) - agent access (MCP + keys) is free on every plan

## License

[MIT](LICENSE)
