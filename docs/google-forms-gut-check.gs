/**
 * Like Your Car — Gut Check Survey builder (Google Apps Script)
 * Rebuilds Adam's Gut Check Tally survey in Google Forms (free) and sets up the
 * "customer gets a copy + Adam gets notified" emails.
 *
 * HOW TO USE (about 3 minutes):
 *  1. Go to script.google.com -> New project. Delete the sample code, paste this whole file.
 *  2. Change ADAM_EMAIL below to Adam's real email.
 *  3. Click Run -> buildForm. Approve the permissions prompt (Advanced -> "Go to ... (unsafe)" -> Allow).
 *  4. Open View -> Logs to get the form's LIVE URL. Send that back and it gets wired
 *     as the post-payment redirect for the GUT CHECK tier.
 *
 * On every submission it emails the respondent a copy of their answers and notifies Adam.
 * Ranking questions use a grid limited to one response per column (a real ranking).
 * To fix a form already built, run fixExistingRankingGrids().
 */

const ADAM_EMAIL = "REPLACE_WITH_ADAMS_EMAIL@example.com";
const SENDER_EMAIL = "hello@likeyourcar.com"; // survey emails send FROM this — must be a verified "Send mail as" alias in the Gmail running this script
const SENDER_NAME = "Like Your Car";
const FORM_TITLE = "Like Your Car — Gut Check Survey";
const FORM_INTRO = "You've narrowed your search to two vehicles and want to talk it through before deciding. This survey helps us understand what kind of driver you are. After you submit, you'll receive a copy of your answers and someone from the Like Your Car team will reach out within 48 hours.";

const QUESTIONS = [
  { t: "Name", type: "short", req: true },
  { t: "Email", type: "email", req: true },
  { t: "Phone number", type: "short", req: true },
  { t: "Please categorize your overall budget.", type: "choice", req: true, o: ["$0 - $10,000", "$10,000 - $20,000", "$20,000 - $30,000", "$30,000 - $40,000", "$40,000 - $50,000", "$50,000 - $60,000", "$60,000 - $70,000", "$70,000 - $80,000", "$80,000 - $90,000", "$90,000 - $100,000", "$100,000+", "Unsure"] },
  { t: "First vehicle you're choosing between", type: "short", req: true },
  { t: "Second vehicle you're choosing between", type: "short", req: true },
  { t: "Have you test-driven these vehicles yet?", type: "choice", req: true, o: ["Yes", "No", "I've test-driven 1 of the vehicles"] },
  { t: "Will you be the primary driver of this next vehicle?", type: "choice", req: true, o: ["Yes", "No"] },
  { t: "What type of vehicle(s) do you currently drive?", type: "para" },
  { t: "How often will you have passengers with you?", type: "choice", req: true, o: ["I'll be solo pretty much all the time", "I will have passengers sometimes", "I will have passengers most of the time", "I will almost always have a passenger(s)"] },
  { t: "How often will you have pets with you?", type: "choice", req: true, o: ["Never", "Rarely", "Sometimes", "Most of the time", "I let my dog drive"] },
  { t: "How often will you drive your next vehicle?", type: "choice", req: true, o: ["6 to 7 days per week", "3 to 5 days per week", "1 or 2 days per week", "A few times per month", "Sparingly or just on special occasions"] },
  { t: "Please list some (or all, if you wish) of the vehicles you have owned or leased in the past.", type: "para" },
  { t: "Choose a handful of the vehicles from your list above and elaborate on them. Tell us why these vehicles stand out to you.", type: "para" },
  { t: "Is there a car you've lost that you regret getting rid of or wish you could buy again someday?", type: "para" },
  { t: "Do you have a \"dream car\"?", type: "para" },
  { t: "As you think about your next vehicle, please rank the following in order of importance to you. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Looks", "Capability", "Fuel Efficiency", "Reliability", "Comfort"] },
  { t: "When thinking about how you'll be using your next vehicle, please rank the following driving scenarios. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Sitting in traffic", "Driving fun Mountain Roads", "Commuting", "Road Trips", "Nights on the Town"] },
  { t: "When you think about vehicle maintenance and repairs, how do you typically deal with it?", type: "choice", req: true, o: [
    "I tend to refer to my owner's manual / I pay close attention to my car's mileage / I often put reminders on my calendar so I don't forget maintenance intervals / If my car displays a check engine light or maintenance alert, I immediately schedule an appointment",
    "I'm thankful my owner's manual is there for reference on occasion / I typically remember my next maintenance via the sticker my mechanic placed on my windshield / I usually do whatever maintenance my mechanic recommends / If my car displays a check engine light or maintenance alert, I eventually schedule an appointment",
    "I usually get my oil changed somewhat close to the recommended mileage intervals / I try to avoid other maintenance items (brakes, tires, suspension, other fluids, etc.) until my mechanic says they absolutely need done for safety purposes",
    "I get my oil changed on occasion when I remember / I typically wait till something breaks or won't pass safety inspection to replace or fix it",
    "Cars make funny noises / Sometimes those funny noises get loud / Sometimes I just turn my stereo up louder to drown out the funny noises / Sometimes my car gets to the mechanic on its own power, but sometimes it's delivered to my mechanic via tow truck"
  ] },
  { t: "Please rank the following actions you would take from most likely to least likely, when your vehicle requires service or repairs. (1 = most likely, 3 = least likely.)", type: "grid", req: true, ranks: 3, o: ["Go to the dealership service department", "Go to my local mechanic and avoid the dealership", "Go to the auto parts store and fix it myself"] },
  { t: "Are there any other details you would like to share with us about your vehicle preferences?", type: "para" }
];

