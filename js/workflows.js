"use strict";

const easternInput = new Intl.DateTimeFormat("sv-SE", {
  timeZone: eastern, year: "numeric", month: "2-digit", day: "2-digit",
  hour: "2-digit", minute: "2-digit", hourCycle: "h23"
});

function easternLocal(value) {
  return Number.isFinite(Date.parse(value))
    ? easternInput.format(new Date(value)).replace(" ", "T") : "";
}

function easternTimestamp(value) {
  for (const offset of ["-04:00", "-05:00"]) {
    const candidate = value + offset;
    if (value && easternLocal(candidate) === value) return candidate;
  }
  return "";
}

function favoriteButton(kind, record, afterChange = () => {}) {
  const noun = kind === "club" ? "club" : "event";
  const button = element("button", "button secondary");
  button.type = "button";
  const status = element("span", "sr-only");
  status.setAttribute("role", "status");
  function refresh() {
    const saved = readDemo().favorites[kind].includes(record.id);
    button.textContent = saved ? "♥ Saved" : "♡ Save " + noun;
    button.setAttribute("aria-label", "Favorite " + (record.name || record.title));
    button.setAttribute("aria-pressed", String(saved));
  }
  button.addEventListener("click", () => {
    try {
      updateDemo(state => {
        const ids = new Set(state.favorites[kind]);
        if (!ids.delete(record.id)) ids.add(record.id);
        state.favorites[kind] = [...ids];
      });
    } catch {
      status.className = "small";
      status.textContent = "This browser is blocking local storage.";
      return;
    }
    refresh();
    afterChange();
  });
  refresh();
  return element("span", "favorite-control", button, status);
}

