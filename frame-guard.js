// Clickjacking guard. GitHub Pages sends no X-Frame-Options, and CSP
// frame-ancestors is ignored in a <meta> tag, so this is the only lever
// available: hide the page if framed, and try to break out.
if (window.self !== window.top) {
  document.documentElement.style.display = 'none';
  try { window.top.location = window.self.location; } catch (e) {}
}
