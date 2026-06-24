# Setting up Stripe checkout for the three packages

**Goal:** Replace the GoDaddy PayLinks / PayPal buttons with Stripe-hosted checkout, and wire the "Let's go" buttons on the new site to them.

> **First, verify it's worth it.** Adam's current tier pages use GoDaddy PayLinks (GoDaddy Payments) + PayPal. GoDaddy Payments normally charges ~2.3–2.9% and PayPal ~3.5% — *not* 20%. Before switching, check an actual GoDaddy payout statement for the real fee. If he's already near ~3%, Stripe is about the same on price; its value is then cleaner UX + the post-payment automation below, not big savings.

## Steps

1. Create a free **Stripe** account at stripe.com and complete business verification.
2. In the Stripe Dashboard, create three **Products**, each with a one-time **Price**:
   - Gut Check — $99
   - Full Service — $249
   - Whole Garage — $499
3. For each product, create a **Payment Link** (Dashboard → Payment Links → New).
4. **Set the post-payment redirect** on each Payment Link so the buyer lands on their survey automatically (this is what removes the manual "email them the survey" step). Open the link → **Edit** → scroll to the **"After the payment"** section → choose **"Don't show confirmation page → Redirect customers to your website"** → paste that package's Google Form share link (the `…/viewform` URL). Must be HTTPS (Google Form links already are); no `{CHECKOUT_SESSION_ID}` placeholder needed.
5. Turn on Stripe's **email receipts** (Settings → Customer emails) so buyers get an automatic receipt.
6. Send the three Payment Link URLs to me and I'll wire them to the "Let's go" buttons on the site. (On the site they live in each tier page's buy-button `data-href`; the Terms checkbox swaps it into `href` on agree.)

> ⚠️ **Gotcha — is "Edit" greyed out on a link?** Then it was **created with the Payment Links API**, not the dashboard, and Stripe locks API-made links from dashboard editing (tooltip: *"you can only edit it using the API"*). This happens when a tool / AI / CLI created them. Fix without any code: **⋯ → Duplicate** the link (the copy is dashboard-editable), or rebuild it with **+ Create payment link**; then **Deactivate** the API-made originals. Note the **"After the payment"** section only appears in the **Edit** form — not the list or the link's detail view.

## Test the whole flow without real money

Stripe's **test cards only work in Sandbox, never in Live.** Two ways to verify:

- **Survey + emails only (fastest):** just open the survey link directly and submit — the customer copy + Adam's notification fire on their own (that automation is independent of Stripe).
- **Full pay → survey handoff:** top-left dropdown → **Switch to sandbox** → **+ Create payment link** (sandbox has its own empty catalog, so add a throwaway product at any price) → set its **After the payment** redirect to the **same survey link** (Google Form URLs work in any mode) → open it → pay with test card **`4242 4242 4242 4242`**, any future expiry, any CVC/ZIP → it redirects to the survey exactly like Live. **Switch back to Live when done**, and delete the test rows from the Form's responses.

## Before it can take real money

The Stripe account must be fully **activated** (business details + bank account on file). Until then the live links exist but real charges won't process. Sandbox testing works regardless of activation.

## Notes
- **Payment methods:** Stripe covers **credit/debit cards (Visa, Mastercard, Amex, Discover), Apple Pay, and Google Pay automatically** on its hosted checkout — and because our buttons link out to Stripe's hosted page, there's **no Apple Pay domain setup** to worry about. **PayPal** is also a Stripe payment method, but availability is **region-dependent** (it rolled out in Europe first and has been expanding to the US) — check **Settings → Payment methods** in the dashboard to see if PayPal can be toggled on for his account. If it can't, either keep a separate PayPal link alongside (like his current setup) or rely on cards + Apple/Google Pay, which cover the large majority of buyers.
- No card data ever touches the website; Stripe hosts the checkout page and handles all PCI compliance. (So the site does not need to be private.)
- Only the checkout step hands off to Stripe; everything else stays on the new site.

## The improved end-to-end flow this enables

1. Customer clicks **Let's go** → Stripe checkout (~3%)
2. On payment → auto-redirect to their Google Forms survey + Stripe emails a receipt
3. Customer submits survey → **customer auto-gets an email copy of their answers** (Google Forms script) **and** Adam is notified
4. Adam runs the consult + report

No manual steps for Adam between payment and the actual consulting work.