function calendarText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\r\n|\r|\n/g, "\\n")
    .replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function calendarDate(timestamp) {
  return new Date(timestamp).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

function foldCalendarLine(line) {
  const encode = new TextEncoder();
  let result = "", length = 0;
  for (const character of line) {
    const size = encode.encode(character).length;
    if (length + size > 75) {
      result += "\r\n ";
      length = 1;
    }
    result += character;
    length += size;
  }
  return result;
}

function downloadReminder(item) {
  const summary = calendarText(item.title);
  const rows = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Meet the Dukes//Proof of Concept//EN",
    "BEGIN:VEVENT", "UID:" + item.id + "@meet-the-dukes.example",
    "DTSTAMP:" + calendarDate(Date.now()), "DTSTART:" + calendarDate(item.timestamp),
    "SUMMARY:" + summary, "DESCRIPTION:Meet the Dukes proof-of-concept entry. Check current details in the app.",
    "LOCATION:" + calendarText(item.location || ""), "BEGIN:VALARM", "ACTION:DISPLAY",
    "TRIGGER:-P1D", "DESCRIPTION:" + summary, "END:VALARM", "END:VEVENT", "END:VCALENDAR"];
  const file = new Blob([rows.map(foldCalendarLine).join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(file);
  const download = link("", url);
  download.download = "meet-the-dukes-" + item.id + ".ics";
  document.body.append(download);
  download.click();
  download.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function showFavorites() {
  const { club, event } = readDemo().favorites;
  const savedClubs = clubs.filter(record => club.includes(record.id));
  const savedEvents = eventRecords.filter(record => event.includes(record.id));
  const reminders = [
    ...savedClubs.map(record => ({ id: "deadline-" + record.id, title: record.name + " application deadline",
      timestamp: Date.parse(record.deadlineAt), href: clubHref(record) })),
    ...savedEvents.map(record => ({ id: "event-" + record.id, title: record.title,
      timestamp: record.timestamp, location: record.location, href: "#events" }))
  ].filter(item => item.timestamp > Date.now()).sort((a, b) => a.timestamp - b.timestamp);
  const cards = savedClubs.map(record => {
    const unSave = favoriteButton("club", record, refreshFavorites);
    return element("article", "panel saved-row",
      element("div", "", element("h3", "", link(record.name, clubHref(record))),
        element("p", "", categoryById.get(record.category).name)), unSave);
  });
  const eventCards = savedEvents.map(record => eventCard(record, refreshFavorites));
  const reminderRows = reminders.map(item => {
    const button = element("button", "button secondary", "Add to calendar");
    button.type = "button";
    button.setAttribute("aria-label", "Add " + item.title + " to calendar");
    button.addEventListener("click", () => downloadReminder(item));
    const soon = item.timestamp - Date.now() <= 7 * 86400000;
    return element("li", "saved-row",
      element("div", "", link(item.title, item.href, "text-link"),
        element("p", "small", dayFormat.format(item.timestamp) + " · " + clockFormat.format(item.timestamp)),
        ...(soon ? [element("span", "badge demo", "Due within 7 days")] : [])), button);
  });
  const reminderPanel = element("section", "panel reminders",
    element("h2", "", "Reminders"),
    element("p", "", "Import a calendar file to request an alert one day before a saved event or deadline. Your calendar app controls delivery."),
    reminderRows.length ? element("ul", "reminder-list", ...reminderRows)
      : empty("Save an upcoming event or a club with a future application deadline to add a reminder."));
  main.append(heading("Your Favorites", "Revisit saved clubs and events. Favorites are stored in this browser."),
    element("div", "wrap listing favorites-grid", reminderPanel,
      element("section", "profile-stack", element("h2", "", "Saved clubs"),
        ...(cards.length ? cards : [empty("No clubs saved yet.")])),
      element("section", "profile-stack", element("h2", "", "Saved events"),
        ...(eventCards.length ? eventCards : [empty("No events saved yet.")]))));
}

function refreshFavorites() {
  render();
  main.focus({ preventScroll: true });
}

const organizationFields = [
  ["name", "Organization name", "text", true],
  ["category", "Interest category", categories, true],
  ["description", "Short description", "textarea", true],
  ["about", "Mission and activities", "textarea"],
  ["interests", "Search keywords (comma-separated)", "text"],
  ["requirements", "Membership requirements", "textarea"],
  ["commitment", "Time commitment", "text"],
  ["meetingSchedule", "Meeting schedule", "text"],
  ["meetingLocation", "Meeting location", "text"],
  ["recruitment", "Recruitment schedule and how to join", "textarea"],
  ["deadlineAt", "Application deadline (Eastern time)", "datetime-local"],
  ["contactName", "Leadership contact name or role", "text"],
  ["contactEmail", "Leadership contact email", "email"],
  ["officialUrl", "Official listing URL (HTTPS)", "url"],
  ["registrationUrl", "Registration URL (HTTPS)", "url"],
  ["videoId", "YouTube video ID (11 characters)", "video"],
  ["videoTranscript", "Video transcript", "textarea"]
];
const eventFields = [
  ["title", "Event title", "text", true],
  ["eventType", "Event type", "text", true],
  ["startsAt", "Start (Eastern time)", "datetime-local", true],
  ["location", "Location", "text"],
  ["description", "Event description", "textarea"],
  ["registrationUrl", "Event or registration URL (HTTPS)", "url"]
];

function workflowForm(prefix, fields, original, action, save) {
  const form = element("form", "workflow-form");
  const grid = element("div", "workflow-fields");
  for (const [name, label, type, required] of fields) {
    const field = Array.isArray(type) ? selectOptions(type, original[name] || type[0].id)
      : element(type === "textarea" ? "textarea" : "input");
    if (field instanceof HTMLInputElement) {
      field.type = type === "video" ? "text" : type;
      if (type === "video") field.pattern = "[A-Za-z0-9_\\-]{11}";
    }
    if (field instanceof HTMLTextAreaElement) field.rows = 3;
    field.name = name;
    field.required = Boolean(required);
    if (field instanceof HTMLInputElement && field.type === "url") field.placeholder = "https://";
    if (!Array.isArray(type)) {
      const value = original[name];
      field.value = type === "datetime-local" ? easternLocal(value) :
        Array.isArray(value) ? value.join(", ") : value || "";
    }
    const wrapper = controls(prefix + "-" + name, label, field);
    if (type === "textarea") wrapper.classList.add("wide-field");
    grid.append(wrapper);
  }
  const button = element("button", "button primary", action);
  button.type = "submit";
  const status = element("p", "small workflow-status");
  status.setAttribute("role", "status");
  form.append(grid, button, status);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(form));
    for (const [name, label, type, required] of fields) {
      values[name] = values[name].trim();
      if (required && !values[name]) {
        status.textContent = label + " is required.";
        return;
      }
      if (type === "url" && values[name] && !external(label, values[name])) {
        status.textContent = label + " must be a valid HTTPS address.";
        return;
      }
      if (type === "datetime-local" && values[name]) {
        values[name] = easternTimestamp(values[name]);
        if (!values[name]) {
          status.textContent = label + " is outside a valid Eastern time. Check daylight saving time.";
          return;
        }
      }
    }
    try {
      save(values);
    } catch {
      status.textContent = "This browser could not save the change locally.";
    }
  });
  return form;
}

