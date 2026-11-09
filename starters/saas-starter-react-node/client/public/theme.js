// Runs before the app renders so the page never flashes the wrong theme.
(function () {
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch { /* storage blocked: follow the system */ }
  var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
})();
