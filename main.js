/* ═══════════════════════════════════════════
   ImpresiveMC — NEURAL//GRID
   main.js — All site logic
   ═══════════════════════════════════════════ */

'use strict';

// ── State ────────────────────────────────────
let activeTrack  = 0;
let isPlaying    = false;
let progress     = 0;
let elapsed      = 0;
let playInterval = null;
let vizMode      = 'bars';
let vizRunning   = false;
let audioEl      = null;
let usingRealAudio = false;

// Visualizer data
let vizData   = new Array(80).fill(0);
let peakData  = new Array(80).fill(0);
let peakHold  = new Array(80).fill(0);
let scopeData = new Array(200).fill(0.5);

// ── VHS INTRO ───────────────────────────────
(function initIntro() {
  const canvas = document.getElementById('intro-static');
  const ctx    = canvas.getContext('2d');
  let   frame  = 0;
  let   introTimer;

  function resizeIntro() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeIntro();
  window.addEventListener('resize', resizeIntro);

  // Typewriter for VHS title
  const titleEl  = document.getElementById('vhs-title');
  const titleStr = 'IMPRESIVE_MC';
  let   charIdx  = 0;

  function typeLetter() {
    if (charIdx < titleStr.length) {
      titleEl.textContent += titleStr[charIdx++];
      setTimeout(typeLetter, 80 + Math.random() * 60);
    }
  }
  setTimeout(typeLetter, 600);

  // VHS clock counter
  let clockSec = 0;
  const clockEl = document.getElementById('vhs-clock');
  const clockInterval = setInterval(() => {
    clockSec++;
    const h = String(Math.floor(clockSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((clockSec % 3600) / 60)).padStart(2, '0');
    const s = String(clockSec % 60).padStart(2, '0');
    clockEl.textContent = `${h}:${m}:${s}`;
  }, 1000);

  // Tracking bar glitch
  const trackingEl  = document.getElementById('tracking-text');
  const trackingMsgs = ['TRACKING...', 'ADJUSTING...', 'LOCKED ✓', 'TRACKING...', 'NO SIGNAL', 'TRACKING...'];
  let   trackingIdx  = 0;
  setInterval(() => {
    trackingEl.textContent = trackingMsgs[trackingIdx % trackingMsgs.length];
    trackingIdx++;
  }, 900);

  // VHS mid bar glitch
  const midBar = document.getElementById('vhs-bar-mid');
  setInterval(() => {
    midBar.style.top       = (20 + Math.random() * 60) + '%';
    midBar.style.height    = (2 + Math.random() * 8) + 'px';
    midBar.style.opacity   = Math.random() > 0.4 ? '1' : '0';
    midBar.style.transform = `translateX(${(Math.random() - 0.5) * 20}px)`;
  }, 150);

  // Static noise on canvas
  function drawStatic() {
    const w = canvas.width, h = canvas.height;
    const imgData = ctx.createImageData(w, h);
    const data    = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 60;
      data[i] = data[i+1] = data[i+2] = v;
      data[i+3] = 180;
    }

    // Horizontal scan bands
    const bandY = (frame * 3) % h;
    for (let x = 0; x < w; x++) {
      for (let dy = 0; dy < 4; dy++) {
        const idx = ((bandY + dy) * w + x) * 4;
        data[idx] = data[idx+1] = data[idx+2] = 200;
        data[idx+3] = 60;
      }
    }

    ctx.putImageData(imgData, 0, 0);
    frame++;
    if (frame < 180) requestAnimationFrame(drawStatic);
    else {
      // Fade out canvas after ~3s
      canvas.style.transition = 'opacity 0.5s';
      canvas.style.opacity = '0';
    }
  }
  drawStatic();

  // Auto-launch site after 4.5s
  introTimer = setTimeout(launchSite, 4500);

  window._introTimer     = introTimer;
  window._clockInterval  = clockInterval;
})();

function skipIntro() {
  clearTimeout(window._introTimer);
  clearInterval(window._clockInterval);
  launchSite();
}

function launchSite() {
  const intro = document.getElementById('intro');
  const site  = document.getElementById('site');
  intro.style.transition = 'opacity 0.6s';
  intro.style.opacity    = '0';
  setTimeout(() => {
    intro.style.display = 'none';
    site.classList.remove('hidden');
    site.style.opacity = '0';
    site.style.transition = 'opacity 0.5s';
    requestAnimationFrame(() => { site.style.opacity = '1'; });

    initArtCanvas();
    buildTracklist();
    startVizLoop();
    updateAlbumMeta();
  }, 600);
}

