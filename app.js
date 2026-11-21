// Hunting Together Build Board — app logic (v2: drag-and-drop builder on real game data).
// Game rules and icons come from game-data.js (exported from the game). Data lives in Supabase.
{
'use strict';
const CFG = window.HT_CONFIG || {};
const G = window.HT_GAME;
const SUPA_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
const ICON_BASE = (CFG.SUPABASE_URL || 'https://pjzzrpwfftoplfbpbjgz.supabase.co') + '/storage/v1/object/public/icons/';
const icon = id => id ? ICON_BASE + id + '.png' : '';

// ---------- game data helpers ----------
const STATS = ['STR','AGI','VIT','INT','DEX','LUK'];
const SLOTS = ['Weapon','Helm','Mask','Armor','Cloak','Boots','Ring','Ring2'];
// same layout as the in-game Bag screen: left column / right column (2 ring slots = Acc. 1 + Acc. 2)
const SLOT_L = ['Helm','Weapon','Cloak','Ring'], SLOT_R = ['Mask','Armor','Boots','Ring2'];
const SLOT_NAME = {Weapon:'Weapon', Helm:'Helm', Mask:'Mask', Armor:'Armor', Cloak:'Cloak', Boots:'Boots', Ring:'Ring 1', Ring2:'Ring 2'};
const BAG_TABS = ['Weapon','Helm','Mask','Armor','Cloak','Boots','Ring'];
const kindOf = s => s === 'Ring2' ? 'Ring' : s;
const BAR_SIZE = 8, MAX_TAGS = 6, PAGE = 24;
const TAGS = ['Solo','Party','Boss','Farming','AoE','Single Target','Tank','Support','Budget','Endgame'];
const CLASSES = G ? G.classes.map(c => ({k:c.name, c:c.color, id:c.id})) : [];
const CLS = G ? Object.fromEntries(G.classes.map(c => [c.name, c])) : {};
// the game's own class emblems (LumiPage.JobLogo sheet + special-class emblems)
const clsImg = (name, cls = 'cemb') => { const c = CLS[name]; return c ? `<img class="${cls}" src="assets/cls/${c.id}.webp" alt="" draggable="false" loading="lazy">` : ''; };
const GAME_URL = 'https://www.roblox.com/games/117483759937632';
const ITEM = G ? Object.fromEntries(G.items.map(i => [i.id, i])) : {};
const CARD = G ? Object.fromEntries(G.cards.map(c => [c.id, c])) : {};
const SKILL = G ? Object.fromEntries(G.classes.flatMap(c => c.skills.map(s => [s.id, Object.assign({cls:c.name, clsId:c.id}, s)]))) : {};
const PASSIVES = Object.values(SKILL).filter(s => s.type === 'passive');
const XSLOTS = (G && G.passiveSlotLevels) || [70, 76, 82, 88, 94, 99];
const xOpen = lv => XSLOTS.filter(n => lv >= n).length;
const descHTML = txt => esc(txt || '').replace(/\n/g, '<br>');
const RAR_COLOR = {grey:'#9aa0ad', green:'#4cbf4f', blue:'#3d8ee6', purple:'#9b5de5', gold:'#e8a81e', red:'#e0483e'};
const RAR_ORDER = ['red','gold','purple','blue','green','grey'];
const RAR_NAME = {grey:'Normal', green:'Leader', blue:'Rare', purple:'Mini Boss', gold:'Boss', red:'Legendary'};
const CUM = [0]; if (G) for (let v = 1; v < G.maxStat; v++) CUM[v] = CUM[v - 1] + (G.upCost[v - 1] || 0);
const costTo = v => CUM[Math.max(1, Math.min(G.maxStat, v)) - 1] || 0;
const totalPts = lv => G.totalPoints[Math.max(1, Math.min(G.maxLevel, lv)) - 1] || 0;
const skillPts = lv => Math.min(lv, G.skillPointCap);
const tierColor = t => (G.tiers[t - 1] || G.tiers[0]).color;
const roman = t => (G.tiers[t - 1] || {}).roman || '';
const rarBg = t => icon(G.rarityBg[String(t - 1)]);
const clsColor = name => (CLS[name] || {color:'#888'}).color;
function label(key, v){
  const tpl = G.labels[key] || (key + ' +{v}');
  return tpl.replace('{v10}', String(Math.round(v) / 10)).replace('{v}', String(v));
}
const labelName = key => (G.labels[key] || key).replace(/\s*[+\-]\{v(10)?\}.*$/, '');
function optRange(item, key, special){
  const tr = item.tier;
  if (tr === 6) return special ? ((G.ranges.t6special[item.g6] || {})[key] || null) : (G.ranges.t6random[key] || null);
  if (special) { const r = G.ranges.special[key]; return r ? r[tr - 1] : null; }
  const r = G.ranges.line[key] || G.ranges.stat; return r ? r[tr - 1] : null;
}
const clampN = (v, lo, hi) => Math.max(lo, Math.min(hi, Math.round(Number(v) || 0)));
function itemsFor(slot, cls){
  return G.items.filter(i => i.slot === slot && (slot !== 'Weapon' || (i.jobs || []).includes(cls && cls.id)));
}
function newEntry(item){
  const e = {id:item.id, refine:0, main:item.max, sp:null, lines:[]};
  if (item.specials.length) { const k = item.specials[0], r = optRange(item, k, true); if (r) e.sp = {k, v:r[1]}; }
  for (const k of item.pool) { if (e.lines.length >= item.lines) break; const r = optRange(item, k, false); if (r) e.lines.push({k, v:r[1]}); }
  return e;
}
function cleanEntry(e){
  const item = e && ITEM[e.id]; if (!item) return null;
  const out = {id:item.id, refine:clampN(e.refine, 0, G.refineMax), main:clampN(e.main == null ? item.max : e.main, item.min, item.max), sp:null, lines:[]};
  if (e.sp && item.specials.includes(e.sp.k)) { const r = optRange(item, e.sp.k, true); if (r) out.sp = {k:e.sp.k, v:clampN(e.sp.v, r[0], r[1])}; }
  const seen = new Set();
  for (const l of (e.lines || [])) {
    if (out.lines.length >= item.lines || !l || !item.pool.includes(l.k) || seen.has(l.k)) continue;
    const r = optRange(item, l.k, false); if (!r) continue;
    seen.add(l.k); out.lines.push({k:l.k, v:clampN(l.v, r[0], r[1])});
  }
  return out;
}
function autoStats(cls, lv){
  const w = cls.weights || {}; const st = Object.fromEntries(STATS.map(k => [k, 1]));
  let pts = totalPts(lv);
  for (let n = 0; n < 5000; n++) {
    let pick = null, best = Infinity;
    for (const k of STATS) { const wt = w[k]; if (wt > 0 && st[k] < G.maxStat && G.upCost[st[k] - 1] <= pts) { const p = (st[k] - 1) / wt; if (p < best) { pick = k; best = p; } } }
    if (!pick) break; pts -= G.upCost[st[pick] - 1]; st[pick]++;
  }
  return st;
}

// ---------- text ----------
const I18N = {
en:{brandSub:'Build Board',browse:'Browse',guide:'Guide',guideCta:"New here? Hunter's Guide",share:'Share a build',heroTitle:'Find a build. Share yours.',
heroSub:'Real gear, cards and skills from the game — drag them into a build and share it free with every hunter.',play:'Play on Roblox',playBand:'Hunt monsters on sky islands, collect cards and take down world bosses with friends.',
demo:'Demo mode — saved only on this device.',footer:'Community build board for Hunting Together RPG on Roblox. Item and skill data from the game.',
search:'Search builds or players',all:'All classes',sort_new:'Newest',sort_likes:'Most liked',sort_rating:'Top rated',
loadMore:'Load more',loading:'Loading builds…',empty:'No builds yet. Be the first to share one!',
emptyFilter:'No builds match. Try another class or word.',errLoad:"Couldn't load builds. Check your connection and try again.",
errConnect:"Couldn't connect to the build board. Please try again.",retry:'Try again',by:'by',ratings:'ratings',
noRatings:'No ratings yet',yourRating:'Your rating',rateThis:'Rate this build',copyLink:'Copy link',copied:'Link copied!',
report:'Report',edit:'Edit',del:'Delete',back:'Back to builds',stats:'Stats',concept:'Build idea',gear:'Equipment',cards:'Cards',skills:'Skills',
emptySlot:'Empty',notFound:"This build was removed or doesn't exist.",ownNote:'This is your build.',
ownNoRate:"You can't like or rate your own build.",hiddenNote:'Hidden after reports — only you can see it.',
newTitle:'Share your build',editTitle:'Edit your build',basics:'Basics',fRoblox:'Roblox username',fTitle:'Build name',
fTitlePh:'e.g. Crit Thief for bosses',fClass:'Class',pick:'Pick one',fLevel:'Level',
fConcept:'Explain your build',fConceptPh:'Why these stats? Which skills do you use? What does this build do best?',tagsHint:'Pick up to 6.',tags:'Playstyle',
save:'Publish build',saveEdit:'Save changes',cancel:'Cancel',saving:'Saving…',saved:'Build published!',savedEdit:'Changes saved!',
draftNote:'Your draft is kept on this device.',clearForm:'Clear form',clearQ:'Clear the whole form?',clearMsg:'Everything you set will be removed.',
eRoblox:'Use 3–20 letters, numbers or _.',eTitle:'Give your build a name (3–60 characters).',eClass:'Pick a class.',
eFix:'Please fix these first:',eSave:"Couldn't save. Please try again.",eLimit:"You've reached 10 builds. Delete one to share another.",eAction:'Something went wrong. Please try again.',
delQ:'Delete this build?',delMsg:"This can't be undone.",deleted:'Build deleted.',repQ:'Report this build',
repMsg:"Tell us what's wrong (rude words, fake info, spam).",repSend:'Send report',repDone:"Thanks! We'll check it.",
repAlready:'You already reported this build.',close:'Close',ok:'OK',copyManual:'Copy this link:',maxTags:'You can pick up to 6.',
pickClassFirst:'Pick a class first to see its gear and skills.',character:'Character',bag:'Bag',dragHint:'Drag gear and cards onto your character — or tap to equip.',
dragHintTouch:'Tap to equip. Hold and drag to move.',refine:'Refine',mainStat:'Base',special:'Special option',options:'Options',noSpecial:'No special option on Tier I',
remove:'Remove',none:'None',needLv:'Needs Lv.',ptsLeft:'Points left',ptsOver:'Too many points used',
autoStat:'Use game auto-stat',resetStats:'Reset',nextCost:'Next +1 costs',skillPts:'Skill points left',hotbar:'Skill bar',hotbarHint:'Drag skills here and drag to change the order. Tap a skill in the bar to remove it.',
passive:'Passive',active:'Active',unlockAt:'Unlocks at Lv.',forClass:'For my class',allRarity:'All',searchCard:'Search cards',
eStatPts:'Stat points are over the limit for this level.',eSkillPts:'Skill points are over the limit for this level.',
eItemLv:'needs a higher level',eCardLock:'Card slot is locked at this level',eWeapon:'This weapon is not for this class',
selectSlot:'Tap an equipped item to set its refine and options.',clsChange:'Change class? Your weapon and skills will be cleared.',change:'Change',
lines:'lines',empty2:'Empty',ptsUsed:'pts used',
extra:'Extra Passive',xOpen:'slots open',xHint:'Tap a passive to put it in an open slot, or drag it onto a slot. Tap a filled slot to empty it. In the game you can only use passives from classes you raised to Lv.99.',
xNo:"Can't go in an Extra slot",xUsed:'Already in a slot',xLocked:'This Extra slot is still locked',xFull:'All open Extra slots are full',xSel:'Pick a passive for slot',
eXLock:'Extra slot opens at',eXBad:"can't be used as an Extra Passive",eCardDup:'Boss cards can be used only once (normal cards can repeat)',cardHint:'Normal cards can repeat. Boss and mini boss cards only once.'},
th:{brandSub:'บอร์ดบิลด์',browse:'ดูบิลด์',guide:'คู่มือ',guideCta:'มือใหม่? อ่านคู่มือนักล่า',share:'แชร์บิลด์',heroTitle:'หาบิลด์เก่ง ๆ แชร์บิลด์ของคุณ',
heroSub:'ไอเทม การ์ด และสกิลจริงจากเกม ลากใส่เป็นบิลด์แล้วแชร์ให้ทุกคนดูฟรี',play:'เล่นบน Roblox',playBand:'ล่ามอนบนเกาะลอยฟ้า สะสมการ์ด และล้มบอสโลกไปกับเพื่อน ๆ',
demo:'โหมดตัวอย่าง — บันทึกแค่ในเครื่องนี้',footer:'บอร์ดบิลด์ของผู้เล่น Hunting Together RPG บน Roblox · ข้อมูลไอเทมและสกิลจากเกม',
search:'ค้นหาบิลด์หรือชื่อผู้เล่น',all:'ทุกคลาส',sort_new:'ใหม่ล่าสุด',sort_likes:'ไลก์มากสุด',sort_rating:'คะแนนสูงสุด',
loadMore:'โหลดเพิ่ม',loading:'กำลังโหลดบิลด์…',empty:'ยังไม่มีบิลด์ มาแชร์เป็นคนแรกกัน!',
emptyFilter:'ไม่พบบิลด์ ลองคลาสหรือคำอื่น',errLoad:'โหลดบิลด์ไม่สำเร็จ เช็กอินเทอร์เน็ตแล้วลองใหม่',
errConnect:'เชื่อมต่อบอร์ดบิลด์ไม่สำเร็จ ลองใหม่อีกครั้ง',retry:'ลองใหม่',by:'โดย',ratings:'คนให้คะแนน',
noRatings:'ยังไม่มีคะแนน',yourRating:'คะแนนของคุณ',rateThis:'ให้คะแนนบิลด์นี้',copyLink:'คัดลอกลิงก์',copied:'คัดลอกลิงก์แล้ว!',
report:'รายงาน',edit:'แก้ไข',del:'ลบ',back:'กลับไปหน้าบิลด์',stats:'สเตตัส',concept:'แนวคิดบิลด์',gear:'ไอเทมที่สวมใส่',cards:'การ์ด',skills:'สกิล',
emptySlot:'ว่าง',notFound:'ไม่พบบิลด์นี้ อาจถูกลบไปแล้ว',ownNote:'นี่คือบิลด์ของคุณ',
ownNoRate:'ไลก์หรือให้คะแนนบิลด์ตัวเองไม่ได้',hiddenNote:'ถูกซ่อนเพราะมีคนรายงาน มีแค่คุณที่เห็น',
newTitle:'แชร์บิลด์ของคุณ',editTitle:'แก้ไขบิลด์',basics:'ข้อมูลหลัก',fRoblox:'ชื่อผู้ใช้ Roblox',fTitle:'ชื่อบิลด์',
fTitlePh:'เช่น Thief คริติคอลตีบอส',fClass:'คลาส',pick:'เลือก',fLevel:'เลเวล',
fConcept:'อธิบายแนวคิดบิลด์',fConceptPh:'ทำไมอัปสเตตัสแบบนี้ ใช้สกิลอะไร บิลด์นี้เก่งเรื่องอะไร',tagsHint:'เลือกได้สูงสุด 6 อย่าง',tags:'สไตล์การเล่น',
save:'เผยแพร่บิลด์',saveEdit:'บันทึกการแก้ไข',cancel:'ยกเลิก',saving:'กำลังบันทึก…',saved:'เผยแพร่บิลด์แล้ว!',savedEdit:'บันทึกแล้ว!',
draftNote:'ร่างจะถูกเก็บไว้ในเครื่องนี้',clearForm:'ล้างฟอร์ม',clearQ:'ล้างฟอร์มทั้งหมด?',clearMsg:'ทุกอย่างที่ตั้งไว้จะหายทั้งหมด',
eRoblox:'ใช้ตัวอักษร ตัวเลข หรือ _ 3–20 ตัว',eTitle:'ตั้งชื่อบิลด์ 3–60 ตัวอักษร',eClass:'เลือกคลาส',
eFix:'แก้ตรงนี้ก่อนนะ:',eSave:'บันทึกไม่สำเร็จ ลองอีกครั้ง',eLimit:'คุณแชร์ครบ 10 บิลด์แล้ว ลบบิลด์เก่าก่อนถึงจะแชร์ใหม่ได้',eAction:'เกิดข้อผิดพลาด ลองอีกครั้ง',
delQ:'ลบบิลด์นี้?',delMsg:'ลบแล้วกู้คืนไม่ได้',deleted:'ลบบิลด์แล้ว',repQ:'รายงานบิลด์นี้',
repMsg:'บอกเราว่าผิดตรงไหน (คำหยาบ ข้อมูลปลอม สแปม)',repSend:'ส่งรายงาน',repDone:'ขอบคุณ! เราจะตรวจสอบ',
repAlready:'คุณรายงานบิลด์นี้แล้ว',close:'ปิด',ok:'ตกลง',copyManual:'คัดลอกลิงก์นี้:',maxTags:'เลือกได้สูงสุด 6 อย่าง',
pickClassFirst:'เลือกคลาสก่อน แล้วไอเทมกับสกิลของคลาสจะขึ้นมา',character:'ตัวละคร',bag:'กระเป๋า',dragHint:'ลากไอเทมและการ์ดใส่ตัวละคร หรือแตะเพื่อสวมใส่',
dragHintTouch:'แตะเพื่อสวมใส่ · กดค้างแล้วลากเพื่อย้าย',refine:'ตีบวก',mainStat:'ค่าหลัก',special:'ออปชันพิเศษ',options:'ออปชัน',noSpecial:'Tier I ไม่มีออปชันพิเศษ',
remove:'ถอดออก',none:'ไม่มี',needLv:'ต้อง Lv.',ptsLeft:'แต้มเหลือ',ptsOver:'ใช้แต้มเกิน',
autoStat:'อัปแบบอัตโนมัติของเกม',resetStats:'รีเซ็ต',nextCost:'อัป +1 ต่อไปใช้',skillPts:'แต้มสกิลเหลือ',hotbar:'แถบสกิล',hotbarHint:'ลากสกิลมาวางที่นี่ และลากเพื่อสลับลำดับ แตะสกิลในแถบเพื่อเอาออก',
passive:'ติดตัว',active:'กดใช้',unlockAt:'ปลดที่ Lv.',forClass:'ของคลาสฉัน',allRarity:'ทั้งหมด',searchCard:'ค้นหาการ์ด',
eStatPts:'แต้มสเตตัสเกินที่เลเวลนี้มีให้',eSkillPts:'แต้มสกิลเกินที่เลเวลนี้มีให้',
eItemLv:'เลเวลยังไม่ถึง',eCardLock:'ช่องการ์ดยังล็อกที่เลเวลนี้',eWeapon:'อาวุธนี้ไม่ใช่ของคลาสนี้',
selectSlot:'แตะไอเทมที่สวมอยู่ เพื่อตั้งค่าตีบวกและออปชัน',clsChange:'เปลี่ยนคลาส? อาวุธและสกิลจะถูกล้าง',change:'เปลี่ยน',
lines:'แถว',extra:'Extra Passive (ติดตัวเสริม)',xOpen:'ช่องที่เปิด',xHint:'แตะสกิลติดตัวเพื่อใส่ช่องที่ว่าง หรือลากไปวางที่ช่อง แตะช่องที่ใส่แล้วเพื่อถอดออก ในเกมใช้ได้เฉพาะสกิลของอาชีพที่เล่นถึง Lv.99 แล้ว',
xNo:'ใส่ช่องเสริมไม่ได้',xUsed:'ใส่อยู่แล้ว',xLocked:'ช่องเสริมนี้ยังล็อก',xFull:'ช่องเสริมที่เปิดเต็มแล้ว',xSel:'เลือกสกิลสำหรับช่อง',
eXLock:'ช่องเสริมเปิดที่',eXBad:'ใส่ช่องเสริมไม่ได้',eCardDup:'การ์ดบอสใส่ได้ใบเดียว (การ์ดธรรมดาใส่ซ้ำได้)',cardHint:'การ์ดธรรมดาใส่ซ้ำได้ การ์ดบอสและมินิบอสใส่ได้ใบเดียว',empty2:'ว่าง',ptsUsed:'แต้มที่ใช้'}};

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
const avg = b => b.rating_count ? b.rating_sum / b.rating_count : 0;
const thOK = (() => { try { return /^th/i.test(navigator.language || '') && Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Bangkok'; } catch (e) { return false; } })();
// opened through Google Translate: always serve the English page so the translation starts from clean English
const viaTranslate = /\.translate\.goog$/.test(location.hostname) || /[?&]_x_tr_tl=/.test(location.search);
let lang = viaTranslate ? 'en' : thOK ? store.get('ht_lang', 'th') : 'en';
const t = k => (I18N[lang] && I18N[lang][k]) || I18N.en[k] || k;
const isTouch = () => !!(window.matchMedia && matchMedia('(hover: none)').matches);
const HEART = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z"/></svg>';
const STAR = '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z"/></svg>';
const LOCK = '<svg class="lk" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 10 0v3h1.5A1.5 1.5 0 0 1 20 11.5v9A1.5 1.5 0 0 1 18.5 22h-13A1.5 1.5 0 0 1 4 20.5v-9A1.5 1.5 0 0 1 5.5 10H7zm2 0h6V7a3 3 0 0 0-6 0v3z"/></svg>';
function ago(iso){
  try {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    const rtf = new Intl.RelativeTimeFormat(lang, {numeric:'auto'});
    for (const [lim, unit, div] of [[60,'second',1],[3600,'minute',60],[86400,'hour',3600],[2592000,'day',86400],[31536000,'month',2592000],[Infinity,'year',31536000]]) if (s < lim) return rtf.format(-Math.round(s / div), unit);
  } catch (e) {}
  return '';
}
function starsView(a){
  const p = Math.max(0, Math.min(100, a / 5 * 100));
  return `<span class="sv" aria-label="${a ? a.toFixed(1) : 0} / 5">${STAR.repeat(5)}<span class="fill" style="width:${p}%">${STAR.repeat(5)}</span></span>`;
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
function modal({title, body = '', okLabel, okClass = 'green', input = false, cancel = true}){
  return new Promise(resolve => {
    const m = $('#modal');
    m.innerHTML = `<div class="mbox" role="dialog" aria-modal="true" aria-labelledby="mt">
      <div class="mhead"><h3 id="mt" class="stroke">${esc(title)}</h3><button class="x" data-m="no" aria-label="${t('close')}">×</button></div>
      <div class="mbody">${body}${input ? '<textarea id="mIn" maxlength="300" style="min-height:100px"></textarea>' : ''}
      <div class="mfoot">${cancel ? `<button class="btn grey" data-m="no">${t('cancel')}</button>` : ''}<button class="btn ${okClass}" data-m="ok">${esc(okLabel || t('ok'))}</button></div></div></div>`;
    m.hidden = false;
    const f = input ? $('#mIn') : $('[data-m="ok"]', m); f && f.focus();
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

// ---------- shared visuals ----------
function itemTile(item, opts = {}){
  const lock = opts.level != null && item.req > opts.level;
  return `<div class="tile${lock ? ' lock' : ''}${opts.cls ? ' ' + opts.cls : ''}" style="--bg:url('${rarBg(item.tier)}');--tc:${tierColor(item.tier)}" ${opts.drag && !lock ? `data-drag="item:${item.id}"` : ''} title="${esc(item.name)}">
    <img src="${icon(item.icon)}" alt="" draggable="false" loading="lazy" onerror="this.style.visibility='hidden'">
    ${opts.refine ? `<b class="rf">+${opts.refine}</b>` : ''}<i class="tr">${roman(item.tier)}</i>
    ${lock ? `<span class="need">Lv.${item.req}</span>` : ''}</div>`;
}
function cardBonusText(c){
  return Object.entries(c.bonus || {}).filter(([k]) => G.labels[k]).map(([k, v]) => label(k, v)).join(' · ');
}
function cardLine(c){
  if (c.ability) { const parts = c.ability.split('\n'); return c.cls ? parts[parts.length - 1] : parts[0]; }
  return cardBonusText(c);
}
// real in-game card face (captured from the game's CardFace) · text fallback if the picture is missing
function cardTile(c, opts = {}){
  return `<div class="ctile art${opts.cls ? ' ' + opts.cls : ''}" style="--rc:${RAR_COLOR[c.r] || '#999'}" ${opts.drag ? `data-drag="card:${c.id}"` : ''} title="${esc(c.name + '\n' + cardBonusText(c) + (c.ability ? '\n' + c.ability : ''))}">
    ${c.art ? `<img src="${esc(c.art)}" alt="${esc(c.name)}" draggable="false" loading="lazy" onerror="this.parentNode.classList.add('noart');this.remove()">` : ''}
    <span class="cn">${esc(c.name)}</span><span class="cb">${esc(cardLine(c))}</span>${opts.badge ? `<b class="cbadge">${opts.badge}</b>` : ''}</div>`;
}
function xRow(s, why){
  return `<li class="xrow${why ? ' off' : ''}" ${why === undefined || why ? '' : `data-drag="pas:${s.id}"`}>${skillIcon(s)}<div class="xi"><div class="xt"><b>${esc(s.name)}</b><i style="--c:${clsColor(s.cls)}">${esc(s.cls)}</i></div><p>${descHTML(s.desc)}</p>${why ? `<em>${esc(why)}</em>` : ''}</div></li>`;
}
function skillIcon(s, opts = {}){
  return `<div class="sk${s.type === 'passive' ? ' pas' : ''}${opts.cls ? ' ' + opts.cls : ''}" ${opts.drag ? `data-drag="skill:${s.id}"` : ''} title="${esc(s.name)}">
    <img src="${icon(s.icon)}" alt="" draggable="false" loading="lazy" onerror="this.style.visibility='hidden'">${opts.lv ? `<b class="slv">${opts.lv}</b>` : ''}</div>`;
}
function entryLines(e){
  const out = [];
  if (e.sp) out.push({sp:true, text:label(e.sp.k, e.sp.v)});
  for (const l of e.lines || []) out.push({sp:false, text:label(l.k, l.v)});
  return out;
}

// ---------- data: demo ----------
function DemoAPI(){
  const ME = 'demo-me', KEY = 'ht_demo_v2';
  let db = store.get(KEY, null);
  if (!db || !Array.isArray(db.builds)) { db = {builds:[], likes:{}, ratings:{}, reports:{}}; save(); }
  function save(){ store.set(KEY, db); }
  const find = id => db.builds.find(b => b.id === id);
  const sorters = {new:(a, b) => String(b.created_at).localeCompare(String(a.created_at)), likes:(a, b) => b.like_count - a.like_count, rating:(a, b) => avg(b) - avg(a)};
  return {
    demo:true, async me(){ return ME; },
    async list({cls, q, sort, offset}){
      let a = db.builds.slice();
      if (cls) a = a.filter(b => b.class === cls);
      if (q) { const s = q.toLowerCase(); a = a.filter(b => (b.title + ' ' + b.roblox_name).toLowerCase().includes(s)); }
      return clone(a.sort(sorters[sort] || sorters.new).slice(offset, offset + PAGE));
    },
    async get(id){ const b = find(id); return b ? clone(b) : null; },
    async create(p){ if (db.builds.filter(b => b.user_id === ME).length >= 10) throw new Error('build limit'); const n = Object.assign({}, p, {id:newId(), user_id:ME, like_count:0, rating_sum:0, rating_count:0, hidden:false, created_at:new Date().toISOString()}); db.builds.unshift(n); save(); return clone(n); },
    async update(id, p){ const b = find(id); if (!b || b.user_id !== ME) throw new Error('not yours'); Object.assign(b, p); save(); return clone(b); },
    async remove(id){ db.builds = db.builds.filter(b => !(b.id === id && b.user_id === ME)); save(); },
    async myState(){ return {likes:new Set(Object.keys(db.likes)), ratings:Object.assign({}, db.ratings), reports:new Set(Object.keys(db.reports))}; },
    async toggleLike(id){ const b = find(id); if (!b) throw new Error('missing'); if (b.user_id === ME) throw new Error('own build'); if (db.likes[id]) { delete db.likes[id]; b.like_count--; } else { db.likes[id] = 1; b.like_count++; } save(); return {liked:!!db.likes[id], like_count:b.like_count}; },
    async rate(id, s){ const b = find(id); if (!b) throw new Error('missing'); if (b.user_id === ME) throw new Error('own build'); const old = db.ratings[id]; if (old) b.rating_sum += s - old; else { b.rating_sum += s; b.rating_count++; } db.ratings[id] = s; save(); return {rating_sum:b.rating_sum, rating_count:b.rating_count}; },
    async report(id){ db.reports[id] = 1; save(); return true; }
  };
}

// ---------- data: Supabase ----------
function SupaAPI(sb){
  let meId = null;
  const FIELDS = 'id,user_id,roblox_name,title,class,level,stats,concept,gear,cards,skills,tags,like_count,rating_sum,rating_count,rating_avg,hidden,created_at,updated_at';
  const chk = r => { if (r.error) throw r.error; return r.data; };
  async function me(force){
    if (meId) return meId;
    const {data} = await sb.auth.getSession();
    if (data && data.session) return (meId = data.session.user.id);
    if (!force) return null;
    const r = await sb.auth.signInAnonymously(); if (r.error) throw r.error;
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
      const id = await me(false); const st = {likes:new Set(), ratings:{}, reports:new Set()};
      if (!id) return st;
      const [l, r, p] = await Promise.all([sb.from('likes').select('build_id').eq('user_id', id), sb.from('ratings').select('build_id,stars').eq('user_id', id), sb.from('reports').select('build_id').eq('user_id', id)]);
      (l.data || []).forEach(x => st.likes.add(x.build_id)); (r.data || []).forEach(x => { st.ratings[x.build_id] = x.stars; }); (p.data || []).forEach(x => st.reports.add(x.build_id));
      return st;
    },
    async toggleLike(id){ await me(true); return chk(await sb.rpc('toggle_like', {p_build:id})); },
    async rate(id, s){ await me(true); return chk(await sb.rpc('rate_build', {p_build:id, p_stars:s})); },
    async report(id, reason){ await me(true); return chk(await sb.rpc('report_build', {p_build:id, p_reason:reason})); }
  };
}

// ---------- state ----------
const S = {api:null, me:null, mine:{likes:new Set(), ratings:{}, reports:new Set()}, filter:{cls:'', q:'', sort:'new'}, list:[], offset:0, more:false,
  loading:false, err:false, listKey:null, cur:null, edit:null, view:'', scrollY:0, busy:{}};
const app = $('#app');
const key = () => JSON.stringify(S.filter);
const errMsg = e => String((e && (e.message || e.msg)) || '');

// ---------- list ----------
function gearMini(b){
  const g = b.gear || {};
  return `<div class="gmini">${SLOTS.map(s => { const e = g[s], it = e && ITEM[e.id]; return it ? itemTile(it, {cls:'xs', refine:e.refine}) : `<div class="tile xs nil"></div>`; }).join('')}</div>`;
}
function cardHTML(b){
  const top = STATS.map(k => [k, +(b.stats && b.stats[k]) || 0]).sort((a, c) => c[1] - a[1]).slice(0, 3);
  const mx = Math.max(1, ...top.map(x => x[1])), a = avg(b);
  return `<article class="bcard" style="--c:${clsColor(b.class)}">
    <a class="cover" href="#build-${esc(b.id)}" aria-label="${esc(b.title)}"></a>
    <div class="bc-top"><span class="cls">${clsImg(b.class)}${esc(b.class)}</span><span class="lv">Lv. ${b.level | 0}</span></div>
    <h3>${esc(b.title)}</h3>
    <div class="by">${t('by')} <b>${esc(b.roblox_name)}</b> · ${ago(b.created_at)}</div>
    ${gearMini(b)}
    <div class="mini">${top.map(([k, v]) => `<div class="mrow"><span>${k}</span><i><b style="width:${v / mx * 100}%"></b></i><em>${v}</em></div>`).join('')}</div>
    <div class="bc-foot">${likeBtn(b, 'sm')}${starsView(a)}<span class="rc">${b.rating_count ? a.toFixed(1) : '–'}</span></div>
  </article>`;
}
function likeBtn(b, size){
  const mine = S.me && b.user_id === S.me, on = S.mine.likes.has(b.id);
  return `<button class="like ${size}${on ? ' on' : ''}" data-like="${esc(b.id)}" aria-pressed="${on}" ${mine ? `disabled title="${t('ownNoRate')}"` : ''}>${HEART}<span>${b.like_count | 0}</span></button>`;
}
function viewList(){
  $('#hero').hidden = false; document.body.classList.toggle('home', true);
  app.innerHTML = `<div class="filters">
    <div class="searchrow"><input id="q" type="search" placeholder="${t('search')}" value="${esc(S.filter.q)}" autocomplete="off" maxlength="40" aria-label="${t('search')}">
      <div class="tabs">${['new','likes','rating'].map(k => `<button class="btn sm ${S.filter.sort === k ? 'orange' : 'grey'}" data-sort="${k}">${t('sort_' + k)}</button>`).join('')}</div></div>
    <div class="chips scroll">${[{k:'', c:'#ddd'}, ...CLASSES].map(c => `<button class="chip${c.k ? ' ce' : ''}${S.filter.cls === c.k ? ' on' : ''}" data-cls="${esc(c.k)}" style="--c:${c.c}">${clsImg(c.k)}${esc(c.k || t('all'))}</button>`).join('')}</div>
  </div><div id="grid" class="grid"></div><div id="listFoot" class="listfoot"></div>`;
  if (S.listKey === key() && S.list.length) { renderGrid(); requestAnimationFrame(() => scrollTo(0, S.scrollY)); } else loadList(true);
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
  $('#hero').hidden = true; document.body.classList.toggle('home', false);
  let b = S.list.find(x => x.id === id) || (S.cur && S.cur.id === id ? S.cur : null);
  if (b) { S.cur = b; renderDetail(); } else app.innerHTML = `<p class="muted center" style="padding:40px 0">${t('loading')}</p>`;
  try { b = (await S.api.get(id)) || null; }
  catch (e) { console.error(e); if (!b) { app.innerHTML = `<div class="empty"><p>${t('errLoad')}</p><button class="btn blue" data-act="reroute">${t('retry')}</button></div>`; return; } }
  if (location.hash !== '#build-' + id) return;
  if (!b) { app.innerHTML = `<div class="empty"><p>${t('notFound')}</p><a class="btn blue" href="#">${t('back')}</a></div>`; return; }
  S.cur = b; renderDetail();
}
function gearRow(slot, e){
  const it = e && ITEM[e.id];
  const sn = SLOT_NAME[slot] || slot;
  if (!it) return `<li class="grow"><div class="tile nil"><i class="sn">${sn}</i></div><div class="gi"><span class="slot">${sn}</span><span class="muted">${t('emptySlot')}</span></div></li>`;
  return `<li class="grow">${itemTile(it, {refine:e.refine})}<div class="gi"><span class="slot">${sn}</span>
    <div class="iname" style="color:${tierColor(it.tier)}">${e.refine ? '+' + e.refine + ' ' : ''}${esc(it.name)}</div>
    <div class="imain">${esc(it.main)} ${e.main}${it.half ? ` · ${esc(it.half)} ${Math.floor(e.main / 2)}` : ''}</div>
    <ul class="opts">${entryLines(e).map(l => `<li class="${l.sp ? 'spl' : ''}">${esc(l.text)}</li>`).join('')}</ul></div></li>`;
}
function renderDetail(){
  const b = S.cur, mine = S.me && b.user_id === S.me, myR = S.mine.ratings[b.id] || 0, a = avg(b);
  const cls = CLS[b.class];
  const cards = Array.isArray(b.cards) ? b.cards : [];
  const sk = b.skills || {}, lvls = sk.lv || {}, bar = sk.bar || [];
  const skills = cls ? cls.skills : [];
  const used = STATS.reduce((s, k) => s + costTo(+(b.stats && b.stats[k]) || 1), 0);
  const xs = (Array.isArray(sk.extra) ? sk.extra : []).map((id, i) => ({s:SKILL[id], i})).filter(x => x.s);
  app.innerHTML = `<a class="backlink" href="#">← ${t('back')}</a>
  <section class="panel dhead" style="--c:${clsColor(b.class)}">
    <div class="dh-l">
      <div class="bc-top"><span class="cls">${clsImg(b.class)}${esc(b.class)}</span><span class="lv">Lv. ${b.level | 0}</span></div>
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
      <section class="panel"><h2 class="stroke">${t('gear')}</h2><ul class="gearlist">${SLOTS.map(s => gearRow(s, (b.gear || {})[s])).join('')}</ul></section>
      <section class="panel"><h2 class="stroke">${t('cards')}</h2><div class="cardgrid art">${G.cardSlotLevels.map((need, i) => { const c = CARD[cards[i]]; return c ? cardTile(c) : `<div class="ctile nil">${(b.level | 0) < need ? LOCK + `<span>Lv.${need}</span>` : `<span>${t('empty2')}</span>`}</div>`; }).join('')}</div></section>
    </div>
    <div class="dcol">
      <section class="panel"><h2 class="stroke">${t('stats')}</h2>
        <div class="sbars">${STATS.map(k => { const v = +(b.stats && b.stats[k]) || 0; return `<div class="srow"><span>${k}</span><i><b style="width:${v / G.maxStat * 100}%"></b></i><em>${v}</em></div>`; }).join('')}</div>
        <p class="muted sm" style="margin:10px 0 0">${t('ptsUsed')} ${used} / ${totalPts(b.level | 0)} · Lv.${b.level | 0}</p></section>
      ${skills.length ? `<section class="panel"><h2 class="stroke">${t('skills')}</h2>
        ${bar.length ? `<div class="barlbl">${t('hotbar')}</div><div class="hotbar ro">${bar.map((id, i) => { const s = skills.find(x => x.id === id); return s ? `<div class="bslot"><i class="bn">${i + 1}</i>${skillIcon(s, {lv:lvls[id] || 0})}</div>` : ''; }).join('')}</div>` : ''}
        <ul class="sklist">${skills.map(s => `<li class="${(lvls[s.id] || 0) ? '' : 'off'}">${skillIcon(s)}<span class="skn">${esc(s.name)}<i>${s.type === 'passive' ? t('passive') : t('active')}</i></span><b>${lvls[s.id] || 0}/${s.max}</b></li>`).join('')}</ul></section>` : ''}
      ${xs.length ? `<section class="panel"><h2 class="stroke">${t('extra')}</h2><ul class="xlist ro">${xs.map(x => xRow(x.s)).join('')}</ul></section>` : ''}
      <section class="panel"><h2 class="stroke">${t('concept')}</h2><p class="concept">${esc(b.concept || '—')}</p></section>
    </div>
  </div>
  <div class="dactions"><button class="btn blue" data-act="copy">${t('copyLink')}</button>
    ${mine ? `<a class="btn orange" href="#edit-${esc(b.id)}">${t('edit')}</a><button class="btn red" data-act="del">${t('del')}</button>` : `<button class="btn grey" data-act="report">${t('report')}</button>`}</div>`;
}

// ---------- editor ----------
function blank(){ return {roblox_name:store.get('ht_name', ''), title:'', class:'', level:G.maxLevel, stats:Object.fromEntries(STATS.map(k => [k, 1])), concept:'', gear:{}, cards:Array(8).fill(null), skills:{lv:{}, bar:[], extra:Array(6).fill(null)}, tags:[]}; }
function normalize(d){
  d.level = clampN(d.level || 1, 1, G.maxLevel);
  d.stats = Object.fromEntries(STATS.map(k => [k, clampN((d.stats || {})[k] || 1, 1, G.maxStat)]));
  const g = {}; for (const s of SLOTS) { const e = cleanEntry((d.gear || {})[s]); if (e && ITEM[e.id].slot === kindOf(s)) g[s] = e; } d.gear = g;
  const c = Array.isArray(d.cards) ? d.cards : []; d.cards = Array.from({length:8}, (_, i) => CARD[c[i]] ? c[i] : null);
  const sk = d.skills || {}, ex = Array.isArray(sk.extra) ? sk.extra : [];
  d.skills = {lv:Object.assign({}, sk.lv || {}), bar:(sk.bar || []).filter(Boolean).slice(0, BAR_SIZE),
    extra:Array.from({length:6}, (_, i) => SKILL[ex[i]] && SKILL[ex[i]].type === 'passive' ? ex[i] : null)};
  d.tags = (d.tags || []).filter(x => TAGS.includes(x));
  d.concept = d.concept || ''; d.title = d.title || ''; d.roblox_name = d.roblox_name || '';
  return d;
}
async function viewEditor(id){
  $('#hero').hidden = true; document.body.classList.toggle('home', false);
  let d;
  if (id) {
    let b = S.cur && S.cur.id === id ? S.cur : null;
    if (!b) { app.innerHTML = `<p class="muted center" style="padding:40px 0">${t('loading')}</p>`; b = await S.api.get(id).catch(() => null); }
    if (location.hash !== '#edit-' + id) return;
    if (!b || !S.me || b.user_id !== S.me) { app.innerHTML = `<div class="empty"><p>${t('notFound')}</p><a class="btn blue" href="#">${t('back')}</a></div>`; return; }
    d = clone(b);
  } else d = store.get('ht_draft2', null) || blank();
  S.edit = {id, d:normalize(d), sel:null, xsel:null, tab:'Weapon', cardQ:'', cardR:'', cardMine:false};
  renderEditor();
}
let draftTm;
function saveDraft(){
  clearTimeout(draftTm);
  if (S.edit && !S.edit.id) { const d = S.edit.d; draftTm = setTimeout(() => { if (S.edit && S.edit.d === d) store.set('ht_draft2', d); }, 300); }
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
        <div><label for="fC">${t('fClass')}</label><select id="fC"><option value="">${t('pick')}</option>${G.classes.map(c => `<option value="${esc(c.name)}"${c.name === d.class ? ' selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
        <div><label for="fL">${t('fLevel')}</label><div class="lvrow"><button type="button" class="btn sm grey" data-lv="-1" aria-label="-1">−</button><input id="fL" type="number" inputmode="numeric" min="1" max="${G.maxLevel}" value="${d.level}"><button type="button" class="btn sm grey" data-lv="1" aria-label="+1">+</button></div></div>
      </div></section>
    <div id="builder"></div>
    <section class="panel"><h2 class="stroke">${t('concept')}</h2>
      <label for="fX">${t('fConcept')}</label><textarea id="fX" data-f="concept" maxlength="2000" placeholder="${t('fConceptPh')}">${esc(d.concept)}</textarea>
      <div class="count" id="cnt">${(d.concept || '').length} / 2000</div>
      <label style="margin-top:14px">${t('tags')} <span class="muted">· ${t('tagsHint')}</span></label>
      <div class="taggrid">${TAGS.map(x => `<label class="tgl"><input type="checkbox" data-tag="${x}"${d.tags.includes(x) ? ' checked' : ''}><span>${x}</span></label>`).join('')}</div>
    </section>
    <div class="err" id="formErr" hidden></div>
    <div class="edfoot"><div class="l"><button class="btn green" id="saveBtn" type="submit">${id ? t('saveEdit') : t('save')}</button>
      <a class="btn grey" href="${id ? '#build-' + esc(id) : '#'}">${t('cancel')}</a></div>
      ${id ? '' : `<span class="muted sm">${t('draftNote')} <button type="button" class="btn sm red" data-act="clear">${t('clearForm')}</button></span>`}</div>
  </form>`;
  renderBuilder();
}
function renderBuilder(){
  const host = $('#builder'); if (!host) return;
  const d = S.edit.d, cls = CLS[d.class];
  if (!cls) { host.innerHTML = `<section class="panel"><p class="muted" style="margin:0">${t('pickClassFirst')}</p></section>`; return; }
  host.innerHTML = `<section class="panel builder">
      <div class="bcol"><h2 class="stroke">${t('character')}</h2>
        <div id="slots" class="slots3"></div>
        <div id="cfg" class="cfg"></div>
        <h3 class="sub">${t('cards')}</h3><p class="hint">${t('cardHint')}</p><div id="cslots" class="cardgrid art"></div></div>
      <div class="bcol bagcol" data-drop="bag"><h2 class="stroke">${t('bag')}</h2>
        <p class="hint">${isTouch() ? t('dragHintTouch') : t('dragHint')}</p>
        <div class="bagtabs scroll">${[...BAG_TABS, 'Cards'].map(s => `<button type="button" class="chip${S.edit.tab === s ? ' on' : ''}" data-tab="${s}" style="--c:#f39a3d">${s === 'Cards' ? t('cards') : s}</button>`).join('')}</div>
        <div id="bag" class="bag"></div></div>
    </section>
    <div class="twocol">
      <section class="panel"><h2 class="stroke">${t('stats')}</h2><div id="stats"></div></section>
      <section class="panel"><h2 class="stroke">${t('skills')}</h2><div id="skills"></div></section>
    </div>
    <section class="panel"><h2 class="stroke">${t('extra')}</h2><div id="extra"></div></section>`;
  renderSlots(); renderCfg(); renderCardSlots(); renderBag(); renderStats(); renderSkills(); renderExtra();
}
function renderSlots(){
  const el = $('#slots'); if (!el) return; const d = S.edit.d, cls = CLS[d.class];
  const one = s => {
    const e = d.gear[s], it = e && ITEM[e.id];
    const bad = it && it.req > d.level;
    return `<div class="eslot${S.edit.sel === s ? ' sel' : ''}${bad ? ' bad' : ''}" data-drop="slot:${s}" ${it ? `data-drag="slot:${s}"` : ''}>
      ${it ? itemTile(it, {refine:e.refine}) : `<div class="tile nil"></div>`}<span class="esn">${SLOT_NAME[s]}</span></div>`;
  };
  const w = d.gear.Weapon && ITEM[d.gear.Weapon.id];
  el.innerHTML = `<div class="scol">${SLOT_L.map(one).join('')}</div>
    <div class="avatar" style="--c:${clsColor(d.class)}">${clsImg(d.class, 'ave')}${w ? `<img class="avw" src="${icon(w.icon)}" alt="" draggable="false" onerror="this.remove()">` : ''}
      <b class="avc">${esc(cls ? cls.name : '')}</b><span class="avl">Lv. ${d.level}</span></div>
    <div class="scol">${SLOT_R.map(one).join('')}</div>`;
}
function rangeRow(key, v, r, path, lab){
  return `<div class="orow"><span class="olbl">${esc(lab)}</span><input type="range" min="${r[0]}" max="${r[1]}" step="1" value="${v}" data-o="${path}" aria-label="${esc(lab)}"><b class="oval" data-ov="${path}">${esc(label(key, v))}</b></div>`;
}
function renderCfg(){
  const el = $('#cfg'); if (!el) return; const d = S.edit.d, s = S.edit.sel, e = s && d.gear[s], it = e && ITEM[e.id];
  if (!it) { el.innerHTML = `<p class="hint" style="margin:0">${t('selectSlot')}</p>`; return; }
  const usedKeys = new Set(e.lines.map(l => l.k));
  const spOpts = it.specials;
  el.innerHTML = `<div class="cfghead">${itemTile(it, {refine:e.refine})}<div class="cfgname"><div class="iname" style="color:${tierColor(it.tier)}">${e.refine ? '+' + e.refine + ' ' : ''}${esc(it.name)}</div>
      <div class="muted sm">Tier ${roman(it.tier)} · Lv.${it.req} · ${it.lines} ${t('lines')}${spOpts.length ? ' + 1' : ''}</div></div>
      <button type="button" class="btn sm red" data-act="unequip">${t('remove')}</button></div>
    <div class="orow"><span class="olbl">${t('refine')}</span><select data-o="refine" aria-label="${t('refine')}">${Array.from({length:G.refineMax + 1}, (_, i) => `<option value="${i}"${i === e.refine ? ' selected' : ''}>+${i}</option>`).join('')}</select></div>
    ${rangeRow(it.main, e.main, [it.min, it.max], 'main', t('mainStat'))}
    <div class="osec">${t('special')}</div>
    ${spOpts.length ? `<div class="orow"><select data-o="spk" aria-label="${t('special')}"><option value="">${t('none')}</option>${spOpts.map(k => `<option value="${k}"${e.sp && e.sp.k === k ? ' selected' : ''}>${esc(labelName(k))}</option>`).join('')}</select>
      ${e.sp ? (() => { const r = optRange(it, e.sp.k, true); return `<input type="range" min="${r[0]}" max="${r[1]}" step="1" value="${e.sp.v}" data-o="spv" aria-label="${t('special')}"><b class="oval" data-ov="spv">${esc(label(e.sp.k, e.sp.v))}</b>`; })() : ''}</div>`
      : `<p class="muted sm">${t('noSpecial')}</p>`}
    <div class="osec">${t('options')} (${e.lines.length}/${it.lines})</div>
    ${Array.from({length:it.lines}, (_, i) => { const l = e.lines[i]; const r = l && optRange(it, l.k, false);
      return `<div class="orow"><select data-o="lk${i}" aria-label="${t('options')} ${i + 1}"><option value="">${t('none')}</option>${it.pool.filter(k => optRange(it, k, false) && (!usedKeys.has(k) || (l && l.k === k))).map(k => `<option value="${k}"${l && l.k === k ? ' selected' : ''}>${esc(labelName(k))}</option>`).join('')}</select>
        ${l && r ? `<input type="range" min="${r[0]}" max="${r[1]}" step="1" value="${l.v}" data-o="lv${i}" aria-label="${esc(labelName(l.k))}"><b class="oval" data-ov="lv${i}">${esc(label(l.k, l.v))}</b>` : ''}</div>`; }).join('')}`;
}
function renderCardSlots(){
  const el = $('#cslots'); if (!el) return; const d = S.edit.d;
  el.innerHTML = G.cardSlotLevels.map((need, i) => {
    const lock = d.level < need, c = CARD[d.cards[i]];
    if (lock) return `<div class="ctile nil lockd${c ? ' bad' : ''}" data-drop="cslot:${i}">${LOCK}<span>Lv.${need}</span></div>`;
    return c ? `<div class="cwrap" data-drop="cslot:${i}" data-drag="cslot:${i}">${cardTile(c)}</div>` : `<div class="ctile nil" data-drop="cslot:${i}"><span class="cnum">${i + 1}</span></div>`;
  }).join('');
}
function renderBag(){
  const el = $('#bag'); if (!el) return; const d = S.edit.d, cls = CLS[d.class], tab = S.edit.tab;
  $$('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
  if (tab !== 'Cards') {
    let list = itemsFor(tab, cls);
    if (tab === 'Ring') list = list.sort((a, b) => (a.main === b.main ? a.tier - b.tier : a.main === 'ATK' ? -1 : 1));
    const worn = id => (d.gear[tab] && d.gear[tab].id === id) || (tab === 'Ring' && d.gear.Ring2 && d.gear.Ring2.id === id);
    el.innerHTML = `<div class="tiles">${list.map(it => itemTile(it, {drag:true, level:d.level, cls:worn(it.id) ? 'on' : ''})).join('')}</div>`;
    return;
  }
  const q = S.edit.cardQ.toLowerCase();
  let cards = G.cards.filter(c => (!q || (c.name + ' ' + (c.ability || '') + ' ' + cardBonusText(c)).toLowerCase().includes(q)) && (!S.edit.cardR || c.r === S.edit.cardR) && (!S.edit.cardMine || c.cls === cls.id));
  cards = cards.sort((a, b) => ((b.cls === cls.id) - (a.cls === cls.id)) || (RAR_ORDER.indexOf(a.r) - RAR_ORDER.indexOf(b.r)) || a.name.localeCompare(b.name));
  el.innerHTML = `<div class="cfilter"><input type="search" id="cq" placeholder="${t('searchCard')}" value="${esc(S.edit.cardQ)}" aria-label="${t('searchCard')}">
      <label class="tgl"><input type="checkbox" id="cmine"${S.edit.cardMine ? ' checked' : ''}><span>${t('forClass')}</span></label></div>
    <div class="rchips scroll"><button type="button" class="chip${!S.edit.cardR ? ' on' : ''}" data-rar="" style="--c:#ddd">${t('allRarity')}</button>${RAR_ORDER.map(r => `<button type="button" class="chip${S.edit.cardR === r ? ' on' : ''}" data-rar="${r}" style="--c:${RAR_COLOR[r]}">${RAR_NAME[r]}</button>`).join('')}</div>
    <div class="cardgrid art bagcards">${cards.map(c => { const n = d.cards.filter(x => x === c.id).length; return cardTile(c, {drag:true, cls:n ? 'on' : '', badge:n ? (c.u ? '✓' : '×' + n) : ''}); }).join('')}</div>`;
}
function renderStats(){
  const el = $('#stats'); if (!el) return; const d = S.edit.d;
  const total = totalPts(d.level), used = STATS.reduce((s, k) => s + costTo(d.stats[k]), 0), left = total - used;
  el.innerHTML = `<div class="ptsbox${left < 0 ? ' over' : ''}"><span>${left < 0 ? t('ptsOver') : t('ptsLeft')}</span><b>${left}</b><i>/ ${total}</i></div>
    <div class="stgrid">${STATS.map(k => { const v = d.stats[k], nc = v < G.maxStat ? G.upCost[v - 1] : 0;
      return `<div class="strow"><span class="stk">${k}</span><button type="button" class="stb" data-st="${k}:-1" aria-label="${k} -1" ${v <= 1 ? 'disabled' : ''}>−</button>
        <input type="number" inputmode="numeric" min="1" max="${G.maxStat}" value="${v}" data-stv="${k}" aria-label="${k}">
        <button type="button" class="stb" data-st="${k}:1" aria-label="${k} +1" ${nc > left || v >= G.maxStat ? 'disabled' : ''}>+</button>
        <span class="stc">${v < G.maxStat ? `${t('nextCost')} ${nc}` : 'MAX'}</span></div>`; }).join('')}</div>
    <div class="strow2"><button type="button" class="btn sm blue" data-act="autostat">${t('autoStat')}</button><button type="button" class="btn sm grey" data-act="resetstat">${t('resetStats')}</button></div>`;
}
function renderSkills(){
  const el = $('#skills'); if (!el) return; const d = S.edit.d, cls = CLS[d.class];
  const lv = d.skills.lv, total = skillPts(d.level), used = cls.skills.reduce((s, x) => s + (lv[x.id] || 0), 0), left = total - used;
  el.innerHTML = `<div class="ptsbox${left < 0 ? ' over' : ''}"><span>${left < 0 ? t('ptsOver') : t('skillPts')}</span><b>${left}</b><i>/ ${total}</i></div>
    <ul class="skedit">${cls.skills.map(s => { const n = lv[s.id] || 0, lock = d.level < s.unlock;
      return `<li class="${lock ? 'lock' : ''}">${skillIcon(s, {drag:s.type === 'active' && !lock, lv:n})}
        <span class="skn">${esc(s.name)}<i>${lock ? t('unlockAt') + s.unlock : (s.type === 'passive' ? t('passive') : t('active'))}</i></span>
        <span class="skst"><button type="button" class="stb" data-sk="${s.id}:-1" ${n <= 0 ? 'disabled' : ''} aria-label="${esc(s.name)} -1">−</button><b>${n}/${s.max}</b>
        <button type="button" class="stb" data-sk="${s.id}:1" ${lock || n >= s.max || left <= 0 ? 'disabled' : ''} aria-label="${esc(s.name)} +1">+</button></span></li>`; }).join('')}</ul>
    <div class="barlbl">${t('hotbar')}</div>
    <div class="hotbar">${Array.from({length:BAR_SIZE}, (_, i) => { const sid = d.skills.bar[i], s = sid && cls.skills.find(x => x.id === sid);
      return `<div class="bslot" data-drop="bar:${i}" ${s ? `data-drag="bar:${i}"` : ''}><i class="bn">${i + 1}</i>${s ? skillIcon(s, {lv:lv[s.id] || 0}) : ''}</div>`; }).join('')}</div>
    <p class="hint">${t('hotbarHint')}</p>`;
}
// Extra Passive = the game's 6 "Extra Slots" (DarkCharClient): passives of OTHER classes, opened at Lv.70/76/82/88/94/99,
// no repeats, never the own class, never NoExtra passives (Katana Mastery, Mae Mai Flow, Storm Sweep, Potion Expert)
function renderExtra(){
  const el = $('#extra'); if (!el) return; const d = S.edit.d, cls = CLS[d.class]; if (!cls) return;
  const open = xOpen(d.level), ex = d.skills.extra, sel = S.edit.xsel;
  const slots = XSLOTS.map((need, i) => {
    const s = SKILL[ex[i]];
    if (i >= open) return `<div class="xslot lockd${s ? ' bad' : ''}" data-drop="xslot:${i}">${s ? skillIcon(s) : LOCK}<span>Lv.${need}</span></div>`;
    return `<div class="xslot${sel === i ? ' sel' : ''}${s ? ' full' : ''}" data-drop="xslot:${i}" data-drag="xslot:${i}">${s ? skillIcon(s) : '<b class="plus">+</b>'}<span>${s ? esc(s.name) : t('empty2')}</span></div>`;
  }).join('');
  const list = PASSIVES.filter(s => s.clsId !== cls.id).map(s => ({s, why:s.noExtra ? t('xNo') : ex.includes(s.id) ? t('xUsed') : ''}))
    .sort((a, b) => (!!a.why - !!b.why) || a.s.cls.localeCompare(b.s.cls) || a.s.name.localeCompare(b.s.name));
  el.innerHTML = `<div class="ptsbox"><span>${t('xOpen')}</span><b>${open}</b><i>/ 6</i></div>
    <div class="xslots">${slots}</div>
    <p class="hint">${sel != null && sel < open ? `<b>${t('xSel')} ${sel + 1}</b> · ` : ''}${t('xHint')}</p>
    <div class="xpool" data-drop="xpool"><ul class="xlist">${list.map(x => xRow(x.s, x.why)).join('')}</ul></div>`;
}
function addExtra(id, idx){
  const d = S.edit.d, cls = CLS[d.class], s = SKILL[id], open = xOpen(d.level); if (!s || !cls || s.type !== 'passive' || s.clsId === cls.id) return;
  if (s.noExtra) return toast(`${s.name}: ${t('xNo')}`);
  if (!open) return toast(`${t('xLocked')} (Lv.${XSLOTS[0]})`);
  const ex = d.skills.extra.map(x => x === id ? null : x);
  if (idx == null) { idx = S.edit.xsel != null && S.edit.xsel < open ? S.edit.xsel : ex.findIndex((x, i) => i < open && !x); if (idx < 0) return toast(t('xFull')); }
  if (idx >= open) return toast(`${t('xLocked')} (Lv.${XSLOTS[idx]})`);
  ex[idx] = id; d.skills.extra = ex; S.edit.xsel = null; rerender(['extra']);
}
const RENDER = {slots:() => renderSlots(), cfg:() => renderCfg(), cards:() => renderCardSlots(), bag:() => renderBag(), stats:() => renderStats(), skills:() => renderSkills(), extra:() => renderExtra()};
function rerender(parts){ for (const p of parts) RENDER[p](); saveDraft(); }

// ---------- editor actions ----------
function equip(itemId, slot){
  const d = S.edit.d, it = ITEM[itemId], cls = CLS[d.class]; if (!it || !cls) return false;
  if (slot && kindOf(slot) !== it.slot) return false;
  if (it.slot === 'Weapon' && !(it.jobs || []).includes(cls.id)) { toast(t('eWeapon')); return false; }
  if (it.req > d.level) { toast(`${it.name}: ${t('needLv')}${it.req}`); return false; }
  if (!slot) slot = it.slot !== 'Ring' ? it.slot : !d.gear.Ring ? 'Ring' : !d.gear.Ring2 ? 'Ring2' : (S.edit.sel === 'Ring2' ? 'Ring2' : 'Ring');
  const old = d.gear[slot];
  d.gear[slot] = (old && old.id === itemId) ? old : newEntry(it);
  S.edit.sel = slot; S.edit.tab = it.slot;
  rerender(['slots', 'cfg', 'bag']); return true;
}
// game rule (PlayerStatsService.validateCards): normal cards can repeat, boss / mini boss cards (Unique) only once
function putCard(cardId, idx){
  const d = S.edit.d, c = CARD[cardId]; if (!c) return;
  if (idx == null) idx = G.cardSlotLevels.findIndex((need, i) => d.level >= need && !d.cards[i]);
  if (idx == null || idx < 0) { toast(t('eCardLock')); return; }
  if (d.level < G.cardSlotLevels[idx]) { toast(`${t('eCardLock')} (Lv.${G.cardSlotLevels[idx]})`); return; }
  if (c.u && d.cards.some((x, i) => x === cardId && i !== idx)) { toast(`${c.name}: ${t('eCardDup')}`); return; }
  d.cards[idx] = cardId; rerender(['cards', 'bag']);
}
function addBar(skillId, idx){
  const d = S.edit.d, cls = CLS[d.class], s = cls && cls.skills.find(x => x.id === skillId);
  if (!s || s.type !== 'active' || d.level < s.unlock) return;
  if (!(d.skills.lv[skillId] > 0)) {
    const used = cls.skills.reduce((a, x) => a + (d.skills.lv[x.id] || 0), 0);
    if (used >= skillPts(d.level)) { toast(t('eSkillPts')); return; }
    d.skills.lv[skillId] = 1;
  }
  const bar = d.skills.bar.filter(x => x !== skillId);
  if (idx == null) { if (bar.length >= BAR_SIZE) return; bar.push(skillId); }
  else bar.splice(Math.min(idx, bar.length), 0, skillId);
  d.skills.bar = bar.slice(0, BAR_SIZE); rerender(['skills']);
}
function onDrop(src, target){
  const d = S.edit.d; const [sk, sv] = src.split(':'); const [tk, tv] = (target || '').split(':');
  if (sk === 'item') { if (tk === 'slot') equip(sv, tv); return; }
  if (sk === 'slot') {
    if (tk === 'bag') { delete d.gear[sv]; if (S.edit.sel === sv) S.edit.sel = null; rerender(['slots', 'cfg', 'bag']); }
    else if (tk === 'slot' && tv !== sv && kindOf(tv) === kindOf(sv)) { [d.gear[sv], d.gear[tv]] = [d.gear[tv], d.gear[sv]]; for (const k of [sv, tv]) if (!d.gear[k]) delete d.gear[k]; S.edit.sel = tv; rerender(['slots', 'cfg']); }
    return;
  }
  if (sk === 'pas') { if (tk === 'xslot') addExtra(sv, +tv); return; }
  if (sk === 'xslot') {
    const i = +sv, id = d.skills.extra[i]; if (!id) return;
    if (tk === 'xslot') { const j = +tv; if (j >= xOpen(d.level)) return toast(`${t('xLocked')} (Lv.${XSLOTS[j]})`); [d.skills.extra[i], d.skills.extra[j]] = [d.skills.extra[j], d.skills.extra[i]]; }
    else if (tk === 'xpool') d.skills.extra[i] = null;
    return rerender(['extra']);
  }
  if (sk === 'card') { if (tk === 'cslot') putCard(sv, +tv); return; }
  if (sk === 'cslot') {
    const i = +sv;
    if (tk === 'cslot') { const j = +tv; if (d.level < G.cardSlotLevels[j]) return toast(t('eCardLock')); [d.cards[i], d.cards[j]] = [d.cards[j], d.cards[i]]; rerender(['cards']); }
    else if (tk === 'bag') { d.cards[i] = null; rerender(['cards', 'bag']); }
    return;
  }
  if (sk === 'skill') { if (tk === 'bar') addBar(sv, +tv); return; }
  if (sk === 'bar') {
    const i = +sv, id = d.skills.bar[i];
    if (tk === 'bar') { const bar = d.skills.bar.slice(); bar.splice(i, 1); bar.splice(Math.min(+tv, bar.length), 0, id); d.skills.bar = bar; rerender(['skills']); }
    else { d.skills.bar.splice(i, 1); rerender(['skills']); }
  }
}
function onTap(src){
  const [sk, sv] = src.split(':');
  if (sk === 'item') equip(sv);
  else if (sk === 'card') putCard(sv);
  else if (sk === 'skill') addBar(sv);
  else if (sk === 'slot') { S.edit.sel = sv; rerender(['slots', 'cfg']); }
  else if (sk === 'cslot') { S.edit.d.cards[+sv] = null; rerender(['cards', 'bag']); }
  else if (sk === 'bar') { S.edit.d.skills.bar.splice(+sv, 1); rerender(['skills']); }
  else if (sk === 'pas') addExtra(sv);
  else if (sk === 'xslot') { const i = +sv, ex = S.edit.d.skills.extra; if (ex[i]) { ex[i] = null; S.edit.xsel = null; } else S.edit.xsel = S.edit.xsel === i ? null : i; rerender(['extra']); }
}
function setLevel(v){
  const d = S.edit.d; d.level = clampN(v, 1, G.maxLevel);
  const f = $('#fL'); if (f && +f.value !== d.level) f.value = d.level;
  if (CLS[d.class]) rerender(['slots', 'cfg', 'cards', 'bag', 'stats', 'skills', 'extra']); else saveDraft();
}
function setClass(name){
  const d = S.edit.d; d.class = name;
  delete d.gear.Weapon; if (S.edit.sel === 'Weapon') S.edit.sel = null;
  const nc = CLS[name];
  d.skills = {lv:{}, bar:[], extra:(d.skills.extra || Array(6).fill(null)).map(x => x && SKILL[x] && (!nc || SKILL[x].clsId !== nc.id) ? x : null)};
  S.edit.xsel = null;
  renderBuilder(); saveDraft();
}

// ---------- drag engine (mouse: drag right away · touch: hold, then drag) ----------
const DR = {src:null, el:null, ghost:null, timer:null, x:0, y:0, sx:0, sy:0, on:false, touch:false, moved:false, over:null};
function dragStart(){
  if (!DR.el) return;
  DR.on = true; clearTimeout(DR.timer);
  const r = DR.el.getBoundingClientRect();
  const g = DR.el.cloneNode(true); g.classList.add('ghost'); g.removeAttribute('data-drag'); g.removeAttribute('data-drop');
  g.style.width = r.width + 'px'; g.style.height = r.height + 'px';
  document.body.appendChild(g); DR.ghost = g; DR.el.classList.add('dragging'); document.body.classList.add('isdrag');
  moveGhost(DR.x, DR.y);
  if (navigator.vibrate && DR.touch) { try { navigator.vibrate(15); } catch (e) {} }
}
function moveGhost(x, y){
  if (!DR.ghost) return;
  DR.ghost.style.transform = `translate(${x - DR.ghost.offsetWidth / 2}px, ${y - DR.ghost.offsetHeight / 2}px) scale(1.08)`;
  const under = document.elementFromPoint(x, y);
  const tgt = under && under.closest('[data-drop]');
  if (DR.over !== tgt) { if (DR.over) DR.over.classList.remove('over'); DR.over = tgt; if (tgt) tgt.classList.add('over'); }
  if (y < 60) scrollBy(0, -12); else if (y > innerHeight - 60) scrollBy(0, 12);
}
function dragEnd(commit){
  clearTimeout(DR.timer);
  const src = DR.src, over = DR.over, on = DR.on;
  if (DR.ghost) DR.ghost.remove();
  if (DR.el) DR.el.classList.remove('dragging');
  if (DR.over) DR.over.classList.remove('over');
  document.body.classList.remove('isdrag');
  Object.assign(DR, {src:null, el:null, ghost:null, timer:null, on:false, over:null});
  if (on && commit && src) onDrop(src, over ? over.dataset.drop : '');
}
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('[data-drag]'); if (!el || !S.edit || (e.button && e.button > 0)) return;
  if (e.target.closest('input,select,textarea')) return;
  Object.assign(DR, {src:el.dataset.drag, el, x:e.clientX, y:e.clientY, sx:e.clientX, sy:e.clientY, on:false, touch:e.pointerType !== 'mouse', moved:false});
  if (DR.touch) DR.timer = setTimeout(dragStart, 300);
});
document.addEventListener('pointermove', e => {
  if (!DR.src) return;
  DR.x = e.clientX; DR.y = e.clientY;
  if (!DR.on) {
    if (Math.hypot(DR.x - DR.sx, DR.y - DR.sy) > 8) { DR.moved = true; if (DR.touch) { clearTimeout(DR.timer); DR.src = null; DR.el = null; } else dragStart(); }
    return;
  }
  e.preventDefault(); moveGhost(DR.x, DR.y);
});
document.addEventListener('pointerup', () => {
  if (!DR.src) return;
  if (DR.on) return dragEnd(true);
  const src = DR.src, moved = DR.moved; dragEnd(false);
  if (!moved) onTap(src);
});
document.addEventListener('pointercancel', () => { if (DR.src) dragEnd(false); });
document.addEventListener('touchmove', e => { if (DR.on) e.preventDefault(); }, {passive:false});
document.addEventListener('contextmenu', e => { if (S.edit && e.target.closest('[data-drag]')) e.preventDefault(); });
document.addEventListener('dragstart', e => { if (e.target.closest && e.target.closest('[data-drag]')) e.preventDefault(); });

// ---------- validation + save ----------
function validate(d){
  const errs = [], bad = {};
  if (!/^[A-Za-z0-9_]{3,20}$/.test(String(d.roblox_name || '').trim())) { errs.push(t('eRoblox')); bad.roblox_name = 1; }
  const tl = String(d.title || '').trim(); if (tl.length < 3 || tl.length > 60) { errs.push(t('eTitle')); bad.title = 1; }
  const cls = CLS[d.class];
  if (!cls) { errs.push(t('eClass')); bad.class = 1; return {errs, bad}; }
  if (STATS.reduce((s, k) => s + costTo(d.stats[k]), 0) > totalPts(d.level)) errs.push(t('eStatPts'));
  if (cls.skills.reduce((s, x) => s + (d.skills.lv[x.id] || 0), 0) > skillPts(d.level)) errs.push(t('eSkillPts'));
  for (const s of SLOTS) { const e = d.gear[s], it = e && ITEM[e.id]; if (!it) continue;
    if (it.req > d.level) errs.push(`${it.name}: ${t('eItemLv')} (Lv.${it.req})`);
    if (s === 'Weapon' && !(it.jobs || []).includes(cls.id)) errs.push(`${it.name}: ${t('eWeapon')}`); }
  d.cards.forEach((c, i) => { if (c && d.level < G.cardSlotLevels[i]) errs.push(`${t('eCardLock')} (${i + 1} · Lv.${G.cardSlotLevels[i]})`); });
  const seen = new Set(); d.cards.forEach(c => { const cd = CARD[c]; if (cd && cd.u) { if (seen.has(c)) errs.push(`${cd.name}: ${t('eCardDup')}`); seen.add(c); } });
  const open = xOpen(d.level);
  d.skills.extra.forEach((x, i) => { const s = SKILL[x]; if (!s) return;
    if (i >= open) errs.push(`${t('extra')} ${i + 1}: ${t('eXLock')} Lv.${XSLOTS[i]}`);
    else if (s.clsId === cls.id || s.noExtra) errs.push(`${s.name}: ${t('eXBad')}`); });
  return {errs, bad};
}
function payload(d){
  const cls = CLS[d.class];
  const lv = {}; for (const s of cls.skills) { const n = clampN(d.skills.lv[s.id] || 0, 0, s.max); if (n && d.level >= s.unlock) lv[s.id] = n; }
  const bar = d.skills.bar.filter(id => lv[id] && cls.skills.find(x => x.id === id && x.type === 'active')).slice(0, BAR_SIZE);
  const gear = {}; for (const s of SLOTS) { const e = cleanEntry(d.gear[s]); if (e) gear[s] = e; }
  return {roblox_name:String(d.roblox_name).trim(), title:String(d.title).trim(), class:d.class, level:d.level, stats:Object.assign({}, d.stats),
    concept:String(d.concept || '').trim().slice(0, 2000), gear, cards:d.cards.slice(0, 8),
    skills:{lv, bar, extra:d.skills.extra.map((x, i) => x && i < xOpen(d.level) && SKILL[x] && SKILL[x].clsId !== cls.id && !SKILL[x].noExtra ? x : null)}, tags:d.tags.slice(0, MAX_TAGS)};
}
async function submitEditor(){
  const {id, d} = S.edit, {errs, bad} = validate(d), fe = $('#formErr');
  $$('#edForm input.bad, #edForm select.bad').forEach(x => x.classList.remove('bad'));
  for (const k of Object.keys(bad)) { const el = k === 'class' ? $('#fC') : $(`#edForm [data-f="${k}"]`); if (el) el.classList.add('bad'); }
  if (errs.length) { fe.innerHTML = `<b>${t('eFix')}</b><ul>${errs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`; fe.hidden = false; fe.scrollIntoView({block:'center', behavior:'smooth'}); return; }
  fe.hidden = true;
  const btn = $('#saveBtn'); btn.disabled = true; btn.textContent = t('saving');
  try {
    const p = payload(d);
    const saved = id ? await S.api.update(id, p) : await S.api.create(p);
    if (!S.me) S.me = await S.api.me(false);
    store.set('ht_name', p.roblox_name);
    if (!id) { clearTimeout(draftTm); store.del('ht_draft2'); }
    S.cur = saved; S.listKey = null; S.edit = null;
    toast(id ? t('savedEdit') : t('saved')); location.hash = '#build-' + saved.id;
  } catch (err) {
    console.error(err); fe.textContent = /build limit/i.test(errMsg(err)) ? t('eLimit') : t('eSave'); fe.hidden = false;
    btn.disabled = false; btn.textContent = id ? t('saveEdit') : t('save');
  }
}

// ---------- like / rate / report / delete ----------
function findBuild(id){ return S.list.find(x => x.id === id) || (S.cur && S.cur.id === id ? S.cur : null); }
function applyLike(id, liked, count){
  if (liked) S.mine.likes.add(id); else S.mine.likes.delete(id);
  S.list.forEach(x => { if (x.id === id) x.like_count = count; }); if (S.cur && S.cur.id === id) S.cur.like_count = count;
  $$(`[data-like="${CSS.escape(id)}"]`).forEach(btn => { btn.classList.toggle('on', liked); btn.setAttribute('aria-pressed', liked); btn.querySelector('span').textContent = count; });
}
async function onLike(id){
  const b = findBuild(id); if (!b || S.busy[id]) return;
  if (S.me && b.user_id === S.me) return toast(t('ownNoRate'));
  S.busy[id] = 1; const was = S.mine.likes.has(id), before = b.like_count | 0;
  applyLike(id, !was, Math.max(0, before + (was ? -1 : 1)));
  try { const r = await S.api.toggleLike(id); applyLike(id, !!r.liked, r.like_count | 0); if (!S.me) S.me = await S.api.me(false); }
  catch (e) { console.error(e); applyLike(id, was, before); toast(/own build/i.test(errMsg(e)) ? t('ownNoRate') : t('eAction')); }
  finally { delete S.busy[id]; }
}
async function onRate(n){
  const b = S.cur; if (!b || S.busy['r' + b.id]) return; S.busy['r' + b.id] = 1;
  const prev = S.mine.ratings[b.id], snap = {s:b.rating_sum, c:b.rating_count};
  if (prev) b.rating_sum += n - prev; else { b.rating_sum += n; b.rating_count++; }
  S.mine.ratings[b.id] = n; renderDetail();
  try { const r = await S.api.rate(b.id, n); b.rating_sum = r.rating_sum | 0; b.rating_count = r.rating_count | 0; S.list.forEach(x => { if (x.id === b.id) { x.rating_sum = b.rating_sum; x.rating_count = b.rating_count; } }); if (!S.me) S.me = await S.api.me(false); }
  catch (e) { console.error(e); b.rating_sum = snap.s; b.rating_count = snap.c; if (prev) S.mine.ratings[b.id] = prev; else delete S.mine.ratings[b.id]; toast(/own build/i.test(errMsg(e)) ? t('ownNoRate') : t('eAction')); }
  finally { delete S.busy['r' + b.id]; if (location.hash === '#build-' + b.id) renderDetail(); }
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
  try { await S.api.report(b.id, reason.slice(0, 300)); S.mine.reports.add(b.id); toast(t('repDone')); } catch (e) { console.error(e); toast(t('eAction')); }
}

// ---------- events ----------
let qTm, cqTm;
document.addEventListener('input', e => {
  const el = e.target;
  if (el.id === 'q') { clearTimeout(qTm); qTm = setTimeout(() => { S.filter.q = el.value.trim(); loadList(true); }, 300); return; }
  if (!S.edit || !el.closest('#edForm')) return;
  const d = S.edit.d;
  if (el.id === 'cq') { S.edit.cardQ = el.value; clearTimeout(cqTm); cqTm = setTimeout(() => { renderBag(); const c = $('#cq'); if (c) { c.focus(); c.setSelectionRange(c.value.length, c.value.length); } }, 250); return; }
  if (el.dataset.f) { d[el.dataset.f] = el.value; el.classList.remove('bad'); if (el.id === 'fX') $('#cnt').textContent = `${el.value.length} / 2000`; saveDraft(); return; }
  if (el.dataset.o && el.type === 'range') {
    const e2 = d.gear[S.edit.sel]; if (!e2) return; const o = el.dataset.o, v = +el.value;
    let txt = '';
    if (o === 'main') { e2.main = v; txt = label(ITEM[e2.id].main, v); }
    else if (o === 'spv' && e2.sp) { e2.sp.v = v; txt = label(e2.sp.k, v); }
    else if (o.startsWith('lv')) { const l = e2.lines[+o.slice(2)]; if (l) { l.v = v; txt = label(l.k, v); } }
    const out = $(`[data-ov="${o}"]`); if (out && txt) out.textContent = txt;
    saveDraft();
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (!S.edit || !el.closest('#edForm')) return;
  const d = S.edit.d;
  if (el.id === 'fC') {
    if (d.class && (d.gear.Weapon || Object.keys(d.skills.lv).length)) {
      modal({title:t('clsChange'), okLabel:t('change'), okClass:'orange'}).then(ok => { if (ok) setClass(el.value); else el.value = d.class; });
    } else setClass(el.value);
    return;
  }
  if (el.id === 'fL') return setLevel(el.value);
  if (el.id === 'cmine') { S.edit.cardMine = el.checked; return renderBag(); }
  if (el.dataset.stv) {
    const k = el.dataset.stv, others = STATS.reduce((s, x) => s + (x === k ? 0 : costTo(d.stats[x])), 0);
    let v = clampN(el.value, 1, G.maxStat); while (v > 1 && others + costTo(v) > totalPts(d.level)) v--;
    d.stats[k] = v; return rerender(['stats']);
  }
  if (el.dataset.tag) {
    if (el.checked) { if (d.tags.length >= MAX_TAGS) { el.checked = false; return toast(t('maxTags')); } d.tags.push(el.dataset.tag); }
    else d.tags = d.tags.filter(x => x !== el.dataset.tag);
    return saveDraft();
  }
  if (el.dataset.o) {
    const e2 = d.gear[S.edit.sel], it = e2 && ITEM[e2.id]; if (!it) return; const o = el.dataset.o;
    if (el.type === 'range') return;
    if (o === 'refine') e2.refine = clampN(el.value, 0, G.refineMax);
    else if (o === 'spk') { if (!el.value) e2.sp = null; else { const r = optRange(it, el.value, true); e2.sp = r ? {k:el.value, v:r[1]} : null; } }
    else if (o.startsWith('lk')) { const i = +o.slice(2); if (!el.value) e2.lines.splice(i, 1); else { const r = optRange(it, el.value, false); if (r) e2.lines[i] = {k:el.value, v:r[1]}; } e2.lines = e2.lines.filter(Boolean); }
    rerender(['slots', 'cfg']);
  }
});
document.addEventListener('submit', e => { if (e.target.id === 'edForm') { e.preventDefault(); submitEditor(); } });
document.addEventListener('click', async e => {
  const el = e.target.closest('button,[data-like]'); if (!el) return;
  if (el.id === 'langBtn') { lang = lang === 'th' ? 'en' : 'th'; store.set('ht_lang', lang); applyI18n(); return route(); }
  if (el.dataset.like) { e.preventDefault(); return onLike(el.dataset.like); }
  if (el.dataset.rate) return onRate(+el.dataset.rate);
  if (!S.edit) {
    if (el.dataset.sort) { S.filter.sort = el.dataset.sort; $$('[data-sort]').forEach(b => { b.classList.toggle('orange', b === el); b.classList.toggle('grey', b !== el); }); return loadList(true); }
    if (el.dataset.cls !== undefined && el.classList.contains('chip')) { S.filter.cls = el.dataset.cls; $$('.chip').forEach(c => c.classList.toggle('on', c === el)); return loadList(true); }
    const act = el.dataset.act;
    if (act === 'retry') return loadList(true); if (act === 'more') return loadList(false); if (act === 'reroute') return route();
    if (act === 'copy') return onCopy(); if (act === 'del') return onDelete(); if (act === 'report') return onReport();
    return;
  }
  const d = S.edit.d;
  if (el.dataset.tab) { S.edit.tab = el.dataset.tab; return renderBag(); }
  if (el.dataset.rar !== undefined) { S.edit.cardR = el.dataset.rar; return renderBag(); }
  if (el.dataset.lv) return setLevel(d.level + +el.dataset.lv);
  if (el.dataset.st) {
    const [k, n] = el.dataset.st.split(':'); const v = d.stats[k] + +n;
    if (v < 1 || v > G.maxStat) return;
    if (+n > 0 && STATS.reduce((s, x) => s + costTo(x === k ? v : d.stats[x]), 0) > totalPts(d.level)) return;
    d.stats[k] = v; return rerender(['stats']);
  }
  if (el.dataset.sk) {
    const [sid, n] = el.dataset.sk.split(':'); const cls = CLS[d.class], s = cls && cls.skills.find(x => x.id === sid); if (!s) return;
    const v = clampN((d.skills.lv[sid] || 0) + +n, 0, s.max);
    if (+n > 0 && (cls.skills.reduce((a, x) => a + (x.id === sid ? v : (d.skills.lv[x.id] || 0)), 0) > skillPts(d.level) || d.level < s.unlock)) return;
    if (v) d.skills.lv[sid] = v; else { delete d.skills.lv[sid]; d.skills.bar = d.skills.bar.filter(x => x !== sid); }
    return rerender(['skills']);
  }
  const act = el.dataset.act;
  if (act === 'unequip') { delete d.gear[S.edit.sel]; S.edit.sel = null; return rerender(['slots', 'cfg', 'bag']); }
  if (act === 'autostat') { d.stats = autoStats(CLS[d.class], d.level); return rerender(['stats']); }
  if (act === 'resetstat') { d.stats = Object.fromEntries(STATS.map(k => [k, 1])); return rerender(['stats']); }
  if (act === 'clear') {
    if (!await modal({title:t('clearQ'), body:`<p>${t('clearMsg')}</p>`, okLabel:t('clearForm'), okClass:'red'})) return;
    store.del('ht_draft2'); S.edit = {id:null, d:normalize(blank()), sel:null, xsel:null, tab:'Weapon', cardQ:'', cardR:'', cardMine:false}; renderEditor(); scrollTo(0, 0);
  }
});

// ---------- routing + start ----------
function applyI18n(){
  document.documentElement.lang = lang;
  $$('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  const lb = $('#langBtn'); lb.hidden = !thOK || viaTranslate; lb.textContent = lang === 'th' ? 'EN' : 'ไทย';
  const fl = $('#footLang');
  if (fl && window.HT_SKILLS) { fl.innerHTML = window.HT_SKILLS.langPicker(lang === 'th' ? 'อ่านเว็บนี้เป็นภาษาอื่น' : 'Read this site in another language', ''); window.HT_SKILLS.wireLangPicker(fl); }
}
// ---------- hunter's guide (guide.js) ----------
function guideScroll(sec){ if (window.HT_GUIDE) window.HT_GUIDE.open(sec, true); }
function viewGuide(sec){
  $('#hero').hidden = true; document.body.classList.toggle('home', false);
  if (!window.HT_GUIDE) { app.innerHTML = `<div class="empty"><p>${t('errLoad')}</p></div>`; return; }
  S.guideLang = lang;
  window.HT_GUIDE.render({G, lang, app, H:{esc, itemTile, cardTile, skillIcon, labelName, totalPts, costTo, GAME_URL, rarColor: r => RAR_COLOR[r] || '#999'}});
  document.title = (lang === 'th' ? 'คู่มือนักล่า' : "Hunter's Guide") + ' · Hunting Together Builds';
  requestAnimationFrame(() => window.HT_GUIDE.open(sec, false));
}
function viewPlay(sec){
  $('#hero').hidden = true; document.body.classList.toggle('home', false);
  if (!window.HT_PLAY) { app.innerHTML = `<div class="empty"><p>${t('errLoad')}</p></div>`; return; }
  S.guideLang = lang;
  window.HT_PLAY.render({lang, app});
  document.title = (lang === 'th' ? 'ปุ่มลัดและทริค' : 'Controls & Tricks') + ' · Hunting Together Builds';
  if (sec) requestAnimationFrame(() => window.HT_PLAY.open(sec));
}
function viewSkills(sec, keep){
  $('#hero').hidden = true; document.body.classList.toggle('home', false);
  if (!window.HT_SKILLS) { app.innerHTML = `<div class="empty"><p>${t('errLoad')}</p></div>`; return; }
  const y = scrollY;
  window.HT_SKILLS.render({G, lang, app, sec: sec || null, H:{esc, skillIcon}});
  document.title = (lang === 'th' ? 'คัมภีร์สกิล' : 'Skill Book') + ' · Hunting Together Builds';
  if (keep) { const bar = $('.sb-cls'); scrollTo(0, Math.min(y, bar ? bar.offsetTop - 70 : y)); }
}
function route(){
  const h = decodeURIComponent(location.hash.slice(1));
  const next = h.startsWith('build-') ? 'detail' : h === 'new' ? 'new' : h.startsWith('edit-') ? 'edit' : (h === 'guide' || h.startsWith('guide-')) ? 'guide' : (h === 'play' || h.startsWith('play-')) ? 'play' : (h === 'skills' || h.startsWith('skills-')) ? 'skills' : 'list';
  if (S.view === 'list' && next !== 'list') S.scrollY = scrollY;
  const wasGuide = S.view === 'guide' && S.guideLang === lang;
  const wasPlay = S.view === 'play' && S.guideLang === lang;
  const wasSkills = S.view === 'skills';
  S.view = next;
  if (next !== 'guide' && next !== 'play' && next !== 'skills') document.title = 'Hunting Together Builds';
  if (next === 'guide' && wasGuide && $('.guide')) return guideScroll(h.slice(6));
  if (next === 'play' && wasPlay && $('.play') && window.HT_PLAY) return window.HT_PLAY.open(h.slice(5));
  if (next !== 'new' && next !== 'edit') S.edit = null;
  if (next === 'list') return viewList();
  if (!(next === 'skills' && wasSkills)) scrollTo(0, 0);
  if (next === 'guide') return viewGuide(h.slice(6));
  if (next === 'play') return viewPlay(h.slice(5));
  if (next === 'skills') return viewSkills(h.slice(7), wasSkills);
  if (next === 'detail') return viewDetail(h.slice(6));
  if (next === 'new') return viewEditor(null);
  return viewEditor(h.slice(5));
}
async function init(){
  applyI18n();
  if (!G) { app.innerHTML = `<div class="empty"><p>${t('errConnect')}</p></div>`; return; }
  // the guide needs no database: show it right away
  if (/^#(guide|play|skills)(-|$)/.test(location.hash)) route();
  if (CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY) {
    try { await loadScript(SUPA_CDN); S.api = SupaAPI(window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {auth:{persistSession:true, autoRefreshToken:true}})); }
    catch (e) { console.error(e); if (S.view !== 'guide' && S.view !== 'play' && S.view !== 'skills') app.innerHTML = `<div class="empty"><p>${t('errConnect')}</p><button class="btn blue" onclick="location.reload()">${t('retry')}</button></div>`; return; }
  } else { S.api = DemoAPI(); $('#modeNote').hidden = false; }
  try { S.me = await S.api.me(false); S.mine = await S.api.myState(); } catch (e) { console.error(e); }
  route(); addEventListener('hashchange', () => route());
}
init();
}