function showStudio(params, message = "") {
  const selected = clubById.get(params.get("club"));
  const org = selectOptions([{ id: "", name: "Create a new sample organization" }, ...clubs], selected?.id || "");
  org.addEventListener("change", () => {
    location.hash = "#studio" + (org.value ? "?club=" + org.value : "");
  });
  const panel = element("div", "panel profile-stack", element("h2", "", "Organization profile"),
    controls("leader-organization", "Organization to manage", org),
    workflowForm("org", organizationFields, selected || {}, "Save organization profile", values => {
      const id = selected?.id || demoId("club");
      updateDemo(state => {
        state.clubs[id] = { ...selected, ...values, id, isDemo: true,
          recruitmentStatus: values.recruitment ? "See recruitment details" : "",
          videoTitle: selected?.videoId === values.videoId ? selected.videoTitle : "",
          interests: values.interests.split(",").map(word => word.trim()).filter(Boolean),
          updatedAt: new Date().toISOString() };
      });
      if (!selected) location.hash = "#studio?club=" + id;
      else render(false, "Organization profile saved.");
    }));
  if (selected) panel.append(link("View student-facing profile →", clubHref(selected), "text-link"));

  const body = element("div", "wrap listing profile-stack", workspaceNav("studio"),
    element("p", "notice", "Demo leader mode. Changes appear immediately in the student view in this browser."), panel);
  if (message) {
    const feedback = element("p", "notice", message);
    feedback.setAttribute("role", "status");
    feedback.tabIndex = -1;
    body.insertBefore(feedback, panel);
  }
  if (selected) {
    const related = eventRecords.filter(record => record.organizationId === selected.id);
    const activeEvent = related.find(record => record.id === params.get("event"));
    const picker = selectOptions([{ id: "", name: "Post a new open event" },
      ...related.map(record => ({ id: record.id, name: record.title }))], activeEvent?.id || "");
    picker.addEventListener("change", () => {
      location.hash = "#studio?club=" + selected.id + (picker.value ? "&event=" + picker.value : "");
    });
    body.append(element("section", "panel profile-stack", element("h2", "", "Open events"),
      controls("leader-event", "Event to manage", picker),
      workflowForm("event", eventFields, activeEvent || {}, "Save open event", values => {
        const id = activeEvent?.id || demoId("event");
        updateDemo(state => {
          const record = { ...activeEvent, ...values, id, organizationId: selected.id, isDemo: true };
          if (record.endsAt && Date.parse(record.endsAt) <= Date.parse(record.startsAt)) delete record.endsAt;
          state.events[id] = record;
        });
        if (!activeEvent) location.hash = "#studio?club=" + selected.id + "&event=" + id;
        else render(false, "Open event saved.");
      })));
  }
  main.append(heading("Leader Workspace", "Create or update sample profiles, videos, recruitment details, contacts, and open events."), body);
  if (message) body.querySelector("[role=status]").focus();
}

function demoId(prefix) {
  return prefix + "-" + Array.from(crypto.getRandomValues(new Uint8Array(8)), byte => byte.toString(16).padStart(2, "0")).join("");
}

function workspaceNav(active) {
  const roles = [["Leader workspace", "studio"], ["Admin review", "review"]];
  return element("div", "workspace-nav", ...roles.map(([label, route]) => {
    const tab = link(label, "#" + route, "button " + (active === route ? "primary" : "secondary"));
    if (active === route) tab.setAttribute("aria-current", "page");
    return tab;
  }));
}

function showReview() {
  const state = readDemo();
  const reviews = clubs.map(club => {
    const flag = state.flags[club.id];
    const button = element("button", "button secondary", flag ? "Clear flag" : "Flag as outdated");
    button.type = "button";
    const row = element("article", "panel profile-stack",
      element("div", "saved-row", element("h3", "", club.name),
        element("span", "badge " + (flag ? "demo" : ""), flag ? "Needs update" : "Ready for review")),
      element("p", "", club.description),
      element("p", "small", club.updatedAt ? "Updated " + dayFormat.format(Date.parse(club.updatedAt)) : "Sample listing"),
      ...(flag ? [element("p", "", flag.note)] : []),
      element("div", "workspace-nav", link("Review profile", clubHref(club), "button secondary"), button));
    const form = element("form", "flag-form");
    form.hidden = true;
    const note = element("input");
    note.required = true;
    note.maxLength = 180;
    const submit = element("button", "button primary", "Save flag");
    submit.type = "submit";
    const status = element("p", "small");
    status.setAttribute("role", "status");
    form.append(controls("note-" + club.id, "What needs to be updated?", note), submit);
    row.append(form, status);

    function setFlag(value) {
      try {
        updateDemo(next => {
          if (value) next.flags[club.id] = { note: value };
          else delete next.flags[club.id];
        });
        render();
        document.getElementById("review-" + club.id)?.querySelector("button")?.focus();
      } catch {
        status.textContent = "This browser could not save the review.";
      }
    }

    button.addEventListener("click", () => {
      if (flag) setFlag("");
      else {
        form.hidden = false;
        note.focus();
      }
    });
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (note.value.trim()) setFlag(note.value.trim());
      else status.textContent = "Enter a reason for the flag.";
    });
    row.id = "review-" + club.id;
    return row;
  });
  main.append(heading("Admin Review", "Review demo listings and flag information that needs a refresh."),
    element("div", "wrap listing profile-stack", workspaceNav("review"),
      element("p", "notice", "Demo administrator mode. Flags are visible on the student profile and stay in this browser."),
      ...reviews));
}

render();
