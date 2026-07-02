/**
 * Like Your Car — Whole Garage Survey builder (Google Apps Script)
 * Rebuilds Adam's Whole Garage Tally survey in Google Forms (free) with the
 * "customer gets a copy + Adam gets notified" emails and the ranking-grid fix.
 *
 * HOW TO USE (about 3 minutes):
 *  1. script.google.com -> New project. Delete the sample code, paste this whole file.
 *  2. Change ADAM_EMAIL below to Adam's real email.
 *  3. Run -> buildForm. Approve permissions (Advanced -> "Go to ... (unsafe)" -> Allow).
 *  4. View -> Logs gives the LIVE URL. Send it back to wire as the WHOLE GARAGE post-payment redirect.
 *
 * On submit it emails the respondent their answers and notifies Adam. Ranking
 * questions are grids limited to one response per column. To fix an already-built
 * form, run fixExistingRankingGrids().
 */

const ADAM_EMAIL = "REPLACE_WITH_ADAMS_EMAIL@example.com";
const SENDER_NAME = "Like Your Car"; // shown as the sender name on the survey emails
const REPLY_TO = "hello@likeyourcar.com"; // if a customer replies to their copy, it goes to the business inbox
const FORM_TITLE = "Like Your Car — Whole Garage Survey";
const FORM_INTRO = "It's time for some changes in the fleet! This survey helps us understand your wants, needs, and driving style across all your vehicles. After you submit, you'll receive a copy of your answers and someone from the Like Your Car team will reach out within 48 hours. Take your time and have fun with it.";

var MAINTENANCE = [
  "I tend to refer to my owner's manual / I pay close attention to my car's mileage / I often put reminders on my calendar so I don't forget maintenance intervals / If my car displays a check engine light or maintenance alert, I immediately schedule an appointment",
  "I'm thankful my owner's manual is there for reference on occasion / I typically remember my next maintenance via the sticker my mechanic placed on my windshield / I usually do whatever maintenance my mechanic recommends / If my car displays a check engine light or maintenance alert, I eventually schedule an appointment",
  "I usually get my oil changed somewhat close to the recommended mileage intervals / I try to avoid other maintenance items (brakes, tires, suspension, other fluids, etc.) until my mechanic says they absolutely need done for safety purposes",
  "I get my oil changed on occasion when I remember / I typically wait till something breaks or won't pass safety inspection to replace or fix it",
  "Cars make funny noises / Sometimes those funny noises get loud / Sometimes I just turn my stereo up louder to drown out the funny noises / Sometimes my car gets to the mechanic on its own power, but sometimes it's delivered to my mechanic via tow truck"
];

