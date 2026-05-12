# Abyss Grimoire V43 - Summon / Shop / Dungeon Fix

Dark Fantasy Text RPG / Auto Battle / Gacha / Fusion / Rebirth / Daily Dungeon สำหรับเล่นบนมือถือหรือคอมแบบ static web

## วิธีรัน

เปิด `index.html` ได้เลย หรือรันผ่าน local server:

```bash
cd text_auto_gacha_v43_summon_shop_dungeonfix
python -m http.server 8000
```

แล้วเปิด:

```text
http://localhost:8000
```

## เพิ่ม/แก้ใน V43

### 1. Battle Flow ไม่ refresh ระหว่างฟาร์ม

- ตอน Auto Farm / ดันด่าน / ฟาร์มหลายรอบ จะไม่ render หน้าเว็บซ้ำทุกไฟต์แล้ว
- ถ้ากำลังดูหน้าอื่นอยู่ ไฟต์จบแล้วจะยังอยู่หน้านั้น
- ถ้ายังอยู่หน้า Battle เต็มจอ ไฟต์จบแล้วจะปิดหน้าต่าง Battle กลับไปหน้าที่เปิดไว้ก่อนเริ่มสู้
- ระหว่างสู้ไปดูหน้าอื่นได้ โดยมีแถบ Battle ด้านบนให้กดกลับไปดูไฟต์เต็ม

### 2. อัญเชิญเพิ่ม

- เพิ่มปุ่มอัญเชิญ x100
- เพิ่มปุ่มอัญเชิญ x1000
- เพิ่มปุ่มอัญเชิญจนหมด ใช้ Ticket ก่อน แล้วค่อยใช้ Gem
- กดอัญเชิญแล้วจะไม่เด้งไปหน้าจัดทีม
- ถ้าได้ Legendary / Mythic / SSR จะมี Toast แจ้งเตือน และแสดงในกล่อง Highlight หน้าอัญเชิญ

### 3. แจกผู้เล่นใหม่

- ผู้เล่นใหม่เริ่มด้วย Ticket 2000
- ผู้เล่นใหม่เริ่มด้วย Gem 500
- Daily Login ยังแจก Ticket รายวันตามระบบเดิม ดังนั้นวันแรกอาจเห็น Ticket เพิ่มจากโบนัสรายวันด้วย

### 4. ร้านค้าใช้ง่ายขึ้น

- ปรับหน้าร้านค้าให้อ่านง่ายขึ้น
- เพิ่มปุ่มซื้อ x1 / x10 / Max
- เห็นชัดว่าจ่ายอะไรและได้อะไร

### 5. Daily Dungeon สุ่มทีมศัตรู

- ดันเจี้ยนรายวันไม่ง่ายตายตัวแล้ว
- ศัตรูจะสุ่มทีมตามพลังผู้เล่น
- ความยากแกว่งประมาณง่ายกว่า/พอ ๆ กัน/ยากกว่าเล็กน้อย
- มี Modifier สุ่ม เช่น ทีมเลือดหนา / ทีมเร็ว / ทีมโจมตีแรง
- บางรอบอาจแพ้ได้ถ้าทีมจัดมาไม่เหมาะ

### 6. Auto Farm Settings Fix

- แก้บัคปุ่ม Auto Farm Settings ที่กดแล้วไม่จำค่า
- เงื่อนไขที่มี:
  - จนกว่าแพ้
  - หยุดเมื่อได้ Ticket
  - หยุดเมื่อทีมมีตัว Lv.100
  - หยุดเมื่อดรอป Epic+

## ระบบเดิมที่ยังอยู่

- Campaign 3000 ด่าน
- Press Turn Battle แนว Shin Megami Tensei
- Fusion / Chaos Fusion
- Monster Codex
- Rebirth Lv.100
- Star Upgrade Preview
- Bulk Star Up / Bulk Rebirth
- Team Preset
- Auto Team หลายแนว
- Daily Login 7 วัน
- Mission / Achievement
- Shop / Codex Reward
- Formation Bonus
- Passive Skill
- Gear Set Bonus
- SSR Shard
- Combat Log Mode
- Export / Import Save

## หมายเหตุเรื่องเซฟ

V43 ใช้ save key ใหม่:

```text
abyss_grimoire_v43_save
```

ระบบจะพยายามอ่านเซฟ V42/V41/V40/V39 และเวอร์ชันเก่าที่รองรับให้อัตโนมัติ
