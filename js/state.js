window.GameState = (() => {
  const KEY = 'abyss_grimoire_v23_save';
  const OLD_KEYS = ['abyss_grimoire_v22_save','abyss_grimoire_v21_save','abyss_grimoire_v20_save','abyss_grimoire_v19_save','abyss_grimoire_v18_save','abyss_grimoire_v17_save','abyss_grimoire_v16_save','abyss_grimoire_v15_save','abyss_grimoire_v14_save','abyss_grimoire_v13_save','abyss_grimoire_v12_save','abyss_grimoire_v11_save'];
  const G = () => window.GameData;
  let state = null;

  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function uid(){ return 'i' + Math.random().toString(36).slice(2,10) + Date.now().toString(36).slice(-4); }
  function clone(x){ return JSON.parse(JSON.stringify(x)); }
  function encodeText(str){
    return btoa(unescape(encodeURIComponent(str)));
  }
  function decodeText(str){
    return decodeURIComponent(escape(atob(str)));
  }
  function fmt(n){ return Math.floor(n).toLocaleString('th-TH'); }

  function defaultState(){
    const now = Date.now();
    const starterPool = G().heroes.filter(h => ['Common','Rare'].includes(h.rarity));
    const starter = starterPool[Math.floor(Math.random() * starterPool.length)] || G().heroes[0];
    const s = {
      version:23,
      screen:'home',
      resources:{gold:420,gems:180,tickets:1,dust:60},
      campaign:{selected:1,unlocked:1,highestCleared:0,clears:{}},
      roster:{},
      team:[starter.id,null,null,null,null],
      inventory:[],
      gacha:{rolls:0,epicPity:0,legendPity:0,lastResults:[]},
      daily:{date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,claimed:{}},
      stats:{totalWins:0,totalLosses:0,totalGachas:0,totalUpgrades:0},
      idle:{last:now},
      settings:{battleSpeed:1,heroFilter:'all',heroSort:'power'},
      favorites:{},
      codex:{seen:{}},
      lastBattle:null,
      fusion:{selected:[],last:null},
      starter:{freeRollsLeft:5,firstHero:starter.id,history:[starter.id]},
      flags:{seenIntro:false}
    };
    s.roster[starter.id] = {id:starter.id,level:1,stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
    s.codex.seen[starter.id] = Date.now();
    return s;
  }

  function ensureDaily(){
    if(!state.daily || state.daily.date !== todayKey()){
      state.daily = {date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,claimed:{}};
    }
  }

  function normalize(){
    const oldVersion = Number(state.version || 0);
    if(!state.version || state.version < 23){ state.version = Math.max(23, Number(state.version || 0)); }
    if(oldVersion < 12){
      state.settings ||= {};
      state.settings.battleSpeed = 1;
    }
    if(oldVersion < 13){
      state.version = 13;
    }
    if(oldVersion < 14){
      state.version = 14;
    }
    if(oldVersion < 16){
      state.version = 16;
    }
    if(Number(state.version || 0) < 23){
      state.version = 23;
    }
    state.resources ||= {gold:0,gems:0,tickets:0,dust:0};
    state.campaign ||= {selected:1,unlocked:1,highestCleared:0,clears:{}};
    state.roster ||= {};
    state.team ||= [];
    state.inventory ||= [];
    state.gacha ||= {rolls:0,epicPity:0,legendPity:0,lastResults:[]};
    state.daily ||= {date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,claimed:{}};
    state.stats ||= {totalWins:0,totalLosses:0,totalGachas:0,totalUpgrades:0};
    state.idle ||= {last:Date.now()};
    state.settings ||= {battleSpeed:1,heroFilter:'all',heroSort:'power'};
    if(![0.5,0.75,1,2,4,8,12].includes(Number(state.settings.battleSpeed))) state.settings.battleSpeed = 1;
    state.settings.heroFilter ||= 'all';
    state.settings.heroSort ||= 'power';
    state.favorites ||= {};
    Object.keys(state.favorites).forEach(id=>{ if(!state.roster?.[id]) delete state.favorites[id]; });
    state.codex ||= {seen:{}};
    state.codex.seen ||= {};
    Object.keys(state.roster || {}).forEach(id=>{ if(!state.codex.seen[id]) state.codex.seen[id] = Date.now(); });
    state.lastBattle ||= null;
    state.fusion ||= {selected:[],last:null};
    state.starter ||= {freeRollsLeft:0,firstHero:null,history:[]};
    if(oldVersion < 23 && state.starter && Array.isArray(state.starter.history)){
      const usedFree = Math.max(0, state.starter.history.length - 1);
      state.starter.freeRollsLeft = Math.max(Number(state.starter.freeRollsLeft||0), Math.max(0, 5 - usedFree));
    }
    Object.values(state.roster || {}).forEach(inst=>{
      inst.level = Math.max(1, Math.min(1000, Number(inst.level || 1)));
      inst.stars = Math.max(1, Math.min(6, Number(inst.stars || 1)));
      inst.rebirth = Math.max(0, Number(inst.rebirth || 0));
      inst.shards = Math.max(0, Number(inst.shards || 0));
      inst.equipped ||= {weapon:null,armor:null,charm:null,boots:null};
    });
    state.team = (state.team||[]).slice(0,5); while(state.team.length<5) state.team.push(null);
    state.team = state.team.map(id => state.roster && state.roster[id] ? id : null);
    state.fusion.selected = (state.fusion.selected||[]).filter(id=>state.roster && state.roster[id] && !state.team.includes(id) && !state.favorites[id]);
    ensureDaily();
  }

  function load(){
    try{
      let raw = localStorage.getItem(KEY);
      if(!raw){
        for(const oldKey of OLD_KEYS){
          raw = localStorage.getItem(oldKey);
          if(raw) break;
        }
      }
      state = raw ? JSON.parse(raw) : defaultState();
      normalize();
    }catch(e){
      console.warn(e);
      state = defaultState();
    }
    save();
    return state;
  }

  function save(){
    normalize();
    localStorage.setItem(KEY, JSON.stringify(state));
  }

  function backupNow(){
    try{
      if(state) localStorage.setItem(KEY + '_backup', JSON.stringify({at:new Date().toISOString(), save:state}));
      return true;
    }catch(e){ return false; }
  }

  function exportBackupText(){
    const raw = localStorage.getItem(KEY + '_backup');
    if(!raw) return '';
    return encodeText(raw);
  }

  function reset(){
    backupNow();
    state = defaultState();
    save();
  }

  function exportSaveText(){
    normalize();
    const payload = {
      game:'Abyss Grimoire',
      version:23,
      exportedAt:new Date().toISOString(),
      save:state
    };
    return encodeText(JSON.stringify(payload));
  }

  function importSaveText(text){
    try{
      const cleaned = String(text || '').trim();
      if(!cleaned) return {ok:false,msg:'ยังไม่ได้วางข้อความเซฟ'};
      let payload;
      try{
        payload = JSON.parse(decodeText(cleaned));
      }catch(_){
        payload = JSON.parse(cleaned);
      }
      const incoming = payload.save || payload;
      if(!incoming || typeof incoming !== 'object') return {ok:false,msg:'รูปแบบเซฟไม่ถูกต้อง'};
      if(!incoming.roster || !incoming.team || !incoming.campaign || !incoming.resources){
        return {ok:false,msg:'ไฟล์เซฟไม่ครบ หรือไม่ใช่เซฟของเกมนี้'};
      }
      state = incoming;
      backupNow();
      state.version = 22;
      normalize();
      save();
      return {ok:true,msg:'นำเข้าเซฟสำเร็จ'};
    }catch(e){
      console.warn(e);
      return {ok:false,msg:'นำเข้าไม่สำเร็จ ข้อความเซฟอาจเสียหรือคัดลอกมาไม่ครบ'};
    }
  }


  function heroDef(id){ return G().heroes.find(h=>h.id===id); }
  function stageDef(id){ return G().stages.find(s=>s.id===Number(id)); }
  function rarityDef(r){ return G().rarities[r]; }
  function eqTypeDef(t){ return G().equipmentTypes[t]; }
  function eqRareDef(r){ return G().equipmentRarities[r]; }

  function makeEquipment(type, rarity='Common', level=1){
    const names = {
      weapon:['กระบี่','หอก','ธนู','คทา','มีดสั้น'],
      armor:['เกราะ','เสื้อคลุม','โล่','ผ้าคลุม'],
      charm:['หยก','ยันต์','ลูกประคำ','แหวน'],
      boots:['รองเท้า','ผ้าพันขา','เกราะเท้า']
    };
    const base = {weapon:16,armor:12,charm:90,boots:5}[type] || 10;
    const value = Math.round((base + level*3) * eqRareDef(rarity).mult);
    return {uid:uid(),type,rarity,level,value,name:names[type][Math.floor(Math.random()*names[type].length)]};
  }

  function randomEquipment(stageId=1, boss=false){
    const roll = Math.random()*100;
    let rarity = 'Common';
    if(roll > 97 || boss && roll > 90) rarity='Legendary';
    else if(roll > 86 || boss && roll > 72) rarity='Epic';
    else if(roll > 56) rarity='Rare';
    const types = Object.keys(G().equipmentTypes);
    return makeEquipment(types[Math.floor(Math.random()*types.length)], rarity, Math.max(1, Math.floor(stageId/5)));
  }

  function getEquipment(uid){ return state.inventory.find(i=>i.uid===uid); }

  function heroStats(id){
    const inst = state.roster[id];
    const def = heroDef(id);
    if(!inst || !def) return null;
    const rm = rarityDef(def.rarity).mult;
    const rebirth = Number(inst.rebirth || 0);
    const starM = 1 + (inst.stars-1)*0.22;
    const levelM = 1 + (inst.level-1)*0.035;
    // Rebirth เป็นสแต็กถาวร ยิ่งเกิดใหม่หลายรอบโบนัสยิ่งโตแบบค่อยเป็นค่อยไป
    const rebirthM = 1 + rebirth*0.18 + Math.pow(rebirth,1.12)*0.018;
    const stats = {
      hp: Math.round(def.base.hp * rm * starM * levelM * rebirthM),
      atk: Math.round(def.base.atk * rm * starM * levelM * rebirthM),
      def: Math.round(def.base.def * rm * starM * levelM * rebirthM),
      spd: Math.round(def.base.spd * (1 + (inst.level-1)*0.004) + (inst.stars-1)*2 + rebirth*1.5),
    };
    for(const slot of Object.keys(inst.equipped||{})){
      const item = getEquipment(inst.equipped[slot]);
      if(!item) continue;
      const stat = eqTypeDef(item.type).stat;
      stats[stat] += item.value;
    }
    stats.power = Math.round(stats.hp/5 + stats.atk*4 + stats.def*3 + stats.spd*2 + inst.stars*90 + inst.level*13 + (inst.rebirth||0)*900);
    return stats;
  }

  function teamPower(ids=state.team){
    return ids.filter(Boolean).reduce((sum,id)=>sum + (heroStats(id)?.power || 0),0);
  }

  function maxHeroLevel(){
    return 1000;
  }

  function levelCost(inst){
    const rebirth = Number(inst.rebirth || 0);
    return Math.round((130 + inst.level*55 + Math.pow(inst.level,1.45)*12) * (1 + rebirth*0.18));
  }

  function rebirthCost(inst){
    const r = Number(inst.rebirth || 0);
    return {
      gold: Math.round(180000 + Math.pow(r+1,1.7)*75000 + r*150000),
      dust: Math.round(2500 + Math.pow(r+1,1.5)*850 + r*1400),
    };
  }
  function starCost(inst){ return inst.stars * 60; }
  function shardsNeeded(stars){ return 18 + stars*14; }

  function addHero(id){
    const def = heroDef(id);
    if(!def) return null;
    const shardGain = rarityDef(def.rarity).shard;
    state.codex ||= {seen:{}}; state.codex.seen ||= {}; state.codex.seen[id] = state.codex.seen[id] || Date.now();
    if(state.roster[id]){
      state.roster[id].shards += shardGain;
      return {type:'shards',hero:def,amount:shardGain};
    }
    state.roster[id] = {id,level:1,stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
    state.codex.seen[id] = state.codex.seen[id] || Date.now();
    return {type:'new',hero:def,amount:0};
  }

  function starterRecruit(){
    state.starter ||= {freeRollsLeft:0,firstHero:null,history:[]};
    if((state.starter.freeRollsLeft || 0) <= 0) return {ok:false,msg:'ใช้สิทธิ์สุ่มฟรีครบแล้ว'};
    // สุ่มเริ่มต้นต้องได้มอนสเตอร์เพิ่มจริง ๆ ถ้ายังมีตัวที่ยังไม่ครอบครอง
    let pool = G().heroes.filter(h => !state.roster[h.id] && h.rarity !== 'Mythic');
    if(!pool.length) pool = G().heroes.filter(h => !state.roster[h.id]);
    let h = null;
    if(pool.length){
      const weighted = pool.map(hero => ({hero, w:G().rarities[hero.rarity].rate}));
      const total = weighted.reduce((sum,x)=>sum+x.w,0);
      let r = Math.random()*total;
      for(const x of weighted){ r -= x.w; if(r <= 0){ h = x.hero; break; } }
      h ||= weighted[weighted.length-1].hero;
    } else h = weightedHeroRoll();
    const result = addHero(h.id);
    state.starter.freeRollsLeft--;
    state.starter.history = state.starter.history || [];
    state.starter.history.push(h.id);
    if(result?.type === 'new'){
      const empty = state.team.findIndex(x => !x);
      if(empty >= 0) state.team[empty] = h.id;
    }
    state.gacha.lastResults = [result];
    save();
    return {ok:true,result,left:state.starter.freeRollsLeft};
  }

  function weightedHeroRoll(force=''){
    let pool = G().heroes;
    if(force === 'Epic') pool = pool.filter(h=>['Epic','Legendary','Mythic'].includes(h.rarity));
    if(force === 'Legendary') pool = pool.filter(h=>['Legendary','Mythic'].includes(h.rarity));
    const weighted = [];
    pool.forEach(h=>{
      let w = G().rarities[h.rarity].rate;
      if(force) w = Math.max(1, 100 / G().rarities[h.rarity].mult);
      weighted.push({h,w});
    });
    const total = weighted.reduce((s,x)=>s+x.w,0);
    let r = Math.random()*total;
    for(const x of weighted){ r -= x.w; if(r <= 0) return x.h; }
    return weighted[weighted.length-1].h;
  }

  function gacha(count){
    ensureDaily();
    const costTickets = Math.min(state.resources.tickets, count);
    const gemNeed = (count - costTickets) * 100;
    if(state.resources.gems < gemNeed) return {ok:false,msg:'Gem ไม่พอสำหรับเปิดกาชา'};
    state.resources.tickets -= costTickets;
    state.resources.gems -= gemNeed;
    const results=[];
    for(let i=0;i<count;i++){
      state.gacha.rolls++;
      state.gacha.epicPity++;
      state.gacha.legendPity++;
      let force='';
      if(state.gacha.legendPity >= 60){ force='Legendary'; state.gacha.legendPity = 0; }
      else if(state.gacha.epicPity >= 10){ force='Epic'; state.gacha.epicPity = 0; }
      const h = weightedHeroRoll(force);
      if(['Epic','Legendary','Mythic'].includes(h.rarity)) state.gacha.epicPity = 0;
      if(['Legendary','Mythic'].includes(h.rarity)) state.gacha.legendPity = 0;
      results.push(addHero(h.id));
    }
    state.gacha.lastResults = results;
    state.daily.gachas += count;
    state.stats.totalGachas += count;
    save();
    return {ok:true,results};
  }

  function autoTeam(){
    const owned = Object.keys(state.roster).map(id=>({id,def:heroDef(id),power:heroStats(id).power}));
    const tanks = owned.filter(x=>x.def.role==='Tank').sort((a,b)=>b.power-a.power);
    const supports = owned.filter(x=>x.def.role==='Support').sort((a,b)=>b.power-a.power);
    const damage = owned.filter(x=>!['Tank','Support'].includes(x.def.role)).sort((a,b)=>b.power-a.power);
    const chosen=[];
    if(tanks[0]) chosen.push(tanks[0].id);
    if(damage[0]) chosen.push(damage[0].id);
    if(supports[0]) chosen.push(supports[0].id);
    for(const x of [...damage.slice(1),...tanks.slice(1),...supports.slice(1),...owned.sort((a,b)=>b.power-a.power)]){
      if(chosen.length>=5) break;
      if(!chosen.includes(x.id)) chosen.push(x.id);
    }
    // slot 0-1 หน้า: tank/warrior ก่อน, หลัง: support/mage/ranger
    const front = chosen.filter(id=>['Tank','Warrior'].includes(heroDef(id).role)).slice(0,2);
    const rest = chosen.filter(id=>!front.includes(id));
    while(front.length<2 && rest.length) front.push(rest.shift());
    const arranged = [...front, ...rest].slice(0,5);
    while(arranged.length < 5) arranged.push(null);
    state.team = arranged;
    save();
    return state.team;
  }

  function levelUp(id){
    ensureDaily();
    const inst = state.roster[id];
    if(!inst) return {ok:false,msg:'ไม่มีตัวละครนี้'};
    if(inst.level >= maxHeroLevel()) return {ok:false,msg:'ถึงเลเวลสูงสุดแล้ว กด Rebirth เพื่อเกิดใหม่'};
    const cost = levelCost(inst);
    if(state.resources.gold < cost) return {ok:false,msg:'Gold ไม่พอ'};
    state.resources.gold -= cost;
    inst.level++;
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    save();
    return {ok:true};
  }

  function starUp(id){
    ensureDaily();
    const inst = state.roster[id];
    if(!inst) return {ok:false,msg:'ไม่มีตัวละครนี้'};
    if(inst.stars >= 6) return {ok:false,msg:'ดาวสูงสุดแล้ว'};
    const need = shardsNeeded(inst.stars);
    const dust = starCost(inst);
    if(inst.shards < need) return {ok:false,msg:'Shard ไม่พอ'};
    if(state.resources.dust < dust) return {ok:false,msg:'Dust ไม่พอ'};
    inst.shards -= need;
    state.resources.dust -= dust;
    inst.stars++;
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    save();
    return {ok:true};
  }


  function rebirthHero(id){
    ensureDaily();
    const inst = state.roster[id];
    if(!inst) return {ok:false,msg:'ไม่มีมอนสเตอร์นี้'};
    if(inst.level < maxHeroLevel()) return {ok:false,msg:`ต้องเลเวล ${maxHeroLevel()} ก่อนถึงจะ Rebirth ได้`};
    const cost = rebirthCost(inst);
    if(state.resources.gold < cost.gold) return {ok:false,msg:'Gold ไม่พอสำหรับ Rebirth'};
    if(state.resources.dust < cost.dust) return {ok:false,msg:'Dust ไม่พอสำหรับ Rebirth'};
    state.resources.gold -= cost.gold;
    state.resources.dust -= cost.dust;
    inst.level = 1;
    inst.rebirth = Number(inst.rebirth || 0) + 1;
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    save();
    return {ok:true,rebirth:inst.rebirth};
  }

  function equipBest(){
    // เคลียร์ของที่อ้างถึงผิด
    Object.values(state.roster).forEach(h=>{
      for(const slot of Object.keys(h.equipped)) if(h.equipped[slot] && !getEquipment(h.equipped[slot])) h.equipped[slot]=null;
    });
    const used = new Set();
    Object.values(state.roster).forEach(h=>Object.values(h.equipped||{}).forEach(x=>x&&used.add(x)));
    let changes = 0;
    const ids = [...state.team.filter(Boolean), ...Object.keys(state.roster).filter(id=>!state.team.includes(id))];
    for(const id of ids){
      const inst = state.roster[id];
      if(!inst) continue;
      for(const type of Object.keys(G().equipmentTypes)){
        const current = inst.equipped[type] ? getEquipment(inst.equipped[type]) : null;
        const best = state.inventory
          .filter(i=>i.type===type && (!used.has(i.uid) || i.uid===inst.equipped[type]))
          .sort((a,b)=>(G().equipmentRarities[b.rarity].score*1000+b.value)-(G().equipmentRarities[a.rarity].score*1000+a.value))[0];
        if(best && (!current || (G().equipmentRarities[best.rarity].score*1000+best.value) > (G().equipmentRarities[current.rarity].score*1000+current.value))){
          if(current) used.delete(current.uid);
          inst.equipped[type] = best.uid;
          used.add(best.uid);
          changes++;
        }
      }
    }
    save();
    return changes;
  }

  function autoUpgrade(){
    ensureDaily();
    let count=0;
    autoTeam();
    count += equipBest();
    // อัปดาวก่อนถ้าทำได้
    for(let loop=0; loop<5; loop++){
      let changed=false;
      for(const id of state.team){
        const r = starUp(id);
        if(r.ok){ count++; changed=true; }
      }
      if(!changed) break;
    }
    // อัปเลเวลแบบเฉลี่ยทีม
    let guard = 0;
    while(guard++ < 260){
      const candidates = state.team
        .filter(id=>state.roster[id])
        .map(id=>({id,level:state.roster[id].level,cost:levelCost(state.roster[id])}))
        .filter(x=>x.level < maxHeroLevel() && x.cost <= state.resources.gold)
        .sort((a,b)=>a.level-b.level || a.cost-b.cost);
      if(!candidates.length) break;
      const r = levelUp(candidates[0].id);
      if(!r.ok) break;
      count++;
    }
    save();
    return count;
  }


  function rarityRank(r){ return {Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4}[r] ?? 0; }
  function rankRarity(rank){ return ['Common','Rare','Epic','Legendary','Mythic'][Math.max(0,Math.min(4,rank))]; }

  function fusionElement(a,b){
    if(a===b) return a;
    const key = [a,b].sort().join('+');
    const map = {
      'Fire+Nature':'Light',
      'Fire+Water':'Dark',
      'Dark+Fire':'Dark',
      'Nature+Water':'Nature',
      'Light+Nature':'Light',
      'Light+Water':'Light',
      'Dark+Nature':'Dark',
      'Dark+Water':'Dark',
      'Dark+Light':'Light',
    };
    return map[key] || a;
  }

  function fusionCost(a,b,targetRarity){
    const ia = state.roster[a], ib = state.roster[b];
    const avgLevel = Math.round(((ia?.level||1)+(ib?.level||1))/2);
    const rank = rarityRank(targetRarity);
    return {
      gold: Math.round(420 + avgLevel*80 + rank*520),
      dust: Math.round(45 + rank*70)
    };
  }

  function findFusionRecipe(a,b){
    const pair = [a,b].sort().join('+');
    return (G().fusionRecipes || []).find(r => (r.from || []).slice().sort().join('+') === pair);
  }

  function weightedPick(items, weightFn){
    const list = (items || []).filter(Boolean);
    const total = list.reduce((sum,item)=>sum + Math.max(1, Number(weightFn(item) || 1)), 0);
    if(!list.length || total <= 0) return null;
    let roll = Math.random() * total;
    for(const item of list){
      roll -= Math.max(1, Number(weightFn(item) || 1));
      if(roll <= 0) return item;
    }
    return list[list.length-1];
  }

  function randomFusionPool(a,b){
    const da = heroDef(a), db = heroDef(b);
    const ia = state.roster[a], ib = state.roster[b];
    const selected = new Set([a,b]);
    const owned = new Set(Object.keys(state.roster));
    const rA = rarityRank(da.rarity), rB = rarityRank(db.rarity);
    const baseRank = Math.max(rA,rB);
    const sameRarity = rA === rB;
    const sameElement = da.element === db.element;
    const sameRole = da.role === db.role;
    const avgStars = ((ia.stars||1)+(ib.stars||1))/2;
    const comboElement = fusionElement(da.element, db.element);
    const elementSet = new Set([da.element, db.element, comboElement]);
    const roleSet = new Set([da.role, db.role]);

    // V18: ผสมมั่วได้ทุกคู่ ผลลัพธ์เป็น pool สุ่ม ไม่ล็อกแค่สูตรเฉพาะ
    const rankWeights = {};
    rankWeights[baseRank] = 100;
    let up1 = 16;
    if(sameRarity) up1 += 24;
    if(sameElement) up1 += 14;
    if(sameRole) up1 += 8;
    if(avgStars >= 3) up1 += 10;
    if(avgStars >= 5) up1 += 8;
    if(baseRank + 1 <= 4) rankWeights[baseRank + 1] = up1;
    let up2 = 2;
    if(sameRarity && sameElement) up2 += 6;
    if(avgStars >= 4) up2 += 5;
    if(avgStars >= 6) up2 += 5;
    if(baseRank + 2 <= 4) rankWeights[baseRank + 2] = up2;

    const possibleRanks = Object.keys(rankWeights).map(Number).filter(r=>rankWeights[r] > 0);
    let candidates = G().heroes.filter(h => !selected.has(h.id) && possibleRanks.includes(rarityRank(h.rarity)));
    if(!candidates.length) candidates = G().heroes.filter(h => !selected.has(h.id));

    const pool = candidates.map(h=>{
      const rank = rarityRank(h.rarity);
      let weight = rankWeights[rank] || 8;
      if(elementSet.has(h.element)) weight *= 1.45;
      if(h.element === comboElement) weight *= 1.25;
      if(roleSet.has(h.role)) weight *= 1.22;
      if(!owned.has(h.id)) weight *= 1.18; // ดันให้ได้ตัวใหม่บ้าง
      if(h.id === a || h.id === b) weight = 0;
      return {id:h.id, weight:Math.max(1, Math.round(weight))};
    }).filter(x=>x.weight > 0);

    pool.sort((x,y)=> y.weight-x.weight || rarityRank(heroDef(y.id).rarity)-rarityRank(heroDef(x.id).rarity) || x.id.localeCompare(y.id));
    const rarities = [...new Set(pool.map(x=>heroDef(x.id).rarity))].sort((x,y)=>rarityRank(x)-rarityRank(y));
    const elements = [...new Set(pool.map(x=>heroDef(x.id).element))];
    return {pool, rarities, elements, comboElement, sameRarity, sameElement, sameRole};
  }

  function fusionPreview(ids=state.fusion?.selected){
    ids = (ids||[]).filter(Boolean);
    if(ids.length !== 2) return {ok:false,msg:'เลือกมอนสเตอร์ 2 ตัวเพื่อดูผลผสม'};
    const [a,b] = ids;
    if(a===b) return {ok:false,msg:'ต้องเลือกคนละตัว'};
    if(!state.roster[a] || !state.roster[b]) return {ok:false,msg:'ไม่มีมอนสเตอร์ที่เลือก'};
    if(state.team.includes(a) || state.team.includes(b)) return {ok:false,msg:'ถอดออกจากทีมก่อนผสม'};
    if(state.favorites?.[a] || state.favorites?.[b]) return {ok:false,msg:'มีตัวที่ล็อก Favorite อยู่ ปลดล็อกก่อนผสม'};
    const da = heroDef(a), db = heroDef(b);
    const ia = state.roster[a], ib = state.roster[b];

    // ถ้าคู่นี้มีตำราเฉพาะ ให้ใช้ผลลัพธ์ตามตำราก่อนแบบการันตี
    const recipe = findFusionRecipe(a,b);
    if(recipe){
      const result = heroDef(recipe.result);
      if(result && result.id !== a && result.id !== b){
        const baseCost = fusionCost(a,b,result.rarity);
        const cost = {gold:Math.round(baseCost.gold * 0.92), dust:Math.round(baseCost.dust * 0.92)};
        const avgLevel = Math.max(1, Math.floor(((ia.level||1)+(ib.level||1))/2));
        return {ok:true,a,b,result,cost,avgLevel,poolNote:`ตำรา: ${recipe.title}`,duplicate:!!state.roster[result.id],recipe,isRandom:false};
      }
    }

    // V18: ไม่มีสูตรก็ยังผสมได้แบบ Chaos Fusion สุ่มจาก pool ตามระดับ/ธาตุ/บทบาท
    const built = randomFusionPool(a,b);
    if(!built.pool.length) return {ok:false,msg:'ยังไม่มี pool ผสมที่ใช้ได้'};
    const previewPick = built.pool[0];
    const result = heroDef(previewPick.id);
    const baseRank = Math.max(rarityRank(da.rarity), rarityRank(db.rarity));
    const costRarity = rankRarity(Math.max(1, Math.min(4, baseRank + (built.sameRarity ? 1 : 0))));
    const cost = fusionCost(a,b,costRarity);
    const avgLevel = Math.max(1, Math.floor(((ia.level||1)+(ib.level||1))/2));
    const elemLabel = G().elements[built.comboElement]?.label || built.comboElement;
    const rarityText = built.rarities.join('/');
    return {
      ok:true,a,b,result,cost,avgLevel,
      poolNote:`Chaos Fusion: สุ่ม ${built.pool.length} แบบ | ${rarityText} | แกนธาตุ ${elemLabel}`,
      duplicate:built.pool.every(x=>!!state.roster[x.id]),
      isRandom:true,
      pool:built.pool,
      possibleRarities:built.rarities,
      possibleElements:built.elements,
      comboElement:built.comboElement
    };
  }

  function toggleFusion(id){
    state.fusion ||= {selected:[],last:null};
    if(!state.roster[id]) return {ok:false,msg:'ไม่มีมอนสเตอร์นี้'};
    if(state.team.includes(id)) return {ok:false,msg:'ตัวนี้อยู่ในทีม ถอดทีมก่อนผสม'};
    if(state.favorites && state.favorites[id]) return {ok:false,msg:'ตัวนี้ถูกล็อก Favorite ไว้ ปลดล็อกก่อนผสม'};
    const arr = state.fusion.selected || [];
    const idx = arr.indexOf(id);
    if(idx >= 0) arr.splice(idx,1);
    else {
      if(arr.length >= 2) arr.shift();
      arr.push(id);
    }
    state.fusion.selected = arr;
    save();
    return {ok:true};
  }

  function clearFusion(){
    state.fusion ||= {selected:[],last:null};
    state.fusion.selected = [];
    save();
  }

  function doFusion(){
    ensureDaily();
    const prev = fusionPreview();
    if(!prev.ok) return prev;
    if(state.resources.gold < prev.cost.gold) return {ok:false,msg:'Gold ไม่พอสำหรับผสม'};
    if(state.resources.dust < prev.cost.dust) return {ok:false,msg:'Dust ไม่พอสำหรับผสม'};
    const {a,b,avgLevel,cost} = prev;
    let result = prev.result;
    if(prev.isRandom && prev.pool?.length){
      const picked = weightedPick(prev.pool, x=>x.weight || 1);
      result = heroDef(picked?.id) || result;
    }
    state.resources.gold -= cost.gold;
    state.resources.dust -= cost.dust;
    if(state.favorites?.[a] || state.favorites?.[b]) return {ok:false,msg:'มีตัวที่ล็อก Favorite อยู่ ปลดล็อกก่อนผสม'};
    delete state.roster[a];
    delete state.roster[b];
    state.team = state.team.map(id => (id===a || id===b) ? null : id);
    let gain;
    if(state.roster[result.id]){
      const amount = rarityDef(result.rarity).shard * 2;
      state.codex ||= {seen:{}}; state.codex.seen ||= {}; state.codex.seen[result.id] = state.codex.seen[result.id] || Date.now();
      state.roster[result.id].shards += amount;
      gain = {type:'shards',amount};
    } else {
      state.roster[result.id] = {id:result.id,level:Math.min(maxHeroLevel(), Math.max(1,avgLevel+1)),stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
      state.codex ||= {seen:{}}; state.codex.seen ||= {}; state.codex.seen[result.id] = state.codex.seen[result.id] || Date.now();
      gain = {type:'new',amount:0};
    }
    state.fusion.last = {from:[a,b],result:result.id,at:Date.now(),gain,random:!!prev.isRandom,poolNote:prev.poolNote};
    state.fusion.selected = [];
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    autoTeam();
    save();
    return {ok:true,result,gain};
  }

  function autoFusion(){
    const spare = Object.keys(state.roster)
      .filter(id=>!state.team.includes(id) && !state.favorites?.[id])
      .map(id=>({id, power:heroStats(id)?.power||0, rank:rarityRank(heroDef(id).rarity)}))
      .sort((a,b)=>a.rank-b.rank || a.power-b.power);
    if(spare.length < 2) return {ok:false,msg:'ต้องมีตัวสำรองอย่างน้อย 2 ตัวที่ไม่ได้อยู่ในทีม'};
    state.fusion ||= {selected:[],last:null};
    let best = null;
    for(let i=0;i<Math.min(spare.length,8);i++){
      for(let j=i+1;j<Math.min(spare.length,8);j++){
        const p = fusionPreview([spare[i].id,spare[j].id]);
        if(!p.ok) continue;
        const bestPool = p.isRandom && p.pool?.length ? p.pool[0] : {id:p.result.id, weight:1};
        const target = heroDef(bestPool.id) || p.result;
        const score = rarityRank(target.rarity)*100000 + (state.roster[target.id]?0:50000) + (heroStats(target.id)?.power||0) + (bestPool.weight||0);
        if(!best || score > best.score) best = {...p,score};
      }
    }
    if(!best) return {ok:false,msg:'ยังไม่มีคู่ที่ผสมได้'};
    state.fusion.selected = [best.a,best.b];
    const r = doFusion();
    return r.ok ? {...r,msg:`ผสมอัตโนมัติได้ ${r.result.name}`} : r;
  }



  function isFavorite(id){ return !!(state.favorites && state.favorites[id]); }

  function toggleFavorite(id){
    if(!state.roster[id]) return {ok:false,msg:'ไม่มีมอนสเตอร์นี้'};
    state.favorites ||= {};
    if(state.favorites[id]) delete state.favorites[id];
    else state.favorites[id] = Date.now();
    state.fusion.selected = (state.fusion.selected||[]).filter(x=>!state.favorites[x]);
    save();
    return {ok:true,locked:!!state.favorites[id]};
  }

  function codexSeen(id){ return !!(state.codex?.seen?.[id] || state.roster?.[id]); }

  function setLastBattle(summary){
    state.lastBattle = summary || null;
    save();
  }

  function selectedStage(){ return stageDef(state.campaign.selected || state.campaign.unlocked || 1); }
  function selectStage(id){
    id = Number(id);
    if(id <= state.campaign.unlocked){ state.campaign.selected = id; save(); return true; }
    return false;
  }

  function applyRewards(reward){
    for(const [k,v] of Object.entries(reward||{})){
      state.resources[k] = (state.resources[k]||0) + v;
    }
  }

  function completeStage(stageId, win, opts={}){
    ensureDaily();
    const st = stageDef(stageId);
    if(!st) return {reward:{},first:false,item:null};
    if(!win){ state.stats.totalLosses++; save(); return {reward:{},first:false,item:null}; }
    const first = !state.campaign.clears[stageId];
    state.campaign.clears[stageId] = (state.campaign.clears[stageId]||0)+1;
    state.campaign.highestCleared = Math.max(state.campaign.highestCleared, stageId);
    if(stageId >= state.campaign.unlocked && stageId < G().stages.length){
      state.campaign.unlocked = stageId + 1;
      if(!opts.stay) state.campaign.selected = stageId + 1;
    }
    const reward = clone(first ? st.firstReward : st.repeatReward);
    // V8: ฟาร์มนานขึ้น ได้ Ticket จากการชนะทุก 7 ครั้งและบอสเท่านั้น
    state.daily.wins++;
    state.stats.totalWins++;
    if(state.stats.totalWins % 7 === 0) reward.tickets = (reward.tickets||0) + 1;
    if(st.isBoss) state.daily.bossWins++;
    let item = null;
    const dropChance = st.isBoss ? 0.62 : 0.18;
    if(Math.random() < dropChance){
      item = randomEquipment(stageId, st.isBoss);
      state.inventory.push(item);
    }
    applyRewards(reward);
    save();
    return {reward,first,item};
  }

  function idlePreview(){
    const now = Date.now();
    const elapsed = Math.max(0, now - (state.idle.last || now));
    const capped = Math.min(elapsed, 8*60*60*1000);
    const minutes = Math.floor(capped/60000);
    const base = Math.max(1,state.campaign.highestCleared || 1);
    return {
      minutes,
      reward:{
        gold: Math.floor(minutes * (3 + base*0.35)),
        dust: Math.floor(minutes * (0.45 + base*0.045)),
        gems: Math.floor(minutes / 90),
      }
    };
  }

  function claimIdle(){
    const p = idlePreview();
    if(p.minutes < 3) return {ok:false,msg:'รออย่างน้อย 3 นาทีถึงจะรับได้',preview:p};
    applyRewards(p.reward);
    state.idle.last = Date.now();
    save();
    return {ok:true,preview:p};
  }

  function questProgress(q){ return Math.min(q.need, state.daily[q.field] || 0); }
  function questClaim(qid){
    ensureDaily();
    const q = G().dailyQuests.find(x=>x.id===qid);
    if(!q) return {ok:false,msg:'ไม่พบเควส'};
    if(state.daily.claimed[qid]) return {ok:false,msg:'รับไปแล้ว'};
    if(questProgress(q) < q.need) return {ok:false,msg:'ยังทำไม่ครบ'};
    applyRewards(q.reward);
    state.daily.claimed[qid] = true;
    save();
    return {ok:true,reward:q.reward};
  }

  function stageEnemyPower(stage){ return stage.power; }

  function resourceText(reward){
    if(!reward) return '';
    const map = {gold:'Gold',gems:'Gem',tickets:'Ticket',dust:'Dust'};
    return Object.entries(reward).filter(([k,v])=>v).map(([k,v])=>`+${fmt(v)} ${map[k]||k}`).join('  ');
  }

  return {
    get state(){ return state; }, load, save, reset, exportSaveText, importSaveText, fmt, todayKey,
    heroDef, stageDef, rarityDef, heroStats, teamPower, maxHeroLevel, levelCost, rebirthCost, rebirthHero, starCost, shardsNeeded,
    addHero, starterRecruit, gacha, autoTeam, levelUp, starUp, autoUpgrade, equipBest,
    isFavorite, toggleFavorite, codexSeen, setLastBattle, backupNow, exportBackupText,
    fusionPreview, toggleFusion, clearFusion, doFusion, autoFusion, rarityRank,
    selectedStage, selectStage, completeStage, stageEnemyPower,
    makeEquipment, randomEquipment, getEquipment, idlePreview, claimIdle,
    questProgress, questClaim, resourceText
  };
})();