// ── ALBUM META ───────────────────────────────
function updateAlbumMeta() {
  if (typeof ALBUM === 'undefined') return;
  // Update any elements that display album info from tracks.js
  document.querySelectorAll('.ht-album').forEach(el => {
    el.innerHTML = ALBUM.title.replace('//', '//<br>').replace('NEURAL<br>', 'NEURAL<br><em>');
  });
}

// ── ALBUM ART CANVAS ─────────────────────────
function initArtCanvas() {
  const canvas = document.getElementById('art-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 280, H = 280;
  canvas.width  = W;
  canvas.height = H;
  drawAlbumArt(ctx, W, H, false);
}

function drawAlbumArt(ctx, W, H, glitching) {
  ctx.clearRect(0, 0, W, H);

  // Background
  ctx.fillStyle = '#0d0d0b';
  ctx.fillRect(0, 0, W, H);

  // Diagonal hatch lines
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 8;
  for (let i = -H; i < W + H; i += 22) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke();
  }

  // Outer ring
  ctx.strokeStyle = 'rgba(232,255,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(W/2, H/2 - 10, 100, 0, Math.PI * 2); ctx.stroke();

  ctx.strokeStyle = 'rgba(255,61,0,0.1)';
  ctx.beginPath(); ctx.arc(W/2, H/2 - 10, 78, 0, Math.PI * 2); ctx.stroke();

  // Abstract silhouette — polygon
  ctx.strokeStyle = 'rgba(232,255,0,0.3)';
  ctx.fillStyle   = 'rgba(232,255,0,0.04)';
  ctx.lineWidth   = 1.5;
  ctx.setLineDash([5, 3]);
  ctx.beginPath();
  const pts = [
    [140, 52], [172, 88], [180, 130], [165, 168],
    [140, 180], [115, 168], [100, 130], [108, 88]
  ];
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);

  // Eyes
  ctx.fillStyle = '#e8ff00';
  ctx.fillRect(122, 112, 12, 7);
  ctx.fillRect(146, 112, 12, 7);

  // Mic
  ctx.strokeStyle = 'rgba(232,255,0,0.6)';
  ctx.lineWidth   = 1.5;
  ctx.beginPath(); ctx.arc(140, 148, 9, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(232,255,0,0.35)';
  ctx.fillRect(136, 148, 8, 14);
  ctx.strokeStyle = 'rgba(232,255,0,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(140, 162); ctx.lineTo(140, 172); ctx.stroke();

  // Glitch bars
  ctx.fillStyle = 'rgba(255,61,0,0.18)';
  ctx.fillRect(0, 58, W, 3);
  ctx.fillRect(0, 195, W * 0.7, 2);
  ctx.fillStyle = 'rgba(232,255,0,0.1)';
  ctx.fillRect(0, 215, W * 0.4, 2);

  if (glitching) {
    ctx.fillStyle = 'rgba(255,61,0,0.3)';
    ctx.fillRect(0, 80 + Math.random() * 80, W, 3 + Math.random() * 6);
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = 'rgba(0,255,200,0.15)';
    ctx.fillRect(Math.random() * 40 - 20, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  // Corner triangles
  ctx.fillStyle = 'rgba(232,255,0,0.7)';
  ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(18,0); ctx.lineTo(0,18); ctx.closePath(); ctx.fill();
  ctx.fillStyle = 'rgba(255,61,0,0.5)';
  ctx.beginPath(); ctx.moveTo(W,H); ctx.lineTo(W-18,H); ctx.lineTo(W,H-18); ctx.closePath(); ctx.fill();

  // Stamp text
  ctx.font = '8px "Space Mono", monospace';
  ctx.fillStyle = 'rgba(232,255,0,0.25)';
  ctx.letterSpacing = '3px';
  ctx.fillText('NEURAL//GRID', 16, H - 18);
  ctx.fillStyle = 'rgba(255,61,0,0.2)';
  ctx.fillText('IMPRESIVE_MC', 16, H - 8);
}

function glitchArt() {
  const canvas = document.getElementById('art-canvas');
  const ctx    = canvas.getContext('2d');
  let   count  = 0;
  const id = setInterval(() => {
    drawAlbumArt(ctx, 280, 280, true);
    if (++count > 8) { clearInterval(id); drawAlbumArt(ctx, 280, 280, false); }
  }, 60);
}

// ── TRACKLIST ────────────────────────────────
function buildTracklist() {
  const container = document.getElementById('tracklist');
  if (!container || typeof TRACKS === 'undefined') return;

  container.innerHTML = TRACKS.map((t, i) => `
    <div class="track-row ${i === activeTrack ? 'active' : ''}" onclick="playTrack(${i})" data-index="${i}">
      <div class="tr-num">
        <span class="tr-num-txt">${String(t.num).padStart(2, '0')}</span>
        <div class="tr-bars">
          <div class="tr-bar"></div>
          <div class="tr-bar"></div>
          <div class="tr-bar"></div>
        </div>
      </div>
      <div class="tr-info">
        <span class="tr-name">${t.name}</span>
        ${t.feat ? `<span class="tr-feat">${t.feat}</span>` : ''}
      </div>
      <div class="tr-right">
        ${t.tag ? `<span class="tr-badge ${t.tag}">${t.tag.toUpperCase()}</span>` : '<span></span>'}
        <span class="tr-dur">${t.dur}</span>
      </div>
    </div>
  `).join('');
}

// ── PLAYBACK ─────────────────────────────────
function playTrack(idx) {
  if (typeof TRACKS === 'undefined') return;
  activeTrack = idx;
  isPlaying   = true;
  elapsed     = 0;
  progress    = 0;

  clearInterval(playInterval);

  const t     = TRACKS[idx];
  const total = parseDur(t.dur);

  // Try real audio first
  if (t.file && t.file !== '') {
    if (!audioEl) audioEl = new Audio();
    audioEl.src = t.file;
    audioEl.volume = (document.getElementById('vol-slider')?.value || 80) / 100;
    audioEl.play().then(() => {
      usingRealAudio = true;
    }).catch(() => {
      usingRealAudio = false;
      startSimPlayback(total);
    });

    audioEl.ontimeupdate = () => {
      elapsed  = audioEl.currentTime;
      progress = elapsed / audioEl.duration;
      updatePlayerUI();
    };
    audioEl.onended = () => { isPlaying = false; updatePlayBtn(); nextTrack(); };
  } else {
    usingRealAudio = false;
    startSimPlayback(total);
  }

  updatePlayerInfo(t);
  buildTracklist();
}

function startSimPlayback(total) {
  playInterval = setInterval(() => {
    elapsed += 0.25;
    if (elapsed >= total) {
      elapsed = total; isPlaying = false;
      clearInterval(playInterval);
      updatePlayBtn();
      return;
    }
    progress = elapsed / total;
    updatePlayerUI();
  }, 250);
}

function updatePlayerInfo(t) {
  document.getElementById('player-tag').textContent  = '// NOW PLAYING';
  document.getElementById('player-name').textContent = t.name;
  document.getElementById('tot-t').textContent        = t.dur;
  document.getElementById('cur-t').textContent        = '0:00';
  document.getElementById('pp-fill').style.width      = '0%';
  document.getElementById('pp-head').style.left       = '0%';
  document.getElementById('viz-label').textContent    = `// SIGNAL ACTIVE — ${t.name}`;
  updatePlayBtn();
}

function updatePlayerUI() {
  document.getElementById('cur-t').textContent   = fmtTime(elapsed);
  const pct = (progress * 100).toFixed(2) + '%';
  document.getElementById('pp-fill').style.width = pct;
  document.getElementById('pp-head').style.left  = pct;
}

function updatePlayBtn() {
  document.getElementById('ppbtn').innerHTML = isPlaying ? '&#9646;&#9646;' : '&#9654;';
}

function togglePlay() {
  if (!isPlaying) {
    isPlaying = true;
    if (usingRealAudio && audioEl) {
      audioEl.play();
    } else {
      const total = parseDur(TRACKS[activeTrack].dur);
      startSimPlayback(total);
    }
    document.getElementById('viz-label').textContent = `// SIGNAL ACTIVE — ${TRACKS[activeTrack].name}`;
  } else {
    isPlaying = false;
    clearInterval(playInterval);
    if (usingRealAudio && audioEl) audioEl.pause();
    document.getElementById('viz-label').textContent = '// SIGNAL PAUSED';
  }
  updatePlayBtn();
}

function prevTrack() {
  playTrack((activeTrack - 1 + TRACKS.length) % TRACKS.length);
}
function nextTrack() {
  playTrack((activeTrack + 1) % TRACKS.length);
}

function scrub(e) {
  const bar   = document.getElementById('progress-bar');
  const rect  = bar.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const total = parseDur(TRACKS[activeTrack].dur);
  elapsed     = ratio * total;
  progress    = ratio;
  if (usingRealAudio && audioEl) audioEl.currentTime = elapsed;
  updatePlayerUI();
}

function setVol(v) {
  document.getElementById('vol-val').textContent = v;
  if (audioEl) audioEl.volume = v / 100;
}

// ── VISUALIZER ───────────────────────────────
function setVizMode(mode, btn) {
  vizMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function startVizLoop() {
  if (vizRunning) return;
  vizRunning = true;
  const canvas = document.getElementById('viz-canvas');
  const ctx    = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight || 140;
  }
  resize();
  window.addEventListener('resize', resize);

  let t = 0;
  function frame() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    t += 0.016;

    if (isPlaying) {
      // Generate organic spectrum
      for (let i = 0; i < vizData.length; i++) {
        const f    = i / vizData.length;
        const bass = Math.pow(1 - f, 2.2) * 0.55;
        const w1   = Math.sin(t * 3.1 + i * 0.32) * 0.28;
        const w2   = Math.sin(t * 6.7 + i * 0.51) * 0.18;
        const w3   = Math.cos(t * 2.4 + i * 0.17) * 0.22;
        const kick = Math.random() < 0.04 ? Math.random() * 0.45 : 0;
        const target = Math.max(0, Math.min(1, bass + w1 + w2 + w3 + kick + 0.06));
        vizData[i] += (target - vizData[i]) * 0.22;

        if (vizData[i] > peakData[i]) {
          peakData[i] = vizData[i];
          peakHold[i] = 55;
        } else {
          peakHold[i]--;
          if (peakHold[i] < 0) peakData[i] = Math.max(0, peakData[i] - 0.007);
        }
      }
      // Scope data
      for (let i = 0; i < scopeData.length - 1; i++) scopeData[i] = scopeData[i + 1];
      scopeData[scopeData.length - 1] = 0.5 + (Math.sin(t * 12) * 0.3 + Math.sin(t * 19) * 0.15 + (Math.random() - 0.5) * 0.05);
    } else {
      for (let i = 0; i < vizData.length; i++) {
        vizData[i]  *= 0.88;
        peakData[i] *= 0.96;
      }
    }

    if (vizMode === 'bars') drawBars(ctx, W, H);
    else if (vizMode === 'scope') drawScope(ctx, W, H);
    else if (vizMode === 'dots')  drawDots(ctx, W, H);

    // Scanlines
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);

    requestAnimationFrame(frame);
  }
  frame();
}

