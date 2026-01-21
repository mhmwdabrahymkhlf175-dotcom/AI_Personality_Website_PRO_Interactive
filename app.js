// Edit to your server endpoint
const SERVER_URL = "http://127.0.0.1:5000/analyze";
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.fade-in').forEach((el, i) => { el.style.animationDelay = (i * 120) + 'ms'; });
  if (document.body.dataset.page === 'home') playWelcomeSpeech();
});
function playWelcomeSpeech() {
  // const text = "Hello there! Welcome to the AI Personality Analyzer. I am your virtual assistant. Let's begin exploring your personality!";
  // const u = new SpeechSynthesisUtterance(text);
  // const synth = window.speechSynthesis;
  let voices = synth.getVoices();
  let v = voices.find(voice => /en/.test(voice.lang) && /male|man|John|David|Alex/i.test(voice.name)) || voices.find(voice => /en/.test(voice.lang)) || voices[0];
  if (v) u.voice = v;
  u.rate = 1.0; u.pitch = 0.95;
  u.onstart = () => { const cap = document.getElementById('welcome-caption'); if (cap) { cap.classList.add('visible'); cap.innerText = text; } };
  u.onend = () => { const cap = document.getElementById('welcome-caption'); if (cap) { setTimeout(() => cap.classList.remove('visible'), 1200); } };
  if (synth.onvoiceschanged !== undefined) synth.onvoiceschanged = () => { voices = synth.getVoices(); try { let v2 = voices.find(voice => /en/.test(voice.lang) && /male|man|John|David|Alex/i.test(voice.name)) || voices.find(voice => /en/.test(voice.lang)); if (v2) u.voice = v2; synth.speak(u); } catch (e) { } };
  try { synth.speak(u); } catch (e) { console.warn('Speech synthesis failed', e); }
}

async function captureAndSend(videoEl, resultEl, playerEl, lang = 'en') {
  const canvas = document.createElement('canvas'); canvas.width = videoEl.videoWidth; canvas.height = videoEl.videoHeight;
  canvas.getContext('2d').drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
  resultEl.innerText = 'Sending image for analysis...';
  try {
    const res = await fetch(SERVER_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: dataUrl, lang }) });
    const data = await res.json();
    if (data.success) {
      resultEl.innerHTML = `<strong>Age:</strong> ${data.age}<br/><strong>Gender:</strong> ${data.gender}<br/><strong>Mood:</strong> ${data.emotion}<hr/><p>${data.personality}</p>`;
      if (data.audio) { playerEl.src = data.audio; playerEl.style.display = 'block'; playerEl.play().catch(() => { }); } else { const u = new SpeechSynthesisUtterance(data.personality); u.lang = lang; window.speechSynthesis.speak(u); }
    } else { resultEl.innerText = 'Analysis failed: ' + (data.error || 'Unknown error'); }
  } catch (e) { resultEl.innerText = 'Error connecting to server: ' + e.message; }
}
