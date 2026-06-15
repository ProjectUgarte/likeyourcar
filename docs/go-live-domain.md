# Go live: point likeyourcar.com at the new site

One-time cutover from the GitHub Pages URL (`projectugarte.github.io/likeyourcar/`) to **likeyourcar.com**. No code changes — the site uses relative links, so it works at the domain root automatically. Budget ~20 minutes of clicks + a short wait for DNS/HTTPS.

> Do this only once everything's final (Stripe links wired, logo + photos in, surveys done). It's fully reversible.

## What changes
- Site serves at **`https://likeyourcar.com/`** (root, not `/likeyourcar/`).
- The old `projectugarte.github.io/likeyourcar/` link **auto-redirects** to the new domain, so anything already shared keeps working.
- The domain **stays registered at GoDaddy** — no transfer.

## Recommended order (minimizes downtime)

### 1. Free the domain from the GoDaddy builder first
The domain currently powers Adam's GoDaddy "Websites + Marketing" site, which usually locks the DNS. Disconnect it before editing records:
- GoDaddy → **Websites + Marketing** → the Like Your Car site → **Settings → Domain** → disconnect / "use a different domain," **or** remove the domain's connection/forwarding to the builder.
- (Exact wording varies by GoDaddy UI; the goal is just to stop the builder from managing the domain so you can edit raw DNS.)

### 2. Set the DNS records (GoDaddy → Domain → Manage DNS → DNS Records)
Replace the builder's records with these:

**A records** (apex `@`) — all four:
```
@   A   185.199.108.153
@   A   185.199.109.153
@   A   185.199.110.153
@   A   185.199.111.153
```

**CNAME** (for the www version):
```
www   CNAME   projectugarte.github.io
```

**AAAA records** (optional, adds IPv6) — all four:
```
@   AAAA   2606:50c0:8000::153
@   AAAA   2606:50c0:8001::153
@   AAAA   2606:50c0:8002::153
@   AAAA   2606:50c0:8003::153
```

Delete any leftover A/CNAME/forwarding records that pointed at the GoDaddy builder, so they don't conflict.

### 3. Tell GitHub about the domain
- `ProjectUgarte/likeyourcar` repo → **Settings → Pages → Custom domain** → enter `likeyourcar.com` → **Save**. (This writes a `CNAME` file to the repo.)
- GitHub runs a DNS check. Once it passes (after the records propagate), the box shows a green check.

### 4. Turn on HTTPS
- Once GitHub provisions the certificate (usually < 1 hour after DNS resolves), tick **"Enforce HTTPS"** in the same Pages settings.

## How long it takes
- DNS propagation: minutes to a couple of hours (depends on the old records' TTL).
- HTTPS certificate: usually under an hour after DNS resolves.
- *(Optional pro move: a day before cutover, lower the TTL on the existing records so propagation is faster.)*

## Verify it worked
- Visit `https://likeyourcar.com` and `https://www.likeyourcar.com` — both should load the new site over HTTPS (no certificate warning).
- Check the redirect: `projectugarte.github.io/likeyourcar/` should bounce to `likeyourcar.com`.
- Optional check from a terminal: `dig +short likeyourcar.com` should return the four `185.199.x.153` IPs.

## Rollback (if needed)
DNS is reversible. To go back to the GoDaddy site, restore the original builder DNS records (or reconnect the domain in Websites + Marketing). Keep the GoDaddy site published until the new site is confirmed live, then retire it.

## Notes
- Custom domain → one repo. `likeyourcar.com` attaches to the `likeyourcar` repo independently of `projectugarte.com` (which stays on its own repo).
- After go-live, deploys still work the same: `git push` → live at likeyourcar.com in ~1 min.
