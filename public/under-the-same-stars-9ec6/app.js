'use strict';
const $ = (id) => document.getElementById(id);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let still = reduced.matches, playing = false, free = reduced.matches;
let lines = [], chapterNodes = [], current = -1, timer = null, observer = null;
let unlocked = false, decrypting = false, musicOn = false, musicRequest = 0, audioRequested = false;
let encryptedPromise = null;
const soundtrack = $('soundtrack');
soundtrack.volume = .15;
const announce = (message) => { $('announcement').textContent = message; };
const pausePath = '<path d="M8 5v14M16 5v14" stroke-width="3" fill="none"/>';
const playPath = '<path d="m8 5 11 7-11 7Z"/>';

function setPresentation(value) {
  const wasPresentation = document.body.classList.contains('presentation');
  document.body.classList.toggle('presentation', value);
  $('focus-view').hidden = !value;
  $('opened').inert = value;
  document.querySelector('.skip').hidden = value || !unlocked;
  if (value && !wasPresentation) $('focus-view').focus({preventScroll:true});
  else if (!value && document.activeElement === $('focus-view')) $('letter').focus({preventScroll:true});
  if (!value && wasPresentation && current >= 0) lines[current]?.scrollIntoView({block:'center',behavior:'instant'});
}
function setPlaying(value) {
  playing = value;
  clearTimeout(timer);
  if (value) setPresentation(true);
  else $('focus-line').getAnimations().forEach(animation => animation.cancel());
  $('play').setAttribute('aria-pressed', String(value));
  $('play').setAttribute('aria-label', value ? '暂停逐句播放' : '开始逐句播放');
  $('play').querySelector('span').textContent = value ? '暂停' : '播放';
  $('play').querySelector('svg').innerHTML = value ? pausePath : playPath;
}
function updateProgress(index) {
  const amount = index < 0 ? 0 : Math.round((index + 1) / lines.length * 100);
  $('read-progress').textContent = `${amount}%`;
  $('progress-fill').style.width = `${amount}%`;
  if (index >= 0) $('chapter-status').textContent = lines[index].closest('.chapter').querySelector('h2').textContent;
}
function fitSentence() {
  if ($('focus-view').hidden) return;
  const line = $('focus-line'), view = $('focus-view');
  line.style.fontSize = '';
  const style = getComputedStyle(view);
  const available = view.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  let size = parseFloat(getComputedStyle(line).fontSize);
  while (line.scrollHeight > available && size > 18) {
    size -= 1; line.style.fontSize = `${size}px`;
  }
}
function showLine(index, scroll = false) {
  if (index < 0 || index >= lines.length) return;
  if (current >= 0) lines[current]?.classList.remove('active');
  current = index;
  for (let i = Math.max(0, index - 3); i <= index; i++) lines[i].classList.add('revealed');
  lines[index].classList.add('active');
  updateProgress(index);
  if (document.body.classList.contains('presentation')) {
    const focusLine = $('focus-line');
    focusLine.textContent = lines[index].textContent;
    fitSentence();
    focusLine.getAnimations().forEach(animation => animation.cancel());
    if (!still) focusLine.animate([{opacity:0},{opacity:1}], {duration:1200,easing:'ease-out',fill:'both'});
  }
  if (scroll && !playing) lines[index].scrollIntoView({ block: 'center', behavior: still ? 'instant' : 'smooth' });
}
function schedule() {
  if (!playing || current < 0) return;
  const pace = Number($('pace').value);
  const length = Array.from(lines[current].textContent).length;
  timer = setTimeout(() => {
    if (!playing) return;
    if (current + 1 >= lines.length) {
      setPlaying(false); setFree(true); announce('播放完毕。'); return;
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
  free = value; setPlaying(false); setPresentation(!value);
  document.body.classList.toggle('free-reading', value);
  $('mode').setAttribute('aria-pressed', String(value));
  $('mode').querySelector('span').textContent = value ? '逐句' : '全文';
  $('mode').setAttribute('aria-label', value ? '切换到逐句阅读' : '显示全文，自由阅读');
  if (value) lines.forEach(line => line.classList.add('revealed'));
  else if (lines.length) showLine(current < 0 ? 0 : current);
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
  $('music').querySelector('span:last-child').textContent = value ? '声音开启' : '声音关闭';
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
    
    const h2 = document.createElement('h2'); h2.className = 'sr-only'; h2.textContent = `第 ${chapterIndex + 1} 部分`; h2.id = `${section.id}-title`; h2.tabIndex = -1;
    section.setAttribute('aria-labelledby', h2.id); section.append(h2);
    for (const paragraph of chapter.paragraphs) {
      const verse = document.createElement('p'); verse.className = `verse${paragraph.key ? ' key' : ''}`;
      for (const sentence of paragraph.sentences) {
        const line = document.createElement('span'); line.className = 'line'; line.textContent = sentence; verse.append(line);
      }
      section.append(verse);
    }
    fragment.append(section);
    const link = document.createElement('a'); link.href = `#${section.id}`; link.textContent = `第 ${chapterIndex + 1} 部分`;
    link.setAttribute('aria-label', `第 ${chapterIndex + 1} 部分`);
    link.addEventListener('click', (event) => {
      event.preventDefault(); $('contents-dialog').close(); setFree(true);
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
  button.disabled = true; button.querySelector('span').textContent = '载入中…';
  let password = $('password').value; $('password').value = '';
  try {
    const data = await decrypt(password); password = '';
    renderLetter(data); unlocked = true; current = -1;
    $('gate').hidden = true; $('opened').hidden = false; $('dock').hidden = false;
    $('contents').hidden = false; $('close').hidden = false;
    document.querySelector('.skip').hidden = false;
    window.scrollTo({top:0, behavior:'instant'});
    setFree(reduced.matches); if (reduced.matches) $('letter-title').focus({preventScroll:true});
    announce('内容已打开。可以逐句播放，也可以阅读全文。');
  } catch (error) {
    $('error').textContent = error.message === 'network' || error instanceof TypeError ? '无法载入内容，请检查网络后重试。' : '密码不正确，请注意大小写。';
    $('password').focus();
  } finally {
    password = ''; decrypting = false; button.disabled = false; button.querySelector('span').textContent = '进入';
  }
});
$('show-password').addEventListener('click', () => {
  const showing = $('password').type === 'password'; $('password').type = showing ? 'text' : 'password';
  $('show-password').setAttribute('aria-pressed', String(showing)); $('show-password').setAttribute('aria-label', showing ? '隐藏密码' : '显示密码');
});
$('play').addEventListener('click', () => {
  if (playing) setPlaying(false);
  else { if (!audioRequested) {audioRequested = true; setMusic(true);} startReading(); }
});
$('music').addEventListener('click', () => {audioRequested = true; setMusic(!musicOn);});
$('mode').addEventListener('click', () => { setFree(!free); announce(free ? '全文已显示。可以自由阅读。' : '已切换到逐句阅读。'); });
$('settings').addEventListener('click', () => { setPlaying(false); $('settings-dialog').showModal(); });
$('contents').addEventListener('click', () => { setPlaying(false); $('contents-dialog').showModal(); });
document.querySelectorAll('[data-dismiss]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('click', event => { if(event.target === dialog) { const rect=dialog.getBoundingClientRect(); if(event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom) dialog.close(); } }));
$('pace').addEventListener('change', () => { if (playing) { clearTimeout(timer); schedule(); } });
$('volume').addEventListener('input', () => { soundtrack.volume = Number($('volume').value) / 100; $('volume-value').textContent = `${$('volume').value}%`; });
$('restart').addEventListener('click', () => {current = -1; setFree(false); showLine(0);});
$('close').addEventListener('click', () => {
  setPlaying(false); setPresentation(false); setMusic(false); audioRequested = false; soundtrack.currentTime = 0; observer?.disconnect(); $('focus-line').getAnimations().forEach(animation => animation.cancel());
  lines = []; chapterNodes = []; current = -1; unlocked = false; $('focus-line').textContent = ''; $('chapter-status').textContent = '尚未开始';
  $('letter').replaceChildren(); $('chapter-links').replaceChildren();
  $('opened').hidden = true; $('dock').hidden = true; $('contents').hidden = true; $('close').hidden = true;
  document.querySelector('.skip').hidden = true;
  $('gate').hidden = false; $('password').type = 'password'; $('show-password').setAttribute('aria-pressed','false'); $('show-password').setAttribute('aria-label','显示密码');
  document.body.classList.remove('free-reading');
  window.scrollTo({top:0,behavior:'instant'}); $('password').focus(); announce('已退出。');
});
const manual = () => {if(unlocked && document.body.classList.contains('presentation')) {setFree(true); announce('已切换到全文阅读。');}};
window.addEventListener('wheel', manual, {passive:true}); window.addEventListener('touchmove', manual, {passive:true});
window.addEventListener('keydown', event => {
  if (['INPUT','SELECT','TEXTAREA','BUTTON','A'].includes(event.target.tagName) || document.querySelector('dialog[open]')) return;
  if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End'].includes(event.key)) manual();
  if (event.code === 'Space' && unlocked) { event.preventDefault(); playing ? setPlaying(false) : startReading(); }
});
let scrollQueued = false;
window.addEventListener('scroll', () => {
  if (!unlocked || playing || document.body.classList.contains('presentation') || scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const index = lines.findIndex(line => line.getBoundingClientRect().bottom > innerHeight * .4);
    if(index >= 0 && window.scrollY > innerHeight * .7) showLine(index);
  });
}, {passive:true});
soundtrack.addEventListener('error', () => { setMusic(false); announce('音乐暂时无法载入，仍然可以继续读信。'); });

function setMotion(value) {
  still = !value; document.body.classList.toggle('still', still);
  $('animation-setting').checked = value;
  if (still) $('focus-line').getAnimations().forEach(animation => animation.cancel());
}
$('animation-setting').addEventListener('change', () => setMotion($('animation-setting').checked));
reduced.addEventListener('change', event => {setMotion(!event.matches);if(event.matches && unlocked) setFree(true);});
document.addEventListener('visibilitychange', () => {if(document.hidden) {setPlaying(false);setMusic(false);}});
let resizeTimer; window.addEventListener('resize', () => {clearTimeout(resizeTimer);resizeTimer=setTimeout(fitSentence,100);});
setMotion(!reduced.matches);
