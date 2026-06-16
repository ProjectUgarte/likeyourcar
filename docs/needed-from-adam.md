# What we need from Adam to finish the site

Checklist of everything still blocked on Adam. None of it stops the rest of the build — these just fill the last gaps. Chosen directions: **survey → Google Forms (free)**, **payments → Stripe**.

## Action items for Adam
- [x] **Survey:** ✅ Full Service form built in Google Forms and wired into the site. Adam should (1) submit it once to confirm the auto-copy + notification emails arrive, and (2) set it as the "after payment" redirect in Stripe. Gut Check & Whole Garage can be rebuilt the same way once we have their content.
- [ ] **Payments:** create a **Stripe** account and send the **3 Payment Link URLs** (Gut Check $99, Full Service $249, Whole Garage $499). Step-by-step in [stripe-setup.md](stripe-setup.md). Set each link's "after payment" redirect to the matching survey to automate the hand-off.

## Assets
- [x] **Logo** — ✅ added (his "LIKE YOUR CAR" wordmark, trimmed and placed in the header/footer across all pages).
- [x] **Customer gallery photos** — ✅ 8 photos optimized and live in the gallery carousel. Shown without names/captions, per Adam's request.

## Decisions / info
- [ ] **Real GoDaddy processing fee** — from a payout statement (confirms whether Stripe actually saves money vs. his current setup).
- [ ] **Contact** — his business email + how he wants the contact form handled.
- [ ] **Bio / About** — confirm or edit the bio text, and confirm using the "Your Car Choosing Expert" video there.
- [ ] **Testimonials** — first names/initials to attribute the 5 reviews (optional, with permission).

## Last step — go live
- [ ] Once everything above is done, point **likeyourcar.com** at the new site (DNS at GoDaddy + repo setting). Full copy-paste walkthrough: [go-live-domain.md](go-live-domain.md). No code changes; ~20 min + a short DNS/HTTPS wait; reversible.

## Already captured (no action needed)
- Brand purple (#9421FF), all three video embeds, real tiers/prices, the five real testimonials, his Terms text, the Drive It Out channel, and the full Full Service survey content.
