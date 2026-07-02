# Final steps for Adam

Both of these are finicky — here's the easy version. Neither can break the live site.

---

## Part A — Survey sender name (easy, no permissions)

The updated scripts now label every survey email with the sender name
**"Like Your Car"** (instead of your bare Gmail). This uses the permission you
already granted, so there's **nothing to find in settings and no alias to set up.**

1. Open each of the **3 Apps Script projects** (script.google.com).
2. Select all in the editor → delete → **paste the updated script**
   (`google-forms-gut-check.gs`, `google-forms-full-service.gs`,
   `google-forms-whole-garage.gs`).
3. Re-set `ADAM_EMAIL` to your real email. **Save.**
   - ⚠️ **Do NOT run `buildForm` again** — that builds brand-new forms with new
     links. Just save; your existing forms + triggers keep working.
4. That's it. No permission prompt, no alias. Submit one test to confirm the copy
   now shows **"Like Your Car"** as the sender.

### Optional upgrade (later) — send from `hello@likeyourcar.com`
Making the address itself read `hello@likeyourcar.com` (not just the name) needs a
verified Gmail **"Send mail as"** alias, which lives in **Gmail on desktop** →
gear → **See all settings** → **Accounts and Import** → **"Send mail as"**. That
only works if `hello@likeyourcar.com` is a mailbox you can receive a verification
code at — so first we need to know what that address actually is (see below). Not
required to launch; the sender name above is the main thing.

---

## Part B — Contact form (Formspree)

Formspree's free plan locks submissions to the **account's own email** (your Gmail),
and changing the destination is a paid/gated feature — that's the wall you hit.

**Easiest path (do this):** just leave the form pointing at your Gmail for now, and
send Alex the form's **endpoint URL** (looks like `https://formspree.io/f/abcdwxyz`,
under the form's *Integration → HTML*). The contact form goes live today and
messages reach you. We can move the destination to `hello@likeyourcar.com` later.

---

## The one question that unblocks the "polished" versions

**What is `hello@likeyourcar.com` right now?**
- a real mailbox you can log into (if so, where — GoDaddy webmail? Google?),
- a forward that just points to your Gmail, or
- not actually set up yet?

That answer decides both the survey "send from" alias and where the contact form
ultimately routes.

---

**Bottom line to send back:** (1) the Formspree **endpoint URL** (Gmail destination
is fine for now), and (2) what `hello@likeyourcar.com` actually is. The survey
sender-name fix just needs the 3 scripts re-pasted.
