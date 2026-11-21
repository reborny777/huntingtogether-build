// Hunting Together Build Board — Hunter's Guide (beginner guide to the game's systems).
// Every number here comes from the game's own code (StatFormulas, ElementData, SkillData.Statuses,
// GearData refine table, GameConfig). Icons in assets/icons are captured from the game's UI atlas.
(function(){
'use strict';
const ALIAS = {CRIT:'STR', CastSpeed:'MATK', HpRegen:'VIT', Speed:'FLEE'};   // the game draws these with the same atlas cell
const IC = n => `assets/icons/${ALIAS[n] || n}.webp`;
// base stats are drawn as a colored circle with the stat name in white (colors from the game's dark character window)
const SC = {STR:'#e0453c', AGI:'#2a9f5e', VIT:'#ee7134', INT:'#3a82e4', DEX:'#8656e0', LUK:'#62ad28'};
const BASE = ['STR','AGI','VIT','INT','DEX','LUK'];
const dot = (k, cls = '') => `<span class="sdot ${cls}" style="--sc:${SC[k]}">${k}</span>`;
const img = (n, cls = 'gi') => SC[n] ? dot(n, cls.replace(/\bgi\b/, '').trim()) : `<img class="${cls}" src="${IC(n)}" alt="" loading="lazy" draggable="false">`;

// ---------- words (EN / TH) ----------
const W = {
en: {
  title: "Hunter's Guide",
  sub: 'Everything a new hunter needs: stats, elements, gear, cards, skills and the little tricks, with the icons you see in the game.',
  nav: {stats:'Stats', elements:'Elements', gear:'Gear', cards:'Cards', skills:'Skills', classes:'Classes', status:'Status', },
  inShort: 'In short',
  tryIt: 'Try it in the builder',
  formulas: 'Exact formulas (for theory-crafters)',
  // stats
  stLead: 'Every level gives you stat points. Spend them on 6 base stats — each one can go up to 99.',
  base: {
    STR:['Strength','Melee ATK for swords, knives, katanas, hammers and fists.'],
    AGI:['Agility','Attack speed (ASPD) and dodge (FLEE). Speeds attacks 4× more than DEX does.'],
    VIT:['Vitality','+1% Max HP per point and faster HP recovery.'],
    INT:['Intelligence','Spell power (MATK), +1% Max SP per point, SP recovery and magic defense.'],
    DEX:['Dexterity','Bow ATK and faster spell casting. A little attack speed.'],
    LUK:['Luck','+0.3% crit chance per point and a little ATK.'],
  },
  bestFor: 'Main stat for',
  costT: 'Higher stats cost more',
  costP: 'Raising a stat costs 2 points at first and +1 more every 10 points. That is why spreading thin is weak and focusing is strong.',
  costRange: 'Stat value',
  costPts: 'pts / +1',
  lvT: 'How far do your points go?',
  lvP: 'Slide your level. We split your points evenly into 2 stats.',
  lvLv: 'Level', lvTotal: 'stat points in total', lvTwo: 'Two stats can reach',
  derivT: 'What your stats turn into',
  deriv: {
    ATK:['ATK','Physical damage. STR (melee) or DEX (bow) + weapon.'],
    MATK:['MATK','Magic damage. Mostly INT + weapon.'],
    ASPD:['ASPD','How fast you attack. AGI, a bit of DEX, weapon type.'],
    CRIT:['Crit','Chance to crit. LUK, gear and cards. Knives crit twice as often.'],
    CritDmg:['Crit DMG','Extra damage when you crit. From gear and cards.'],
    MaxHP:['Max HP','Your life. Level + VIT.'],
    MaxSP:['Max SP','Mana for skills. Level + INT.'],
    DEF:['DEF','Cuts physical damage you take.'],
    MDEF:['MDEF','Cuts magic damage you take.'],
    FLEE:['FLEE','Dodge normal monster attacks. From level, AGI and gear. Max 80%, halved vs big bosses, lower when 3+ monsters hit you.'],
    SpRegen:['SP Regen','SP you get back over time. INT and Max SP.'],
    SpellCRIT:['Spell Crit','Crit chance for magic skills: LUK + CRIT from gear, max 100%.'],
  },
  defT: 'DEF calculator',
  defP: 'Damage cut = DEF ÷ (DEF + 200). Slide to see it.',
  defCut: 'less physical damage',
  f: [
    'Melee ATK = STR + (STR ÷ 10)² + DEX ÷ 5 + LUK ÷ 5 + weapon ATK',
    'Bow ATK = DEX + (DEX ÷ 10)² + STR ÷ 5 + LUK ÷ 5 + weapon ATK',
    'MATK = INT + (INT ÷ 7)² up to INT + (INT ÷ 5)² (spell damage rolls in this range)',
    'Every 10 points of your main stat adds a squared bonus — 50 STR gives +25, 100 STR gives +100.',
    'Max HP × (1 + VIT ÷ 100) · Max SP × (1 + INT ÷ 100)',
    'Crit chance = 1% + LUK × 0.3% (knives ×2)',
    'HP regen per tick = Max HP ÷ 200 + VIT ÷ 5 · SP regen = 1 + Max SP ÷ 100 + INT ÷ 6',
    'Cast speed grows with total DEX: 150 DEX = 90% faster casting. A haste potion pushes it to 100% (instant).',
    'Attack delay shrinks by (4 × AGI + DEX) ÷ 1000 of the weapon delay.',
  ],
  maxOne: 'Raising one stat from 1 to 99 costs <b>{n}</b> points — Lv.99 gives you <b>{t}</b> in total.',
  locked: 'Locked', rerolled: 'Rerolled', kept: 'Never changes',
  // elements
  elLead: 'Monsters and attacks can have one of 4 elements. Hit a monster with the element that beats it.',
  elShort: 'Wind beats Water, Water beats Fire, Fire beats Earth, Earth beats Wind.',
  el: {fire:'Fire', water:'Water', wind:'Wind', earth:'Earth'},
  strong: 'Strong hit', weak: 'Weak hit', even: 'Same / no element',
  badge: 'Look at the <b>element badge</b> above a monster\'s head. That is its element.',
  checkT: 'Matchup checker', checkYou: 'Your attack', checkMob: 'Monster',
  checkStrong: 'Super effective!', checkWeak: 'Not effective…', checkEven: 'Normal damage',
  getT: 'How do I get an element?',
  get1: '<b>Element skills</b> — some skills already carry an element (fire spells, ice spells, earth fangs…).',
  get2: '<b>Weapon Imbue scrolls</b> — coat your weapon: normal attacks and non-element skills become that element.',
  imb: ['30 minutes per scroll','Same element adds time, up to 3 hours','Another element replaces it','Kept when you die'],
  auraT: 'Element combos',
  auraP: 'Every element hit leaves an <b>aura</b> on the monster for 6 seconds. Hit it with a <b>different</b> element while the aura is on and you trigger a combo. Same element = no combo.',
  combos: {
    vaporize:['Vaporize','Fire + Water','That hit does ×1.25 damage (Leaders ×1.125).'],
    frozen:['Freeze','Water + Wind','Frozen for 2 s and takes +55% magic damage. Once every 6 s per monster. Leaders are immune.'],
    wildfire:['Wildfire','Fire + Wind','Sets every monster near the target on fire for 5 s (−1.5% HP per second).'],
    lava:['Lava','Fire + Earth','Burns the target for 5 s (−1.5% HP per second) and cuts its ATK/MATK by 25%.'],
  },
  noCombo: 'Earth + Water and Earth + Wind make no combo.',
  // gear
  gLead: 'You wear 8 pieces of gear: a weapon, 5 armor pieces and 2 rings.',
  gShort: 'Higher tier = stronger, but needs a higher level. Weapons and rings give ATK/MATK; armor gives DEF.',
  slots: {Helm:'Helm', Weapon:'Weapon', Cloak:'Cloak', Ring:'Ring 1', Mask:'Mask', Armor:'Armor', Boots:'Boots', Ring2:'Ring 2'},
  tierT: 'Tiers I – VI',
  tierP: 'The item\'s color is its tier. Red Tier VI gear comes from dungeons.',
  tierN: ['Grey','Green','Blue','Purple','Orange','Red'],
  needLv: 'Lv.',
  anaT: 'Reading an item',
  ana: [
    ['Main stat','ATK on weapons and attack rings, MATK on magic ones, DEF on armor.'],
    ['Random lines','Extra stats rolled when the item drops. More lines on higher tiers.'],
    ['Special line','One strong bonus from Tier II up: Crit, ATK%, ASPD, Pierce…'],
  ],
  linesT: 'Lines per tier', lines: 'random lines', line1: 'random line', special: '+ special',
  rules: [
    'Attack options only roll on weapons and rings, defense options only on armor.',
    'Magic gear never rolls ATK, physical gear never rolls MATK.',
  ],
  refT: 'Refine (+1 to +10)',
  refP: 'Refine at the Blacksmith. Each + adds part of the item\'s main stat on top — +10 doubles it.',
  refChance: 'success',
  refNote: 'Each try costs Gold and 1 Refine Stone. The price climbs with the + level and the item tier (armor costs 40% less). Glow from +5, aura from +7, big aura at +10.',
  refBonus: 'main stat', refStones: [['blacksmith','Protection Stone','Stops the −1 when a try fails (1 per failed try).'],['diamond','Lucky Stone','+10% chance for that try (Tier VI ×1.25).']],
  redT: 'Tier VI (red) gear', redP: 'Uses Mythic Refine Stones and Mythic Guard Stones, with its own lower chances:',
  rerTierT: 'Reroll price by tier',
  rerT: 'Reroll',
  rerP: 'Reroll the random lines at the <b>Blacksmith</b>. Lock up to 2 lines with Lock Charms (1 per locked line each reroll). The special line never changes.',
  // cards
  cLead: 'Monsters drop cards. Put them in card slots for extra stats and special effects.',
  cShort: '8 card slots open as you level. Boss cards are rare and each one can only be used once.',
  cSlotsT: 'Card slots',
  cRarT: 'Card rarity = monster type',
  cRar: {grey:'Normal monster', green:'Leader', blue:'Mini Boss', purple:'Mini Boss', gold:'Boss', red:'World Boss · Dungeon boss'},
  cRules: [
    'Normal and Leader cards give stats. You can stack the same one.',
    'Mini Boss cards boost one class skill. Boss cards each have their own trait.',
    'Mini Boss, Boss and red cards (with a <b>★</b> in the builder) can only be equipped once.',
    'World Bosses always drop red cards.',
  ],
  // skills
  sLead: 'Every level gives 1 skill point, up to 70 points at Lv.70. Each skill goes up to Lv.10.',
  sShort: '70 points = 7 skills at max. New skills unlock as you level up.',
  sFacts: [
    ['Skill bar','8 skill slots on your skill bar (keys 1–8).'],
    ['AoE size','Area skills grow from 55% size at Lv.1 to 100% at Lv.10.'],
    ['Passives','Passive skills work all the time — no slot needed.'],
  ],
  aspdT: 'These 7 skills cool down faster with more ASPD',
  xT: 'Extra Passive (Lv.70+)',
  xP: 'From Lv.70 you can borrow passive skills from <b>other classes</b> you have raised to Lv.99. A new slot opens at each of these levels:',
  xNo: 'These passives can\'t be borrowed:',
  // classes
  clLead: '10 classes, each with its own weapon and play style. Change class at the <b>Master Class</b> in the village center.',
  role: {
    Swordsman:'Tank with the most HP. Taunts monsters off friends.',
    Thief:'Fast crits that melt one target.',
    Archer:'Shoots from far away with some area damage.',
    Mage:'Clears groups of monsters with spells.',
    Cleric:'Heals, buffs and revives the party.',
    Merchant:'Slow, heavy melee hits — and earns more Gold.',
    Alchemist:'Throws flasks non-stop and sets up oil combos.',
    Samurai:'Katana duelist, as strong as Thief on one target.',
    Necromancer:'Summons shadow soldiers to fight for you.',
    MuayThai:'Kicks, knees and elbows in close combat.',
  },
  wpn: {sword:'Sword', knife:'Knife', bow:'Bow', rod:'Rod', staff:'Staff', hammer:'Hammer', flask:'Flask', katana:'Katana', skullstaff:'Skull staff', wraps:'Hand wraps'},
  phys: 'Physical', mag: 'Magic', spc: 'Special class',
  seeBuilds: 'See builds',
  // status
  stsLead: 'Skills can put effects on monsters. The icon shows above the monster\'s head.',
  stsShort: 'Big bosses ignore some effects — Stun, Freeze and Slow work best on normal monsters.',
  sts: {
    stun:['Stun','Can\'t move or attack. Leaders are immune.'],
    freeze:['Freeze','Can\'t move and takes +55% magic damage. Leaders are immune.'],
    burn:['Burn','Loses HP every second.'],
    poison:['Poison','Takes damage every second based on your ATK.'],
    slow:['Slow','Moves 30% slower. Big bosses are immune.'],
    blind:['Blind','Misses more and attacks 25% slower.'],
    armorbreak:['Armor Break','Takes +15% damage.'],
    weak:['Weaken','Deals 20% less damage and takes 20% more.'],
    mdefdown:['MDEF Down','Magic defense −20%.'],
    provoke:['Taunted','Attacks the one who taunted it. ATK −10%, takes +10% damage.'],
    comboburn:['Combo Fire','Fire from an element combo: −1.5% HP per second for 5 s.'],
    lava:['Lava','From the Lava combo: monster ATK/MATK −25%.'],
  },

  endT: 'Ready to hunt?',
  endP: 'Plan your build with real gear, cards and skills — then share it with every hunter.',
  share: 'Make a build', play: 'Play on Roblox', top: 'Back to top',
},
th: {
  title: 'คู่มือนักล่า',
  sub: 'ทุกอย่างที่นักล่ามือใหม่ต้องรู้ ทั้งค่าสเตตัส ธาตุ อุปกรณ์ การ์ด สกิล และลูกเล่นต่าง ๆ พร้อมไอคอนแบบเดียวกับในเกม',
  nav: {stats:'สเตตัส', elements:'ธาตุ', gear:'อุปกรณ์', cards:'การ์ด', skills:'สกิล', classes:'อาชีพ', status:'สถานะ', },
  inShort: 'สรุปสั้น ๆ',
  tryIt: 'ลองจัดในหน้าสร้างบิลด์',
  formulas: 'สูตรคำนวณจริง (สำหรับสายวิเคราะห์)',
  stLead: 'ทุกครั้งที่เลเวลอัปจะได้แต้มสเตตัส เอาไปอัปค่าหลัก 6 ตัว แต่ละตัวอัปได้สูงสุด 99',
  base: {
    STR:['พลัง','ATK สายประชิด ดาบ มีด คาตานะ ค้อน และหมัด'],
    AGI:['ความว่องไว','ความเร็วโจมตี (ASPD) และการหลบ (FLEE) เพิ่มความเร็วได้มากกว่า DEX 4 เท่า'],
    VIT:['ความอึด','HP สูงสุด +1% ต่อแต้ม และฟื้น HP เร็วขึ้น'],
    INT:['สติปัญญา','พลังเวท (MATK) SP สูงสุด +1% ต่อแต้ม ฟื้น SP และกันเวท'],
    DEX:['ความแม่นยำ','ATK สายธนู และร่ายเวทเร็วขึ้น เพิ่มความเร็วโจมตีนิดหน่อย'],
    LUK:['โชค','โอกาสคริ +0.3% ต่อแต้ม และ ATK นิดหน่อย'],
  },
  bestFor: 'ค่าหลักของ',
  costT: 'ยิ่งค่าสูง ยิ่งใช้แต้มเยอะ',
  costP: 'อัปค่าสเตตัสครั้งแรกใช้ 2 แต้ม และใช้เพิ่มอีก 1 ทุก ๆ 10 ค่า เพราะแบบนี้การอัปกระจายถึงอ่อน การอัปเน้นถึงแรง',
  costRange: 'ค่าสเตตัส',
  costPts: 'แต้ม / +1',
  lvT: 'แต้มของเราไปได้ไกลแค่ไหน',
  lvP: 'เลื่อนเลือกเลเวล แล้วดูว่าถ้าแบ่งแต้มลง 2 ค่าเท่า ๆ กัน จะอัปได้ถึงเท่าไร',
  lvLv: 'เลเวล', lvTotal: 'แต้มสเตตัสทั้งหมด', lvTwo: '2 ค่าอัปได้ถึง',
  derivT: 'ค่าสเตตัสกลายเป็นอะไรบ้าง',
  deriv: {
    ATK:['ATK','ดาเมจกายภาพ มาจาก STR (ประชิด) หรือ DEX (ธนู) + อาวุธ'],
    MATK:['MATK','ดาเมจเวท มาจาก INT เป็นหลัก + อาวุธ'],
    ASPD:['ASPD','ความเร็วโจมตี มาจาก AGI, DEX นิดหน่อย และชนิดอาวุธ'],
    CRIT:['คริ','โอกาสคริติคอล มาจาก LUK, อุปกรณ์ และการ์ด มีดคริบ่อยกว่า 2 เท่า'],
    CritDmg:['ดาเมจคริ','ดาเมจที่เพิ่มเมื่อคริ มาจากอุปกรณ์และการ์ด'],
    MaxHP:['HP สูงสุด','พลังชีวิต มาจากเลเวล + VIT'],
    MaxSP:['SP สูงสุด','มานาสำหรับใช้สกิล มาจากเลเวล + INT'],
    DEF:['DEF','ลดดาเมจกายภาพที่เราโดน'],
    MDEF:['MDEF','ลดดาเมจเวทที่เราโดน'],
    FLEE:['FLEE','หลบการโจมตีปกติของมอน มาจากเลเวล AGI และอุปกรณ์ สูงสุด 80% เจอบอสใหญ่เหลือครึ่ง โดนรุม 3 ตัวขึ้นไปจะหลบยากขึ้น'],
    SpRegen:['ฟื้น SP','SP ที่ฟื้นเองตามเวลา มาจาก INT และ SP สูงสุด'],
    SpellCRIT:['คริเวท','โอกาสคริของสกิลเวท: LUK + CRIT จากอุปกรณ์ สูงสุด 100%'],
  },
  defT: 'เครื่องคิด DEF',
  defP: 'ลดดาเมจ = DEF ÷ (DEF + 200) ลองเลื่อนดู',
  defCut: 'ดาเมจกายภาพลดลง',
  f: [
    'ATK ประชิด = STR + (STR ÷ 10)² + DEX ÷ 5 + LUK ÷ 5 + ATK อาวุธ',
    'ATK ธนู = DEX + (DEX ÷ 10)² + STR ÷ 5 + LUK ÷ 5 + ATK อาวุธ',
    'MATK = INT + (INT ÷ 7)² ถึง INT + (INT ÷ 5)² (ดาเมจเวทสุ่มในช่วงนี้)',
    'ค่าหลักทุก 10 แต้มได้โบนัสยกกำลังสอง — STR 50 ได้ +25, STR 100 ได้ +100',
    'HP สูงสุด × (1 + VIT ÷ 100) · SP สูงสุด × (1 + INT ÷ 100)',
    'โอกาสคริ = 1% + LUK × 0.3% (มีด ×2)',
    'ฟื้น HP ต่อรอบ = HP สูงสุด ÷ 200 + VIT ÷ 5 · ฟื้น SP = 1 + SP สูงสุด ÷ 100 + INT ÷ 6',
    'ร่ายเร็วขึ้นตาม DEX รวม: DEX 150 = ร่ายเร็วขึ้น 90% ดื่มยาเร่งร่ายเพิ่มจนถึง 100% (ร่ายทันที)',
    'ช่วงหน่วงการโจมตีลดลง (4 × AGI + DEX) ÷ 1000 ของค่าหน่วงอาวุธ',
  ],
  maxOne: 'อัปค่าเดียวจาก 1 ถึง 99 ใช้ <b>{n}</b> แต้ม — ทั้งเกมได้แต้มรวม <b>{t}</b> แต้มที่ Lv.99',
  locked: 'ล็อกไว้', rerolled: 'สุ่มใหม่', kept: 'ไม่เปลี่ยน',
  elLead: 'มอนและการโจมตีมีธาตุได้ 1 ใน 4 ธาตุ ตีมอนด้วยธาตุที่ชนะทางจะแรงขึ้น',
  elShort: 'ลมชนะน้ำ น้ำชนะไฟ ไฟชนะดิน ดินชนะลม',
  el: {fire:'ไฟ', water:'น้ำ', wind:'ลม', earth:'ดิน'},
  strong: 'ชนะทาง', weak: 'แพ้ทาง', even: 'ธาตุเดียวกัน / ไม่มีธาตุ',
  badge: 'ดู<b>ป้ายธาตุ</b>เหนือหัวมอน นั่นคือธาตุของมอนตัวนั้น',
  checkT: 'ลองเช็กธาตุ', checkYou: 'ธาตุที่เราตี', checkMob: 'ธาตุมอน',
  checkStrong: 'แรงสุด ๆ!', checkWeak: 'ไม่ค่อยเข้า…', checkEven: 'ดาเมจปกติ',
  getT: 'ได้ธาตุมาจากไหน',
  get1: '<b>สกิลธาตุ</b> — บางสกิลมีธาตุในตัวอยู่แล้ว (เวทไฟ เวทน้ำแข็ง เขี้ยวหิน…)',
  get2: '<b>ม้วนเคลือบอาวุธ (Weapon Imbue)</b> — เคลือบอาวุธ แล้วการตีปกติและสกิลที่ไม่มีธาตุจะเป็นธาตุนั้น',
  imb: ['1 ม้วนอยู่ได้ 30 นาที','ธาตุเดิมใช้ซ้ำ = ต่อเวลา สูงสุด 3 ชั่วโมง','ใช้ธาตุอื่น = แทนที่ของเดิม','ตายแล้วไม่หาย'],
  auraT: 'คอมโบธาตุ',
  auraP: 'ตีธาตุใส่มอนแล้วจะติด<b>ออร่า</b>ธาตุนั้นไว้ 6 วินาที ถ้าตีด้วย<b>ธาตุอื่น</b>ตอนออร่ายังอยู่จะเกิดคอมโบ ธาตุเดียวกัน = ไม่เกิดคอมโบ',
  combos: {
    vaporize:['ระเหย','ไฟ + น้ำ','ลูกนั้นแรงขึ้น ×1.25 (Leader ×1.125)'],
    frozen:['แช่แข็ง','น้ำ + ลม','ขยับไม่ได้ 2 วินาที และรับดาเมจเวท +55% เกิดได้ทุก 6 วินาทีต่อมอน 1 ตัว Leader ไม่ติด'],
    wildfire:['ไฟลาม','ไฟ + ลม','ไฟลามใส่มอนทุกตัวรอบเป้า 5 วินาที (HP −1.5% ต่อวินาที)'],
    lava:['ลาวา','ไฟ + ดิน','เผาเป้า 5 วินาที (HP −1.5% ต่อวินาที) และ ATK/MATK ของมอนลดลง 25%'],
  },
  noCombo: 'ดิน + น้ำ และ ดิน + ลม ไม่เกิดคอมโบ',
  gLead: 'ใส่อุปกรณ์ได้ 8 ชิ้น: อาวุธ 1 ชุดเกราะ 5 และแหวน 2',
  gShort: 'Tier ยิ่งสูงยิ่งแรง แต่ต้องใช้เลเวลสูงขึ้น อาวุธกับแหวนให้ ATK/MATK ส่วนเกราะให้ DEF',
  slots: {Helm:'หมวก', Weapon:'อาวุธ', Cloak:'ผ้าคลุม', Ring:'แหวน 1', Mask:'หน้ากาก', Armor:'เสื้อเกราะ', Boots:'รองเท้า', Ring2:'แหวน 2'},
  tierT: 'Tier I – VI',
  tierP: 'สีของไอเทมบอก Tier ไอเทมสีแดง Tier VI ได้จากดันเจี้ยน',
  tierN: ['เทา','เขียว','ฟ้า','ม่วง','ส้ม','แดง'],
  needLv: 'Lv.',
  anaT: 'อ่านค่าไอเทมยังไง',
  ana: [
    ['ค่าหลัก','ATK ในอาวุธและแหวนโจมตี, MATK ในของสายเวท, DEF ในเกราะ'],
    ['ออปชันสุ่ม','ค่าพิเศษที่สุ่มตอนไอเทมดรอป Tier สูงได้หลายบรรทัดขึ้น'],
    ['ออปชันพิเศษ','โบนัสแรง 1 อย่าง ตั้งแต่ Tier II: คริ, ATK%, ASPD, เจาะเกราะ…'],
  ],
  linesT: 'จำนวนออปชันต่อ Tier', lines: 'ออปชันสุ่ม', line1: 'ออปชันสุ่ม', special: '+ พิเศษ',
  rules: [
    'ออปชันโจมตีออกเฉพาะอาวุธกับแหวน ออปชันป้องกันออกเฉพาะเกราะ',
    'ของสายเวทไม่มี ATK ของสายกายภาพไม่มี MATK',
  ],
  refT: 'ตีบวก (+1 ถึง +10)',
  refP: 'ตีบวกที่ช่างตีเหล็ก บวกแต่ละขั้นเพิ่มค่าหลักของไอเทมเป็น % — +10 = ค่าหลัก ×2',
  refChance: 'โอกาสสำเร็จ',
  refNote: 'ตีแต่ละครั้งใช้ Gold กับหินตีบวก 1 ก้อน ราคาแพงขึ้นตามขั้นบวกและ Tier (เกราะถูกกว่า 40%) เรืองแสงตั้งแต่ +5 มีออร่าตั้งแต่ +7 ออร่าใหญ่ที่ +10',
  refBonus: 'ค่าหลัก', refStones: [['blacksmith','หินกันลด (Protection Stone)','กันไม่ให้ลด 1 ขั้นตอนตีพลาด (ใช้ 1 ก้อนต่อครั้งที่พลาด)'],['diamond','หินนำโชค (Lucky Stone)','โอกาสสำเร็จ +10% ในครั้งนั้น (Tier VI ×1.25)']],
  redT: 'ของ Tier VI (สีแดง)', redP: 'ใช้หินตีบวก Mythic และหินกัน Mythic และมีโอกาสสำเร็จของตัวเองที่ต่ำกว่า:',
  rerTierT: 'ราคาสุ่มออปชันตาม Tier',
  rerT: 'สุ่มออปชันใหม่',
  rerP: 'สุ่มออปชันใหม่ได้ที่<b>ช่างตีเหล็ก</b> ล็อกได้สูงสุด 2 บรรทัดด้วย Lock Charm (1 ชิ้นต่อบรรทัดต่อครั้ง) ออปชันพิเศษไม่เปลี่ยน',
  cLead: 'มอนดรอปการ์ด เอาไปใส่ช่องการ์ดเพื่อเพิ่มค่าสเตตัสและเอฟเฟกต์พิเศษ',
  cShort: 'ช่องการ์ด 8 ช่องเปิดตามเลเวล การ์ดบอสหายากและใส่ใบเดียวกันได้แค่ 1 ใบ',
  cSlotsT: 'ช่องการ์ด',
  cRarT: 'สีการ์ด = ประเภทมอน',
  cRar: {grey:'มอนทั่วไป', green:'Leader', blue:'มินิบอส', purple:'มินิบอส', gold:'บอส', red:'บอสโลก · บอสดันเจี้ยน'},
  cRules: [
    'การ์ดมอนทั่วไปและ Leader ให้ค่าสเตตัส ใส่ใบซ้ำได้',
    'การ์ดมินิบอสเพิ่มพลังสกิลอาชีพ 1 สกิล การ์ดบอสแต่ละใบมีความสามารถเฉพาะตัว',
    'การ์ดมินิบอส บอส และการ์ดแดง (มี <b>★</b> ในหน้าสร้างบิลด์) ใส่ได้ใบละ 1 ใบเท่านั้น',
    'บอสโลกดรอปการ์ดสีแดงเสมอ',
  ],
  sLead: 'ทุกเลเวลได้ 1 แต้มสกิล สูงสุด 70 แต้มที่ Lv.70 แต่ละสกิลอัปได้ถึง Lv.10',
  sShort: '70 แต้ม = อัปสกิลเต็มได้ 7 สกิล สกิลใหม่ปลดล็อกตามเลเวล',
  sFacts: [
    ['แถบสกิล','ใส่สกิลในแถบได้ 8 ช่อง (ปุ่ม 1–8)'],
    ['ขนาดวงสกิล','สกิลวงกว้าง 55% ที่ Lv.1 และเต็ม 100% ที่ Lv.10'],
    ['พาสซีฟ','สกิลพาสซีฟทำงานตลอด ไม่ต้องใส่ช่อง'],
  ],
  aspdT: '7 สกิลนี้คูลดาวน์เร็วขึ้นตาม ASPD',
  xT: 'Extra Passive (Lv.70 ขึ้นไป)',
  xP: 'ตั้งแต่ Lv.70 ยืมสกิลพาสซีฟของ<b>อาชีพอื่น</b>ที่เราเคยเล่นจนถึง Lv.99 มาใช้ได้ ช่องใหม่เปิดที่เลเวลเหล่านี้:',
  xNo: 'พาสซีฟเหล่านี้ยืมไม่ได้:',
  clLead: '10 อาชีพ แต่ละอาชีพมีอาวุธและสไตล์ของตัวเอง เปลี่ยนอาชีพได้ที่ <b>Master Class</b> กลางหมู่บ้าน',
  role: {
    Swordsman:'แทงก์ HP เยอะสุด ยั่วมอนให้มาตีตัวเองแทนเพื่อน',
    Thief:'คริไวรัว ๆ ละลายเป้าเดี่ยว',
    Archer:'ยิงจากระยะไกล มีดาเมจวงกว้างบ้าง',
    Mage:'กวาดมอนเป็นกลุ่มด้วยเวท',
    Cleric:'ฮีล บัฟ และชุบชีวิตเพื่อนในปาร์ตี้',
    Merchant:'ตีประชิดช้าแต่หนัก และได้ Gold มากกว่า',
    Alchemist:'ปาขวดรัว ๆ และวางคอมโบน้ำมัน',
    Samurai:'นักดาบคาตานะ แรงเท่า Thief ตอนตีเป้าเดี่ยว',
    Necromancer:'อัญเชิญทหารเงามาสู้แทน',
    MuayThai:'เตะ เข่า ศอก สายประชิด',
  },
  wpn: {sword:'ดาบ', knife:'มีด', bow:'ธนู', rod:'คทา', staff:'ไม้เท้า', hammer:'ค้อน', flask:'ขวดยา', katana:'คาตานะ', skullstaff:'ไม้เท้ากะโหลก', wraps:'ผ้าพันมือ'},
  phys: 'กายภาพ', mag: 'เวท', spc: 'อาชีพพิเศษ',
  seeBuilds: 'ดูบิลด์',
  stsLead: 'สกิลทำให้มอนติดสถานะผิดปกติได้ ไอคอนจะขึ้นเหนือหัวมอน',
  stsShort: 'บอสใหญ่ไม่ติดบางสถานะ สตัน แช่แข็ง และสโลว์ ใช้ได้ดีสุดกับมอนทั่วไป',
  sts: {
    stun:['สตัน','ขยับและโจมตีไม่ได้ Leader ไม่ติด'],
    freeze:['แช่แข็ง','ขยับไม่ได้ และรับดาเมจเวท +55% Leader ไม่ติด'],
    burn:['ไฟไหม้','เสีย HP ทุกวินาที'],
    poison:['พิษ','โดนดาเมจทุกวินาทีตาม ATK ของผู้ใช้'],
    slow:['ช้า','เดินช้าลง 30% บอสใหญ่ไม่ติด'],
    blind:['ตาบอด','ตีพลาดบ่อยขึ้น และตีช้าลง 25%'],
    armorbreak:['เกราะแตก','รับดาเมจ +15%'],
    weak:['อ่อนแรง','ทำดาเมจลดลง 20% และรับดาเมจเพิ่ม 20%'],
    mdefdown:['MDEF ลด','ป้องกันเวท −20%'],
    provoke:['โดนยั่ว','หันมาตีคนที่ยั่ว ATK −10% รับดาเมจ +10%'],
    comboburn:['ไฟคอมโบ','ไฟจากคอมโบธาตุ: HP −1.5% ต่อวินาที 5 วินาที'],
    lava:['ลาวา','จากคอมโบลาวา: ATK/MATK ของมอน −25%'],
  },
  endT: 'พร้อมออกล่าแล้วหรือยัง',
  endP: 'วางแผนบิลด์ด้วยอุปกรณ์ การ์ด และสกิลจริงจากเกม แล้วแชร์ให้นักล่าทุกคนดู',
  share: 'สร้างบิลด์', play: 'เล่นบน Roblox', top: 'กลับขึ้นบน',
}};

// ---------- hub words ----------
Object.assign(W.en, {
  hubSub: 'Tap a bubble around the hunter to learn that part of the game.',
  more: 'All the details', back: 'Back to the hunter', next: 'Next', prev: 'Back',
  hint: {stats:'Where your points go', gear:'Weapon, armor, rings', refine:'Make gear stronger', cards:'Monster cards', elements:'Who beats who', skills:'Points & passives', classes:'10 classes', status:'Stun, burn, poison…', },
  keys: {
    stats: [['menu_stat','{pts} points by Lv.99','Every level gives stat points. Each stat goes up to 99.'],['STR','Cost rises every 10','+1 costs 2 points at first, then 1 more every 10 points — maxing one stat takes {one}.'],['ATK','Stats become power','STR / DEX → ATK · INT → MATK · VIT → HP · AGI → speed · LUK → crit.']],
    gear: [['menu_equip','8 slots','1 weapon, 5 armor pieces and 2 rings.'],['diamond','Color = tier','Grey → green → blue → purple → orange → red. Higher tier is stronger but needs a higher level.'],['swords','Read the lines','A main stat, random lines, and one special line from Tier II up.']],
    refine: [['blacksmith','+10 = main stat ×2','+1 adds 8% of the main stat, +5 adds 42%, +10 adds 100%.'],['weak','Fail from +5 = −1','+1 to +4 always work. From +5 a fail drops the item 1 level, unless you use a Protection Stone.'],['swords','Reroll lines','Reroll random lines at the Blacksmith. Lock up to 2. The special line never changes.']],
    cards: [['card','8 card slots','Slots open at Lv.{lv}.'],['menu_index','Color = monster','Grey normal · green Leader · blue/purple Mini Boss · gold Boss · red World Boss.'],['swords','Boss cards once','Mini Boss, Boss and red cards can only be equipped once. Normal ones stack.']],
    elements: [['wind','4 elements in a loop','Wind → Water → Fire → Earth → Wind. Each one beats the next.'],['fire','125% or 75%','Hit an element you beat for 125%. Hit one that beats you for only 75%.'],['comboburn','Mix for combos','Two different elements on one monster within 6 s set off a combo.']],
    skills: [['arrow_skills','1 point per level','You get 1 skill point each level, up to 70 points at Lv.70.'],['INT','7 skills at max','Each skill goes to Lv.10, so 70 points max out 7 skills.'],['menu_job','Extra Passive','From Lv.70 borrow passives from other classes you raised to Lv.99.']],
    classes: [['menu_job','10 classes','Each class has its own weapon and play style.'],['menu_map','Master Class','Change class at the Master Class in the village center.']],
    status: [['stun','Shown overhead','The effect icon pops up above the monster\'s head.'],['provoke','Bosses resist','Leaders ignore Stun and Freeze. Big bosses ignore Slow.'],['comboburn','Combos add more','Element combos add Freeze, Combo Fire and Lava.']],
  },
});
Object.assign(W.th, {
  hubSub: 'กดบับเบิลรอบตัวนักล่า เพื่อดูว่าระบบนั้นในเกมทำงานยังไง',
  more: 'ดูรายละเอียดทั้งหมด', back: 'กลับไปที่ตัวละคร', next: 'ถัดไป', prev: 'ก่อนหน้า',
  hint: {stats:'แต้มลงตรงไหนดี', gear:'อาวุธ ชุด แหวน', refine:'ทำของให้แรงขึ้น', cards:'การ์ดมอนสเตอร์', elements:'ธาตุไหนชนะธาตุไหน', skills:'แต้มสกิลและพาสซีฟ', classes:'10 อาชีพ', status:'สตัน ไฟไหม้ พิษ…', },
  keys: {
    stats: [['menu_stat','{pts} แต้มที่ Lv.99','ทุกเลเวลได้แต้มสเตตัส แต่ละค่าอัปได้สูงสุด 99'],['STR','ยิ่งสูงยิ่งแพง','+1 ใช้ 2 แต้มตอนแรก แล้วเพิ่มอีก 1 ทุก 10 ค่า — อัปค่าเดียวจนเต็มใช้ {one} แต้ม'],['ATK','สเตตัสกลายเป็นพลัง','STR / DEX → ATK · INT → MATK · VIT → HP · AGI → ความเร็ว · LUK → คริ']],
    gear: [['menu_equip','8 ช่อง','อาวุธ 1 เกราะ 5 และแหวน 2'],['diamond','สี = Tier','เทา → เขียว → ฟ้า → ม่วง → ส้ม → แดง Tier สูงยิ่งแรง แต่ต้องเลเวลสูงขึ้น'],['swords','อ่านออปชัน','ค่าหลัก ออปชันสุ่ม และออปชันพิเศษ 1 บรรทัดตั้งแต่ Tier II']],
    refine: [['blacksmith','+10 = ค่าหลัก ×2','+1 เพิ่ม 8% ของค่าหลัก, +5 เพิ่ม 42%, +10 เพิ่ม 100%'],['weak','พลาดตั้งแต่ +5 = −1','+1 ถึง +4 สำเร็จเสมอ ตั้งแต่ +5 ถ้าพลาดจะลด 1 ขั้น ยกเว้นใช้หินกันลด'],['swords','สุ่มออปชันใหม่','สุ่มออปชันใหม่ที่ช่างตีเหล็ก ล็อกได้ 2 บรรทัด ออปชันพิเศษไม่เปลี่ยน']],
    cards: [['card','ช่องการ์ด 8 ช่อง','เปิดที่ Lv.{lv}'],['menu_index','สี = ประเภทมอน','เทา มอนทั่วไป · เขียว Leader · ฟ้า/ม่วง มินิบอส · ทอง บอส · แดง บอสโลก'],['swords','การ์ดบอสใส่ใบเดียว','การ์ดมินิบอส บอส และการ์ดแดงใส่ได้ใบละ 1 ใบ การ์ดทั่วไปใส่ซ้ำได้']],
    elements: [['wind','4 ธาตุวนเป็นวง','ลม → น้ำ → ไฟ → ดิน → ลม แต่ละธาตุชนะธาตุถัดไป'],['fire','125% หรือ 75%','ตีธาตุที่เราชนะได้ 125% ตีธาตุที่ชนะเราได้แค่ 75%'],['comboburn','ผสมให้เกิดคอมโบ','ตี 2 ธาตุต่างกันใส่มอนตัวเดียวภายใน 6 วินาที จะเกิดคอมโบ']],
    skills: [['arrow_skills','1 แต้มต่อเลเวล','ได้แต้มสกิลเลเวลละ 1 แต้ม รวม 70 แต้มที่ Lv.70'],['INT','อัปเต็มได้ 7 สกิล','แต่ละสกิลสูงสุด Lv.10 แต้ม 70 แต้มจึงอัปเต็มได้ 7 สกิล'],['menu_job','Extra Passive','ตั้งแต่ Lv.70 ยืมพาสซีฟของอาชีพอื่นที่เล่นถึง Lv.99 มาใช้ได้']],
    classes: [['menu_job','10 อาชีพ','แต่ละอาชีพมีอาวุธและสไตล์ของตัวเอง'],['menu_map','Master Class','เปลี่ยนอาชีพได้ที่ Master Class กลางหมู่บ้าน']],
    status: [['stun','ขึ้นเหนือหัว','ไอคอนสถานะจะขึ้นเหนือหัวมอน'],['provoke','บอสต้านบางอย่าง','Leader ไม่ติดสตันกับแช่แข็ง บอสใหญ่ไม่ติดช้า'],['comboburn','คอมโบเพิ่มสถานะ','คอมโบธาตุทำให้ติดแช่แข็ง ไฟคอมโบ และลาวา']],
  },
});
W.en.nav.refine = 'Refine'; W.th.nav.refine = 'ตีบวก';

// topics: id, icon, color, side, where the line points on the hunter (0–1 of the picture)
const TOPICS = [
  {id:'refine',   ic:'blacksmith',  c:'#ff8a4c', side:'l', pt:[0.06,0.20]},
  {id:'gear',     ic:'menu_equip',  c:'#9fc2ff', side:'l', pt:[0.07,0.56]},
  {id:'cards',    ic:'card',        c:'#c08cff', side:'l', pt:[0.30,0.64]},
  {id:'status',   ic:'stun',        c:'#ff7a9a', side:'l', pt:[0.30,0.88]},
  {id:'stats',    ic:'menu_stat',   c:'#ffd257', side:'r', pt:[0.66,0.20]},
  {id:'skills',   ic:'arrow_skills',c:'#5cc8ff', side:'r', pt:[0.86,0.50]},
  {id:'elements', ic:'fire',        c:'#7ee07a', side:'r', pt:[0.64,0.62]},
  {id:'classes',  ic:'menu_job',    c:'#ffad5c', side:'r', pt:[0.62,0.88]},
];
const ORDER = TOPICS.map(t => t.id);
const EL = ['wind','water','fire','earth'];             // cycle order: each beats the next
const BEATS = {wind:'water', water:'fire', fire:'earth', earth:'wind'};
const COMBO = {fire:{water:'vaporize', wind:'wildfire', earth:'lava'}, water:{fire:'vaporize', wind:'frozen'}, wind:{fire:'wildfire', water:'frozen'}, earth:{fire:'lava'}};
const ASPD_SKILLS = ['bash','iaigiri','cartstrike','mammonite','twinfang','doublestrafe','nekoflask'];
// stat priorities per class (RONB's class sheet; the 4 newer classes from their stat weights)
const PRI = {Swordsman:['STR','VIT'], Thief:['AGI','LUK','STR'], Archer:['DEX','AGI','LUK'], Mage:['INT','DEX'], Cleric:['INT','VIT','DEX'], Merchant:['STR','LUK'],
  Alchemist:['INT','AGI'], Samurai:['STR','AGI','LUK'], Necromancer:['INT','DEX'], MuayThai:['STR','VIT','AGI']};
const STATIC = {chk:{you:'water', mob:'fire'}, lv:50, def:100};
let CTX = null, BUILT = null, onResize = null;

function build(ctx){
  const {G, lang, H} = ctx, L = W[lang] || W.en, esc = H.esc;
  const cls = G.classes;
  const skill = Object.fromEntries(cls.flatMap(c => c.skills.map(s => [s.id, Object.assign({cls:c.name}, s)])));
  const tip = (ic, html) => `<div class="gtip">${img(ic)}<p>${html}</p></div>`;
  const nf = n => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US');
  const bestFor = {};
  cls.forEach(c => (PRI[c.id] || []).forEach(k => (bestFor[k] = bestFor[k] || []).push(c)));
  const T = {};

  // ---------- stats ----------
  const costBands = []; for (let v = 1; v < G.maxStat; v += 10) costBands.push([v, Math.min(v + 9, G.maxStat), G.upCost[v - 1]]);
  const maxCost = Math.max(...costBands.map(b => b[2]));
  T.stats = {lead:L.stLead,
    vis:`<div class="gpop" id="gPop">
      <div class="gpop-ring">${BASE.map((k, i) => `<button type="button" class="gpop-b${i === 0 ? ' on' : ''}" data-k="${k}" style="--sc:${SC[k]};--d:${i * 0.06}s" aria-label="${k} — ${L.base[k][0]}">${dot(k, 'xl')}<i>${L.base[k][0]}</i></button>`).join('')}</div>
      ${BASE.map((k, i) => `<div class="gpop-card" data-k="${k}" style="--sc:${SC[k]};--x:${(i + 0.5) / BASE.length * 100}%"${i ? ' hidden' : ''}>
        <div class="gpop-h">${dot(k, 'md')}<div><b class="stroke">${k}</b><i>${L.base[k][0]}</i></div></div>
        <p>${L.base[k][1]}</p>
        <div class="gbest"><span>${L.bestFor}</span>${(bestFor[k] || []).map(c => `<span class="gbp"><img class="cemb" src="assets/cls/${c.id}.webp" alt="" loading="lazy"><em>${esc(c.name)}</em></span>`).join('')}</div></div>`).join('')}
    </div>`,
    more:`<div class="gtwo">
      <div class="gbox"><h3>${L.costT}</h3><p class="muted sm">${L.costP}</p>
        <div class="gcost"><div class="gc gch"><span>${L.costRange}</span><span></span><b>${L.costPts}</b></div>${costBands.map(([a, b, c]) => `<div class="gc"><span class="gcn">${a}–${b}</span><span class="gcb"><i style="width:${Math.round(c / maxCost * 100)}%"></i></span><b>${c}</b></div>`).join('')}</div></div>
      <div class="gbox"><h3>${L.lvT}</h3><p class="muted sm">${L.lvP}</p>
        <label class="gslide"><span>${L.lvLv} <b id="gLv">${STATIC.lv}</b></span><input type="range" min="1" max="${G.maxLevel}" value="${STATIC.lv}" data-g="lv"></label>
        <div class="gout"><div><b id="gPts">0</b><span>${L.lvTotal}</span></div><div><b id="gTwo">0</b><span>${L.lvTwo}</span></div></div>
        ${tip('STR', L.maxOne.replace('{n}', nf(H.costTo(G.maxStat))).replace('{t}', nf(H.totalPts(G.maxLevel))))}</div>
    </div>
    <h3 class="gsub">${L.derivT}</h3>
    <div class="gderiv">${Object.entries(L.deriv).map(([k, [n, d]]) => `<div class="gd">${img(k,'gi')}<div><b>${n}</b><p>${d}</p></div></div>`).join('')}</div>
    <div class="gtwo">
      <div class="gbox"><h3>${L.defT}</h3><p class="muted sm">${L.defP}</p>
        <label class="gslide"><span>${img('DEF','gi xs')} DEF <b id="gDef">${STATIC.def}</b></span><input type="range" min="0" max="600" step="10" value="${STATIC.def}" data-g="def"></label>
        <div class="gmeter"><i id="gDefBar"></i><b id="gDefPct">0%</b></div><p class="muted sm">${L.defCut}</p></div>
      <div class="gbox">
        <details class="gform" open><summary>${L.formulas}</summary><ul>${L.f.map(x => `<li>${x}</li>`).join('')}</ul></details></div>
    </div>`};

  // ---------- elements ----------
  const pos = {wind:[50,13], water:[87,50], fire:[50,87], earth:[13,50]};
  const cyc = `<div class="gcyc" aria-label="${esc(L.elShort)}">
    <svg viewBox="0 0 100 100" aria-hidden="true"><defs><marker id="gArr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#ffd257"/></marker></defs>
      ${EL.map((e, i) => { const a = (i * 90 - 90 + 27) * Math.PI / 180, b = (i * 90 - 27) * Math.PI / 180, r = 37;
        return `<path d="M${50 + r * Math.cos(a)} ${50 + r * Math.sin(a)} A${r} ${r} 0 0 1 ${50 + r * Math.cos(b)} ${50 + r * Math.sin(b)}" fill="none" stroke="#ffd257" stroke-width="2.2" stroke-linecap="round" marker-end="url(#gArr)"/>`; }).join('')}
    </svg>
    ${EL.map(e => `<div class="gce" style="left:${pos[e][0]}%;top:${pos[e][1]}%">${img(e,'gi lg')}<b class="stroke">${L.el[e]}</b></div>`).join('')}
    <div class="gcc"><b class="stroke">125%</b><span>${L.strong}</span></div></div>`;
  const combo = (k, a, b, res) => { const [n, pair, d] = L.combos[k]; return `<article class="gcombo"><div class="gcm">${img(a,'gi md')}<span>+</span>${img(b,'gi md')}<span>=</span>${res}</div><b class="stroke">${n}</b><i>${pair}</i><p>${d}</p></article>`; };
  T.elements = {lead:L.elLead,
    vis:`<div class="gtwo">
      <div class="gbox">${cyc}
        <div class="gmult"><span class="up">125% <i>${L.strong}</i></span><span class="dn">75% <i>${L.weak}</i></span><span>100% <i>${L.even}</i></span></div></div>
      <div class="gbox"><h3>${L.checkT}</h3>
        <p class="muted sm">${L.checkYou}</p><div class="gpick" data-gp="you">${EL.map(e => `<button type="button" data-el="${e}" class="${e === STATIC.chk.you ? 'on' : ''}">${img(e,'gi md')}<span>${L.el[e]}</span></button>`).join('')}</div>
        <p class="muted sm">${L.checkMob}</p><div class="gpick" data-gp="mob">${EL.map(e => `<button type="button" data-el="${e}" class="${e === STATIC.chk.mob ? 'on' : ''}">${img(e,'gi md')}<span>${L.el[e]}</span></button>`).join('')}</div>
        <div class="gres" id="gRes"></div></div>
    </div>`,
    more:`${tip('HIT', L.badge)}
    <div class="gcombos">
      ${combo('vaporize','fire','water','<b class="gx stroke">×1.25</b>')}
      ${combo('frozen','water','wind',img('freeze','gi md'))}
      ${combo('wildfire','fire','wind',img('comboburn','gi md'))}
      ${combo('lava','fire','earth',img('lava','gi md'))}
    </div>
    <div class="gtwo">
      <div class="gbox"><h3>${L.getT}</h3><p>${L.get1}</p><p>${L.get2}</p>
        <div class="gimb">${EL.map(e => img(e,'gi md')).join('')}</div>
        <ul class="gchk">${L.imb.map(x => `<li>${x}</li>`).join('')}</ul></div>
      <div class="gbox"><h3>${L.auraT}</h3><p>${L.auraP}</p>
        <div class="gaura">${img('fire','gi lg')}<span class="ring">6s</span></div>
        <div class="gtable scroll"><table><thead><tr><th></th>${EL.map(e => `<th>${img(e,'gi sm')}</th>`).join('')}</tr></thead><tbody>
          ${EL.map(a => `<tr><th>${img(a,'gi sm')}</th>${EL.map(b => { const k = a === b ? null : (COMBO[a] || {})[b]; return `<td class="${k ? 'y' : 'n'}">${k ? L.combos[k][0] : '—'}</td>`; }).join('')}</tr>`).join('')}
        </tbody></table></div>
        <p class="muted sm">${L.noCombo}</p></div>
    </div>
`};

  // ---------- gear + refine ----------
  const byTierSlot = (slot, tier, job) => G.items.find(i => i.slot === slot && i.tier === tier && (slot !== 'Weapon' || !job || (i.jobs || []).includes(job)));
  const gslot = (s, t) => { const it = byTierSlot(s === 'Ring2' ? 'Ring' : s, t, 'Swordsman'); return `<div class="gslot">${it ? H.itemTile(it) : ''}<span>${L.slots[s]}</span></div>`; };
  const ex = byTierSlot('Weapon', 5, 'Swordsman') || G.items[0];
  const sp = Object.keys(G.ranges.special).find(k => k === 'CRIT');
  const rngTxt = r => r ? (r[0] === r[1] ? `${r[0]}` : `${r[0]}–${r[1]}`) : '';
  const exLines = (ex.pool || []).slice(0, ex.lines).map(k => `<li>${esc(H.labelName(k))} +${rngTxt(G.ranges.stat[ex.tier - 1])}</li>`).join('');
  const linesBy = [1,2,3,4,5,6].map(t => { const it = byTierSlot('Weapon', t, 'Swordsman'); return [t, it ? it.lines : 0, t > 1]; });
  const REF = [100,100,100,100,60,40,40,20,20,10];
  T.gear = {lead:L.gLead,
    vis:`<div class="gtwo">
      <div class="gbox gdoll">
        <div class="gcol">${['Helm','Weapon','Cloak','Ring'].map(s => gslot(s, 4)).join('')}</div>
        <div class="gmid"><img src="assets/hero.webp" alt="" loading="lazy"></div>
        <div class="gcol">${['Mask','Armor','Boots','Ring2'].map(s => gslot(s, 4)).join('')}</div>
      </div>
      <div class="gbox"><h3>${L.tierT}</h3><p class="muted sm">${L.tierP}</p>
        <div class="gtiers">${G.tiers.map((t, i) => { const it = byTierSlot('Weapon', i + 1, 'Swordsman'); return `<div class="gtier" style="--tc:${t.color}">${it ? H.itemTile(it) : ''}<b>${t.roman}</b><i>${L.tierN[i]}</i><span>${L.needLv}${t.req}</span></div>`; }).join('')}</div></div>
    </div>`,
    more:`<div class="gtwo">
      <div class="gbox"><h3>${L.anaT}</h3>
        <div class="gitem" style="--tc:${G.tiers[ex.tier - 1].color}">
          <div class="gih">${H.itemTile(ex)}<div><b>${esc(ex.name)}</b><span>${L.needLv}${ex.req}</span></div></div>
          <ol class="gil">
            <li class="m"><em>1</em>${esc(ex.main)} ${ex.min}–${ex.max}</li>
            <li class="r"><em>2</em><ul>${exLines}</ul></li>
            <li class="s"><em>3</em>${esc(H.labelName(sp))} +${rngTxt(G.ranges.special[sp][ex.tier - 1])}%</li>
          </ol></div>
        <ol class="gana">${L.ana.map(([n, d], i) => `<li><em>${i + 1}</em><b>${n}</b> — ${d}</li>`).join('')}</ol></div>
      <div class="gbox"><h3>${L.linesT}</h3>
        <div class="glines">${linesBy.map(([t, n, s]) => `<div style="--tc:${G.tiers[t - 1].color}"><b>${G.tiers[t - 1].roman}</b><span>${'<i></i>'.repeat(n)}${s ? '<i class="sp"></i>' : ''}</span><small>${n} ${n === 1 ? L.line1 : L.lines}${s ? ' ' + L.special : ''}</small></div>`).join('')}</div>
        <ul class="gchk">${L.rules.map(x => `<li>${x}</li>`).join('')}</ul></div>
    </div>`};
  const RB = G.refineBonus || [8,16,24,32,42,52,62,74,86,100], RED = [100,90,80,70,40,25,20,10,5,3], RER = [5000,15000,40000,70000,100000,100000];
  T.refine = {lead:L.refP,
    vis:`<div class="gbox"><h3>${img('blacksmith','gi sm')} ${L.refT}</h3>
      <div class="gref">${REF.map((p, i) => `<div class="gr${i >= 4 ? ' glow' : ''}${i >= 6 ? ' aura' : ''}"><b>+${i + 1}</b><span><i style="height:${p}%;--h:${p}"></i></span><em>${p}%</em><small>+${RB[i]}%</small></div>`).join('')}</div>
      <div class="glegend"><span><i class="lg1"></i>${L.refChance}</span><span><small>+%</small> ${L.refBonus}</span></div>
      <p class="muted sm">${L.refNote}</p>
      <div class="gstones">${L.refStones.map(([ic, n, d]) => `<div class="gd">${img(ic,'gi')}<div><b>${n}</b><p>${d}</p></div></div>`).join('')}</div></div>`,
    more:`<div class="gtwo">
      <div class="gbox"><h3>${img('blacksmith','gi sm')} ${L.rerT}</h3><p>${L.rerP}</p>
        <ul class="grer">${(ex.pool || []).slice(0, ex.lines).map((k, i) => `<li class="${i < 2 ? 'rlk' : 'rr'}"><span>${esc(H.labelName(k))} +${rngTxt(G.ranges.stat[ex.tier - 1])}</span><b>${i < 2 ? L.locked : L.rerolled}</b></li>`).join('')}
          <li class="sp"><span>${esc(H.labelName(sp))} +${rngTxt(G.ranges.special[sp][ex.tier - 1])}%</span><b>${L.kept}</b></li></ul>
        <h3 class="gsub sm">${L.rerTierT}</h3>
        <div class="gprice">${G.tiers.map((t, i) => `<div style="--tc:${t.color}"><b>${t.roman}</b><span>${nf(RER[i])}</span></div>`).join('')}</div></div>
      <div class="gbox"><h3>${L.redT}</h3><p class="muted sm">${L.redP}</p>
        <div class="gref red">${RED.map((p, i) => `<div class="gr"><b>+${i + 1}</b><span><i style="height:${p}%;--h:${p}"></i></span><em>${p}%</em></div>`).join('')}</div></div>
    </div>`};

  // ---------- cards ----------
  const pick = r => G.cards.find(c => c.r === r && c.art && !/goblin/.test(c.id)) || G.cards.find(c => c.r === r);
  const rars = ['grey','green','blue','purple','gold','red'];
  T.cards = {lead:L.cLead,
    vis:`<div class="gcrar">${rars.map(r => { const c = pick(r); return c ? `<figure>${H.cardTile(c, {badge: c.u ? '★' : ''})}<figcaption><i class="dot" style="--c:${H.rarColor(r)}"></i>${L.cRar[r]}</figcaption></figure>` : ''; }).join('')}</div>`,
    more:`<div class="gbox"><h3>${L.cSlotsT}</h3>
      <div class="gcslots">${G.cardSlotLevels.map((lv, i) => `<div class="gcs">${img('card','gi md')}<b>${i + 1}</b><span>Lv.${lv}</span></div>`).join('')}</div></div>
      <ul class="gchk">${L.cRules.map(x => `<li>${x}</li>`).join('')}</ul>`};

  // ---------- skills ----------
  const noX = Object.values(skill).filter(s => s.noExtra);
  T.skills = {lead:L.sLead,
    vis:`<div class="gbox"><h3>${L.xT}</h3><p>${L.xP}</p>
      <div class="gxs">${(G.passiveSlotLevels || []).map((lv, i) => `<div class="gx1"><span>${i + 1}</span><b>Lv.${lv}</b></div>`).join('')}</div></div>`,
    more:`<div class="gfacts">${L.sFacts.map(([n, d], i) => `<div class="gbox">${img(['swords','SpellCRIT','INT'][i],'gi md')}<b>${n}</b><p>${d}</p></div>`).join('')}</div>
    <div class="gbox"><h3>${img('ASPD','gi sm')} ${L.aspdT}</h3>
      <div class="gsk">${ASPD_SKILLS.map(id => skill[id] ? `<figure>${H.skillIcon(skill[id])}<figcaption><b>${esc(skill[id].name)}</b><i style="color:${(cls.find(c => c.name === skill[id].cls) || {}).color}">${esc(skill[id].cls)}</i></figcaption></figure>` : '').join('')}</div></div>
    <div class="gbox"><p class="muted sm">${L.xNo}</p>
      <div class="gsk sm">${noX.map(s => `<figure>${H.skillIcon(s)}<figcaption><b>${esc(s.name)}</b><i>${esc(s.cls)}</i></figcaption></figure>`).join('')}</div></div>`};

  // ---------- classes ----------
  T.classes = {lead:L.clLead,
    vis:`<div class="gcls">${cls.map(c => { const top = PRI[c.id] || Object.entries(c.weights).sort((a, b) => b[1] - a[1]).map(x => x[0]);
      return `<article class="gcl" style="--c:${c.color}"><div class="gcl-h"><img class="gemb" src="assets/cls/${c.id}.webp" alt="" loading="lazy"><div><b class="stroke">${esc(c.name)}</b>
        <span class="gtags"><i>${L.wpn[c.weapon] || c.weapon}</i><i>${c.magic ? L.mag : L.phys}</i>${c.special ? `<i class="spc">${L.spc}</i>` : ''}</span></div></div>
        <p>${L.role[c.id] || ''}</p>
        <div class="gcst">${top.map(k => dot(k, 'cs')).join('')}</div></article>`; }).join('')}</div>`, more:''};

  // ---------- status ----------
  T.status = {lead:L.stsLead,
    vis:`<div class="gsts">${Object.entries(L.sts).map(([k, [n, d]]) => `<div class="gs1">${img(k,'gi md')}<div><b>${n}</b><p>${d}</p></div></div>`).join('')}</div>`, more:''};
  return {T, L};
}

function bubble(t, L, i){
  return `<a class="hb hb-${t.side}" href="#guide-${t.id}" data-t="${t.id}" style="--c:${t.c};--d:${(i * 0.37) % 2.4}s">
    <span class="hb-o">${img(t.ic, 'gi hb-i')}${t.id === 'refine' ? '<em class="hb-plus stroke">+10</em>' : ''}</span>
    <span class="hb-t"><b class="stroke">${L.nav[t.id]}</b><i>${L.hint[t.id]}</i></span></a>`;
}

function render(ctx){
  CTX = ctx; const {G, lang, app, H} = ctx;
  BUILT = build(ctx); const L = BUILT.L;
  const side = s => TOPICS.filter(t => t.side === s);
  app.innerHTML = `<div class="guide">
    <div class="hub">
      <div class="hub-head"><h1 class="stroke">${L.title}</h1><p>${L.hubSub}</p></div>
      <div class="hub-stage" id="hubStage">
        <svg class="hub-lines" id="hubLines" aria-hidden="true"></svg>
        <div class="hub-hero"><span class="hub-glow"></span><span class="hub-ground"></span><img id="hubHero" src="assets/hero.webp" alt="" width="493" height="630"></div>
        <div class="hub-col l">${side('l').map((t, i) => bubble(t, L, i)).join('')}</div>
        <div class="hub-col r">${side('r').map((t, i) => bubble(t, L, i + 4)).join('')}</div>
      </div>
    </div>
    <div id="gPanel" class="gpanel" hidden></div>
    <div class="gend"><img src="assets/logo.webp" alt="" loading="lazy"><div><h2 class="stroke">${L.endT}</h2><p>${L.endP}</p>
      <div class="hbtns"><a class="btn green" href="#new">${L.share}</a><a class="btn blue" href="${H.GAME_URL}" target="_blank" rel="noopener">${L.play}</a></div></div></div>
  </div>`;
  const hero = app.querySelector('#hubHero');
  if (hero.complete) drawLines(); else hero.addEventListener('load', drawLines, {once:true});
  if (onResize) onResize.disconnect();
  let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(drawLines); };
  if ('ResizeObserver' in window) { onResize = new ResizeObserver(redraw); onResize.observe(app.querySelector('#hubStage')); onResize.observe(hero); }
  else { addEventListener('resize', redraw); onResize = {disconnect(){ removeEventListener('resize', redraw); }}; }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(redraw);
}

// dashed lines from each bubble to the part of the hunter it is about
function drawLines(){
  const app = CTX && CTX.app, st = app && app.querySelector('#hubStage'), svg = st && st.querySelector('#hubLines'), hero = st && st.querySelector('#hubHero');
  if (!svg || !hero) return;
  const S = st.getBoundingClientRect(), B = hero.getBoundingClientRect();
  // the picture is drawn with object-fit: contain, so find the real drawn box inside the <img>
  const ir = (hero.naturalWidth || 493) / (hero.naturalHeight || 630), br = B.width / B.height;
  const Hr = br > ir ? {width: B.height * ir, height: B.height, left: B.left + (B.width - B.height * ir) / 2, top: B.top}
                     : {width: B.width, height: B.width / ir, left: B.left, top: B.top + (B.height - B.width / ir) / 2};
  svg.setAttribute('viewBox', `0 0 ${S.width} ${S.height}`);
  let out = '';
  TOPICS.filter(t => t.side !== 'b').forEach(t => {
    const b = st.querySelector(`.hb[data-t="${t.id}"] .hb-o`); if (!b) return;
    const r = b.getBoundingClientRect();
    const x1 = r.left + r.width / 2 - S.left, y1 = r.top + r.height / 2 - S.top;
    const x2 = Hr.left + Hr.width * t.pt[0] - S.left, y2 = Hr.top + Hr.height * t.pt[1] - S.top;
    const mx = (x1 + x2) / 2;
    out += `<path class="hl" data-t="${t.id}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}" style="--c:${t.c}"/><circle class="hd" data-t="${t.id}" cx="${x2}" cy="${y2}" r="5" style="--c:${t.c}"/>`;
  });
  svg.innerHTML = out;
  markOn();
}
function markOn(){
  const app = CTX && CTX.app; if (!app) return;
  const cur = app.dataset.gcur || '';
  app.querySelectorAll('.hb').forEach(b => b.classList.toggle('on', b.dataset.t === cur));
  app.querySelectorAll('.hl,.hd').forEach(p => p.classList.toggle('on', p.dataset.t === cur));
}

function open(sec, smooth){
  if (!CTX || !BUILT) return;
  const {app, G, H, lang} = CTX, {T, L} = BUILT, panel = app.querySelector('#gPanel');
  const nf = n => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US');
  const t = TOPICS.find(x => x.id === sec);
  app.dataset.gcur = t ? t.id : ''; markOn();
  if (!t) { panel.hidden = true; panel.innerHTML = ''; scrollTo({top:0, behavior: smooth ? 'smooth' : 'auto'}); return; }
  const d = T[t.id], keys = (L.keys[t.id] || []), i = ORDER.indexOf(t.id);
  const prev = TOPICS[(i + ORDER.length - 1) % ORDER.length], next = TOPICS[(i + 1) % ORDER.length];
  const lvList = G.cardSlotLevels.join(', ');
  panel.style.setProperty('--c', t.c);
  panel.innerHTML = `
    <header class="gp-h"><span class="gp-i">${img(t.ic, 'gi big')}</span><div><h2 class="stroke">${L.nav[t.id]}</h2><p>${d.lead}</p></div></header>
    ${keys.length ? `<ol class="gkeys">${keys.map(([ic, n, x], k) => `<li><span class="gk-n stroke">${k + 1}</span>${img(ic, 'gi lg')}<div><b>${n.replace('{pts}', nf(H.totalPts(G.maxLevel)))}</b><p>${x.replace('{lv}', lvList).replace('{one}', nf(H.costTo(G.maxStat))).replace('{pts}', nf(H.totalPts(G.maxLevel)))}</p></div></li>`).join('')}</ol>` : ''}
    <div class="gp-vis">${d.vis}</div>
    ${d.more ? `<details class="gmore"><summary><span>${L.more}</span></summary><div class="gmore-in">${d.more}</div></details>` : ''}
    <nav class="gp-nav">
      <a class="gpn" href="#guide-${prev.id}">${img(prev.ic, 'gi sm')}<span><i>${L.prev}</i>${L.nav[prev.id]}</span></a>
      <span class="gp-btns"><a class="btn sm grey" href="#guide">${L.back}</a>
      ${['stats','gear','refine','cards','skills'].includes(t.id) ? `<a class="btn sm green" href="#new">${L.tryIt}</a>` : ''}</span>
      <a class="gpn nx" href="#guide-${next.id}"><span><i>${L.next}</i>${L.nav[next.id]}</span>${img(next.ic, 'gi sm')}</a>
    </nav>`;
  panel.hidden = false;
  wire(panel);
  panel.scrollIntoView({block:'start', behavior: smooth ? 'smooth' : 'auto'});
}

function wire(root){
  const {G, H, lang} = CTX, L = BUILT.L, $ = s => root.querySelector(s);
  const nf = n => n.toLocaleString(lang === 'th' ? 'th-TH' : 'en-US');
  if ($('#gLv')) {
    const upLv = v => { STATIC.lv = v; $('#gLv').textContent = v; const pts = H.totalPts(v); $('#gPts').textContent = nf(pts);
      let s = 1; while (s < G.maxStat && 2 * H.costTo(s + 1) <= pts) s++; $('#gTwo').textContent = s; };
    const upDef = v => { STATIC.def = v; $('#gDef').textContent = v; const p = Math.round(v / (v + 200) * 100); $('#gDefPct').textContent = p + '%'; $('#gDefBar').style.width = p + '%'; };
    upLv(STATIC.lv); upDef(STATIC.def);
    root.querySelectorAll('input[data-g]').forEach(r => r.addEventListener('input', () => (r.dataset.g === 'lv' ? upLv : upDef)(+r.value)));
  }
  if ($('#gPop')) {
    const pop = $('#gPop');
    pop.addEventListener('click', e => {
      const b = e.target.closest('.gpop-b'); if (!b) return;
      pop.querySelectorAll('.gpop-b').forEach(x => x.classList.toggle('on', x === b));
      pop.querySelectorAll('.gpop-card').forEach(c => { c.hidden = c.dataset.k !== b.dataset.k; });
    });
  }
  if ($('#gRes')) {
    const upChk = () => {
      const {you, mob} = STATIC.chk, m = BEATS[you] === mob ? 125 : BEATS[mob] === you ? 75 : 100;
      $('#gRes').className = 'gres ' + (m === 125 ? 'up' : m === 75 ? 'dn' : '');
      $('#gRes').innerHTML = `${img(you,'gi md')}<span>→</span>${img(mob,'gi md')}<b class="stroke">${m}%</b><em>${m === 125 ? L.checkStrong : m === 75 ? L.checkWeak : L.checkEven}</em>`;
    };
    upChk();
    root.querySelectorAll('.gpick').forEach(p => p.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      STATIC.chk[p.dataset.gp] = b.dataset.el;
      p.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); upChk();
    }));
  }
}

window.HT_GUIDE = {render, open, sections: ORDER};
})();
