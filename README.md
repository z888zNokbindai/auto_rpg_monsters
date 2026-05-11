# Abyss Grimoire V21 Scroll Fix

Dark Fantasy Text RPG แนว Auto Battle + Gacha + Fusion + Rebirth เล่นฆ่าเวลาได้จริงบนมือถือ/คอม

## วิธีรัน

เปิดไฟล์นี้ได้เลย:

```text
index.html
```

หรือรันผ่าน local server:

```bash
cd text_auto_gacha_v21
python -m http.server 8000
```

เปิด:

```text
http://localhost:8000
```

## ติดตั้งเป็นแอปบนมือถือ

บน Android/Chrome:

```text
เปิด http://localhost:8000 หรือเว็บที่โฮสต์ไว้ → เมนู ⋮ → Add to Home Screen / Install app
```

มีไฟล์ PWA แล้ว:

```text
manifest.json
service-worker.js
icons/icon-192.png
icons/icon-512.png
```

## ระบบหลัก

- ด่านยาวถึง 3000 และยากขึ้นเรื่อย ๆ
- มอนสเตอร์เลเวลสูงสุด 1000
- Rebirth หลังเลเวลเต็ม เพื่อเพิ่มสแตตัสถาวร
- ระบบต่อสู้ Press Turn คล้าย Shin Megami Tensei
- Gacha / Ticket / Gem
- Fusion + Chaos Fusion
- Monster Codex
- Favorite / Lock กันตัวสำคัญโดนผสม
- Filter / Sort มอนสเตอร์
- Auto Equip
- Auto Farm จนแพ้ / 10 รอบ / 50 รอบ
- Battle Summary หลังสู้
- Export / Import Save แบบ copy-paste
- Reset ต้องพิมพ์ RESET ก่อน
- Auto Backup ก่อน Reset/Import

## วิธีเล่นสั้น ๆ

```text
สุ่มฟรีเริ่มต้น 2 ตัว → จัดทีม → สู้ → ฟาร์ม Gold/Dust → อัปเลเวล → ผสมตัวสำรอง → ใส่อุปกรณ์ → Rebirth เมื่อ Lv.1000 → วนต่อ
```

## ทรัพยากรหาได้จากไหน

- Gold: ชนะด่าน, ฟาร์มด่านซ้ำ, Idle Reward, Daily Quest
- Gem: First Clear บางด่าน, Boss, Idle Reward, Daily Quest
- Ticket: ชนะสะสมทุก 7 ครั้ง, First Clear Boss, Daily Quest
- Dust: ชนะด่าน, ฟาร์มด่านซ้ำ, Idle Reward, Daily Quest
- Shard: ได้ตัวซ้ำจาก Gacha/Fusion
- Equipment: ดรอปจากด่าน ยิ่งด่านสูง/บอสยิ่งดี
- Rebirth Stack: มอนสเตอร์ Lv.1000 แล้วกด Rebirth

## โครงสร้างไฟล์

```text
text_auto_gacha_v21/
├── index.html
├── style.css
├── manifest.json
├── service-worker.js
├── README.md
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
└── js/
    ├── data.js
    ├── state.js
    ├── battle.js
    ├── ui.js
    └── main.js
```

## หมายเหตุเซฟ

V21 ใช้ save key ใหม่:

```text
abyss_grimoire_v21_save
```

ระบบจะพยายามอ่านเซฟ V19 เดิมให้อัตโนมัติ และมี Export/Import ในหน้า `คู่มือ`


## V21 Scroll Fix

- ปรับให้หน้าเกมเลื่อนด้วย native scroll ทั้งมือถือและคอม
- แก้เมนูล่างบนมือถือให้เป็น 2 แถว ไม่บีบจนกด/เลื่อนยาก
- เพิ่ม padding ด้านล่าง กันเนื้อหาโดนเมนูล่างบัง
- Battle Overlay เลื่อนได้เมื่อจอเตี้ยมาก และ Battle Log เลื่อนด้วยนิ้วได้ดีขึ้น
- เวลาเปลี่ยนหน้า เกมจะเลื่อนกลับขึ้นบนให้อัตโนมัติ
