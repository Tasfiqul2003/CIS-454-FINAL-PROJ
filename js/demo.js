"use strict";

const demoKey = "meet-the-dukes.demo-v1";
const emptyState = () => ({ clubs: {}, events: {}, flags: {}, favorites: { club: [], event: [] } });

function readDemo() {
  try {
    const stored = JSON.parse(localStorage.getItem(demoKey));
    if (stored) return stored;
    const initial = emptyState();
    const oldSaves = JSON.parse(localStorage.getItem("meet-the-dukes.saved-organizations"));
    if (Array.isArray(oldSaves)) initial.favorites.club = oldSaves;
    return initial;
  } catch {
    return emptyState();
  }
}

function updateDemo(update) {
  const state = readDemo();
  update(state);
  localStorage.setItem(demoKey, JSON.stringify(state));
}

function withEdits(seed, edits) {
  return [...new Map([...seed, ...Object.values(edits)].map(record => [record.id, record])).values()];
}
