"use strict";

const main = document.querySelector("main");
const navigation = document.querySelector("#navigation");
const menu = document.querySelector(".menu-button");
const categoryById = new Map(categories.map(category => [category.id, category]));
const idPattern = /^[a-z0-9-]+$/;
const clubById = new Map();
let clubs = [];
let eventRecords = [];
const eastern = "America/New_York";
const dayFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: eastern, weekday: "short", month: "short", day: "numeric", year: "numeric"
});
const clockFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: eastern, hour: "numeric", minute: "2-digit", timeZoneName: "short"
});
function loadRecords() {
  const state = readDemo();
  clubById.clear();
  for (const club of withEdits(organizations, state.clubs)) {
    if (idPattern.test(club.id) && club.name && club.description && categoryById.has(club.category)) {
      clubById.set(club.id, club);
    }
  }
  clubs = [...clubById.values()];
  eventRecords = withEdits(events, state.events)
  .filter(event => event.id && event.title && event.eventType && clubById.has(event.organizationId) &&
    /T\d\d:\d\d(?::\d\d)?(?:[+-]\d\d:\d\d|Z)$/.test(event.startsAt))
  .map(event => ({ ...event, timestamp: Date.parse(event.startsAt) }))
  .filter(event => Number.isFinite(event.timestamp))
  .sort((first, second) => first.timestamp - second.timestamp);
}

function element(tag, className = "", ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.append(...children);
  return node;
}

function link(label, href, style = "") {
  const anchor = element("a", style, label);
  anchor.href = href;
  return anchor;
}

function external(label, url, style = "") {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    const anchor = link(label + " ↗", parsed.href, style);
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    return anchor;
  } catch {
    return null;
  }
}

const iconPaths = {
  book: "M3 5c4-1 7 0 9 2 2-2 5-3 9-2v13c-4-1-7 0-9 2-2-2-5-3-9-2z M12 7v13",
  music: "M9 18V6l11-3v12 M9 10l11-3 M9 18c0 3-6 4-6 1 0-3 6-4 6-1z M20 15c0 3-6 4-6 1 0-3 6-4 6-1z",
  heart: "M12 20 4 12C-2 6 7 0 12 7c5-7 14-1 8 5z",
  people: "M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M5 20v-2a7 7 0 0 1 14 0v2 M3 12a3 3 0 0 0 0-6 M21 12a3 3 0 0 0 0-6",
  mountain: "M2 20 9 7l4 7 3-5 6 11z M6.5 12l2.5 2 2.5-2",
  ball: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z M4 8l8 4 1-9 M12 12l7 6 M7 19l2-8 M16 4l-1 10 M5 15l14-5",
  spark: "M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z",
  play: "M8 5l11 7-11 7z"
};

function icon(name) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(ns, "path");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}

function heading(title, description, label = "") {
  const box = element("div", "wrap page-heading");
  if (label) box.append(element("p", "eyebrow", label));
  box.append(element("h1", "", title), element("p", "lede", description));
  return box;
}

function section(title, description, content, extraClass = "") {
  const header = element("div", "section-head", element("h2", "", title));
  if (description) header.append(element("p", "", description));
  return element("section", "section " + extraClass, element("div", "wrap", header, content));
}

function clubHref(club) {
  return "#club/" + club.id;
}

function clubImage(club) {
  const box = element("div", "club-image");
  const fallback = icon(categoryById.get(club.category).icon);
  box.append(fallback);
  if (club.image && /^assets\/images\/[\w.-]+$/.test(club.image)) {
    const picture = element("img");
    picture.alt = club.imageAlt || "";
    picture.loading = "lazy";
    picture.addEventListener("error", () => picture.remove(), { once: true });
    picture.src = club.image;
    box.append(picture);
  }
  return box;
}

function clubCard(club, action = "View Profile") {
  const badges = element("div", "badges", element("span", "badge", categoryById.get(club.category).name));
  if (club.isDemo) badges.append(element("span", "badge demo", "Sample"));
  const profileLink = link(action + " →", clubHref(club), "card-link");
  profileLink.setAttribute("aria-label", action + " for " + club.name);
  return element("article", "club-card", clubImage(club), element("div", "card-body",
    badges, element("h3", "", club.name), element("p", "", club.description), profileLink));
}

