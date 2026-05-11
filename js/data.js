window.GameData = (() => {
  const rarities = {
    Common: { label: 'Common', mult: 1.00, shard: 6, rate: 58 },
    Rare: { label: 'Rare', mult: 1.16, shard: 10, rate: 30 },
    Epic: { label: 'Epic', mult: 1.38, shard: 18, rate: 9 },
    Legendary: { label: 'Legendary', mult: 1.68, shard: 30, rate: 2.7 },
    Mythic: { label: 'Mythic', mult: 2.05, shard: 50, rate: 0.3 },
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
      stages.push({
        id:i,
        chapter,
        title,
        area,
        isBoss,
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
  ];

  return { rarities, elements, roles, heroes, enemyTemplates, bossTemplates, equipmentTypes, equipmentRarities, stages:buildStages(), dailyQuests, fusionRecipes };
})();
