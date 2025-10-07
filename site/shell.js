// Minimal router + lazy project mount, no frameworks.
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

// All projects load interactive web interfaces
const PROJECTS = {
  scriptrx:   { title: "SCRIPTRX",   type: "redirect", src: "tools/scriptrx.html" },
  omni:       { title: "OMNI",       type: "redirect", src: "tools/omni.html" },
  honey:      { title: "HONEY",      type: "redirect", src: "tools/honey.html" },
  databox:    { title: "DATABOX",    type: "redirect", src: "tools/databox.html" },
};

function setActive(route) {
  // Tabs
  $$(".tab").forEach(b => b.setAttribute("aria-selected", String(b.dataset.route === route)));
  // Panes
  $$(".pane").forEach(p => p.hidden = (p.dataset.pane !== route));
  $("#path").textContent = `tab: ${route}`;
  const crumb = $("#crumb");            // CURSOR: make breadcrumb optional
  if (crumb) crumb.textContent = route; // CURSOR: avoid null deref that breaks routing
  // Lazy mount if needed
  if (PROJECTS[route]) mountProject(route);
}

async function mountProject(route) {
  const cfg = PROJECTS[route];
  const pane = $(`#pane-${route}`);
  if (!pane || pane.dataset.mounted === "1") return;
  
  if (cfg.type === "redirect") {
    // For interactive tools, redirect to dedicated pages
    const bar = document.createElement("div");
    bar.className = "row";
    bar.style.marginBottom = "8px";
    bar.innerHTML = `<span class="pill">${cfg.title}</span>
      <a class="btn" href="${cfg.src}" target="_blank" rel="noopener">↗ open interactive demo</a>
      <span class="muted">full-featured</span>`;
    
    const description = document.createElement("div");
    description.style.padding = "2rem";
    description.style.textAlign = "center";
    description.innerHTML = `
      <h3>Interactive ${cfg.title} Demo</h3>
      <p>This tool provides a full interactive experience with real functionality.</p>
      <p>Click the button above to open the demo in a new window.</p>
      <br>
      <a href="${cfg.src}" class="btn" style="padding: 1rem 2rem; font-size: 1.1rem;">Launch ${cfg.title} →</a>
    `;
    
    pane.appendChild(bar);
    pane.appendChild(description);
    
  } else if (cfg.type === "iframe") {
    const wrap = document.createElement("div");
    wrap.className = "iframe-wrap";
    wrap.style.width = "100%";
    wrap.style.height = "600px";
    wrap.style.border = "1px solid #ccc";
    const f = document.createElement("iframe");
    f.loading = "lazy";
    f.referrerPolicy = "no-referrer";
    f.src = cfg.src;
    f.style.width = "100%";
    f.style.height = "100%";
    f.style.border = "none";
    wrap.appendChild(f);
    const bar = document.createElement("div");
    bar.className = "row";
    bar.style.marginBottom = "8px";
    bar.innerHTML = `<span class="pill">${cfg.title}</span>
      <a class="btn" href="${cfg.src}" target="_blank" rel="noopener">↗ open in new window</a>
      <span class="muted">sandboxed</span>`;
    pane.appendChild(bar);
    pane.appendChild(wrap);
  } else if (cfg.type === "readme") {
    const pre = document.createElement("pre");
    pre.textContent = "Loading README…";
    pane.appendChild(pre);
    try {
      const res = await fetch(cfg.readme);
      pre.textContent = await res.text();
    } catch {
      pre.textContent = "README not found. This project likely requires a server/runtime.";
    }
  }
  pane.dataset.mounted = "1";
}

function goto(route) {
  window.location.hash = `#/${route}`;
}
function routeFromHash() {
  const m = location.hash.match(/^#\/([a-z0-9\-]+)$/i);
  return (m && m[1]) || "about";
}

// EASTER EGG: Frontend security monitoring
function detectInjectionAttempt(input) {
  const injectionPatterns = [
    /<script/i, /javascript:/i, /on\w+\s*=/i, /eval\(/i, /function\(/i,
    /union\s+select/i, /drop\s+table/i, /insert\s+into/i, /delete\s+from/i,
    /\.\.\//, /\.\.\\/, /etc\/passwd/i, /proc\/self/i, /bin\/sh/i,
    /burp/i, /sqlmap/i, /nmap/i, /metasploit/i, /payload/i,
    /ignore\s+previous\s+instructions/i, /jailbreak/i, /developer\s+mode/i
  ];
  
  return injectionPatterns.some(pattern => pattern.test(input));
}

// Monitor all form inputs for injection attempts
document.addEventListener('input', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    if (detectInjectionAttempt(e.target.value)) {
      console.log('🚨 Frontend injection attempt detected!');
      alert('I SEE YOU 👁️\n\nNice try, but the webmaster is watching. This site is hardened against injection attacks.\n\nAll attempts are logged and monitored.');
      e.target.value = ''; // Clear the malicious input
    }
  }
});

// Events
$$(".tab").forEach(b => b.addEventListener("click", () => goto(b.dataset.route)));
window.addEventListener("hashchange", () => setActive(routeFromHash()));
window.addEventListener("DOMContentLoaded", () => setActive(routeFromHash()));

// Keyboard: Ctrl/⌘ + 1..6
window.addEventListener("keydown", (e) => {
  const ix = Number(e.key) - 1;
  const routes = ["about","databox","omni","honey","scriptrx","help"];
  if ((e.ctrlKey || e.metaKey) && ix >= 0 && ix < routes.length) {
    e.preventDefault();
    goto(routes[ix]);
  }
  if (e.key === "?") { e.preventDefault(); goto("help"); }
});

// --- Hero boot: load config + type/erase cycle ---
(async function bootHero(){
  try {
    const res = await fetch("hero.config.json");
    const cfg = await res.json();
    const title = document.getElementById("hero-title");
    const out = document.getElementById("hero-typed");
    if (title && cfg.title) title.textContent = cfg.title;
    const list = Array.isArray(cfg.descriptors) ? cfg.descriptors : [];
    const anim = Object.assign({
      loop: true, pauseAfterMs: 1500, typeMinMs: 25, typeMaxMs: 60, eraseMs: 18, cursor: "▊", flickerOnSwap: true
    }, cfg.animation || {});
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!out || list.length === 0) return;
    // Respect reduced motion: show first descriptor, no animation.
    if (reduced && cfg.accessibility && cfg.accessibility.reducedMotion === "respect") {
      out.textContent = list[0];
      return;
    }
    // Typewriter with 1.5s break between lines (from config).
    let i = 0;
    async function typeLine(s){
      out.textContent = "";
      for (const ch of s) {
        out.textContent += ch;
        await new Promise(r => setTimeout(r, rand(anim.typeMinMs, anim.typeMaxMs)));
      }
      await pause(anim.pauseAfterMs);
      await eraseLine();
    }
    async function eraseLine(){
      while (out.textContent.length) {
        out.textContent = out.textContent.slice(0, -1);
        await pause(anim.eraseMs);
      }
      if (anim.flickerOnSwap && out.parentElement) { out.parentElement.classList.add("flicker"); setTimeout(()=>out.parentElement.classList.remove("flicker"), 90); }  // CURSOR: valid JS; no ellipsis
    }
    function rand(a,b){ return Math.floor(Math.random()*(b-a+1))+a; }
    function pause(ms){ return new Promise(r=>setTimeout(r, ms)); }
    while (true) {
      await typeLine(list[i % list.length]);
      i++;
      if (!anim.loop && i >= list.length) break;
    }
  } catch { /* no-op */ }
})();
