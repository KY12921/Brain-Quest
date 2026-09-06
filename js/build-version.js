// ------------------------------------------------------------------
// version5 — Build version stamp.
//
// Exists to solve one specific, recurring problem: it was previously
// impossible to tell, just by looking at the running app, whether it
// was actually running the code just delivered or a stale build from
// an earlier download/deploy. This makes that checkable in seconds —
// shown on the sign-in screen (visible before logging in at all) and
// again in Settings.
//
// PROCESS: bump APP_BUILD every time a new build is delivered, and
// state the new number explicitly in the message that delivers it
// (e.g. "this is build 3"). The person can then open their live site,
// look at this number, and know with certainty whether they're
// looking at that build or something older — no guessing from
// filenames, download timestamps, or memory of what was said when.
// ------------------------------------------------------------------

const APP_BUILD = "4 — 2026-09-06";

function renderBuildVersionStamp() {
  const text = `Build ${APP_BUILD}`;
  const stamp1 = document.getElementById("build-version-stamp");
  const stamp2 = document.getElementById("build-version-stamp-settings");
  if (stamp1) stamp1.textContent = text;
  if (stamp2) stamp2.textContent = text;
}
renderBuildVersionStamp();
