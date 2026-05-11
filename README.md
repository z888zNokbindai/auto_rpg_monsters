# Abyss Grimoire V37 Mini Dock Fix

Dark Fantasy Text RPG / Auto Battle / Gacha / Fusion / Rebirth แบบเล่นบนมือถือได้

## วิธีรัน

เปิด `index.html` ได้เลย หรือรัน local server:

```bash
cd text_auto_gacha_v37_mini_dock_autofarm_fix
python -m http.server 8000
```

เปิด:

```text
http://localhost:8000
```

## สิ่งที่มีใน V37

### 1. Mission / Achievement
- เพิ่มเป้าหมายระยะยาว เช่น ผ่านด่าน 10/50/100, ชนะ 100 ครั้ง, ผสม 10 ครั้ง, Rebirth ครั้งแรก
- รับรางวัลได้จากหน้า ฐาน / ร้าน / คู่มือ

### 2. Pity Gacha
- Rare+ ทุก 10 โรล
- Epic+ ทุก 50 โรล
- Legendary+ ทุก 200 โรล
- SSR ยังเป็น ultra rare ไม่เข้า pity

### 3. Shop
ร้านค้าใหม่ใช้แปลงทรัพยากร:
- Gem -> Ticket
- Gold -> Dust
- Gem -> Gold
- Dust -> Random Shard
- Gem -> Gear Box
- Gem -> Rebirth Supply

### 4. Codex Reward
สะสมปีศาจตาม Tier แล้วรับรางวัล เช่น Common/Rare/Epic/Legendary/Mythic/SSR

### 5. Stage Modifier
ด่านบางด่านมีเงื่อนไขพิเศษ เช่น:
- ศัตรู ATK เพิ่ม
- ศัตรู DEF เพิ่ม
- ศัตรู SPD เพิ่ม
- ศัตรู HP เพิ่ม

### 6. Boss Skill
บอสทุก 5 ด่านมีออร่าพิเศษ เช่น:
- Blood Regen
- Summoner Aura
- Anti-Magic Shell
- Curse Wave
- Executioner

### 7. Auto Farm Settings
เลือกเงื่อนไขฟาร์มได้:
- จนกว่าแพ้
- หยุดเมื่อได้ Ticket
- หยุดเมื่อทีมมีตัว Lv.100 (เลเวลขึ้นได้จาก EXP หลังชนะไฟต์ หรือกดอัปเกรดด้วย Gold)
- หยุดเมื่อดรอป Epic+

### 8. Dashboard แนะนำเป้าหมาย
หน้าแรกจะบอกว่าควรทำอะไรต่อ เช่น:
- สุ่มฟรีให้ครบ
- จัดทีมให้ครบ
- ฟาร์ม/อัปเกรดก่อนลุย
- รับ Achievement หรือ Codex Reward

## หมายเหตุเรื่องเซฟ

V37 ใช้ save key ใหม่:

```text
abyss_grimoire_v37_save
```

และพยายามอ่านเซฟ V35 เดิมให้อัตโนมัติ



## แก้ใน V37

- แก้ Auto Farm Settings ที่กดแล้วไม่จำค่า เพราะ `data-value` ของปุ่มถูกทับเป็นค่าว่าง
- กดตั้งค่า Auto Farm ระหว่างดู Battle ได้แล้ว
- กล่อง Battle ย่อเปลี่ยนเป็นสี่เหลี่ยมเล็กมุมขวาล่าง ไม่ทับแท็บด้านล่าง
- แตะกล่อง Battle ย่อเพื่อกลับไปหน้าไฟต์เต็ม ไม่มีโหมดครึ่งหน้าต่าง
- เพิ่มระบบ EXP จากการชนะไฟต์ให้มอนสเตอร์ในทีม
- เงื่อนไข “หยุดเมื่อทีมมีตัว Lv.100” จะทำงานเมื่อมอนสเตอร์ในทีมถึง Max Level จาก EXP หรืออัปเกรด
- หน้าต่อสู้แบบเต็มจอโชว์ HP, ATK, DEF, SPD, Lv และดาวของแต่ละตัว
