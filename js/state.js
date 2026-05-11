window.GameState = (() => {
  const KEY = 'abyss_grimoire_v42_save';
  const OLD_KEYS = ['abyss_grimoire_v41_save','abyss_grimoire_v40_save','abyss_grimoire_v39_save','abyss_grimoire_v38_save','abyss_grimoire_v37_save','abyss_grimoire_v36_save','abyss_grimoire_v35_save','abyss_grimoire_v34_save','abyss_grimoire_v33_save','abyss_grimoire_v32_save','abyss_grimoire_v31_save','abyss_grimoire_v30_save','abyss_grimoire_v28_save','abyss_grimoire_v27_save','abyss_grimoire_v26_save','abyss_grimoire_v25_save','abyss_grimoire_v24_save','abyss_grimoire_v23_save','abyss_grimoire_v22_save','abyss_grimoire_v21_save','abyss_grimoire_v20_save','abyss_grimoire_v19_save','abyss_grimoire_v18_save','abyss_grimoire_v17_save','abyss_grimoire_v16_save','abyss_grimoire_v15_save','abyss_grimoire_v14_save','abyss_grimoire_v13_save','abyss_grimoire_v12_save','abyss_grimoire_v11_save'];
  const G = () => window.GameData;
  let state = null;

  function todayKey(){ return new Date().toISOString().slice(0,10); }
  function dayNumber(key){ if(!key) return 0; return Math.floor(new Date(key+'T00:00:00Z').getTime()/86400000); }
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
      version:42,
      screen:'home',
      resources:{gold:420,gems:180,tickets:1,dust:60,ssrShards:0},
      campaign:{selected:1,unlocked:1,highestCleared:0,clears:{}},
      roster:{},
      team:[starter.id,null,null,null,null],
      inventory:[],
      gacha:{rolls:0,rarePity:0,epicPity:0,legendPity:0,lastResults:[]},
      daily:{date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,dungeonRuns:{},claimed:{}},
      loginReward:{date:null,tickets:0,claimedAt:null,streak:0,day:0,reward:{}},
      stats:{totalWins:0,totalLosses:0,totalGachas:0,totalUpgrades:0,totalFusions:0,totalRebirths:0,totalShopBuys:0},
      idle:{last:now},
      settings:{battleSpeed:1,heroFilter:'all',heroSort:'power',heroSearch:'',selectedHero:null,farmStop:'lose',logMode:'full'},
      teamPresets:{},
      favorites:{},
      codex:{seen:{}},
      achievements:{claimed:{}},
      codexRewards:{claimed:{}},
      shop:{buys:{}},
      lastBattle:null,
      fusion:{selected:[],last:null},
      starter:{freeRollsLeft:5,firstHero:starter.id,history:[starter.id]},
      flags:{seenIntro:false}
    };
    s.roster[starter.id] = {id:starter.id,level:1,exp:0,stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
    s.codex.seen[starter.id] = Date.now();
    return s;
  }

  function ensureDaily(){
    if(!state.daily || state.daily.date !== todayKey()){
      state.daily = {date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,dungeonRuns:{},claimed:{}};
    }
    state.daily.dungeonRuns ||= {};
  }

  function grantDailyLoginReward(){
    state.loginReward ||= {date:null,tickets:0,claimedAt:null,streak:0,day:0,reward:{}};
    const today = todayKey();
    if(state.loginReward.date !== today){
      state.resources ||= {gold:0,gems:0,tickets:0,dust:0,ssrShards:0};
      const prevDay = dayNumber(state.loginReward.date);
      const diff = prevDay ? (dayNumber(today) - prevDay) : 99;
      const streak = diff === 1 ? Number(state.loginReward.streak || 0) + 1 : 1;
      const day = ((streak - 1) % 7) + 1;
      const table = G().loginRewards7 || [{day:1,reward:{tickets:200}}];
      const row = table.find(x=>x.day===day) || table[0];
      const reward = clone(row.reward || {tickets:200});
      applyRewards(reward);
      state.loginReward = {date:today,tickets:reward.tickets||0,claimedAt:Date.now(),streak,day,title:row.title,reward};
    }
    return state.loginReward;
  }

  function normalize(){
    const oldVersion = Number(state.version || 0);
    if(!state.version || state.version < 32){ state.version = Math.max(32, Number(state.version || 0)); }
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
    if(Number(state.version || 0) < 30){
      state.version = 34;
    }
    state.resources ||= {gold:0,gems:0,tickets:0,dust:0,ssrShards:0};
    state.resources.ssrShards = Number(state.resources.ssrShards || 0);
    state.campaign ||= {selected:1,unlocked:1,highestCleared:0,clears:{}};
    state.roster ||= {};
    state.team ||= [];
    state.inventory ||= [];
    state.gacha ||= {rolls:0,rarePity:0,epicPity:0,legendPity:0,lastResults:[]};
    state.gacha.rarePity = Number(state.gacha.rarePity || 0);
    state.gacha.epicPity = Number(state.gacha.epicPity || 0);
    state.gacha.legendPity = Number(state.gacha.legendPity || 0);
    state.daily ||= {date:todayKey(),wins:0,gachas:0,upgrades:0,bossWins:0,dungeonRuns:{},claimed:{}};
    state.daily.dungeonRuns ||= {};
    state.stats ||= {totalWins:0,totalLosses:0,totalGachas:0,totalUpgrades:0};
    state.stats.totalFusions = Number(state.stats.totalFusions || 0);
    state.stats.totalRebirths = Number(state.stats.totalRebirths || 0);
    state.stats.totalShopBuys = Number(state.stats.totalShopBuys || 0);
    state.idle ||= {last:Date.now()};
    state.settings ||= {battleSpeed:1,heroFilter:'all',heroSort:'power',heroSearch:'',selectedHero:null};
    state.teamPresets ||= {};
    for(const k of ['1','2','3']){
      if(state.teamPresets[k]) state.teamPresets[k] = state.teamPresets[k].slice(0,5).map(id=>state.roster?.[id] ? id : null);
    }
    if(![0.5,0.75,1,2,4,8,12,20,50].includes(Number(state.settings.battleSpeed))) state.settings.battleSpeed = 1;
    if(!['full','skill','result','hidden'].includes(state.settings.logMode)) state.settings.logMode = 'full';
    if(!['lose','ticket','levelcap','raredrop'].includes(state.settings.farmStop)) state.settings.farmStop = 'lose';
    state.settings.heroFilter ||= 'all';
    state.settings.heroSort ||= 'power';
    if(typeof state.settings.heroSearch !== 'string') state.settings.heroSearch = '';
    if(state.settings.selectedHero && !state.roster?.[state.settings.selectedHero]) state.settings.selectedHero = null;
    if(!state.settings.selectedHero){
      const firstTeam = (state.team||[]).find(id=>state.roster?.[id]);
      state.settings.selectedHero = firstTeam || Object.keys(state.roster||{})[0] || null;
    }
    state.favorites ||= {};
    Object.keys(state.favorites).forEach(id=>{ if(!state.roster?.[id]) delete state.favorites[id]; });
    state.codex ||= {seen:{}};
    state.codex.seen ||= {};
    state.achievements ||= {claimed:{}}; state.achievements.claimed ||= {};
    state.codexRewards ||= {claimed:{}}; state.codexRewards.claimed ||= {};
    state.shop ||= {buys:{}}; state.shop.buys ||= {};
    state.loginReward ||= {date:null,tickets:0,claimedAt:null,streak:0,day:0,reward:{}};
    Object.keys(state.roster || {}).forEach(id=>{ if(!state.codex.seen[id]) state.codex.seen[id] = Date.now(); });
    state.lastBattle ||= null;
    state.fusion ||= {selected:[],last:null};
    state.starter ||= {freeRollsLeft:0,firstHero:null,history:[]};
    if(oldVersion < 23 && state.starter && Array.isArray(state.starter.history)){
      const usedFree = Math.max(0, state.starter.history.length - 1);
      state.starter.freeRollsLeft = Math.max(Number(state.starter.freeRollsLeft||0), Math.max(0, 5 - usedFree));
    }
    (state.inventory||[]).forEach(item=>{ if(!item.set){ const sets=Object.keys(G().gearSets||{}); item.set = sets[Math.floor(Math.random()*sets.length)] || 'Grave'; } });
    Object.values(state.roster || {}).forEach(inst=>{
      inst.level = Math.max(1, Math.min(maxHeroLevel(), Number(inst.level || 1))); // V35 max Lv.100
      inst.exp = Math.max(0, Number(inst.exp || 0));
      if(inst.level >= maxHeroLevel()) inst.exp = 0;
      inst.stars = Math.max(1, Math.min(6, Number(inst.stars || 1)));
      inst.rebirth = Math.max(0, Number(inst.rebirth || 0));
      inst.shards = Math.max(0, Number(inst.shards || 0));
      inst.equipped ||= {weapon:null,armor:null,charm:null,boots:null};
    });
    state.team = (state.team||[]).slice(0,5); while(state.team.length<5) state.team.push(null);
    state.team = state.team.map(id => state.roster && state.roster[id] ? id : null);
    state.version = 42;
    state.fusion.selected = (state.fusion.selected||[]).filter(id=>state.roster && state.roster[id] && !state.team.includes(id) && !state.favorites[id]);
    ensureDaily();
    grantDailyLoginReward();
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
      version:42,
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
      state.version = 42;
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
    const sets = Object.keys(G().gearSets || {});
    const set = sets[Math.floor(Math.random()*sets.length)] || 'Grave';
    return {uid:uid(),type,rarity,level,value,name:names[type][Math.floor(Math.random()*names[type].length)],set};
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

  function rebirthMultiplier(rebirth=0){
    const r = Number(rebirth || 0);
    return 1 + r*0.18 + Math.pow(r,1.12)*0.018;
  }

  function heroStatsFrom(def, inst){
    if(!inst || !def) return null;
    const rm = rarityDef(def.rarity).mult;
    const rebirth = Number(inst.rebirth || 0);
    const starM = 1 + (Number(inst.stars || 1)-1)*0.22;
    const level = Math.max(1, Number(inst.level || 1));
    const levelM = 1 + (level-1)*0.035;
    // Rebirth เป็นสแต็กถาวร ยิ่งเกิดใหม่หลายรอบโบนัสยิ่งโตแบบค่อยเป็นค่อยไป
    const rebirthM = rebirthMultiplier(rebirth);
    const stats = {
      hp: Math.round(def.base.hp * rm * starM * levelM * rebirthM),
      atk: Math.round(def.base.atk * rm * starM * levelM * rebirthM),
      def: Math.round(def.base.def * rm * starM * levelM * rebirthM),
      spd: Math.round(def.base.spd * (1 + (level-1)*0.004) + (Number(inst.stars || 1)-1)*2 + rebirth*1.5),
    };
    const setCounts = {};
    for(const slot of Object.keys(inst.equipped||{})){
      const item = getEquipment(inst.equipped[slot]);
      if(!item) continue;
      const stat = eqTypeDef(item.type).stat;
      stats[stat] += item.value;
      if(item.set) setCounts[item.set] = (setCounts[item.set]||0) + 1;
    }
    for(const [setName,count] of Object.entries(setCounts)){
      const set = G().gearSets?.[setName];
      if(!set) continue;
      const bonus = count >= 4 ? set.stats4 : count >= 2 ? set.stats2 : null;
      if(!bonus) continue;
      for(const [k,m] of Object.entries(bonus)) stats[k] = Math.round(stats[k] * m);
    }
    stats.power = Math.round(stats.hp/5 + stats.atk*4 + stats.def*3 + stats.spd*2 + Number(inst.stars || 1)*90 + level*13 + (inst.rebirth||0)*900);
    return stats;
  }

  function heroStats(id){
    const inst = state.roster[id];
    const def = heroDef(id);
    return heroStatsFrom(def, inst);
  }

  function previewRebirth(id){
    const inst = state.roster[id];
    const def = heroDef(id);
    if(!inst || !def) return null;
    const max = maxHeroLevel();
    const currentR = Number(inst.rebirth || 0);
    const nextR = currentR + 1;
    const beforeNow = heroStatsFrom(def, inst);
    const beforeAtCap = heroStatsFrom(def, {...inst, level:max, exp:0, rebirth:currentR});
    const afterImmediate = heroStatsFrom(def, {...inst, level:1, exp:0, rebirth:nextR});
    const afterAtCap = heroStatsFrom(def, {...inst, level:max, exp:0, rebirth:nextR});
    const currentBonus = Math.round((rebirthMultiplier(currentR)-1)*1000)/10;
    const nextBonus = Math.round((rebirthMultiplier(nextR)-1)*1000)/10;
    return {
      id,
      name:def.name,
      can: Number(inst.level||1) >= max,
      currentRebirth: currentR,
      nextRebirth: nextR,
      currentBonus,
      nextBonus,
      bonusGain: Math.round((nextBonus-currentBonus)*10)/10,
      cost: rebirthCost(inst),
      beforeNow,
      beforeAtCap,
      afterImmediate,
      afterAtCap,
    };
  }

  function formationBonus(ids=state.team){
    ids = (ids || []).filter(Boolean).filter(id=>state.roster[id]);
    const defs = ids.map(heroDef).filter(Boolean);
    const roleCount = {}, elemCount = {};
    defs.forEach(d=>{ roleCount[d.role]=(roleCount[d.role]||0)+1; elemCount[d.element]=(elemCount[d.element]||0)+1; });
    const stats = {hp:1,atk:1,def:1,spd:1};
    let heal = 1;
    const active=[];
    for(const b of (G().formationBonuses || [])){
      let ok=false;
      if(b.check?.role) ok = (roleCount[b.check.role]||0) >= b.check.need;
      if(b.check?.sameElement) ok = Object.values(elemCount).some(n=>n >= b.check.sameElement);
      if(b.check?.uniqueElements) ok = Object.keys(elemCount).length >= b.check.uniqueElements;
      if(!ok) continue;
      for(const [k,m] of Object.entries(b.stats||{})) stats[k] *= m;
      if(b.heal) heal *= b.heal;
      active.push(b);
    }
    return {stats, heal, active, powerMult:(stats.hp+stats.atk+stats.def+stats.spd)/4};
  }

  function teamPower(ids=state.team){
    const base = ids.filter(Boolean).reduce((sum,id)=>sum + (heroStats(id)?.power || 0),0);
    return Math.round(base * formationBonus(ids).powerMult);
  }

  function maxHeroLevel(){
    return 100;
  }

  function expToNext(inst){
    const lv = Number(inst?.level || 1);
    const rb = Number(inst?.rebirth || 0);
    if(lv >= maxHeroLevel()) return 0;
    // EXP จากการสู้ ใช้คู่กับ Gold Upgrade: ฟาร์มก็เลเวลขึ้นได้เอง แต่การกดอัปยังเร็วกว่า
    return Math.round((90 + lv*38 + Math.pow(lv,1.34)*15) * (1 + rb*0.12));
  }

  function battleExpForStage(stageId, isBoss=false){
    const id = Math.max(1, Number(stageId || 1));
    const base = 45 + id*10 + Math.pow(id,1.08)*5;
    return Math.round(base * (isBoss ? 1.75 : 1));
  }

  function grantTeamExp(stageId, isBoss=false){
    const exp = battleExpForStage(stageId, isBoss);
    const details = [];
    for(const id of (state.team || []).filter(Boolean)){
      const inst = state.roster[id];
      const def = heroDef(id);
      if(!inst || !def || inst.level >= maxHeroLevel()) continue;
      let leveled = 0;
      inst.exp = Number(inst.exp || 0) + exp;
      while(inst.level < maxHeroLevel()){
        const need = expToNext(inst);
        if(need <= 0 || inst.exp < need) break;
        inst.exp -= need;
        inst.level++;
        leveled++;
      }
      if(inst.level >= maxHeroLevel()) inst.exp = 0;
      details.push({id,name:def.name,exp,leveled,level:inst.level});
    }
    return {exp,details,leveled:details.reduce((n,x)=>n+x.leveled,0)};
  }

  function levelCost(inst){
    const rebirth = Number(inst.rebirth || 0);
    return Math.round((130 + inst.level*55 + Math.pow(inst.level,1.45)*12) * (1 + rebirth*0.18));
  }

  function rebirthCost(inst){
    const r = Number(inst.rebirth || 0);
    return {
      gold: Math.round(35000 + Math.pow(r+1,1.7)*18000 + r*42000),
      dust: Math.round(650 + Math.pow(r+1,1.5)*260 + r*520),
    };
  }
  function starCost(inst){ return inst.stars * 60; }
  function shardsNeeded(stars){ return 18 + stars*14; }

  function previewStar(id){
    const inst = state.roster[id];
    const def = heroDef(id);
    if(!inst || !def) return null;
    const currentStars = Number(inst.stars || 1);
    const maxStars = 6;
    const need = currentStars < maxStars ? shardsNeeded(currentStars) : 0;
    const cost = currentStars < maxStars ? starCost(inst) : 0;
    const before = heroStatsFrom(def, inst);
    const afterInst = {...inst, stars: Math.min(maxStars, currentStars + 1)};
    const after = heroStatsFrom(def, afterInst);
    return {
      id,
      can: currentStars < maxStars && Number(inst.shards || 0) >= need && state.resources.dust >= cost,
      currentStars,
      nextStars: Math.min(maxStars, currentStars + 1),
      maxStars,
      need,
      cost,
      shards: Number(inst.shards || 0),
      before,
      after,
      gain:{
        hp: after.hp - before.hp,
        atk: after.atk - before.atk,
        def: after.def - before.def,
        spd: after.spd - before.spd,
        power: after.power - before.power
      }
    };
  }

  function addHero(id){
    const def = heroDef(id);
    if(!def) return null;
    const shardGain = rarityDef(def.rarity).shard;
    state.codex ||= {seen:{}}; state.codex.seen ||= {}; state.codex.seen[id] = state.codex.seen[id] || Date.now();
    if(state.roster[id]){
      state.roster[id].shards += shardGain;
      return {type:'shards',hero:def,amount:shardGain};
    }
    state.roster[id] = {id,level:1,exp:0,stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
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
    if(force === 'Rare') pool = pool.filter(h=>['Rare','Epic','Legendary','Mythic'].includes(h.rarity));
    if(force === 'Epic') pool = pool.filter(h=>['Epic','Legendary','Mythic'].includes(h.rarity)); // SSR ไม่เข้า pity เพื่อให้ ultra-rare จริง
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
      state.gacha.rarePity++;
      state.gacha.epicPity++;
      state.gacha.legendPity++;
      let force='';
      if(state.gacha.legendPity >= 200){ force='Legendary'; }
      else if(state.gacha.epicPity >= 50){ force='Epic'; }
      else if(state.gacha.rarePity >= 10){ force='Rare'; }
      const h = weightedHeroRoll(force);
      const rank = rarityRank(h.rarity);
      if(rank >= 1) state.gacha.rarePity = 0;
      if(rank >= 2) state.gacha.epicPity = 0;
      if(rank >= 3) state.gacha.legendPity = 0;
      results.push(addHero(h.id));
    }
    state.gacha.lastResults = results;
    state.daily.gachas += count;
    state.stats.totalGachas += count;
    save();
    return {ok:true,results};
  }

  function teamCandidates(){
    return Object.keys(state.roster)
      .filter(id=>state.roster[id] && heroDef(id))
      .map(id=>({id, def:heroDef(id), inst:state.roster[id], stats:heroStats(id), power:heroStats(id).power}));
  }

  function arrangeTeam(chosen){
    const unique=[];
    for(const id of chosen){
      if(id && state.roster[id] && !unique.includes(id)) unique.push(id);
      if(unique.length >= 5) break;
    }
    const front = unique.filter(id=>['Tank','Warrior'].includes(heroDef(id).role)).slice(0,2);
    const rest = unique.filter(id=>!front.includes(id));
    while(front.length < 2 && rest.length) front.push(rest.shift());
    const arranged = [...front, ...rest].slice(0,5);
    while(arranged.length < 5) arranged.push(null);
    return arranged;
  }

  function autoTeamStyle(style='balanced'){
    const owned = teamCandidates();
    if(!owned.length){ state.team = [null,null,null,null,null]; save(); return {ok:false,msg:'ยังไม่มีปีศาจ'}; }
    const byPower = [...owned].sort((a,b)=>b.power-a.power);
    const bySpeed = [...owned].sort((a,b)=>b.stats.spd-a.stats.spd || b.power-a.power);
    const byTank = owned.filter(x=>x.def.role==='Tank').sort((a,b)=>b.power-a.power);
    const bySupport = owned.filter(x=>x.def.role==='Support').sort((a,b)=>b.power-a.power);
    const byDps = owned.filter(x=>!['Tank','Support'].includes(x.def.role)).sort((a,b)=>b.power-a.power);
    const byMage = owned.filter(x=>x.def.role==='Mage').sort((a,b)=>b.power-a.power);
    const byAssassin = owned.filter(x=>x.def.role==='Assassin').sort((a,b)=>b.stats.spd-a.stats.spd || b.power-a.power);
    const byRanger = owned.filter(x=>x.def.role==='Ranger').sort((a,b)=>b.stats.spd-a.stats.spd || b.power-a.power);
    let chosen=[];
    if(style === 'survival'){
      chosen = [...byTank.slice(0,2), ...bySupport.slice(0,2), ...byDps.slice(0,1), ...byPower];
    } else if(style === 'boss'){
      chosen = [...byTank.slice(0,1), ...bySupport.slice(0,1), ...byDps.slice(0,3), ...byPower];
    } else if(style === 'speed'){
      chosen = [...byAssassin.slice(0,2), ...byRanger.slice(0,2), ...byMage.slice(0,1), ...bySpeed];
    } else if(style === 'magic'){
      chosen = [...byMage.slice(0,3), ...bySupport.slice(0,1), ...byTank.slice(0,1), ...byPower];
    } else if(style === 'sameElement'){
      const groups = {};
      for(const x of owned){ (groups[x.def.element] ||= []).push(x); }
      const best = Object.values(groups).sort((a,b)=>b.reduce((s,x)=>s+x.power,0)-a.reduce((s,x)=>s+x.power,0))[0] || [];
      chosen = [...best.sort((a,b)=>b.power-a.power), ...byTank, ...bySupport, ...byPower];
    } else if(style === 'farm'){
      chosen = [...bySpeed.slice(0,2), ...byDps.slice(0,2), ...bySupport.slice(0,1), ...byPower];
    } else {
      chosen = [...byTank.slice(0,1), ...byDps.slice(0,1), ...bySupport.slice(0,1), ...byDps.slice(1), ...byTank.slice(1), ...bySupport.slice(1), ...byPower];
    }
    state.team = arrangeTeam(chosen.map(x=>x.id || x));
    save();
    const labels = {balanced:'สมดุล',farm:'ฟาร์มไว',boss:'บอส',survival:'ถึก/ปลอดภัย',speed:'สปีด/Press Turn',magic:'เวทหมู่',sameElement:'ธาตุเดียว'};
    return {ok:true,style,label:labels[style]||style,team:state.team};
  }

  function autoTeam(){
    const r = autoTeamStyle('balanced');
    return r.team || state.team;
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


  function levelUpMany(id, amount=10){
    ensureDaily();
    const inst = state.roster[id];
    if(!inst) return {ok:false,count:0,msg:'ไม่มีมอนสเตอร์นี้'};
    if(inst.level >= maxHeroLevel()) return {ok:false,count:0,msg:'ถึงเลเวลสูงสุดแล้ว กด Rebirth เพื่อเกิดใหม่'};
    let count = 0;
    const maxLoops = amount === 'max' ? 2000 : Math.max(1, Number(amount || 1));
    while(count < maxLoops && inst.level < maxHeroLevel()){
      const cost = levelCost(inst);
      if(state.resources.gold < cost) break;
      state.resources.gold -= cost;
      inst.level++;
      count++;
    }
    if(count){
      state.daily.upgrades += count;
      state.stats.totalUpgrades += count;
      save();
      return {ok:true,count,msg:`อัปเลเวล ${count} ครั้งแล้ว`};
    }
    return {ok:false,count:0,msg:'Gold ไม่พอ'};
  }

  function upgradeOneHero(id){
    ensureDaily();
    const inst = state.roster[id];
    if(!inst) return {ok:false,msg:'ไม่มีมอนสเตอร์นี้'};
    let levelCount = 0, starCount = 0;
    for(let loop=0; loop<10 && inst.stars < 6; loop++){
      const need = shardsNeeded(inst.stars);
      const dust = starCost(inst);
      if(inst.shards < need || state.resources.dust < dust) break;
      inst.shards -= need;
      state.resources.dust -= dust;
      inst.stars++;
      starCount++;
    }
    let guard = 0;
    while(guard++ < 2000 && inst.level < maxHeroLevel()){
      const cost = levelCost(inst);
      if(state.resources.gold < cost) break;
      state.resources.gold -= cost;
      inst.level++;
      levelCount++;
    }
    if(levelCount || starCount){
      const total = levelCount + starCount;
      state.daily.upgrades += total;
      state.stats.totalUpgrades += total;
      save();
      return {ok:true,levelCount,starCount,msg:`อัปเฉพาะตัวนี้: Lv +${levelCount}, ดาว +${starCount}`};
    }
    const rb = rebirthCost(inst);
    if(inst.level >= maxHeroLevel()) return {ok:false,msg:`ถึง Lv.${maxHeroLevel()} แล้ว ถ้ามี Gold ${fmt(rb.gold)} และ Dust ${fmt(rb.dust)} ให้กด Rebirth`};
    return {ok:false,msg:'ทรัพยากรไม่พอสำหรับอัปตัวนี้'};
  }

  function setSelectedHero(id){
    if(!state.roster[id]) return {ok:false,msg:'ไม่มีมอนสเตอร์นี้'};
    state.settings ||= {};
    state.settings.selectedHero = id;
    save();
    return {ok:true,id};
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
    const preview = previewStar(id);
    save();
    return {ok:true,stars:inst.stars,preview};
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
    inst.exp = 0;
    inst.rebirth = Number(inst.rebirth || 0) + 1;
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    state.stats.totalRebirths = Number(state.stats.totalRebirths || 0) + 1;
    save();
    return {ok:true,rebirth:inst.rebirth};
  }


  function bulkStarUpAll(){
    ensureDaily();
    let count = 0;
    let heroes = 0;
    let spentDust = 0;
    const perHero = {};
    const order = Object.keys(state.roster || {})
      .filter(id=>state.roster[id] && heroDef(id))
      .sort((a,b)=> (state.team.includes(b)-state.team.includes(a)) || (heroStats(b).power-heroStats(a).power));
    let guard = 0;
    while(guard++ < 1000){
      let changed = false;
      for(const id of order){
        const inst = state.roster[id];
        if(!inst || inst.stars >= 6) continue;
        const need = shardsNeeded(inst.stars);
        const dust = starCost(inst);
        if(Number(inst.shards || 0) < need || state.resources.dust < dust) continue;
        inst.shards -= need;
        state.resources.dust -= dust;
        inst.stars++;
        count++;
        spentDust += dust;
        perHero[id] = (perHero[id] || 0) + 1;
        changed = true;
      }
      if(!changed) break;
    }
    heroes = Object.keys(perHero).length;
    if(count){
      state.daily.upgrades += count;
      state.stats.totalUpgrades += count;
      save();
      return {ok:true,count,heroes,spentDust,msg:`อัปดาวทั้งหมด ${count} ครั้ง จาก ${heroes} ตัว ใช้ Dust ${fmt(spentDust)}`};
    }
    return {ok:false,count:0,heroes:0,spentDust:0,msg:'ยังไม่มีตัวที่อัปดาวได้ หรือ Dust/Shard ไม่พอ'};
  }

  function bulkRebirthAll(){
    ensureDaily();
    let count = 0;
    let spentGold = 0;
    let spentDust = 0;
    const names = [];
    const order = Object.keys(state.roster || {})
      .filter(id=>state.roster[id] && heroDef(id))
      .sort((a,b)=> (state.team.includes(b)-state.team.includes(a)) || (heroStats(b).power-heroStats(a).power));
    for(const id of order){
      const inst = state.roster[id];
      if(!inst || inst.level < maxHeroLevel()) continue;
      const cost = rebirthCost(inst);
      if(state.resources.gold < cost.gold || state.resources.dust < cost.dust) continue;
      state.resources.gold -= cost.gold;
      state.resources.dust -= cost.dust;
      inst.level = 1;
      inst.exp = 0;
      inst.rebirth = Number(inst.rebirth || 0) + 1;
      count++;
      spentGold += cost.gold;
      spentDust += cost.dust;
      names.push(heroDef(id).name);
    }
    if(count){
      state.daily.upgrades += count;
      state.stats.totalUpgrades += count;
      state.stats.totalRebirths = Number(state.stats.totalRebirths || 0) + count;
      save();
      return {ok:true,count,spentGold,spentDust,names,msg:`Rebirth ทั้งหมด ${count} ตัว ใช้ Gold ${fmt(spentGold)} + Dust ${fmt(spentDust)}`};
    }
    return {ok:false,count:0,msg:`ยังไม่มีตัว Lv.${maxHeroLevel()} ที่ Rebirth ได้ หรือทรัพยากรไม่พอ`};
  }

  function bulkUpgradeTeamToCap(){
    ensureDaily();
    const ids = (state.team || []).filter(id=>id && state.roster[id]);
    if(!ids.length) return {ok:false,count:0,msg:'ยังไม่มีทีม'};
    let count = 0;
    let guard = 0;
    while(guard++ < 2000){
      const candidates = ids.map(id=>({id,inst:state.roster[id]}))
        .filter(x=>x.inst.level < maxHeroLevel())
        .map(x=>({...x,cost:levelCost(x.inst)}))
        .filter(x=>x.cost <= state.resources.gold)
        .sort((a,b)=>a.inst.level-b.inst.level || a.cost-b.cost);
      if(!candidates.length) break;
      state.resources.gold -= candidates[0].cost;
      candidates[0].inst.level++;
      candidates[0].inst.exp = 0;
      count++;
    }
    if(count){
      state.daily.upgrades += count;
      state.stats.totalUpgrades += count;
      save();
      return {ok:true,count,msg:`อัปเลเวลทีมปัจจุบัน ${count} ครั้ง`};
    }
    return {ok:false,count:0,msg:'Gold ไม่พอ หรือทีมถึง Lv.100 แล้ว'};
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


  function equippedUidSet(){
    const used = new Set();
    Object.values(state.roster || {}).forEach(h=>{
      Object.values(h.equipped || {}).forEach(uid=>{ if(uid) used.add(uid); });
    });
    return used;
  }

  function autoSellLow(maxRarity='Rare'){
    const maxRank = G().equipmentRarities[maxRarity]?.score ?? 2;
    const used = equippedUidSet();
    let sold = 0, gold = 0, dust = 0;
    state.inventory = (state.inventory || []).filter(item=>{
      const rare = G().equipmentRarities[item.rarity] || G().equipmentRarities.Common;
      const shouldSell = !used.has(item.uid) && rare.score <= maxRank;
      if(shouldSell){
        sold++;
        gold += Math.max(5, Math.round((item.value || 10) * (6 + rare.score * 2)));
        dust += Math.max(1, Math.round(rare.score * 2 + (item.level || 1) * 0.4));
        return false;
      }
      return true;
    });
    if(sold){
      state.resources.gold += gold;
      state.resources.dust += dust;
      save();
      return {ok:true,sold,gold,dust,msg:`ขาย/ย่อยของ ${sold} ชิ้น ได้ Gold ${fmt(gold)} และ Dust ${fmt(dust)}`};
    }
    return {ok:false,sold:0,msg:'ไม่มีอุปกรณ์ Common/Rare ที่ไม่ได้ใส่อยู่ให้ขาย'};
  }

  function autoFusionLow(limit=10){
    limit = Math.max(1, Math.min(50, Number(limit || 10)));
    let count = 0;
    const results = [];
    const originalTeam = (state.team || []).slice(0,5);
    while(count < limit){
      const spare = Object.keys(state.roster || {})
        .filter(id=>!state.team.includes(id) && !state.favorites?.[id])
        .map(id=>({id, inst:state.roster[id], def:heroDef(id), st:heroStats(id)}))
        .filter(x=>x.def && ['Common','Rare'].includes(x.def.rarity) && (x.inst.stars || 1) <= 2 && (x.inst.rebirth || 0) === 0)
        .sort((a,b)=>rarityRank(a.def.rarity)-rarityRank(b.def.rarity) || (a.inst.level||1)-(b.inst.level||1) || (a.st?.power||0)-(b.st?.power||0));
      if(spare.length < 2) break;
      state.fusion ||= {selected:[],last:null};
      state.fusion.selected = [spare[0].id, spare[1].id];
      const preview = fusionPreview(state.fusion.selected);
      if(!preview.ok) break;
      if(state.resources.gold < preview.cost.gold || state.resources.dust < preview.cost.dust) break;
      const r = doFusion();
      if(!r.ok) break;
      // doFusion เรียก autoTeam เดิมไว้ จึงคืนทีมเดิมถ้าตัวในทีมยังอยู่ครบ
      state.team = originalTeam.map(id=>id && state.roster[id] ? id : null);
      results.push(r.result.name);
      count++;
    }
    state.fusion.selected = [];
    save();
    if(count) return {ok:true,count,results,msg:`Auto Fusion วัตถุดิบต่ำ ${count} ครั้ง: ${results.slice(0,4).join(', ')}${results.length>4?'...':''}`};
    return {ok:false,count:0,msg:'ยังไม่มี Common/Rare สำรองที่ผสมได้ หรือทรัพยากรไม่พอ'};
  }

  function saveTeamPreset(slot){
    slot = String(slot || '1');
    state.teamPresets ||= {};
    state.teamPresets[slot] = (state.team || []).slice(0,5).map(id=>state.roster?.[id] ? id : null);
    save();
    return {ok:true,slot,team:state.teamPresets[slot]};
  }

  function loadTeamPreset(slot){
    slot = String(slot || '1');
    state.teamPresets ||= {};
    const preset = state.teamPresets[slot];
    if(!preset) return {ok:false,msg:`ยังไม่มีทีม Preset ${slot}`};
    state.team = preset.slice(0,5).map(id=>state.roster?.[id] ? id : null);
    while(state.team.length < 5) state.team.push(null);
    state.fusion.selected = (state.fusion.selected || []).filter(id=>!state.team.includes(id));
    save();
    return {ok:true,slot};
  }

  function teamPresetPower(slot){
    const preset = state.teamPresets?.[String(slot)] || [];
    return teamPower(preset);
  }


  function autoUpgrade(){
    ensureDaily();
    let count=0;
    // V35: อัปเกรดอัตโนมัติจะใช้ทีมปัจจุบันเท่านั้น
    // ไม่เรียก autoTeam() เพื่อไม่ให้ระบบเปลี่ยนทีมที่ผู้เล่นจัดไว้เอง
    const currentTeam = (state.team || []).slice(0,5).filter(id => id && state.roster[id]);
    if(!currentTeam.length) return 0;

    count += equipBest();
    // อัปดาวก่อนถ้าทำได้ เฉพาะตัวในทีมปัจจุบัน
    for(let loop=0; loop<5; loop++){
      let changed=false;
      for(const id of currentTeam){
        const r = starUp(id);
        if(r.ok){ count++; changed=true; }
      }
      if(!changed) break;
    }
    // อัปเลเวลแบบเฉลี่ยทีม เฉพาะตัวในทีมปัจจุบัน
    let guard = 0;
    while(guard++ < 260){
      const candidates = currentTeam
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


  function rarityRank(r){ return {Common:0,Rare:1,Epic:2,Legendary:3,Mythic:4,SSR:5}[r] ?? 0; }
  function rankRarity(rank){ return ['Common','Rare','Epic','Legendary','Mythic','SSR'][Math.max(0,Math.min(5,rank))]; }

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
      state.roster[result.id] = {id:result.id,level:Math.min(maxHeroLevel(), Math.max(1,avgLevel+1)),exp:0,stars:1,rebirth:0,shards:0,equipped:{weapon:null,armor:null,charm:null,boots:null}};
      state.codex ||= {seen:{}}; state.codex.seen ||= {}; state.codex.seen[result.id] = state.codex.seen[result.id] || Date.now();
      gain = {type:'new',amount:0};
    }
    state.fusion.last = {from:[a,b],result:result.id,at:Date.now(),gain,random:!!prev.isRandom,poolNote:prev.poolNote};
    state.fusion.selected = [];
    state.daily.upgrades++;
    state.stats.totalUpgrades++;
    state.stats.totalFusions = Number(state.stats.totalFusions || 0) + 1;
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
    state.version = 42;
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
    if(first && st.isBoss && stageId % 50 === 0){
      reward.gems = (reward.gems||0) + 150 + Math.floor(stageId/2);
      reward.tickets = (reward.tickets||0) + 2;
      reward.dust = (reward.dust||0) + 500 + stageId*3;
    }
    if(first && st.isBoss && stageId % 100 === 0){
      reward.gems = (reward.gems||0) + 350 + stageId;
      reward.tickets = (reward.tickets||0) + 3;
      reward.dust = (reward.dust||0) + 1200 + stageId*4;
    }
    let item = null;
    const dropChance = st.isBoss ? 0.62 : 0.18;
    if(Math.random() < dropChance){
      item = randomEquipment(stageId, st.isBoss);
      state.inventory.push(item);
    }
    const expReward = grantTeamExp(stageId, st.isBoss);
    applyRewards(reward);
    save();
    return {reward,first,item,exp:expReward};
  }


  function dungeonDef(id){ return (G().dungeons || []).find(d=>d.id===id); }
  function dungeonRunsLeft(id){
    ensureDaily();
    const d = dungeonDef(id);
    if(!d) return 0;
    return Math.max(0, Number(d.runsPerDay||0) - Number(state.daily.dungeonRuns[id]||0));
  }
  function dungeonStage(id){
    const d = dungeonDef(id);
    if(!d) return null;
    const baseStage = Math.max(1, state.campaign.highestCleared || state.campaign.selected || 1);
    const scale = Number(((0.88 + Math.pow(baseStage,1.12)*0.035 + baseStage*0.04) * (d.powerMul || 1)).toFixed(3));
    return {
      id:100000 + (G().dungeons||[]).findIndex(x=>x.id===id) + 1,
      dungeonId:id,
      difficultyId:baseStage,
      title:d.title,
      area:'Daily Dungeon',
      isBoss:true,
      modifier:{id:'dungeon',title:d.title,desc:d.desc,effects:{enemyAtk:1,enemyHp:1,enemyDef:1,enemySpd:1}},
      bossSkill:{id:'dungeon_keeper',title:'Dungeon Keeper',desc:'ศัตรูปรับระดับตามด่านสูงสุดของผู้เล่น',effects:{bossHp:1.15,bossAtk:1.06}},
      enemyCount:4,
      power:Math.round(560 * scale * 4.2),
      enemyScale:scale,
      firstReward:{},repeatReward:{},
      dungeon:d,
    };
  }
  function dungeonReward(id, win=true){
    const d = dungeonDef(id); if(!d || !win) return {};
    const base = Math.max(1, state.campaign.highestCleared || state.campaign.selected || 1);
    if(d.kind === 'gold') return {gold: Math.round(10000 + base*620 + Math.pow(base,1.12)*40)};
    if(d.kind === 'dust') return {dust: Math.round(900 + base*38 + Math.pow(base,1.08)*14)};
    if(d.kind === 'tickets') return {tickets: 4 + Math.floor(base/120)};
    if(d.kind === 'ssrShards') return {ssrShards: 1 + Math.floor(base/750), dust: Math.round(600 + base*10)};
    if(d.kind === 'shard') return {dust: Math.round(350 + base*12)};
    if(d.kind === 'gear') return {gold: Math.round(1800 + base*75)};
    return {gold:1000};
  }
  function completeDungeon(id, win){
    ensureDaily();
    const d = dungeonDef(id);
    if(!d) return {ok:false,msg:'ไม่พบ Dungeon',reward:{}};
    if(dungeonRunsLeft(id) <= 0) return {ok:false,msg:'วันนี้ลงดันเจี้ยนนี้ครบแล้ว',reward:{}};
    state.daily.dungeonRuns[id] = Number(state.daily.dungeonRuns[id] || 0) + 1;
    if(!win){ state.stats.totalLosses++; save(); return {ok:true,reward:{},msg:'แพ้ใน Dungeon'}; }
    state.stats.totalWins++;
    state.daily.wins++;
    const reward = dungeonReward(id,true);
    let item = null, shard = null;
    if(d.kind === 'gear'){
      item = randomEquipment(Math.max(1,state.campaign.highestCleared||1), true);
      state.inventory.push(item);
    }
    if(d.kind === 'shard'){
      const owned = Object.keys(state.roster || {});
      if(owned.length){
        const hid = owned[Math.floor(Math.random()*owned.length)];
        const def = heroDef(hid);
        const amount = Math.round(18 * (rarityDef(def.rarity)?.mult || 1));
        state.roster[hid].shards = Number(state.roster[hid].shards || 0) + amount;
        shard = {id:hid,name:def.name,amount};
      }
    }
    const exp = grantTeamExp(Math.max(1,state.campaign.highestCleared||1), true);
    applyRewards(reward);
    save();
    return {ok:true,reward,item,shard,exp,msg:`เคลียร์ ${d.title}`};
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
    const map = {gold:'Gold',gems:'Gem',tickets:'Ticket',dust:'Dust',ssrShards:'SSR Shard'};
    return Object.entries(reward).filter(([k,v])=>v).map(([k,v])=>`+${fmt(v)} ${map[k]||k}`).join('  ');
  }


  function resourceEnough(cost){
    return Object.entries(cost||{}).every(([k,v]) => (state.resources[k]||0) >= v);
  }
  function payCost(cost){
    for(const [k,v] of Object.entries(cost||{})) state.resources[k] = (state.resources[k]||0) - v;
  }

  function shopPurchase(id){
    const item = (G().shopItems || []).find(x=>x.id===id);
    if(!item) return {ok:false,msg:'ไม่พบสินค้า'};
    if(!resourceEnough(item.cost)) return {ok:false,msg:'ทรัพยากรไม่พอซื้อ'};
    payCost(item.cost);
    let msg = `ซื้อ ${item.title} แล้ว`;
    let detail = null;
    if(item.kind === 'resource'){
      applyRewards(item.reward);
      detail = item.reward;
      msg += `: ${resourceText(item.reward)}`;
    } else if(item.kind === 'shard'){
      const owned = Object.keys(state.roster || {});
      if(!owned.length) return {ok:false,msg:'ยังไม่มีปีศาจให้รับ Shard'};
      const id = owned[Math.floor(Math.random()*owned.length)];
      const def = heroDef(id);
      const amount = Math.round(item.amount * (rarityDef(def.rarity)?.mult || 1));
      state.roster[id].shards = (state.roster[id].shards||0) + amount;
      detail = {id,amount};
      msg += `: ${def.name} Shard +${amount}`;
    } else if(item.kind === 'gear'){
      const stageId = Math.max(1, state.campaign.highestCleared || state.campaign.selected || 1);
      const gear = randomEquipment(stageId, true);
      state.inventory.push(gear);
      detail = gear;
      msg += `: ได้ ${gear.name}${eqTypeDef(gear.type).label}`;
    }
    state.stats.totalShopBuys = Number(state.stats.totalShopBuys || 0) + 1;
    state.shop.buys[id] = Number(state.shop.buys[id] || 0) + 1;
    save();
    return {ok:true,msg,detail};
  }

  function achievementProgress(a){
    if(!a) return 0;
    if(a.check === 'stage') return state.campaign.highestCleared || 0;
    if(a.check === 'wins') return state.stats.totalWins || 0;
    if(a.check === 'fusions') return state.stats.totalFusions || 0;
    if(a.check === 'rebirths') return state.stats.totalRebirths || 0;
    if(a.check === 'codexTotal') return Object.keys(state.codex?.seen || {}).length;
    if(a.check === 'rarity') return Object.keys(state.codex?.seen || {}).filter(id=>heroDef(id)?.rarity === a.rarity).length;
    return 0;
  }

  function achievementClaim(id){
    const a = (G().achievements || []).find(x=>x.id===id);
    if(!a) return {ok:false,msg:'ไม่พบ Achievement'};
    if(state.achievements.claimed[id]) return {ok:false,msg:'รับไปแล้ว'};
    if(achievementProgress(a) < a.need) return {ok:false,msg:'ยังทำไม่ครบ'};
    applyRewards(a.reward);
    state.achievements.claimed[id] = true;
    save();
    return {ok:true,reward:a.reward,msg:`รับ ${a.title}: ${resourceText(a.reward)}`};
  }

  function codexRarityCount(rarity){
    return Object.keys(state.codex?.seen || {}).filter(id=>heroDef(id)?.rarity === rarity).length;
  }

  function codexRewardProgress(r){ return codexRarityCount(r.rarity); }

  function codexRewardClaim(id){
    const r = (G().codexRewards || []).find(x=>x.id===id);
    if(!r) return {ok:false,msg:'ไม่พบรางวัล Codex'};
    if(state.codexRewards.claimed[id]) return {ok:false,msg:'รับไปแล้ว'};
    if(codexRewardProgress(r) < r.need) return {ok:false,msg:'ยังสะสมไม่ครบ'};
    applyRewards(r.reward);
    state.codexRewards.claimed[id] = true;
    save();
    return {ok:true,reward:r.reward,msg:`รับ Codex Reward: ${resourceText(r.reward)}`};
  }

  function nextGoal(){
    const tp = teamPower();
    const st = selectedStage();
    const goals=[];
    if((state.starter?.freeRollsLeft||0)>0) goals.push(`สุ่มฟรีเริ่มต้นให้ครบ เหลือ ${state.starter.freeRollsLeft} ครั้ง`);
    if(state.team.filter(Boolean).length < 3) goals.push('จัดทีมให้มีอย่างน้อย 3 ตัว');
    if(tp < stageEnemyPower(st)) goals.push(`ฟาร์ม Gold แล้วอัปเกรดทีมนี้ก่อนลุยด่าน ${st.id}`);
    const maxed = state.team.filter(Boolean).find(id=>state.roster[id]?.level >= maxHeroLevel());
    if(maxed) goals.push(`${heroDef(maxed).name} Lv.${maxHeroLevel()} แล้ว กด Rebirth ได้ถ้าทรัพยากรพอ`);
    const claimAch = (G().achievements||[]).find(a=>!state.achievements.claimed[a.id] && achievementProgress(a)>=a.need);
    if(claimAch) goals.push(`มี Achievement รับได้: ${claimAch.title}`);
    const claimCodex = (G().codexRewards||[]).find(r=>!state.codexRewards.claimed[r.id] && codexRewardProgress(r)>=r.need);
    if(claimCodex) goals.push(`มี Codex Reward รับได้: ${claimCodex.title}`);
    const openDungeon = (G().dungeons||[]).find(d=>dungeonRunsLeft(d.id)>0);
    if(openDungeon) goals.push(`ยังมี Dungeon ลงได้: ${openDungeon.title}`);
    if((state.resources.ssrShards||0) >= 100) goals.push('SSR Shard ครบ 100 แล้ว รอระบบแลก SSR ในอัปเดตถัดไป');
    if(!goals.length) goals.push(`ลุย/ฟาร์มด่าน ${st.id} เพื่อไต่ไปด่าน 3000`);
    return goals.slice(0,3);
  }

  return {
    get state(){ return state; }, load, save, reset, exportSaveText, importSaveText, fmt, todayKey, grantDailyLoginReward,
    heroDef, stageDef, rarityDef, heroStats, previewRebirth, previewStar, rebirthMultiplier, formationBonus, teamPower, maxHeroLevel, expToNext, battleExpForStage, levelCost, rebirthCost, rebirthHero, starCost, shardsNeeded,
    addHero, starterRecruit, gacha, autoTeam, autoTeamStyle, levelUp, levelUpMany, upgradeOneHero, bulkUpgradeTeamToCap, setSelectedHero, starUp, bulkStarUpAll, bulkRebirthAll, autoUpgrade, equipBest, autoSellLow, autoFusionLow, saveTeamPreset, loadTeamPreset, teamPresetPower,
    isFavorite, toggleFavorite, codexSeen, setLastBattle, backupNow, exportBackupText,
    fusionPreview, toggleFusion, clearFusion, doFusion, autoFusion, rarityRank,
    selectedStage, selectStage, completeStage, dungeonDef, dungeonRunsLeft, dungeonStage, dungeonReward, completeDungeon, stageEnemyPower,
    makeEquipment, randomEquipment, getEquipment, idlePreview, claimIdle,
    questProgress, questClaim, shopPurchase, achievementProgress, achievementClaim, codexRewardProgress, codexRewardClaim, nextGoal, resourceText
  };
})();
