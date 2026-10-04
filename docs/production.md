# Production configuration

The published source is the checksum-verified V5 archive in `source/`, with enhancements in `overrides/` and metadata/assets applied by `scripts/build.py`. Root HTML/CSS/JS and `bundle/` are legacy reference files; GitHub Pages publishes `_site/`, never these wrappers. Run the same build locally:

```sh
python3 scripts/build.py
python3 scripts/verify.py
python3 -m http.server 8000 --directory _site
```

## Domain and SEO

The existing `CNAME` stays `buelstudio.com`. At implementation time the live HTTPS apex redirects to `https://www.buelstudio.com/`, which is the canonical origin. The build copies CNAME byte for byte; it does not change DNS or Pages settings. Canonical and social URL tags are page specific. The sitemap contains home, Lab and the three case studies; 404 is noindex. Case-study bodies and original translations remain unchanged; their head receives metadata and an optional analytics adapter. Check both hosts and HTTP→HTTPS redirects after deployment. Preserve Enforce HTTPS in GitHub Pages settings.

## Contact

`hello@buelstudio.com` received the delivery test, confirmed by the user on 2026-10-04. `site-config.json` has `inboxVerified: true` and `endpoint: null`. The homepage form prepares an email draft to this address and instructs the visitor to complete sending in their mail app. Direct form delivery remains disabled until a real endpoint is connected. Form values are kept in the page, including across EN/TR switches; they are not stored by the site.

To enable direct delivery, first confirm that the inbox receives mail. Supply a real HTTPS JSON endpoint and set `inboxVerified: true`. GitHub Pages is static: delivery needs a separate backend or form provider adapter. Do not put API keys or email-service credentials in the JSON configuration or browser code.

Endpoint contract:

- Accept `POST` JSON with `name`, `email`, `type`, `timing`, `budget`, `message`, `company_website`, `language`, and `requestId`.
- CORS must allow `https://www.buelstudio.com` and `https://buelstudio.com`, including the JSON preflight. Requests omit cookies and referrer.
- Validate lengths and email on the server, reject the honeypot, apply rate limits and deduplicate `requestId` across retries. Client validation is not spam protection.
- Return HTTP 2xx and `{"ok": true}` only after the inquiry is durably accepted for delivery. Any other result, malformed JSON, timeout or network failure keeps the user's input and shows retry/email/WhatsApp options. A 15-second client timeout can occur after server acceptance, so deduplication matters.
- Configure recipient and sender on the server; never trust a client-supplied recipient. Verify actual delivery before enabling the UI.

The direct endpoint branch was exercised with isolated responses for accepted, rejected, non-JSON, offline, timeout and duplicate-click conditions; no real inquiries were sent. The Lab inquiry uses the same configured form and honest mailto fallback as the homepage.

## Optional analytics

Analytics is disabled until `analytics.plausibleScriptUrl` contains the actual site-specific `https://plausible.io/js/pa-….js` URL from the Plausible dashboard for the BUEL domain. `null` loads no tracking script and creates no measurement requests or event queue. No dummy ID is published. No analytics subscription/account is created by this change.

Once configured, the adapter measures pageviews and these event names only: `Inquiry opened`, `Inquiry email prepared`, `Inquiry accepted`, `WhatsApp clicked`, `Instagram clicked`, `Email clicked`, `Case study clicked`. Add matching custom event goals in the dashboard. It sends no form content, email addresses, budgets or destination-link properties. It removes URL query strings, fragments and referrer from measurements, honors DNT and Global Privacy Control, and disables capture outside the two production hosts. Failure to load the tracker leaves the site and contact flow usable.

The integration follows the current [Plausible initialization options](https://plausible.io/docs/script-extensions) and [custom event API](https://plausible.io/docs/custom-event-goals). Configure the dashboard's default measurements consistently with these limited events. Production account connectivity and actual dashboard receipt remain to be checked after the real script URL is supplied.
