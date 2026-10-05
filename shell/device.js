// @ts-check

const clock = document.getElementById("clock");

function tick() {
  if (!clock) return;
  const now = new Date();
  clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
}

tick();
setInterval(tick, 10_000);
