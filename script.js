// Valentine Proposal (Saiful -> Anika)
// Keep index.html/style.css unchanged. This script uses canvas id="c".
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  canvas.style.width = innerWidth + "px";
  canvas.style.height = innerHeight + "px";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", resize);
resize();

// Names updated
const FROM = "Saiful";
const TO = "Anika";

// Layout helpers
const girlX = () => Math.min(innerWidth - 210, Math.max(260, innerWidth * 0.66));
const groundY = () => Math.min(innerHeight - 70, innerHeight * 0.74);

// Scene state machine
const Scene = {
  WALK: 0,
  GIRL_HIDE: 1,
  CLOSE_EYES: 2,
  REVEAL: 3,
  KNEEL: 4,
  QUESTION: 5,
  WAIT_YES: 6,
  YES: 7,
  DANCE: 8,
};
let scene = Scene.WALK;
let t = 0;

// Character animation values
let boyX = -60;
let walkPhase = 0;
let blush = 0;
let armReach = 0;
let reveal = 0;
let kneel = 0;
let heartPulse = 1.0;

// UI button hitbox (canvas button)
let yesBtn = { x: 0, y: 0, w: 0, h: 0, visible: false };

// Camera shake for celebration
let shake = 0;

// Particles
const floatHearts = Array.from({ length: 26 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  s: 6 + Math.random() * 10,
  sp: 0.5 + Math.random() * 1.3,
}));

const sparkles = [];
const confetti = [];
const fireworks = [];
const clickHearts = [];
const fireflies = Array.from({ length: 28 }, () => ({
  x: Math.random() * innerWidth,
  y: Math.random() * innerHeight,
  r: 1 + Math.random() * 2.2,
  a: Math.random() * Math.PI * 2,
  sp: 0.007 + Math.random() * 0.012,
}));

// Click/tap hearts + YES button click
addEventListener("pointerdown", (e) => {
  const mx = e.clientX, my = e.clientY;

  if (yesBtn.visible) {
    if (mx >= yesBtn.x && mx <= yesBtn.x + yesBtn.w && my >= yesBtn.y && my <= yesBtn.y + yesBtn.h) {
      scene = Scene.YES;
      t = 0;
      shake = 8;
      yesBtn.visible = false;
      return;
    }
  }

  spawnClickHearts(mx, my);
});

function spawnClickHearts(x, y) {
  for (let i = 0; i < 12; i++) {
    clickHearts.push({
      x, y,
      vx: (Math.random() * 2 - 1) * 2.4,
      vy: -(1.8 + Math.random() * 3.6),
      life: 1,
      s: 8 + Math.random() * 9,
    });
  }
}

// Helpers
function roundRect(x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function wrapText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    if (ctx.measureText(testLine).width > maxWidth && i > 0) {
      ctx.fillText(line, x, y);
      line = words[i] + " ";
      y += lineHeight;
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, y);
}

function speechBubble(x, y, text) {
  ctx.save();

  ctx.fillStyle = "rgba(255,255,255,0.97)";
  roundRect(x, y, 300, 62, 18);
  ctx.fill();
  ctx.strokeStyle = "rgba(230,40,100,0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "rgb(230,40,100)";
  ctx.font = "700 16px Georgia, serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  wrapText(text, x + 16, y + 16, 268, 18);

  ctx.restore();
}

function miniHeart(x, y, s) {
  ctx.beginPath();
  ctx.ellipse(x - s * 0.5, y - s * 0.25, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
  ctx.ellipse(x + s * 0.5, y - s * 0.25, s * 0.5, s * 0.5, 0, 0, Math.PI * 2);
  ctx.moveTo(x - s, y);
  ctx.lineTo(x + s, y);
  ctx.lineTo(x, y + s * 1.25);
  ctx.closePath();
  ctx.fill();
}

function sparkleBurst(x, y, n = 30) {
  for (let i = 0; i < n; i++) {
    sparkles.push({
      x, y,
      vx: (Math.random() * 2 - 1) * 2.8,
      vy: (Math.random() * 2 - 1) * 2.8,
      life: 1,
      hue: 40 + Math.random() * 120,
    });
  }
}

function addConfetti() {
  const colors = ["#ff69b4", "#ffd700", "#00e5ff", "#ffa726", "#ffffff", "#b388ff"];
  confetti.push({
    x: Math.random() * innerWidth,
    y: -10,
    c: colors[(Math.random() * colors.length) | 0],
    s: 2 + Math.random() * 4,
    a: Math.random() * Math.PI * 2,
  });
}

function launchFirework() {
  fireworks.push({
    x: Math.random() * innerWidth,
    y: innerHeight + 10,
    vx: (Math.random() * 2 - 1) * 0.9,
    vy: -(7 + Math.random() * 3),
    boom: false,
    p: [],
    hue: Math.random() * 360,
  });
}

function explodeFirework(fw) {
  fw.boom = true;
  const n = 55 + ((Math.random() * 25) | 0);
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const sp = 1.8 + Math.random() * 4.2;
    fw.p.push({
      x: fw.x, y: fw.y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp,
      life: 1,
      hue: fw.hue + (Math.random() * 40 - 20),
    });
  }
  shake = 10;
}

