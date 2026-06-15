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
4. (Recommended) On each Payment Link, set the **"After payment" redirect** to the matching **survey URL**. This automatically sends the customer to their survey the moment they pay — removing the manual "email them the survey" step entirely. The Full Service survey is now live here: `https://docs.google.com/forms/d/e/1FAIpQLSeyM7P1hyna-65SZ6MKGgGQkvYmjanXvHOYNT31xivs7ZsC6w/viewform`
5. Turn on Stripe's **email receipts** (Settings → Customer emails) so buyers get an automatic receipt.
6. Send the three Payment Link URLs to me and I'll wire them to the "Let's go" buttons on the site.

## Notes
- Stripe supports cards, Apple Pay, and Google Pay automatically — same coverage as now.
- No card data ever touches the website; Stripe hosts the checkout page and handles all PCI compliance. (So the site does not need to be private.)
- Only the checkout step hands off to Stripe; everything else stays on the new site.

## The improved end-to-end flow this enables

1. Customer clicks **Let's go** → Stripe checkout (~3%)
2. On payment → auto-redirect to their Tally survey + Stripe emails a receipt
3. Customer submits survey → **customer auto-gets a PDF copy** (see tally-customer-copy.md) **and** Adam is notified
4. Adam runs the consult + report

No manual steps for Adam between payment and the actual consulting work.
