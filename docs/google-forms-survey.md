# Free survey with auto-copy: Google Forms

Adam isn't on Tally Pro, so the "respondent gets a copy + Adam gets notified" feature isn't available there. **Google Forms does both for free.** This rebuilds his survey in Google Forms and adds those emails via a tiny script.

## What it gives us (for $0)
- The customer automatically receives a copy of their own answers on submit.
- Adam automatically gets an email notification with the answers.
- Responses also collect in Google Forms / a linked Google Sheet.

## Setup (~3 minutes, one time)
1. Go to **script.google.com** → **New project**.
2. Delete the sample code and paste in the script for the tier you're building — [google-forms-full-service.gs](google-forms-full-service.gs), [google-forms-gut-check.gs](google-forms-gut-check.gs), or [google-forms-whole-garage.gs](google-forms-whole-garage.gs). (Repeat for each of the three.)
3. Change `ADAM_EMAIL` at the top to Adam's real email.
4. Click **Run ▸ buildForm** and approve the permission prompt.
5. Open **View ▸ Logs** — it prints the form's **LIVE URL**. Send that URL back and it gets wired to the "Let's go" buttons on the site.

## Notes
- There are **three scripts now** — Full Service, Gut Check, and Whole Garage — each builds its own survey (all include the budget question). Run each once in its own Apps Script project.
- Ranking questions become a 1–N grid (Google Forms has no native ranking). Tweak anything in the Forms editor after it's created — the script just creates a faithful starting point.
- **The form's share URL is permanent.** Editing questions (add / remove / reword / reorder) in the Forms editor never changes the link, so you can hand the `…/viewform` URL to Stripe now and keep editing later. The link only changes if you **delete + recreate** the form or **re-run `buildForm`** (which makes a brand-new form) — so edit in the Forms UI, don't re-run the script. Keep a question with **"Email" in its title**, or the auto-copy-to-customer can't find the address.
- Test it once (submit with your own email) to confirm the copy + notification arrive.

## If Adam would rather not switch
The only alternative for the copy feature on Tally is **Tally Pro (~$29/mo)** — then it's a single toggle (see [tally-customer-copy.md](tally-customer-copy.md)). Google Forms is the free route.
