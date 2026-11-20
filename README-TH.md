# Hunting Together Build Board — วิธีเปิดเว็บจริง (ฟรี)

เว็บจริง: https://reborny777.github.io/huntingtogether-build/

เว็บนี้มี 5 ไฟล์: `index.html` `style.css` `app.js` `config.js` `game-data.js` + ไฟล์ฐานข้อมูล `schema.sql`
ถ้า `config.js` ยังว่าง เว็บจะเปิดใน "โหมดตัวอย่าง" (บิลด์ตัวอย่าง เก็บแค่ในเครื่อง)

## ขั้นที่ 1 — ทำฐานข้อมูลฟรีที่ Supabase
1. เข้า https://supabase.com → Start your project → ล็อกอินด้วย GitHub
2. New project → ตั้งชื่อ `hunting-together-builds` → Region: **Southeast Asia (Singapore)** → ตั้งรหัสผ่านฐานข้อมูล (จดไว้) → Create
3. รอสร้างเสร็จ (~2 นาที) → เมนูซ้าย **SQL Editor** → New query → เปิดไฟล์ `schema.sql` คัดลอกทั้งหมดมาวาง → กด **Run** (ต้องขึ้น Success)
4. เมนูซ้าย **Authentication → Sign In / Providers** → เปิด **Allow anonymous sign-ins** → Save
   (ผู้เล่นจะอัปโหลด กดไลก์ ให้คะแนนได้เลยโดยไม่ต้องสมัครสมาชิก)
5. เมนูซ้าย **Project Settings → API** → คัดลอก 2 อย่าง:
   - Project URL
   - Project API keys → **anon public**
6. เปิด `config.js` แล้ววางลงไป:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGciOi..."
   ```
   ห้ามใช้คีย์ `service_role` เด็ดขาด (คีย์ anon เปิดเผยได้ ฐานข้อมูลมีกฎกันโกงแล้ว)

## ขั้นที่ 2 — ขึ้นเว็บฟรีที่ GitHub Pages
1. GitHub → New repository → ชื่อ `huntingtogether-build` → **Public** → Create
2. Add file → Upload files → ลาก `index.html` `style.css` `app.js` `config.js` `game-data.js` ขึ้นไป → Commit
3. Settings → Pages → Source: **Deploy from a branch** → Branch: `main` / `(root)` → Save
4. รอ 1–2 นาที ลิงก์เว็บจะเป็น `https://reborny777.github.io/huntingtogether-build/`

## ระบบที่มี
- ตัวจัดบิลด์แบบลากวาง: ลากไอเทม/การ์ดจากกระเป๋าใส่ตัวละคร ลากสกิลลงแถบสกิล (มือถือ: แตะเพื่อใส่ หรือกดค้างแล้วลาก)
- ใช้ข้อมูลจริงจากเกม (`game-data.js`): ไอคอนไอเทม/สกิล/พื้นหลังความหายาก, ระดับ I–VI, เลเวลที่ต้องใช้, อาวุธตามคลาส
- กฎจริงของเกม: จำนวนแถวออปชันตามระดับ (VI = 4 แถว + ออปชันพิเศษ 1), ค่าต่ำสุด–สูงสุดของแต่ละออปชัน, ตีบวกสูงสุด +10, ช่องการ์ดเปิดตามเลเวล (1/20/30/40/50/60/70/99), แต้มสเตตัสและแต้มสกิลตามเลเวล, ปุ่มใช้ auto-stat แบบในเกม
- ดูฟรี ค้นหา กรองตามคลาส เรียง ใหม่ล่าสุด / ไลก์มากสุด / คะแนนสูงสุด
- กดไลก์ (1 คน 1 ไลก์) และให้คะแนน 1–5 ดาว — ไลก์/ให้คะแนนบิลด์ตัวเองไม่ได้
- แก้ไข/ลบบิลด์ของตัวเอง (จากเครื่องเดิม) · คนละไม่เกิน 10 บิลด์
- ปุ่มรายงาน — ครบ 5 คนรายงาน บิลด์จะถูกซ่อนอัตโนมัติ
- ภาษาอังกฤษเป็นหลัก ภาษาไทยขึ้นเฉพาะเครื่องภาษาไทย (มีปุ่มสลับ)

## ไอคอน
- ไอคอนเก็บใน Supabase Storage bucket `icons` (คัดลอกจาก Roblox ด้วย Edge Function `icon-sync`) เพราะลิงก์รูปของ Roblox หมดอายุใน 180 วัน
- เพิ่มไอคอนใหม่: เรียก `icon-sync` (POST `{ids:[...]}` ครั้งละไม่เกิน 60 ไอดี พร้อมคีย์ anon)

## เมื่อเกมเปลี่ยน (ไอเทม/การ์ด/สกิล/กฎออปชันใหม่)
- export ข้อมูลจาก [TEST] ใหม่ → สร้าง `game-data.js` ใหม่ → อัปขึ้น GitHub → ซิงก์ไอคอนใหม่ด้วย `icon-sync`

## ดูแลเว็บ
- ดู/ซ่อน/ลบบิลด์: Supabase → **Table Editor → builds** → แก้ช่อง `hidden` เป็น true/false หรือลบแถว
- ดูรายงาน: **Table Editor → reports**
- แผนฟรีของ Supabase จะพักโปรเจกต์ถ้าไม่มีคนใช้ 7 วัน → เข้า Dashboard กด Restore ได้
- ถ้าเพิ่มคลาสใหม่ ต้อง export `game-data.js` ใหม่ และ Run ใน SQL Editor:
  ```sql
  alter table public.builds drop constraint builds_class_check;
  alter table public.builds add constraint builds_class_check
    check (class in ('Swordsman','Thief','Archer','Mage','Cleric','Merchant','Alchemist','Samurai','Necromancer','Muay Thai','ชื่อคลาสใหม่'));
  ```