function buildForm() {
  const form = FormApp.create(FORM_TITLE);
  form.setDescription(FORM_INTRO);
  form.setCollectEmail(false);

  QUESTIONS.forEach(function (q) {
    if (q.type === "short") {
      var it = form.addTextItem().setTitle(q.t);
      if (q.req) it.setRequired(true);
    } else if (q.type === "email") {
      var em = form.addTextItem().setTitle(q.t);
      em.setValidation(FormApp.createTextValidation().requireTextIsEmail().build());
      if (q.req) em.setRequired(true);
    } else if (q.type === "para") {
      var pa = form.addParagraphTextItem().setTitle(q.t);
      if (q.req) pa.setRequired(true);
    } else if (q.type === "choice") {
      var mc = form.addMultipleChoiceItem().setTitle(q.t).setChoiceValues(q.o);
      if (q.req) mc.setRequired(true);
    } else if (q.type === "checkbox") {
      var cb = form.addCheckboxItem().setTitle(q.t).setChoiceValues(q.o);
      if (q.req) cb.setRequired(true);
    } else if (q.type === "grid") {
      var cols = [];
      for (var i = 1; i <= q.ranks; i++) cols.push(String(i));
      var gr = form.addGridItem().setTitle(q.t).setRows(q.o).setColumns(cols);
      gr.setValidation(FormApp.createGridValidation().requireLimitOneResponsePerColumn().build());
      if (q.req) gr.setRequired(true);
    }
  });

  ScriptApp.newTrigger("onFormSubmit").forForm(form).onFormSubmit().create();

  Logger.log("DONE.");
  Logger.log("LIVE URL (share this): " + form.getPublishedUrl());
  Logger.log("EDIT URL (your admin link): " + form.getEditUrl());
}

/**
 * Sends survey mail FROM the Like Your Car alias when it's set up; otherwise falls
 * back to the account's default address so nothing breaks before the alias exists.
 */
function sendMail(to, subject, body) {
  var aliases = GmailApp.getAliases();
  if (aliases.indexOf(SENDER_EMAIL) !== -1) {
    GmailApp.sendEmail(to, subject, body, { from: SENDER_EMAIL, name: SENDER_NAME });
  } else {
    MailApp.sendEmail({ to: to, subject: subject, body: body, name: SENDER_NAME });
  }
}

// Run this ONCE after pasting to grant the Gmail permission and confirm the alias.
function authorize() {
  var a = GmailApp.getAliases();
  Logger.log("Send-mail-as aliases on this account: " + a.join(", "));
  Logger.log(a.indexOf(SENDER_EMAIL) !== -1
    ? "OK — survey emails will send from " + SENDER_EMAIL
    : "NOT YET — add " + SENDER_EMAIL + " as a 'Send mail as' alias, then it switches automatically.");
}

function onFormSubmit(e) {
  var items = e.response.getItemResponses();
  var respondentEmail = "";
  var lines = [];
  items.forEach(function (ir) {
    var q = ir.getItem().getTitle();
    var a = ir.getResponse();
    if (Object.prototype.toString.call(a) === "[object Array]") a = a.join(", ");
    if (/email/i.test(q) && !respondentEmail && String(a).indexOf("@") > -1) respondentEmail = String(a).trim();
    lines.push(q + "\n" + (a === "" ? "(no answer)" : a) + "\n");
  });
  var body = lines.join("\n");

  sendMail(ADAM_EMAIL, "New Like Your Car survey submission (Gut Check)", body);

  if (respondentEmail) {
    sendMail(
      respondentEmail,
      "Your Like Your Car survey — a copy of your answers",
      "Thanks for completing your Like Your Car survey! Here is a copy of your answers for your records.\n\n" +
      body +
      "\nWe'll review your responses and be in touch within 48 hours.\n\n— Adam, Like Your Car"
    );
  }
}

/**
 * Run ONCE on the already-built form to enforce a true ranking on every ranking
 * question. Paste the form ID from its edit URL: https://docs.google.com/forms/d/<FORM_ID>/edit
 */
function fixExistingRankingGrids() {
  var FORM_ID = "PASTE_FORM_ID_FROM_THE_EDIT_URL";
  var form = FormApp.openById(FORM_ID);
  var grids = form.getItems(FormApp.ItemType.GRID);
  grids.forEach(function (it) {
    it.asGridItem().setValidation(
      FormApp.createGridValidation().requireLimitOneResponsePerColumn().build()
    );
  });
  Logger.log("Updated " + grids.length + " ranking grid(s) to one response per column.");
}
