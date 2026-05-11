# Abyss Grimoire V33 QoL

Dark Fantasy Text RPG แบบ Auto Battle + Gacha + Fusion + Rebirth สำหรับเล่นฆ่าเวลาในมือถือ/คอม

## เพิ่มใน V33

- Team Preset 3 ชุด: บันทึก/โหลดทีมฟาร์ม ทีมบอส ทีมทดลอง
- Auto Sell: ขาย/ย่อยอุปกรณ์ Common-Rare ที่ไม่ได้ใส่อยู่ เป็น Gold/Dust
- Auto Fusion วัตถุดิบต่ำ: ผสมเฉพาะ Common/Rare สำรองที่ไม่อยู่ในทีม ไม่ได้ล็อก และไม่เคย Rebirth
- ปรับ UI อ่านง่ายขึ้นทุกหน้า: ปุ่มใหญ่ขึ้น, panel ชัดขึ้น, bottom nav 2 แถวบนมือถือ, Monster Manager ดูเป็นระเบียบขึ้น
- ยังรองรับระบบเดิม: Background Battle, Mini Battle Widget, x50 Speed, SSR, Fusion, Codex, Export/Import Save

## วิธีรัน

เปิด `index.html` ได้ทันที

หรือรัน local server:

```bash
cd text_auto_gacha_v32_qol
python -m http.server 8000
```

เปิด:

```text
http://localhost:8000
```

## หมายเหตุ

V33 ใช้ save key ใหม่ `abyss_grimoire_v33_save` และพยายามอ่านเซฟ V32 เดิมให้อัตโนมัติ


## V33 No Half Battle

- เอาโหมด Battle ครึ่งหน้าต่างออกแล้ว
- ระหว่างสู้ ถ้าย่อ จะเหลือเป็นกล่องเล็กเท่านั้น
- กดกล่องเล็ก หรือปุ่ม เต็มจอ จะกลับไปหน้า Battle เต็มจอทันที
- ถ้าสุ่ม/ผสมได้มอนสเตอร์ซ้ำ จะเปลี่ยนเป็น Shard ของมอนสเตอร์ตัวนั้น ใช้สำหรับอัปดาว
