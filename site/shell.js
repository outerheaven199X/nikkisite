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
      <span class="muted">full-featured</span>
      <span class="about-build-link" data-tool="${route}" style="cursor: pointer; margin-left: 10px; text-decoration: underline;">(?) ABOUT THIS BUILD</span>`;
    
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
    
    // Add build info table
    const buildInfo = document.createElement("div");
    buildInfo.style.cssText = `
      margin-top: 2rem;
      border: 1px solid #000;
      background: #f9f9f9;
      padding: 1rem;
      text-align: left;
      font-size: 12px;
    `;
    
    const buildInfoContent = {
      scriptrx: {
        purpose: "Security tool command generation",
        status: "Production-ready",
        tech: "Vanilla JavaScript, Progressive UI"
      },
      omni: {
        purpose: "Environmental data monitoring", 
        status: "Production-ready",
        tech: "Vanilla JavaScript, Real-time APIs"
      },
      honey: {
        purpose: "Network honeypot monitoring",
        status: "Deployed & operational", 
        tech: "Node.js, Real attack data"
      },
      databox: {
        purpose: "AI security education",
        status: "Production-ready",
        tech: "Node.js, SQLite FTS5, LLM adapters"
      }
    };
    
    const info = buildInfoContent[route] || { purpose: "Interactive demo", status: "Active", tech: "Web technologies" };
    
    buildInfo.innerHTML = `
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="border: 1px solid #ccc; padding: 4px; font-weight: bold;">PURPOSE:</td>
          <td style="border: 1px solid #ccc; padding: 4px;">${info.purpose}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 4px; font-weight: bold;">STATUS:</td>
          <td style="border: 1px solid #ccc; padding: 4px;">${info.status}</td>
        </tr>
        <tr>
          <td style="border: 1px solid #ccc; padding: 4px; font-weight: bold;">TECH:</td>
          <td style="border: 1px solid #ccc; padding: 4px;">${info.tech}</td>
        </tr>
      </table>
    `;
    
    pane.appendChild(bar);
    pane.appendChild(description);
    pane.appendChild(buildInfo);
    
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

// About Build Popup System
function createAboutBuildPopup(toolName) {
  const popup = document.createElement("div");
  popup.id = "about-build-popup";
  popup.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;
  
  const iframe = document.createElement("iframe");
  iframe.src = `tools/about-${toolName}.html`;
  iframe.style.cssText = `
    width: 90%;
    height: 90%;
    max-width: 1000px;
    max-height: 800px;
    border: 2px solid #000;
    background: white;
  `;
  
  const closeBtn = document.createElement("button");
  closeBtn.textContent = "CLOSE";
  closeBtn.style.cssText = `
    position: absolute;
    top: 20px;
    right: 20px;
    background: #000;
    color: white;
    border: 1px solid #333;
    padding: 10px 15px;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    z-index: 10001;
  `;
  
  closeBtn.addEventListener("click", () => {
    document.body.removeChild(popup);
  });
  
  popup.addEventListener("click", (e) => {
    if (e.target === popup) {
      document.body.removeChild(popup);
    }
  });
  
  popup.appendChild(iframe);
  popup.appendChild(closeBtn);
  document.body.appendChild(popup);
}

// Events
$$(".tab").forEach(b => b.addEventListener("click", () => goto(b.dataset.route)));
window.addEventListener("hashchange", () => setActive(routeFromHash()));
window.addEventListener("DOMContentLoaded", () => setActive(routeFromHash()));

// About Build link handlers
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("about-build-link")) {
    e.preventDefault();
    const tool = e.target.dataset.tool;
    createAboutBuildPopup(tool);
  }
});

// Handle resume PDF link to bypass hash routing
document.addEventListener("click", (e) => {
  if (e.target.tagName === "A" && e.target.href && e.target.href.includes("NIKKI_KAELAR_RESUME.pdf")) {
    e.preventDefault();
    window.open(e.target.href, "_blank");
  }
});

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