function upcoming() {
  return eventRecords.filter(event => (Date.parse(event.endsAt) || event.timestamp) >= Date.now());
}

function eventCard(event, afterChange) {
  const club = clubById.get(event.organizationId);
  const time = element("time", "event-date", dayFormat.format(event.timestamp));
  time.dateTime = event.startsAt;
  const details = element("div", "event-body",
    element("div", "badges", element("span", "badge", event.eventType)),
    element("h3", "", event.title), link(club.name, clubHref(club), "text-link"),
    element("p", "event-meta", clockFormat.format(event.timestamp) + " · " + (event.location || "Location pending")),
    element("p", "", event.description || "Details pending."));
  if (event.isDemo) details.firstElementChild.append(element("span", "badge demo", "Demo event"));
  const registration = external("Event information", event.registrationUrl, "text-link");
  if (registration) details.append(registration);
  details.append(favoriteButton("event", event, afterChange));
  return element("article", "event-card", time, details);
}

function showHome() {
  const heroImage = element("div", "hero-image");
  const picture = element("img");
  picture.alt = "Illustrative campus scene with students gathering outside";
  picture.src = "assets/images/campus.jpg";
  picture.addEventListener("error", () => picture.remove(), { once: true });
  heroImage.append(picture);
  const hero = element("section", "hero",
    element("div", "wrap hero-inner",
      element("div", "hero-copy",
        element("p", "eyebrow", "A virtual student organization fair"),
        element("h1", "", "Find your people", element("br"), element("em", "", "at JMU.")),
        element("p", "lede", "Discover clubs, organizations, and campus activities that make James Madison University feel like home."),
        element("div", "actions",
          link("Explore Organizations →", "#clubs", "button gold"),
          link("View Upcoming Events", "#events", "button ghost"))),
      heroImage));

  const tiles = categories.map(category => {
    const tile = link("", "#clubs?category=" + category.id, "category-tile");
    const arrow = element("span", "tile-arrow", "↗");
    arrow.setAttribute("aria-hidden", "true");
    tile.append(element("span", "tile-icon", icon(category.icon)), element("span", "", category.name), arrow);
    return tile;
  });
  const featured = clubs.filter(club => club.featured);
  const previews = upcoming().slice(0, 2);
  main.append(hero,
    section("Explore by interest", "Start with something you love or try something new.",
      element("div", "category-grid", ...tiles)),
    section("Featured organizations", "Get to know a few of the sample groups in the directory.",
      element("div", "club-grid", ...featured.map(club => clubCard(club, "View Organization"))), "tinted"),
    section("Upcoming opportunities", "",
      element("div", "event-list", ...(previews.length ? previews.map(event => eventCard(event)) : [empty("No upcoming events are listed.")]),
        element("div", "actions", link("See all events →", "#events", "button primary")))),
    section("Make campus feel like home", "Start with one conversation, one meeting, or one new interest.",
      link("Browse organizations →", "#clubs", "button primary"), "closing"));
}

function empty(message) {
  return element("p", "empty", message);
}

function controls(id, text, input) {
  const label = element("label", "", text);
  label.htmlFor = id;
  input.id = id;
  return element("div", "field", label, input);
}

function selectOptions(options, initial) {
  const select = element("select");
  for (const option of options) {
    const item = element("option", "", option.name);
    item.value = option.id;
    select.append(item);
  }
  select.value = initial;
  return select;
}

