// Hunting Together Build Board — "Controls & Tricks" page (#play).
// Every key, button and number here was checked in the game's code (Shared.HotkeyMap, GameConfig, BotModes,
// CombatClient, SkillClient, CharPageClient, HudEditClient, HomeWarpClient, WarpPillarClient, AutoRefine/AutoSell, AfkGuard…).
(function(){
'use strict';
const IC = n => `assets/icons/${n}.webp`;
const img = (n, cls = 'gi md') => `<img class="${cls}" src="${IC(n)}" alt="" loading="lazy" draggable="false">`;
const kbd = k => `<kbd>${k}</kbd>`;

// gesture chips for touch screens (tap / hold / drag / pinch)
const G = {
  tap:   {en:'Tap',  th:'แตะ'},
  hold:  {en:'Hold', th:'กดค้าง'},
  drag:  {en:'Drag', th:'ลาก'},
  pinch: {en:'Pinch',th:'ถ่างนิ้ว'},
  click: {en:'Click',th:'คลิก'},
  rclick:{en:'Right-click',th:'คลิกขวา'},
  hover: {en:'Point at',th:'ชี้เมาส์'},
};
const ges = (k, lang) => `<span class="ges g-${k}"><i></i>${G[k][lang] || G[k].en}</span>`;

// ---------- keyboard map (defaults from Shared.HotkeyMap + fixed game keys) ----------
const KEYS = {
  F:{g:'c', en:'Auto Attack', th:'โจมตีอัตโนมัติ', se:'Auto', st:'ออโต้'},
  Space:{g:'c', en:'Attack', th:'โจมตี', se:'Attack', st:'โจมตี'},
  V:{g:'c', en:'Auto settings', th:'ตั้งค่าออโต้', se:'Auto set', st:'ตั้งออโต้'},
  Q:{g:'c', en:'Dash', th:'แดช (กลิ้งหลบ)', se:'Dash', st:'แดช'},
  X:{g:'c', en:'Sleep (AFK)', th:'โหมดหลับ (AFK)', se:'Sleep', st:'หลับ'},
  '1–8':{g:'c', en:'Skills & items on the hotbar', th:'สกิลและไอเทมในแถบลัด', se:'Skill', st:'สกิล'},
  Shift:{g:'m', en:'Hold to run', th:'กดค้างเพื่อวิ่ง', se:'Run', st:'วิ่ง'},
  M:{g:'m', en:'Mount', th:'ขี่สัตว์', se:'Mount', st:'ขี่'},
  H:{g:'m', en:'Home (warp to village)', th:'วาปกลับหมู่บ้าน', se:'Home', st:'บ้าน'},
  E:{g:'m', en:'Use a Warp Pillar', th:'ใช้เสาวาร์ป', se:'Pillar', st:'เสา'},
  WASD:{g:'m', en:'Move', th:'เดิน', se:'Move', st:'เดิน'},
  B:{g:'w', en:'Bag', th:'กระเป๋า', se:'Bag', st:'กระเป๋า'},
  C:{g:'w', en:'Status & Skills', th:'สเตตัสและสกิล', se:'Stats', st:'สเตตัส'},
  L:{g:'w', en:'Quest', th:'เควส', se:'Quest', st:'เควส'},
  P:{g:'w', en:'Party', th:'ปาร์ตี้', se:'Party', st:'ปาร์ตี้'},
  J:{g:'w', en:'Mail', th:'จดหมาย', se:'Mail', st:'จดหมาย'},
  N:{g:'w', en:'Adventure Book', th:'สมุดผจญภัย', se:'Book', st:'สมุด'},
  T:{g:'w', en:'Rewards', th:'รางวัล', se:'Gift', st:'รางวัล'},
  U:{g:'w', en:'Shop', th:'ร้านค้า', se:'Shop', st:'ร้าน'},
  Y:{g:'w', en:'Premium', th:'พรีเมียม', se:'VIP', st:'พรีเมียม'},
  Z:{g:'w', en:'Settings', th:'ตั้งค่า', se:'Setup', st:'ตั้งค่า'},
  Tab:{g:'w', en:'Players in this server', th:'รายชื่อผู้เล่นในเซิร์ฟ', se:'Players', st:'ผู้เล่น'},
  Esc:{g:'w', en:'Close window', th:'ปิดหน้าต่าง', se:'Close', st:'ปิด'},
};
const ROWS = [
  ['Esc','1','2','3','4','5','6','7','8','9','0'],
  ['Tab','Q','W','E','R','T','Y','U','I','O','P'],
  ['Caps','A','S','D','F','G','H','J','K','L'],
  ['Shift','Z','X','C','V','B','N','M'],
  ['Space'],
];
const keyInfo = k => KEYS[k] || (/^[1-8]$/.test(k) ? KEYS['1–8'] : /^[WASD]$/.test(k) ? KEYS.WASD : null);

// ---------- words ----------
const W = {
en: {
  title: 'Controls & Tricks', sub: 'Everything the game can do for you, and the fastest way to do it on PC and on mobile.',
  tabSys: 'Game systems', tabSkills: 'Skill Book', tabPlay: 'Controls & tricks',
  pc: 'PC', mob: 'Mobile', showFor: 'Show tricks for',
  keysT: 'Keyboard map', keysP: 'Default keys. Change any of them in Settings › Hotkeys.',
  legend: {c:'Fight', m:'Move', w:'Windows'},
  phoneT: 'Where things are on your screen', phoneP: 'Default spots. You can move and resize the play buttons with Edit Buttons.',
  pins: [
    ['Menu, photo mode, chat & emotes','tl'],
    ['Monster HP + its element (tap for the element guide)','tc'],
    ['Menu buttons: Bag, Character, Quest…','tr'],
    ['Move stick + Edit Buttons icon','bl'],
    ['Attack, Auto, skills, potion, Dash, Run, Home','br'],
  ],
  how: 'How', where: 'Where', pass: 'Game Pass', pcOnly: 'PC only', mobOnly: 'Mobile only', or: 'or',
  groups: {
    auto: ['Let the game hunt for you', 'Auto Attack does the walking, hitting and potions. You choose how.'],
    grow: ['Level up without thinking', 'Points and skills can spend themselves. Your hotbar is yours to arrange.'],
    gear: ['Gear on autopilot', 'Refine, sell and swap gear sets with a few taps.'],
    move: ['Get around fast', 'Quests walk you there, Home and Pillars jump you there.'],
    screen: ['Make the screen yours', 'Buttons, keys, effects and camera, set the way you like.'],
  },
},
th: {
  title: 'ปุ่มลัดและทริค', sub: 'ทุกอย่างที่เกมทำให้เราได้ และวิธีที่เร็วที่สุด ทั้งบนคอมและมือถือ',
  tabSys: 'ระบบในเกม', tabSkills: 'คัมภีร์สกิล', tabPlay: 'ปุ่มลัดและทริค',
  pc: 'คอม', mob: 'มือถือ', showFor: 'แสดงทริคสำหรับ',
  keysT: 'ปุ่มคีย์บอร์ด', keysP: 'ปุ่มเริ่มต้นของเกม เปลี่ยนปุ่มไหนก็ได้ที่ ตั้งค่า › Hotkeys',
  legend: {c:'ต่อสู้', m:'เดินทาง', w:'หน้าต่าง'},
  phoneT: 'อะไรอยู่ตรงไหนบนจอ', phoneP: 'ตำแหน่งเริ่มต้น ปุ่มเล่นย้ายและปรับขนาดได้ด้วยปุ่ม "จัดปุ่ม"',
  pins: [
    ['เมนู โหมดถ่ายรูป แชต และท่าทาง','tl'],
    ['เลือดมอน + ธาตุของมอน (แตะเพื่อเปิดหน้าสอนธาตุ)','tc'],
    ['ปุ่มเมนู: กระเป๋า ตัวละคร เควส…','tr'],
    ['จอยเดิน + ไอคอนจัดปุ่ม','bl'],
    ['โจมตี ออโต้ สกิล ยา แดช วิ่ง กลับบ้าน','br'],
  ],
  how: 'วิธี', where: 'อยู่ที่', pass: 'Game Pass', pcOnly: 'เฉพาะคอม', mobOnly: 'เฉพาะมือถือ', or: 'หรือ',
  groups: {
    auto: ['ให้เกมล่าแทนเรา', 'ออโต้เดิน ตี และดื่มยาให้เอง เราแค่เลือกว่าจะให้เล่นแบบไหน'],
    grow: ['อัปเลเวลแบบไม่ต้องคิด', 'แต้มสเตตัสและสกิลลงเองได้ ส่วนแถบลัดจัดเองตามใจ'],
    gear: ['อุปกรณ์แบบอัตโนมัติ', 'ตีบวก ขาย และสลับชุดอุปกรณ์ได้ในไม่กี่แตะ'],
    move: ['เดินทางให้ไว', 'เควสพาเดินไปเอง ส่วนกลับบ้านกับเสาวาร์ปพาวาปไปเลย'],
    screen: ['ปรับจอให้เป็นของเรา', 'ปุ่ม คีย์ เอฟเฟกต์ และกล้อง ตั้งได้ตามชอบ'],
  },
}};

// ---------- the tricks ----------
// dev: 'pc' / 'mob' = only for that device · pass = Game Pass feature · pc / mob = how to do it (array of html parts)
const T = [
  // auto
  {g:'auto', ic:'auto', en:['Auto Attack','Your hunter walks to monsters, attacks and uses skills on its own — and stays on after a server restart.'],
    th:['โจมตีอัตโนมัติ','ตัวละครเดินไปหามอน ตี และใช้สกิลเอง เซิร์ฟรีสตาร์ตก็ยังเปิดอยู่'],
    pc:l=>[kbd('F'), l.or, ges('click',l.k)+' Auto'], mob:l=>[ges('tap',l.k)+' Auto']},
  {g:'auto', ic:'setting', en:['Auto settings','Normal = fight · Support = stand still, heal and buff the party. Also: skills only, which monsters to hit, what to pick up, how far to roam or stay in one spot.'],
    th:['ตั้งค่าออโต้','โหมดปกติ = ตี · โหมดช่วยเหลือ = ยืนฮีลและบัฟเพื่อน เลือกได้ว่าใช้สกิลอย่างเดียว ตีมอนตัวไหน เก็บของอะไร และเดินไกลแค่ไหนหรือยืนปักหลัก'],
    pc:l=>[kbd('V'), l.or, ges('click',l.k)+' ⚙'], mob:l=>[ges('hold',l.k)+' Auto', l.or, ges('tap',l.k)+' ⚙']},
  {g:'auto', ic:'HIT', en:['Lock a target','Pick the monster you want: Auto keeps hitting that one until it falls.'],
    th:['ล็อกเป้า','เลือกมอนที่อยากตี ออโต้จะตีตัวนั้นจนตายก่อน'],
    pc:l=>[ges('click',l.k)+(l.k==='th'?' ที่มอน':' a monster')], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ที่มอน':' a monster'), l.or, ges('tap',l.k)+(l.k==='th'?' ปุ่มสลับเป้า':' Switch Target')]},
  {g:'auto', ic:'red_potion', en:['Potions by themselves','While Auto is on, your hunter drinks an HP potion when HP drops under 50%.'],
    th:['ดื่มยาเอง','ตอนเปิดออโต้ ตัวละครจะดื่มยา HP เองเมื่อเลือดต่ำกว่า 50%']},
  {g:'auto', ic:'fire', en:['Read the monster','Under the monster\'s HP bar you see its element and what beats it. Tap that line for the element guide.'],
    th:['ดูธาตุมอน','ใต้หลอดเลือดมอนบอกธาตุของมัน และธาตุที่ชนะมัน แตะบรรทัดนั้นเพื่อเปิดหน้าสอนธาตุ'],
    pc:l=>[ges('click',l.k)+(l.k==='th'?' บรรทัดธาตุ':' the element line')], mob:l=>[ges('tap',l.k)+(l.k==='th'?' บรรทัดธาตุ':' the element line')]},
  {g:'auto', ic:'sit_button', en:['Sleep while you are away','A black rest screen saves battery. Auto keeps hunting and counts the Gold, EXP and items you got. It also starts by itself after 17 minutes idle.'],
    th:['โหมดหลับตอนไม่อยู่','จอดำช่วยประหยัดแบต ออโต้ยังล่าต่อ และนับ Gold, EXP, ของที่ได้ให้ดู ไม่ได้แตะจอ 17 นาทีจะเข้าโหมดนี้เอง'],
    pc:l=>[kbd('X')], mob:l=>[ges('tap',l.k)+' Sleep', '·', ges('drag',l.k)+(l.k==='th'?' เพื่อตื่น':' to wake')]},
  {g:'auto', ic:'menu_party', en:['Follow a friend','In the Party window, press Follow on a member: you walk with them and Auto helps with their monsters.'],
    th:['ตามเพื่อน','ในหน้าต่างปาร์ตี้ กด Follow ที่ชื่อเพื่อน เราจะเดินตามและออโต้ช่วยตีมอนที่เพื่อนตี'],
    pc:l=>[kbd('P'), '→ Follow'], mob:l=>[ges('tap',l.k)+' Party → Follow']},
  {g:'auto', ic:'MaxHP', pass:1, en:['Auto Respawn','Come back on the same spot 5 s after you fall. Switch it on in Settings.'],
    th:['เกิดใหม่อัตโนมัติ','ตายแล้วเกิดใหม่ที่เดิมใน 5 วินาที เปิดได้ในตั้งค่า']},
  // grow
  {g:'grow', ic:'arrow_skills', en:['Auto Skill','On from day one: skill points go into your class skills by themselves. Turn it off on the Skills page to choose yourself.'],
    th:['อัปสกิลอัตโนมัติ','เปิดไว้ตั้งแต่เริ่มเกม แต้มสกิลจะลงสกิลอาชีพให้เอง ถ้าอยากเลือกเองให้ปิดที่หน้าสกิล'],
    pc:l=>[kbd('C'), '→ Skills'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ตัวละคร → สกิล':' Character → Skills')]},
  {g:'grow', ic:'arrow_stats', en:['Auto Stat','Switch Auto on in the Status page and every new stat point goes in by itself. Or use − / + / +10 and Confirm.'],
    th:['อัปสเตตัสอัตโนมัติ','เปิดสวิตช์ Auto ที่หน้าสเตตัส แต้มใหม่จะลงเอง หรือกด − / + / +10 แล้วกดยืนยันเอง'],
    pc:l=>[kbd('C'), '→ Status'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ตัวละคร → สเตตัส':' Character → Status')]},
  {g:'grow', ic:'menu_skill', en:['Put skills on your hotbar','Drag a learned skill card onto a hotbar slot. Then press its number or tap it.'],
    th:['ใส่สกิลลงแถบลัด','ลากการ์ดสกิลที่เรียนแล้วไปวางบนช่องในแถบลัด แล้วกดเลขช่องหรือแตะเพื่อใช้'],
    pc:l=>[ges('drag',l.k), '→', kbd('1')+'–'+kbd('8')], mob:l=>[ges('drag',l.k), '→', ges('tap',l.k)]},
  {g:'grow', ic:'INT', en:['Read a skill','See what a skill does, its damage and cooldown before you spend points.'],
    th:['อ่านสกิล','ดูว่าสกิลทำอะไร แรงเท่าไร คูลดาวน์กี่วิ ก่อนลงแต้ม'],
    pc:l=>[ges('hover',l.k)+(l.k==='th'?' การ์ดสกิล':' the skill card')], mob:l=>[ges('hold',l.k)+(l.k==='th'?' การ์ดสกิล':' the skill card')]},
  {g:'grow', ic:'statmaster', en:['Start over','Reset stats or skills at the Stat Master in the village. It costs Gold, free with Premium or the Free Reset pass.'],
    th:['รีเซ็ตใหม่','รีเซ็ตสเตตัสหรือสกิลได้ที่ Stat Master ในหมู่บ้าน ใช้ Gold แต่ฟรีถ้ามี Premium หรือ Free Reset pass']},
  // gear
  {g:'gear', ic:'refine_stone', pass:1, en:['Auto Refine','Queue up to 8 items, set the + you want for each, pick from which + to use Protection and Lucky Stones, then Start. Works anywhere.'],
    th:['ตีบวกอัตโนมัติ','ใส่ของได้ 8 ชิ้น ตั้งเป้า + ของแต่ละชิ้น เลือกว่าจะใช้หินกันลดกับหินนำโชคตั้งแต่ + เท่าไร แล้วกดเริ่ม ใช้ได้ทุกที่'],
    pc:l=>[ges('click',l.k)+(l.k==='th'?' AUTO ในหน้าตีบวก':' AUTO in the Refine window')], mob:l=>[ges('tap',l.k)+(l.k==='th'?' AUTO ในหน้าตีบวก':' AUTO in the Refine window')]},
  {g:'gear', ic:'merchant', pass:1, en:['Auto Sell & Dismantle','For each tier I–V choose keep, sell or dismantle for monster gear drops, and keep pieces that roll the stats you want. Works even with a full bag.'],
    th:['ขาย/ย่อยอัตโนมัติ','เลือกได้ทีละ Tier (I–V) ว่าของที่มอนดรอปจะเก็บ ขาย หรือย่อย และเก็บชิ้นที่ออกค่าที่ต้องการไว้ ทำงานแม้กระเป๋าเต็ม'],
    pc:l=>[kbd('B'), '→ Auto Sell'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' กระเป๋า → Auto Sell':' Bag → Auto Sell')]},
  {g:'gear', ic:'storage', en:['Loadouts','Save a whole gear set and put it on in one go. Slots 1–2 are free.'],
    th:['ชุดอุปกรณ์ (Loadout)','บันทึกชุดอุปกรณ์ทั้งชุด แล้วใส่ทีเดียวทั้งชุด ช่อง 1–2 ใช้ฟรี'],
    pc:l=>[kbd('B'), '→ Loadout'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' กระเป๋า → Loadout':' Bag → Loadout')]},
  // move
  {g:'move', ic:'menu_quest', en:['Let the quest walk you','Tap a quest in the quest list: your hunter walks there by itself, following gold arrows on the ground.'],
    th:['ให้เควสพาเดิน','แตะเควสในรายการเควส ตัวละครจะเดินไปเอง ตามลูกศรสีทองบนพื้น'],
    pc:l=>[ges('click',l.k)+(l.k==='th'?' เควส':' a quest')], mob:l=>[ges('tap',l.k)+(l.k==='th'?' เควส':' a quest')]},
  {g:'move', ic:'town_scroll', en:['Home','Warp back to the village: stand still for 5 s. Moving cancels it. 1 minute cooldown.'],
    th:['กลับหมู่บ้าน','วาปกลับหมู่บ้าน ยืนนิ่ง 5 วินาที ขยับ = ยกเลิก คูลดาวน์ 1 นาที'],
    pc:l=>[kbd('H')], mob:l=>[ges('tap',l.k)+' Home']},
  {g:'move', ic:'menu_map', en:['Warp Pillars','Pillars you have found light up. Jump between them: the village is free, pillar number n costs n × 1,000 Gold.'],
    th:['เสาวาร์ป','เสาที่เคยไปจะมีแสง วาปไปมาได้ หมู่บ้านฟรี เสาลำดับที่ n ใช้ n × 1,000 Gold'],
    pc:l=>[kbd('E'), l.k==='th'?'ที่เสา':'at a pillar'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ปุ่มที่เสา':' the pillar prompt')]},
  {g:'move', ic:'FLEE', en:['Run & Dash','Run to move faster (Auto Run in Settings keeps walking when stamina runs out). Dash rolls you out of big boss attacks.'],
    th:['วิ่งและแดช','วิ่งให้เร็วขึ้น (Auto Run ในตั้งค่า ช่วยให้เดินต่อเมื่อสตามิน่าหมด) แดชกลิ้งหลบท่าใหญ่ของบอส'],
    pc:l=>[kbd('Shift')+(l.k==='th'?' ค้าง':' hold'), '·', kbd('Q')], mob:l=>[ges('tap',l.k)+' Run', '·', ges('tap',l.k)+' Dash']},
  {g:'move', ic:'pet', en:['Mount','Ride the mount you picked in Pets › Mounts. It puts itself away when you start attacking.'],
    th:['ขี่สัตว์','ขี่สัตว์ที่เลือกไว้ใน สัตว์เลี้ยง › Mounts เริ่มโจมตีเมื่อไรจะเก็บสัตว์ให้เอง'],
    pc:l=>[kbd('M')], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ปุ่มขี่':' Mount')]},
  // screen
  {g:'screen', ic:'setting', dev:'mob', en:['Edit your buttons','Tap the round icon at the bottom-left, then drag and resize every play button (skills, potion, Auto, Dash, Run, target, warp). Phone and tablet are saved separately.'],
    th:['จัดปุ่มเอง','แตะไอคอนกลมซ้ายล่าง แล้วลากย้ายและปรับขนาดปุ่มเล่นได้ทุกปุ่ม (สกิล ยา ออโต้ แดช วิ่ง เป้า วาป) มือถือกับแท็บเล็ตจำแยกกัน'],
    mob:l=>[ges('tap',l.k), '→', ges('drag',l.k)]},
  {g:'screen', ic:'setting', dev:'pc', en:['Your own keys','Settings › Hotkeys lets you move any action to the key you like.'],
    th:['ตั้งปุ่มเอง','ตั้งค่า › Hotkeys เปลี่ยนปุ่มของแต่ละคำสั่งเป็นปุ่มที่ชอบได้'],
    pc:l=>[kbd('Z'), '→ Hotkeys']},
  {g:'screen', ic:'SpellCRIT', en:['Fast Mode','For weak phones and PCs: hides far monsters, cuts effects and map decorations. Bosses always stay visible.'],
    th:['โหมดลื่น (Fast Mode)','สำหรับเครื่องสเปกต่ำ ซ่อนมอนที่อยู่ไกล ลดเอฟเฟกต์และของตกแต่งแผนที่ บอสยังเห็นเสมอ'],
    pc:l=>[kbd('Z'), '→ Fast Mode'], mob:l=>[ges('tap',l.k)+(l.k==='th'?' ตั้งค่า → Fast Mode':' Settings → Fast Mode')]},
  {g:'screen', ic:'CritDmg', en:['Cleaner fights','Hide Others\' FX and Hide Others\' DMG show only yours. UI Size and DMG Size change button and number size.'],
    th:['จอไม่รก','Hide Others\' FX กับ Hide Others\' DMG ให้เห็นแค่ของเรา UI Size กับ DMG Size ปรับขนาดปุ่มและตัวเลข']},
  {g:'screen', ic:'menu_index', en:['Comfort view','The button next to Dash hides everything except your HP, Gold and power — nice for watching Auto.'],
    th:['โหมดสบายตา','ปุ่มข้างปุ่มแดช ซ่อนทุกอย่าง เหลือแค่เลือด Gold และพลังต่อสู้ ไว้นั่งดูออโต้'],
    pc:l=>[ges('click',l.k)], mob:l=>[ges('tap',l.k)]},
  {g:'screen', ic:'box_exp', en:['Photo mode','The camera button at the top-left hides the game UI. H hides the photo controls too.'],
    th:['โหมดถ่ายรูป','ปุ่มกล้องมุมซ้ายบนซ่อน UI ของเกม กด H เพื่อซ่อนแถบควบคุมด้วย'],
    pc:l=>[ges('rclick',l.k)+(l.k==='th'?' ลาก = หมุน':' drag = turn'), ges('drag',l.k)+(l.k==='th'?' = เลื่อน':' = move'), kbd('WASD')], mob:l=>[ges('drag',l.k)+(l.k==='th'?' = หมุน':' = turn'), ges('pinch',l.k)+(l.k==='th'?' = ซูม':' = zoom')]},
  {g:'screen', ic:'ATK', dev:'pc', en:['Who is here?','Tab shows every player in the server with class, level, power and Gold.'],
    th:['ใครอยู่ในเซิร์ฟบ้าง','กด Tab ดูผู้เล่นทุกคนในเซิร์ฟ พร้อมอาชีพ เลเวล พลัง และ Gold'],
    pc:l=>[kbd('Tab')]},
  {g:'screen', ic:'newbie_party', en:['Emotes','The small button next to the chat: wave, dance, clap or cheer.'],
    th:['ท่าทาง','ปุ่มเล็กข้างแชต: โบกมือ เต้น ปรบมือ ดีใจ'],
    pc:l=>[ges('click',l.k)], mob:l=>[ges('tap',l.k)]},
];
const ORDER = ['auto','grow','gear','move','screen'];
const GIC = {auto:'auto', grow:'arrow_stats', gear:'blacksmith', move:'menu_map', screen:'setting'};
const GC = {auto:'#ff8a4c', grow:'#ffd257', gear:'#c08cff', move:'#5cc8ff', screen:'#7ee07a'};

let DEV = null;
function getDev(){
  if (DEV) return DEV;
  try { DEV = localStorage.getItem('ht_dev'); } catch (e) {}
  if (DEV !== 'pc' && DEV !== 'mob') DEV = (window.matchMedia && matchMedia('(pointer: coarse)').matches) ? 'mob' : 'pc';
  return DEV;
}

function keyboard(L, lang){
  const cap = k => { const i = keyInfo(k); const wide = k.length > 1 ? ' w' + Math.min(k.length, 5) : '';
    return `<span class="kc${i ? ' on g-' + i.g : ''}${wide}" ${i ? `data-tip="${(i[lang] || i.en).replace(/"/g, '&quot;')}" tabindex="0"` : ''}><b>${k}</b>${i ? `<small>${lang === 'th' ? i.st : i.se}</small>` : ''}</span>`; };
  const legendItems = Object.entries(KEYS).filter(([k]) => k !== 'WASD');
  return `<div class="kb-wrap">
    <div class="kb" role="img" aria-label="${L.keysT}">${ROWS.map(r => `<div class="kr">${r.map(cap).join('')}</div>`).join('')}</div>
    <div class="kb-leg">${['c','m','w'].map(g => `<div class="kl g-${g}"><h4><i></i>${L.legend[g]}</h4><ul>${legendItems.filter(([, v]) => v.g === g).map(([k, v]) => `<li>${kbd(k)}<span>${v[lang] || v.en}</span></li>`).join('')}</ul></div>`).join('')}</div>
  </div>`;
}

function phone(L){
  return `<div class="ph-wrap"><div class="ph" aria-hidden="true">
      <span class="ph-z z-tl"></span><span class="ph-z z-tc"></span><span class="ph-z z-tr"></span><span class="ph-z z-bl"><i class="stick"></i></span><span class="ph-z z-br"><i class="pad a"></i><i class="pad s1"></i><i class="pad s2"></i><i class="pad s3"></i><i class="pad s4"></i></span>
      <img class="ph-hero" src="assets/hero.webp" alt="">
      <span class="ph-ground"></span>
      ${L.pins.map(([, pos], i) => `<b class="pin p-${pos}">${i + 1}</b>`).join('')}
    </div>
    <ol class="ph-list">${L.pins.map(([t]) => `<li>${t}</li>`).join('')}</ol></div>`;
}

function card(t, L, lang, dev){
  const w = t[lang] || t.en, l = {k: lang, or: L.or};
  const how = dev === 'pc' ? (t.pc && t.pc(l)) : (t.mob && t.mob(l));
  const tags = [t.pass ? `<i class="tg pass">${L.pass}</i>` : '', t.dev === 'pc' ? `<i class="tg">${L.pcOnly}</i>` : t.dev === 'mob' ? `<i class="tg">${L.mobOnly}</i>` : ''].join('');
  return `<article class="tk">
    <div class="tk-h">${img(t.ic)}<div><b>${w[0]}</b>${tags ? `<span class="tgs">${tags}</span>` : ''}</div></div>
    <p>${w[1]}</p>
    ${how ? `<div class="tk-how"><em>${L.how}</em>${how.map(x => `<span>${x}</span>`).join('')}</div>` : ''}
  </article>`;
}

function render(ctx){
  const {app, lang} = ctx, L = W[lang] || W.en, dev = getDev();
  const list = T.filter(t => !t.dev || t.dev === dev);
  app.innerHTML = `<div class="guide play" data-dev="${dev}">
    <div class="hub-head"><h1 class="stroke">${L.title}</h1><p>${L.sub}</p></div>
    <nav class="gtabs"><a href="#guide">${L.tabSys}</a><a href="#skills">${L.tabSkills}</a><a class="on" href="#play" aria-current="page">${L.tabPlay}</a></nav>
    <div class="devsw" role="radiogroup" aria-label="${L.showFor}"><span>${L.showFor}</span>
      <button type="button" role="radio" data-dev="pc" aria-checked="${dev === 'pc'}" class="${dev === 'pc' ? 'on' : ''}"><i class="dv-pc"></i>${L.pc}</button>
      <button type="button" role="radio" data-dev="mob" aria-checked="${dev === 'mob'}" class="${dev === 'mob' ? 'on' : ''}"><i class="dv-mob"></i>${L.mob}</button>
    </div>
    <section class="pmap">
      <h2 class="stroke">${dev === 'pc' ? L.keysT : L.phoneT}</h2><p class="muted">${dev === 'pc' ? L.keysP : L.phoneP}</p>
      ${dev === 'pc' ? keyboard(L, lang) : phone(L)}
    </section>
    <nav class="pjump">${ORDER.map(g => `<a href="#play-${g}" style="--c:${GC[g]}">${img(GIC[g], 'gi sm')}<span>${L.groups[g][0]}</span></a>`).join('')}</nav>
    ${ORDER.map(g => `<section class="pgrp" id="p-${g}" style="--c:${GC[g]}">
      <header><span class="pg-i">${img(GIC[g], 'gi lg')}</span><div><h2 class="stroke">${L.groups[g][0]}</h2><p>${L.groups[g][1]}</p></div></header>
      <div class="tks">${list.filter(t => t.g === g).map(t => card(t, L, lang, dev)).join('')}</div>
    </section>`).join('')}
  </div>`;
  app.querySelectorAll('.devsw button').forEach(b => b.addEventListener('click', () => {
    DEV = b.dataset.dev; try { localStorage.setItem('ht_dev', DEV); } catch (e) {}
    const y = scrollY; render(ctx); scrollTo(0, y);
  }));
}
function open(sec){
  const el = sec && document.getElementById('p-' + sec);
  if (el) el.scrollIntoView({block:'start', behavior:'smooth'}); else scrollTo(0, 0);
}
window.HT_PLAY = {render, open};
})();
