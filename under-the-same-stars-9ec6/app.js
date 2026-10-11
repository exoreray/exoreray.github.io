'use strict';
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let still = reduced.matches, playing = false, free = reduced.matches;
let lines = [], chapterNodes = [], current = -1, timer = null, observer = null;
let unlocked = false, decrypting = false, musicOn = false, skyFrame = null, musicRequest = 0;
let encryptedPromise = null;
const soundtrack = $('soundtrack');
soundtrack.volume = .35;
const announce = (message) => { $('announcement').textContent = message; };
const pausePath = '<path d="M8 5v14M16 5v14" stroke-width="3" fill="none"/>';
const playPath = '<path d="m8 5 11 7-11 7Z"/>';

function setPlaying(value) {
  playing = value;
  clearTimeout(timer);
  $('play').setAttribute('aria-pressed', String(value));
  $('play').setAttribute('aria-label', value ? '暂停逐句播放' : '开始逐句播放');
  $('play').querySelector('span').textContent = value ? '暂停播放' : '慢慢播放';
  $('play').querySelector('svg').innerHTML = value ? pausePath : playPath;
}
function updateProgress(index) {
  const amount = index < 0 ? 0 : Math.round((index + 1) / lines.length * 100);
  $('read-progress').textContent = `${amount}%`;
  $('progress-fill').style.width = `${amount}%`;
  if (index >= 0) $('chapter-status').textContent = lines[index].closest('.chapter').querySelector('h2').textContent;
}
function showLine(index, scroll = false) {
  if (index < 0 || index >= lines.length) return;
  if (current >= 0) lines[current]?.classList.remove('active');
  current = index;
  for (let i = Math.max(0, index - 3); i <= index; i++) lines[i].classList.add('revealed');
  lines[index].classList.add('active');
  updateProgress(index);
  if (scroll) lines[index].scrollIntoView({ block: 'center', behavior: still ? 'instant' : 'smooth' });
}
function schedule() {
  if (!playing || current < 0) return;
  const pace = Number($('pace').value);
  const length = Array.from(lines[current].textContent).length;
  timer = setTimeout(() => {
    if (!playing) return;
    if (current + 1 >= lines.length) {
      setPlaying(false); announce('这封信读完了。故事还在继续。'); return;
    }
    showLine(current + 1, true); schedule();
  }, Math.max(3500, length * 205 + 1500) * pace);
}
function startReading() {
  if (!unlocked) return;
  if (free) setFree(false);
  let index = current;
  if (index < 0 || index === lines.length - 1) index = 0;
  const nearest = lines.findIndex(line => line.getBoundingClientRect().bottom > innerHeight * .35);
  if (window.scrollY > innerHeight && nearest >= 0 && Math.abs(nearest - index) > 3) index = nearest;
  setPlaying(true); showLine(index, true); schedule();
}
function setFree(value) {
  free = value; setPlaying(false);
  document.body.classList.toggle('free-reading', value);
  $('mode').setAttribute('aria-pressed', String(value));
  $('mode').querySelector('span').textContent = value ? '逐句阅读' : '自由阅读';
  $('mode').setAttribute('aria-label', value ? '切换到逐句阅读' : '显示全文，自由阅读');
  if (value) lines.forEach(line => line.classList.add('revealed'));
}
async function setMusic(value) {
  const request = ++musicRequest;
  if (value) {
    try { await soundtrack.play(); } catch {
      if (request !== musicRequest) return;
      announce('音乐暂时未能播放。你可以稍后再点击音乐按钮。'); value = false;
    }
  } else soundtrack.pause();
  if (request !== musicRequest) return;
  musicOn = value;
  $('music').setAttribute('aria-pressed', String(value));
  $('music').querySelector('span:last-child').textContent = value ? '音乐开启' : '音乐关闭';
  $('music').setAttribute('aria-label', value ? '暂停背景音乐' : '播放背景音乐');
}

