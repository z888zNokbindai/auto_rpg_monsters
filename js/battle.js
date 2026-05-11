window.BattleSim = (() => {
  const D = () => window.GameData;
  const S = () => window.GameState;

  function rint(a,b){ return Math.floor(a + Math.random()*(b-a+1)); }
  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
  function alive(units){ return units.filter(u=>u.hp>0); }
  function clamp(v,a,b){ return Math.max(a,Math.min(b,v)); }
  function elementMult(att, def){
    const e = D().elements[att.element];
    if(!e) return 1;
    if(e.strong === def.element) return 1.35;
    if(e.weak === def.element) return .72;
    return 1;
  }
  function isWeak(att,target){ return elementMult(att,target) > 1.01; }
  function isResist(att,target){ return elementMult(att,target) < .99; }

  function calcDamage(att, target, scale=1){
    const affinity = elementMult(att,target);
    let dmg = att.atk * scale - target.def * 0.42;
    dmg *= affinity;
    dmg *= (0.9 + Math.random()*0.22);
    if(att.buffAtk>0) dmg *= 1.22;
    if(target.guard>0) dmg *= .66;
    if(target.cursed>0) dmg *= 1.12;
    const baseMiss = 0.055 + Math.max(0, (target.spd - att.spd) * 0.0015);
    const miss = Math.random() < clamp(baseMiss, .04, .18);
    let crit = !miss && Math.random() < (att.crit || .08);
    if(crit) dmg *= 1.65;
    return {
      amount: miss ? 0 : Math.max(12, Math.round(dmg)),
      crit,
      miss,
      weak: !miss && affinity > 1.01,
      resist: !miss && affinity < .99,
      affinity
    };
  }

  function makeHeroUnit(heroId, slot){
    const def = S().heroDef(heroId);
    const st = S().heroStats(heroId);
    const inst = S().state.roster[heroId];
    return {
      uid:'a_'+heroId,
      side:'ally',
      heroId,
      name:def.name,
      icon:def.icon,
      rarity:def.rarity,
      element:def.element,
      role:def.role,
      ai:def.ai,
      skill:def.skill,
      slot,
      maxHp:st.hp,
      hp:st.hp,
      atk:st.atk,
      def:st.def,
      spd:st.spd,
      energy:45,
      stars:inst.stars,
      level:inst.level,
      shield:0, poison:0, burn:0, stun:0, guard:0, cursed:0, buffAtk:0,
      crit: def.role==='Assassin' ? .20 : def.role==='Ranger' ? .11 : .08,
      damage:0, heal:0, taken:0
    };
  }

  function scaleEnemy(template, stage, idx){
    const boss = stage.isBoss;
    const m = stage.enemyScale || (0.92 + stage.id*0.145 + Math.pow(stage.id,1.22)*0.023);
    const countPenalty = boss ? 1.24 : (stage.enemyCount <=2 ? .92 : stage.enemyCount <=3 ? 1.02 : .96);
    return {
      uid:'e_'+idx,
      side:'enemy',
      name: boss && idx===0 ? template.name : template.name,
      icon: template.icon,
      rarity: boss && idx===0 ? 'Boss':'Enemy',
      element: template.element,
      role: template.role,
      ai: template.ai,
      skill: boss && idx===0 ? 'ท่าบอส' : 'สกิลศัตรู',
      slot: idx,
      maxHp: Math.round(template.base.hp * m * countPenalty * (boss && idx===0 ? 1.82 : 1)),
      hp: 0,
      atk: Math.round(template.base.atk * m * countPenalty * (boss && idx===0 ? 1.26 : 1)),
      def: Math.round(template.base.def * m * countPenalty * (boss && idx===0 ? 1.23 : 1)),
      spd: Math.round(template.base.spd * (1 + stage.id*0.006)),
      energy: rint(20,48),
      stars: boss && idx===0 ? 3 : 1,
      level: stage.id,
      shield:0, poison:0, burn:0, stun:0, guard:0, cursed:0, buffAtk:0,
      crit: template.role==='Assassin' ? .16 : .06,
      damage:0, heal:0, taken:0
    };
  }

  function makeEnemies(stage){
    const enemies=[];
    if(stage.isBoss){
      const bossT = D().bossTemplates[Math.floor((stage.id/5-1) % D().bossTemplates.length)];
      enemies.push(scaleEnemy(bossT, stage, 0));
    }
    while(enemies.length < stage.enemyCount){
      const t = D().enemyTemplates[(stage.id + enemies.length*2) % D().enemyTemplates.length];
      enemies.push(scaleEnemy(t, stage, enemies.length));
    }
    enemies.forEach(e=>e.hp=e.maxHp);
    return enemies;
  }

  function snapshot(allies,enemies,extra={}){
    function mini(u){
      return {
        uid:u.uid,name:u.name,icon:u.icon,side:u.side,hp:u.hp,maxHp:u.maxHp,energy:u.energy,
        role:u.role,element:u.element,rarity:u.rarity,dead:u.hp<=0,poison:u.poison,burn:u.burn,stun:u.stun,guard:u.guard
      };
    }
    return {allies:allies.map(mini), enemies:enemies.map(mini), ...extra};
  }

  function pressLabel(press){
    if(!press) return '';
    const full = Math.floor(press.tokens/2);
    const half = press.tokens % 2;
    return `${press.side==='ally'?'ทีมเรา':'ศัตรู'} Press Turn ${'●'.repeat(full)}${half?'◐':''}${'○'.repeat(Math.max(0,press.maxFull-full-half))}`;
  }

  function logEvent(events, allies, enemies, ev, press=null){
    events.push({...ev, pressText:pressLabel(press), snapshot:snapshot(allies,enemies,{...(ev.snapshotExtra||{}), press})});
  }

  function chooseTarget(actor, enemies, allies){
    const living = alive(enemies);
    if(!living.length) return null;
    if(actor.ai==='assassin' || actor.ai==='execute'){
      const back = living.filter(u=>u.slot>=2);
      const pool = back.length ? back : living;
      const weak = pool.filter(t=>isWeak(actor,t));
      return (weak.length ? weak : pool).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    }
    if(actor.ai==='triple' || actor.ai==='lowest'){
      const weak = living.filter(t=>isWeak(actor,t));
      return (weak.length ? weak : living).sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    }
    if(actor.ai==='random'){
      const weak = living.filter(t=>isWeak(actor,t));
      return weak.length ? pick(weak) : pick(living);
    }
    const weak = living.filter(t=>isWeak(actor,t));
    return (weak.length ? weak : living).sort((a,b)=>a.slot-b.slot || a.hp-b.hp)[0];
  }

  function combineOutcome(outcomes){
    const valid = outcomes.filter(Boolean);
    if(!valid.length) return {kind:'normal'};
    if(valid.some(o=>o.miss)) return {kind:'miss'};
    if(valid.some(o=>o.weak)) return {kind:'weak'};
    if(valid.some(o=>o.crit)) return {kind:'crit'};
    if(valid.some(o=>o.resist)) return {kind:'resist'};
    return {kind:'normal'};
  }

  function outcomeText(out){
    if(!out) return '';
    if(out.miss) return 'MISS!';
    if(out.weak && out.crit) return 'WEAK + CRIT!';
    if(out.weak) return 'WEAK!';
    if(out.crit) return 'CRITICAL!';
    if(out.resist) return 'RESIST';
    return '';
  }

  function deal(actor,target,scale,events,allies,enemies,verb='โจมตี',press=null){
    if(!target) return {kind:'normal'};
    const d = calcDamage(actor,target,scale);
    if(d.miss){
      actor.energy = clamp(actor.energy + 12,0,100);
      logEvent(events, allies, enemies, {
        type:'miss', icon:'💨', title:`${actor.name} ${verb} พลาด`,
        text:`${actor.name} โจมตี ${target.name} แต่พลาด — เสีย Press Turn หนัก`,
        actor:actor.uid,target:target.uid,amount:0,miss:true
      }, press);
      return {...d, kind:'miss'};
    }
    let amount = d.amount;
    if(target.shield>0){
      const block = Math.min(target.shield, amount);
      target.shield -= block;
      amount -= block;
    }
    target.hp = clamp(target.hp - amount,0,target.maxHp);
    actor.energy = clamp(actor.energy + 30,0,100);
    actor.damage += amount;
    target.taken += amount;
    const tag = outcomeText(d);
    const title = tag ? `${tag} ${actor.name} ${verb}` : `${actor.name} ${verb}`;
    const detail = tag ? ` (${tag})` : '';
    logEvent(events, allies, enemies, {
      type:d.weak?'weak':d.crit?'crit':d.resist?'resist':'damage', icon:actor.icon, title,
      text:`${actor.name} ใส่ ${target.name} -${amount}${detail}`,
      actor:actor.uid,target:target.uid,amount,crit:d.crit,weak:d.weak,resist:d.resist
    }, press);
    return {...d, amount, kind:d.weak?'weak':d.crit?'crit':d.resist?'resist':'normal'};
  }

  function heal(actor,target,amount,events,allies,enemies,title='ฟื้นฟู',press=null){
    if(!target) return {kind:'normal'};
    const before = target.hp;
    target.hp = clamp(target.hp + amount,0,target.maxHp);
    const got = target.hp-before;
    actor.heal += got;
    actor.energy = clamp(actor.energy + 18,0,100);
    logEvent(events, allies, enemies, {
      type:'heal', icon:'💚', title:`${actor.name} ${title}`,
      text:`${target.name} ฟื้น HP +${got}`,
      actor:actor.uid,target:target.uid,amount:got
    }, press);
    return {kind:'normal'};
  }

  function doSkill(actor, friends, foes, events, allies, enemies, press=null){
    actor.energy = 0;
    const livingFoes = alive(foes);
    const livingFriends = alive(friends);
    const lowAlly = livingFriends.slice().sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    const target = chooseTarget(actor, foes, friends);
    const outs=[];
    logEvent(events, allies, enemies, {type:'skill',icon:actor.icon,title:`${actor.name} ใช้ ${actor.skill}`,text:`${actor.skill} เริ่มทำงาน`,actor:actor.uid}, press);

    switch(actor.ai){
      case 'heal': outs.push(heal(actor, lowAlly, Math.round(actor.atk*1.75 + actor.level*12), events, allies, enemies, actor.skill, press)); break;
      case 'team_heal':
      case 'legend_heal':
        livingFriends.forEach(f=>outs.push(heal(actor, f, Math.round(actor.atk*(actor.ai==='legend_heal'?1.45:.95)), events, allies, enemies, actor.skill, press)));
        livingFriends.forEach(f=>f.energy=clamp(f.energy+12,0,100));
        break;
      case 'tank':
        actor.guard = 2; outs.push(heal(actor, actor, Math.round(actor.maxHp*.12), events, allies, enemies, actor.skill, press)); break;
      case 'shield':
        actor.shield += Math.round(actor.maxHp*.18);
        if(lowAlly) lowAlly.shield += Math.round(actor.maxHp*.10);
        logEvent(events, allies, enemies, {type:'buff',icon:'🛡️',title:`${actor.name} ใช้ ${actor.skill}`,text:`สร้างโล่ป้องกันให้ทีม`,actor:actor.uid}, press);
        break;
      case 'guard':
        actor.guard = 2; actor.def = Math.round(actor.def*1.08);
        logEvent(events, allies, enemies, {type:'buff',icon:'🗿',title:`${actor.name} ใช้ ${actor.skill}`,text:`ตั้งกำแพง ลดดาเมจที่จะได้รับ`,actor:actor.uid}, press);
        break;
      case 'double': for(let i=0;i<2;i++) if(target?.hp>0) outs.push(deal(actor,target,.72,events,allies,enemies,'ยิงซ้ำ',press)); break;
      case 'triple': for(let i=0;i<3;i++) if(target?.hp>0) outs.push(deal(actor,target,.62,events,allies,enemies,'ยิงสามนัด',press)); break;
      case 'assassin': outs.push(deal(actor,target,1.95,events,allies,enemies,'แทงหลัง',press)); break;
      case 'execute': {
        const beforeAlive = target?.hp>0;
        outs.push(deal(actor,target,2.25,events,allies,enemies,'ฟันไร้เงา',press));
        if(beforeAlive && target.hp<=0){
          const next = chooseTarget(actor, foes, friends);
          if(next) outs.push(deal(actor,next,1.20,events,allies,enemies,'โจมตีต่อ',press));
        }
        break;
      }
      case 'cleave': livingFoes.slice().sort(()=>Math.random()-.5).slice(0,2).forEach(t=>outs.push(deal(actor,t,1.05,events,allies,enemies,'สายฟ้า',press))); break;
      case 'aoe_burn':
      case 'dragon_fire':
        livingFoes.forEach(t=>{ outs.push(deal(actor,t,actor.ai==='dragon_fire'?1.12:.78,events,allies,enemies,'เผาไหม้',press)); t.burn = 3; }); break;
      case 'aoe_stun':
        livingFoes.forEach(t=>{ outs.push(deal(actor,t,.92,events,allies,enemies,'อสนี',press)); if(Math.random()<.22){t.stun=1; logEvent(events,allies,enemies,{type:'debuff',icon:'⚡',title:'ติด Stun',text:`${t.name} ถูกสตั้น 1 เทิร์น`,target:t.uid}, press);} }); break;
      case 'poison': livingFoes.forEach(t=>{ t.poison=3; outs.push(deal(actor,t,.45,events,allies,enemies,'วางพิษ',press)); }); break;
      case 'curse': livingFoes.forEach(t=>{ t.cursed=3; outs.push(deal(actor,t,.75,events,allies,enemies,'สาปแช่ง',press)); }); break;
      case 'lifesteal': {
        const out = deal(actor,target,1.62,events,allies,enemies,'ดูดวิญญาณ',press); outs.push(out);
        if(!out.miss) heal(actor, actor, Math.round(out.amount*.45), events, allies, enemies, 'ดูดเลือด', press);
        break;
      }
      case 'team_buff':
        outs.push(deal(actor,target,1.45,events,allies,enemies,'บัญชาทัพ',press));
        livingFriends.forEach(f=>f.buffAtk=2);
        logEvent(events,allies,enemies,{type:'buff',icon:'👑',title:`${actor.name} บัฟทีม`,text:'ทีมได้รับ ATK เพิ่ม 2 เทิร์น',actor:actor.uid}, press); break;
      case 'void': livingFoes.forEach(t=>{ outs.push(deal(actor,t,1.15,events,allies,enemies,'กลืนแสง',press)); t.energy=clamp(t.energy-22,0,100); }); break;
      default: outs.push(deal(actor,target,1.45,events,allies,enemies,actor.skill,press));
    }
    return combineOutcome(outs);
  }

  function applyDots(unit, events, allies, enemies, press=null){
    if(unit.hp<=0) return;
    if(unit.poison>0){
      const dmg = Math.round(unit.maxHp*.045);
      unit.hp=clamp(unit.hp-dmg,0,unit.maxHp); unit.poison--;
      logEvent(events,allies,enemies,{type:'damage',icon:'☠️',title:`${unit.name} โดนพิษ`,text:`พิษกัดกิน -${dmg}`,target:unit.uid,amount:dmg}, press);
    }
    if(unit.burn>0 && unit.hp>0){
      const dmg = Math.round(unit.maxHp*.038);
      unit.hp=clamp(unit.hp-dmg,0,unit.maxHp); unit.burn--;
      logEvent(events,allies,enemies,{type:'damage',icon:'🔥',title:`${unit.name} ถูกเผา`,text:`เผาไหม้ -${dmg}`,target:unit.uid,amount:dmg}, press);
    }
  }

  function tickBuffs(units){
    units.forEach(u=>{
      if(u.guard>0) u.guard--;
      if(u.cursed>0) u.cursed--;
      if(u.buffAtk>0) u.buffAtk--;
    });
  }

  function nextActor(order, idxRef){
    let guard = 0;
    while(guard++ < order.length*2){
      const u = order[idxRef.i % order.length];
      idxRef.i++;
      if(u && u.hp>0) return u;
    }
    return null;
  }

  function tokenCost(outcome){
    if(!outcome) return 2;
    if(outcome.kind === 'miss') return 4;
    if(outcome.kind === 'resist') return 3;
    if(outcome.kind === 'weak' || outcome.kind === 'crit') return 1;
    return 2;
  }

  function tokenReason(outcome){
    if(!outcome) return 'ใช้ Press Turn ปกติ';
    if(outcome.kind === 'miss') return 'MISS: เสีย 2 Press Turn';
    if(outcome.kind === 'resist') return 'RESIST: เสีย Press Turn เพิ่ม';
    if(outcome.kind === 'weak') return 'WEAK: ได้ครึ่งเทิร์นเพิ่ม';
    if(outcome.kind === 'crit') return 'CRIT: ได้ครึ่งเทิร์นเพิ่ม';
    return 'ใช้ Press Turn ปกติ';
  }

  function runPressPhase(side, actors, foes, events, allies, enemies, round){
    const order = alive(actors).sort((a,b)=>b.spd-a.spd || Math.random()-.5);
    if(!order.length || !alive(foes).length) return;
    const press = {side, tokens:order.length*2, maxFull:order.length};
    const idxRef = {i:0};
    logEvent(events,allies,enemies,{
      type:'phase',icon:side==='ally'?'🔵':'🔴',title:side==='ally'?'ฝ่ายเราเริ่มบุก':'ศัตรูเริ่มบุก',
      text:`ระบบ Press Turn: ตีจุดอ่อน/คริติคอลจะเสียแค่ครึ่งเทิร์น`,round
    }, press);
    let safety = 0;
    while(press.tokens > 0 && alive(actors).length && alive(foes).length && safety++ < 40){
      const actor = nextActor(order, idxRef);
      if(!actor) break;
      applyDots(actor,events,allies,enemies,press);
      if(actor.hp<=0) continue;
      let outcome = {kind:'normal'};
      if(actor.stun>0){
        actor.stun--;
        logEvent(events,allies,enemies,{type:'debuff',icon:'💫',title:`${actor.name} ขยับไม่ได้`,text:'เสียเทิร์นจาก Stun',actor:actor.uid}, press);
        outcome = {kind:'normal'};
      } else {
        const friends = actor.side==='ally' ? allies : enemies;
        const targetFoes = actor.side==='ally' ? enemies : allies;
        if(!alive(targetFoes).length) break;
        if(actor.energy>=100) outcome = doSkill(actor,friends,targetFoes,events,allies,enemies,press);
        else {
          const target = chooseTarget(actor,targetFoes,friends);
          outcome = deal(actor,target,1,events,allies,enemies,'โจมตี',press);
        }
      }
      const before = press.tokens;
      press.tokens = Math.max(0, press.tokens - tokenCost(outcome));
      logEvent(events,allies,enemies,{
        type:outcome.kind==='weak'?'weak':outcome.kind==='crit'?'crit':outcome.kind==='miss'?'miss':'press',
        icon:outcome.kind==='weak'?'🎯':outcome.kind==='crit'?'💥':outcome.kind==='miss'?'💨':'🔄',
        title:'Press Turn',
        text:`${tokenReason(outcome)} (${before} → ${press.tokens})`,round
      }, press);
    }
  }

  function simulate(stageId){
    const stage = S().stageDef(stageId);
    const allies = S().state.team.filter(Boolean).map(makeHeroUnit);
    const enemies = makeEnemies(stage);
    const events=[];
    logEvent(events,allies,enemies,{type:'start',icon:'📜',title:`${stage.title}`,text:`${stage.area} — ระบบต่อสู้แบบ Press Turn`,round:0});

    let round=1;
    while(round<=25 && alive(allies).length && alive(enemies).length){
      logEvent(events,allies,enemies,{type:'round',icon:'⏳',title:`รอบ ${round}`,text:'ฝ่ายที่ยังมีชีวิตจะได้ Press Turn ตามจำนวนสมาชิก',round});
      runPressPhase('ally', allies, enemies, events, allies, enemies, round);
      if(!alive(enemies).length || !alive(allies).length) break;
      runPressPhase('enemy', enemies, allies, events, allies, enemies, round);
      tickBuffs([...allies,...enemies]);
      round++;
    }
    const win = alive(allies).length>0 && alive(enemies).length===0;
    const lose = alive(enemies).length>0 && alive(allies).length===0;
    const timeout = !win && !lose;
    const mvp = [...allies].sort((a,b)=>(b.damage+b.heal*0.7)-(a.damage+a.heal*0.7))[0];
    const topDamage = [...allies].sort((a,b)=>b.damage-a.damage)[0];
    const topHeal = [...allies].sort((a,b)=>b.heal-a.heal)[0];
    const topTaken = [...allies].sort((a,b)=>b.taken-a.taken)[0];
    const enemyDamage = [...enemies].sort((a,b)=>b.damage-a.damage)[0];
    const reasons = [];
    if(!win){
      const hasHeal = allies.some(a=>['heal','team_heal','legend_heal'].includes(a.ai));
      const hasTank = allies.some(a=>['Tank'].includes(a.role));
      const fasterEnemy = (enemyDamage?.spd || 0) > Math.max(...allies.map(a=>a.spd||0));
      if(!hasTank) reasons.push('ทีมไม่มี Tank รับดาเมจ');
      if(!hasHeal) reasons.push('ทีมไม่มีตัวฮีล');
      if(fasterEnemy) reasons.push('ศัตรูเร็วกว่า');
      if(stage.power > S().teamPower()*1.18) reasons.push('พลังทีมต่ำกว่าศัตรูมาก');
      if(timeout) reasons.push('ดาเมจไม่พอใน 25 รอบ');
      if(!reasons.length) reasons.push('ลองเปลี่ยนธาตุหรืออัปเกรดทีม');
    }
    const summary = {
      win,
      stageId:stage.id,
      stageTitle:stage.title,
      rounds:round-1,
      mvp:mvp ? {name:mvp.name, icon:mvp.icon} : null,
      topDamage:topDamage ? {name:topDamage.name, icon:topDamage.icon, value:topDamage.damage} : null,
      topHeal:topHeal ? {name:topHeal.name, icon:topHeal.icon, value:topHeal.heal} : null,
      topTaken:topTaken ? {name:topTaken.name, icon:topTaken.icon, value:topTaken.taken} : null,
      enemyDamage:enemyDamage ? {name:enemyDamage.name, icon:enemyDamage.icon, value:enemyDamage.damage} : null,
      reasons
    };
    const summaryText = win
      ? `MVP: ${mvp?.name || '-'} | Damage: ${topDamage?.name || '-'} ${topDamage?.damage || 0} | Heal: ${topHeal?.name || '-'} ${topHeal?.heal || 0}`
      : `สาเหตุหลัก: ${reasons.slice(0,3).join(' / ')}`;
    logEvent(events,allies,enemies,{
      type:win?'win':'lose', icon:win?'🏆':'💀', title:win?'ชัยชนะ':'พ่ายแพ้',
      text: win ? `${summaryText} | ใช้ ${round-1} รอบ${stage.id >= D().stages.length ? ' | เคลียร์ Campaign แล้ว' : ''}` : (timeout?`ครบ 25 รอบแล้วยังชนะไม่ได้ | ${summaryText}`:`ทีมถูกจัดการทั้งหมด | ${summaryText}`),
      round
    });
    return {stage, allies, enemies, events, win, rounds:round-1, mvp, summary};
  }

  return { simulate };
})();
