window.GameData = (() => {
  const rarities = {
    Common: { label: 'Common', mult: 1.00, shard: 6, rate: 58 },
    Rare: { label: 'Rare', mult: 1.16, shard: 10, rate: 30 },
    Epic: { label: 'Epic', mult: 1.38, shard: 18, rate: 9 },
    Legendary: { label: 'Legendary', mult: 1.68, shard: 30, rate: 2.7 },
    Mythic: { label: 'Mythic', mult: 2.05, shard: 50, rate: 0.3 },
    SSR: { label: 'SSR', mult: 3.20, shard: 120, rate: 0.000001 },
  };

  const elements = {
    Fire: { icon:'🔥', label:'ไฟ', strong:'Nature', weak:'Water' },
    Water: { icon:'💧', label:'น้ำ', strong:'Fire', weak:'Nature' },
    Nature: { icon:'🌿', label:'พฤกษา', strong:'Water', weak:'Fire' },
    Light: { icon:'✨', label:'แสง', strong:'Dark', weak:null },
    Dark: { icon:'🌑', label:'มืด', strong:'Light', weak:null },
  };

  const roles = {
    Tank: { icon:'🛡️', label:'แทงค์' },
    Warrior: { icon:'⚔️', label:'นักรบ' },
    Assassin: { icon:'🗡️', label:'นักฆ่า' },
    Ranger: { icon:'🏹', label:'ยิงไกล' },
    Mage: { icon:'🔥', label:'เวท' },
    Support: { icon:'💚', label:'ซัพพอร์ต' },
    Debuffer: { icon:'☠️', label:'ดีบัฟ' },
  };

  const heroes = [
    {id:'iron_fist',name:'หมัดเหล็ก',icon:'🥊',rarity:'Common',element:'Nature',role:'Tank',target:'front',skill:'ยืนหยัด',skillDesc:'ตั้งการ์ด ลดดาเมจที่ได้รับ และฟื้น HP เล็กน้อย',base:{hp:780,atk:70,def:92,spd:62},ai:'tank'},
    {id:'wandering_sword',name:'กระบี่พเนจร',icon:'🗡️',rarity:'Common',element:'Fire',role:'Warrior',target:'front',skill:'กระบี่ผ่าลม',skillDesc:'โจมตีเป้าหมายเดี่ยวแรงขึ้น',base:{hp:560,atk:105,def:48,spd:82},ai:'strike'},
    {id:'herb_healer',name:'หมอสมุนไพร',icon:'🍃',rarity:'Common',element:'Nature',role:'Support',target:'ally_low',skill:'ยาสมานแผล',skillDesc:'ฮีลเพื่อนที่ HP ต่ำสุด',base:{hp:470,atk:86,def:38,spd:75},ai:'heal'},
    {id:'village_archer',name:'ธนูหมู่บ้าน',icon:'🏹',rarity:'Common',element:'Water',role:'Ranger',target:'lowest',skill:'ยิงซ้ำ',skillDesc:'ยิงเป้าหมายเดิม 2 ครั้ง',base:{hp:430,atk:108,def:35,spd:92},ai:'double'},
    {id:'spark_monk',name:'ศิษย์อสนี',icon:'⚡',rarity:'Rare',element:'Light',role:'Mage',target:'random',skill:'สายฟ้าวาบ',skillDesc:'โจมตีศัตรู 2 ตัวแบบสุ่ม',base:{hp:500,atk:130,def:40,spd:88},ai:'cleave'},
    {id:'shadow_thief',name:'โจรเงา',icon:'🥷',rarity:'Rare',element:'Dark',role:'Assassin',target:'back',skill:'แทงหลัง',skillDesc:'เล็งแถวหลังหรือ HP ต่ำสุด มีโอกาสคริติคอลสูง',base:{hp:450,atk:145,def:34,spd:112},ai:'assassin'},
    {id:'fire_taoist',name:'นักพรตไฟ',icon:'🔥',rarity:'Rare',element:'Fire',role:'Mage',target:'all',skill:'เพลิงคลุมฟ้า',skillDesc:'โจมตีศัตรูทั้งหมดและติดเผาไหม้',base:{hp:500,atk:137,def:36,spd:84},ai:'aoe_burn'},
    {id:'river_guard',name:'องครักษ์สายน้ำ',icon:'🌊',rarity:'Rare',element:'Water',role:'Tank',target:'front',skill:'ม่านวารี',skillDesc:'สร้างโล่ให้ตัวเองและเพื่อนเลือดต่ำ',base:{hp:820,atk:82,def:96,spd:58},ai:'shield'},
    {id:'poison_doctor',name:'หมอพิษ',icon:'☠️',rarity:'Rare',element:'Dark',role:'Debuffer',target:'all',skill:'พิษโลหิต',skillDesc:'วางพิษศัตรูทั้งหมด 3 เทิร์น',base:{hp:520,atk:98,def:44,spd:80},ai:'poison'},
    {id:'moon_priest',name:'นักบวชจันทร์',icon:'🌙',rarity:'Epic',element:'Light',role:'Support',target:'ally_low',skill:'พรจันทร์เต็มดวง',skillDesc:'ฮีลทั้งทีม และเพิ่ม Energy',base:{hp:610,atk:122,def:54,spd:89},ai:'team_heal'},
    {id:'stone_golem',name:'โกเลมหิน',icon:'🪨',rarity:'Epic',element:'Nature',role:'Tank',target:'front',skill:'กำแพงศิลา',skillDesc:'รับดาเมจแทนทีม 1 เทิร์น และเพิ่ม DEF',base:{hp:1040,atk:90,def:130,spd:45},ai:'guard'},
    {id:'thunder_sage',name:'เซียนสายฟ้า',icon:'⛈️',rarity:'Epic',element:'Light',role:'Mage',target:'all',skill:'อสนีเก้าชั้น',skillDesc:'โจมตีศัตรูทั้งหมด มีโอกาสสตั้น',base:{hp:600,atk:170,def:45,spd:96},ai:'aoe_stun'},
    {id:'blood_blade',name:'ดาบโลหิต',icon:'🩸',rarity:'Epic',element:'Dark',role:'Warrior',target:'front',skill:'ดูดวิญญาณ',skillDesc:'โจมตีแรงและดูดเลือด',base:{hp:730,atk:165,def:64,spd:78},ai:'lifesteal'},
    {id:'mist_huntress',name:'พรานหมอก',icon:'🦊',rarity:'Epic',element:'Water',role:'Ranger',target:'lowest',skill:'ลูกศรหมอก',skillDesc:'ยิง 3 นัดใส่เป้าหมาย HP ต่ำ',base:{hp:540,atk:162,def:42,spd:118},ai:'triple'},
    {id:'flame_dragonling',name:'มังกรเพลิงน้อย',icon:'🐉',rarity:'Legendary',element:'Fire',role:'Mage',target:'all',skill:'ลมหายใจมังกร',skillDesc:'โจมตีหมู่รุนแรงและเผาไหม้',base:{hp:720,atk:210,def:54,spd:94},ai:'dragon_fire'},
    {id:'jade_general',name:'แม่ทัพหยก',icon:'👑',rarity:'Legendary',element:'Nature',role:'Warrior',target:'front',skill:'บัญชาทัพ',skillDesc:'โจมตีแรง พร้อมบัฟ ATK ทีม',base:{hp:860,atk:188,def:80,spd:86},ai:'team_buff'},
    {id:'abyss_lord',name:'จอมมารห้วงลึก',icon:'😈',rarity:'Legendary',element:'Dark',role:'Debuffer',target:'all',skill:'ตรวนวิญญาณ',skillDesc:'โจมตีหมู่ ลด ATK และติดคำสาป',base:{hp:880,atk:176,def:76,spd:82},ai:'curse'},
    {id:'sun_lotus',name:'บัวสุริยัน',icon:'🌻',rarity:'Legendary',element:'Light',role:'Support',target:'ally_low',skill:'แสงคืนชีพ',skillDesc:'ฮีลหนักทั้งทีม ถ้ามีตัวใกล้ตายจะฮีลเพิ่ม',base:{hp:700,atk:150,def:68,spd:102},ai:'legend_heal'},
    {id:'void_emperor',name:'จักรพรรดิสูญญะ',icon:'🕳️',rarity:'Mythic',element:'Dark',role:'Mage',target:'all',skill:'โลกไร้เสียง',skillDesc:'โจมตีหมู่หนักมากและลด Energy ศัตรู',base:{hp:900,atk:245,def:78,spd:106},ai:'void'},
    {id:'celestial_sword',name:'กระบี่ฟ้าประทาน',icon:'🌟',rarity:'Mythic',element:'Light',role:'Assassin',target:'back',skill:'หนึ่งกระบี่ไร้เงา',skillDesc:'ฟันแถวหลังรุนแรง ถ้าสังหารได้จะโจมตีต่อ',base:{hp:760,atk:260,def:62,spd:132},ai:'execute'},

    // V9: เพิ่มมอนสเตอร์อีก 20 ตัว ให้ Fusion และการจัดทีมมีทางเลือกมากขึ้น
    {id:'ash_imp',name:'อิมป์เถ้าถ่าน',icon:'👹',rarity:'Common',element:'Fire',role:'Debuffer',target:'random',skill:'สะเก็ดไฟดำ',skillDesc:'โจมตีเบาและมีโอกาสติด Burn เหมาะเป็นวัตถุดิบผสมสายไฟ',base:{hp:390,atk:95,def:28,spd:96},ai:'aoe_burn'},
    {id:'bone_rat',name:'หนูกระดูก',icon:'🐀',rarity:'Common',element:'Dark',role:'Assassin',target:'lowest',skill:'กัดเส้นเอ็น',skillDesc:'เล็งตัวเลือดต่ำ ความเร็วสูงแต่บาง',base:{hp:360,atk:112,def:22,spd:118},ai:'assassin'},
    {id:'pond_sprite',name:'ภูตบ่อน้ำ',icon:'🫧',rarity:'Common',element:'Water',role:'Support',target:'ally_low',skill:'หยดน้ำเยียวยา',skillDesc:'ฮีลเดี่ยว ใช้ง่ายในช่วงต้นเกม',base:{hp:430,atk:82,def:34,spd:88},ai:'heal'},
    {id:'thornling',name:'ต้นหนามน้อย',icon:'🌵',rarity:'Common',element:'Nature',role:'Tank',target:'front',skill:'หนามสะท้อน',skillDesc:'ยืนแถวหน้า รับดาเมจและสวนกลับเล็กน้อย',base:{hp:720,atk:65,def:82,spd:54},ai:'tank'},
    {id:'candle_wisp',name:'วิญญาณเทียน',icon:'🕯️',rarity:'Common',element:'Light',role:'Mage',target:'random',skill:'เปลววิญญาณ',skillDesc:'สุ่มโจมตี 2 เป้าหมาย เหมาะหา Weak แสง',base:{hp:405,atk:112,def:26,spd:94},ai:'cleave'},

    {id:'grave_hound',name:'หมาล่าเงา',icon:'🐺',rarity:'Rare',element:'Dark',role:'Assassin',target:'back',skill:'ฉีกคอเงา',skillDesc:'เล็งแนวหลัง มีโอกาส Critical สูง',base:{hp:500,atk:152,def:36,spd:124},ai:'assassin'},
    {id:'frost_acolyte',name:'สาวกน้ำแข็ง',icon:'❄️',rarity:'Rare',element:'Water',role:'Mage',target:'random',skill:'คมเยือกแข็ง',skillDesc:'โจมตี 2 เป้าหมายและมีโอกาสชะลอความเร็ว',base:{hp:510,atk:135,def:42,spd:86},ai:'cleave'},
    {id:'briar_witch',name:'แม่มดกุหลาบดำ',icon:'🌹',rarity:'Rare',element:'Nature',role:'Debuffer',target:'all',skill:'ละอองหนามพิษ',skillDesc:'วางพิษหมู่ เหมาะกับไฟต์ยาว',base:{hp:560,atk:104,def:48,spd:84},ai:'poison'},
    {id:'sun_squire',name:'อัศวินฝึกหัดสุริยะ',icon:'🌞',rarity:'Rare',element:'Light',role:'Warrior',target:'front',skill:'คำสาบานสุริยะ',skillDesc:'โจมตีพร้อมเพิ่ม ATK ทีมเล็กน้อย',base:{hp:650,atk:128,def:60,spd:78},ai:'team_buff'},
    {id:'rust_guard',name:'ผู้เฝ้ายามสนิม',icon:'⛓️',rarity:'Rare',element:'Fire',role:'Tank',target:'front',skill:'โล่สนิมร้อน',skillDesc:'สร้างโล่ให้ตัวเองและเพื่อนเลือดต่ำ',base:{hp:850,atk:82,def:102,spd:52},ai:'shield'},

    {id:'plague_nun',name:'แม่ชีโรคระบาด',icon:'🧟',rarity:'Epic',element:'Dark',role:'Support',target:'ally_low',skill:'ภาวนากาฬโรค',skillDesc:'ฮีลทีมเล็กน้อยพร้อมวาง Curse ใส่ศัตรู',base:{hp:650,atk:132,def:58,spd:92},ai:'team_heal'},
    {id:'magma_brute',name:'ยักษ์แมกมา',icon:'🌋',rarity:'Epic',element:'Fire',role:'Tank',target:'front',skill:'ผิวหินหลอม',skillDesc:'รับดาเมจแทนทีมและเผาศัตรูที่โจมตี',base:{hp:1130,atk:112,def:126,spd:48},ai:'guard'},
    {id:'tide_oracle',name:'โหราจารย์คลื่น',icon:'🔱',rarity:'Epic',element:'Water',role:'Support',target:'ally_low',skill:'คำทำนายแห่งน้ำ',skillDesc:'ฮีลทั้งทีมและเติม Energy',base:{hp:640,atk:128,def:60,spd:96},ai:'team_heal'},
    {id:'dusk_reaper',name:'ยมทูตยามสนธยา',icon:'💀',rarity:'Epic',element:'Dark',role:'Assassin',target:'back',skill:'เกี่ยววิญญาณ',skillDesc:'ล้วงหลังแรง ถ้าปิดบัญชีได้จะโจมตีต่อ',base:{hp:610,atk:184,def:48,spd:130},ai:'execute'},
    {id:'verdant_chimera',name:'คิเมร่ามรกต',icon:'🦁',rarity:'Epic',element:'Nature',role:'Warrior',target:'front',skill:'เขี้ยวมรกต',skillDesc:'โจมตีหนักและดูดเลือด เหมาะยืนครึ่งหน้า',base:{hp:820,atk:172,def:70,spd:86},ai:'lifesteal'},

    {id:'frost_leviathan',name:'เลวีอาธานน้ำแข็ง',icon:'🐋',rarity:'Legendary',element:'Water',role:'Tank',target:'front',skill:'ทะเลกลืนแสง',skillDesc:'แทงค์เลือดสูง สร้างโล่และลดดาเมจทีม',base:{hp:1250,atk:132,def:142,spd:66},ai:'guard'},
    {id:'seraph_inquisitor',name:'เซราฟผู้พิพากษา',icon:'🪽',rarity:'Legendary',element:'Light',role:'Warrior',target:'front',skill:'คำพิพากษาแสง',skillDesc:'โจมตีแรงพร้อมบัฟ ATK ทีม',base:{hp:890,atk:205,def:88,spd:98},ai:'team_buff'},
    {id:'necro_mandrake',name:'แมนเดรกสุสาน',icon:'🪦',rarity:'Legendary',element:'Dark',role:'Debuffer',target:'all',skill:'เสียงกรีดสุสาน',skillDesc:'ลด ATK ศัตรูทั้งทีมและติดพิษ/คำสาป',base:{hp:840,atk:168,def:82,spd:90},ai:'curse'},
    {id:'ash_phoenix',name:'ฟีนิกซ์เถ้าดำ',icon:'🔥',rarity:'Legendary',element:'Fire',role:'Support',target:'ally_low',skill:'เกิดใหม่จากเถ้า',skillDesc:'ฮีลหนักทีมและช่วยตัวใกล้ตาย',base:{hp:760,atk:166,def:72,spd:110},ai:'legend_heal'},
    {id:'eclipse_oni',name:'โอนิคราสจันทร์',icon:'👹',rarity:'Legendary',element:'Dark',role:'Tank',target:'front',skill:'หน้ากากคราส',skillDesc:'ยืนหน้า ดึงดาเมจ และทำให้ศัตรูติด Curse',base:{hp:1120,atk:154,def:118,spd:74},ai:'guard'},

    {id:'abyss_seraph',name:'เซราฟอเวจี',icon:'🩸',rarity:'Mythic',element:'Light',role:'Mage',target:'all',skill:'สวรรค์กลับด้าน',skillDesc:'โจมตีหมู่รุนแรง ลด Energy และมีโอกาสทำให้ศัตรูเสีย Press Turn',base:{hp:920,atk:265,def:86,spd:112},ai:'void'},
    {id:'worldroot_hydra',name:'ไฮดรารากโลก',icon:'🐲',rarity:'Mythic',element:'Nature',role:'Tank',target:'front',skill:'รากโลกพันธนาการ',skillDesc:'แทงค์ระดับสูง โจมตีหมู่และฟื้นตัวต่อเนื่อง',base:{hp:1450,atk:205,def:155,spd:80},ai:'dragon_fire'},


    // V22: เพิ่มมอนสเตอร์ชุด Final+ สำหรับการสะสมและสายผสมหลายทอด
    {id:'rot_rat',name:'หนูเน่า',icon:'🐭',rarity:'Common',element:'Dark',role:'Debuffer',target:'lowest',skill:'ฟันหนูสกปรก',skillDesc:'กัดเป้าหมายเลือดต่ำและมีโอกาสติด Poison เหมาะเป็นวัตถุดิบสายพิษ',base:{hp:370,atk:92,def:25,spd:116},ai:'poison'},
    {id:'bone_pup',name:'ลูกหมากระดูก',icon:'🦴',rarity:'Common',element:'Dark',role:'Warrior',target:'front',skill:'กระโจนกัด',skillDesc:'โจมตีเดี่ยวเร็ว ใช้ต่อยอดเป็นสายหมาเงา',base:{hp:470,atk:108,def:36,spd:96},ai:'strike'},
    {id:'grave_crow',name:'อีกาสุสาน',icon:'🐦‍⬛',rarity:'Common',element:'Dark',role:'Ranger',target:'back',skill:'จิกตาหลังแนว',skillDesc:'เล็งแนวหลัง ดาเมจไม่สูงแต่หา Weak มืดได้ดี',base:{hp:340,atk:102,def:24,spd:126},ai:'assassin'},
    {id:'mire_slime',name:'สไลม์บึงดำ',icon:'🟢',rarity:'Common',element:'Water',role:'Tank',target:'front',skill:'ร่างเหนียวหนืด',skillDesc:'เลือดเยอะกว่าตัวเริ่มต้น ต้านไฟต์ยาวได้ดี',base:{hp:760,atk:58,def:72,spd:42},ai:'tank'},
    {id:'ember_larva',name:'ตัวอ่อนเถ้าไฟ',icon:'🐛',rarity:'Common',element:'Fire',role:'Mage',target:'random',skill:'สะเก็ดเถ้าไฟ',skillDesc:'เวทไฟเบา ๆ มีไว้ผสมสายเพลิง',base:{hp:390,atk:112,def:24,spd:86},ai:'cleave'},

    {id:'moon_moth',name:'ผีเสื้อจันทร์ดับ',icon:'🦋',rarity:'Rare',element:'Light',role:'Support',target:'ally_low',skill:'ผงจันทร์',skillDesc:'ฮีลเดี่ยวและช่วยเติม Energy เล็กน้อย',base:{hp:500,atk:96,def:44,spd:104},ai:'heal'},
    {id:'carrion_squire',name:'สไควร์ซากศพ',icon:'🧟',rarity:'Rare',element:'Dark',role:'Tank',target:'front',skill:'ยืนเฝ้าหลุม',skillDesc:'แทงค์มืดต้นเกม DEF ดีแต่ช้า',base:{hp:880,atk:78,def:108,spd:50},ai:'shield'},
    {id:'blood_leech',name:'ปลิงโลหิต',icon:'🪱',rarity:'Rare',element:'Water',role:'Assassin',target:'lowest',skill:'ดูดเลือดสั้น',skillDesc:'ตีตัวเลือดต่ำและฟื้น HP ตัวเองเล็กน้อย',base:{hp:460,atk:145,def:36,spd:120},ai:'lifesteal'},
    {id:'drowned_bride',name:'เจ้าสาวจมน้ำ',icon:'👰',rarity:'Rare',element:'Water',role:'Support',target:'ally_low',skill:'คำสาบานใต้น้ำ',skillDesc:'ฮีลตัวเลือดต่ำและเหมาะต่อยอดสายคลื่น',base:{hp:560,atk:105,def:50,spd:88},ai:'heal'},
    {id:'lantern_jack',name:'แจ็คตะเกียงผี',icon:'🎃',rarity:'Rare',element:'Fire',role:'Mage',target:'random',skill:'ไฟหลอกทาง',skillDesc:'โจมตีสุ่ม 2 เป้าหมาย โอกาส Burn สูง',base:{hp:520,atk:142,def:38,spd:92},ai:'aoe_burn'},
    {id:'moss_ogre',name:'ยักษ์มอสส์',icon:'🧌',rarity:'Rare',element:'Nature',role:'Tank',target:'front',skill:'ทุบพื้นรากไม้',skillDesc:'แทงค์ธรรมชาติ เลือดสูงมากแต่ช้า',base:{hp:980,atk:92,def:104,spd:44},ai:'guard'},
    {id:'silver_acolyte',name:'นักบวชเงินหม่น',icon:'🪙',rarity:'Rare',element:'Light',role:'Mage',target:'random',skill:'แสงเงินบาดตา',skillDesc:'เวทแสงสุ่มเป้าหมาย เหมาะใช้ล่าตัวมืด',base:{hp:510,atk:138,def:42,spd:94},ai:'cleave'},

    {id:'crypt_butcher',name:'คนแล่เนื้อสุสาน',icon:'🔪',rarity:'Epic',element:'Dark',role:'Warrior',target:'front',skill:'มีดแล่วิญญาณ',skillDesc:'ตีแรง ช้า แต่ดูดเลือดได้ดีเมื่อไฟต์ยืด',base:{hp:830,atk:188,def:72,spd:66},ai:'lifesteal'},
    {id:'mirror_fiend',name:'ปีศาจกระจก',icon:'🪞',rarity:'Epic',element:'Light',role:'Debuffer',target:'all',skill:'เงาสะท้อนแตก',skillDesc:'โจมตีหมู่และลด ATK ศัตรู เหมาะแก้ทีมบอสตีแรง',base:{hp:640,atk:154,def:58,spd:104},ai:'curse'},
    {id:'frost_revenant',name:'เรเวแนนท์น้ำแข็ง',icon:'🥶',rarity:'Epic',element:'Water',role:'Debuffer',target:'all',skill:'ลมหายใจหนาวตาย',skillDesc:'โจมตีหมู่และชะลอความเร็วศัตรู',base:{hp:690,atk:160,def:64,spd:88},ai:'aoe_stun'},
    {id:'plague_doctor',name:'แพทย์หน้ากากโรค',icon:'🎭',rarity:'Epic',element:'Dark',role:'Debuffer',target:'all',skill:'ใบสั่งยามรณะ',skillDesc:'พิษหมู่แรง เหมาะดันไฟต์ที่บอสเลือดเยอะ',base:{hp:650,atk:148,def:60,spd:94},ai:'poison'},
    {id:'sunless_monk',name:'นักพรตไร้ตะวัน',icon:'📿',rarity:'Epic',element:'Light',role:'Support',target:'ally_low',skill:'มนต์แสงซีด',skillDesc:'ฮีลทีมเล็กน้อยและเติม Energy เหมาะทีมเวท',base:{hp:680,atk:134,def:68,spd:100},ai:'team_heal'},
    {id:'hellhound',name:'เฮลฮาวด์',icon:'🐕‍🦺',rarity:'Epic',element:'Fire',role:'Assassin',target:'back',skill:'เขี้ยวไฟนรก',skillDesc:'ล้วงหลังพร้อม Burn ถ้าฆ่าได้จะเร่งจังหวะทีม',base:{hp:620,atk:192,def:46,spd:136},ai:'execute'},
    {id:'witch_lantern',name:'ตะเกียงแม่มด',icon:'🏮',rarity:'Epic',element:'Fire',role:'Mage',target:'all',skill:'ไฟแม่มดวนเวียน',skillDesc:'ตีหมู่และ Burn เหมาะฟาร์มด่านลูกน้องหลายตัว',base:{hp:610,atk:178,def:48,spd:98},ai:'dragon_fire'},

    {id:'blood_moon_beast',name:'อสูรจันทร์โลหิต',icon:'🌕',rarity:'Legendary',element:'Dark',role:'Warrior',target:'front',skill:'คำรามจันทร์เลือด',skillDesc:'โจมตีแรงและดูดเลือด ถ้าเป้าหมายติด Curse จะดาเมจสูงขึ้น',base:{hp:980,atk:218,def:92,spd:98},ai:'lifesteal'},
    {id:'hollow_knight',name:'อัศวินกลวงเปล่า',icon:'♞',rarity:'Legendary',element:'Dark',role:'Tank',target:'front',skill:'เกราะว่างเปล่า',skillDesc:'แทงค์มืดที่ดึงดาเมจและลด Energy ศัตรูเล็กน้อย',base:{hp:1220,atk:150,def:136,spd:76},ai:'guard'},
    {id:'grave_seraph',name:'เซราฟสุสาน',icon:'🪽',rarity:'Legendary',element:'Light',role:'Support',target:'ally_low',skill:'ปีกเหนือหลุมศพ',skillDesc:'ฮีลทีมแรงและบัฟ DEF เหมาะทีมฟาร์มยาว',base:{hp:820,atk:165,def:86,spd:112},ai:'legend_heal'},
    {id:'abyss_chimera',name:'คิเมร่าอเวจี',icon:'🦴',rarity:'Legendary',element:'Nature',role:'Warrior',target:'front',skill:'สามเขี้ยวอเวจี',skillDesc:'ตีหลายจังหวะ มีดูดเลือด และทนกว่าตัวดาเมจทั่วไป',base:{hp:1030,atk:210,def:90,spd:104},ai:'triple'},

    {id:'blood_moon_drake',name:'เดรกจันทร์โลหิต',icon:'🐉',rarity:'Mythic',element:'Dark',role:'Mage',target:'all',skill:'คราสเลือดกลืนฟ้า',skillDesc:'โจมตีหมู่หนัก ลด Energy และทำให้ศัตรูเสียจังหวะ Press Turn',base:{hp:1040,atk:285,def:92,spd:118},ai:'void'},
    {id:'mother_of_ash',name:'มารดาแห่งเถ้า',icon:'👁️',rarity:'Mythic',element:'Fire',role:'Support',target:'ally_low',skill:'กำเนิดใหม่ในเถ้าดำ',skillDesc:'ฮีลทีมระดับสูง เติม Energy และช่วยทีมยืนฟาร์มบอส',base:{hp:980,atk:220,def:95,spd:120},ai:'legend_heal'},

    // V30: SSR ultra-rare demons. อัตราออกกาชาใช้ weight 0.000001 ตามที่กำหนด
    {id:'ssr_void_saint',name:'นักบุญสุญญะสีเลือด',icon:'🩸',rarity:'SSR',element:'Dark',role:'Mage',target:'all',skill:'บทสวดลบจักรวาล',skillDesc:'โจมตีศัตรูทั้งหมดอย่างรุนแรง ลด Energy และมีโอกาสทำให้ศัตรูพลาด Press Turn',base:{hp:1280,atk:390,def:118,spd:132},ai:'void'},
    {id:'ssr_golden_reaper',name:'ยมทูตมงกุฎทอง',icon:'👑',rarity:'SSR',element:'Light',role:'Assassin',target:'back',skill:'เคียวตัดชะตา',skillDesc:'ล้วงแถวหลัง ถ้าสังหารได้จะโจมตีต่อและเติม Energy ให้ตัวเอง',base:{hp:1080,atk:430,def:92,spd:166},ai:'execute'},
    {id:'ssr_abyssal_mother',name:'มารดาอเวจีไร้ตา',icon:'🕷️',rarity:'SSR',element:'Nature',role:'Support',target:'ally_low',skill:'ครรภ์เกิดใหม่',skillDesc:'ฮีลทีมหนักมาก เติม Energy และเพิ่ม DEF ให้ทั้งทีม เหมาะฟาร์มบอสยาว',base:{hp:1420,atk:300,def:134,spd:124},ai:'legend_heal'},
    {id:'ssr_inferno_leviathan',name:'เลวีอาธานเพลิงคราม',icon:'🐲',rarity:'SSR',element:'Fire',role:'Tank',target:'front',skill:'ทะเลไฟคราม',skillDesc:'แทงค์ SSR สร้างโล่ทีม รับดาเมจแทน และเผาศัตรูที่โจมตี',base:{hp:1780,atk:260,def:188,spd:92},ai:'guard'},
    {id:'ssr_mirror_empress',name:'จักรพรรดินีกระจกจันทร์',icon:'🪞',rarity:'SSR',element:'Water',role:'Debuffer',target:'all',skill:'พระจันทร์สะท้อนบาป',skillDesc:'โจมตีหมู่ ลด ATK/SPD ศัตรู และทำให้ทีมมีโอกาสรอดจากดาเมจหนัก',base:{hp:1320,atk:340,def:126,spd:140},ai:'curse'},


    // V39: เพิ่มมอนสเตอร์ใหม่ 30 ตัว คละเทียร์ เพื่อให้กาชา/ฟิวชันมีของให้ตามหาเยอะขึ้น
    {id:'grave_mite',name:'ไรสุสาน',icon:'🪳',rarity:'Common',element:'Dark',role:'Debuffer',target:'lowest',skill:'กัดซาก',skillDesc:'กัดเป้าหมายเลือดต่ำและมีโอกาสติด Poison เป็นวัตถุดิบมืดต้นเกม',base:{hp:345,atk:88,def:24,spd:122},ai:'poison'},
    {id:'soot_bat',name:'ค้างคาวเขม่าดำ',icon:'🦇',rarity:'Common',element:'Fire',role:'Assassin',target:'back',skill:'ปีกเขม่า',skillDesc:'ล้วงแถวหลังเบา ๆ และมีโอกาสติด Burn',base:{hp:360,atk:105,def:22,spd:128},ai:'assassin'},
    {id:'bog_toad',name:'คางคกบึงมรณะ',icon:'🐸',rarity:'Common',element:'Water',role:'Tank',target:'front',skill:'เมือกหนืด',skillDesc:'รับดาเมจได้ดีและทำให้ศัตรูช้าลงเล็กน้อย',base:{hp:690,atk:62,def:78,spd:48},ai:'tank'},
    {id:'pale_lamb',name:'ลูกแกะไร้แสง',icon:'🐑',rarity:'Common',element:'Light',role:'Support',target:'ally_low',skill:'เสียงร้องซีด',skillDesc:'ฮีลเดี่ยวเบา ๆ และเหมาะใช้ผสมสายแสง',base:{hp:430,atk:78,def:38,spd:82},ai:'heal'},
    {id:'ember_sprite',name:'ภูตสะเก็ดเพลิง',icon:'✨',rarity:'Common',element:'Fire',role:'Mage',target:'random',skill:'สะเก็ดระเบิด',skillDesc:'สุ่มโจมตี 2 เป้าหมายด้วยไฟ',base:{hp:390,atk:116,def:26,spd:96},ai:'cleave'},
    {id:'moss_skull',name:'กะโหลกมอสส์',icon:'💀',rarity:'Common',element:'Nature',role:'Tank',target:'front',skill:'เปลือกมอสส์',skillDesc:'แทงค์ธรรมชาติพื้นฐาน มี DEF ดี',base:{hp:735,atk:58,def:86,spd:42},ai:'tank'},
    {id:'drowned_candle',name:'เทียนจมน้ำ',icon:'🕯️',rarity:'Common',element:'Water',role:'Support',target:'ally_low',skill:'ไฟใต้น้ำ',skillDesc:'ฮีลเดี่ยวและเติม Energy เล็กน้อย',base:{hp:410,atk:80,def:35,spd:90},ai:'heal'},
    {id:'void_tick',name:'เห็บสูญญะ',icon:'🕷️',rarity:'Common',element:'Dark',role:'Assassin',target:'lowest',skill:'ดูดจังหวะ',skillDesc:'กัดตัวเลือดต่ำ มีโอกาสลด Energy',base:{hp:330,atk:118,def:20,spd:132},ai:'assassin'},

    {id:'ashen_warlock',name:'วอร์ล็อกเถ้าถ่าน',icon:'🧙',rarity:'Rare',element:'Fire',role:'Mage',target:'all',skill:'บทสวดเถ้าไฟ',skillDesc:'โจมตีหมู่ไฟและมีโอกาสติด Burn เหมาะฟาร์มลูกน้อง',base:{hp:520,atk:142,def:40,spd:88},ai:'aoe_burn'},
    {id:'marrow_guard',name:'ผู้พิทักษ์ไขกระดูก',icon:'🦴',rarity:'Rare',element:'Nature',role:'Tank',target:'front',skill:'โล่ไขกระดูก',skillDesc:'สร้างโล่ให้ตัวเองและเพื่อนเลือดต่ำ',base:{hp:875,atk:78,def:108,spd:50},ai:'shield'},
    {id:'kelp_siren',name:'ไซเรนสาหร่ายดำ',icon:'🧜',rarity:'Rare',element:'Water',role:'Support',target:'ally_low',skill:'เพลงน้ำลึก',skillDesc:'ฮีลเพื่อนเลือดต่ำและเพิ่ม Energy เล็กน้อย',base:{hp:560,atk:104,def:50,spd:92},ai:'team_heal'},
    {id:'night_harpy',name:'ฮาร์ปี้ราตรี',icon:'🦅',rarity:'Rare',element:'Dark',role:'Ranger',target:'back',skill:'กรงเล็บกลางคืน',skillDesc:'เล็งแถวหลังและมีโอกาส Critical',base:{hp:500,atk:150,def:36,spd:126},ai:'assassin'},
    {id:'blood_piper',name:'นักเป่าขลุ่ยโลหิต',icon:'🎼',rarity:'Rare',element:'Dark',role:'Debuffer',target:'all',skill:'ทำนองโลหิต',skillDesc:'ลด ATK ศัตรูและวาง Curse เบา ๆ',base:{hp:540,atk:108,def:46,spd:94},ai:'curse'},
    {id:'moss_stag',name:'กวางมอสส์เขาดำ',icon:'🦌',rarity:'Rare',element:'Nature',role:'Warrior',target:'front',skill:'ชนเขาดำ',skillDesc:'โจมตีหนักและฟื้น HP เล็กน้อย',base:{hp:675,atk:136,def:64,spd:82},ai:'lifesteal'},
    {id:'dusk_mimic',name:'กล่องเลียนแบบสนธยา',icon:'🎁',rarity:'Rare',element:'Dark',role:'Tank',target:'front',skill:'ฝาปากลวง',skillDesc:'แทงค์แปลก ๆ ที่สวนกลับเมื่อโดนตี',base:{hp:820,atk:90,def:98,spd:55},ai:'tank'},
    {id:'sun_cherub',name:'เครูบสุริยะร่วง',icon:'👼',rarity:'Rare',element:'Light',role:'Support',target:'ally_low',skill:'แสงเย็บแผล',skillDesc:'ฮีลทีมเล็กน้อยและเหมาะต่อสายเซราฟ',base:{hp:560,atk:100,def:54,spd:98},ai:'team_heal'},

    {id:'thorn_colossus',name:'โคโลสซัสหนามดำ',icon:'🌲',rarity:'Epic',element:'Nature',role:'Tank',target:'front',skill:'ป่าหนามกลืนเลือด',skillDesc:'รับดาเมจแทนทีมและสะท้อนดาเมจบางส่วน',base:{hp:1220,atk:105,def:138,spd:44},ai:'guard'},
    {id:'grave_magus',name:'มากัสหลุมศพ',icon:'📜',rarity:'Epic',element:'Dark',role:'Mage',target:'all',skill:'คัมภีร์หลุมศพ',skillDesc:'โจมตีหมู่มืดและลด Energy ศัตรูเล็กน้อย',base:{hp:640,atk:182,def:52,spd:96},ai:'void'},
    {id:'scarlet_succubus',name:'ซัคคิวบัสสีชาด',icon:'💋',rarity:'Epic',element:'Fire',role:'Debuffer',target:'all',skill:'จุมพิตเผาเลือด',skillDesc:'โจมตีหมู่และติด Burn/Curse',base:{hp:650,atk:164,def:54,spd:108},ai:'curse'},
    {id:'drowned_knight',name:'อัศวินจมน้ำ',icon:'⚔️',rarity:'Epic',element:'Water',role:'Warrior',target:'front',skill:'ดาบคลื่นศพ',skillDesc:'โจมตีแรงและสร้างโล่ให้ตัวเอง',base:{hp:860,atk:166,def:78,spd:82},ai:'lifesteal'},
    {id:'eclipse_mantis',name:'ตั๊กแตนคราส',icon:'🦗',rarity:'Epic',element:'Dark',role:'Assassin',target:'back',skill:'เคียวคราส',skillDesc:'ล้วงหลังแรง ถ้าปิดบัญชีได้จะโจมตีต่อ',base:{hp:590,atk:196,def:45,spd:142},ai:'execute'},
    {id:'bone_archon',name:'อาร์คอนกระดูกขาว',icon:'☦️',rarity:'Epic',element:'Light',role:'Support',target:'ally_low',skill:'พิธีโครงแสง',skillDesc:'ฮีลทีม เติม Energy และเพิ่ม DEF เล็กน้อย',base:{hp:690,atk:132,def:66,spd:102},ai:'team_heal'},
    {id:'storm_banshee',name:'แบนชีพายุคร่ำครวญ',icon:'🌪️',rarity:'Epic',element:'Light',role:'Mage',target:'all',skill:'เสียงกรีดพายุ',skillDesc:'โจมตีหมู่ มีโอกาส Stun',base:{hp:620,atk:176,def:48,spd:112},ai:'aoe_stun'},
    {id:'blight_treant',name:'เทรนท์เน่าดำ',icon:'🌳',rarity:'Epic',element:'Nature',role:'Debuffer',target:'all',skill:'ละอองรากเน่า',skillDesc:'วาง Poison ศัตรูทั้งหมดและลด DEF',base:{hp:760,atk:126,def:82,spd:72},ai:'poison'},

    {id:'crimson_minotaur',name:'มิโนทอร์โลหิต',icon:'🐂',rarity:'Legendary',element:'Fire',role:'Warrior',target:'front',skill:'ขวานโลหิตเพลิง',skillDesc:'โจมตีเดี่ยวหนักมากและดูดเลือด',base:{hp:1050,atk:220,def:96,spd:82},ai:'lifesteal'},
    {id:'oracle_of_ashes',name:'โหราเถ้ากระดูก',icon:'🔮',rarity:'Legendary',element:'Fire',role:'Mage',target:'all',skill:'คำพยากรณ์เถ้า',skillDesc:'โจมตีหมู่ไฟ ลด SPD และติด Burn',base:{hp:790,atk:215,def:72,spd:104},ai:'dragon_fire'},
    {id:'basilisk_queen',name:'ราชินีบาซิลิสก์',icon:'🐍',rarity:'Legendary',element:'Nature',role:'Debuffer',target:'all',skill:'เนตรหินมรกต',skillDesc:'ลด DEF/SPD ศัตรูทั้งทีม เหมาะตีบอส',base:{hp:920,atk:176,def:92,spd:98},ai:'curse'},
    {id:'paladin_of_ruin',name:'พาลาดินแห่งซากปรัก',icon:'🛡️',rarity:'Legendary',element:'Light',role:'Tank',target:'front',skill:'โล่คำสาบานพังทลาย',skillDesc:'แทงค์แสง สร้างโล่ทีมและเพิ่ม DEF',base:{hp:1320,atk:142,def:152,spd:70},ai:'guard'},
    {id:'nightmare_stag',name:'กวางฝันร้าย',icon:'🦌',rarity:'Legendary',element:'Dark',role:'Assassin',target:'back',skill:'เขาเสียบฝัน',skillDesc:'พุ่งล้วงหลังและลด Energy เป้าหมาย',base:{hp:760,atk:230,def:70,spd:136},ai:'execute'},

    {id:'leviathan_priestess',name:'นักบวชหญิงเลวีอาธาน',icon:'🌊',rarity:'Mythic',element:'Water',role:'Support',target:'ally_low',skill:'บทสวดมหาสมุทรกลืนแสง',skillDesc:'ฮีลทีมหนัก เติม Energy และสร้างโล่',base:{hp:1120,atk:230,def:112,spd:118},ai:'legend_heal'},
    {id:'gehenna_titan',name:'ไททันเกเฮนนา',icon:'🗿',rarity:'Mythic',element:'Fire',role:'Tank',target:'front',skill:'กำแพงนรกหลอมโลก',skillDesc:'แทงค์ไฟระดับสูง รับดาเมจแทนทีมและเผาศัตรู',base:{hp:1620,atk:230,def:172,spd:76},ai:'guard'},
    {id:'astral_lich',name:'ลิชดาราไร้หลุม',icon:'🌌',rarity:'Mythic',element:'Dark',role:'Mage',target:'all',skill:'สุสานดารา',skillDesc:'โจมตีหมู่มืดหนัก ลด Energy และมีโอกาสทำให้ศัตรูเสียจังหวะ',base:{hp:980,atk:285,def:88,spd:120},ai:'void'},
  ];

  const enemyTemplates = [
    {name:'โจรป่า',icon:'🪓',element:'Nature',role:'Warrior',base:{hp:420,atk:72,def:28,spd:62},ai:'strike'},
    {name:'มือธนูป่า',icon:'🏹',element:'Nature',role:'Ranger',base:{hp:340,atk:82,def:18,spd:78},ai:'double'},
    {name:'นักเลงเกราะ',icon:'🛡️',element:'Water',role:'Tank',base:{hp:620,atk:54,def:58,spd:44},ai:'tank'},
    {name:'หมอผี',icon:'🪬',element:'Dark',role:'Debuffer',base:{hp:390,atk:68,def:24,spd:66},ai:'poison'},
    {name:'งูไฟ',icon:'🐍',element:'Fire',role:'Assassin',base:{hp:360,atk:92,def:20,spd:92},ai:'assassin'},
    {name:'นักเวทเถ้า',icon:'🧙',element:'Fire',role:'Mage',base:{hp:380,atk:96,def:22,spd:70},ai:'aoe_burn'},
    {name:'ภูตน้ำ',icon:'💧',element:'Water',role:'Support',base:{hp:410,atk:70,def:30,spd:74},ai:'heal'},
  ];

  const bossTemplates = [
    {name:'หัวหน้าโจรเขาดำ',icon:'👺',element:'Fire',role:'Warrior',base:{hp:980,atk:118,def:62,spd:70},ai:'lifesteal'},
    {name:'แม่มดหมอกพิษ',icon:'🧛',element:'Dark',role:'Debuffer',base:{hp:880,atk:120,def:50,spd:82},ai:'curse'},
    {name:'โกเลมประตูหิน',icon:'🗿',element:'Nature',role:'Tank',base:{hp:1280,atk:90,def:95,spd:42},ai:'guard'},
    {name:'มังกรอัคคีปลอม',icon:'🐲',element:'Fire',role:'Mage',base:{hp:1050,atk:150,def:62,spd:76},ai:'dragon_fire'},
    {name:'ราชาเงาจันทร์',icon:'👑',element:'Dark',role:'Assassin',base:{hp:1180,atk:170,def:72,spd:100},ai:'execute'},
  ];

  const equipmentTypes = {
    weapon:{label:'อาวุธ',icon:'⚔️',stat:'atk'},
    armor:{label:'เกราะ',icon:'🛡️',stat:'def'},
    charm:{label:'เครื่องราง',icon:'💖',stat:'hp'},
    boots:{label:'รองเท้า',icon:'🥾',stat:'spd'},
  };
  const equipmentRarities = {
    Common:{label:'ขาว',mult:1,score:1},
    Rare:{label:'ฟ้า',mult:1.45,score:2},
    Epic:{label:'ม่วง',mult:2.1,score:3},
    Legendary:{label:'ทอง',mult:3.0,score:4},
  };

  const chapterNames = ['สุสานไร้ชื่อ','ป่ากระดูกดำ','วิหารเลือดเก่า','บึงคำสาป','บัลลังก์อเวจี'];

  // V13: สร้างด่านยาวถึง 3000 ด่าน ยากขึ้นเรื่อย ๆ สำหรับระบบฟาร์มและ Rebirth
  function buildStages(){
    const maxStage = 3000;
    const areas = [
      'สุสานไร้ชื่อ','ป่ากระดูกดำ','วิหารเลือดเก่า','บึงคำสาป','บัลลังก์อเวจี',
      'เหมืองเถ้าปีศาจ','หอคอยจันทร์ดับ','รอยแยกสูญญะ','นครใต้ดิน','ประตูโลกหลังความตาย'
    ];
    const modifierPool = [
      {id:'none',title:'ปกติ',desc:'ไม่มีเงื่อนไขพิเศษ',effects:{}},
      {id:'enemy_rage',title:'Blood Moon',desc:'ศัตรู ATK +12%',effects:{enemyAtk:1.12}},
      {id:'iron_hide',title:'Iron Hide',desc:'ศัตรู DEF +18%',effects:{enemyDef:1.18}},
      {id:'swift_abyss',title:'Swift Abyss',desc:'ศัตรู SPD +16%',effects:{enemySpd:1.16}},
      {id:'thick_mist',title:'Thick Mist',desc:'ศัตรู HP +16%',effects:{enemyHp:1.16}},
      {id:'elite_guard',title:'Elite Guard',desc:'ศัตรู HP +10% / DEF +10%',effects:{enemyHp:1.10,enemyDef:1.10}},
      {id:'berserk_hall',title:'Berserk Hall',desc:'ศัตรู ATK +18% แต่ DEF -6%',effects:{enemyAtk:1.18,enemyDef:0.94}},
    ];
    const bossSkillPool = [
      {id:'blood_regen',title:'Blood Regen',desc:'บอส HP +25% และ DEF +8%',effects:{enemyHp:1.25,enemyDef:1.08}},
      {id:'summoner_aura',title:'Summoner Aura',desc:'ลูกน้องแข็งขึ้น ATK +10%',effects:{minionAtk:1.10,minionHp:1.08}},
      {id:'anti_magic_shell',title:'Anti-Magic Shell',desc:'บอส DEF +20% และ HP +10%',effects:{bossDef:1.20,bossHp:1.10}},
      {id:'curse_wave',title:'Curse Wave',desc:'ศัตรูทั้งทีม ATK +8% / SPD +8%',effects:{enemyAtk:1.08,enemySpd:1.08}},
      {id:'executioner',title:'Executioner',desc:'บอส ATK +22%',effects:{bossAtk:1.22}},
    ];
    const names = ['ปากทาง','โถงต้องสาป','ลานเครื่องสังเวย','ทางเดินเลือด','แท่นผู้คุม','โพรงวิญญาณ','บ่อเงา','ประตูเหล็กดำ','ซากบัลลังก์','รอยแยก'];
    const stages = [];
    for(let i=1;i<=maxStage;i++){
      const chapter = Math.floor((i-1)/10)+1;
      const idx = (i-1) % 10;
      const isBoss = i % 5 === 0 || i === maxStage;
      const isFinal = i === maxStage;
      const enemyCount = isBoss ? 5 : Math.min(5, 1 + Math.floor((i+1)/2));
      const baseScale = 0.82 + i*0.055 + Math.pow(i,1.28)*0.045 + Math.floor(i/50)*0.35;
      const bossScale = isFinal ? 3.2 : (isBoss ? 1.55 + Math.min(1.4, i/1500) : 1);
      const enemyScale = Number((baseScale * bossScale).toFixed(3));
      const power = Math.round(520 * enemyScale * (enemyCount*0.92 + 0.58));
      const area = areas[(chapter-1) % areas.length];
      const title = isFinal
        ? '3000 จักรพรรดิอเวจีไร้สิ้นสุด'
        : `${chapter}-${idx+1} ${isBoss ? 'ผู้คุม' : names[idx]} ${area}`;
      const firstGold = Math.round(95 + i*24 + Math.pow(i,1.18)*10 + (isBoss?i*38:0));
      const repeatGold = Math.round(34 + i*10 + Math.pow(i,1.09)*3 + (isBoss?i*8:0));
      const modifier = modifierPool[(chapter + idx + Math.floor(i/25)) % modifierPool.length];
      const bossSkill = isBoss ? bossSkillPool[(Math.floor(i/5)-1) % bossSkillPool.length] : null;
      stages.push({
        id:i,
        chapter,
        title,
        area,
        isBoss,
        modifier,
        bossSkill,
        enemyCount,
        power,
        enemyScale,
        firstReward:{
          gold:firstGold,
          gems:isBoss ? Math.round(14 + i/10) : Math.max(1, Math.floor(i/18)),
          tickets:isBoss ? (i%50===0 ? 2 : 1) : 0,
          dust:Math.round(16 + i*3.2 + (isBoss?i*2.4:0)),
        },
        repeatReward:{
          gold:repeatGold,
          gems:isBoss ? Math.max(1, Math.floor(i/80)) : 0,
          tickets:0,
          dust:Math.round(5 + i*0.9 + (isBoss?i*0.8:0)),
        },
      });
    }
    return stages;
  }

  const dailyQuests = [
    {id:'win5',title:'ชนะ 5 ครั้ง',desc:'สู้ชนะรวม 5 ครั้งในวันนี้',need:5,field:'wins',reward:{gold:450,gems:45,tickets:1}},
    {id:'gacha3',title:'เปิดกาชา 3 ครั้ง',desc:'ใช้ Ticket หรือ Gem เปิดกาชา',need:3,field:'gachas',reward:{gold:300,dust:45,gems:25}},
    {id:'upgrade8',title:'อัปเกรด 8 ครั้ง',desc:'อัปเลเวลหรืออัปดาวตัวละคร',need:8,field:'upgrades',reward:{gold:420,gems:30,dust:70}},
    {id:'boss1',title:'ล้มผู้คุมประตู 1 ครั้ง',desc:'ชนะด่านบอสที่ลงท้ายด้วย 5 หรือ 10',need:1,field:'bossWins',reward:{gems:75,tickets:1,dust:90}},
  ];


  const achievements = [
    {id:'stage10',title:'ผ่านด่าน 10',desc:'เคลียร์ด่าน 10 ครั้งแรก',check:'stage',need:10,reward:{gems:80,tickets:1,dust:120}},
    {id:'stage50',title:'ผ่านด่าน 50',desc:'เริ่มเข้าสู่โซนฟาร์มจริง',check:'stage',need:50,reward:{gems:220,tickets:2,dust:380}},
    {id:'stage100',title:'ผ่านด่าน 100',desc:'ชนะผู้คุมร้อยชั้น',check:'stage',need:100,reward:{gems:500,tickets:5,dust:900}},
    {id:'win100',title:'ชนะรวม 100 ครั้ง',desc:'ฟาร์มชนะสะสม',check:'wins',need:100,reward:{gold:18000,gems:180,tickets:2}},
    {id:'fusion10',title:'ผสมปีศาจ 10 ครั้ง',desc:'ใช้ระบบ Fusion สะสม',check:'fusions',need:10,reward:{dust:700,gems:120,tickets:1}},
    {id:'collect20',title:'สะสมปีศาจ 20 ตัว',desc:'มีปีศาจใน Codex อย่างน้อย 20 ตัว',check:'codexTotal',need:20,reward:{gems:180,tickets:2,dust:300}},
    {id:'legend1',title:'ได้ Legendary ตัวแรก',desc:'มีปีศาจระดับ Legendary อย่างน้อย 1 ตัว',check:'rarity',rarity:'Legendary',need:1,reward:{gems:250,tickets:3}},
    {id:'mythic1',title:'ได้ Mythic ตัวแรก',desc:'มีปีศาจระดับ Mythic อย่างน้อย 1 ตัว',check:'rarity',rarity:'Mythic',need:1,reward:{gems:600,tickets:5,dust:1200}},
    {id:'ssr1',title:'พบ SSR ตัวแรก',desc:'ได้ปีศาจ SSR ระดับลับ',check:'rarity',rarity:'SSR',need:1,reward:{gems:5000,tickets:25,dust:8000}},
    {id:'rebirth1',title:'Rebirth ครั้งแรก',desc:'กด Rebirth ให้ปีศาจตัวแรก',check:'rebirths',need:1,reward:{gold:30000,dust:1000,gems:200}},
    {id:'rebirth10',title:'Rebirth รวม 10 ครั้ง',desc:'วนเกิดใหม่เพื่อไต่ด่านลึก',check:'rebirths',need:10,reward:{gold:120000,dust:4200,gems:700,tickets:5}},
  ];

  const shopItems = [
    {id:'ticket_pack',title:'Ticket Pack',desc:'ซื้อ Ticket 5 ใบ ใช้เปิดกาชา',cost:{gems:450},kind:'resource',reward:{tickets:5}},
    {id:'dust_cache',title:'Dust Cache',desc:'เปลี่ยน Gold เป็น Dust สำหรับ Fusion/Rebirth',cost:{gold:6000},kind:'resource',reward:{dust:520}},
    {id:'gold_cache',title:'Gold Cache',desc:'เปลี่ยน Gem เป็น Gold สำหรับอัปเลเวล',cost:{gems:120},kind:'resource',reward:{gold:16000}},
    {id:'random_shards',title:'Random Shard Box',desc:'สุ่ม Shard ให้ปีศาจที่มีอยู่ 1 ตัว',cost:{dust:380},kind:'shard',amount:22},
    {id:'gear_box',title:'Abyss Gear Box',desc:'สุ่มอุปกรณ์ตามด่านสูงสุดที่เคลียร์',cost:{gems:160},kind:'gear'},
    {id:'rebirth_supply',title:'Rebirth Supply',desc:'ชุดทรัพยากรสำหรับเตรียม Rebirth',cost:{gems:380},kind:'resource',reward:{gold:42000,dust:900}},
    {id:'ssr_shard_pack',title:'SSR Shard Pack',desc:'แพงมาก แต่เป็นทางสะสม SSR ระยะยาว',cost:{gems:2200,dust:5000},kind:'resource',reward:{ssrShards:5}},
    {id:'ssr_fragment_box',title:'Abyss Fragment Box',desc:'แลก Ticket จำนวนมากเป็น SSR Shard เล็กน้อย',cost:{tickets:180},kind:'resource',reward:{ssrShards:2}},
  ];

  const codexRewards = [
    {id:'codex_common10',title:'Common 10 ตัว',rarity:'Common',need:10,reward:{gold:8000,dust:250}},
    {id:'codex_rare10',title:'Rare 10 ตัว',rarity:'Rare',need:10,reward:{gems:160,tickets:1,dust:320}},
    {id:'codex_epic5',title:'Epic 5 ตัว',rarity:'Epic',need:5,reward:{gems:260,tickets:2,dust:600}},
    {id:'codex_legend3',title:'Legendary 3 ตัว',rarity:'Legendary',need:3,reward:{gems:520,tickets:4,dust:1200}},
    {id:'codex_mythic2',title:'Mythic 2 ตัว',rarity:'Mythic',need:2,reward:{gems:1000,tickets:8,dust:2600}},
    {id:'codex_ssr1',title:'SSR 1 ตัว',rarity:'SSR',need:1,reward:{gems:6000,tickets:30,dust:10000}},
  ];


  const loginRewards7 = [
    {day:1,title:'วันแรกของวัฏจักร',desc:'เข้าเกมประจำวัน',reward:{tickets:200,gold:8000}},
    {day:2,title:'เสบียงนักอัญเชิญ',desc:'Ticket + Dust',reward:{tickets:200,dust:900}},
    {day:3,title:'คลังทองอเวจี',desc:'Ticket + Gold',reward:{tickets:200,gold:28000}},
    {day:4,title:'กล่องอุปกรณ์',desc:'Ticket + Gem',reward:{tickets:200,gems:320}},
    {day:5,title:'เถ้าผสมปีศาจ',desc:'Ticket + Dust ก้อนใหญ่',reward:{tickets:200,dust:2200}},
    {day:6,title:'ตราผู้ฟาร์ม',desc:'Ticket + Gem',reward:{tickets:200,gems:650}},
    {day:7,title:'เศษวิญญาณ SSR',desc:'Ticket + SSR Shard',reward:{tickets:200,ssrShards:10,gems:900}},
  ];

  const dungeons = [
    {id:'gold',icon:'🪙',title:'Gold Dungeon',desc:'ฟาร์ม Gold สำหรับอัปเลเวล',runsPerDay:3,kind:'gold',element:'Dark',role:'Warrior',powerMul:.88},
    {id:'dust',icon:'✨',title:'Dust Dungeon',desc:'ฟาร์ม Dust สำหรับผสม/อัปดาว/Rebirth',runsPerDay:3,kind:'dust',element:'Nature',role:'Debuffer',powerMul:.96},
    {id:'ticket',icon:'🎟️',title:'Ticket Dungeon',desc:'ฟาร์ม Ticket เพิ่มสำหรับกาชา',runsPerDay:2,kind:'tickets',element:'Light',role:'Assassin',powerMul:1.08},
    {id:'shard',icon:'🧩',title:'Shard Dungeon',desc:'สุ่ม Shard ให้ปีศาจที่มีอยู่',runsPerDay:3,kind:'shard',element:'Water',role:'Support',powerMul:1.02},
    {id:'gear',icon:'🧰',title:'Gear Dungeon',desc:'ฟาร์มอุปกรณ์และ Gear Set',runsPerDay:3,kind:'gear',element:'Fire',role:'Tank',powerMul:1.05},
    {id:'ssr',icon:'💠',title:'Abyss Rift',desc:'ดันเจี้ยนยากมาก มีโอกาสได้ SSR Shard',runsPerDay:1,kind:'ssrShards',element:'Dark',role:'Mage',powerMul:1.35},
  ];

  const formationBonuses = [
    {id:'frontline',title:'มี Tank 1 ตัว',desc:'HP ทีม +10%',check:{role:'Tank',need:1},stats:{hp:1.10}},
    {id:'healer',title:'มี Support 1 ตัว',desc:'ฮีลแรงขึ้นและ HP +4%',check:{role:'Support',need:1},stats:{hp:1.04},heal:1.12},
    {id:'mage2',title:'Mage 2 ตัว',desc:'ATK ทีม +8%',check:{role:'Mage',need:2},stats:{atk:1.08}},
    {id:'assassin2',title:'Assassin 2 ตัว',desc:'SPD ทีม +8%',check:{role:'Assassin',need:2},stats:{spd:1.08}},
    {id:'sameElement3',title:'ธาตุเดียวกัน 3 ตัว',desc:'ATK/DEF +6%',check:{sameElement:3},stats:{atk:1.06,def:1.06}},
    {id:'rainbow5',title:'ครบ 5 ธาตุ',desc:'SPD +10% / HP +5%',check:{uniqueElements:5},stats:{spd:1.10,hp:1.05}},
  ];

  const passiveDefs = {
    bulwark:{title:'Bulwark',desc:'เริ่มไฟต์ได้ Shield เล็กน้อย',effects:{startShield:.10}},
    blood_hunt:{title:'Blood Hunt',desc:'Critical เพิ่ม และโจมตีตัวเลือดต่ำแรงขึ้น',effects:{crit:.08,executeBonus:.08}},
    arcane_start:{title:'Arcane Start',desc:'เริ่มไฟต์ Energy +18',effects:{startEnergy:18}},
    soothing_aura:{title:'Soothing Aura',desc:'ฮีลแรงขึ้น 12%',effects:{healPower:1.12}},
    war_cry:{title:'War Cry',desc:'ATK ตัวเอง +6%',effects:{atk:1.06}},
    venom_mark:{title:'Venom Mark',desc:'ดาเมจใส่ศัตรูติดพิษ/คำสาปแรงขึ้น',effects:{statusDamage:1.12}},
    ranger_focus:{title:'Ranger Focus',desc:'SPD +6% และ Critical +4%',effects:{spd:1.06,crit:.04}},
    ssr_dominion:{title:'SSR Dominion',desc:'ค่าสถานะทุกอย่าง +12% และเริ่ม Energy สูง',effects:{hp:1.12,atk:1.12,def:1.12,spd:1.08,startEnergy:25,crit:.05}},
  };

  function inferPassive(h){
    if(h.rarity === 'SSR') return 'ssr_dominion';
    if(h.role === 'Tank') return 'bulwark';
    if(h.role === 'Support') return 'soothing_aura';
    if(h.role === 'Mage') return 'arcane_start';
    if(h.role === 'Assassin') return 'blood_hunt';
    if(h.role === 'Ranger') return 'ranger_focus';
    if(h.role === 'Debuffer') return 'venom_mark';
    return 'war_cry';
  }
  heroes.forEach(h=>{ h.passive ||= inferPassive(h); });

  const gearSets = {
    Blood:{icon:'🩸',title:'Blood Set',two:'ATK +8%',four:'ATK +12% / HP +8%',stats2:{atk:1.08},stats4:{atk:1.12,hp:1.08}},
    Grave:{icon:'🪦',title:'Grave Set',two:'DEF +10%',four:'DEF +14% / HP +10%',stats2:{def:1.10},stats4:{def:1.14,hp:1.10}},
    Witch:{icon:'🕯️',title:'Witch Set',two:'ATK +6% / SPD +4%',four:'ATK +12% / SPD +8%',stats2:{atk:1.06,spd:1.04},stats4:{atk:1.12,spd:1.08}},
    Storm:{icon:'⚡',title:'Storm Set',two:'SPD +8%',four:'SPD +14% / ATK +6%',stats2:{spd:1.08},stats4:{spd:1.14,atk:1.06}},
    Void:{icon:'🕳️',title:'Void Set',two:'HP +6% / ATK +6%',four:'HP +12% / ATK +12%',stats2:{hp:1.06,atk:1.06},stats4:{hp:1.12,atk:1.12}},
  };

  // V9: ตำรา Fusion แบบระบุคู่ ช่วยให้ผสมได้มากขึ้นและเดาทางได้
  const fusionRecipes = [
    {id:'f01',from:['iron_fist','village_archer'],result:'river_guard',title:'โล่ธนูวารี',note:'ได้แทงค์น้ำสำหรับยืนหน้า'},
    {id:'f02',from:['wandering_sword','ash_imp'],result:'fire_taoist',title:'ประกายกระบี่ไฟ',note:'ได้เมจไฟวาง Burn หมู่'},
    {id:'f03',from:['herb_healer','pond_sprite'],result:'tide_oracle',title:'พิธีน้ำเยียวยา',note:'อัปสายฮีลเป็น Support ทีม'},
    {id:'f04',from:['bone_rat','shadow_thief'],result:'grave_hound',title:'นักล่าในสุสาน',note:'สายล้วงหลังเร็วขึ้น'},
    {id:'f05',from:['thornling','briar_witch'],result:'verdant_chimera',title:'เขี้ยวมรกต',note:'ได้ Warrior ธรรมชาติดูดเลือด'},
    {id:'f06',from:['candle_wisp','spark_monk'],result:'thunder_sage',title:'อสนีเทียนวิญญาณ',note:'ได้เมจแสงโจมตีหมู่'},
    {id:'f07',from:['poison_doctor','briar_witch'],result:'plague_nun',title:'ภาวนาโรคระบาด',note:'Support มืดสำหรับไฟต์ยาว'},
    {id:'f08',from:['ash_imp','rust_guard'],result:'magma_brute',title:'ร่างแมกมาสนิม',note:'ได้แทงค์ไฟที่ทนขึ้น'},
    {id:'f09',from:['frost_acolyte','pond_sprite'],result:'moon_priest',title:'จันทร์เหนือผืนน้ำ',note:'ฮีลแสง/เติม Energy'},
    {id:'f10',from:['grave_hound','poison_doctor'],result:'dusk_reaper',title:'ยมทูตกลิ่นพิษ',note:'Assassin ปิดงานได้ดี'},
    {id:'f11',from:['river_guard','frost_acolyte'],result:'frost_leviathan',title:'ทะเลน้ำแข็ง',note:'Legendary Tank สายน้ำ'},
    {id:'f12',from:['sun_squire','moon_priest'],result:'seraph_inquisitor',title:'คำพิพากษาสุริยะ',note:'Warrior แสงพร้อมบัฟทีม'},
    {id:'f13',from:['plague_nun','abyss_lord'],result:'necro_mandrake',title:'รากสุสานกรีดร้อง',note:'Debuffer มืดระดับสูง'},
    {id:'f14',from:['fire_taoist','magma_brute'],result:'ash_phoenix',title:'ฟีนิกซ์เถ้าดำ',note:'ฮีลไฟระดับ Legendary'},
    {id:'f15',from:['eclipse_oni','blood_blade'],result:'abyss_lord',title:'โอนิเลือดลึก',note:'Debuffer มืดใช้งานง่าย'},
    {id:'f16',from:['shadow_thief','dusk_reaper'],result:'celestial_sword',title:'หนึ่งกระบี่ไร้เงา',note:'Mythic Assassin ล้วงหลัง'},
    {id:'f17',from:['seraph_inquisitor','void_emperor'],result:'abyss_seraph',title:'สวรรค์กลับด้าน',note:'Mythic Mage ลด Energy'},
    {id:'f18',from:['stone_golem','verdant_chimera'],result:'worldroot_hydra',title:'รากโลกตื่น',note:'Mythic Tank ธรรมชาติ'},
    {id:'f19',from:['jade_general','sun_squire'],result:'seraph_inquisitor',title:'กองทัพแสงหยก',note:'สายบัฟทีม Legendary'},
    {id:'f20',from:['abyss_lord','eclipse_oni'],result:'void_emperor',title:'ราชาห้วงว่าง',note:'Mythic Mage มืดโจมตีหมู่'},

    // V22: สูตรผสมเพิ่ม 40 รายการ เน้นหลายทอดและเป้าหมายระยะยาว
    {id:'f21',from:['rot_rat','bone_pup'],result:'grave_hound',title:'ลูกหมาเงาจากซากเน่า',note:'สูตรต้นเกมสำหรับเปิดสายหมาเงา'},
    {id:'f22',from:['rot_rat','grave_crow'],result:'bone_rat',title:'ฝูงหนูใต้อีกา',note:'ได้ตัวเร็วสายมืดไว้เป็นวัตถุดิบต่อ'},
    {id:'f23',from:['grave_crow','shadow_thief'],result:'dusk_reaper',title:'เงาปีกยมทูต',note:'อัปสายล้วงหลังเป็นตัวปิดงาน'},
    {id:'f24',from:['mire_slime','thornling'],result:'moss_ogre',title:'บึงมอสส์มีชีวิต',note:'ได้แทงค์ธรรมชาติระดับ Rare'},
    {id:'f25',from:['ember_larva','ash_imp'],result:'fire_taoist',title:'อิมป์กลืนตัวอ่อนเถ้า',note:'เปิดสายเวทไฟ Burn หมู่'},
    {id:'f26',from:['ember_larva','rust_guard'],result:'magma_brute',title:'เกราะสนิมหลอมไฟ',note:'ต่อยอดเป็นแทงค์ไฟ Epic'},
    {id:'f27',from:['moon_moth','candle_wisp'],result:'silver_acolyte',title:'แมลงจันทร์ใต้ตะเกียง',note:'ได้เมจแสง Rare สำหรับล่าธาตุมืด'},
    {id:'f28',from:['moon_moth','spark_monk'],result:'thunder_sage',title:'ปีกจันทร์นำอสนี',note:'ผสมเป็นเมจแสงโจมตีหมู่'},
    {id:'f29',from:['carrion_squire','sun_squire'],result:'hollow_knight',title:'อัศวินสองคำสาบาน',note:'สายแทงค์มืด Legendary'},
    {id:'f30',from:['carrion_squire','bone_pup'],result:'grave_hound',title:'หมาเฝ้าหลุมศพ',note:'สูตรสำรองสำหรับ Grave Hound'},
    {id:'f31',from:['blood_leech','herb_healer'],result:'blood_blade',title:'เลือดกับยาสมาน',note:'เปลี่ยนสายฮีลอ่อนเป็น Warrior ดูดเลือด'},
    {id:'f32',from:['drowned_bride','pond_sprite'],result:'tide_oracle',title:'เจ้าสาวแห่งคำทำนายน้ำ',note:'Support น้ำสำหรับทีมฟาร์ม'},
    {id:'f33',from:['lantern_jack','ash_imp'],result:'witch_lantern',title:'ตะเกียงแม่มดจุดไฟ',note:'เมจไฟ Epic สำหรับกวาดลูกน้อง'},
    {id:'f34',from:['moss_ogre','stone_golem'],result:'verdant_chimera',title:'กายหินกินรากไม้',note:'Warrior ธรรมชาติที่ยืนได้นาน'},
    {id:'f35',from:['silver_acolyte','moon_priest'],result:'seraph_inquisitor',title:'ศาลแสงเงิน',note:'Legendary สายบัฟแสง'},
    {id:'f36',from:['crypt_butcher','blood_blade'],result:'blood_moon_beast',title:'เขียงใต้จันทร์เลือด',note:'เปิดสาย Blood Moon ระยะยาว'},
    {id:'f37',from:['mirror_fiend','candle_wisp'],result:'hollow_knight',title:'เกราะในกระจกเทียน',note:'ได้แทงค์มืด Legendary แบบทางเลือก'},
    {id:'f38',from:['frost_revenant','frost_acolyte'],result:'frost_leviathan',title:'วิญญาณเยือกแข็งลงทะเล',note:'แทงค์น้ำแข็งระดับ Legendary'},
    {id:'f39',from:['plague_doctor','poison_doctor'],result:'plague_nun',title:'โรงพยาบาลสุสาน',note:'Support มืดสายพิษ/ทีมยืน'},
    {id:'f40',from:['sunless_monk','moon_priest'],result:'sun_lotus',title:'บัวแสงไร้ตะวัน',note:'ฮีลแสง Legendary'},
    {id:'f41',from:['hellhound','fire_taoist'],result:'flame_dragonling',title:'เขี้ยวไฟเรียกมังกร',note:'ต่อสายไฟเป็น Legendary Mage'},
    {id:'f42',from:['witch_lantern','abyss_lord'],result:'necro_mandrake',title:'ตะเกียงเรียกรากสุสาน',note:'Debuffer มืดระดับสูง'},
    {id:'f43',from:['grave_hound','hellhound'],result:'blood_moon_beast',title:'หมาเงากลืนไฟนรก',note:'อัปสายหมาเป็นอสูรจันทร์เลือด'},
    {id:'f44',from:['blood_moon_beast','ash_phoenix'],result:'blood_moon_drake',title:'เดรกเกิดจากจันทร์เลือด',note:'Mythic สายโจมตีหมู่/ลด Energy'},
    {id:'f45',from:['hollow_knight','eclipse_oni'],result:'abyss_chimera',title:'หน้ากากคราสในเกราะกลวง',note:'Legendary ธรรมชาติสายบู๊ทน'},
    {id:'f46',from:['grave_seraph','seraph_inquisitor'],result:'abyss_seraph',title:'ปีกพิพากษากลับด้าน',note:'Mythic Mage แสงลดจังหวะศัตรู'},
    {id:'f47',from:['abyss_chimera','worldroot_hydra'],result:'mother_of_ash',title:'รากโลกในครรภ์เถ้า',note:'Mythic Support สำหรับฟาร์มบอสยาว'},
    {id:'f48',from:['mother_of_ash','blood_moon_drake'],result:'void_emperor',title:'เถ้าเลือดเปิดสูญญะ',note:'ทางลัดสู่ Void Emperor ถ้ามีวัตถุดิบหนัก'},
    {id:'f49',from:['drowned_bride','moon_moth'],result:'moon_priest',title:'ม่านน้ำใต้จันทร์',note:'ได้ Support แสงเติม Energy'},
    {id:'f50',from:['lantern_jack','candle_wisp'],result:'spark_monk',title:'ตะเกียงปลุกประกายอสนี',note:'เมจแสง Rare สำหรับต่อสายสายฟ้า'},
    {id:'f51',from:['mire_slime','river_guard'],result:'frost_acolyte',title:'วารีในบึงเยือกแข็ง',note:'เปลี่ยนแทงค์น้ำเป็นเมจน้ำแข็ง'},
    {id:'f52',from:['bone_pup','bone_rat'],result:'grave_hound',title:'ฝูงกระดูกล่ากลิ่น',note:'สูตร Grave Hound แบบใช้ตัวมืดเร็ว'},
    {id:'f53',from:['grave_crow','dusk_reaper'],result:'hollow_knight',title:'ปีกอีกาบนเกราะว่าง',note:'ทางเลือกสู่อัศวินกลวงเปล่า'},
    {id:'f54',from:['crypt_butcher','verdant_chimera'],result:'abyss_chimera',title:'คิเมร่ากินเขียงสุสาน',note:'สาย Chimera หลายทอด'},
    {id:'f55',from:['mirror_fiend','void_emperor'],result:'abyss_seraph',title:'กระจกสูญญะสะท้อนสวรรค์',note:'สูตร Mythic แลกเปลี่ยนสาย'},
    {id:'f56',from:['frost_revenant','tide_oracle'],result:'frost_leviathan',title:'คำทำนายทะเลน้ำแข็ง',note:'แทงค์น้ำแข็งสำหรับบอสกายภาพ'},
    {id:'f57',from:['plague_doctor','plague_nun'],result:'necro_mandrake',title:'ภาวนาแพทย์โรค',note:'พิษ/คำสาประดับ Legendary'},
    {id:'f58',from:['sunless_monk','seraph_inquisitor'],result:'grave_seraph',title:'เซราฟไร้ตะวัน',note:'ฮีลทีมระดับ Legendary'},
    {id:'f59',from:['witch_lantern','ash_phoenix'],result:'mother_of_ash',title:'ฟีนิกซ์ในตะเกียงแม่มด',note:'สาย Support Mythic ไฟ'},
    {id:'f60',from:['blood_moon_drake','abyss_seraph'],result:'celestial_sword',title:'คราสเลือดตัดปีกอเวจี',note:'สูตรแลก Mythic เป็นตัวล้วงหลังระดับสูง'},


    // V39: สูตร Fusion ใหม่ 40 รายการ เชื่อมมอนสเตอร์ V39 เข้ากับสายวิวัฒนาการเดิม
    {id:'f61',from:['grave_mite','soot_bat'],result:'night_harpy',title:'ปีกสุสานเขม่าดำ',note:'เปิดสาย Harpy จาก Common สองตัว'},
    {id:'f62',from:['bog_toad','moss_skull'],result:'moss_stag',title:'เขากวางจากบึงมอสส์',note:'Rare ธรรมชาติยืนหน้าได้ดี'},
    {id:'f63',from:['pale_lamb','candle_wisp'],result:'sun_cherub',title:'ลูกแกะใต้เทียนแสง',note:'ต่อสาย Support แสง'},
    {id:'f64',from:['ember_sprite','ash_imp'],result:'ashen_warlock',title:'ภูตเพลิงปลุกวอร์ล็อก',note:'Rare Mage ไฟสำหรับฟาร์มต้นเกม'},
    {id:'f65',from:['drowned_candle','pond_sprite'],result:'kelp_siren',title:'เพลงเทียนจมน้ำ',note:'Rare Support น้ำ'},
    {id:'f66',from:['void_tick','bone_rat'],result:'dusk_mimic',title:'กล่องว่างกินหนูกระดูก',note:'Rare Tank มืดสายแปลก'},
    {id:'f67',from:['soot_bat','grave_crow'],result:'night_harpy',title:'ฝูงปีกกลางคืน',note:'อีกสูตรเพื่อสร้าง Night Harpy'},
    {id:'f68',from:['moss_skull','thornling'],result:'marrow_guard',title:'ไขกระดูกในหนามมอสส์',note:'Rare Tank ธรรมชาติ'},
    {id:'f69',from:['blood_leech','void_tick'],result:'blood_piper',title:'เห็บสูญญะเป่าขลุ่ยเลือด',note:'Rare Debuffer มืด'},
    {id:'f70',from:['pale_lamb','sun_squire'],result:'sun_cherub',title:'คำสาบานลูกแกะซีด',note:'สูตรแสงต้นเกม'},
    {id:'f71',from:['night_harpy','grave_hound'],result:'eclipse_mantis',title:'ปีกหมาเงาใต้คราส',note:'Epic Assassin ล้วงหลัง'},
    {id:'f72',from:['ashen_warlock','fire_taoist'],result:'scarlet_succubus',title:'แม่มดไฟสีชาด',note:'Epic Debuffer ไฟ'},
    {id:'f73',from:['kelp_siren','frost_acolyte'],result:'drowned_knight',title:'อัศวินจากเพลงน้ำแข็ง',note:'Epic Warrior น้ำ'},
    {id:'f74',from:['moss_stag','briar_witch'],result:'blight_treant',title:'กวางมอสส์ในสวนพิษ',note:'Epic Poison ธรรมชาติ'},
    {id:'f75',from:['marrow_guard','stone_golem'],result:'thorn_colossus',title:'โคโลสซัสไขกระดูกหิน',note:'Epic Tank ธรรมชาติ'},
    {id:'f76',from:['dusk_mimic','mirror_fiend'],result:'grave_magus',title:'คัมภีร์ในกล่องกระจก',note:'Epic Mage มืด'},
    {id:'f77',from:['blood_piper','plague_doctor'],result:'scarlet_succubus',title:'เพลงโลหิตโรคระบาด',note:'Epic Fire/Debuff ทางเลือก'},
    {id:'f78',from:['sun_cherub','moon_priest'],result:'bone_archon',title:'อาร์คอนใต้จันทร์สุริยะ',note:'Epic Support แสง'},
    {id:'f79',from:['storm_banshee','thunder_sage'],result:'oracle_of_ashes',title:'พายุครวญทำนายเถ้า',note:'Legendary Mage ไฟ'},
    {id:'f80',from:['drowned_knight','frost_leviathan'],result:'leviathan_priestess',title:'คำสวดใต้ทะเลเยือก',note:'Mythic Support น้ำ'},
    {id:'f81',from:['eclipse_mantis','dusk_reaper'],result:'nightmare_stag',title:'เคียวคราสตัดฝันร้าย',note:'Legendary Assassin มืด'},
    {id:'f82',from:['thorn_colossus','worldroot_hydra'],result:'basilisk_queen',title:'ราชินีรากโลกเนตรหิน',note:'Legendary Debuffer ธรรมชาติ'},
    {id:'f83',from:['grave_magus','abyss_lord'],result:'astral_lich',title:'มากัสหลุมศพเปิดดาราสูญ',note:'Mythic Mage มืด'},
    {id:'f84',from:['scarlet_succubus','blood_blade'],result:'crimson_minotaur',title:'ขวานโลหิตสีชาด',note:'Legendary Warrior ไฟ'},
    {id:'f85',from:['bone_archon','seraph_inquisitor'],result:'paladin_of_ruin',title:'พาลาดินซากโครงแสง',note:'Legendary Tank แสง'},
    {id:'f86',from:['blight_treant','necro_mandrake'],result:'basilisk_queen',title:'รากเน่าเรียกเนตรหิน',note:'อีกทางสู่ Basilisk Queen'},
    {id:'f87',from:['crimson_minotaur','flame_dragonling'],result:'gehenna_titan',title:'เขาโลหิตปลุกไททันนรก',note:'Mythic Tank ไฟ'},
    {id:'f88',from:['basilisk_queen','necro_mandrake'],result:'mother_of_ash',title:'รากกรีดร้องใต้เนตรมรกต',note:'Mythic Support/ฟาร์มบอส'},
    {id:'f89',from:['paladin_of_ruin','abyss_seraph'],result:'grave_seraph',title:'คำสาบานซากปีกอเวจี',note:'Legendary/เส้นทางเซราฟ'},
    {id:'f90',from:['nightmare_stag','void_emperor'],result:'ssr_void_saint',title:'กวางฝันร้ายเปิดนักบุญสูญญะ',note:'สูตรลับ SSR ใช้วัตถุดิบหนักมาก'},
    {id:'f91',from:['gehenna_titan','ash_phoenix'],result:'ssr_inferno_leviathan',title:'ไททันนรกกลืนฟีนิกซ์',note:'สูตรลับ SSR แทงค์ไฟ'},
    {id:'f92',from:['leviathan_priestess','abyss_seraph'],result:'ssr_mirror_empress',title:'มหาสมุทรสะท้อนปีกอเวจี',note:'สูตรลับ SSR สายน้ำ'},
    {id:'f93',from:['paladin_of_ruin','celestial_sword'],result:'ssr_golden_reaper',title:'กระบี่ฟ้าตัดซากพาลาดิน',note:'สูตรลับ SSR Assassin'},
    {id:'f94',from:['mother_of_ash','leviathan_priestess'],result:'ssr_abyssal_mother',title:'มารดาเถ้าใต้ทะเลลึก',note:'สูตรลับ SSR Support'},
    {id:'f95',from:['grave_mite','rot_rat'],result:'bone_rat',title:'หนูไรใต้สุสาน',note:'สูตร Common ไป Rare/วัตถุดิบมืด'},
    {id:'f96',from:['bog_toad','mire_slime'],result:'moss_ogre',title:'อสูรมอสส์จากเมือกบึง',note:'Rare Tank ธรรมชาติ'},
    {id:'f97',from:['ember_sprite','ember_larva'],result:'hellhound',title:'ประกายไฟเรียกหมานรก',note:'ต่อสายหมาไฟ'},
    {id:'f98',from:['drowned_candle','drowned_bride'],result:'tide_oracle',title:'เทียนเจ้าสาวพยากรณ์คลื่น',note:'Epic Support น้ำ'},
    {id:'f99',from:['pale_lamb','sunless_monk'],result:'sun_lotus',title:'ลูกแกะไร้แสงในบัวสุริยัน',note:'Legendary Healer แสง'},
    {id:'f100',from:['void_tick','void_emperor'],result:'astral_lich',title:'เห็บสูญญะกลืนจักรพรรดิ',note:'ทางเสี่ยงสู่ Lich ดารา'},
  ];

  return { 
    rarities, 
    elements, 
    roles, 
    heroes, 
    enemyTemplates, 
    bossTemplates, 
    equipmentTypes, 
    equipmentRarities, 
    gearSets, 
    stages:buildStages(), 
    dungeons, 
    formationBonuses, 
    passiveDefs, 
    loginRewards7, 
    dailyQuests, 
    achievements, 
    shopItems, 
    codexRewards, 
    fusionRecipes,
    getElementRelation: (att, def) => {
      if(att === def) return 'neutral';
      const e = elements[att];
      if(!e) return 'neutral';
      if(e.strong === def) return 'strong';
      if(e.weak === def) return 'weak';
      return 'neutral';
    },
    getElementIcon: (el) => elements[el]?.icon || '⚪',
    getElementLabel: (el) => elements[el]?.label || el
  };
})();
