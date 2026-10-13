---
name: krawlup-mcp
description: Use the krawlup MCP server (16 tools) to audit products, trigger rescans, manage catalog listings, and read first-party analytics. Use when a founder asks their agent to "check my krawlup scores", "fix what krawlup flagged", "rescan my product", "add/publish my product on krawlup", or "pull my krawlup analytics". Covers connection (OAuth 2.1 or agent keys), scopes, rate limits, and honest entitlement gating.
---

# krawlup MCP server

krawlup (https://krawlup.com) is an agent-native growth & revenue-first analytics platform: continuous SEO/AEO audits that AI coding agents fix directly, plus built-in cookieless website analytics.

## Endpoint

`POST https://krawlup.com/api/mcp` - streamable HTTP transport, **stateless** (no session id required), JSON responses enabled. Server name: `krawlup`.

```
claude mcp add --transport http krawlup https://krawlup.com/api/mcp
```

Cursor / Windsurf / Zed (`mcp.json`):

```json
{
  "mcpServers": {
    "krawlup": {
      "url": "https://krawlup.com/api/mcp",
      "headers": { "Authorization": "Bearer sk_ag_YOUR_KEY" }
    }
  }
}
```

## Authentication

Three credential levels. Everything personal needs one; the catalog trio is public.

**1. Anonymous** - may call `initialize`, `tools/list`, `ping`, and the three public catalog tools. Calling any other tool returns `401` with a `WWW-Authenticate` challenge pointing at `/.well-known/oauth-protected-resource/api/mcp`.

**2. Agent key** (`sk_ag_…`) - minted in the krawlup dashboard → Agent access. Scoped (`read`, `submit`, `rescan`; default `read`), optionally restricted to a product allowlist, optional expiry. Send as `Authorization: Bearer sk_ag_…`. Keys are the only credential that can hold `rescan`.

**3. OAuth connection** (`sk_mc_…`) - OAuth 2.1 for public clients: dynamic client registration, PKCE S256 only, opaque 1-hour access tokens, 90-day rotating refresh tokens (reuse outside the 30s grace window revokes the connection). Grants `read` + `submit` only - **`rescan` is never granted over OAuth**. Flow: call an authed tool → catch the `401` challenge → open the authorization endpoint in a browser → the founder approves at `https://krawlup.com/mcp/connect` → exchange the code at `/api/oauth/token`. Discovery documents: `/.well-known/oauth-authorization-server` and `/.well-known/oauth-protected-resource/api/mcp`.

## Scopes & rate limits

| Scope | Unlocks |
|---|---|
| `read` | All insight/analytics/status reads |
| `submit` | `submit_product`, `set_product_public`, `set_product_private` |
| `rescan` | `trigger_rescan` (agent keys only) |

Every authed tool call is throttled to **60 requests/minute** per credential; tighter per-tool limits below. 429 responses carry `Retry-After`. Errors are sanitized: `403`/`404` explain the refusal, `429`/`409` say "try again", everything else is generic.

## Tools

### Public catalog (no credential, per-IP limits)

- **`search_products`** - `{ query: string (min 2 chars), limit?: int 1-50 (default 20) }` → `{ total, items }`. 60/min.
- **`get_product`** - `{ identifier: string }` (slug like `"acme-app"`, or product key / domain) → full public product listing; 404 if none. 60/min.
- **`check_launch_readiness`** - `{ url: string }` → `{ ready, issues[], existingProduct: { slug, title, public, ownedByYou } | null, categories[], note }`. Run this **before** submitting a product. 30/min.

### Founder reads (scope `read`)

- **`list_products`** - no params → array of `{ key, title, score, performance, aeoScore, failingAudits, updatedAt }`. Ownership-scoped, includes unlaunched products. Use this to discover the right `productKey`.
- **`get_my_products_status`** - no params → up to 50 `{ productKey, slug, title, public, addedAt }`, newest first.
- **`get_insights`** - `{ productKey }` → the latest full audit: performance, `aeoScore`, safeBrowsing, metrics, `issues[]`, `unresolvedCards[]`, `bottleneck`, `scorecards`, `seoCrawl`, `funnel`, `findings[]`, `scanPending`. Note: `psi.desktop` is stripped unless the founder's plan includes desktop PSI.
- **`get_fix_cards`** - `{ productKey }` → all stored AI fix cards (structured remediation instructions). This is the main payload an agent needs to actually fix the site.
- **`get_bottleneck`** - `{ productKey }` → the stored AI bottleneck card, or `null`.
- **`get_scan_history`** - `{ productKey }` → last 100 scans, chronological, with per-run snapshot scores and sources.
- **`get_analytics_snippet`** - `{ productKey }` → `{ snippet, instructions, verify, tip }`. Requires an **active paid subscription or the 3-day renewal grace window** (no trial, no free tier).
- **`get_website_analytics`** - `{ productKey, range?: 'today' | '7d' | '30d' (default 7d) }` → `{ totals, daily, topPages, topReferrers, countries, devices, realtime: { visitorsNow }, events, aiInsight? }`. Same subscription gating; **revenue metrics are stripped** unless the plan includes conversion analytics.
- **`get_keyword_ideas`** - `{ productKey }` → latest keyword-research run `{ seed, provider, generatedAt, clusters, actions }`, or a fallback text explaining that research must be run from the dashboard first. Read-only by design.

### Product management (scope `submit`)

- **`submit_product`** - `{ url: string (required), name?, tagline?, description?, categories? (≤3), twitterUsername? }` → `{ ok, added, productKey, slug, dashboardUrl, nextSteps }`. 5/hour. The product lands **private**; omitted fields are filled from a scrape of the URL.
- **`set_product_public`** - `{ productKey }` → publishes the listing. 10/hour. **Paid-gated**: requires an active paid subscription (cardless trials cannot publish).
- **`set_product_private`** - `{ productKey }` → unpublishes. 10/hour. Always allowed on any plan.

### Scanning (scope `rescan` - agent keys only)

- **`trigger_rescan`** - `{ productKey }` → `{ ok, started, pageSpeedChecksLeft, fullAnalysesLeft, howToCheck }`. 10/min. **Spends the founder's plan scan allowances**; 429 means the budget is exhausted, 409 means a scan is already running. Workflow: trigger, then poll `get_insights` until `scanPending: false`.

## REST twins

The same credentials work on the Bearer REST API under `/api/agent/v1/`: `GET /products`, `GET /products/{key}`, `GET /products/{key}/keywords`, `POST /products/{key}/rescan`, `POST /submissions`, `POST /publish` (same scopes and rate limits).

## Agent etiquette

- Never guess a `productKey` - fetch `list_products` or `get_my_products_status` first.
- Report gating honestly: if a tool returns 403 for subscription/plan reasons, tell the founder which plan feature unlocks it instead of retrying.
- Data surfaced here is what krawlup computed server-side; do not extrapolate metrics it does not return.
