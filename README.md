# Abyss Grimoire V36 Progression

Dark Fantasy Text RPG / Auto Battle / Gacha / Fusion / Rebirth แบบเล่นบนมือถือได้

## วิธีรัน

เปิด `index.html` ได้เลย หรือรัน local server:

```bash
cd text_auto_gacha_v36_progression
python -m http.server 8000
```

เปิด:

```text
http://localhost:8000
```

## สิ่งที่เพิ่มใน V36

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
- หยุดเมื่อทีมมีตัว Lv.100
- หยุดเมื่อดรอป Epic+

### 8. Dashboard แนะนำเป้าหมาย
หน้าแรกจะบอกว่าควรทำอะไรต่อ เช่น:
- สุ่มฟรีให้ครบ
- จัดทีมให้ครบ
- ฟาร์ม/อัปเกรดก่อนลุย
- รับ Achievement หรือ Codex Reward

## หมายเหตุเรื่องเซฟ

V36 ใช้ save key ใหม่:

```text
abyss_grimoire_v36_save
```

และพยายามอ่านเซฟ V35 เดิมให้อัตโนมัติ

