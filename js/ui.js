window.UI = (() => {
  const app = () => document.getElementById('app');
  const D = () => window.GameData;
  const S = () => window.GameState;
  let battleRunning = false;
  let autoRun = false;
  let battleSpeed = 1;
  let farmRepeatRun = false;
  let battleWidgetExpanded = false;
  let lastBrowseScreen = 'home';

  function h(str){
    return String(str ?? '').replace(/[&<>"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
  function fmt(n){ return S().fmt(n||0); }
  function rarityBadge(r){ return `<span class="tier-badge rarity-${h(r)}">${h(r)}</span>`; }
  function toast(msg){
    const host = document.getElementById('toastHost');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(()=>el.remove(), 2600);
  }
  function setScreen(screen){
    if(screen !== 'battle') lastBrowseScreen = screen;
    S().state.screen = screen;
    if(battleRunning && screen !== 'battle') battleWidgetExpanded = false;
    if(screen === 'battle') battleWidgetExpanded = true;
    S().save();
    render();
    syncBattleOverlayMode();
    scrollGameToTop();
  }
  function currentScreen(){ return S().state.screen || 'home'; }

  function syncBattleOverlayMode(){
    const overlay = document.getElementById('battleOverlay');
    if(!overlay) return;
    const isDock = battleRunning && currentScreen() !== 'battle';
    const isExpandedDock = isDock && battleWidgetExpanded;
    const isCollapsedDock = isDock && !battleWidgetExpanded;
    overlay.classList.toggle('dock-mode', isDock);
    overlay.classList.toggle('expanded-dock', isExpandedDock);
    overlay.classList.toggle('collapsed-dock', isCollapsedDock);
    overlay.classList.toggle('full-mode', battleRunning && !isDock);
    const returnBtn = document.getElementById('returnBattleBtn');
    if(returnBtn) returnBtn.classList.toggle('hidden', !isDock);
    const expandBtn = document.getElementById('expandBattleBtn');
    if(expandBtn) expandBtn.classList.toggle('hidden', !isCollapsedDock);
    const minimizeBtn = document.getElementById('minimizeBattleBtn');
    if(minimizeBtn) minimizeBtn.classList.toggle('hidden', !(isExpandedDock || (battleRunning && !isDock)));
    const browseNote = document.getElementById('battleBrowseNote');
    if(browseNote) browseNote.classList.toggle('hidden', !isExpandedDock);
  }

  function scrollGameToTop(){
    requestAnimationFrame(()=>{
      try{ window.scrollTo({top:0,left:0,behavior:'instant'}); }catch(e){ window.scrollTo(0,0); }
      const el = app();
      if(el) el.scrollTop = 0;
    });
  }

  function minimizeBattleToDock(){
    if(!battleRunning) return;
    battleWidgetExpanded = false;
    if(currentScreen() === 'battle'){
      const target = lastBrowseScreen && lastBrowseScreen !== 'battle' ? lastBrowseScreen : 'home';
      S().state.screen = target;
      S().save();
      render();
      scrollGameToTop();
    } else {
      syncBattleOverlayMode();
    }
  }

  function hud(){
    const s = S().state;
    return `
      <div class="top-hud">
        <div class="brand-row">
          <div class="logo">
            <div class="logo-mark">🩸</div>
            <div><h1>Abyss Grimoire</h1><small>Dark Fantasy RPG V34</small></div>
          </div>
          <button class="btn small ghost" data-action="save">Save</button>
        </div>
        <div class="hud-res">
          <div class="res-pill"><span>Gold</span><b>🪙 ${fmt(s.resources.gold)}</b></div>
          <div class="res-pill"><span>Gem</span><b>💎 ${fmt(s.resources.gems)}</b></div>
          <div class="res-pill"><span>Ticket</span><b>🎟️ ${fmt(s.resources.tickets)}</b></div>
          <div class="res-pill"><span>Dust</span><b>✨ ${fmt(s.resources.dust)}</b></div>
        </div>
        ${battleRunning ? `<div class="battle-live-strip"><b>⚔️ กำลังต่อสู้</b><span>ดูหน้าอื่นได้ กล่องไฟต์จะย่ออยู่ด้านล่าง</span><button class="btn small primary" data-screen="battle">ดูไฟต์เต็ม</button><button class="btn small ghost" data-action="stopAuto">หยุด Auto</button></div>` : ''}
      </div>`;
  }

  function nav(){
    const items = [
      ['home','🏚️','ฐาน'],['battle','⚔️','ลุย'],['team','🛡️','ทีม'],['fusion','🧬','ผสม'],['gacha','🔮','อัญเชิญ'],['heroes','📦','คลัง'],['codex','📖','ตำรา'],['manual','📜','คู่มือ']
    ];
    return `<nav class="bottom-nav">${items.map(([id,ic,tx])=>`<button class="nav-btn ${currentScreen()===id?'active':''}" data-screen="${id}"><i>${ic}</i><span>${tx}</span></button>`).join('')}</nav>`;
  }

  function teamMini(){
    return `<div class="team-mini">${[0,1,2,3,4].map(i=>{
      const id = S().state.team[i];
      if(!id) return `<div class="mini-unit mini-empty">+</div>`;
      const def = S().heroDef(id), st = S().heroStats(id), inst = S().state.roster[id];
      return `<div class="mini-unit rarity-${def.rarity}"><div class="avatar">${def.icon}</div><small>${rarityBadge(def.rarity)} ${h(def.name)}</small><small>Lv.${inst.level} ★${inst.stars}</small><small>HP ${fmt(st.hp)} / ATK ${fmt(st.atk)}</small></div>`;
    }).join('')}</div>`;
  }

  function statGrid(st){
    if(!st) return '';
    return `<div class="stat-strip">
      <span><i>HP</i><b>${fmt(st.hp)}</b></span>
      <span><i>ATK</i><b>${fmt(st.atk)}</b></span>
      <span><i>DEF</i><b>${fmt(st.def)}</b></span>
      <span><i>SPD</i><b>${fmt(st.spd)}</b></span>
    </div>`;
  }

  function baseStatGrid(def){
    if(!def?.base) return '';
    return `<div class="stat-strip compact">
      <span><i>HP</i><b>${fmt(def.base.hp)}</b></span>
      <span><i>ATK</i><b>${fmt(def.base.atk)}</b></span>
      <span><i>DEF</i><b>${fmt(def.base.def)}</b></span>
      <span><i>SPD</i><b>${fmt(def.base.spd)}</b></span>
    </div>`;
  }



  function rosterList(){
    const filter = S().state.settings.heroFilter || 'all';
    const sort = S().state.settings.heroSort || 'power';
    const search = String(S().state.settings.heroSearch || '').trim().toLowerCase();
    let ids = Object.keys(S().state.roster || {});
    ids = ids.filter(id=>{
      const def = S().heroDef(id); if(!def) return false;
      const inst = S().state.roster[id];
      const st = S().heroStats(id);
      const needShard = S().shardsNeeded(inst.stars);
      const canLevel = inst.level < S().maxHeroLevel() && S().state.resources.gold >= S().levelCost(inst);
      const canStar = inst.stars < 6 && inst.shards >= needShard && S().state.resources.dust >= S().starCost(inst);
      const rbCost = S().rebirthCost(inst);
      const canRebirth = inst.level >= S().maxHeroLevel() && S().state.resources.gold >= rbCost.gold && S().state.resources.dust >= rbCost.dust;
      if(search){
        const hay = [def.name, def.id, def.rarity, def.role, def.element, def.skill, def.skillDesc].join(' ').toLowerCase();
        if(!hay.includes(search)) return false;
      }
      if(filter === 'all') return true;
      if(filter === 'team') return S().state.team.includes(id);
      if(filter === 'bench') return !S().state.team.includes(id);
      if(filter === 'favorite') return S().isFavorite(id);
      if(filter === 'upgradeable') return canLevel || canStar || canRebirth;
      if(filter === 'fusionReady') return !S().state.team.includes(id) && !S().isFavorite(id);
      if(['Tank','Warrior','Assassin','Mage','Support','Ranger'].includes(filter)) return def.role === filter;
      if(['Fire','Water','Nature','Light','Dark'].includes(filter)) return def.element === filter;
      if(filter === 'RarePlus') return S().rarityRank(def.rarity) >= 1;
      if(filter === 'EpicPlus') return S().rarityRank(def.rarity) >= 2;
      return true;
    });
    ids.sort((a,b)=>{
      const da=S().heroDef(a), db=S().heroDef(b), ia=S().state.roster[a], ib=S().state.roster[b];
      const sa=S().heroStats(a), sb=S().heroStats(b);
      const favA = S().isFavorite(a) ? 1 : 0, favB = S().isFavorite(b) ? 1 : 0;
      if(sort === 'team') return (S().state.team.includes(b)-S().state.team.includes(a)) || (sb.power-sa.power);
      if(sort === 'level') return (ib.level-ia.level) || (sb.power-sa.power);
      if(sort === 'rarity') return S().rarityRank(db.rarity)-S().rarityRank(da.rarity) || (sb.power-sa.power);
      if(sort === 'name') return da.name.localeCompare(db.name,'th');
      if(sort === 'favorite') return (favB-favA) || (sb.power-sa.power);
      if(sort === 'rebirth') return ((ib.rebirth||0)-(ia.rebirth||0)) || (sb.power-sa.power);
      return (sb.power-sa.power);
    });
    return ids;
  }

  function rosterControls(){
    const f = S().state.settings.heroFilter || 'all';
    const sort = S().state.settings.heroSort || 'power';
    const search = S().state.settings.heroSearch || '';
    const filters = [
      ['all','ทั้งหมด'],['team','ในทีม'],['bench','สำรอง'],['favorite','ล็อกไว้'],['upgradeable','อัปได้'],['fusionReady','พร้อมผสม'],
      ['Tank','Tank'],['Warrior','Warrior'],['Assassin','Assassin'],['Mage','Mage'],['Support','Support'],['Ranger','Ranger'],
      ['Fire','ไฟ'],['Water','น้ำ'],['Nature','พฤกษา'],['Light','แสง'],['Dark','มืด'],['RarePlus','Rare+'],['EpicPlus','Epic+']
    ];
    const quick = [['all','ทั้งหมด'],['team','ทีม'],['upgradeable','อัปได้'],['fusionReady','ผสมได้'],['favorite','ล็อก']];
    const sorts = [['power','Power สูงสุด'],['team','ทีมก่อน'],['level','Level สูงสุด'],['rebirth','Rebirth สูงสุด'],['rarity','Rarity สูงสุด'],['favorite','ล็อกก่อน'],['name','ชื่อ']];
    return `<div class="monster-toolbar">
      <div class="monster-search">
        <input id="heroSearchBox" class="search-input" value="${h(search)}" placeholder="ค้นหาชื่อ / ธาตุ / สาย / สกิล">
        <button class="btn small primary" data-action="applyHeroSearch">ค้นหา</button>
        <button class="btn small ghost" data-action="clearHeroSearch">ล้าง</button>
      </div>
      <div class="quick-chip-row">${quick.map(([id,label])=>`<button class="chip-btn ${f===id?'active':''}" data-action="setHeroFilter" data-value="${id}">${label}</button>`).join('')}</div>
      <div class="filter-row">
        <label>Filter <select data-action="setHeroFilter">${filters.map(x=>`<option value="${x[0]}" ${f===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
        <label>Sort <select data-action="setHeroSort">${sorts.map(x=>`<option value="${x[0]}" ${sort===x[0]?'selected':''}>${x[1]}</option>`).join('')}</select></label>
      </div>
    </div>`;
  }

  function battleSummaryPanel(){
    const b = S().state.lastBattle;
    if(!b) return '';
    const rewards = b.rewardText ? `<p class="muted"><b>รางวัลล่าสุด:</b> ${h(b.rewardText)}</p>` : '';
    const reasons = b.reasons?.length ? `<p class="danger"><b>สาเหตุ:</b> ${b.reasons.map(h).join(' / ')}</p>` : '';
    return `<section class="panel battle-summary ${b.win?'summary-win':'summary-lose'}">
      <div class="section-title"><h3>สรุปไฟต์ล่าสุด</h3><small>${h(b.stageTitle || '-')}</small></div>
      <div class="summary-grid">
        <div><span>MVP</span><b>${b.mvp?.icon || '—'} ${h(b.mvp?.name || '-')}</b></div>
        <div><span>Damage สูงสุด</span><b>${b.topDamage?.icon || ''} ${h(b.topDamage?.name || '-')} ${fmt(b.topDamage?.value || 0)}</b></div>
        <div><span>Heal รวมสูงสุด</span><b>${b.topHeal?.icon || ''} ${h(b.topHeal?.name || '-')} ${fmt(b.topHeal?.value || 0)}</b></div>
        <div><span>รับดาเมจสูงสุด</span><b>${b.topTaken?.icon || ''} ${h(b.topTaken?.name || '-')} ${fmt(b.topTaken?.value || 0)}</b></div>
      </div>
      ${rewards}${reasons}
    </section>`;
  }

  function makeBattleSummary(sim,result){
    const sum = sim.summary || {};
    const rewardText = result ? S().resourceText(result.reward) : '';
    const itemText = result?.item ? ` | ได้ ${result.item.name}${D().equipmentTypes[result.item.type].label}` : '';
    return {...sum, rewardText: `${rewardText || ''}${itemText || ''}`.trim(), at:Date.now()};
  }


  function teamPresetPanel(){
    const slots = ['1','2','3'];
    return `<section class="panel qol-panel team-preset-panel">
      <div class="section-title"><h3>ทีม Preset</h3><small>เซฟทีมไว้สลับเล่น</small></div>
      <div class="preset-grid">
        ${slots.map(slot=>{
          const preset = S().state.teamPresets?.[slot] || null;
          const count = preset ? preset.filter(Boolean).length : 0;
          const power = preset ? S().teamPresetPower(slot) : 0;
          return `<div class="preset-card">
            <b>ทีม ${slot}</b>
            <small>${count ? `${count}/5 | Power ${fmt(power)}` : 'ยังไม่ได้บันทึก'}</small>
            <div class="preset-actions">
              <button class="btn small primary" data-action="savePreset" data-slot="${slot}">บันทึกทีมนี้</button>
              <button class="btn small ghost" data-action="loadPreset" data-slot="${slot}" ${count?'':'disabled'}>โหลด</button>
            </div>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }

  function farmToolsPanel(){
    return `<section class="panel qol-panel farm-tools-panel">
      <div class="section-title"><h3>เครื่องมือฟาร์ม</h3><small>ลดของรก / ผสมวัตถุดิบต่ำ</small></div>
      <div class="qol-action-grid">
        <button class="btn green" data-action="autoSellLow">ขาย/ย่อยของ Common-Rare</button>
        <button class="btn green" data-action="autoFusionLow10">Auto Fusion ตัวต่ำ x10</button>
        <button class="btn ghost" data-action="autoFusionLow3">Auto Fusion ตัวต่ำ x3</button>
        <button class="btn ghost" data-screen="fusion">เปิดหน้าผสมเอง</button>
      </div>
      <p class="muted tip-line">Auto Fusion จะใช้เฉพาะ Common/Rare สำรองที่ไม่ได้อยู่ในทีม ไม่ได้ล็อก และยังไม่ Rebirth เพื่อกันเผลอใช้ตัวสำคัญ</p>
    </section>`;
  }

  function starterPanel(){
    const left = S().state.starter?.freeRollsLeft || 0;
    if(left <= 0) return '';
    const first = S().heroDef(S().state.starter?.firstHero);
    return `<section class="panel starter-panel">
      <div class="section-title"><h3>พิธีเริ่มต้น</h3><small>สุ่มฟรีเหลือ ${left}/5</small></div>
      <p class="muted">เริ่มเกมด้วยมอนสเตอร์สุ่ม 1 ตัว${first?` คือ <b class="gold">${h(first.name)}</b>`:''} แล้วสุ่มเพิ่มฟรีได้อีก 5 ตัวเพื่อเลือกทีมเริ่มต้นได้หลากหลายขึ้น</p>
      <div class="grid2">
        <button class="btn primary pulse" data-action="starterRecruit">🔮 สุ่มฟรี 1 ตัว</button>
        <button class="btn ghost" data-screen="team">ดู/จัดทีม</button>
      </div>
    </section>`;
  }

  function speedControls(){
    const current = Number(S().state.settings?.battleSpeed || 1);
    const speeds = [
      [0.75,'อ่านช้า'],[1,'ปกติ'],[2,'เร็ว'],[4,'ฟาร์ม x4'],[8,'ฟาร์ม x8'],[12,'ฟาร์ม x12'],[20,'ข้ามไว x20'],[50,'ฟาร์ม x50']
    ];
    return `<div class="speed-tune">
      <div><b>ความเร็วต่อสู้</b><small>ใช้ตอนฟาร์มได้ ไม่ต้องรอเปิดหน้า Battle</small></div>
      <div class="speed-tune-row">${speeds.map(([v,label])=>`<button class="chip-btn ${current===v?'active':''} ${v>=4?'farm-speed':''}" data-action="setSpeed" data-speed-value="${v}">${label}</button>`).join('')}</div>
    </div>`;
  }

  function home(){
    const idle = S().idlePreview();
    const selected = S().selectedStage();
    const tp = S().teamPower();
    const ep = S().stageEnemyPower(selected);
    const canIdle = idle.minutes >= 3;
    return `
      <div class="screen">
        <section class="hero-banner">
          <div class="tiny-label">ABYSS LOOP</div>
          <h2>ด่าน ${selected.title}</h2>
          <p>${selected.area} | ทีม ${fmt(tp)} vs ศัตรู ${fmt(ep)} ${tp<ep?'<b class="danger"> เสี่ยงแพ้</b>':'<b class="success"> พร้อมลุย</b>'}</p>
          <div class="banner-actions">
            <button class="btn primary" data-action="startBattle">⚔️ สู้</button>
            <button class="btn amber" data-action="farmRepeat">🌾 ฟาร์มจนแพ้</button>
            <button class="btn amber" data-action="farmRepeat10">ฟาร์ม 10 รอบ</button>
            <button class="btn ghost" data-screen="battle">เลือกด่าน</button>
            <button class="btn ghost" data-screen="manual">คู่มือ</button>
          </div>
          ${speedControls()}
        </section>
        ${starterPanel()}
        ${battleSummaryPanel()}
        <section class="panel">
          <div class="section-title"><h3>ทีมปัจจุบัน</h3><small>Power ${fmt(tp)}</small></div>
          ${teamMini()}
          <div class="grid2" style="margin-top:10px">
            <button class="btn green" data-action="autoTeam">👥 จัดทีมอัตโนมัติ</button>
            <button class="btn green" data-action="autoUpgrade">⬆️ อัปเกรดอัตโนมัติ</button>
          </div>
        </section>
        <section class="grid2">
          <div class="stat-card"><span>ด่านสูงสุด</span><b>${S().state.campaign.highestCleared || 0}/${D().stages.length}</b></div>
          <div class="stat-card"><span>Max Level</span><b>${S().maxHeroLevel()}</b></div>
          <div class="stat-card"><span>ชนะทั้งหมด</span><b>${fmt(S().state.stats.totalWins)}</b></div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>Idle Reward</h3><small>เก็บได้สูงสุด 8 ชม.</small></div>
          <p class="muted">สะสมแล้ว ${idle.minutes} นาที: ${S().resourceText(idle.reward) || 'ยังไม่มี'}</p>
          <button class="btn ${canIdle?'primary':'ghost'}" data-action="claimIdle" ${canIdle?'':'disabled'}>รับรางวัล Idle</button>
        </section>
        ${questShort()}
      </div>`;
  }

  function questShort(){
    const rows = D().dailyQuests.map(q=>{
      const p = S().questProgress(q), done = p>=q.need, claimed = S().state.daily.claimed[q.id];
      return `<div class="quest ${done&&!claimed?'done':''}">
        <div><b>${h(q.title)}</b><small>${p}/${q.need} — ${S().resourceText(q.reward)}</small></div>
        <button class="btn small ${done&&!claimed?'primary':'ghost'}" data-action="claimQuest" data-id="${q.id}" ${done&&!claimed?'':'disabled'}>${claimed?'รับแล้ว':'รับ'}</button>
      </div>`;
    }).join('');
    return `<section class="panel"><div class="section-title"><h3>เควสวันนี้</h3><small>${S().state.daily.date}</small></div><div class="stack">${rows}</div></section>`;
  }

  function battleScreen(){
    const sel = S().selectedStage();
    const from = Math.max(1, Math.min(sel.id-4, D().stages.length-9));
    const list = D().stages.slice(from-1, from+10);
    return `
      <div class="screen">
        <div class="page-title"><div><h2>เส้นทางอเวจีไร้สิ้นสุด</h2><p>ด่านเพิ่มยาวถึง 3000 และยากขึ้นเรื่อย ๆ ฟาร์มจน Rebirth เพื่อไปต่อ</p></div></div>
        <section class="panel">
          <div class="section-title"><h3>${sel.title}</h3><small>${sel.area}</small></div>
          <div class="grid2">
            <div class="stat-card"><span>พลังทีม</span><b>${fmt(S().teamPower())}</b></div>
            <div class="stat-card"><span>พลังศัตรู</span><b>${fmt(S().stageEnemyPower(sel))}</b></div>
          </div>
          <p class="muted">First Clear: ${S().resourceText(sel.firstReward)} | Repeat: ${S().resourceText(sel.repeatReward)}</p>
          <div class="grid2 battle-actions">
            <button class="btn primary" data-action="startBattle">⚔️ สู้</button>
            <button class="btn amber" data-action="farmRepeat">🌾 ฟาร์มจนแพ้</button>
            <button class="btn amber" data-action="farmRepeat10">ฟาร์ม 10 รอบ</button>
            <button class="btn amber" data-action="farmRepeat50">ฟาร์ม 50 รอบ</button>
            <button class="btn green" data-action="autoBattle">🔁 ดันด่านจนแพ้</button>
          </div>
          ${speedControls()}
        </section>
        ${battleSummaryPanel()}
        <section class="panel">
          <div class="section-title"><h3>Stage Map</h3><small>ปลดล็อกแล้ว ${S().state.campaign.unlocked}/${D().stages.length}</small></div>
          <div class="stack">
            ${list.map(stageCard).join('')}
          </div>
        </section>
      </div>`;
  }

  function stageCard(st){
    const s = S().state;
    const locked = st.id > s.campaign.unlocked;
    const cleared = !!s.campaign.clears[st.id];
    const active = st.id === s.campaign.selected;
    return `<button class="stage-card ${locked?'locked':''} ${cleared?'cleared':''} ${active?'active':''}" data-action="selectStage" data-id="${st.id}" ${locked?'disabled':''}>
      <div class="stage-num">${st.isBoss?'👑':st.id}</div>
      <div class="stage-info"><b>${h(st.title)}</b><small>${h(st.area)} | Power ${fmt(st.power)} | ${cleared?'เคลียร์แล้ว':'ยังไม่เคลียร์'}</small></div>
      <div class="stage-reward">${st.firstReward.tickets?'🎟️ ':''}${st.isBoss?'Boss':''}</div>
    </button>`;
  }

  function teamScreen(){
    const roster = rosterList();
    const team = S().state.team;
    const front = [team[0],team[1]], back=[team[2],team[3],team[4]];
    return `
      <div class="screen manager-lite-screen">
        <div class="page-title"><div><h2>จัดทีม</h2><p>เลือกตำแหน่งจากช่องทีม แล้วแตะปีศาจเพื่อจัดทีม เมนูคำสั่งจะสไลด์ขึ้นด้านล่าง</p></div><b class="gold">Power ${fmt(S().teamPower())}</b></div>
        <section class="panel team-board-panel">
          <div class="section-title"><h3>ทีมปัจจุบัน</h3><small>Front 2 / Back 3</small></div>
          <div class="slots compact-slots">
            <div class="slot-row"><div class="slot-label">Front</div><div class="slot-list">${front.map((id,i)=>slotCard(id,i)).join('')}</div></div>
            <div class="slot-row"><div class="slot-label">Back</div><div class="slot-list back">${back.map((id,i)=>slotCard(id,i+2)).join('')}</div></div>
          </div>
          <div class="action-strip">
            <button class="btn green" data-action="autoTeam">👥 จัดทีมอัตโนมัติ</button>
            <button class="btn ghost" data-action="clearTeam">ถอดทีมทั้งหมด</button>
            <button class="btn ghost" data-screen="heroes">จัดการปีศาจ</button>
          </div>
        </section>
        ${teamPresetPanel()}
        <section class="panel compact-manager-panel">
          <div class="section-title"><h3>เลือกปีศาจเข้าทีม</h3><small>${roster.length} ตัว</small></div>
          ${rosterControls()}
          <div class="compact-monster-list">${roster.map(id=>compactHeroCard(id,{mode:'team'})).join('') || '<div class="empty">ไม่พบปีศาจตามตัวกรอง</div>'}</div>
        </section>
      </div>`;
  }

  function slotCard(id,slot){
    if(!id) return `<button class="slot-card" data-action="clearSlot" data-slot="${slot}">ว่าง</button>`;
    const d=S().heroDef(id), i=S().state.roster[id], st=S().heroStats(id);
    return `<button class="slot-card filled rarity-${d.rarity}" data-action="clearSlot" data-slot="${slot}"><div><div class="avatar">${d.icon}</div><b>${S().isFavorite(id)?'🔒 ':''}${h(d.name)}</b>${rarityBadge(d.rarity)}<small>Lv.${i.level} R+${i.rebirth||0} ★${i.stars}</small><small>HP ${fmt(st.hp)} / ATK ${fmt(st.atk)}</small></div></button>`;
  }

  function heroesScreen(){
    const roster = rosterList();
    const allCount = Object.keys(S().state.roster || {}).length;
    const teamCount = S().state.team.filter(Boolean).length;
    const favCount = Object.keys(S().state.favorites || {}).length;
    const upgradeableCount = Object.keys(S().state.roster || {}).filter(id=>{
      const inst=S().state.roster[id]; if(!inst) return false;
      const need=S().shardsNeeded(inst.stars);
      const rb=S().rebirthCost(inst);
      return (inst.level<S().maxHeroLevel() && S().state.resources.gold>=S().levelCost(inst)) ||
        (inst.stars<6 && inst.shards>=need && S().state.resources.dust>=S().starCost(inst)) ||
        (inst.level>=S().maxHeroLevel() && S().state.resources.gold>=rb.gold && S().state.resources.dust>=rb.dust);
    }).length;
    const inv = S().state.inventory.slice().sort((a,b)=>D().equipmentRarities[b.rarity].score-D().equipmentRarities[a.rarity].score || b.value-a.value);
    const showInv = !!S().state.settings?.showInventory;
    return `
      <div class="screen monster-manager-screen">
        <div class="page-title"><div><h2>จัดการปีศาจ</h2><p>รายการสั้นลง แตะปีศาจ 1 ครั้งเพื่อเปิดเมนูสไลด์สำหรับอัปเกรด ใส่ทีม ล็อก หรือผสม</p></div></div>
        <section class="panel manager-overview compact-overview">
          <div class="manager-stats">
            <div><span>ทั้งหมด</span><b>${allCount}</b></div>
            <div><span>ในทีม</span><b>${teamCount}/5</b></div>
            <div><span>ล็อกไว้</span><b>${favCount}</b></div>
            <div><span>อัปได้</span><b>${upgradeableCount}</b></div>
          </div>
          <div class="manager-actions compact-actions">
            <button class="btn green" data-action="autoTeam">👥 จัดทีมอัตโนมัติ</button>
            <button class="btn green" data-action="autoUpgrade">⬆️ อัปทีม</button>
            <button class="btn ghost" data-action="equipBest">🎒 ใส่ของดีที่สุด</button>
            <button class="btn ghost" data-action="toggleInventory">${showInv?'ซ่อนอุปกรณ์':'ดูอุปกรณ์'}</button>
          </div>
        </section>
        ${teamPresetPanel()}
        ${farmToolsPanel()}
        <section class="panel compact-manager-panel sticky-manager-panel">
          <div class="section-title"><h3>รายชื่อปีศาจ</h3><small>${roster.length}/${allCount} ตัว | แตะเพื่อจัดการ</small></div>
          ${rosterControls()}
          <div class="compact-monster-list">${roster.map(id=>compactHeroCard(id,{mode:'manage'})).join('') || '<div class="empty">ไม่พบปีศาจตามตัวกรอง</div>'}</div>
        </section>
        ${showInv ? `<section class="panel"><div class="section-title"><h3>อุปกรณ์</h3><small>${inv.length} ชิ้น</small></div><div class="compact-inventory-list">${inv.length?inv.map(itemCard).join(''):'<div class="empty">ยังไม่มีอุปกรณ์ ฟาร์มด่านเพื่อหาเพิ่ม</div>'}</div></section>` : ''}
      </div>`;
  }

  function selectedUpgradePanel(){
    const id = S().state.settings?.selectedHero || Object.keys(S().state.roster || {})[0];
    if(!id || !S().state.roster[id]) return `<section class="panel upgrade-focus-panel"><div class="empty">ยังไม่มีปีศาจให้เลือกอัปเกรด</div></section>`;
    const def = S().heroDef(id), inst = S().state.roster[id], st = S().heroStats(id);
    const role = D().roles[def.role], elem = D().elements[def.element];
    const levelCost = S().levelCost(inst);
    const canLevel = inst.level < S().maxHeroLevel() && S().state.resources.gold >= levelCost;
    const needShard = S().shardsNeeded(inst.stars);
    const starCost = S().starCost(inst);
    const canStar = inst.stars < 6 && inst.shards >= needShard && S().state.resources.dust >= starCost;
    const rbCost = S().rebirthCost(inst);
    const canRebirth = inst.level >= S().maxHeroLevel() && S().state.resources.gold >= rbCost.gold && S().state.resources.dust >= rbCost.dust;
    const inTeam = S().state.team.includes(id);
    const fav = S().isFavorite(id);
    const levelLeft = Math.max(0, S().maxHeroLevel() - inst.level);
    return `<section class="panel upgrade-focus-panel">
      <div class="section-title"><h3>อัปเกรดเฉพาะตัวที่เลือก</h3><small>ไม่จัดทีม/ไม่กระจายทรัพยากรไปตัวอื่น</small></div>
      <div class="upgrade-focus-card rarity-${def.rarity}">
        <div class="unit-icon big">${def.icon}</div>
        <div class="upgrade-focus-info">
          <div class="monster-name"><b>${fav?'🔒 ':''}${h(def.name)}</b> ${rarityBadge(def.rarity)} ${inTeam?'<span class="tag good">ทีม</span>':''}</div>
          <div class="unit-meta">${role.icon} ${role.label} | ${elem.icon} ${elem.label} | ${def.rarity} | Lv.${inst.level}/${S().maxHeroLevel()} | ★${inst.stars} | R+${inst.rebirth||0}</div>
          ${statGrid(st)}
          <div class="unit-meta"><b>${h(def.skill)}</b> — ${h(def.skillDesc)}</div>
          <div class="upgrade-cost-note">Lv ถัดไป: 🪙 ${fmt(levelCost)} | Shard: ${inst.shards}/${needShard} | อัปดาว: ✨ ${fmt(starCost)} | Rebirth: 🪙 ${fmt(rbCost.gold)} ✨ ${fmt(rbCost.dust)}</div>
        </div>
        <div class="unit-power"><small>Power</small><b>${fmt(st.power)}</b></div>
      </div>
      <div class="upgrade-focus-actions">
        <button class="btn primary" data-action="upgradeOneHero" data-id="${id}">⬆️ อัปเฉพาะตัวนี้จนทรัพยากรหมด</button>
        <button class="btn green" data-action="levelUp" data-id="${id}" ${canLevel?'':'disabled'}>Lv +1</button>
        <button class="btn green" data-action="levelUp10" data-id="${id}" ${canLevel?'':'disabled'}>Lv +10</button>
        <button class="btn green" data-action="levelUpMax" data-id="${id}" ${canLevel?'':'disabled'}>Lv สูงสุดเท่าที่จ่ายไหว</button>
        <button class="btn ${canStar?'primary':'ghost'}" data-action="starUp" data-id="${id}" ${canStar?'':'disabled'}>★ อัปดาว</button>
        <button class="btn ${canRebirth?'primary':'ghost'}" data-action="rebirthHero" data-id="${id}" ${canRebirth?'':'disabled'}>Rebirth</button>
        <button class="btn ghost" data-action="toggleFavorite" data-id="${id}">${fav?'🔓 ปลดล็อก':'🔒 ล็อก'}</button>
        <button class="btn ghost" data-action="toggleTeam" data-id="${id}">${inTeam?'ถอดทีม':'ใส่ทีม'}</button>
      </div>
      <div class="muted tip-line">เหลืออีก ${fmt(levelLeft)} เลเวลถึง Max Lv.${S().maxHeroLevel()} — ปุ่มใหญ่ด้านบนจะอัปเฉพาะปีศาจตัวนี้เท่านั้น</div>
    </section>`;
  }

  function monsterManageCard(id){
    const def = S().heroDef(id), st = S().heroStats(id), inst = S().state.roster[id];
    const inTeam = S().state.team.includes(id);
    const fav = S().isFavorite(id);
    const needShard = S().shardsNeeded(inst.stars);
    const levelCost = S().levelCost(inst);
    const canLevel = inst.level < S().maxHeroLevel() && S().state.resources.gold >= levelCost;
    const canStar = inst.stars < 6 && inst.shards >= needShard && S().state.resources.dust >= S().starCost(inst);
    const rbCost = S().rebirthCost(inst);
    const canRebirth = inst.level >= S().maxHeroLevel() && S().state.resources.gold >= rbCost.gold && S().state.resources.dust >= rbCost.dust;
    const role = D().roles[def.role], elem = D().elements[def.element];
    const selected = S().state.settings?.selectedHero === id;
    return `<div class="monster-row rarity-${def.rarity} ${inTeam?'in-team':''} ${fav?'locked':''} ${selected?'selected-upgrade':''}">
      <div class="monster-main">
        <div class="unit-icon">${def.icon}</div>
        <div class="monster-info">
          <div class="monster-name"><b>${fav?'🔒 ':''}${h(def.name)}</b> ${rarityBadge(def.rarity)} ${inTeam?'<span class="tag good">ทีม</span>':''}</div>
          <div class="unit-meta">${role.icon} ${role.label} | ${elem.icon} ${elem.label} | ${def.rarity} | Lv.${inst.level} ★${inst.stars} R+${inst.rebirth||0}</div>
          ${statGrid(st)}
          <div class="unit-meta skill-one-line"><b>${h(def.skill)}</b> — ${h(def.skillDesc)}</div>
        </div>
        <div class="unit-power"><small>Power</small><b>${fmt(st.power)}</b></div>
      </div>
      <div class="monster-actions">
        <button class="btn small primary" data-action="selectUpgradeHero" data-id="${id}">${selected?'เลือกอยู่':'เลือกอัป'}</button>
        <button class="btn small ${inTeam?'ghost':'primary'}" data-action="toggleTeam" data-id="${id}">${inTeam?'ถอดทีม':'ใส่ทีม'}</button>
        <button class="btn small ${fav?'primary':'ghost'}" data-action="toggleFavorite" data-id="${id}">${fav?'🔒 ล็อกแล้ว':'☆ ล็อก'}</button>
        <button class="btn small" data-action="levelUp" data-id="${id}" ${canLevel?'':'disabled'}>Lv+ 🪙${fmt(levelCost)}</button>
        <button class="btn small ${canStar?'primary':'ghost'}" data-action="starUp" data-id="${id}" ${canStar?'':'disabled'}>★+ ✨${S().starCost(inst)}</button>
        <button class="btn small ${canRebirth?'primary':'ghost'}" data-action="rebirthHero" data-id="${id}" ${canRebirth?'':'disabled'}>Rebirth</button>
      </div>
    </div>`;
  }

  function unitCard(id, opt={}){
    const def = S().heroDef(id), st = S().heroStats(id), inst = S().state.roster[id];
    const inTeam = S().state.team.includes(id);
    const inFusion = (S().state.fusion?.selected || []).includes(id);
    const fav = S().isFavorite(id);
    const levelCost = S().levelCost(inst);
    const rbCost = S().rebirthCost(inst);
    const canRebirth = inst.level >= S().maxHeroLevel() && S().state.resources.gold >= rbCost.gold && S().state.resources.dust >= rbCost.dust;
    const needShard = S().shardsNeeded(inst.stars);
    const canStar = inst.stars<6 && inst.shards>=needShard && S().state.resources.dust>=S().starCost(inst);
    const role = D().roles[def.role], elem = D().elements[def.element];
    const hpPct = Math.min(100, Math.round(st.hp/(st.hp)*100));
    return `<div class="unit-card rarity-${def.rarity} ${inTeam?'selected':''} ${inFusion?'fusion-selected':''}">
      <div class="rarity-line"></div>
      <div class="unit-top">
        <div class="unit-icon">${def.icon}</div>
        <div>
          <div class="unit-name"><span class="rarity-text">${h(def.name)}</span> ${rarityBadge(def.rarity)} ${inTeam?'⭐':''} ${fav?'🔒':''}</div>
          <div class="unit-meta">${role.icon} ${role.label} | ${elem.icon} ${elem.label} | ${def.rarity}</div>
          <div class="unit-meta">Lv.${inst.level} / ${S().maxHeroLevel()} | Rebirth +${inst.rebirth||0} | ★${inst.stars} | Shard ${inst.shards}/${needShard}</div>
        </div>
        <div class="unit-power"><small>Power</small><b>${fmt(st.power)}</b></div>
      </div>
      ${statGrid(st)}
      <div class="bars">
        <div class="bar"><i style="width:${hpPct}%"></i></div>
      </div>
      <div class="unit-meta"><b>${h(def.skill)}</b> — ${h(def.skillDesc)}</div>
      ${equipmentLine(inst)}
      <div class="unit-actions">
        <button class="btn small ${fav?'primary':'ghost'}" data-action="toggleFavorite" data-id="${id}">${fav?'🔒 Locked':'☆ Favorite'}</button>
        ${opt.teamPick?`<button class="btn small ${inTeam?'ghost':'primary'}" data-action="toggleTeam" data-id="${id}">${inTeam?'ถอดทีม':'ใส่ทีม'}</button>`:''}
        ${opt.fusionPick?`<button class="btn small ${inFusion?'primary':'ghost'}" data-action="toggleFusion" data-id="${id}" ${inTeam||fav?'disabled':''}>${fav?'ล็อกอยู่':inFusion?'เลือกแล้ว':'เลือกผสม'}</button>`:''}
        ${opt.upgrade?`<button class="btn small" data-action="levelUp" data-id="${id}" ${S().state.resources.gold>=levelCost && inst.level<S().maxHeroLevel()?'':'disabled'}>Lv Up 🪙${fmt(levelCost)}</button>
        <button class="btn small ${canStar?'primary':'ghost'}" data-action="starUp" data-id="${id}" ${canStar?'':'disabled'}>อัปดาว ✨${S().starCost(inst)}</button>
        <button class="btn small ${canRebirth?'primary':'ghost'}" data-action="rebirthHero" data-id="${id}" ${canRebirth?'':'disabled'}>Rebirth +${(inst.rebirth||0)+1} 🪙${fmt(rbCost.gold)} ✨${fmt(rbCost.dust)}</button>`:''}
      </div>
    </div>`;
  }


  function compactHeroCard(id,opt={}){
    const def = S().heroDef(id), inst = S().state.roster[id];
    if(!def || !inst) return '';
    const st = S().heroStats(id);
    const role = D().roles[def.role], elem = D().elements[def.element];
    const inTeam = S().state.team.includes(id);
    const inFusion = (S().state.fusion?.selected || []).includes(id);
    const fav = S().isFavorite(id);
    const selected = S().state.settings?.selectedHero === id;
    const needShard = S().shardsNeeded(inst.stars);
    const tags = [inTeam?'ทีม':'',inFusion?'ผสม':'',fav?'ล็อก':''].filter(Boolean).map(x=>`<span class="tag good">${x}</span>`).join('');
    return `<button class="compact-monster-card rarity-${def.rarity} ${selected?'selected':''} ${inTeam?'in-team':''} ${inFusion?'fusion-selected':''}" data-action="openMonsterMenu" data-id="${id}" data-mode="${opt.mode||''}">
      <div class="rarity-line"></div>
      <div class="unit-icon">${def.icon}</div>
      <div class="compact-monster-info">
        <div class="compact-title"><b>${fav?'🔒 ':''}${h(def.name)}</b> ${rarityBadge(def.rarity)} ${tags}</div>
        <div class="unit-meta">${role.icon} ${role.label} | ${elem.icon} ${elem.label} | Lv.${inst.level}/${S().maxHeroLevel()} | ★${inst.stars} | R+${inst.rebirth||0}</div>
        <div class="compact-stats">HP ${fmt(st.hp)} · ATK ${fmt(st.atk)} · DEF ${fmt(st.def)} · SPD ${fmt(st.spd)}</div>
      </div>
      <div class="compact-power"><small>Power</small><b>${fmt(st.power)}</b></div>
    </button>`;
  }

  function monsterActionSheet(){
    if(!S().state.settings?.monsterMenuOpen) return '';
    const id = S().state.settings?.selectedHero;
    if(!id || !S().state.roster[id]) return '';
    const def = S().heroDef(id), inst = S().state.roster[id], st = S().heroStats(id);
    if(!def || !inst) return '';
    const role = D().roles[def.role], elem = D().elements[def.element];
    const inTeam = S().state.team.includes(id);
    const inFusion = (S().state.fusion?.selected || []).includes(id);
    const fav = S().isFavorite(id);
    const levelCost = S().levelCost(inst);
    const canLevel = inst.level < S().maxHeroLevel() && S().state.resources.gold >= levelCost;
    const needShard = S().shardsNeeded(inst.stars);
    const canStar = inst.stars < 6 && inst.shards >= needShard && S().state.resources.dust >= S().starCost(inst);
    const rbCost = S().rebirthCost(inst);
    const canRebirth = inst.level >= S().maxHeroLevel() && S().state.resources.gold >= rbCost.gold && S().state.resources.dust >= rbCost.dust;
    const canFusion = !inTeam && !fav;
    return `<div class="monster-sheet-backdrop" data-action="closeMonsterMenu"></div>
      <aside class="monster-sheet rarity-${def.rarity}">
        <div class="sheet-grip"></div>
        <div class="sheet-head">
          <div class="unit-icon big">${def.icon}</div>
          <div class="sheet-title">
            <div><b>${fav?'🔒 ':''}${h(def.name)}</b> ${rarityBadge(def.rarity)} ${inTeam?'<span class="tag good">ทีม</span>':''} ${inFusion?'<span class="tag good">ผสม</span>':''}</div>
            <small>${role.icon} ${role.label} | ${elem.icon} ${elem.label} | Lv.${inst.level}/${S().maxHeroLevel()} | ★${inst.stars} | R+${inst.rebirth||0}</small>
          </div>
          <button class="btn small ghost" data-action="closeMonsterMenu">ปิด</button>
        </div>
        ${statGrid(st)}
        <div class="sheet-skill"><b>${h(def.skill)}</b><span>${h(def.skillDesc)}</span></div>
        <div class="sheet-costs">Shard ${fmt(inst.shards)}/${fmt(needShard)} | Lv+ 🪙 ${fmt(levelCost)} | ★+ ✨ ${fmt(S().starCost(inst))} | Rebirth 🪙 ${fmt(rbCost.gold)} ✨ ${fmt(rbCost.dust)}</div>
        <div class="sheet-actions">
          <button class="btn primary" data-action="upgradeOneHero" data-id="${id}">⬆️ อัปตัวนี้จนหมด</button>
          <button class="btn green" data-action="levelUp" data-id="${id}" ${canLevel?'':'disabled'}>Lv +1</button>
          <button class="btn green" data-action="levelUp10" data-id="${id}" ${canLevel?'':'disabled'}>Lv +10</button>
          <button class="btn green" data-action="levelUpMax" data-id="${id}" ${canLevel?'':'disabled'}>Lv Max</button>
          <button class="btn ${canStar?'primary':'ghost'}" data-action="starUp" data-id="${id}" ${canStar?'':'disabled'}>★ อัปดาว</button>
          <button class="btn ${canRebirth?'primary':'ghost'}" data-action="rebirthHero" data-id="${id}" ${canRebirth?'':'disabled'}>Rebirth</button>
          <button class="btn ghost" data-action="toggleTeam" data-id="${id}">${inTeam?'ถอดทีม':'ใส่ทีม'}</button>
          <button class="btn ${canFusion?'ghost':'ghost'}" data-action="toggleFusion" data-id="${id}" ${canFusion?'':'disabled'}>${inFusion?'เอาออกจากผสม':'เลือกผสม'}</button>
          <button class="btn ghost" data-action="toggleFavorite" data-id="${id}">${fav?'🔓 ปลดล็อก':'🔒 ล็อก'}</button>
          <button class="btn ghost" data-action="closeMonsterMenu">เสร็จแล้ว</button>
        </div>
      </aside>`;
  }

  function equipmentLine(inst){
    const parts = Object.keys(D().equipmentTypes).map(type=>{
      const item = S().getEquipment(inst.equipped?.[type]);
      const t = D().equipmentTypes[type];
      if(!item) return `${t.icon} -`;
      return `${t.icon} <span class="rarity-text rarity-${item.rarity}">${h(item.rarity[0])}</span>+${item.value}`;
    });
    return `<div class="unit-meta">${parts.join(' | ')}</div>`;
  }

  function itemCard(it){
    const type=D().equipmentTypes[it.type], rare=D().equipmentRarities[it.rarity];
    return `<div class="item-card rarity-${it.rarity}"><div class="item-icon">${type.icon}</div><div><b class="rarity-text">${h(it.name)}${type.label}</b><small>${rare.label} | ${type.stat.toUpperCase()} +${it.value} | Lv.${it.level}</small></div><small>${it.rarity}</small></div>`;
  }

  function gachaScreen(){
    const results = S().state.gacha.lastResults || [];
    return `
      <div class="screen">
        <div class="page-title"><div><h2>แท่นอัญเชิญอเวจี</h2><p>Ticket ได้จากชนะทุก 7 ครั้ง, ผู้คุมประตู, เควสรายวัน</p></div></div>
        <section class="gacha-door"><div><h3>☽</h3><p>Epic การันตีทุก 10 | Legendary ทุก 60</p></div></section>
        <section class="panel">
          ${(S().state.starter?.freeRollsLeft||0)>0 ? `<button class="btn primary pulse wide" data-action="starterRecruit">🔮 สุ่มฟรีเริ่มต้น เหลือ ${S().state.starter.freeRollsLeft}/5</button><div class="hr"></div>` : ''}
          <div class="grid2">
            <button class="btn primary" data-action="gacha1">🔮 อัญเชิญ 1 ครั้ง</button>
            <button class="btn primary" data-action="gacha10">🔮 อัญเชิญ 10 ครั้ง</button>
          </div>
          <p class="muted">ใช้ Ticket ก่อน ถ้า Ticket หมดใช้ 100 Gem / ครั้ง | Pity Epic ${S().state.gacha.epicPity}/10 | Legendary ${S().state.gacha.legendPity}/60</p>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ผลล่าสุด</h3><small>${results.length} รายการ</small></div>
          <div class="gacha-results">${results.length?results.map(gachaResultRow).join(''):'<div class="empty">ยังไม่มีผลกาชา</div>'}</div>
        </section>
        ${questShort()}
      </div>`;
  }

  function gachaResultRow(r){
    const hero = r.hero;
    const st = S().state.roster[hero.id] ? S().heroStats(hero.id) : null;
    return `<div class="reward-row rarity-${hero.rarity}"><div class="big">${hero.icon}</div><div><b class="rarity-text">${h(hero.name)}</b> ${rarityBadge(hero.rarity)}<small>${hero.rarity} | ${r.type==='new'?'ตัวละครใหม่':'ตัวซ้ำ → Shard +'+r.amount}</small>${statGrid(st) || baseStatGrid(hero)}</div></div>`;
  }


  function fusionScreen(){
    const selected = S().state.fusion?.selected || [];
    const spare = rosterList()
      .filter(id=>S().state.roster[id] && !S().state.team.includes(id) && !S().isFavorite(id))
      .sort((a,b)=>S().heroStats(a).power-S().heroStats(b).power);
    const preview = S().fusionPreview();
    const last = S().state.fusion?.last;
    const showRecipes = !!S().state.settings?.showFusionRecipes;
    return `
      <div class="screen fusion-manager-screen">
        <div class="page-title"><div><h2>ห้องหลอมปีศาจ</h2><p>แตะปีศาจสำรองเพื่อเปิดเมนู แล้วกด “เลือกผสม” ไม่ต้องเลื่อนหาปุ่มยาว ๆ</p></div></div>
        <section class="panel fusion-lab fusion-sticky-panel">
          <div class="section-title"><h3>Fusion Preview</h3><small>${selected.length}/2</small></div>
          <div class="fusion-grid compact-fusion-grid">
            ${fusionSlot(selected[0], 'ตัวที่ 1')}
            <div class="fusion-plus">＋</div>
            ${fusionSlot(selected[1], 'ตัวที่ 2')}
          </div>
          <div class="fusion-result compact-fusion-result">
            ${preview.ok ? fusionPreviewHtml(preview) : `<div class="empty">${h(preview.msg)}</div>`}
          </div>
          <div class="action-strip">
            <button class="btn primary" data-action="doFusion" ${preview.ok?'':'disabled'}>🧬 ผสมเลย</button>
            <button class="btn green" data-action="autoFusion">⚡ ผสมอัตโนมัติ</button>
            <button class="btn ghost" data-action="clearFusion">ล้าง</button>
            <button class="btn ghost" data-action="toggleFusionRecipes">${showRecipes?'ซ่อนสูตร':'ดูสูตร'}</button>
          </div>
          <p class="muted tip-line">ตัวที่อยู่ในทีม/ล็อก Favorite จะไม่ถูกผสม เพื่อกันพลาด</p>
        </section>
        ${last ? lastFusionHtml(last) : ''}
        ${showRecipes ? fusionRecipeBook() : ''}
        <section class="panel compact-manager-panel">
          <div class="section-title"><h3>ตัวสำรองที่ผสมได้</h3><small>${spare.length} ตัว | ใช้ตัวกรองด้านล่างได้</small></div>
          ${rosterControls()}
          <div class="compact-monster-list">${spare.length?spare.map(id=>compactHeroCard(id,{mode:'fusion'})).join(''):'<div class="empty">ยังไม่มีตัวสำรองที่ผสมได้ เปิดกาชาเพิ่ม ถอดตัวจากทีม หรือปลด Favorite ก่อน</div>'}</div>
        </section>
      </div>`;
  }

  function fusionSlot(id,label){
    if(!id) return `<div class="fusion-slot empty-slot"><small>${label}</small><b>ยังไม่เลือก</b></div>`;
    const d = S().heroDef(id), i = S().state.roster[id], st=S().heroStats(id);
    return `<div class="fusion-slot rarity-${d.rarity}"><div class="unit-icon">${d.icon}</div><div><small>${label}</small><b class="rarity-text">${h(d.name)}</b> ${rarityBadge(d.rarity)}<span>Lv.${i.level} ★${i.stars} | ${d.rarity}</span>${statGrid(st)}</div></div>`;
  }

  function fusionPreviewHtml(p){
    const r = p.result;
    const elem = D().elements[r.element];
    const role = D().roles[r.role];
    const afford = S().state.resources.gold>=p.cost.gold && S().state.resources.dust>=p.cost.dust;
    const isRandom = !!p.isRandom;
    const poolHeroes = isRandom ? (p.pool || []).slice(0,8).map(x=>S().heroDef(x.id)).filter(Boolean) : [];
    const rarityList = isRandom ? (p.possibleRarities || []).join(' / ') : '';
    const sampleText = isRandom && poolHeroes.length ? `<p class="muted"><b>ตัวอย่างที่อาจออก:</b> ${poolHeroes.map(x=>`${x.icon} ${h(x.name)}`).join(' · ')}${(p.pool||[]).length>8?' · ...':''}</p>` : '';
    return `<div class="fusion-out rarity-${r.rarity}">
      <div class="rarity-line"></div>
      <div class="unit-icon">${isRandom?'🎲':r.icon}</div>
      <div>
        <small>${isRandom?'ผลลัพธ์สุ่ม':'ผลลัพธ์'} ${p.poolNote}${p.duplicate?' | pool นี้มีอยู่แล้วทั้งหมด อาจได้ Shard':''}</small>
        <h3 class="rarity-text">${isRandom ? 'Chaos Fusion' : h(r.name)}</h3>
        <p>${isRandom ? `สุ่มจากระดับ ${h(rarityList)} | ตัวอย่างเด่น: ${r.icon} ${h(r.name)}` : `${role.icon} ${role.label} | ${elem.icon} ${elem.label} | ${r.rarity}`}</p>
        ${isRandom ? sampleText : `${baseStatGrid(r)}<p><b>${h(r.skill)}</b> — ${h(r.skillDesc)}</p>`}
        <p class="${afford?'muted':'danger'}">ค่าใช้จ่าย: 🪙 ${fmt(p.cost.gold)} Gold / ✨ ${fmt(p.cost.dust)} Dust</p>
      </div>
    </div>`;
  }

  function lastFusionHtml(last){
    const r = S().heroDef(last.result);
    if(!r) return '';
    return `<section class="panel"><div class="section-title"><h3>ผลผสมล่าสุด</h3><small>${new Date(last.at).toLocaleString('th-TH')}</small></div>
      <div class="reward-row rarity-${r.rarity}"><div class="big">${r.icon}</div><div><b class="rarity-text">${h(r.name)}</b> ${rarityBadge(r.rarity)}<small>${last.gain?.type==='new'?'มอนสเตอร์ใหม่':'ตัวซ้ำ → Shard +' + last.gain?.amount}</small></div></div>
    </section>`;
  }

  function fusionRecipeBook(){
    const recipes = D().fusionRecipes || [];
    const owned = S().state.roster || {};
    if(!recipes.length) return '';
    return `<section class="panel recipe-book">
      <div class="section-title"><h3>ตำราผสม ${recipes.length} รายการ</h3><small>สูตรเฉพาะ = การันตีผลลัพธ์ / ไม่มีสูตร = สุ่มได้</small></div>
      <div class="recipe-grid">
        ${recipes.map(r=>{
          const a = S().heroDef(r.from[0]);
          const b = S().heroDef(r.from[1]);
          const out = S().heroDef(r.result);
          if(!a || !b || !out) return '';
          const ready = owned[a.id] && owned[b.id] && !S().state.team.includes(a.id) && !S().state.team.includes(b.id);
          const have = owned[out.id];
          return `<div class="recipe-card ${ready?'ready':''} rarity-${out.rarity}">
            <div class="recipe-head"><b>${h(r.title)}</b><small>${ready?'พร้อมผสม':have?'มีผลลัพธ์แล้ว':'ยังขาดวัตถุดิบ'}</small></div>
            <div class="recipe-line"><span>${a.icon} ${h(a.name)}</span><i>+</i><span>${b.icon} ${h(b.name)}</span></div>
            <div class="recipe-out"><b>→ ${out.icon} ${h(out.name)}</b><small>${out.rarity} / ${D().roles[out.role]?.label || out.role}</small></div>
            <p>${h(r.note || out.skillDesc)}</p>
          </div>`;
        }).join('')}
      </div>
    </section>`;
  }





  function codexScreen(){
    const filter = S().state.settings.heroFilter || 'all';
    const sort = S().state.settings.heroSort || 'rarity';
    let heroes = D().heroes.slice();
    heroes = heroes.filter(def=>{
      if(filter === 'all') return true;
      if(filter === 'favorite') return S().isFavorite(def.id);
      if(['Tank','Warrior','Assassin','Mage','Support','Ranger'].includes(filter)) return def.role === filter;
      if(['Fire','Water','Nature','Light','Dark'].includes(filter)) return def.element === filter;
      if(filter === 'RarePlus') return S().rarityRank(def.rarity) >= 1;
      if(filter === 'EpicPlus') return S().rarityRank(def.rarity) >= 2;
      return true;
    });
    heroes.sort((a,b)=>{
      if(sort === 'name') return a.name.localeCompare(b.name,'th');
      if(sort === 'rarity') return S().rarityRank(b.rarity)-S().rarityRank(a.rarity) || a.name.localeCompare(b.name,'th');
      if(sort === 'level') return ((S().state.roster[b.id]?.level||0)-(S().state.roster[a.id]?.level||0)) || S().rarityRank(b.rarity)-S().rarityRank(a.rarity);
      if(sort === 'rebirth') return ((S().state.roster[b.id]?.rebirth||0)-(S().state.roster[a.id]?.rebirth||0)) || S().rarityRank(b.rarity)-S().rarityRank(a.rarity);
      const pa = S().state.roster[a.id] ? S().heroStats(a.id)?.power || 0 : 0;
      const pb = S().state.roster[b.id] ? S().heroStats(b.id)?.power || 0 : 0;
      return pb-pa || S().rarityRank(b.rarity)-S().rarityRank(a.rarity);
    });
    const seenCount = D().heroes.filter(h=>S().codexSeen(h.id)).length;
    return `<div class="screen">
      <div class="page-title"><div><h2>Monster Codex</h2><p>สารบัญมอนสเตอร์ทั้งหมด ดูตัวที่เคยพบ สกิล บทบาท ธาตุ และสูตรผสมที่เกี่ยวข้อง ตอนนี้มีมอนสเตอร์และสายผสมเพิ่มขึ้น</p></div><b class="gold">${seenCount}/${D().heroes.length}</b></div>
      <section class="panel">${rosterControls()}</section>
      <section class="panel"><div class="section-title"><h3>มอนสเตอร์ทั้งหมด</h3><small>${heroes.length} รายการ</small></div><div class="stack">${heroes.map(codexCard).join('')}</div></section>
    </div>`;
  }

  function codexCard(def){
    const seen = S().codexSeen(def.id);
    const inst = S().state.roster[def.id];
    const st = inst ? S().heroStats(def.id) : null;
    const role = D().roles[def.role], elem = D().elements[def.element];
    const recipes = (D().fusionRecipes || []).filter(r=>r.result===def.id || (r.from||[]).includes(def.id)).slice(0,3);
    const recipeText = recipes.length ? recipes.map(r=>{
      const a=S().heroDef(r.from[0]), b=S().heroDef(r.from[1]), out=S().heroDef(r.result);
      if(r.result===def.id) return `${a?.name||'?'} + ${b?.name||'?'} → ${out?.name||def.name}`;
      return `${r.title}: ใช้เป็นวัตถุดิบ`;
    }).join(' | ') : 'ไม่มีสูตรเฉพาะ แต่ใช้ Chaos Fusion ได้';
    return `<div class="codex-card ${seen?'seen':'unknown'} rarity-${def.rarity}">
      <div class="rarity-line"></div>
      <div class="unit-icon">${seen?def.icon:'?'}</div>
      <div>
        <div class="unit-name"><span class="rarity-text">${seen?h(def.name):'ยังไม่พบ'}</span> ${seen?rarityBadge(def.rarity):''} ${S().isFavorite(def.id)?'★':''}</div>
        <div class="unit-meta">${role.icon} ${role.label} | ${elem.icon} ${elem.label} | ${def.rarity}${inst?` | Lv.${inst.level} R+${inst.rebirth||0} ★${inst.stars}`:''}</div>
        ${seen ? `${st?statGrid(st):baseStatGrid(def)}<div class="unit-meta"><b>${h(def.skill)}</b> — ${h(def.skillDesc)}</div><div class="unit-meta"><b>สูตร:</b> ${h(recipeText)}</div>` : `<div class="unit-meta">เปิดกาชา, ผสม, หรือฟาร์มเพื่อค้นพบมอนสเตอร์นี้</div>`}
      </div>
    </div>`;
  }

  function manualScreen(){
    return `
      <div class="screen manual-screen">
        <div class="page-title"><div><h2>คู่มือการเล่น</h2><p>V30 Tier SSR: สีเทียร์ชัดขึ้น, SSR ultra-rare, Max Lv.100 Rebirth, และ Battle UI มือถือปรับใหม่</p></div></div>
        <section class="panel manual-hero">
          <div class="section-title"><h3>เป้าหมายใหม่</h3><small>Endless Loop ถึงด่าน 3000</small></div>
          <p class="muted">ด่านจะสร้างต่อเนื่องและยากขึ้นเรื่อย ๆ จนถึง <b class="gold">ด่าน 3000</b> ถ้าติดด่าน ให้ฟาร์มด่านที่ผ่านได้ อัปเลเวล เปิดกาชา ผสมมอนสเตอร์ และ Rebirth เพื่อเพิ่มพลังถาวร</p>
          <div class="manual-steps">
            <div><b>1</b><span>สุ่มฟรีให้ครบ 2 ตัว แล้วจัดทีมเริ่มต้น</span></div>
            <div><b>2</b><span>ฟาร์ม Gold/Dust จากด่านล่าสุดที่ชนะได้</span></div>
            <div><b>3</b><span>อัปเลเวลมอนสเตอร์ไปเรื่อย ๆ สูงสุด 100</span></div>
            <div><b>4</b><span>ผสมตัวสำรองเพื่อสร้างตัวระดับสูงกว่า</span></div>
            <div><b>5</b><span>เมื่อเลเวล 100 ให้ Rebirth แล้ววนฟาร์มใหม่</span></div>
          </div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>Rebirth คืออะไร</h3><small>วนเกิดใหม่เพื่อไปด่านลึกขึ้น</small></div>
          <ul class="guide-list">
            <li>มอนสเตอร์ที่เลเวล <b>100</b> จะกด Rebirth ได้ในหน้า <b>คลัง</b></li>
            <li>Rebirth จะรีเซ็ตเลเวลกลับเป็น 1 แต่เพิ่มสแต็ก <b>Rebirth +1</b></li>
            <li>แต่ละสแต็กเพิ่ม HP / ATK / DEF ถาวร และยิ่งสแต็กสูง โบนัสรวมยิ่งดีขึ้น</li>
            <li>อุปกรณ์ ดาว และ Shard ยังอยู่ ไม่หาย</li>
          </ul>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ระบบต่อสู้ Press Turn</h3><small>คล้าย Shin Megami Tensei</small></div>
          <div class="guide-grid">
            <div class="guide-card"><b>WEAK</b><p>ตีธาตุที่ศัตรูแพ้ทาง จะใช้ Press Turn น้อยลง ทำให้ฝ่ายเราออกแอ็กชันได้มากขึ้น</p></div>
            <div class="guide-card"><b>CRITICAL</b><p>ติดคริติคอลก็ประหยัด Press Turn เหมือนตีจุดอ่อน</p></div>
            <div class="guide-card"><b>MISS</b><p>โจมตีพลาดจะเสียจังหวะหนัก ระวังตัวที่เร็วและหลบเก่ง</p></div>
            <div class="guide-card"><b>RESIST</b><p>ตีธาตุที่ศัตรูต้าน จะเสีย Press Turn เพิ่ม ควรสลับทีม/ธาตุก่อนลุย</p></div>
          </div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ธาตุแพ้ทาง</h3><small>จำแค่นี้พอ</small></div>
          <div class="element-guide">
            <span>🔥 ไฟ ชนะ 🌿 พฤกษา</span>
            <span>🌿 พฤกษา ชนะ 💧 น้ำ</span>
            <span>💧 น้ำ ชนะ 🔥 ไฟ</span>
            <span>✨ แสง ↔ 🌑 มืด</span>
          </div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ทรัพยากรหาได้จากไหน</h3><small>Resource Guide</small></div>
          <div class="guide-grid">
            <div class="guide-card"><b>Gold</b><p>ได้จากชนะด่าน, ฟาร์มด่านซ้ำ, Idle Reward และ Daily Quest ใช้สำหรับอัปเลเวล, ผสมมอนสเตอร์ และ Rebirth</p></div>
            <div class="guide-card"><b>Gem</b><p>ได้จาก First Clear บางด่าน, บอสด่านสูง, Idle Reward แบบช้า ๆ และ Daily Quest ใช้เปิดกาชาเมื่อไม่มี Ticket</p></div>
            <div class="guide-card"><b>Ticket</b><p>ได้จากชนะสะสมทุก 7 ครั้ง, First Clear บอสด่านสำคัญ และ Daily Quest ใช้เปิดกาชา 1 ใบต่อ 1 ครั้ง</p></div>
            <div class="guide-card"><b>Dust</b><p>ได้จากชนะด่าน, ฟาร์มด่านซ้ำ, Idle Reward และ Daily Quest ใช้สำหรับอัปดาว, ผสมมอนสเตอร์ และ Rebirth</p></div>
            <div class="guide-card"><b>Shard</b><p>ได้จากการเปิดกาชาหรือผสมแล้วได้มอนสเตอร์ซ้ำ Shard ผูกกับมอนสเตอร์ตัวนั้น ใช้สำหรับอัปดาว</p></div>
            <div class="guide-card"><b>Equipment</b><p>ดรอปจากการชนะด่าน ยิ่งด่านสูงหรือเป็นบอส โอกาสได้ของระดับสูงยิ่งดี ใช้เพิ่ม HP / ATK / DEF / SPD</p></div>
            <div class="guide-card"><b>Level</b><p>เกมนี้ไม่มี EXP แยกต่างหาก การเพิ่มเลเวลใช้ Gold โดยตรง ถ้าติดด่านให้ฟาร์ม Gold แล้วอัปเลเวลตัวหลัก</p></div>
            <div class="guide-card"><b>Rebirth Stack</b><p>ได้จากมอนสเตอร์ Lv.100 แล้วกด Rebirth ในหน้าคลัง สแต็กนี้เพิ่มค่าสเตตัสถาวรและใช้ไต่ด่านลึกขึ้น</p></div>
          </div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>การฟาร์ม</h3><small>เกมตั้งใจให้ใช้เวลานานขึ้น</small></div>
          <ul class="guide-list">
            <li>ถ้าติดด่าน ให้เลือกด่านที่ชนะได้ แล้วกด <b>ฟาร์มด่านนี้ซ้ำ</b> เพื่อเก็บ Gold/Dust/อุปกรณ์ โดยไม่ข้ามไปด่านถัดไป</li>
            <li>ถ้าต้องการอัปตัวเดียว ให้เข้า <b>คลัง</b> → กด <b>เลือกอัป</b> → ใช้แผง <b>อัปเกรดเฉพาะตัวที่เลือก</b></li>
            <li>กด <b>อัปเกรดอัตโนมัติ</b> เพื่อใช้ Gold/Dust กับตัวในทีมก่อน ถ้าไม่อยากเลือกเอง</li>
            <li>อุปกรณ์ดรอปจากด่าน ยิ่งด่านสูง/บอสยิ่งมีโอกาสดีขึ้น</li>
            <li>Ticket ได้จากชนะสะสมทุก 7 ครั้ง, บอส, และ Daily Quest</li>
            <li>บอสทุก 5 ด่านจะเป็นจุดเช็กพลัง ถ้าติดบอสให้ฟาร์ม/ผสม/อัปเกรดก่อน</li>
            <li>ตอนสู้สามารถกด <b>ฟาร์ม x4</b> หรือ <b>ฟาร์ม x8</b> เพื่อเร่งข้อความและใช้ฟาร์มซ้ำได้เร็วขึ้น</li>
          </ul>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ผสมมอนสเตอร์</h3><small>Fusion</small></div>
          <p class="muted">ใช้มอนสเตอร์สำรอง 2 ตัวที่ไม่ได้อยู่ในทีมเพื่อผสม ผลลัพธ์บางคู่มีสูตรเฉพาะในตำราและจะการันตีผลลัพธ์ ถ้าไม่มีสูตรจะเข้า Chaos Fusion: สุ่มจาก pool ตามระดับ ธาตุ และบทบาทของวัตถุดิบ ยิ่งวัตถุดิบระดับ/ธาตุ/บทบาทใกล้กัน โอกาสอัปเป็นระดับสูงขึ้นจะดีกว่า</p>
          <ul class="guide-list">
            <li><b>มีสูตร:</b> ได้ตัวตามตำราแบบแน่นอน ค่าใช้จ่ายถูกลงเล็กน้อย</li>
            <li><b>ไม่มีสูตร:</b> ผสมได้เหมือนกัน แต่ผลลัพธ์จะสุ่มจาก Chaos Pool</li>
            <li>ใช้ตัวระดับเดียวกัน / ธาตุเดียวกัน / บทบาทเดียวกัน จะเพิ่มโอกาสได้ระดับสูงกว่า</li>
            <li>ตัวที่อยู่ในทีมจะถูกล็อกไว้ ต้องถอดออกจากทีมก่อนถึงจะเอาไปผสมได้</li>
          </ul>
          <div class="grid2">
            <button class="btn green" data-screen="fusion">เปิดหน้าผสม</button>
            <button class="btn ghost" data-screen="team">จัดทีม</button>
          </div>
        </section>
        <section class="panel">
          <div class="section-title"><h3>ระบบ Final ที่ควรรู้</h3><small>Quality of Life</small></div>
          <div class="guide-grid">
            <div class="guide-card"><b>Favorite / Lock</b><p>กด Favorite ที่การ์ดมอนสเตอร์เพื่อกันเอาไปผสมโดยไม่ตั้งใจ ตัวที่ล็อกจะไม่ถูก Auto Fusion และเลือกผสมไม่ได้</p></div>
            <div class="guide-card"><b>Monster Codex</b><p>หน้า “ตำรา” รวมมอนสเตอร์ทั้งหมด ดูตัวที่เคยพบ สกิล ธาตุ บทบาท และสูตรผสมที่เกี่ยวข้อง V34 ปรับหน้าจัดการปีศาจให้สั้นลง ใช้เมนูสไลด์สำหรับคำสั่งหลัก ลดการเลื่อนยาว</p></div>
            <div class="guide-card"><b>Filter / Sort</b><p>หน้า Team, คลัง และ Codex มีตัวกรองตามบทบาท ธาตุ ระดับ และ Favorite พร้อมเรียงตาม Power, Level, Rebirth หรือ Rarity</p></div>
            <div class="guide-card"><b>Target Upgrade</b><p>หน้า คลัง มีปุ่ม เลือกอัป บนการ์ดปีศาจทุกตัว แล้วใช้แผงใหญ่ด้านบนเพื่ออัป Lv +1, +10, สูงสุดเท่าที่จ่ายไหว, อัปดาว หรือ Rebirth เฉพาะตัวนั้น</p></div>
            <div class="guide-card"><b>Team Preset</b><p>บันทึกทีมได้ 3 ชุด เหมาะสำหรับทีมฟาร์ม ทีมบอส และทีมทดลอง สลับได้จากหน้า ทีม หรือ คลัง</p></div>
            <div class="guide-card"><b>Auto Sell</b><p>ขาย/ย่อยอุปกรณ์ Common-Rare ที่ไม่ได้ใส่อยู่ เพื่อเปลี่ยนเป็น Gold และ Dust ลดความรกของคลัง</p></div>
            <div class="guide-card"><b>Auto Fusion ต่ำ</b><p>ผสมเฉพาะ Common/Rare สำรองที่ไม่อยู่ในทีม ไม่ได้ล็อก และไม่เคย Rebirth ใช้สำหรับเคลียร์วัตถุดิบต่ำหลังฟาร์มยาว</p></div>
            <div class="guide-card"><b>Auto Farm</b><p>เลือกฟาร์มด่านเดิมจนแพ้ หรือกำหนด 10/50 รอบได้ ใช้กับปุ่มความเร็ว ฟาร์ม x4/x8 เพื่อเก็บทรัพยากรเร็วขึ้น</p></div>
            <div class="guide-card"><b>Battle Summary</b><p>หลังสู้จะมีสรุป MVP, Damage, Heal, ตัวรับดาเมจ และสาเหตุที่แพ้ เพื่อช่วยปรับทีม</p></div>
            <div class="guide-card"><b>PWA</b><p>บน Android/Chrome สามารถกด Add to Home Screen เพื่อเปิดเหมือนแอปเกมได้</p></div>
          </div>
        </section>
        <section class="panel save-panel">
          <div class="section-title"><h3>จัดการเซฟ</h3><small>Reset / Export / Import</small></div>
          <p class="muted">เกมเซฟอัตโนมัติในเครื่องนี้ ถ้าจะเริ่มใหม่ต้องพิมพ์ <b>RESET</b> ก่อนกดรีเซ็ต ระบบจะทำ Backup ล่าสุดไว้ให้อัตโนมัติก่อนล้างเซฟ</p>
          <div class="save-box">
            <label>Reset Game</label>
            <input id="resetConfirmBox" class="save-input" placeholder="พิมพ์ RESET เพื่อยืนยัน" />
            <div class="grid2">
              <button class="btn red" data-action="resetGame">รีเซ็ตเกม / เริ่มใหม่</button>
              <button class="btn ghost" data-action="save">บันทึกเกมตอนนี้</button>
            </div>
          </div>
          <div class="save-box">
            <label>Export Save / Backup</label>
            <textarea id="saveExportBox" class="save-textarea" readonly placeholder="กด Export เพื่อสร้างข้อความเซฟ"></textarea>
            <div class="grid2">
              <button class="btn primary" data-action="exportSave">Export เป็นข้อความ</button>
              <button class="btn ghost" data-action="copyExport">Copy ข้อความ Export</button>
              <button class="btn ghost" data-action="exportBackup">โหลด Backup ล่าสุด</button>
            </div>
          </div>
          <div class="save-box">
            <label>Import Save</label>
            <textarea id="saveImportBox" class="save-textarea" placeholder="วางข้อความเซฟที่ Export ไว้ตรงนี้"></textarea>
            <button class="btn green" data-action="importSave">Import เซฟจากข้อความ</button>
          </div>
        </section>
      </div>`;
  }

  function render(){
    const screen = currentScreen();
    const map = {home, battle:battleScreen, team:teamScreen, fusion:fusionScreen, gacha:gachaScreen, heroes:heroesScreen, codex:codexScreen, manual:manualScreen};
    app().innerHTML = hud() + (map[screen]||home)() + nav() + monsterActionSheet();
    bind();
    syncBattleOverlayMode();
  }

  function bind(){
    document.querySelectorAll('[data-screen]').forEach(b=>b.addEventListener('click',()=>setScreen(b.dataset.screen)));
    document.querySelectorAll('[data-action]').forEach(b=>{
      const fire = ()=>{ const ds={...b.dataset}; if('value' in b) ds.value=b.value; handleAction(b.dataset.action,ds,b); };
      if(b.tagName === 'SELECT') b.addEventListener('change',fire); else b.addEventListener('click',fire);
    });
  }

  function handleAction(action, data, btn){
    const safeWhileBattle = new Set(['setSpeed','speed','stopAuto','save','exportSave','copyExport','exportBackup','setHeroFilter','setHeroSort','applyHeroSearch','clearHeroSearch','openMonsterMenu','closeMonsterMenu']);
    if(battleRunning && !safeWhileBattle.has(action)) return toast('กำลังต่อสู้อยู่: ดูหน้าอื่นได้ แต่ยังแก้ทีม/อัปเกรด/ผสมไม่ได้จนจบไฟต์');
    switch(action){
      case 'save': S().save(); toast('บันทึกเกมแล้ว'); break;
      case 'setSpeed': { const v=Number(data.speedValue || data.speed || 1); S().state.settings.battleSpeed=v; battleSpeed=v; S().save(); toast(v===20?'เปิดข้ามไว x20 แล้ว':v===50?'เปิดฟาร์ม x50 แล้ว':`ตั้งความเร็วต่อสู้ ${v}x แล้ว`); render(); break; }
      case 'autoTeam': S().autoTeam(); toast('จัดทีมอัตโนมัติแล้ว'); render(); break;
      case 'autoUpgrade': { const c=S().autoUpgrade(); toast(c?`อัปเกรด/ใส่ของ ${c} ครั้ง`:'ยังอัปเกรดไม่ได้ ทรัพยากรไม่พอ'); render(); break; }
      case 'equipBest': { const c=S().equipBest(); toast(c?`ใส่อุปกรณ์ ${c} ช่องให้ทีม/คลัง`:'ของที่ใส่อยู่ดีที่สุดแล้ว'); render(); break; }
      case 'autoSellLow': { const r=S().autoSellLow('Rare'); toast(r.msg); render(); break; }
      case 'autoFusionLow3': { const r=S().autoFusionLow(3); toast(r.msg); render(); break; }
      case 'autoFusionLow10': { const r=S().autoFusionLow(10); toast(r.msg); render(); break; }
      case 'savePreset': { const r=S().saveTeamPreset(data.slot); toast(`บันทึกทีม Preset ${r.slot} แล้ว`); render(); break; }
      case 'loadPreset': { const r=S().loadTeamPreset(data.slot); toast(r.ok?`โหลดทีม Preset ${r.slot} แล้ว`:r.msg); render(); break; }
      case 'selectUpgradeHero': { const r=S().setSelectedHero(data.id); toast(r.ok?'เลือกปีศาจสำหรับอัปเกรดแล้ว':r.msg); render(); break; }
      case 'levelUp10': { const r=S().levelUpMany(data.id,10); toast(r.msg || (r.ok?`อัปเลเวล ${r.count} ครั้งแล้ว`:'อัปไม่ได้')); render(); break; }
      case 'levelUpMax': { const r=S().levelUpMany(data.id,'max'); toast(r.msg || (r.ok?`อัปเลเวล ${r.count} ครั้งแล้ว`:'อัปไม่ได้')); render(); break; }
      case 'upgradeOneHero': { const r=S().upgradeOneHero(data.id); toast(r.msg); render(); break; }
      case 'toggleFavorite': { const r=S().toggleFavorite(data.id); toast(r.ok?(r.locked?'ล็อก Favorite แล้ว':'ปลดล็อก Favorite แล้ว'):r.msg); render(); break; }
      case 'setHeroFilter': S().state.settings.heroFilter = data.value || 'all'; S().save(); render(); break;
      case 'setHeroSort': S().state.settings.heroSort = data.value || 'power'; S().save(); render(); break;
      case 'openMonsterMenu': { const r=S().setSelectedHero(data.id); if(!r.ok) toast(r.msg); else S().state.settings.monsterMenuOpen = true; S().save(); render(); break; }
      case 'closeMonsterMenu': S().state.settings.monsterMenuOpen = false; S().save(); render(); break;
      case 'clearTeam': S().state.team = [null,null,null,null,null]; S().save(); toast('ถอดทีมทั้งหมดแล้ว'); render(); break;
      case 'toggleInventory': S().state.settings.showInventory = !S().state.settings.showInventory; S().save(); render(); break;
      case 'toggleFusionRecipes': S().state.settings.showFusionRecipes = !S().state.settings.showFusionRecipes; S().save(); render(); break;
      case 'applyHeroSearch': { const box=document.getElementById('heroSearchBox'); S().state.settings.heroSearch = box ? box.value.trim() : ''; S().save(); render(); break; }
      case 'clearHeroSearch': S().state.settings.heroSearch = ''; S().save(); render(); break;
      case 'smartBattle': startBattle(); break;
      case 'autoBattle': autoBattleUntilLose(); break;
      case 'farmRepeat': farmCurrentStageUntilStop(); break;
      case 'farmRepeat10': farmCurrentStageRounds(10); break;
      case 'farmRepeat50': farmCurrentStageRounds(50); break;
      case 'stopAuto': autoRun=false; farmRepeatRun=false; toast('จะหยุดอัตโนมัติหลังจบไฟต์นี้'); break;
      case 'startBattle': startBattle(); break;
      case 'selectStage': S().selectStage(data.id); render(); break;
      case 'starterRecruit': doStarterRecruit(); break;
      case 'gacha1': doGacha(1); break;
      case 'gacha10': doGacha(10); break;
      case 'levelUp': { const r=S().levelUp(data.id); toast(r.ok?'อัปเลเวลแล้ว':r.msg); render(); break; }
      case 'starUp': { const r=S().starUp(data.id); toast(r.ok?'อัปดาวแล้ว':r.msg); render(); break; }
      case 'rebirthHero': { const r=S().rebirthHero(data.id); toast(r.ok?`Rebirth สำเร็จ R+${r.rebirth}`:r.msg); render(); break; }
      case 'toggleTeam': toggleTeam(data.id); break;
      case 'toggleFusion': { const r=S().toggleFusion(data.id); if(!r.ok) toast(r.msg); render(); break; }
      case 'clearFusion': S().clearFusion(); render(); break;
      case 'doFusion': { const r=S().doFusion(); toast(r.ok?`ผสมได้ ${r.result.name}`:r.msg); render(); break; }
      case 'autoFusion': { const r=S().autoFusion(); toast(r.ok?(r.msg||`ผสมได้ ${r.result.name}`):r.msg); render(); break; }
      case 'clearSlot': S().state.team[Number(data.slot)] = null; S().save(); render(); break;
      case 'claimIdle': { const r=S().claimIdle(); toast(r.ok?`รับ ${S().resourceText(r.preview.reward)}`:r.msg); render(); break; }
      case 'claimQuest': { const r=S().questClaim(data.id); toast(r.ok?`รับ ${S().resourceText(r.reward)}`:r.msg); render(); break; }
      case 'exportSave': {
        const box = document.getElementById('saveExportBox');
        if(box){ box.value = S().exportSaveText(); box.focus(); box.select(); }
        toast('สร้างข้อความเซฟแล้ว คัดลอกเก็บไว้ได้');
        break;
      }
      case 'copyExport': {
        const box = document.getElementById('saveExportBox');
        if(!box) break;
        if(!box.value) box.value = S().exportSaveText();
        box.focus(); box.select();
        try{ document.execCommand('copy'); toast('คัดลอกข้อความเซฟแล้ว'); }
        catch(e){ toast('คัดลอกอัตโนมัติไม่ได้ ให้กด Ctrl+C เอง'); }
        break;
      }
      case 'importSave': {
        const box = document.getElementById('saveImportBox');
        const txt = box ? box.value : '';
        if(!confirm('นำเข้าเซฟนี้แทนเซฟปัจจุบัน?')) break;
        const r = S().importSaveText(txt);
        toast(r.msg);
        render();
        break;
      }
      case 'resetGame': { const input=document.getElementById('resetConfirmBox'); const ok=input && input.value.trim().toUpperCase()==='RESET'; if(!ok){toast('พิมพ์ RESET ในช่องยืนยันก่อนรีเซ็ต'); break;} if(confirm('ลบเซฟแล้วเริ่มใหม่? มี backup อัตโนมัติก่อนลบ')){S().reset(); toast('เริ่มเกมใหม่แล้ว'); render();} break; }
      case 'exportBackup': { const box=document.getElementById('saveExportBox'); const txt=S().exportBackupText(); if(box){box.value=txt || 'ยังไม่มี Backup'; box.focus(); box.select();} toast(txt?'โหลด Backup ล่าสุดแล้ว':'ยังไม่มี Backup'); break; }
    }
  }

  function toggleTeam(id){
    const team=S().state.team;
    const idx=team.indexOf(id);
    if(idx>=0) team[idx]=null;
    else {
      const empty=team.findIndex(x=>!x);
      if(empty>=0) team[empty]=id;
      else team[4]=id;
    }
    S().save(); render();
  }

  function doStarterRecruit(){
    const r = S().starterRecruit();
    if(r.ok){
      const hero = r.result.hero;
      toast(`อัญเชิญฟรีได้ ${hero.name} เหลือ ${r.left}/5`);
    } else toast(r.msg);
    render();
  }

  function doGacha(count){
    const r=S().gacha(count);
    toast(r.ok?`อัญเชิญ ${count} ครั้งแล้ว`:r.msg);
    if(r.ok) S().state.screen='gacha';
    render();
  }

  async function autoBattleUntilLose(){
    if(battleRunning) return;
    if(S().state.team.filter(Boolean).length===0) return toast('ยังไม่มีทีม');
    farmRepeatRun = false;
    autoRun = true;
    battleRunning = true;
    openBattleFullscreenOnStart();
    let winStreak = 0;
    let lastRewardText = '';
    try{
      while(autoRun){
        const stageId = S().state.campaign.selected;
        const sim = window.BattleSim.simulate(stageId);
        await playBattle(sim);
        const result = S().completeStage(sim.stage.id, sim.win);
        S().setLastBattle(makeBattleSummary(sim,result));
        if(!sim.win){
          toast(`Auto หยุด: แพ้ที่ ${sim.stage.title} | ชนะต่อเนื่อง ${winStreak} ครั้ง`);
          break;
        }
        winStreak++;
        lastRewardText = S().resourceText(result.reward);
        if(result.item) lastRewardText += ` | ได้ ${result.item.name}${D().equipmentTypes[result.item.type].label}`;
        const nextId = Math.min(sim.stage.id + 1, D().stages.length);
        if(sim.stage.id >= D().stages.length){
          toast(`Auto จบแล้ว: เคลียร์ด่านสุดท้าย | ชนะ ${winStreak} ครั้ง`);
          break;
        }
        if(nextId <= S().state.campaign.unlocked) S().selectStage(nextId);
        render();
        await wait(900 / Math.max(0.75,battleSpeed));
      }
      if(!autoRun && winStreak>0){
        toast(`หยุด Auto แล้ว | ชนะ ${winStreak} ครั้ง${lastRewardText ? ' | ล่าสุด '+lastRewardText : ''}`);
      }
    } finally {
      autoRun = false;
      battleRunning = false;
      render();
    }
  }



  async function farmCurrentStageRounds(limit=10){
    if(battleRunning) return;
    if(S().state.team.filter(Boolean).length===0) return toast('ยังไม่มีทีม');
    const fixedStageId = S().state.campaign.selected;
    farmRepeatRun = true;
    autoRun = false;
    battleRunning = true;
    openBattleFullscreenOnStart();
    let runs = 0;
    let lastRewardText = '';
    try{
      while(farmRepeatRun && runs < limit){
        S().selectStage(fixedStageId);
        const sim = window.BattleSim.simulate(fixedStageId);
        await playBattle(sim);
        const result = S().completeStage(sim.stage.id, sim.win, {stay:true});
        S().setLastBattle(makeBattleSummary(sim,result));
        S().selectStage(fixedStageId);
        if(!sim.win){
          toast(`ฟาร์มหยุด: แพ้ที่ ${sim.stage.title} | ฟาร์มสำเร็จ ${runs} รอบ`);
          break;
        }
        runs++;
        lastRewardText = S().resourceText(result.reward);
        if(result.item) lastRewardText += ` | ได้ ${result.item.name}${D().equipmentTypes[result.item.type].label}`;
        render();
        await wait(450 / Math.max(0.75,battleSpeed));
      }
      if(farmRepeatRun && runs >= limit){
        toast(`ฟาร์มครบ ${runs} รอบ${lastRewardText ? ' | ล่าสุด '+lastRewardText : ''}`);
      } else if(!farmRepeatRun && runs>0){
        toast(`หยุดฟาร์มแล้ว | ฟาร์มสำเร็จ ${runs} รอบ${lastRewardText ? ' | ล่าสุด '+lastRewardText : ''}`);
      }
    } finally {
      farmRepeatRun = false;
      battleRunning = false;
      render();
    }
  }

  async function farmCurrentStageUntilStop(){
    if(battleRunning) return;
    if(S().state.team.filter(Boolean).length===0) return toast('ยังไม่มีทีม');
    const fixedStageId = S().state.campaign.selected;
    farmRepeatRun = true;
    autoRun = false;
    battleRunning = true;
    openBattleFullscreenOnStart();
    let runs = 0;
    let lastRewardText = '';
    try{
      while(farmRepeatRun){
        S().selectStage(fixedStageId);
        const sim = window.BattleSim.simulate(fixedStageId);
        await playBattle(sim);
        const result = S().completeStage(sim.stage.id, sim.win, {stay:true});
        S().setLastBattle(makeBattleSummary(sim,result));
        S().selectStage(fixedStageId);
        if(!sim.win){
          toast(`ฟาร์มหยุด: แพ้ที่ ${sim.stage.title} | ฟาร์มสำเร็จ ${runs} รอบ`);
          break;
        }
        runs++;
        lastRewardText = S().resourceText(result.reward);
        if(result.item) lastRewardText += ` | ได้ ${result.item.name}${D().equipmentTypes[result.item.type].label}`;
        render();
        await wait(550 / Math.max(0.75,battleSpeed));
      }
      if(!farmRepeatRun && runs>0){
        toast(`หยุดฟาร์มแล้ว | ฟาร์มสำเร็จ ${runs} รอบ${lastRewardText ? ' | ล่าสุด '+lastRewardText : ''}`);
      }
    } finally {
      farmRepeatRun = false;
      battleRunning = false;
      render();
    }
  }

  async function startBattle(){
    if(battleRunning) return;
    if(S().state.team.filter(Boolean).length===0) return toast('ยังไม่มีทีม');
    battleRunning = true;
    openBattleFullscreenOnStart();
    const sim = window.BattleSim.simulate(S().state.campaign.selected);
    await playBattle(sim);
    const result = S().completeStage(sim.stage.id, sim.win);
    S().setLastBattle(makeBattleSummary(sim,result));
    battleRunning = false;
    if(sim.win){
      let msg = `ชนะ! ${S().resourceText(result.reward)}`;
      if(result.item) msg += ` | ได้ ${result.item.name}${D().equipmentTypes[result.item.type].label}`;
      toast(msg);
    } else toast('แพ้ ลองกดอัปเกรดอัตโนมัติหรือฟาร์มด่านเก่า');
    render();
  }

  function unitHtml(u){
    const hpPct = Math.max(0,Math.round(u.hp/u.maxHp*100));
    return `<div class="combat-unit rarity-${u.rarity || (u.side==='enemy'?'Enemy':'Common')} ${u.dead?'dead':''}" data-cuid="${u.uid}">
      <div class="cu-icon">${u.icon}</div><div class="cu-name">${h(u.name)} ${u.rarity&&u.rarity!=='Enemy'?rarityBadge(u.rarity):''}</div><div class="cu-tags">${D().elements[u.element]?.icon||''} ${u.stun?'💫':''}${u.poison?'☠️':''}${u.burn?'🔥':''}</div>
      <div class="bar"><i style="width:${hpPct}%"></i></div>
      <div class="bar energy"><i style="width:${Math.round(u.energy||0)}%"></i></div>
      <div class="cu-hp">${Math.max(0,u.hp)}/${u.maxHp}</div>
    </div>`;
  }

  function drawBattleSnapshot(snap){
    document.getElementById('allyField').innerHTML = snap.allies.map(unitHtml).join('');
    document.getElementById('enemyField').innerHTML = snap.enemies.map(unitHtml).join('');
    const pb = document.getElementById('pressTurnBar');
    if(pb) pb.innerHTML = snap.press ? `<span class="${snap.press.side==='ally'?'ally':'enemy'}">${snap.press.side==='ally'?'ฝ่ายเรา':'ศัตรู'}</span><b>${'●'.repeat(Math.floor(snap.press.tokens/2))}${snap.press.tokens%2?'◐':''}${'○'.repeat(Math.max(0,snap.press.maxFull-Math.floor(snap.press.tokens/2)-(snap.press.tokens%2?1:0)))}</b>` : '<span>Press Turn</span><b>-</b>'; 
  }

  function wait(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

  function openBattleFullscreenOnStart(){
    battleWidgetExpanded = true;
    if(currentScreen() !== 'battle'){
      S().state.screen = 'battle';
      S().save();
      render();
      scrollGameToTop();
    }
  }

  async function playBattle(sim){
    const overlay=document.getElementById('battleOverlay');
    const log=document.getElementById('battleLog');
    const progress=document.getElementById('battleProgress');
    overlay.classList.remove('hidden');
    syncBattleOverlayMode();
    const stopBtn = document.getElementById('stopAutoBtn');
    if(stopBtn){
      stopBtn.classList.toggle('hidden', !(autoRun || farmRepeatRun));
      stopBtn.onclick = () => { autoRun = false; farmRepeatRun = false; toast('จะหยุดอัตโนมัติหลังจบไฟต์นี้'); };
    }
    const returnBtn = document.getElementById('returnBattleBtn');
    if(returnBtn) returnBtn.onclick = () => setScreen('battle');
    const expandBtn = document.getElementById('expandBattleBtn');
    if(expandBtn) expandBtn.onclick = (e) => { e.stopPropagation(); battleWidgetExpanded = true; syncBattleOverlayMode(); };
    const minimizeBtn = document.getElementById('minimizeBattleBtn');
    if(minimizeBtn) minimizeBtn.onclick = (e) => { e.stopPropagation(); minimizeBattleToDock(); };
    const stageBox = overlay.querySelector('.battle-stage');
    if(stageBox) stageBox.onclick = (e) => {
      if(e.target && e.target.closest && e.target.closest('button')) return;
      if(battleRunning && currentScreen() !== 'battle' && !battleWidgetExpanded){
        battleWidgetExpanded = true;
        syncBattleOverlayMode();
      }
    };
    document.getElementById('battleTitle').textContent = sim.stage.title;
    log.innerHTML=''; progress.style.width='0%';
    battleSpeed = S().state.settings.battleSpeed || 1;
    document.querySelectorAll('[data-speed]').forEach(b=>{
      b.classList.toggle('active', Number(b.dataset.speed)===battleSpeed);
      b.onclick=()=>{
        battleSpeed=Number(b.dataset.speed); S().state.settings.battleSpeed=battleSpeed; S().save();
        document.querySelectorAll('[data-speed]').forEach(x=>x.classList.toggle('active', Number(x.dataset.speed)===battleSpeed));
      };
    });
    for(let i=0;i<sim.events.length;i++){
      syncBattleOverlayMode();
      const ev=sim.events[i];
      drawBattleSnapshot(ev.snapshot);
      document.getElementById('eventPopup').className = `event-popup ${ev.type}`;
      document.getElementById('eventTitle').textContent = ev.title;
      document.getElementById('eventText').textContent = ev.pressText ? `${ev.text}  |  ${ev.pressText}` : ev.text;
      document.querySelector('#eventPopup .event-icon').textContent = ev.icon || '⚔️';
      progress.style.width = `${Math.round((i+1)/sim.events.length*100)}%`;
      const row=document.createElement('div'); row.textContent=ev.pressText ? `${ev.text}  |  ${ev.pressText}` : ev.text; log.prepend(row);
      if(log.children.length>18) log.lastChild.remove();
      if(ev.target){
        const target = document.querySelector(`[data-cuid="${ev.target}"]`);
        if(target) target.classList.add(ev.type==='heal'?'heal':'hit');
      }
      const base = ev.type==='round' ? 1600 : ev.type==='start' ? 2200 : ev.type==='win' || ev.type==='lose' ? 3800 : 2600;
      await wait(base / Math.max(0.75, battleSpeed));
    }
    await wait(1500 / Math.max(0.75, battleSpeed));
    overlay.classList.add('hidden');
    overlay.classList.remove('dock-mode','expanded-dock','collapsed-dock','full-mode');
    battleWidgetExpanded = false;
    const stopBtnEnd = document.getElementById('stopAutoBtn');
    if(stopBtnEnd) stopBtnEnd.classList.add('hidden');
  }

  return { render, toast, setScreen };
})();