function renderLetter(data) {
  const article = $('letter'), links = $('chapter-links');
  article.replaceChildren(); links.replaceChildren();
  const fragment = document.createDocumentFragment();
  for (const [chapterIndex, chapter] of data.chapters.entries()) {
    const section = document.createElement('section');
    section.className = 'chapter'; section.id = `chapter-${chapterIndex + 1}`;
    const heading = document.createElement('div'); heading.className = 'chapter-heading';
    const star = document.createElement('span'); star.className = 'chapter-star'; star.textContent = '✧'; star.setAttribute('aria-hidden', 'true');
    const h2 = document.createElement('h2'); h2.textContent = chapter.title; h2.id = `${section.id}-title`; h2.tabIndex = -1;
    section.setAttribute('aria-labelledby', h2.id); heading.append(star, h2); section.append(heading);
    for (const paragraph of chapter.paragraphs) {
      const verse = document.createElement('p'); verse.className = `verse${paragraph.key ? ' key' : ''}`;
      for (const sentence of paragraph.sentences) {
        const line = document.createElement('span'); line.className = 'line'; line.textContent = sentence; verse.append(line);
      }
      section.append(verse);
    }
    fragment.append(section);
    const link = document.createElement('a'); link.href = `#${section.id}`; link.textContent = chapter.title;
    link.setAttribute('aria-label', chapter.title);
    link.addEventListener('click', (event) => {
      event.preventDefault(); $('contents-dialog').close(); setPlaying(false);
      section.querySelectorAll('.line').forEach(line => line.classList.add('revealed'));
      section.scrollIntoView({behavior: still ? 'instant' : 'smooth', block: 'start'});
      h2.focus({preventScroll: true});
    }); links.append(link);
  }
  article.append(fragment);
  lines = [...article.querySelectorAll('.line')]; chapterNodes = [...article.querySelectorAll('.chapter')];
  observer?.disconnect();
  observer = new IntersectionObserver(entries => {
    if (playing) return;
    const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => lines.indexOf(a.target) - lines.indexOf(b.target));
    visible.forEach((entry, order) => {
      // CSS delay gives each sentence its own entrance without accumulating timers.
      entry.target.style.transitionDelay = still ? '0s' : `${Math.min(order * .16, .64)}s`;
      entry.target.classList.add('revealed');
    });
  }, {threshold: .05, rootMargin: '0px 0px -12% 0px'});
  lines.forEach(line => observer.observe(line));
  setFree(reduced.matches); updateProgress(-1);
}
function bytes(value) { return Uint8Array.from(atob(value), char => char.charCodeAt(0)); }
async function decrypt(password) {
  if (!encryptedPromise) encryptedPromise = fetch('letter.enc.json', {cache: 'no-store'}).then(response => {
    if (!response.ok) throw new Error('network'); return response.json();
  }).catch(error => { encryptedPromise = null; throw error; });
  const sealed = await encryptedPromise;
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({name: 'PBKDF2', salt: bytes(sealed.salt), iterations: sealed.iterations, hash: 'SHA-256'}, material, {name:'AES-GCM', length:256}, false, ['decrypt']);
  const clear = await crypto.subtle.decrypt({name:'AES-GCM', iv:bytes(sealed.iv)}, key, bytes(sealed.ciphertext));
  return JSON.parse(new TextDecoder().decode(clear));
}
$('unlock').addEventListener('submit', async event => {
  event.preventDefault(); if (decrypting) return;
  decrypting = true; $('error').textContent = ''; const button = $('unlock').querySelector('[type="submit"]');
  button.disabled = true; button.querySelector('span').textContent = '星光正在展开…';
  let password = $('password').value; $('password').value = '';
  try {
    const data = await decrypt(password); password = '';
    renderLetter(data); unlocked = true; current = -1;
    $('gate').hidden = true; $('opened').hidden = false; $('dock').hidden = false;
    $('contents').hidden = false; $('close').hidden = false;
    document.querySelector('.skip').hidden = false;
    window.scrollTo({top:0, behavior:'instant'}); $('letter-title').focus({preventScroll:true});
    announce('信已打开。可以开始逐句播放，也可以自由阅读。');
  } catch (error) {
    $('error').textContent = error.message === 'network' || error instanceof TypeError ? '暂时没能载入这封信，请检查网络后再试一次。' : '暗号还没对上。注意大小写，再试一次。';
    $('password').focus();
  } finally {
    password = ''; decrypting = false; button.disabled = false; button.querySelector('span').textContent = '打开这封信';
  }
});
$('show-password').addEventListener('click', () => {
  const showing = $('password').type === 'password'; $('password').type = showing ? 'text' : 'password';
  $('show-password').setAttribute('aria-pressed', String(showing)); $('show-password').setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
});
$('begin').addEventListener('click', () => {
  setMusic(true);
  if (still) { setFree(true); $('letter').scrollIntoView({behavior:'instant'}); }
  else startReading();
});
$('play').addEventListener('click', () => playing ? setPlaying(false) : startReading());
$('music').addEventListener('click', () => setMusic(!musicOn));
$('mode').addEventListener('click', () => { setFree(!free); announce(free ? '全文已显示。可以自由阅读。' : '已切换到逐句阅读。'); });
$('settings').addEventListener('click', () => { setPlaying(false); $('settings-dialog').showModal(); });
$('contents').addEventListener('click', () => { setPlaying(false); $('contents-dialog').showModal(); });
document.querySelectorAll('[data-dismiss]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if(event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } }));
$('pace').addEventListener('change', () => { if (playing) { clearTimeout(timer); schedule(); } });
$('volume').addEventListener('input', () => { soundtrack.volume = Number($('volume').value) / 100; $('volume-value').textContent = `${$('volume').value}%`; });
$('restart').addEventListener('click', () => { setPlaying(false); current = -1; lines.forEach(line => line.classList.remove('active')); updateProgress(-1); window.scrollTo({top:0,behavior:still?'instant':'smooth'}); $('letter-title').focus({preventScroll:true}); });
$('close').addEventListener('click', () => {
  setPlaying(false); setMusic(false); soundtrack.currentTime = 0; observer?.disconnect();
  lines = []; chapterNodes = []; current = -1; unlocked = false;
  $('letter').replaceChildren(); $('chapter-links').replaceChildren();
  $('opened').hidden = true; $('dock').hidden = true; $('contents').hidden = true; $('close').hidden = true;
  document.querySelector('.skip').hidden = true;
  $('gate').hidden = false; $('password').type = 'password'; $('show-password').setAttribute('aria-pressed','false'); $('show-password').setAttribute('aria-label','显示密码');
  document.body.classList.remove('free-reading');
  window.scrollTo({top:0,behavior:'instant'}); $('password').focus(); announce('信已合上。');
});
const manual = () => { if(playing) {setPlaying(false); announce('播放已暂停。按你的节奏读。');} };
window.addEventListener('wheel', manual, {passive:true}); window.addEventListener('touchmove', manual, {passive:true});
window.addEventListener('keydown', event => {
  if (['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(event.target.tagName) || document.querySelector('dialog[open]')) return;
  if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) manual();
  if (event.code === 'Space' && unlocked) { event.preventDefault(); playing ? setPlaying(false) : startReading(); }
});
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (!unlocked || playing || scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const index = lines.findIndex(line => line.getBoundingClientRect().bottom > innerHeight * .4);
    if(index >= 0 && window.scrollY > innerHeight * .7) showLine(index);
  });
}, {passive:true});
soundtrack.addEventListener('error', () => { setMusic(false); announce('音乐暂时无法载入，仍然可以继续读信。'); });