// Bouquet
function bouquet(x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  const wiggle = Math.sin(performance.now() / 140) * 0.04;
  ctx.rotate(wiggle);
  ctx.scale(scale, scale);

  ctx.fillStyle = "rgba(255, 220, 240, 0.95)";
  ctx.beginPath();
  ctx.moveTo(-14, 18);
  ctx.lineTo(14, 18);
  ctx.lineTo(28, 52);
  ctx.lineTo(-28, 52);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgba(230,40,100,0.92)";
  ctx.beginPath();
  ctx.ellipse(0, 36, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(34, 139, 34, 0.95)";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 5, 18);
    ctx.lineTo(i * 6, -8);
    ctx.stroke();
  }

  const flowers = [
    { dx: -16, dy: -18, c1: "#ff4f9a", c2: "#b0002a" },
    { dx: 0, dy: -26, c1: "#ff86c8", c2: "#c4004a" },
    { dx: 16, dy: -18, c1: "#ff5ab2", c2: "#9d0031" },
    { dx: -7, dy: -8, c1: "#ffd1e6", c2: "#ff3d7f" },
    { dx: 7, dy: -8, c1: "#ff9ecb", c2: "#d1004a" },
  ];

  for (const f of flowers) {
    ctx.fillStyle = f.c2;
    ctx.beginPath();
    ctx.ellipse(f.dx - 6, f.dy, 8, 10, 0.2, 0, Math.PI * 2);
    ctx.ellipse(f.dx + 6, f.dy, 8, 10, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = f.c1;
    ctx.beginPath();
    ctx.ellipse(f.dx, f.dy - 2, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.beginPath();
    ctx.ellipse(f.dx - 2, f.dy - 5, 3, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

// Simple walk-time girl (keep original)
function drawGirl(x, y) {
  const breathing = Math.sin(performance.now() / 450) * 1.5;
  const cy = y + breathing;

  if (scene >= Scene.REVEAL) {
    ctx.strokeStyle = "rgb(255,230,210)";
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(x + 10, cy - 55);
    ctx.lineTo(x - 24 * Math.min(1, reveal + 0.2), cy - 52);
    ctx.stroke();
  }

  ctx.fillStyle = "rgb(85,45,25)";
  ctx.beginPath();
  ctx.ellipse(x + 20, cy - 120, 34, 44, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgb(255,120,180)";
  ctx.beginPath();
  ctx.moveTo(x, cy - 80);
  ctx.lineTo(x + 55, cy - 80);
  ctx.lineTo(x + 70, cy);
  ctx.lineTo(x - 15, cy);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgb(255,235,215)";
  ctx.beginPath();
  ctx.ellipse(x + 25, cy - 118, 20, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  if (scene === Scene.CLOSE_EYES) {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x + 17, cy - 122, 5, 0, Math.PI);
    ctx.arc(x + 33, cy - 122, 5, 0, Math.PI);
    ctx.stroke();
  } else {
    ctx.fillStyle = "black";
    ctx.beginPath();
    ctx.ellipse(x + 17, cy - 124, 4, 6, 0, 0, Math.PI * 2);
    ctx.ellipse(x + 32, cy - 124, 4, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.ellipse(x + 18, cy - 125, 2, 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = `rgba(255,150,150,${blush})`;
  ctx.beginPath();
  ctx.ellipse(x + 12, cy - 112, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 38, cy - 112, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 14px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(TO, x + 24, cy + 30);
}

// Boy with suit (already upgraded)
function drawBoy(x, y, opts = {}) {
  const isWalk = opts.isWalk ?? (scene === Scene.WALK);
  const bob = isWalk ? Math.abs(Math.sin(walkPhase) * 8) : Math.sin(performance.now() / 450) * 1.5;
  const legSwing = isWalk ? Math.sin(walkPhase) * 16 : 0;

  const kneelDrop = 26 * kneel;
  const cy = y - bob + kneelDrop;

  ctx.strokeStyle = "rgb(25,25,35)";
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 16, cy - 10);
  ctx.lineTo(x + 16 - legSwing, y + 8);
  ctx.moveTo(x + 34, cy - 10);
  ctx.lineTo(x + 34 + legSwing, y + 8);
  ctx.stroke();

  ctx.fillStyle = "rgb(30,30,45)";
  roundRect(x + 6, cy - 78, 44, 66, 16);
  ctx.fill();

  ctx.fillStyle = "rgb(245,245,250)";
  roundRect(x + 20, cy - 74, 16, 58, 8);
  ctx.fill();

  ctx.fillStyle = "rgb(200,30,70)";
  ctx.beginPath();
  ctx.moveTo(x + 28, cy - 70);
  ctx.lineTo(x + 34, cy - 62);
  ctx.lineTo(x + 28, cy - 46);
  ctx.lineTo(x + 22, cy - 62);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgb(255,235,215)";
  ctx.beginPath();
  ctx.ellipse(x + 28, cy - 115, 20, 21, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgb(45,45,45)";
  ctx.beginPath();
  ctx.arc(x + 28, cy - 120, 22, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.ellipse(x + 20, cy - 121, 4, 6, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 35, cy - 121, 4, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = `rgba(255,150,150,${Math.min(1, blush * 0.85)})`;
  ctx.beginPath();
  ctx.ellipse(x + 16, cy - 110, 6, 4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + 40, cy - 110, 6, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const reachX = x + 52 + 32 * armReach;
  ctx.strokeStyle = "rgb(255,235,215)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x + 44, cy - 55);
  ctx.lineTo(reachX, cy - 52);
  ctx.stroke();

  if (scene <= Scene.CLOSE_EYES) bouquet(x + 64, cy - 56, 0.72);

  if (scene >= Scene.REVEAL && scene <= Scene.WAIT_YES) {
    const scale = 0.92 + 0.08 * Math.sin(performance.now() / 140) * Math.min(1, reveal);
    bouquet(reachX + 24, cy - (scene >= Scene.KNEEL ? 44 : 56), scale);
  }

  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 14px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(FROM, x + 28, cy + 30);
}

// YES button
function drawYesButton() {
  const W = innerWidth, H = innerHeight;
  const w = Math.min(340, W * 0.5);
  const h = 64;
  const x = W / 2 - w / 2;
  const y = H * 0.18;

  yesBtn = { x, y, w, h, visible: true };

  const pulse = 0.92 + 0.08 * Math.sin(performance.now() / 140);

  ctx.save();
  ctx.translate(W / 2, y + h / 2);
  ctx.scale(pulse, pulse);
  ctx.translate(-W / 2, -(y + h / 2));

  const g = ctx.createRadialGradient(W / 2, y + h / 2, 10, W / 2, y + h / 2, 140);
  g.addColorStop(0, "rgba(255, 120, 180, 0.35)");
  g.addColorStop(1, "rgba(255, 120, 180, 0)");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(W / 2, y + h / 2, 140, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(230,40,100,0.93)";
  roundRect(x, y, w, h, 20);
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "white";
  ctx.font = "900 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("YES 💖", x + w / 2, y + h / 2);

  ctx.restore();
}

// Background per scene
function drawBackground() {
  const W = innerWidth, H = innerHeight;
  const gy = groundY();

  const palettes = {
    [Scene.WALK]: ["#2b1055", "#ff9a9e"],
    [Scene.GIRL_HIDE]: ["#1e1a78", "#ff7eb3"],
    [Scene.CLOSE_EYES]: ["#0b0e1e", "#3a1c71"],
    [Scene.REVEAL]: ["#12002b", "#ff4f9a"],
    [Scene.KNEEL]: ["#1a0030", "#ff6aa2"],
    [Scene.QUESTION]: ["#0b1b3a", "#ff6f91"],
    [Scene.WAIT_YES]: ["#0b1b3a", "#ff6f91"],
    [Scene.YES]: ["#2d0b59", "#ffd700"],
    [Scene.DANCE]: ["#2a003a", "#ff1744"],
  };

  const [top, bottom] = palettes[scene] || palettes[Scene.WALK];

  const sky = ctx.createLinearGradient(0, 0, 0, gy);
  sky.addColorStop(0, top);
  sky.addColorStop(1, bottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);

  const starAlpha =
    scene === Scene.CLOSE_EYES ? 0.24 :
    scene === Scene.REVEAL ? 0.14 :
    scene >= Scene.YES ? 0.10 : 0.16;

  ctx.fillStyle = `rgba(255,255,255,${starAlpha})`;
  for (let i = 0; i < 90; i++) {
    const x = (i * 137) % W;
    const y = (i * 71) % Math.max(180, gy - 120);
    ctx.fillRect(x, y, 1, 1);
  }

  for (const f of fireflies) {
    f.a += f.sp;
    f.x += Math.cos(f.a) * 0.5;
    f.y += Math.sin(f.a * 1.2) * 0.4;

    if (f.x < -20) f.x = W + 20;
    if (f.x > W + 20) f.x = -20;
    if (f.y < -20) f.y = H + 20;
    if (f.y > H + 20) f.y = -20;

    const glow = 0.15 + 0.25 * Math.abs(Math.sin(f.a * 2));
    ctx.fillStyle = `rgba(255, 240, 180, ${glow})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
    ctx.fill();
  }

  const ground = ctx.createLinearGradient(0, gy, 0, H);
  ground.addColorStop(0, "rgba(160,70,130,0.95)");
  ground.addColorStop(1, "rgba(90,30,80,0.95)");
  ctx.fillStyle = ground;
  ctx.beginPath();
  ctx.ellipse(W / 2, gy + 90, W * 0.85, 170, 0, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------
   Ballroom upgrade helpers
--------------------------------*/
function softShadow(x, y, rx, ry, a = 0.25) {
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function gradientFillCircle(x, y, r, c1, c2) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.2, x, y, r);
  g.addColorStop(0, c1);
  g.addColorStop(1, c2);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawSuitTorso(x, y, w, h) {
  ctx.fillStyle = "rgb(24,24,34)";
  roundRect(x - w / 2, y - h / 2, w, h, 18);
  ctx.fill();

  ctx.fillStyle = "rgb(245,245,250)";
  roundRect(x - w * 0.12, y - h * 0.42, w * 0.24, h * 0.84, 10);
  ctx.fill();

  ctx.fillStyle = "rgb(18,18,26)";
  ctx.beginPath();
  ctx.moveTo(x - w * 0.18, y - h * 0.42);
  ctx.lineTo(x - w * 0.02, y - h * 0.06);
  ctx.lineTo(x - w * 0.20, y - h * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(x + w * 0.18, y - h * 0.42);
  ctx.lineTo(x + w * 0.02, y - h * 0.06);
  ctx.lineTo(x + w * 0.20, y - h * 0.02);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = "rgb(200,30,70)";
  ctx.beginPath();
  ctx.moveTo(x, y - h * 0.38);
  ctx.lineTo(x + w * 0.06, y - h * 0.26);
  ctx.lineTo(x, y - h * 0.08);
  ctx.lineTo(x - w * 0.06, y - h * 0.26);
  ctx.closePath();
  ctx.fill();
}

function drawDress(x, y, w, h) {
  ctx.fillStyle = "rgb(255,115,175)";
  roundRect(x - w * 0.22, y - h * 0.44, w * 0.44, h * 0.44, 14);
  ctx.fill();

  const g = ctx.createLinearGradient(0, y - h * 0.05, 0, y + h * 0.62);
  g.addColorStop(0, "rgba(255,115,175,0.95)");
  g.addColorStop(1, "rgba(255,75,145,0.98)");
  ctx.fillStyle = g;

  ctx.beginPath();
  ctx.moveTo(x - w * 0.30, y - h * 0.05);
  ctx.quadraticCurveTo(x - w * 0.72, y + h * 0.42, x - w * 0.20, y + h * 0.62);
  ctx.quadraticCurveTo(x, y + h * 0.70, x + w * 0.20, y + h * 0.62);
  ctx.quadraticCurveTo(x + w * 0.72, y + h * 0.42, x + w * 0.30, y - h * 0.05);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "rgba(255,255,255,0.12)";
  ctx.lineWidth = 1;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    ctx.moveTo(x + i * w * 0.06, y - h * 0.02);
    ctx.quadraticCurveTo(x + i * w * 0.12, y + h * 0.28, x + i * w * 0.02, y + h * 0.60);
    ctx.stroke();
  }
}

function drawFaceProfile(x, y, r, skin1 = "rgb(255,235,215)", skin2 = "rgb(245,210,190)") {
  gradientFillCircle(x, y, r, skin1, skin2);

  ctx.fillStyle = "rgba(0,0,0,0.07)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.55, y + r * 0.15, r * 0.22, r * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.75)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.05, y - r * 0.10, r * 0.10, r * 0.14, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.beginPath();
  ctx.ellipse(x + r * 0.08, y - r * 0.14, r * 0.05, r * 0.08, 0, 0, Math.PI * 2);
  ctx.fill();
}

// Ballroom couple dance (REPLACES old dance)
function drawCoupleDance() {
  const W = innerWidth;
  const gy = groundY();

  const cx = W * 0.52;
  const baseY = gy;

  const tt = performance.now() * 0.001;
  const sway = Math.sin(tt * 3.2) * 10;
  const rise = (Math.sin(tt * 3.2) * 0.5 + 0.5) * 6;
  const turn = Math.sin(tt * 1.2) * 0.20;
  const glide = Math.sin(tt * 1.8) * 8;

  const ax = cx + glide;
  const ay = baseY - 10 - rise;

  softShadow(ax - 40, baseY + 14, 55, 16, 0.22);
  softShadow(ax + 35, baseY + 14, 55, 16, 0.22);

  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(turn);
  ctx.translate(-ax, -ay);

  const man = { x: ax - 60, y: ay - 20 };
  const girl = { x: ax + 20, y: ay - 18 };

  const manW = 56, manH = 88;
  const girlW = 58, girlH = 98;

  const manShoulder = { x: man.x + 16, y: man.y - 48 + sway * 0.15 };
  const girlShoulder = { x: girl.x - 10, y: girl.y - 48 - sway * 0.10 };

  const joinedHands = { x: ax - 6, y: ay - 70 + sway * 0.18 };

  ctx.strokeStyle = "rgba(255,235,215,0.92)";
  ctx.lineWidth = 6;
  ctx.lineCap = "round";

  // man back arm around girl
  ctx.beginPath();
  ctx.moveTo(man.x + 4, man.y - 46);
  ctx.quadraticCurveTo(ax - 20, ay - 54, girl.x - 6, girl.y - 44);
  ctx.stroke();

  // girl arm on man shoulder
  ctx.beginPath();
  ctx.moveTo(girl.x - 2, girl.y - 46);
  ctx.quadraticCurveTo(ax - 20, ay - 60, man.x + 10, man.y - 52);
  ctx.stroke();

  // front arms to join hands
  ctx.beginPath();
  ctx.moveTo(manShoulder.x, manShoulder.y);
  ctx.quadraticCurveTo(ax - 20, ay - 86, joinedHands.x, joinedHands.y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(girlShoulder.x, girlShoulder.y);
  ctx.quadraticCurveTo(ax + 10, ay - 86, joinedHands.x, joinedHands.y);
  ctx.stroke();

  ctx.fillStyle = "rgba(255,235,215,0.95)";
  ctx.beginPath();
  ctx.ellipse(joinedHands.x, joinedHands.y, 6, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // legs
  ctx.strokeStyle = "rgb(22,22,30)";
  ctx.lineWidth = 10;
  const stepM = Math.sin(tt * 3.2) * 10;
  ctx.beginPath();
  ctx.moveTo(man.x - 6, man.y + 22);
  ctx.lineTo(man.x - 10 - stepM * 0.4, baseY + 8);
  ctx.moveTo(man.x + 10, man.y + 22);
  ctx.lineTo(man.x + 14 + stepM * 0.4, baseY + 8);
  ctx.stroke();

  ctx.strokeStyle = "rgb(85,25,70)";
  ctx.lineWidth = 8;
  const stepG = Math.cos(tt * 3.2) * 10;
  ctx.beginPath();
  ctx.moveTo(girl.x - 4, girl.y + 30);
  ctx.lineTo(girl.x - 6 - stepG * 0.35, baseY + 10);
  ctx.moveTo(girl.x + 8, girl.y + 30);
  ctx.lineTo(girl.x + 10 + stepG * 0.35, baseY + 10);
  ctx.stroke();

  // bodies
  drawSuitTorso(man.x, man.y - 18 + sway * 0.15, manW, manH);

  ctx.save();
  ctx.translate(girl.x, girl.y - 14);
  ctx.rotate(Math.sin(tt * 2.6) * 0.06);
  ctx.translate(-girl.x, -(girl.y - 14));
  drawDress(girl.x, girl.y - 6 - sway * 0.10, girlW, girlH);
  ctx.restore();

  // heads
  drawFaceProfile(man.x, man.y - 78 + sway * 0.18, 18);
  ctx.fillStyle = "rgb(25,25,25)";
  ctx.beginPath();
  ctx.arc(man.x - 2, man.y - 84 + sway * 0.18, 18, Math.PI, 0);
  ctx.fill();

  drawFaceProfile(girl.x, girl.y - 78 - sway * 0.12, 17);
  ctx.fillStyle = "rgb(85,45,25)";
  ctx.beginPath();
  ctx.arc(girl.x - 3, girl.y - 84 - sway * 0.12, 18, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "rgb(70,35,20)";
  ctx.beginPath();
  ctx.ellipse(girl.x - 16, girl.y - 92 - sway * 0.12, 8, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  // bouquet in other hand
  bouquet(man.x - 42, man.y - 34 + sway * 0.10, 0.74);

  // labels
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 14px Georgia, serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(FROM, man.x, baseY + 30);
  ctx.fillText(TO, girl.x, baseY + 30);

  ctx.restore();
}

/* ------------------------------
   Update + Draw loop
--------------------------------*/
function update() {
  t++;

  const gx = girlX();
  const gy = groundY();

  switch (scene) {
    case Scene.WALK:
      if (boyX < gx - 170) {
        boyX += 4.7;
        walkPhase += 0.35;
      } else {
        scene = Scene.GIRL_HIDE;
        t = 0;
      }
      break;

    case Scene.GIRL_HIDE:
      blush = Math.min(1, blush + 0.012);
      if (t > 90) { scene = Scene.CLOSE_EYES; t = 0; }
      break;

    case Scene.CLOSE_EYES:
      armReach = Math.min(1, armReach + 0.012);
      if (t > 110) {
        scene = Scene.REVEAL;
        t = 0;
        sparkleBurst(gx - 20, gy - 170, 55);
      }
      break;

    case Scene.REVEAL:
      reveal = Math.min(1, reveal + 0.02);
      if (t % 12 === 0) sparkleBurst(gx - 20, gy - 170, 18);
      if (t > 110) { scene = Scene.KNEEL; t = 0; }
      break;

    case Scene.KNEEL:
      kneel = Math.min(1, kneel + 0.02);
      if (t > 95) { scene = Scene.QUESTION; t = 0; }
      break;

    case Scene.QUESTION:
      if (t > 90) { scene = Scene.WAIT_YES; t = 0; }
      break;

    case Scene.WAIT_YES:
      break;

    case Scene.YES:
      if (confetti.length < 120) addConfetti();
      if (t % 24 === 0) launchFirework();
      heartPulse = 1.0 + 0.22 * Math.sin(performance.now() / 120);
      if (t > 70) { scene = Scene.DANCE; t = 0; }
      break;

    case Scene.DANCE:
      if (confetti.length < 180) addConfetti();
      heartPulse = 1.0 + 0.22 * Math.sin(performance.now() / 120);
      if (t % 26 === 0) launchFirework();
      break;
  }

  for (const h of floatHearts) {
    h.y -= 1.2 * h.sp;
    if (h.y < -70) {
      h.y = innerHeight + 70;
      h.x = Math.random() * innerWidth;
    }
  }

  for (let i = sparkles.length - 1; i >= 0; i--) {
    const p = sparkles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vx *= 0.95;
    p.vy *= 0.95;
    p.life -= 0.04;
    if (p.life <= 0) sparkles.splice(i, 1);
  }

  for (const c of confetti) {
    c.y += c.s;
    c.a += 0.08;
    c.x += Math.sin(c.a) * 0.6;
  }

  for (let i = fireworks.length - 1; i >= 0; i--) {
    const fw = fireworks[i];
    if (!fw.boom) {
      fw.x += fw.vx;
      fw.y += fw.vy;
      fw.vy += 0.06;
      if (fw.vy > -1.0 || fw.y < innerHeight * 0.45) explodeFirework(fw);
    } else {
      for (let j = fw.p.length - 1; j >= 0; j--) {
        const p = fw.p[j];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.vy += 0.03;
        p.life -= 0.02;
        if (p.life <= 0) fw.p.splice(j, 1);
      }
      if (fw.p.length === 0) fireworks.splice(i, 1);
    }
  }

  for (let i = clickHearts.length - 1; i >= 0; i--) {
    const h = clickHearts[i];
    h.x += h.vx;
    h.y += h.vy;
    h.vy += 0.08;
    h.life -= 0.03;
    if (h.life <= 0) clickHearts.splice(i, 1);
  }

  shake = Math.max(0, shake - 0.7);
}

function draw() {
  const W = innerWidth, H = innerHeight;
  const gx = girlX();
  const gy = groundY();

  const sx = (Math.random() * 2 - 1) * shake;
  const sy = (Math.random() * 2 - 1) * shake;
  ctx.setTransform(1, 0, 0, 1, sx, sy);

  drawBackground();

  const heartAlpha =
    scene === Scene.CLOSE_EYES ? 0.25 :
    scene === Scene.REVEAL ? 0.20 :
    scene >= Scene.YES ? 0.12 : 0.18;

  ctx.fillStyle = `rgba(255, 210, 230, ${heartAlpha})`;
  for (const h of floatHearts) miniHeart(h.x, h.y, h.s);

  for (const p of sparkles) {
    ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.life})`;
    ctx.fillRect(p.x, p.y, 3, 3);
  }

  yesBtn.visible = false;

  if (scene === Scene.DANCE) {
    drawCoupleDance();
  } else {
    drawGirl(gx, gy);
    drawBoy(boyX, gy);
  }

  if (scene === Scene.GIRL_HIDE) speechBubble(gx - 180, gy - 210, "What are you hiding? 😏");
  if (scene === Scene.CLOSE_EYES) speechBubble(boyX - 70, gy - 230, "Close your eyes… 🙈");
  if (scene === Scene.REVEAL) speechBubble(gx - 190, gy - 210, "Okay… I’m looking now! 😳✨");
  if (scene === Scene.KNEEL) speechBubble(boyX - 70, gy - 230, "Anika… one moment…");
  if (scene === Scene.QUESTION || scene === Scene.WAIT_YES) speechBubble(boyX - 70, gy - 230, "Will you be my Valentine? 💐");
  if (scene === Scene.WAIT_YES) drawYesButton();
  if (scene === Scene.YES || scene === Scene.DANCE) speechBubble(gx - 160, gy - 210, "YES!!! 💖");

  if (scene === Scene.YES || scene === Scene.DANCE) {
    ctx.save();
    ctx.translate(W / 2, 160 + Math.sin(performance.now() / 400) * 12);
    ctx.scale(heartPulse, heartPulse);
    ctx.fillStyle = "rgba(255,50,120,0.98)";
    miniHeart(0, 0, 64);
    ctx.restore();

    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.font = "700 56px Georgia, serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(`${FROM} ❤ ${TO}`, W / 2, 92);

    for (const c of confetti) {
      ctx.fillStyle = c.c;
      ctx.fillRect(c.x, c.y, 6, 6);
    }

    for (const fw of fireworks) {
      if (!fw.boom) {
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.fillRect(fw.x, fw.y, 3, 3);
      } else {
        for (const p of fw.p) {
          ctx.fillStyle = `hsla(${p.hue}, 100%, 75%, ${p.life})`;
          ctx.fillRect(p.x, p.y, 3, 3);
        }
      }
    }

    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = "600 14px Georgia, serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText("Tip: click/tap anywhere to throw hearts 💕", 18, H - 18);
  }

  for (const h of clickHearts) {
    ctx.fillStyle = `rgba(255,120,180,${h.life})`;
    miniHeart(h.x, h.y, h.s);
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
loop();
