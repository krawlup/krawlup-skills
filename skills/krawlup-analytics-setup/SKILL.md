---
name: krawlup-analytics-setup
description: Install and verify krawlup's first-party, cookieless website analytics tag on a founder's site - via the copy-paste snippet or the @krawlup/analytics-tag npm library. Use when a founder asks to "add krawlup analytics", "install my analytics script", "set up conversion goals", or an MCP-driven product setup needs the analytics tag wired in. Covers tag placement, custom goal events, and verification.
---

# krawlup analytics tag setup

krawlup ships first-party, 100% cookieless analytics for your product's website: no cookies, no persistent PII, DNT-honoring, session state in `sessionStorage` only (30-minute inactivity window, per tab). You need the product's **analytics token** - fetch it from the founder (Dashboard → Website tab) or via the MCP tool `get_analytics_snippet` (requires `read` scope and an active subscription).

## Option A - copy-paste snippet

Add BOTH lines inside `<head>` (or before `</body>`) on every page:

```html
<script>window.krawlup=window.krawlup||function(){(window.krawlup.q=window.krawlup.q||[]).push(arguments)};</script>
<script defer src="https://api.krawlup.com/t.js" data-site="TOKEN"></script>
```

Replace `TOKEN` with the product's analytics token. The first line is a queue shim: it lets page scripts call `window.krawlup(...)` before the deferred tracker loads; the tracker then drains the queue. Data appears in the Dashboard → Website tab within a minute of the first visit.

## Option B - npm library

```bash
npm i @krawlup/analytics-tag
```

```js
import { injectKrawlup, trackEvent } from '@krawlup/analytics-tag';

// call once, client-side only (e.g. in your root component / app entry)
injectKrawlup({ site: 'TOKEN' });

trackEvent('purchase', { value: 49.0, currency: 'USD' });
```

`injectKrawlup` injects the exact same two-tag setup (idempotent - safe against double-injection). `trackEvent` is safe to call before the tracker loads thanks to the queue shim.

## What is tracked automatically

Once the tag is installed, the tracker (served from `https://api.krawlup.com/t.js`) handles everything with no extra code:

- Pageviews on initial load and on SPA route changes (`pushState` / `popstate`).
- UTM parameters (`utm_source`, `utm_medium`, `utm_campaign`).
- Outbound link clicks (emitted as `outbound:<url>` events).
- Checkout link decoration: clicks to Stripe (`client_reference_id`), Polar (`reference_id`), Dodo (`metadata_sid`), and Paddle (`customData.sid`) get the session id attached so revenue is attributed server-side from payment webhooks. Do not strip or rewrite these query parameters on your checkout links.
- `navigator.doNotTrack === "1"` visitors are never tracked.

## Custom goals / conversions

Fire named events (name ≤ 60 chars; optional `value` in whole currency units and `currency` code):

```js
window.krawlup('signup_complete');
window.krawlup('purchase', { value: 49.0, currency: 'USD' });
```

Revenue/conversion reporting in the dashboard depends on the founder's plan. Never fabricate metrics: report what the krawlup dashboard (or `get_website_analytics` via MCP) actually returns.

## Verify the install

1. Visit the site, then check Dashboard → Website tab (data lands within ~1 minute of the first visit).
2. The live visitors badge `https://krawlup.com/badges/live/TOKEN.svg` shows distinct visitors over the last 5 minutes.
3. Fire a test event (`trackEvent('test_goal')` or `window.krawlup('test_goal')`) and confirm it appears under goals/events.

## Privacy posture (do not break)

The tag and this library write **no cookies** and no localStorage; the only client state is `sessionStorage` (`_klp_sid`, `_klp_s`). Do not add cookie writes, fingerprinting, or cross-site identifiers around the tag - that would violate krawlup's GDPR/PECR cookieless contract.