function showClubs(params) {
  const search = element("input");
  search.type = "search";
  search.placeholder = "Search organizations, interests, or activities...";
  search.value = params.get("q") || "";
  const initial = params.get("category");
  const category = selectOptions([{ id: "", name: "All Organizations" }, ...categories],
    categoryById.has(initial) ? initial : "");
  const reset = element("button", "button secondary", "Reset filters");
  reset.type = "button";
  const count = element("p", "result-count");
  count.setAttribute("role", "status");
  const grid = element("div", "club-grid");
  grid.setAttribute("aria-label", "Organization results");

  function update(sync = true) {
    const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const results = clubs.filter(club => {
      const haystack = [club.name, club.description, club.mission,
        categoryById.get(club.category).name, ...(club.interests || [])].join(" ").toLowerCase();
      return (!category.value || club.category === category.value) &&
        words.every(word => haystack.includes(word));
    });
    count.textContent = results.length + (results.length === 1 ? " organization" : " organizations");
    grid.replaceChildren(...(results.length ? results.map(club => clubCard(club)) :
      [empty("No organizations match your search. Try another keyword or reset the filters.")]));
    if (sync) {
      const query = new URLSearchParams();
      if (category.value) query.set("category", category.value);
      if (search.value.trim()) query.set("q", search.value);
      try {
        history.replaceState(null, "", "#clubs" + (query.size ? "?" + query.toString() : ""));
      } catch {
        // Some local-file browsers restrict History API writes.
      }
    }
  }

  search.addEventListener("input", () => update());
  category.addEventListener("change", () => update());
  reset.addEventListener("click", () => {
    search.value = "";
    category.value = "";
    update();
    search.focus();
  });
  main.append(heading("Explore JMU Organizations", "Find clubs, communities, and campus activities that match your interests."),
    element("div", "wrap listing",
      element("div", "filter-bar", controls("club-search", "Search organizations", search),
        controls("club-category", "Category", category), reset), count, grid));
  update(false);
}

function showProfile(club) {
  const category = categoryById.get(club.category);
  const flag = readDemo().flags[club.id];
  const badgeRow = element("div", "badges", element("span", "badge", category.name));
  if (club.isDemo) badgeRow.append(element("span", "badge demo", "Sample profile"));
  badgeRow.append(element("span", "badge", club.recruitmentStatus || "Recruitment information pending"));
  const intro = element("div", "profile-copy", badgeRow, element("h1", "", club.name),
    element("p", "lede", club.mission || club.description));
  const actions = element("div", "actions", favoriteButton("club", club));
  if (/^[\w.+-]+@[\w.-]+\.[a-z]{2,}$/i.test(club.contactEmail || "")) {
    actions.append(link("Contact Organization", "mailto:" + club.contactEmail, "button secondary"));
  } else {
    const contact = external("Contact Organization", club.contactUrl, "button secondary");
    if (contact) actions.append(contact);
  }
  const listing = external("Visit Official Listing", club.officialUrl, "button secondary");
  if (listing) actions.append(listing);
  const registration = external("Registration information", club.registrationUrl, "button secondary");
  if (registration) actions.append(registration);
  intro.append(actions);
  if (flag) intro.append(element("p", "profile-flag", "Listing flagged for review. " + flag.note));

  const video = element("div", "video");
  if (/^[\w-]{11}$/.test(club.videoId || "")) {
    const player = element("iframe");
    player.title = club.name + " introduction video";
    player.src = "https://www.youtube-nocookie.com/embed/" + club.videoId + "?cc_load_policy=1";
    player.referrerPolicy = "strict-origin-when-cross-origin";
    player.allowFullscreen = true;
    player.loading = "lazy";
    video.append(player);
  } else {
    video.append(element("span", "play-icon", icon("play")), element("p", "", "Introduction video coming soon."));
  }
  const facts = element("dl", "facts");
  const deadline = Date.parse(club.deadlineAt);
  for (const [label, value] of [
    ["Membership requirements", club.requirements],
    ["Meeting schedule", club.meetingSchedule],
    ["Location", club.meetingLocation],
    ["Time commitment", club.commitment],
    ["Recruitment", club.recruitment],
    ["Application deadline", Number.isFinite(deadline)
      ? dayFormat.format(deadline) + " · " + clockFormat.format(deadline) + (deadline < Date.now() ? " (passed)" : "") : ""],
    ["Leadership contact", club.contactName],
    ["Contact", club.contactEmail || (club.contactUrl ? "Use the contact link above." : "")],
    ["Official listing", listing ? "Use the official listing link above." : ""]
  ]) {
    facts.append(element("div", "", element("dt", "", label), element("dd", "", value || "Information pending")));
  }
  const related = upcoming().filter(event => event.organizationId === club.id);
  const videoPanel = element("section", "panel", element("h2", "", club.videoTitle || "Introduction video"), video);
  if (/^[\w-]{11}$/.test(club.videoId || "")) {
    videoPanel.append(external("Watch on YouTube", "https://www.youtube.com/watch?v=" + club.videoId, "text-link"));
  }
  if (club.videoTranscript) {
    const transcript = element("details", "transcript", element("summary", "", "Read the transcript"),
      element("p", "", club.videoTranscript));
    videoPanel.append(transcript);
  }
  main.append(element("div", "wrap profile",
    link("← Explore Clubs", "#clubs?category=" + club.category, "back-link"),
    element("div", "profile-hero", intro, clubImage(club)),
    element("div", "profile-grid",
      element("div", "profile-stack",
        element("section", "panel", element("h2", "", "About"), element("p", "", club.about || club.description)),
        videoPanel),
      element("section", "panel", element("h2", "", "Organization details"), facts)),
    element("section", "profile-events", element("h2", "", "Upcoming open events"),
      element("div", "event-list", ...(related.length ? related.map(event => eventCard(event)) : [empty("No upcoming open events are listed.")])))));
}

