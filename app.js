// Hunting Together Build Board — app logic.
// Runs on Supabase when config.js has keys, otherwise in demo mode (local sample data).
{
'use strict';
const CFG = window.HT_CONFIG || {};
const SUPA_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';

// ---------- game data (edit here if the game changes) ----------
const CLASSES = [
  {k:'Swordsman',c:'#d8644f'},{k:'Thief',c:'#9b6bd6'},{k:'Archer',c:'#5ea957'},{k:'Mage',c:'#4f8fd8'},
  {k:'Cleric',c:'#d6a93c'},{k:'Merchant',c:'#c98243'},{k:'Alchemist',c:'#3fae98'},{k:'Samurai',c:'#d65577'},
  {k:'Necromancer',c:'#7a6fb0'},{k:'Muay Thai',c:'#c0392b'}];
const STATS = ['STR','AGI','VIT','INT','DEX','LUK'];
const SLOTS = ['Weapon','Helm','Mask','Armor','Cloak','Boots','Ring'];
const TIERS = [{k:'I',c:'#c4c4c4'},{k:'II',c:'#71d46b'},{k:'III',c:'#5aa9ff'},{k:'IV',c:'#c07cff'},{k:'V',c:'#ffa040'},{k:'VI',c:'#ff5a52'}];
const CARD_RAR = [{k:'Normal',c:'#c4c4c4'},{k:'Leader',c:'#71d46b'},{k:'Mini Boss',c:'#c07cff'},{k:'Boss',c:'#ffd257'},{k:'Red',c:'#ff5a52'}];
const OPT_STATS = ['STR','AGI','VIT','INT','DEX','LUK','HP','SP','DEF','MDEF','Evasion',
  'Crit Rate','ATK %','MATK %','DEF Pen','MDEF Pen','ASPD','Cast Speed','Cooldown (CDR)','DMG Reduction',
  'Max HP %','Max SP %','DEF %','SP Cost','Potion Heal','Move Speed','HP Regen','SP Regen','Lifesteal','SP Leech'];
const TAGS = ['Solo','Party','Boss','Farming','AoE','Single Target','Tank','Support','Budget','Endgame'];
const MAX_OPTS = 4, CARD_SLOTS = 8, MAX_TAGS = 6, PAGE = 24;

// ---------- text (English always; Thai only for Thai-language devices in Thailand) ----------
const I18N = {
en:{brandSub:'Build Board',browse:'Browse',share:'Share a build',heroTitle:'Find a build. Share yours.',
heroSub:'Stats, gear, cards and the idea behind every build — free for every hunter.',
demo:'Demo mode — sample builds, saved only on this device.',footer:'Community build board for Hunting Together RPG on Roblox.',
search:'Search builds or players',all:'All classes',sort_new:'Newest',sort_likes:'Most liked',sort_rating:'Top rated',
loadMore:'Load more',loading:'Loading builds…',empty:'No builds yet. Be the first to share one!',
emptyFilter:'No builds match. Try another class or word.',errLoad:"Couldn't load builds. Check your connection and try again.",
errConnect:"Couldn't connect to the build board. Please try again.",retry:'Try again',by:'by',ratings:'ratings',
noRatings:'No ratings yet',yourRating:'Your rating',rateThis:'Rate this build',copyLink:'Copy link',copied:'Link copied!',
report:'Report',edit:'Edit',del:'Delete',back:'Back to builds',stats:'Stats',concept:'Build idea',gear:'Equipment',cards:'Cards',
emptySlot:'Empty',noCards:'No cards',notFound:"This build was removed or doesn't exist.",ownNote:'This is your build.',
ownNoRate:"You can't like or rate your own build.",hiddenNote:'Hidden after reports — only you can see it.',sample:'Sample',
newTitle:'Share your build',editTitle:'Edit your build',basics:'Basics',fRoblox:'Roblox username',fTitle:'Build name',
fTitlePh:'e.g. Crit Thief for bosses',fClass:'Class',pick:'Pick one',fLevel:'Level',statsHint:'Your stat points as shown in the Status window.',
gearHint:"Leave a slot empty if you don't use it.",fItem:'Item name',fTier:'Tier',fRefine:'Refine',addOpt:'Add option',
optStat:'Option',value:'Value',valuePh:'+5%',cardsHint:'Up to 8 cards.',fCard:'Card name',fConcept:'Explain your build',
fConceptPh:'Why these stats? Which skills do you use? What does this build do best?',tagsHint:'Pick up to 6.',tags:'Playstyle',
save:'Publish build',saveEdit:'Save changes',cancel:'Cancel',saving:'Saving…',saved:'Build published!',savedEdit:'Changes saved!',
draftNote:'Your draft is kept on this device.',clearForm:'Clear form',clearQ:'Clear the whole form?',clearMsg:'Everything you typed will be removed.',
eRoblox:'Use 3–20 letters, numbers or _.',eTitle:'Give your build a name (3–60 characters).',eClass:'Pick a class.',
eLevel:'Level must be a whole number from 1.',eStats:'Each stat must be a whole number from 1 to 999.',eFix:'Please fix the fields in red.',
eSave:"Couldn't save. Please try again.",eLimit:"You've reached 10 builds. Delete one to share another.",eAction:'Something went wrong. Please try again.',
delQ:'Delete this build?',delMsg:"This can't be undone.",deleted:'Build deleted.',repQ:'Report this build',
repMsg:"Tell us what's wrong (rude words, fake info, spam).",repSend:'Send report',repDone:"Thanks! We'll check it.",
repAlready:'You already reported this build.',close:'Close',ok:'OK',copyManual:'Copy this link:',maxTags:'You can pick up to 6.'},
th:{brandSub:'บอร์ดบิลด์',browse:'ดูบิลด์',share:'แชร์บิลด์',heroTitle:'หาบิลด์เก่ง ๆ แชร์บิลด์ของคุณ',
heroSub:'สเตตัส ไอเทม การ์ด และแนวคิดของทุกบิลด์ ดูได้ฟรีทุกคน',
demo:'โหมดตัวอย่าง — บิลด์ตัวอย่าง บันทึกแค่ในเครื่องนี้',footer:'บอร์ดบิลด์ของผู้เล่น Hunting Together RPG บน Roblox',
search:'ค้นหาบิลด์หรือชื่อผู้เล่น',all:'ทุกคลาส',sort_new:'ใหม่ล่าสุด',sort_likes:'ไลก์มากสุด',sort_rating:'คะแนนสูงสุด',
loadMore:'โหลดเพิ่ม',loading:'กำลังโหลดบิลด์…',empty:'ยังไม่มีบิลด์ มาแชร์เป็นคนแรกกัน!',
emptyFilter:'ไม่พบบิลด์ ลองคลาสหรือคำอื่น',errLoad:'โหลดบิลด์ไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วลองใหม่',
errConnect:'เชื่อมต่อบอร์ดบิลด์ไม่สำเร็จ ลองใหม่อีกครั้ง',retry:'ลองใหม่',by:'โดย',ratings:'คนให้คะแนน',
noRatings:'ยังไม่มีคะแนน',yourRating:'คะแนนของคุณ',rateThis:'ให้คะแนนบิลด์นี้',copyLink:'คัดลอกลิงก์',copied:'คัดลอกลิงก์แล้ว!',
report:'รายงาน',edit:'แก้ไข',del:'ลบ',back:'กลับไปหน้าบิลด์',stats:'สเตตัส',concept:'แนวคิดบิลด์',gear:'ไอเทมที่สวมใส่',cards:'การ์ด',
emptySlot:'ว่าง',noCards:'ไม่ได้ใส่การ์ด',notFound:'ไม่พบบิลด์นี้ อาจถูกลบไปแล้ว',ownNote:'นี่คือบิลด์ของคุณ',
ownNoRate:'ไลก์หรือให้คะแนนบิลด์ตัวเองไม่ได้',hiddenNote:'ถูกซ่อนเพราะมีคนรายงาน มีแค่คุณที่เห็น',sample:'ตัวอย่าง',
newTitle:'แชร์บิลด์ของคุณ',editTitle:'แก้ไขบิลด์',basics:'ข้อมูลหลัก',fRoblox:'ชื่อผู้ใช้ Roblox',fTitle:'ชื่อบิลด์',
fTitlePh:'เช่น Thief คริติคอลตีบอส',fClass:'คลาส',pick:'เลือก',fLevel:'เลเวล',statsHint:'ใส่ค่าสเตตัสตามหน้าต่าง Status ในเกม',
gearHint:'ช่องไหนไม่ได้ใส่ ปล่อยว่างได้',fItem:'ชื่อไอเทม',fTier:'ระดับ',fRefine:'ตีบวก',addOpt:'เพิ่มออปชัน',
optStat:'ออปชัน',value:'ค่า',valuePh:'+5%',cardsHint:'ใส่การ์ดได้ 8 ใบ',fCard:'ชื่อการ์ด',fConcept:'อธิบายแนวคิดบิลด์',
fConceptPh:'ทำไมอัปสเตตัสแบบนี้ ใช้สกิลอะไร บิลด์นี้เก่งเรื่องอะไร',tagsHint:'เลือกได้สูงสุด 6 อย่าง',tags:'สไตล์การเล่น',
save:'เผยแพร่บิลด์',saveEdit:'บันทึกการแก้ไข',cancel:'ยกเลิก',saving:'กำลังบันทึก…',saved:'เผยแพร่บิลด์แล้ว!',savedEdit:'บันทึกแล้ว!',
draftNote:'ร่างจะถูกเก็บไว้ในเครื่องนี้',clearForm:'ล้างฟอร์ม',clearQ:'ล้างฟอร์มทั้งหมด?',clearMsg:'ข้อมูลที่พิมพ์ไว้จะหายทั้งหมด',
eRoblox:'ใช้ตัวอักษร ตัวเลข หรือ _ 3–20 ตัว',eTitle:'ตั้งชื่อบิลด์ 3–60 ตัวอักษร',eClass:'เลือกคลาส',
eLevel:'เลเวลต้องเป็นจำนวนเต็มตั้งแต่ 1',eStats:'สเตตัสต้องเป็นจำนวนเต็ม 1–999',eFix:'กรุณาแก้ช่องที่เป็นสีแดง',
eSave:'บันทึกไม่สำเร็จ ลองอีกครั้ง',eLimit:'คุณแชร์ครบ 10 บิลด์แล้ว ลบบิลด์เก่าก่อนถึงจะแชร์ใหม่ได้',eAction:'เกิดข้อผิดพลาด ลองอีกครั้ง',
delQ:'ลบบิลด์นี้?',delMsg:'ลบแล้วกู้คืนไม่ได้',deleted:'ลบบิลด์แล้ว',repQ:'รายงานบิลด์นี้',
repMsg:'บอกเราว่าผิดตรงไหน (คำหยาบ ข้อมูลปลอม สแปม)',repSend:'ส่งรายงาน',repDone:'ขอบคุณ! เราจะตรวจสอบ',
repAlready:'คุณรายงานบิลด์นี้แล้ว',close:'ปิด',ok:'ตกลง',copyManual:'คัดลอกลิงก์นี้:',maxTags:'เลือกได้สูงสุด 6 อย่าง'}};

// ---------- helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mem = {};
const store = {
  get(k, d){ if (k in mem) return mem[k]; try { const v = localStorage.getItem(k); if (v != null) return (mem[k] = JSON.parse(v)); } catch (e) {} return d; },
  set(k, v){ mem[k] = v; try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k){ delete mem[k]; try { localStorage.removeItem(k); } catch (e) {} }
};
const newId = () => (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
const clone = o => JSON.parse(JSON.stringify(o));
const clsColor = k => (CLASSES.find(c => c.k === k) || {c:'#888'}).c;
const tierColor = k => (TIERS.find(c => c.k === k) || TIERS[0]).c;
const rarColor = k => (CARD_RAR.find(c => c.k === k) || CARD_RAR[0]).c;
const avg = b => b.rating_count ? b.rating_sum / b.rating_count : 0;

const thOK = (() => { try { return /^th/i.test(navigator.language || '') && Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Bangkok'; } catch (e) { return false; } })();
let lang = thOK ? store.get('ht_lang', 'th') : 'en';
const t = k => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;

const HEART = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const STAR = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';

function ago(iso){
  try {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(lang, {numeric:'auto'});
    const steps = [[60,'second',1],[3600,'minute',60],[86400,'hour',3600],[2592000,'day',86400],[31536000,'month',2592000],[Infinity,'year',31536000]];
    for (const [lim, unit, div] of steps) if (s < lim) return rtf.format(-Math.round(s / div), unit);
  } catch (e) {}
  return '';
}
function starsView(a){
  const p = Math.max(0, Math.min(100, a / 5 * 100));
  return `<span class="sv" aria-label="${a ? a.toFixed(1) : 0} / 5">${STAR.repeat(5)}<span class="fill" style="width:${p}%">${STAR.repeat(5)}</span></span>`;
}
function itemName(it){
  return `<span class="item" style="color:${tierColor(it.tier)}">${it.refine ? '+' + (it.refine | 0) + ' ' : ''}${esc(it.name)} ${esc(it.tier || '')}</span>`;
}
function toast(msg){
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toast.tm); toast.tm = setTimeout(() => el.classList.remove('show'), 2600);
}
function loadScript(src){
  return new Promise((res, rej) => {
    const s = document.createElement('script'); s.src = src; s.async = true;
    const tm = setTimeout(() => rej(new Error('timeout')), 10000);
    s.onload = () => { clearTimeout(tm); res(); }; s.onerror = () => { clearTimeout(tm); rej(new Error('load')); };
    document.head.appendChild(s);
  });
}

// ---------- modal ----------
function modal({title, body = '', okLabel, okClass = 'green', input = false, cancel = true}){
  return new Promise(resolve => {
    const m = $('#modal');
    m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="mhead"><h3 id="mt" class="stroke">${esc(title)}</h3><button class="x" data-m="no" aria-label="${t('close')}">×</button></div>
      <div class="mbody">${body}${input ? '<textarea id="mIn" maxlength="300" style="min-height:100px"></textarea>' : ''}
      <div class="mfoot">${cancel ? `<button class="btn grey" data-m="no">${t('cancel')}</button>` : ''}<button class="btn ${okClass}" data-m="ok">${esc(okLabel || t('ok'))}</button></div></div></div>`;
    m.hidden = false;
    const focusEl = input ? $('#mIn') : $('[data-m="ok"]', m); focusEl && focusEl.focus();
    const done = v => { m.hidden = true; m.innerHTML = ''; m.onclick = null; document.removeEventListener('keydown', onKey); resolve(v); };
    const onKey = e => { if (e.key === 'Escape') done(null); };
    document.addEventListener('keydown', onKey);
    m.onclick = e => {
      const b = e.target.closest('[data-m]');
      if (e.target === m || (b && b.dataset.m === 'no')) return done(null);
      if (b && b.dataset.m === 'ok') done(input ? ($('#mIn').value || '').trim() : true);
    };
  });
}

// ---------- data: demo ----------
function samples(){
  const d = h => new Date(Date.now() - h * 3600e3).toISOString();
  const mk = o => Object.assign({id:newId(), user_id:'sample', _sample:true, hidden:false, tags:[], cards:[], gear:{}, like_count:0, rating_sum:0, rating_count:0}, o);
  return [
    mk({roblox_name:'NightFang_07', title:'Crit Thief for boss hunting', class:'Thief', level:92,
      stats:{STR:60,AGI:120,VIT:20,INT:1,DEX:35,LUK:90},
      concept:'Max AGI first for attack speed, then LUK for Crit Rate. STR only for base damage.\nOpen with Venom Dash so it chains on crit, then keep Cross Rend going. Use Fade when the boss winds up a big hit.',
      gear:{Weapon:{name:'Dagger',tier:'V',refine:8,opts:[{s:'Crit Rate',v:'+6%'},{s:'AGI',v:'+5'},{s:'ATK',v:'+18'}]},
        Head:{name:'Hunter Cap',tier:'IV',refine:4,opts:[{s:'DEF',v:'+12'}]},
        Armor:{name:'Leather Armor',tier:'V',refine:6,opts:[{s:'Evasion',v:'+4%'},{s:'HP',v:'+220'}]},
        Cape:{name:'Wind Cape',tier:'IV',refine:5,opts:[{s:'DMG Reduction',v:'+3%'}]},
        Boots:{name:'Swift Boots',tier:'IV',refine:4,opts:[{s:'Move Speed',v:'+5%'}]},
        Ring:{name:'ATK Ring',tier:'V',refine:3,opts:[{s:'Crit DMG',v:'+10%'}]}},
      cards:[{name:'Wolf Leader',r:'Leader'},{name:'Bandit',r:'Normal'},{name:'Scorpion King',r:'Mini Boss'}],
      tags:['Boss','Single Target','Solo'], like_count:48, rating_sum:203, rating_count:45, created_at:d(5)}),
    mk({roblox_name:'StarlightMia', title:'AoE Mage farmer — clears a zone fast', class:'Mage', level:85,
      stats:{STR:1,AGI:10,VIT:30,INT:120,DEX:90,LUK:1},
      concept:'INT for damage, DEX for cast speed. Pull a big group, then cast your AoE skills in a row.\nKeep a little VIT so you survive when monsters reach you.',
      gear:{Weapon:{name:'Oak Staff',tier:'V',refine:7,opts:[{s:'MATK %',v:'+8%'},{s:'INT',v:'+6'}]},
        Armor:{name:'Mage Robe',tier:'IV',refine:5,opts:[{s:'MDEF',v:'+15'}]},
        Boots:{name:'Cloth Boots',tier:'IV',refine:4,opts:[{s:'DMG Reduction',v:'+2%'}]},
        Ring:{name:'MATK Ring',tier:'V',refine:4,opts:[{s:'Cast Speed',v:'+5%'}]}},
      cards:[{name:'Fire Imp',r:'Normal'},{name:'Frost Leader',r:'Leader'}],
      tags:['Farming','AoE','Solo'], like_count:35, rating_sum:150, rating_count:34, created_at:d(30)}),
    mk({roblox_name:'HolyBun_TH', title:'Party Cleric that keeps everyone alive', class:'Cleric', level:78,
      stats:{STR:1,AGI:1,VIT:80,INT:95,DEX:70,LUK:1},
      concept:'Heals and buffs scale with INT. VIT so bosses cannot one-shot you, DEX so Second Dawn casts faster.\nStand behind the tank and keep Mending Light under the party.',
      gear:{Weapon:{name:'Grimoire',tier:'IV',refine:6,opts:[{s:'INT',v:'+4'}]},
        Armor:{name:'Priest Robe',tier:'IV',refine:5,opts:[{s:'HP',v:'+300'}]},
        Cape:{name:'Holy Cape',tier:'III',refine:4,opts:[{s:'DMG Reduction',v:'+3%'}]}},
      cards:[{name:'Slime',r:'Normal'}],
      tags:['Party','Support','Boss'], like_count:22, rating_sum:92, rating_count:20, created_at:d(52)}),
    mk({roblox_name:'IronWall99', title:'Unkillable Swordsman tank', class:'Swordsman', level:88,
      stats:{STR:70,AGI:15,VIT:130,INT:1,DEX:20,LUK:1},
      concept:'Highest HP in the party. Taunt the boss, use Stone Stance when the big hit comes, War Cry for the team.',
      gear:{Weapon:{name:'Knight Sword',tier:'IV',refine:6,opts:[{s:'ATK',v:'+14'}]},
        Head:{name:'Iron Helm',tier:'V',refine:6,opts:[{s:'DEF',v:'+20'}]},
        Armor:{name:'Plate Armor',tier:'V',refine:7,opts:[{s:'HP',v:'+450'},{s:'DEF',v:'+25'}]},
        Cape:{name:'Guard Cape',tier:'IV',refine:5,opts:[{s:'DMG Reduction',v:'+4%'}]},
        Boots:{name:'Iron Boots',tier:'IV',refine:5,opts:[{s:'DMG Reduction',v:'+3%'}]}},
      cards:[{name:'Stone Golem',r:'Mini Boss'},{name:'Turtle',r:'Normal'}],
      tags:['Tank','Party','Boss'], like_count:17, rating_sum:62, rating_count:15, created_at:d(80)}),
    mk({roblox_name:'CoinKing_', title:'Budget Merchant gold farmer', class:'Merchant', level:64,
      stats:{STR:90,AGI:20,VIT:40,INT:1,DEX:10,LUK:55},
      concept:'Cheap gear only. STR for damage, LUK for crits. Farm one zone with Whirl Axe and enjoy the extra Gold.',
      gear:{Weapon:{name:'Iron Axe',tier:'III',refine:5,opts:[{s:'ATK',v:'+10'}]},
        Armor:{name:'Traveler Vest',tier:'III',refine:4,opts:[]}},
      tags:['Farming','Budget','Solo'], like_count:9, rating_sum:31, rating_count:8, created_at:d(120)})
  ];
}
function DemoAPI(){
  const ME = 'demo-me', KEY = 'ht_demo_v1';
  let db = store.get(KEY, null);
  if (!db || !Array.isArray(db.builds)) { db = {builds:samples(), likes:{}, ratings:{}, reports:{}}; save(); }
  function save(){ store.set(KEY, db); }
  const find = id => db.builds.find(b => b.id === id);
  const sorters = {
    new:(a, b) => String(b.created_at).localeCompare(String(a.created_at)),
    likes:(a, b) => b.like_count - a.like_count || sorters.new(a, b),
    rating:(a, b) => avg(b) - avg(a) || b.rating_count - a.rating_count
  };
  return {
    demo:true,
    async me(){ return ME; },
    async list({cls, q, sort, offset}){
      let a = db.builds.filter(b => !b.hidden || b.user_id === ME);
      if (cls) a = a.filter(b => b.class === cls);
      if (q) { const s = q.toLowerCase(); a = a.filter(b => (b.title + ' ' + b.roblox_name).toLowerCase().includes(s)); }
      return clone(a.sort(sorters[sort] || sorters.new).slice(offset, offset + PAGE));
    },
    async get(id){ const b = find(id); return b ? clone(b) : null; },
    async create(p){
      if (db.builds.filter(b => b.user_id === ME).length >= 10) throw new Error('build limit');
      const n = Object.assign({}, p, {id:newId(), user_id:ME, like_count:0, rating_sum:0, rating_count:0, hidden:false, created_at:new Date().toISOString()});
      db.builds.unshift(n); save(); return clone(n);
    },
    async update(id, p){ const b = find(id); if (!b || b.user_id !== ME) throw new Error('not yours'); Object.assign(b, p, {updated_at:new Date().toISOString()}); save(); return clone(b); },
    async remove(id){ db.builds = db.builds.filter(b => !(b.id === id && b.user_id === ME)); save(); },
    async myState(){ return {likes:new Set(Object.keys(db.likes)), ratings:Object.assign({}, db.ratings), reports:new Set(Object.keys(db.reports))}; },
    async toggleLike(id){
      const b = find(id); if (!b) throw new Error('missing'); if (b.user_id === ME) throw new Error('own build');
      if (db.likes[id]) { delete db.likes[id]; b.like_count = Math.max(0, b.like_count - 1); } else { db.likes[id] = 1; b.like_count++; }
      save(); return {liked:!!db.likes[id], like_count:b.like_count};
    },
    async rate(id, s){
      const b = find(id); if (!b) throw new Error('missing'); if (b.user_id === ME) throw new Error('own build');
      const old = db.ratings[id];
      if (old) b.rating_sum += s - old; else { b.rating_sum += s; b.rating_count++; }
      db.ratings[id] = s; save(); return {rating_sum:b.rating_sum, rating_count:b.rating_count};
    },
    async report(id){ db.reports[id] = 1; save(); return true; }
  };
}

// ---------- data: Supabase ----------
function SupaAPI(sb){
  let meId = null;
  const FIELDS = 'id,user_id,roblox_name,title,class,level,stats,concept,gear,cards,tags,like_count,rating_sum,rating_count,rating_avg,hidden,created_at,updated_at';
  const chk = r => { if (r.error) throw r.error; return r.data; };
  async function me(force){
    if (meId) return meId;
    const {data} = await sb.auth.getSession();
    if (data && data.session) return (meId = data.session.user.id);
    if (!force) return null;
    const r = await sb.auth.signInAnonymously();
    if (r.error) throw r.error;
    return (meId = r.data.user.id);
  }
  return {
    demo:false, me,
    async list({cls, q, sort, offset}){
      let x = sb.from('builds').select(FIELDS).eq('hidden', false);
      if (cls) x = x.eq('class', cls);
      const s = String(q || '').replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 40);
      if (s) x = x.or(`title.ilike."*${s}*",roblox_name.ilike."*${s}*"`);
      if (sort === 'likes') x = x.order('like_count', {ascending:false}).order('created_at', {ascending:false});
      else if (sort === 'rating') x = x.order('rating_avg', {ascending:false}).order('rating_count', {ascending:false});
      else x = x.order('created_at', {ascending:false});
      return chk(await x.range(offset, offset + PAGE - 1));
    },
    async get(id){ return chk(await sb.from('builds').select(FIELDS).eq('id', id).maybeSingle()); },
    async create(p){ await me(true); return chk(await sb.from('builds').insert(p).select(FIELDS).single()); },
    async update(id, p){ await me(true); return chk(await sb.from('builds').update(p).eq('id', id).select(FIELDS).single()); },
    async remove(id){ await me(true); chk(await sb.from('builds').delete().eq('id', id)); },
    async myState(){
      const id = await me(false);
      const st = {likes:new Set(), ratings:{}, reports:new Set()};
      if (!id) return st;
      const [l, r, p] = await Promise.all([
        sb.from('likes').select('build_id').eq('user_id', id),
        sb.from('ratings').select('build_id,stars').eq('user_id', id),
        sb.from('reports').select('build_id').eq('user_id', id)]);
      (l.data || []).forEach(x => st.likes.add(x.build_id));
      (r.data || []).forEach(x => { st.ratings[x.build_id] = x.stars; });
      (p.data || []).forEach(x => st.reports.add(x.build_id));
      return st;
    },
    async toggleLike(id){ await me(true); return chk(await sb.rpc('toggle_like', {p_build:id})); },
    async rate(id, s){ await me(true); return chk(await sb.rpc('rate_build', {p_build:id, p_stars:s})); },
    async report(id, reason){ await me(true); return chk(await sb.rpc('report_build', {p_build:id, p_reason:reason})); }
  };
}

// ---------- state ----------
const S = {api:null, me:null, mine:{likes:new Set(), ratings:{}, reports:new Set()},
  filter:{cls:'', q:'', sort:'new'}, list:[], offset:0, more:false, loading:false, err:false, listKey:null,
  cur:null, edit:null, view:'', scrollY:0, busy:{}};
const app = $('#app');
const key = () => JSON.stringify(S.filter);
const errMsg = e => String((e && (e.message || e.msg)) || '');

// ---------- list ----------
function cardHTML(b){
  const w = b.gear && b.gear.Weapon;
  const top = STATS.map(k => [k, +(b.stats && b.stats[k]) || 0]).sort((a, c) => c[1] - a[1]).slice(0, 3);
  const mx = Math.max(1, ...top.map(x => x[1]));
  const a = avg(b);
  return `<article class="bcard" style="--c:${clsColor(b.class)}">
    <a class="cover" href="#build-${esc(b.id)}" aria-label="${esc(b.title)}"></a>
    <div class="bc-top"><span class="cls">${esc(b.class)}</span><span class="lv">Lv. ${b.level | 0}</span>${b._sample ? `<span class="samp">${t('sample')}</span>` : ''}</div>
    <h3>${esc(b.title)}</h3>
    <div class="by">${t('by')} <b>${esc(b.roblox_name)}</b> · ${ago(b.created_at)}</div>
    <div class="mini">${top.map(([k, v]) => `<div class="mrow"><span>${k}</span><i><b style="width:${v / mx * 100}%"></b></i><em>${v}</em></div>`).join('')}</div>
    ${w && w.name ? `<div class="wpn">${itemName(w)}</div>` : ''}
    <div class="bc-foot">${likeBtn(b, 'sm')}${starsView(a)}<span class="rc">${b.rating_count ? a.toFixed(1) : '–'}</span></div>
  </article>`;
}
function likeBtn(b, size){
  const mine = S.me && b.user_id === S.me, on = S.mine.likes.has(b.id);
  return `<button class="like ${size}${on ? ' on' : ''}" data-like="${esc(b.id)}" aria-pressed="${on}" ${mine ? `disabled title="${t('ownNoRate')}"` : ''}>${HEART}<span>${b.like_count | 0}</span></button>`;
}
function viewList(){
  $('#hero').hidden = false;
  app.innerHTML = `<div class="filters">
    <div class="searchrow"><input id="q" type="search" placeholder="${t('search')}" value="${esc(S.filter.q)}" autocomplete="off" maxlength="40" aria-label="${t('search')}">
      <div class="tabs">${['new','likes','rating'].map(k => `<button class="btn sm ${S.filter.sort === k ? 'orange' : 'grey'}" data-sort="${k}">${t('sort_' + k)}</button>`).join('')}</div></div>
    <div class="chips scroll">${[{k:'', c:'#ddd'}, ...CLASSES].map(c => `<button class="chip${S.filter.cls === c.k ? ' on' : ''}" data-cls="${c.k}" style="--c:${c.c}">${c.k || t('all')}</button>`).join('')}</div>
  </div><div id="grid" class="grid"></div><div id="listFoot" class="listfoot"></div>`;
  if (S.listKey === key() && S.list.length) { renderGrid(); requestAnimationFrame(() => scrollTo(0, S.scrollY)); }
  else loadList(true);
}
let reqId = 0;
async function loadList(reset){
  const my = ++reqId;
  if (reset) { S.offset = 0; S.list = []; S.more = false; }
  S.loading = true; S.err = false; renderGrid();
  const tm = setTimeout(() => { if (my === reqId && S.loading) { S.loading = false; S.err = true; renderGrid(); } }, 10000);
  try {
    const rows = await S.api.list(Object.assign({}, S.filter, {offset:S.offset}));
    if (my !== reqId) return;
    S.list = S.list.concat(rows); S.offset += rows.length; S.more = rows.length === PAGE; S.listKey = key(); S.err = false;
  } catch (e) { if (my === reqId) { S.err = true; console.error(e); } }
  finally { clearTimeout(tm); if (my === reqId) { S.loading = false; renderGrid(); } }
}
function renderGrid(){
  const g = $('#grid'), f = $('#listFoot'); if (!g || !f) return;
  g.innerHTML = S.list.length ? S.list.map(cardHTML).join('') : (S.loading ? '<div class="skel"></div>'.repeat(6) : '');
  let foot = '';
  if (S.loading) foot = S.list.length ? `<p class="muted">${t('loading')}</p>` : '';
  else if (S.err) foot = `<div class="empty"><p>${t('errLoad')}</p><button class="btn blue" data-act="retry">${t('retry')}</button></div>`;
  else if (!S.list.length) foot = `<div class="empty"><p>${S.filter.cls || S.filter.q ? t('emptyFilter') : t('empty')}</p><a class="btn green" href="#new">${t('share')}</a></div>`;
  else if (S.more) foot = `<button class="btn blue" data-act="more">${t('loadMore')}</button>`;
  f.innerHTML = foot;
}

// ---------- detail ----------
async function viewDetail(id){
  $('#hero').hidden = true;
  let b = S.list.find(x => x.id === id) || (S.cur && S.cur.id === id ? S.cur : null);
  if (b) { S.cur = b; renderDetail(); } else app.innerHTML = `<p class="muted center" style="padding:40px 0">${t('loading')}</p>`;
  try { const fresh = await S.api.get(id); b = fresh || null; }
  catch (e) { console.error(e); if (!b) { app.innerHTML = `<div class="empty"><p>${t('errLoad')}</p><button class="btn blue" data-act="reroute">${t('retry')}</button></div>`; return; } }
  if (location.hash !== '#build-' + id) return;
  if (!b) { app.innerHTML = `<div class="empty"><p>${t('notFound')}</p><a class="btn blue" href="#">${t('back')}</a></div>`; return; }
  S.cur = b; renderDetail();
}
function gearLi(slot, it){
  if (!it || !it.name) return `<li class="g"><span class="slot">${slot}</span><span class="muted">${t('emptySlot')}</span></li>`;
  const opts = (it.opts || []).filter(o => o && o.s);
  return `<li class="g"><span class="slot">${slot}</span><div><div class="iname">${itemName(it)}</div>${opts.length ? `<ul class="opts">${opts.map(o => `<li>${esc(o.s)} <b>${esc(o.v)}</b></li>`).join('')}</ul>` : ''}</div></li>`;
}
function renderDetail(){
  const b = S.cur, mine = S.me && b.user_id === S.me, myR = S.mine.ratings[b.id] || 0, a = avg(b);
  const mx = Math.max(150, ...STATS.map(k => +(b.stats && b.stats[k]) || 0));
  const cards = (b.cards || []).filter(c => c && c.name);
  app.innerHTML = `<a class="backlink" href="#">← ${t('back')}</a>
  <section class="panel dhead" style="--c:${clsColor(b.class)}">
    <div class="dh-l">
      <div class="bc-top"><span class="cls">${esc(b.class)}</span><span class="lv">Lv. ${b.level | 0}</span>${b._sample ? `<span class="samp">${t('sample')}</span>` : ''}</div>
      <h1 class="stroke">${esc(b.title)}</h1>
      <div class="by">${t('by')} <b>${esc(b.roblox_name)}</b> · ${ago(b.created_at)}</div>
      ${b.tags && b.tags.length ? `<div class="tags">${b.tags.map(x => `<span class="tag">${esc(x)}</span>`).join('')}</div>` : ''}
    </div>
    <div class="dh-r">
      <div class="scorebox"><div class="big">${b.rating_count ? a.toFixed(1) : '–'}</div>${starsView(a)}<div class="muted sm">${b.rating_count ? `${b.rating_count} ${t('ratings')}` : t('noRatings')}</div></div>
      ${likeBtn(b, 'big')}
    </div>
  </section>
  ${mine ? `<p class="note">${b.hidden ? t('hiddenNote') : t('ownNote')} ${t('ownNoRate')}</p>`
    : `<section class="panel rate"><span>${myR ? t('yourRating') : t('rateThis')}</span>
      <div class="rstars" role="group" aria-label="${t('rateThis')}">${[1,2,3,4,5].map(n => `<button class="rs${n <= myR ? ' on' : ''}" data-rate="${n}" aria-label="${n} / 5" aria-pressed="${n === myR}">${STAR}</button>`).join('')}</div></section>`}
  <div class="dgrid">
    <div class="dcol">
      <section class="panel"><h2 class="stroke">${t('stats')}</h2><div class="sbars">${STATS.map(k => { const v = +(b.stats && b.stats[k]) || 0; return `<div class="srow"><span>${k}</span><i><b style="width:${v / mx * 100}%"></b></i><em>${v}</em></div>`; }).join('')}</div></section>
      <section class="panel"><h2 class="stroke">${t('concept')}</h2><p class="concept">${esc(b.concept || '—')}</p></section>
    </div>
    <div class="dcol">
      <section class="panel"><h2 class="stroke">${t('gear')}</h2><ul class="gear">${SLOTS.map(s => gearLi(s, b.gear && b.gear[s])).join('')}</ul></section>
      <section class="panel"><h2 class="stroke">${t('cards')}</h2>${cards.length ? `<ul class="cardlist">${cards.map(c => `<li><span class="dot" style="--c:${rarColor(c.r)}"></span><span style="color:${rarColor(c.r)}">${esc(c.name)}</span></li>`).join('')}</ul>` : `<p class="muted" style="margin:0">${t('noCards')}</p>`}</section>
    </div>
  </div>
  <div class="dactions"><button class="btn blue" data-act="copy">${t('copyLink')}</button>
    ${mine ? `<a class="btn orange" href="#edit-${esc(b.id)}">${t('edit')}</a><button class="btn red" data-act="del">${t('del')}</button>`
      : (b._sample ? '' : `<button class="btn grey" data-act="report">${t('report')}</button>`)}</div>`;
}

// ---------- editor ----------
function blank(){ return {roblox_name:store.get('ht_name', ''), title:'', class:'', level:'', stats:Object.fromEntries(STATS.map(k => [k, ''])), concept:'', gear:{}, cards:[], tags:[]}; }
async function viewEditor(id){
  $('#hero').hidden = true;
  let d;
  if (id) {
    let b = S.cur && S.cur.id === id ? S.cur : null;
    if (!b) { app.innerHTML = `<p class="muted center" style="padding:40px 0">${t('loading')}</p>`; b = await S.api.get(id).catch(() => null); }
    if (location.hash !== '#edit-' + id) return;
    if (!b || !S.me || b.user_id !== S.me) { app.innerHTML = `<div class="empty"><p>${t('notFound')}</p><a class="btn blue" href="#">${t('back')}</a></div>`; return; }
    d = clone(b);
  } else d = store.get('ht_draft', null) || blank();
  d.gear = d.gear || {}; d.cards = d.cards || []; d.tags = d.tags || []; d.stats = d.stats || {};
  S.edit = {id, d}; renderEditor();
}
const optSel = (name, cur, list) => `<select data-f="${name}"><option value="">—</option>${list.map(o => `<option${o === cur ? ' selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
function slotHTML(slot){
  const it = S.edit.d.gear[slot] || {}, opts = it.opts || [];
  return `<div class="slotbox" id="slot-${slot}"><div class="slothead">${slot}</div>
    <div class="itemrow">
      <input data-f="gear.${slot}.name" value="${esc(it.name || '')}" placeholder="${t('fItem')}" maxlength="40" aria-label="${slot} ${t('fItem')}">
      <select data-f="gear.${slot}.tier" aria-label="${t('fTier')}">${TIERS.map(x => `<option value="${x.k}"${(it.tier || 'I') === x.k ? ' selected' : ''}>${t('fTier')} ${x.k}</option>`).join('')}</select>
      <select data-f="gear.${slot}.refine" aria-label="${t('fRefine')}">${Array.from({length:16}, (_, i) => `<option value="${i}"${(+it.refine || 0) === i ? ' selected' : ''}>+${i}</option>`).join('')}</select>
    </div>
    ${opts.map((o, i) => `<div class="optrow">${optSel(`gear.${slot}.opts.${i}.s`, o.s, OPT_STATS)}<input data-f="gear.${slot}.opts.${i}.v" value="${esc(o.v || '')}" placeholder="${t('valuePh')}" maxlength="10" aria-label="${t('value')}"><button type="button" class="x" data-delopt="${slot}:${i}" aria-label="${t('del')}">×</button></div>`).join('')}
    ${opts.length < MAX_OPTS ? `<div><button type="button" class="btn sm blue" data-addopt="${slot}">+ ${t('addOpt')}</button></div>` : ''}
  </div>`;
}
function renderEditor(){
  const {id, d} = S.edit;
  app.innerHTML = `<form class="ed" id="edForm" novalidate>
    <a class="backlink" href="${id ? '#build-' + esc(id) : '#'}">← ${id ? t('cancel') : t('back')}</a>
    <h1 class="stroke">${id ? t('editTitle') : t('newTitle')}</h1>
    <section class="panel"><h2 class="stroke">${t('basics')}</h2>
      <div class="f2">
        <div><label for="fR">${t('fRoblox')}</label><input id="fR" data-f="roblox_name" value="${esc(d.roblox_name)}" maxlength="20" autocomplete="username" autocapitalize="off"></div>
        <div><label for="fT">${t('fTitle')}</label><input id="fT" data-f="title" value="${esc(d.title)}" maxlength="60" placeholder="${t('fTitlePh')}"></div>
        <div><label for="fC">${t('fClass')}</label><select id="fC" data-f="class"><option value="">${t('pick')}</option>${CLASSES.map(c => `<option${c.k === d.class ? ' selected' : ''}>${c.k}</option>`).join('')}</select></div>
        <div><label for="fL">${t('fLevel')}</label><input id="fL" data-f="level" type="number" inputmode="numeric" min="1" max="999" value="${esc(d.level)}"></div>
      </div></section>
    <section class="panel"><h2 class="stroke">${t('stats')}</h2><p class="hint">${t('statsHint')}</p>
      <div class="f6">${STATS.map(k => `<div><label for="s${k}">${k}</label><input id="s${k}" data-f="stats.${k}" type="number" inputmode="numeric" min="1" max="999" value="${esc(d.stats[k])}"></div>`).join('')}</div>
      <p class="err" id="statsErr" hidden></p></section>
    <section class="panel"><h2 class="stroke">${t('gear')}</h2><p class="hint">${t('gearHint')}</p>${SLOTS.map(slotHTML).join('')}</section>
    <section class="panel"><h2 class="stroke">${t('cards')}</h2><p class="hint">${t('cardsHint')}</p>
      ${Array.from({length:CARD_SLOTS}, (_, i) => { const c = d.cards[i] || {}; return `<div class="cardrow"><span class="n">${i + 1}</span>
        <input data-f="cards.${i}.name" value="${esc(c.name || '')}" placeholder="${t('fCard')}" maxlength="40" aria-label="${t('fCard')} ${i + 1}">
        <select data-f="cards.${i}.r" aria-label="Rarity">${CARD_RAR.map(r => `<option${(c.r || 'Normal') === r.k ? ' selected' : ''}>${r.k}</option>`).join('')}</select></div>`; }).join('')}
    </section>
    <section class="panel"><h2 class="stroke">${t('concept')}</h2>
      <label for="fX">${t('fConcept')}</label><textarea id="fX" data-f="concept" maxlength="2000" placeholder="${t('fConceptPh')}">${esc(d.concept)}</textarea>
      <div class="count" id="cnt">${(d.concept || '').length} / 2000</div>
      <label style="margin-top:14px">${t('tags')} <span class="muted">· ${t('tagsHint')}</span></label>
      <div class="taggrid">${TAGS.map(x => `<label class="tgl"><input type="checkbox" data-tag="${x}"${d.tags.includes(x) ? ' checked' : ''}><span>${x}</span></label>`).join('')}</div>
    </section>
    <p class="err" id="formErr" hidden></p>
    <div class="edfoot"><div class="l"><button class="btn green" id="saveBtn" type="submit">${id ? t('saveEdit') : t('save')}</button>
      <a class="btn grey" href="${id ? '#build-' + esc(id) : '#'}">${t('cancel')}</a></div>
      ${id ? '' : `<span class="muted sm">${t('draftNote')} <button type="button" class="btn sm red" data-act="clear">${t('clearForm')}</button></span>`}</div>
  </form>`;
}
function setPath(o, path, v){
  const ks = path.split('.');
  let cur = o;
  for (let i = 0; i < ks.length - 1; i++) {
    const k = ks[i], nextNum = /^\d+$/.test(ks[i + 1]);
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = nextNum ? [] : {};
    cur = cur[k];
  }
  cur[ks[ks.length - 1]] = v;
}
let draftTm;
function saveDraft(){
  clearTimeout(draftTm);
  if (S.edit && !S.edit.id) { const d = S.edit.d; draftTm = setTimeout(() => { if (S.edit && S.edit.d === d) store.set('ht_draft', d); }, 300); }
}
function validate(d){
  const e = {};
  if (!/^[A-Za-z0-9_]{3,20}$/.test(String(d.roblox_name || '').trim())) e.roblox_name = t('eRoblox');
  const tl = String(d.title || '').trim(); if (tl.length < 3 || tl.length > 60) e.title = t('eTitle');
  if (!CLASSES.some(c => c.k === d.class)) e.class = t('eClass');
  const lv = Number(d.level); if (!Number.isInteger(lv) || lv < 1 || lv > 999) e.level = t('eLevel');
  for (const k of STATS) { const v = Number(d.stats[k]); if (String(d.stats[k]).trim() === '' || !Number.isInteger(v) || v < 1 || v > 999) e['stats.' + k] = t('eStats'); }
  return e;
}
function cleanBuild(d){
  const gear = {};
  for (const s of SLOTS) {
    const it = d.gear[s];
    if (it && String(it.name || '').trim()) gear[s] = {
      name:String(it.name).trim().slice(0, 40), tier:TIERS.some(x => x.k === it.tier) ? it.tier : 'I',
      refine:Math.min(15, Math.max(0, parseInt(it.refine, 10) || 0)),
      opts:(it.opts || []).filter(o => o && OPT_STATS.includes(o.s) && String(o.v || '').trim()).slice(0, MAX_OPTS).map(o => ({s:o.s, v:String(o.v).trim().slice(0, 10)}))
    };
  }
  const cards = (d.cards || []).slice(0, CARD_SLOTS).filter(c => c && String(c.name || '').trim())
    .map(c => ({name:String(c.name).trim().slice(0, 40), r:CARD_RAR.some(r => r.k === c.r) ? c.r : 'Normal'}));
  return {roblox_name:String(d.roblox_name).trim(), title:String(d.title).trim(), class:d.class, level:Number(d.level),
    stats:Object.fromEntries(STATS.map(k => [k, Number(d.stats[k])])), concept:String(d.concept || '').trim().slice(0, 2000),
    gear, cards, tags:(d.tags || []).filter(x => TAGS.includes(x)).slice(0, MAX_TAGS)};
}
async function submitEditor(){
  const {id, d} = S.edit, e = validate(d);
  $$('#edForm .bad').forEach(x => x.classList.remove('bad'));
  $$('#edForm .err.f').forEach(x => x.remove());
  const se = $('#statsErr'), fe = $('#formErr');
  se.hidden = true; fe.hidden = true;
  if (Object.keys(e).length) {
    for (const [k, msg] of Object.entries(e)) {
      const el = $(`#edForm [data-f="${k}"]`); if (!el) continue; el.classList.add('bad');
      if (k.startsWith('stats.')) { se.textContent = msg; se.hidden = false; }
      else el.insertAdjacentHTML('afterend', `<p class="err f">${esc(msg)}</p>`);
    }
    fe.textContent = t('eFix'); fe.hidden = false;
    const first = $('#edForm .bad'); if (first) { first.scrollIntoView({block:'center', behavior:'smooth'}); first.focus({preventScroll:true}); }
    return;
  }
  const btn = $('#saveBtn'); btn.disabled = true; btn.textContent = t('saving');
  try {
    const p = cleanBuild(d);
    const saved = id ? await S.api.update(id, p) : await S.api.create(p);
    if (!S.me) S.me = await S.api.me(false);
    store.set('ht_name', p.roblox_name);
    if (!id) { clearTimeout(draftTm); store.del('ht_draft'); }
    S.cur = saved; S.listKey = null; S.edit = null;
    toast(id ? t('savedEdit') : t('saved'));
    location.hash = '#build-' + saved.id;
  } catch (err) {
    console.error(err);
    fe.textContent = /build limit/i.test(errMsg(err)) ? t('eLimit') : t('eSave'); fe.hidden = false;
    btn.disabled = false; btn.textContent = id ? t('saveEdit') : t('save');
  }
}

// ---------- like / rate / report / delete ----------
function findBuild(id){ return S.list.find(x => x.id === id) || (S.cur && S.cur.id === id ? S.cur : null); }
function applyLike(id, liked, count){
  if (liked) S.mine.likes.add(id); else S.mine.likes.delete(id);
  S.list.forEach(x => { if (x.id === id) x.like_count = count; });
  if (S.cur && S.cur.id === id) S.cur.like_count = count;
  $$(`[data-like="${CSS.escape(id)}"]`).forEach(btn => { btn.classList.toggle('on', liked); btn.setAttribute('aria-pressed', liked); btn.querySelector('span').textContent = count; });
}
async function onLike(id){
  const b = findBuild(id); if (!b || S.busy[id]) return;
  if (S.me && b.user_id === S.me) return toast(t('ownNoRate'));
  S.busy[id] = 1;
  const was = S.mine.likes.has(id), before = b.like_count | 0;
  applyLike(id, !was, Math.max(0, before + (was ? -1 : 1)));
  try {
    const r = await S.api.toggleLike(id);
    applyLike(id, !!r.liked, r.like_count | 0);
    if (!S.me) S.me = await S.api.me(false);
  } catch (e) {
    console.error(e); applyLike(id, was, before);
    toast(/own build/i.test(errMsg(e)) ? t('ownNoRate') : t('eAction'));
  } finally { delete S.busy[id]; }
}
async function onRate(n){
  const b = S.cur; if (!b || S.busy['r' + b.id]) return;
  S.busy['r' + b.id] = 1;
  const prev = S.mine.ratings[b.id], snap = {s:b.rating_sum, c:b.rating_count};
  if (prev) b.rating_sum += n - prev; else { b.rating_sum += n; b.rating_count++; }
  S.mine.ratings[b.id] = n; renderDetail();
  try {
    const r = await S.api.rate(b.id, n);
    b.rating_sum = r.rating_sum | 0; b.rating_count = r.rating_count | 0;
    S.list.forEach(x => { if (x.id === b.id) { x.rating_sum = b.rating_sum; x.rating_count = b.rating_count; } });
    if (!S.me) S.me = await S.api.me(false);
  } catch (e) {
    console.error(e); b.rating_sum = snap.s; b.rating_count = snap.c;
    if (prev) S.mine.ratings[b.id] = prev; else delete S.mine.ratings[b.id];
    toast(/own build/i.test(errMsg(e)) ? t('ownNoRate') : t('eAction'));
  } finally { delete S.busy['r' + b.id]; if (location.hash === '#build-' + b.id) renderDetail(); }
}
async function onCopy(){
  const url = location.href.split('#')[0] + '#build-' + S.cur.id;
  try { await navigator.clipboard.writeText(url); toast(t('copied')); }
  catch (e) { modal({title:t('copyLink'), body:`<p>${t('copyManual')}</p><input readonly value="${esc(url)}" onclick="this.select()">`, cancel:false, okClass:'blue'}); }
}
async function onDelete(){
  const b = S.cur; if (!b) return;
  if (!await modal({title:t('delQ'), body:`<p>${t('delMsg')}</p>`, okLabel:t('del'), okClass:'red'})) return;
  try { await S.api.remove(b.id); S.list = S.list.filter(x => x.id !== b.id); S.cur = null; toast(t('deleted')); location.hash = '#'; }
  catch (e) { console.error(e); toast(t('eAction')); }
}
async function onReport(){
  const b = S.cur; if (!b) return;
  if (S.mine.reports.has(b.id)) return toast(t('repAlready'));
  const reason = await modal({title:t('repQ'), body:`<p>${t('repMsg')}</p>`, okLabel:t('repSend'), okClass:'red', input:true});
  if (reason === null) return;
  try { await S.api.report(b.id, reason.slice(0, 300)); S.mine.reports.add(b.id); toast(t('repDone')); }
  catch (e) { console.error(e); toast(t('eAction')); }
}

// ---------- events ----------
let qTm;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q') { clearTimeout(qTm); qTm = setTimeout(() => { S.filter.q = el.value.trim(); loadList(true); }, 300); return; }
  if (!S.edit || !el.closest('#edForm')) return;
  if (el.dataset.f) {
    setPath(S.edit.d, el.dataset.f, el.value);
    if (el.classList.contains('bad')) {
      el.classList.remove('bad');
      const n = el.nextElementSibling; if (n && n.matches('.err.f')) n.remove();
      if (el.dataset.f.startsWith('stats.') && !$('#edForm .f6 .bad')) $('#statsErr').hidden = true;
      if (!$('#edForm .bad')) $('#formErr').hidden = true;
    }
    if (el.id === 'fX') $('#cnt').textContent = `${el.value.length} / 2000`; saveDraft(); }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (!S.edit || !el.closest('#edForm')) return;
  if (el.dataset.tag) {
    const tags = S.edit.d.tags;
    if (el.checked) { if (tags.length >= MAX_TAGS) { el.checked = false; return toast(t('maxTags')); } tags.push(el.dataset.tag); }
    else S.edit.d.tags = tags.filter(x => x !== el.dataset.tag);
    saveDraft();
  } else if (el.dataset.f) { setPath(S.edit.d, el.dataset.f, el.value); saveDraft(); }
});
document.addEventListener('submit', e => { if (e.target.id === 'edForm') { e.preventDefault(); submitEditor(); } });
document.addEventListener('click', async e => {
  const el = e.target.closest('button,[data-like]'); if (!el) return;
  if (el.id === 'langBtn') { lang = lang === 'th' ? 'en' : 'th'; store.set('ht_lang', lang); applyI18n(); return route(true); }
  if (el.dataset.like) { e.preventDefault(); return onLike(el.dataset.like); }
  if (el.dataset.rate) return onRate(+el.dataset.rate);
  if (el.dataset.sort) { S.filter.sort = el.dataset.sort; $$('[data-sort]').forEach(b => { b.classList.toggle('orange', b === el); b.classList.toggle('grey', b !== el); }); return loadList(true); }
  if (el.dataset.cls !== undefined && el.classList.contains('chip')) { S.filter.cls = el.dataset.cls; $$('.chip').forEach(c => c.classList.toggle('on', c === el)); return loadList(true); }
  if (el.dataset.addopt) {
    const s = el.dataset.addopt, g = S.edit.d.gear; g[s] = g[s] || {name:'', tier:'I', refine:0, opts:[]}; g[s].opts = g[s].opts || [];
    if (g[s].opts.length < MAX_OPTS) g[s].opts.push({s:'', v:''});
    $('#slot-' + s).outerHTML = slotHTML(s); saveDraft();
    const rows = $$(`#slot-${s} .optrow select`); if (rows.length) rows[rows.length - 1].focus();
    return;
  }
  if (el.dataset.delopt) { const [s, i] = el.dataset.delopt.split(':'); S.edit.d.gear[s].opts.splice(+i, 1); $('#slot-' + s).outerHTML = slotHTML(s); saveDraft(); return; }
  const act = el.dataset.act;
  if (act === 'retry') return loadList(true);
  if (act === 'more') return loadList(false);
  if (act === 'reroute') return route(true);
  if (act === 'copy') return onCopy();
  if (act === 'del') return onDelete();
  if (act === 'report') return onReport();
  if (act === 'clear') {
    if (!await modal({title:t('clearQ'), body:`<p>${t('clearMsg')}</p>`, okLabel:t('clearForm'), okClass:'red'})) return;
    store.del('ht_draft'); S.edit = {id:null, d:blank()}; renderEditor(); scrollTo(0, 0);
  }
});

// ---------- routing + start ----------
function applyI18n(){
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  const lb = $('#langBtn'); lb.hidden = !thOK; lb.textContent = lang === 'th' ? 'EN' : 'ไทย';
}
function route(force){
  const h = decodeURIComponent(location.hash.slice(1));
  const next = h.startsWith('build-') ? 'detail' : h === 'new' ? 'new' : h.startsWith('edit-') ? 'edit' : 'list';
  if (S.view === 'list' && next !== 'list') S.scrollY = scrollY;
  S.view = next;
  if (next !== 'new' && next !== 'edit') S.edit = null;
  if (next === 'list') return viewList();
  scrollTo(0, 0);
  if (next === 'detail') return viewDetail(h.slice(6));
  if (next === 'new') return viewEditor(null);
  return viewEditor(h.slice(5));
}
async function init(){
  applyI18n();
  if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
    try {
      await loadScript(SUPA_CDN);
      S.api = SupaAPI(window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {auth:{persistSession:true, autoRefreshToken:true}}));
    } catch (e) {
      console.error(e);
      app.innerHTML = `<div class="empty"><p>${t('errConnect')}</p><button class="btn blue" onclick="location.reload()">${t('retry')}</button></div>`;
      return;
    }
  } else { S.api = DemoAPI(); $('#modeNote').hidden = false; }
  try { S.me = await S.api.me(false); S.mine = await S.api.myState(); } catch (e) { console.error(e); }
  route();
  addEventListener('hashchange', () => route());
}
init();
}