function drawBars(ctx, W, H) {
  const n   = vizData.length;
  const bw  = W / n;

  for (let i = 0; i < n; i++) {
    const h   = Math.max(2, vizData[i] * H);
    const x   = i * bw;
    const v   = vizData[i];

    // Color gradient: yellow → orange → red
    if (v > 0.78) {
      ctx.fillStyle = `rgba(255,61,0,${0.7 + v * 0.3})`;
    } else if (v > 0.52) {
      ctx.fillStyle = `rgba(255,140,0,${0.7 + v * 0.25})`;
    } else {
      ctx.fillStyle = `rgba(232,255,0,${0.55 + v * 0.35})`;
    }
    ctx.fillRect(x, H - h, bw - 1, h);

    // Peak hold line
    if (peakData[i] > 0.02) {
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillRect(x, H - peakData[i] * H - 1, bw - 1, 2);
    }
  }
}

function drawScope(ctx, W, H) {
  ctx.strokeStyle = '#e8ff00';
  ctx.lineWidth   = 1.5;
  ctx.shadowColor = '#e8ff00';
  ctx.shadowBlur  = 6;
  ctx.beginPath();
  for (let i = 0; i < scopeData.length; i++) {
    const x = (i / scopeData.length) * W;
    const y = scopeData[i] * H;
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Center line
  ctx.strokeStyle = 'rgba(232,255,0,0.12)';
  ctx.lineWidth   = 1;
  ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();
}

function drawDots(ctx, W, H) {
  const n = vizData.length;
  const bw = W / n;
  for (let i = 0; i < n; i++) {
    const h = vizData[i] * H;
    const x = i * bw + bw / 2;
    const r = Math.max(1.5, vizData[i] * 6);
    const v = vizData[i];
    ctx.fillStyle = v > 0.7
      ? `rgba(255,61,0,${0.6 + v * 0.4})`
      : `rgba(232,255,0,${0.4 + v * 0.5})`;
    ctx.beginPath(); ctx.arc(x, H - h, r, 0, Math.PI * 2); ctx.fill();
    // Stem
    ctx.strokeStyle = 'rgba(232,255,0,0.15)';
    ctx.lineWidth   = 1;
    ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x, H - h); ctx.stroke();
  }
}

// ── HELPERS ──────────────────────────────────
function parseDur(d) {
  const [m, s] = d.split(':').map(Number);
  return m * 60 + s;
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

// ── NAV SCROLL HIGHLIGHT ─────────────────────
window.addEventListener('scroll', () => {
  const nav = document.getElementById('nav');
  if (window.scrollY > 60) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
});

// ── SMOOTH ANCHOR SCROLL ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const el = document.querySelector(a.getAttribute('href'));
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });
});