// A quiet, slowly shifting star field. Its bright stars never flash.
const canvas = $('stars'), context = canvas.getContext('2d');
let width = 0, height = 0, stars = [], lastFrame = 0, skyTime = 0;
function resizeSky() {
  width = innerWidth; height = innerHeight;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = width * dpr; canvas.height = height * dpr;
  context.setTransform(dpr,0,0,dpr,0,0);
  let seed = 29037; const random = () => {seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  stars = Array.from({length:width<600?210:430}, (_,index) => ({x:random()*width,y:random()*height,r:random()*.85+.25,alpha:random()*.45+.2,phase:random()*6.28,speed:random()*.16+.08,bright:index%51===0}));
  drawSky(skyTime);
}
function drawSky(time) {
  context.clearRect(0,0,width,height);
  for (const star of stars) {
    const x = (star.x + Math.sin(time*.018+star.phase)*8 + width) % width;
    const y = star.y + Math.cos(time*.012+star.phase)*4;
    const alpha = star.alpha * (.76 + .24 * Math.sin(time * star.speed + star.phase));
    context.fillStyle=`rgba(225,228,249,${alpha})`;
    context.beginPath();context.arc(x,y,star.r,0,Math.PI*2);context.fill();
    if(star.bright) {
      const halo=context.createRadialGradient(x,y,0,x,y,16);halo.addColorStop(0,`rgba(239,217,184,${alpha*.38})`);halo.addColorStop(1,'rgba(239,217,184,0)');context.fillStyle=halo;context.fillRect(x-16,y-16,32,32);
      context.strokeStyle=`rgba(240,222,201,${alpha*.45})`;context.lineWidth=.5;context.beginPath();context.moveTo(x-5,y);context.lineTo(x+5,y);context.moveTo(x,y-5);context.lineTo(x,y+5);context.stroke();
    }
  }
  if (!still) {
    const phase = time % 27;
    if (phase > 20 && phase < 21.4) {
      const progress = (phase-20)/1.4, x = width*.76-progress*width*.26, y=height*.15+progress*height*.2;
      const glow = context.createLinearGradient(x,y,x+55,y-25);glow.addColorStop(0,`rgba(232,224,238,${Math.sin(progress*Math.PI)*.32})`);glow.addColorStop(1,'rgba(232,224,238,0)');context.strokeStyle=glow;context.lineWidth=1;context.beginPath();context.moveTo(x,y);context.lineTo(x+55,y-25);context.stroke();
    }
  }
}
function animateSky(now) {
  if(still || document.hidden) {skyFrame=null;return;}
  if(now-lastFrame>40) {skyTime+=Math.min((now-lastFrame)/1000,.1);lastFrame=now;drawSky(skyTime);}
  skyFrame=requestAnimationFrame(animateSky);
}
function setMotion(value) {
  still = !value; document.body.classList.toggle('still', still);
  $('motion').textContent = still ? '流动星空' : '静止星空'; $('motion').setAttribute('aria-pressed', String(still));
  $('motion').title = still ? '开启星空与文字动画' : '暂停星空与文字动画';
  $('animation-setting').checked = value;
  if(still) {cancelAnimationFrame(skyFrame);skyFrame=null;setPlaying(false);drawSky(skyTime);}
  else if(!skyFrame) {lastFrame=performance.now();skyFrame=requestAnimationFrame(animateSky);}
}
$('motion').addEventListener('click', () => setMotion(still));
$('animation-setting').addEventListener('change', () => setMotion($('animation-setting').checked));
reduced.addEventListener('change', event => {setMotion(!event.matches);if(event.matches&&unlocked)setFree(true);});
document.addEventListener('visibilitychange', () => {
  if(document.hidden) {setPlaying(false);setMusic(false);cancelAnimationFrame(skyFrame);skyFrame=null;}
  else if(!still&&!skyFrame) {lastFrame=performance.now();skyFrame=requestAnimationFrame(animateSky);}
});
let resizeTimer;
window.addEventListener('resize', () => {clearTimeout(resizeTimer);resizeTimer=setTimeout(resizeSky,120);});
resizeSky();setMotion(!reduced.matches);
