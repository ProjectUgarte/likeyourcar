# Final steps for Adam

Two small setup tasks. Neither is urgent and neither can break the live site.

---

## Part A — Make survey emails come from `hello@likeyourcar.com`

Right now the survey copy/notification emails go out from your personal Gmail
(that's just how Google Apps Script works — it sends as whoever runs it). This
makes them send from the business address instead.

1. In the **Gmail account that owns the 3 survey forms**: gear icon →
   **See all settings** → **Accounts and Import** → **"Send mail as"** →
   **Add another email address**.
2. Name: **Like Your Car**, Email: **hello@likeyourcar.com** → Next → Send verification.
3. Open the **hello@likeyourcar.com** inbox, grab the verification code/link, and confirm.
   It should now appear under "Send mail as".
4. Open each of the **3 Apps Script projects** (script.google.com), select-all in the
   editor, delete, and **paste the updated script** (the files
   `google-forms-gut-check.gs`, `google-forms-full-service.gs`,
   `google-forms-whole-garage.gs`). Re-set `ADAM_EMAIL` to your real email. **Save.**
   - ⚠️ **Do NOT run `buildForm` again** — that would build brand-new forms with new
     links. Just save the new code; your existing forms + triggers keep working.
5. In each project, **Run → `authorize`** once and approve the Gmail permission.
   Open **View → Logs** — it should say *"OK — survey emails will send from
   hello@likeyourcar.com."*
6. Submit one test response per form to confirm the copy now comes **from
   hello@likeyourcar.com**, then delete the test rows.

*Safety net: until the alias is verified, the scripts automatically fall back to
sending from your normal Gmail — so nothing errors if you save the code first.*

---

## Part B — Contact form (Formspree, ~3 minutes)

The site's **Contact** page form needs a free Formspree endpoint so submissions
land in the `hello@likeyourcar.com` inbox.

1. Go to **formspree.io** → **Sign up** (free — you can use Google).
2. **New Form** → name it *"Like Your Car Contact"* → set the recipient email to
   **hello@likeyourcar.com**.
3. Copy the form's **endpoint URL** — it looks like `https://formspree.io/f/abcdwxyz`.
4. **Send that URL to Alex** — it gets dropped into the contact page and goes live.
5. Formspree may email you once to confirm the form on its first submission — just
   click that confirmation.

---

**Bottom line to send back:** (1) confirm the survey alias is verified + scripts
re-pasted, and (2) the Formspree endpoint URL. That finalizes both.