const QUESTIONS = [
  { t: "Name", type: "short", req: true },
  { t: "Email", type: "email", req: true },
  { t: "Phone number", type: "short", req: true },
  { t: "Please categorize your overall budget.", type: "choice", req: true, o: ["$0 - $10,000", "$10,000 - $20,000", "$20,000 - $30,000", "$30,000 - $40,000", "$40,000 - $50,000", "$50,000 - $60,000", "$60,000 - $70,000", "$70,000 - $80,000", "$80,000 - $90,000", "$90,000 - $100,000", "$100,000+", "Unsure"] },
  { t: "How many vehicles do you currently have in your personal fleet?", type: "short", req: true },
  { t: "How many total drivers will you have?", type: "short", req: true },
  { t: "How many vehicles do you look to have when you are done with the buying process?", type: "short" },
  { t: "How many total seats do you feel your largest-capacity vehicle needs to have?", type: "choice", req: true, o: ["2 Seats", "4 Seats", "5 Seats", "6 Seats", "7 Seats", "8 Seats", "9+ Seats"] },
  { t: "Can you list the vehicle(s) you currently drive?", type: "para" },
  { t: "What type of cars were you around when you were a kid that made an impression on you?", type: "para" },
  { t: "Can you share a great memory or two from your childhood that is vehicle related? Tell us what vehicle is in that memory, who you were with, and where you went.", type: "para" },
  { t: "Are there any vehicles from your childhood that you disliked and possibly, to this day, make you curl up your nose?", type: "para" },
  { t: "What was the very first vehicle you ever got behind the wheel of and drove?", type: "short" },
  { t: "What vehicle did you take your driver's test in to receive your driver's license?", type: "short" },
  { t: "What was the car you wished to have when you were in High School, but couldn't have?", type: "para" },
  { t: "What was your very first personal vehicle?", type: "short" },
  { t: "Please list some (or all, if you wish) of the vehicles you have owned or leased in the past.", type: "para" },
  { t: "Choose a handful of the vehicles from your list above and elaborate on them. Tell us why these vehicles stand out to you.", type: "para" },
  { t: "Is there a car you've lost that you regret getting rid of or wish you could own again someday?", type: "para" },
  { t: "Do you have a \"dream car\"?", type: "para" },
  { t: "Do you have any favorite TV or Movie car(s) that you loved as a kid or even still love?", type: "para" },
  { t: "Can you share one last memory? Take us back to a moment when you faced a challenge in a vehicle and perhaps how you overcame that difficult moment.", type: "para" },
  { t: "For the LARGEST-capacity vehicle you want to add, rank the following in order of importance. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Looks", "Capability", "Fuel Efficiency", "Reliability", "Comfort"] },
  { t: "For the SMALLEST-capacity vehicle you want to add, rank the following in order of importance. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Looks", "Capability", "Fuel Efficiency", "Reliability", "Comfort"] },
  { t: "For the LARGEST-capacity vehicle, rank these driving scenarios by how important it is that it excels at them. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Commuting", "Driving fun Mountain Roads", "Sitting in traffic", "Road Trips", "Nights on the Town"] },
  { t: "For the SMALLEST-capacity vehicle, rank these driving scenarios by how important it is that it excels at them. (1 = most important, 5 = least important.)", type: "grid", req: true, ranks: 5, o: ["Commuting", "Driving fun Mountain Roads", "Sitting in traffic", "Road Trips", "Nights on the Town"] },
  { t: "When you think about the design of your next vehicle(s), which of the following best describes your tastes?", type: "choice", req: true, o: ["Edgy or Bold Styling and Bright Colors That Stand Out", "Minimalist or Restrained Styling and Monochrome Colors That Blend In", "Somewhere in the middle", "I'm unsure"] },
  { t: "When you think about the vehicles you are typically drawn to, which of the following describes them best?", type: "choice", req: true, o: ["Boxy and Tough", "Curvy and Beautiful", "It varies", "I'm unsure"] },
  { t: "When you think about vehicle maintenance and repairs, how do you typically deal with it?", type: "choice", req: true, o: MAINTENANCE },
  { t: "Please rank the following actions you would take from most likely to least likely, when your vehicle requires service or repairs. (1 = most likely, 3 = least likely.)", type: "grid", req: true, ranks: 3, o: ["Go to the dealership service department", "Go to my local mechanic and avoid the dealership", "Go to the auto parts store and fix it myself"] },
  { t: "If you take a road trip, what does it typically entail? (Select all that apply — at least 3.)", type: "checkbox", req: true, o: ["Long Stretches of Highway", "Cruise Control", "Audio Books", "Twisty Back Roads", "Shifting Gears", "Wind in Your Hair", "Riding Solo", "Fellow Passengers", "Pet(s)", "Big Skylines", "Small Towns", "Loud Music", "Multiple passengers", "Truck Stops", "Scenic Overlooks", "Hotel Room Key", "Camp Site", "Large Amounts of Luggage", "Minimal Luggage"] },
  { t: "If you are commuting, what are you most likely to have with you? (Select all that apply — at least 2.)", type: "checkbox", req: true, o: ["A cup of coffee", "An obnoxiously huge water bottle or mug and proud of it", "A reasonably sized water bottle", "A fountain drink", "Small snacks", "Larger food items and sauces to dip them in / Your car is unashamedly your dining room", "A huge keychain that might possibly be big enough to rope a steer or lasso around the moon and pull it down", "Fellow Passengers", "Pet(s)", "A Purse", "A Briefcase", "A Gym Bag", "A Backpack"] },
  { t: "If you find yourself stuck in a traffic jam, rank the following interior features in order of importance. (1 = most important, 6 = least important.)", type: "grid", req: true, ranks: 6, o: ["Sound system quality for your tunes", "Seat comfort / ergonomics", "Practical space for food and drink", "Premium infotainment screen with lots of features", "Driver assistance features like Auto-Hold & Adaptive Cruise Control with Stop and Go", "Quality air and climate control"] },
  { t: "Tell us about the climate you live in and the situations your vehicle will typically face. (Select all that apply.)", type: "checkbox", req: true, o: ["Extreme heat (90° F and above)", "Extreme cold (below freezing)", "Extreme dry", "Extreme humidity", "High altitude", "Near the ocean", "Extended periods of rain", "High water", "Extended periods of snow", "Snowy roads that have not yet been cleared or plowed", "Off-road (dirt, mud, sand)", "On-track (racing)", "Long periods running at idle / sitting in place but turned on"] },
  { t: "Where will your car typically sleep at night?", type: "choice", req: true, o: ["In a garage", "Outside", "A mix of both"] },
  { t: "Tell us about your hobbies!", type: "para" },
  { t: "Please select the types of powertrains you are interested in. (Select all that apply.)", type: "checkbox", req: true, o: ["Gasoline", "Gasoline Turbocharged", "Mild Hybrid", "Hybrid", "Plug-in Hybrid", "Fully Electric", "No preference", "Unsure / I'd like to learn more about these options"] },
  { t: "Do you have a specific MPG or Range you are wanting to achieve with any of your vehicles?", type: "para" },
  { t: "Are there any additional vehicle features you are looking for that have not been discussed in this survey?", type: "para" },
  { t: "Have you test-driven any vehicles yet? If so, which ones?", type: "para" },
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
 * Sends survey mail showing "Like Your Car" as the sender name. Uses MailApp, so it
 * needs no permissions beyond what buildForm already granted. (Optional later upgrade:
 * send from hello@likeyourcar.com via a verified Gmail "Send mail as" alias.)
 */
function sendMail(to, subject, body) {
  MailApp.sendEmail({ to: to, subject: subject, body: body, name: SENDER_NAME, replyTo: REPLY_TO });
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

  sendMail(ADAM_EMAIL, "New Like Your Car survey submission (Whole Garage)", body);

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
