// ==========================================
// DATA STATIS (Karena tanpa database)
// ==========================================
const APP_DATA = {
  password: 'projecttes123',
  // Data untuk Gallery (Pastikan foto ada di folder foto/)
  memories: [
    { filename: 'foto-1.jpg', title: 'Pertama Kali Ketemu', caption: 'Hari itu hujan, tapi senyummu bikin cerah.' },
    { filename: 'foto-2.jpg', title: 'Liburan Pertama', caption: 'Kita tertawa sampai lupa waktu.' },
    { filename: 'foto-3.jpg', title: 'Anniversary 1 Tahun', caption: 'Masih ingat kue yang kamu buat?' }
  ],
  // Data untuk Message Vault
  messages: [
    { title: 'Untukmu, Selalu', sender: 'Aku', content: 'Hai kamu... terima kasih sudah hadir di hidupku. Setiap detik bersamamu adalah hadiah terindah.' },
    { title: 'Tentang Kita', sender: 'Aku', content: 'Kita mungkin punya cerita yang tidak sempurna. Tapi aku memilih untuk terus menulisnya bersamamu.' },
    { title: 'Pesan Rahasia', sender: 'Aku', content: 'Klik dua kali di halaman dashboard... ada easter egg untukmu 💫' }
  ],
  // Data untuk Kapsul Waktu
  capsules: [
    { title: 'Kapsul 1 Tahun Kita', message: 'Selamat anniversary! Semoga kita masih bersama sampai kapanpun.', unlock_at: new Date(new Date().getFullYear() + 1, 0, 1).toISOString() },
    { title: 'Pesan Masa Depan', message: 'Kalau kamu baca ini, berarti waktu sudah menjawab semuanya.', unlock_at: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString() }
  ],
  // Data untuk Quiz
  quiz: [
    { question: 'Apa warna favoritku?', options: ['Merah','Biru','Hijau','Kuning'], correct: 1 },
    { question: 'Makanan favorit kita berdua?', options: ['Pizza','Sushi','Rendang','Bakso'], correct: 3 }
  ]
};

// Helper: Dapatkan data interaksi (Like, Note) dari localStorage
function getLocalData(key, fallback = []) {
  const data = localStorage.getItem('chronos_' + key);
  return data ? JSON.parse(data) : fallback;
}
function setLocalData(key, value) {
  localStorage.setItem('chronos_' + key, JSON.stringify(value));
}

// ==========================================
// FITUR GLOBAL (Tema, Particles, Toast)
// ==========================================
export function initThemeSwitcher() {
  const saved = localStorage.getItem('theme') || 'midnight';
  document.documentElement.setAttribute('data-theme', saved);
  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.dataset.theme;
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    });
  });
}

export function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h; const particles = [];
  function resize() { w = canvas.width = window.innerWidth; h = canvas.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  for (let i = 0; i < 70; i++) {
    particles.push({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 2 + 1, vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4, a: Math.random() * 0.6 + 0.2 });
  }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#ff69b4';
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) { ctx.strokeStyle = accent; ctx.globalAlpha = (1 - d / 120) * 0.15; ctx.beginPath(); ctx.moveTo(particles[i].x, particles[i].y); ctx.lineTo(particles[j].x, particles[j].y); ctx.stroke(); }
      }
    }
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1;
      ctx.globalAlpha = p.a; ctx.fillStyle = accent; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    ctx.globalAlpha = 1; requestAnimationFrame(draw);
  }
  draw();
}

export function showToast(msg, duration = 2500) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg;
  document.body.appendChild(t); requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 400); }, duration);
}

export function requireAccess() {
  if (sessionStorage.getItem('vault_access') !== 'true') location.href = 'index.html';
}

export function initCountdown(elId) {
  const el = document.getElementById(elId); if (!el) return;
  const target = new Date(new Date().getFullYear() + 1, 1, 14); // 14 Feb tahun depan
  function tick() {
    const diff = target - new Date();
    if (diff <= 0) { el.innerHTML = '<h3>Selamat Hari Spesial! 💖</h3>'; return; }
    const d = Math.floor(diff / 86400000), h = Math.floor((diff % 86400000) / 3600000), m = Math.floor((diff % 3600000) / 60000), s = Math.floor((diff % 60000) / 1000);
    el.innerHTML = `
      <div class="countdown-box"><div class="countdown-num">${d}</div><div class="countdown-label">Hari</div></div>
      <div class="countdown-box"><div class="countdown-num">${h}</div><div class="countdown-label">Jam</div></div>
      <div class="countdown-box"><div class="countdown-num">${m}</div><div class="countdown-label">Menit</div></div>
      <div class="countdown-box"><div class="countdown-num">${s}</div><div class="countdown-label">Detik</div></div>`;
  }
  tick(); setInterval(tick, 1000);
}

// Fitur Musik Player
export function initMusicPlayer() {
  const audio = document.getElementById('bg-audio');
  const playBtn = document.getElementById('play-btn');
  const titleEl = document.getElementById('music-title');
  const visualizer = document.getElementById('visualizer');
  if (!audio || !playBtn) return;

  audio.src = 'musik/sweet.mp3'; // Path lokal
  audio.loop = true; audio.volume = 0.5;
  titleEl.textContent = '🎵 Sweet';

  for (let i = 0; i < 24; i++) { const b = document.createElement('div'); b.className = 'visualizer-bar'; visualizer.appendChild(b); }
  const bars = [...visualizer.children]; let playing = false;

  function animate() { if (!playing) return; bars.forEach(b => b.style.height = (15 + Math.random() * 85) + '%'); setTimeout(animate, 120); }
  function play() { audio.play().then(() => { playing = true; playBtn.textContent = '⏸'; animate(); }).catch(() => titleEl.textContent = '⚠️ Klik ▶ untuk memutar'); }
  function pause() { audio.pause(); playing = false; playBtn.textContent = '▶'; bars.forEach(b => b.style.height = '20%'); }
  playBtn.addEventListener('click', () => playing ? pause() : play());

  const wasPlaying = sessionStorage.getItem('music_playing') === 'true';
  const lastTime = parseFloat(sessionStorage.getItem('music_time') || '0');
  if (lastTime > 0) audio.currentTime = lastTime;
  if (wasPlaying && lastTime > 0) { audio.play().then(() => { playing = true; playBtn.textContent = '⏸'; animate(); }).catch(() => {}); }
  audio.addEventListener('timeupdate', () => { if (playing) sessionStorage.setItem('music_time', audio.currentTime); });
  window.addEventListener('beforeunload', () => { sessionStorage.setItem('music_playing', playing ? 'true' : 'false'); sessionStorage.setItem('music_time', audio.currentTime); });
}

export { APP_DATA, getLocalData, setLocalData };