function showEvents() {
  const records = upcoming();
  const types = [...new Set(records.map(event => event.eventType))].sort();
  const hosts = [...new Set(records.map(event => event.organizationId))]
    .map(id => clubById.get(id)).sort((first, second) => first.name.localeCompare(second.name));
  const type = selectOptions([{ id: "", name: "All event types" }, ...types.map(name => ({ id: name, name }))], "");
  const host = selectOptions([{ id: "", name: "All organizations" }, ...hosts], "");
  const results = element("div", "event-list");
  const count = element("p", "result-count");
  count.setAttribute("role", "status");
  function update() {
    const filtered = upcoming().filter(event =>
      (!type.value || type.value === event.eventType) && (!host.value || host.value === event.organizationId));
    count.textContent = filtered.length + (filtered.length === 1 ? " upcoming event" : " upcoming events");
    results.replaceChildren(...(filtered.length ? filtered.map(event => eventCard(event)) :
      [empty("No upcoming events match these filters.")]));
  }
  type.addEventListener("change", update);
  host.addEventListener("change", update);
  main.append(heading("Upcoming Events & Opportunities",
    "Discover what's happening around campus and find your next opportunity to get involved."),
    element("div", "wrap listing",
      element("p", "notice", "Demo events are fictional and do not represent scheduled JMU activities. Times are Eastern."),
      element("div", "filter-bar event-filters", controls("event-type", "Event type", type),
        controls("event-host", "Organization", host)), count, results));
  update();
}

function closeMenu() {
  menu.setAttribute("aria-expanded", "false");
}

menu.addEventListener("click", () => {
  menu.setAttribute("aria-expanded", String(menu.getAttribute("aria-expanded") === "false"));
});
navigation.addEventListener("click", closeMenu);
document.querySelector(".site-header").addEventListener("keydown", event => {
  if (event.key === "Escape" && menu.getAttribute("aria-expanded") === "true") {
    closeMenu();
    menu.focus();
  }
});
document.querySelector(".skip").addEventListener("click", event => {
  event.preventDefault();
  main.focus();
  main.scrollIntoView();
});

function render(moveFocus = false, message = "") {
  loadRecords();
  const [route, query] = (location.hash.slice(1) || "home").split("?");
  const club = route.startsWith("club/") ? clubById.get(route.slice(5)) : null;
  const active = club ? "clubs" : route === "review" ? "studio" : route;
  const routes = { home: "", clubs: "Explore Clubs", events: "Upcoming Events",
    favorites: "Favorites", studio: "Leader Workspace", review: "Admin Review" };
  const title = club?.name || (Object.hasOwn(routes, route) ? routes[route] : "");
  document.title = title ? title + " | Meet the Dukes" : "Meet the Dukes";
  for (const item of navigation.querySelectorAll("a")) {
    if (item.hash === "#" + active) item.setAttribute("aria-current", club ? "location" : "page");
    else item.removeAttribute("aria-current");
  }
  closeMenu();
  main.replaceChildren();
  if (route === "home") showHome();
  else if (route === "clubs") showClubs(new URLSearchParams(query));
  else if (route === "events") showEvents();
  else if (route === "favorites") showFavorites();
  else if (route === "studio") showStudio(new URLSearchParams(query), message);
  else if (route === "review") showReview();
  else if (club) showProfile(club);
  else {
    main.append(heading("Page unavailable", "This page may have moved or the organization may no longer be listed."),
      element("div", "wrap listing", link("Explore Clubs", "#clubs", "button primary")));
  }
  if (moveFocus) {
    window.scrollTo(0, 0);
    main.focus({ preventScroll: true });
  }
}

window.addEventListener("hashchange", () => render(true));
