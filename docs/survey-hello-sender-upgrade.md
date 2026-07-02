# Upgrade: send survey emails FROM hello@likeyourcar.com

**Do this ONLY after `hello@likeyourcar.com` is verified as a Gmail "Send mail as"
alias** on the Google account that owns the 3 forms (see `adam-finalize-steps.md`
Part 2). Before that, keep the current scripts (which show the sender **name**
"Like Your Car" and need no special permission).

Why the gate: this version uses `GmailApp`, which requires granting a Gmail
permission. If pasted before the alias + permission are in place, the submit
trigger would fail — so don't apply it early.

---

## What changes in each of the 3 scripts

**1) Add this constant** right under `const SENDER_NAME = ...`:

```js
const SENDER_EMAIL = "hello@likeyourcar.com"; // verified "Send mail as" alias
```

**2) Replace the `sendMail(...)` function** with this (sends from the alias, and
still falls back safely if the alias ever isn't found):

```js
function sendMail(to, subject, body) {
  var aliases = GmailApp.getAliases();
  if (aliases.indexOf(SENDER_EMAIL) !== -1) {
    GmailApp.sendEmail(to, subject, body, { from: SENDER_EMAIL, name: SENDER_NAME });
  } else {
    MailApp.sendEmail({ to: to, subject: subject, body: body, name: SENDER_NAME });
  }
}

// Run this ONCE after pasting to grant the Gmail permission + confirm the alias.
function authorize() {
  var a = GmailApp.getAliases();
  Logger.log("Send-mail-as aliases: " + a.join(", "));
  Logger.log(a.indexOf(SENDER_EMAIL) !== -1
    ? "OK — survey emails will send from " + SENDER_EMAIL
    : "NOT YET — add " + SENDER_EMAIL + " as a 'Send mail as' alias first.");
}
```

---

## Deploy steps (per script, all 3)
1. Paste the two changes above into each Apps Script project. **Save.**
2. **Run → `authorize`** once and approve the Gmail permission prompt.
3. Check **View → Logs**: it should say *"OK — survey emails will send from
   hello@likeyourcar.com."*
4. Submit one test per form → confirm the copy now comes **from** `hello@`.
   Delete the test rows.
5. ⚠️ Do **not** run `buildForm` (that makes new forms with new links).

*(Alternatively: tell Alex the alias is verified and he'll flip the 3 repo scripts
to this version in one commit, so you just re-paste the whole file as usual.)*
