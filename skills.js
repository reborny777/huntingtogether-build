// Hunting Together Build Board — Skill Book (#skills): every skill of every public class, what it does (Lv.1 → Lv.10)
// and a short review, in English and Thai (skills-text.js). Other languages: Google Translate of the page (HT_LANGS).
(function(){
'use strict';
const IC = n => `assets/icons/${n}.webp`;
const img = (n, cls = 'gi sm') => `<img class="${cls}" src="${IC(n)}" alt="" loading="lazy" draggable="false">`;

// languages offered through Google Translate (native names)
const LANGS = [
  ['es','Español'],['pt','Português'],['id','Bahasa Indonesia'],['fil','Filipino'],['vi','Tiếng Việt'],['ms','Bahasa Melayu'],
  ['ja','日本語'],['ko','한국어'],['zh-CN','简体中文'],['zh-TW','繁體中文'],['fr','Français'],['de','Deutsch'],['it','Italiano'],
  ['ru','Русский'],['uk','Українська'],['pl','Polski'],['tr','Türkçe'],['ar','العربية'],['hi','हिन्दी'],['bn','বাংলা'],
  ['nl','Nederlands'],['sv','Svenska'],['no','Norsk'],['da','Dansk'],['fi','Suomi'],['cs','Čeština'],['sk','Slovenčina'],
  ['hu','Magyar'],['ro','Română'],['bg','Български'],['el','Ελληνικά'],['he','עברית'],['fa','فارسی'],['ur','اردو'],
  ['ta','தமிழ்'],['te','తెలుగు'],['mr','मराठी'],['gu','ગુજરાતી'],['kn','ಕನ್ನಡ'],['ml','മലയാളം'],['pa','ਪੰਜਾਬੀ'],['ne','नेपाली'],
  ['si','සිංහල'],['my','မြန်မာ'],['km','ខ្មែរ'],['lo','ລາວ'],['mn','Монгол'],['kk','Қазақ'],['uz',"O'zbek"],['az','Azərbaycan'],
  ['ka','ქართული'],['hy','Հայերեն'],['sr','Српски'],['hr','Hrvatski'],['sl','Slovenščina'],['lt','Lietuvių'],['lv','Latviešu'],
  ['et','Eesti'],['is','Íslenska'],['ga','Gaeilge'],['cy','Cymraeg'],['ca','Català'],['eu','Euskara'],['gl','Galego'],
  ['sq','Shqip'],['mk','Македонски'],['bs','Bosanski'],['be','Беларуская'],['af','Afrikaans'],['sw','Kiswahili'],['zu','isiZulu'],
  ['xh','isiXhosa'],['yo','Yorùbá'],['ig','Igbo'],['ha','Hausa'],['am','አማርኛ'],['so','Soomaali'],['mg','Malagasy'],
  ['jw','Basa Jawa'],['su','Basa Sunda'],['ceb','Cebuano'],['haw','ʻŌlelo Hawaiʻi'],['mi','Māori'],['sm','Samoa'],
  ['ht','Kreyòl ayisyen'],['la','Latina'],['eo','Esperanto'],
];
function translateUrl(code){
  const u = location.href.replace(/[?&]_x_tr_[^&#]*/g, '');
  return `https://translate.google.com/translate?sl=auto&tl=${encodeURIComponent(code)}&u=${encodeURIComponent(u)}`;
}
function langPicker(label, note){
  return `<label class="lpick"><span><i class="globe"></i>${label}</span>
    <select data-langpick translate="no"><option value="">—</option>${LANGS.map(([c, n]) => `<option value="${c}">${n}</option>`).join('')}</select>
    ${note ? `<small>${note}</small>` : ''}</label>`;
}
function wireLangPicker(root){
  root.querySelectorAll('select[data-langpick]').forEach(s => s.addEventListener('change', () => {
    if (s.value) window.open(translateUrl(s.value), '_blank', 'noopener');
    s.value = '';
  }));
}

const W = {
en: {
  title: 'Skill Book', sub: 'Every skill of every class: what it does, how it grows from Lv.1 to Lv.10, and when to use it.',
  tabSys: 'Game systems', tabSkills: 'Skill Book', tabPlay: 'Controls & tricks',
  lv: 'Numbers show Lv.1 → Lv.10.', other: 'Read in another language', otherNote: 'Opens this page translated by Google Translate.',
  all: 'All', active: 'Attacks', buff: 'Buffs & heals', passive: 'Passives',
  unlock: 'Unlocks at', cd: 'Cooldown', cdAspd: 'Follows attack speed', sp: 'SP', sec: 's',
  what: 'What it does', review: 'Review',
  kind: {s:'Single target', a:'Area on target', r:'Area around you', l:'Line', b:'Buff', h:'Heal', v:'Revive', c:'Counter', m:'Summon', p:'Passive'},
  el: {fire:'Fire', water:'Water', wind:'Wind', earth:'Earth'},
  xYes: 'Can be an Extra Passive', xNo: 'Not an Extra Passive',
  main: 'Main stats', weapon: 'Weapon', special: 'Special class',
  role: {Swordsman:'Tank with the most HP. Taunts monsters off friends.', Thief:'Fast crits that melt one target.', Archer:'Shoots from far away with some area damage.',
    Mage:'Clears groups of monsters with spells.', Cleric:'Heals, buffs and revives the party.', Merchant:'Slow, heavy melee hits — and earns more Gold.',
    Alchemist:'Throws flasks non-stop and sets up oil combos.', Samurai:'Katana duelist, as strong as Thief on one target.',
    Necromancer:'Summons shadow soldiers to fight for you.', MuayThai:'Kicks, knees and elbows in close combat.'},
},
th: {
  title: 'คัมภีร์สกิล', sub: 'สกิลทุกอันของทุกอาชีพ ทำอะไรได้ แรงขึ้นแค่ไหนจาก Lv.1 ถึง Lv.10 และควรใช้ตอนไหน',
  tabSys: 'ระบบในเกม', tabSkills: 'คัมภีร์สกิล', tabPlay: 'ปุ่มลัดและทริค',
  lv: 'ตัวเลขแสดงเป็น Lv.1 → Lv.10', other: 'อ่านเป็นภาษาอื่น', otherNote: 'เปิดหน้านี้ที่แปลด้วย Google Translate',
  all: 'ทั้งหมด', active: 'โจมตี', buff: 'บัฟและฮีล', passive: 'พาสซีฟ',
  unlock: 'ปลดล็อก', cd: 'คูลดาวน์', cdAspd: 'ตามความเร็วโจมตี', sp: 'SP', sec: 'วิ',
  what: 'ทำอะไรได้', review: 'รีวิว',
  kind: {s:'เป้าเดี่ยว', a:'วงกว้างที่เป้า', r:'วงรอบตัว', l:'แนวตรง', b:'บัฟ', h:'ฮีล', v:'ชุบชีวิต', c:'สวนกลับ', m:'อัญเชิญ', p:'พาสซีฟ'},
  el: {fire:'ไฟ', water:'น้ำ', wind:'ลม', earth:'ดิน'},
  xYes: 'ใส่ Extra Passive ได้', xNo: 'ใส่ Extra Passive ไม่ได้',
  main: 'ค่าหลัก', weapon: 'อาวุธ', special: 'อาชีพพิเศษ',
  role: {Swordsman:'แทงก์ HP เยอะสุด ยั่วมอนให้มาตีตัวเองแทนเพื่อน', Thief:'คริไวรัว ๆ ละลายเป้าเดี่ยว', Archer:'ยิงจากระยะไกล มีดาเมจวงกว้างบ้าง',
    Mage:'กวาดมอนเป็นกลุ่มด้วยเวท', Cleric:'ฮีล บัฟ และชุบชีวิตเพื่อนในปาร์ตี้', Merchant:'ตีประชิดช้าแต่หนัก และได้ Gold มากกว่า',
    Alchemist:'ปาขวดรัว ๆ และวางคอมโบน้ำมัน', Samurai:'นักดาบคาตานะ แรงเท่า Thief ตอนตีเป้าเดี่ยว',
    Necromancer:'อัญเชิญทหารเงามาสู้แทน', MuayThai:'เตะ เข่า ศอก สายประชิด'},
}};
const PRI = {Swordsman:['STR','VIT'], Thief:['AGI','LUK','STR'], Archer:['DEX','AGI','LUK'], Mage:['INT','DEX'], Cleric:['INT','VIT','DEX'], Merchant:['STR','LUK'],
  Alchemist:['INT','AGI'], Samurai:['STR','AGI','LUK'], Necromancer:['INT','DEX'], MuayThai:['STR','VIT','AGI']};
const SC = {STR:'#e0453c', AGI:'#2a9f5e', VIT:'#ee7134', INT:'#3a82e4', DEX:'#8656e0', LUK:'#62ad28'};
const WPN = {en:{sword:'Sword', knife:'Knife', bow:'Bow', rod:'Rod', staff:'Staff', hammer:'Hammer', flask:'Flask', katana:'Katana', skullstaff:'Skull staff', wraps:'Hand wraps'},
  th:{sword:'ดาบ', knife:'มีด', bow:'ธนู', rod:'คทา', staff:'ไม้เท้า', hammer:'ค้อน', flask:'ขวดยา', katana:'คาตานะ', skullstaff:'ไม้เท้ากะโหลก', wraps:'ผ้าพันมือ'}};
const GROUP = k => k === 'p' ? 'passive' : (k === 'b' || k === 'h' || k === 'v' || k === 'm') ? 'buff' : 'active';
const ST = {cls: null, f: 'all'};

function render(ctx){
  const {app, lang, G, H} = ctx, L = W[lang] || W.en, TX = window.HT_SKILLTXT || {}, esc = H.esc;
  const cls = G.classes;
  if (ctx.sec && cls.some(c => c.id === ctx.sec)) ST.cls = ctx.sec;
  if (!ST.cls || !cls.some(c => c.id === ST.cls)) ST.cls = cls[0].id;
  const c = cls.find(x => x.id === ST.cls), li = lang === 'th' ? 6 : 4;
  const skills = c.skills.slice().sort((a, b) => (a.unlock || 0) - (b.unlock || 0));
  const card = s => {
    const t = TX[s.id] || ['', '', '', '', s.desc || '', '', s.desc || '', ''];
    const [k, el, cd, sp] = t, g = GROUP(k);
    if (ST.f !== 'all' && ST.f !== g) return '';
    const cdTxt = !cd ? '' : cd === 'aspd' ? L.cdAspd : `${cd} ${L.sec}`;
    return `<article class="skc g-${g}" style="--c:${c.color}">
      <header>${H.skillIcon(s)}<div class="skc-t"><b translate="no">${esc(s.name)}</b>
        <span class="chips"><i class="ch k">${L.kind[k] || ''}</i>${el ? `<i class="ch el">${img(el, 'gi xs')}${L.el[el]}</i>` : ''}<i class="ch lv">${L.unlock} Lv.${s.unlock || 1}</i></span></div>
        ${k !== 'p' ? `<div class="skc-n">${cdTxt ? `<span><em>${L.cd}</em>${cdTxt}</span>` : ''}${sp ? `<span><em>${L.sp}</em>${sp}</span>` : ''}</div>` : ''}</header>
      <div class="skc-b"><h4>${L.what}</h4><p>${esc(t[li] || '')}</p></div>
      ${t[li + 1] ? `<div class="skc-r"><h4>${img('box_exp', 'gi xs')}${L.review}</h4><p>${esc(t[li + 1])}</p></div>` : ''}
      ${k === 'p' ? `<div class="skc-x ${s.noExtra ? 'no' : 'yes'}">${s.noExtra ? L.xNo : L.xYes}</div>` : ''}
    </article>`;
  };
  app.innerHTML = `<div class="guide skillbook">
    <div class="hub-head"><h1 class="stroke">${L.title}</h1><p>${L.sub}</p></div>
    <nav class="gtabs"><a href="#guide">${L.tabSys}</a><a class="on" href="#skills" aria-current="page">${L.tabSkills}</a><a href="#play">${L.tabPlay}</a></nav>
    <div class="sb-tools">${langPicker(L.other, L.otherNote)}</div>
    <nav class="sb-cls" aria-label="${L.title}">${cls.map(x => `<a href="#skills-${x.id}" class="${x.id === c.id ? 'on' : ''}" style="--c:${x.color}" data-cls="${x.id}"><img src="assets/cls/${x.id}.webp" alt="" loading="lazy"><span translate="no">${esc(x.name)}</span></a>`).join('')}</nav>
    <section class="sb-head" style="--c:${c.color}">
      <img class="sb-emb" src="assets/cls/${c.id}.webp" alt="">
      <div class="sb-info"><h2 class="stroke" translate="no">${esc(c.name)}</h2><p>${L.role[c.id] || ''}</p>
        <div class="sb-meta"><span><em>${L.weapon}</em>${(WPN[lang] || WPN.en)[c.weapon] || c.weapon}</span>
          <span><em>${L.main}</em>${(PRI[c.id] || []).map(k => `<i translate="no" class="sdot cs" style="--sc:${SC[k]}">${k}</i>`).join('')}</span>
          ${c.special ? `<span class="spc">${L.special}</span>` : ''}</div></div>
      <div class="sb-f" role="group">${['all','active','buff','passive'].map(f => `<button type="button" data-f="${f}" class="${ST.f === f ? 'on' : ''}">${L[f]}</button>`).join('')}</div>
    </section>
    <p class="muted sm sb-lv">${L.lv}</p>
    <div class="sb-grid">${skills.map(card).join('')}</div>
  </div>`;
  app.querySelectorAll('.sb-f button').forEach(b => b.addEventListener('click', () => { ST.f = b.dataset.f; const y = scrollY; render(Object.assign({}, ctx, {sec: null})); scrollTo(0, y); }));
  wireLangPicker(app);
}
function open(ctx, sec){ if (sec) { ST.cls = sec; } render(Object.assign({}, ctx, {sec})); }
window.HT_SKILLS = {render, open, langPicker, wireLangPicker, LANGS};
})();
