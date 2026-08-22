import {
  VERSION,RARITIES,CLASSES,HEROES,SKILLS,GEAR,EQUIP_SLOTS,EQUIP_UNLOCK,WHISPERWOOD_NODES,
  encounterForNode,rarityIndex
} from "./data.js";
import {
  saveState,resetState,heroDefinition,getHeroState,ownedHeroIds,heroStats,gearDefinition,gearCopy,
  idlePreview,claimIdle,minePreview,claimMine,equipBest,ascendHero,pullGate,gateRates,formationMove,
  swapPartyHero,devBoost,giveBattleRewards,addGear
} from "./state.js";
import {BattleController,unitStatusSummary} from "./combat.js";

const esc=value=>String(value??"").replace(/[&<>'"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[char]));
const pct=(value,max)=>Math.max(0,Math.min(100,max?value/max*100:0));
const fmt=value=>Math.floor(value||0).toLocaleString();
const statusIcon=name=>({Bleed:"🩸",Poison:"☠️",Burn:"🔥",Stagger:"💫","Weak Point":"🎯",Vulnerable:"⬡"}[name]||"✦");

export class GameUI{
  constructor(root,state){
    this.root=root;this.state=state;this.view="home";this.selectedHero=state.party[0].hero;this.selectedGate="Heroes";this.overlays=[];this.toast=null;this.battle=null;this.battleContext=null;this.enemyTimer=null;this.autoTimer=null;this.suppressSkillClick=false;
    root.addEventListener("click",event=>this.onClick(event));
    root.addEventListener("keydown",event=>{if(event.key==="Escape"&&this.overlays.length){this.overlays.pop();this.render()}});
    this.render();
  }

  notify(text,tone="normal"){this.toast={text,tone};this.render();clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{this.toast=null;this.render()},2200)}
  pushOverlay(type,payload={}){this.overlays.push({type,payload});this.render()}
  popOverlay(){this.overlays.pop();this.render()}
  topOverlay(){return this.overlays[this.overlays.length-1]}

  render(){
    const content=this.battle?this.renderBattle():this.renderView();
    this.root.innerHTML=`<div class="game-shell ${this.state.settings.reduceMotion?'reduce-motion':''}">
      ${this.renderHeader()}<main class="game-main view-${this.view}">${content}</main>${this.battle?"":this.renderNav()}
      <div class="overlay-layer ${this.overlays.length?'is-open':''}">${this.overlays.length?this.renderOverlay(this.topOverlay()):""}</div>
      ${this.toast?`<div class="toast toast-${this.toast.tone}">${esc(this.toast.text)}</div>`:""}
    </div>`;
    this.bindSkillReorder();
  }

  renderHeader(){return`<header class="topbar">
    <button class="profile-button" data-action="settings"><span class="profile-orb">⚔️</span><span><b>${esc(this.state.mc.name)}</b><small>ADV Lv.${this.state.plv}</small></span></button>
    <div class="currency-strip">
      <span title="Gold">🪙 <b>${compact(this.state.gold)}</b></span><span title="Gems">💎 <b>${compact(this.state.gems)}</b></span><span title="Tickets">🎫 <b>${compact(this.state.tickets)}</b></span><span title="Skill Dust">✦ <b>${compact(this.state.skillDust)}</b></span>
    </div><button class="icon-button" data-action="settings" aria-label="Settings">⚙️</button>
  </header>`}

  renderNav(){const tabs=[['home','⌂','Home'],['heroes','♞','Heroes'],['explore','✥','Explore'],['dungeons','⌁','Dungeons'],['summon','✦','Summon']];return`<nav class="bottom-nav">${tabs.map(([id,icon,label])=>`<button class="${this.view===id?'active':''}" data-action="nav" data-view="${id}"><span>${icon}</span><small>${label}</small></button>`).join("")}</nav>`}

  renderView(){if(this.view==="heroes")return this.renderHeroes();if(this.view==="explore")return this.renderExplore();if(this.view==="dungeons")return this.renderDungeons();if(this.view==="summon")return this.renderSummon();return this.renderHome()}

  renderHome(){
    const idle=idlePreview(this.state),mine=minePreview(this.state),cleared=this.state.explore.cleared;
    return`<section class="home-scene scene-panel">
      <div class="scene-shade"></div>
      <div class="home-content">
        <div class="home-title"><small>Aren's Settlement</small><h1>Aetherfall</h1><span class="version-chip">v${VERSION} • Battle Reforged</span></div>
        <article class="quest-card glass-card"><div><span class="eyebrow">GUIDE QUEST</span><b>${cleared?`Push through Whisperwood ${Math.min(10,cleared+1)}`:"Enter the Whisperwood"}</b><small>${cleared}/10 region nodes cleared</small></div><button data-action="go-explore">GO</button></article>
        <div class="building-grid">
          <button class="building-card gate" data-action="nav" data-view="summon"><span>✦</span><b>Aether Gate</b><small>Heroes & relics</small></button>
          <button class="building-card tower" data-action="nav" data-view="dungeons"><span>♜</span><b>Trial Tower</b><small>Floor ${this.state.tower.floor}</small></button>
          <button class="building-card forge" data-action="blacksmith"><span>⚒</span><b>Blacksmith</b><small>${this.state.inventory.length} items</small></button>
          <button class="building-card guild" data-action="go-explore"><span>⚔</span><b>Guild Hall</b><small>Whisperwood</small></button>
        </div>
        <div class="reward-grid">
          <article class="reward-card glass-card"><div><span class="eyebrow">24H EXPEDITION</span><b>🪙 ${fmt(idle.gold)}</b><small>${idle.battles} battles • 💎 ${idle.gems}</small></div><button data-action="claim-idle">CLAIM</button></article>
          <article class="reward-card glass-card"><div><span class="eyebrow">AETHER MINE</span><b>💎 ${fmt(mine.gems)}</b><small>${formatDuration(mine.seconds)} gathered</small></div><button data-action="claim-mine">CLAIM</button></article>
        </div>
        <button class="tester-link" data-action="tester">🧪 Open Tester Tools</button>
      </div>
    </section>`;
  }

  renderHeroes(){
    const selectedIndex=this.state.party.findIndex(x=>x.hero===this.selectedHero),selectedParty=selectedIndex>=0,base=heroDefinition(this.state,this.selectedHero),owned=getHeroState(this.state,this.selectedHero),stats=selectedParty?heroStats(this.state,selectedIndex):null;
    const reserve=ownedHeroIds(this.state).filter(id=>!this.state.party.some(x=>x.hero===id));
    return`<section class="screen-section heroes-screen">
      <div class="section-heading"><div><span class="eyebrow">ROSTER</span><h1>Heroes</h1></div><button class="secondary-button" data-action="formation">Formation</button></div>
      <div class="active-party">${this.state.party.map((slot,i)=>this.heroMiniCard(slot.hero,i)).join("")}</div>
      <article class="hero-focus rarity-border ${owned.rarity}">
        <div class="hero-focus-top"><div class="hero-medallion ${owned.rarity}">${base.icon}</div><div><span class="rarity-label ${owned.rarity}">${owned.rarity}</span><h2>${esc(base.name)}</h2><p>${CLASSES[base.class].icon} ${base.class}${selectedParty?` • Lv.${stats.level}`:" • Reserve"}</p></div><div class="element-glyph">${elementIcon(base.element)}</div></div>
        <div class="stat-ribbon">${stats?[["ATK",stats.atk],["DEF",stats.def],["HP",stats.hp],["SPD",stats.spd]].map(([k,v])=>`<span><small>${k}</small><b>${fmt(v)}</b></span>`).join(""):`<span><small>NATIVE</small><b>${base.native}</b></span><span><small>CLASS</small><b>${base.class}</b></span>`}</div>
        <div class="hero-action-grid"><button data-action="hero-page" data-page="stats">Stats</button><button data-action="hero-page" data-page="skills">Skills</button><button data-action="hero-page" data-page="equipment">Equipment</button></div>
        <div class="hero-major-actions"><button data-action="ascend" ${rarityIndex(owned.rarity)>=7?'disabled':''}>Ascend <small>${owned.shards||0} shards</small></button>${selectedParty&&selectedIndex>0?`<button data-action="swap">Swap</button>`:""}</div>
      </article>
      <div class="subheading"><b>Reserve Heroes</b><small>Highest rarity first</small></div>
      <div class="reserve-grid">${reserve.length?reserve.map(id=>this.reserveCard(id)).join(""):`<div class="empty-state">No reserve heroes yet. Visit the Aether Gate.</div>`}</div>
    </section>`;
  }

  heroMiniCard(id,index){const base=heroDefinition(this.state,id),owned=getHeroState(this.state,id),slot=this.state.party[index];return`<button class="hero-mini ${this.selectedHero===id?'selected':''} ${owned.rarity}" data-action="select-hero" data-hero="${id}"><span>${base.icon}</span><b>${esc(base.name)}</b><small>Lv.${slot.level}</small><i>${index===0?'MC':index+1}</i></button>`}
  reserveCard(id){const base=heroDefinition(this.state,id),owned=getHeroState(this.state,id);return`<button class="reserve-card ${owned.rarity}" data-action="select-hero" data-hero="${id}"><span>${base.icon}</span><div><b>${esc(base.name)}</b><small>${owned.rarity} • ${base.class}</small></div></button>`}

  renderExplore(){
    const selected=Math.max(1,Math.min(10,this.state.explore.selectedNode||this.state.explore.cleared+1)),node=WHISPERWOOD_NODES[selected-1];
    return`<section class="explore-screen scene-panel">
      <div class="scene-shade forest"></div><div class="explore-content">
        <div class="section-heading light"><div><span class="eyebrow">REGION I</span><h1>Whisperwood</h1><p>Ancient roots are drinking the region's Aether.</p></div><span class="progress-seal">${this.state.explore.cleared}/10</span></div>
        <div class="map-path">${WHISPERWOOD_NODES.map((entry,i)=>{const unlocked=i<=this.state.explore.cleared,done=i<this.state.explore.cleared,active=selected===i+1;return`<button class="map-node ${entry.type.toLowerCase()} ${done?'done':''} ${active?'active':''}" data-action="select-node" data-node="${i+1}" ${unlocked?'':'disabled'}><span>${entry.type==="Boss"?'♛':entry.type==="Mini"?'🐺':i+1}</span><small>${entry.type}</small></button>`}).join("")}</div>
        <article class="node-detail glass-card"><div><span class="eyebrow">NODE ${selected} • ${node.type.toUpperCase()}</span><h2>${esc(node.title)}</h2><p>${node.type==="Boss"?"Defeat the Ancient and break its hold over Whisperwood.":node.type==="Mini"?"A three-enemy formation led by the Whisperwood Alpha.":"A full formation encounter with scalable rewards."}</p></div><button class="primary-button" data-action="start-node" data-node="${selected}">ENTER</button></article>
        <article class="farm-card"><span>⚙</span><div><b>Background Farm</b><small>Highest cleared node • 24H expedition cap</small></div><span class="status-dot on"></span></article>
      </div>
    </section>`;
  }

  renderDungeons(){return`<section class="dungeon-screen scene-panel"><div class="scene-shade tower"></div><div class="dungeon-content">
    <div class="section-heading light"><div><span class="eyebrow">DUNGEON HALL</span><h1>Trial Tower</h1><p>Climb until your formation breaks.</p></div><span class="progress-seal">F${this.state.tower.floor}</span></div>
    <article class="tower-card glass-card"><div class="tower-emblem">♜</div><div><span class="eyebrow">NEXT CHALLENGE</span><h2>Floor ${this.state.tower.floor}</h2><p>Best cleared: ${this.state.tower.best} • Enemy power rises each floor.</p></div><button class="primary-button" data-action="start-tower">ENTER FLOOR</button></article>
    <button class="toggle-card" data-action="toggle-tower-auto"><span><b>Auto Advance</b><small>Wait four seconds after victory, then enter the next floor.</small></span><i class="switch ${this.state.tower.autoAdvance?'on':''}"></i></button>
    <div class="mode-grid"><article class="mode-card"><span>🕳️</span><b>Aether Dungeon</b><small>Branching roguelike • planned next</small><i>COMING SOON</i></article><article class="mode-card"><span>🐉</span><b>Raids</b><small>World bosses • guild content</small><i>LOCKED</i></article></div>
  </div></section>`}

  renderSummon(){
    const gate=this.state.gates[this.selectedGate],rates=gateRates(this.state,this.selectedGate),sigil=this.selectedGate==="Heroes"?"Hero":this.selectedGate==="Weapons"?"Weapon":this.selectedGate==="Armor"?"Armor":"Accessory";
    return`<section class="screen-section summon-screen"><div class="aether-orbit"><div class="orbit-ring one"></div><div class="orbit-ring two"></div><div class="gate-core">✦</div></div>
      <div class="section-heading centered"><div><span class="eyebrow">AETHER GATE</span><h1>${this.selectedGate} Gate</h1><p>Gate Lv.${gate.level} • God pity ${gate.pity}/140</p></div></div>
      <div class="gate-tabs">${["Heroes","Weapons","Armor","Accessories"].map(name=>`<button class="${this.selectedGate===name?'active':''}" data-action="select-gate" data-gate="${name}">${name}</button>`).join("")}</div>
      <article class="rates-card"><div class="rate-list">${RARITIES.map((rarity,i)=>rates[i]?`<span class="${rarity}"><b>${rates[i]}%</b><small>${rarity}</small></span>`:"").join("")}</div><div class="gate-xp"><i style="width:${gate.level>=8?100:pct(gate.xp,20+gate.level*15)}%"></i></div><small>${gate.level>=8?'MAX GATE':`${gate.xp}/${20+gate.level*15} Gate XP`} • ${sigil} Sigils ×${this.state.sigils[sigil]||0}</small></article>
      <div class="summon-actions"><button data-action="gate-pull" data-count="1"><span>1 PULL</span><small>1 Sigil or 💎120</small></button><button class="gold" data-action="gate-pull" data-count="10"><span>10+1 PULL</span><small>10 Sigils or 💎1,000</small></button></div>
      <p class="summon-note">The bonus eleventh pull grants Gate XP. Each Gate levels independently.</p>
    </section>`;
  }

  renderBattle(){
    const battle=this.battle,actor=battle.actor(),background=battle.encounter.background,heroes=battle.units.filter(x=>x.team==="heroes"),enemies=battle.units.filter(x=>x.team==="enemies"),timeline=battle.previewTimeline();
    return`<section class="battle-screen battle-${background}"><div class="battle-shade"></div><div class="battle-ui">
      <div class="battle-top"><button class="battle-exit" data-action="leave-battle">✕</button><div><span class="eyebrow">${this.battleContext?.type==="tower"?"TRIAL TOWER":"WHISPERWOOD"}</span><b>${esc(battle.encounter.name)}</b></div><div class="speed-control">${[1,2,3].map(x=>`<button class="${battle.speed===x?'active':''}" data-action="battle-speed" data-speed="${x}">${x}×</button>`).join("")}</div></div>
      <div class="timeline">${timeline.map((unit,i)=>`<div class="timeline-unit ${i===0?'current':''} ${unit.team}"><span>${unit.icon}</span><small>${unit.spd}</small></div>`).join("")}</div>
      <div class="formation-zone enemy-zone"><div class="formation-grid">${formationCells(enemies,battle,this)}</div></div>
      <div class="battle-center"><div class="target-callout">${battle.preferredTargetId?`Preferred target: ${esc(battle.unit(battle.preferredTargetId)?.name||"")}`:"Tap any unit to override automatic targeting"}</div>${battle.log.length?`<div class="combat-log">${battle.log.slice(-3).map(entry=>`<span class="${entry.tone||''}">› ${esc(entry.text||entry)}</span>`).join("")}</div>`:""}</div>
      <div class="formation-zone hero-zone"><div class="formation-grid">${formationCells(heroes,battle,this)}</div></div>
      ${battle.over?this.renderBattleResult():actor?.team==="heroes"?this.renderPlayerCommands(actor):`<div class="enemy-thinking"><span></span>${actor?`${esc(actor.name)} is acting…`:"Resolving turn…"}</div>`}
    </div></section>`;
  }

  renderPlayerCommands(actor){
    const ready=this.battle.eligibleSkills(actor),next=ready[0],ultimate=this.battle.eligibleUltimate(actor),classData=CLASSES[actor.class];
    return`<div class="command-panel"><div class="actor-readout"><span>${actor.icon}</span><div><b>${esc(actor.name)}'s turn</b><small>${next?`${SKILLS[next.id].name} is ready`:`Basic Attack • no eligible skill`}</small></div><div class="resource-orb" style="--resource:${classData.color};--fill:${actor.resource}%"><b>${Math.floor(actor.resource)}</b><small>${actor.resourceName}</small></div></div>
      <div class="command-buttons"><button class="attack" data-action="battle-action" data-kind="attack"><span>⚔</span><b>ATTACK</b><small>${next?esc(SKILLS[next.id].name):"Basic"}</small></button><button data-action="battle-action" data-kind="defend"><span>🛡</span><b>DEFEND</b><small>Reduce next hit</small></button><button class="ultimate ${ultimate?'ready':''}" data-action="battle-action" data-kind="ultimate" ${ultimate?'':'disabled'}><span>✦</span><b>ULTIMATE</b><small>${ultimate?esc(ultimate.name):rarityIndex(actor.rarity)<4?'Mythic required':'Resource 100'}</small></button></div>
      <button class="auto-battle-toggle ${this.battleAuto?'on':''}" data-action="toggle-battle-auto">AUTO ${this.battleAuto?'ON':'OFF'}</button></div>`;
  }

  renderBattleResult(){
    const win=this.battle.winner==="heroes";return`<div class="battle-result ${win?'win':'loss'}"><span>${win?'✦':'☠'}</span><h2>${win?'VICTORY':'DEFEAT'}</h2><p>${win?'Formation intact. Rewards secured.':'Adjust your formation, gear, or skill priority and try again.'}</p><div class="result-actions">${win?`<button class="primary-button" data-action="finish-battle">${this.battleContext?.type==="tower"?'NEXT':'CONTINUE'}</button>`:""}<button data-action="leave-battle">LEAVE</button></div></div>`;
  }

  renderOverlay(overlay){
    let body="",title="";
    if(overlay.type==="settings"){title="Settings";body=this.settingsOverlay()}
    if(overlay.type==="formation"){title="Formation";body=this.formationOverlay()}
    if(overlay.type==="stats"){title=`${heroDefinition(this.state,this.selectedHero).name} • Stats`;body=this.statsOverlay()}
    if(overlay.type==="skills"){title=`${heroDefinition(this.state,this.selectedHero).name} • Skills`;body=this.skillsOverlay()}
    if(overlay.type==="skill-detail"){const skill=SKILLS[overlay.payload.skillId];title=skill?.name||"Skill";body=this.skillDetailOverlay(overlay.payload.skillId)}
    if(overlay.type==="equipment"){title=`${heroDefinition(this.state,this.selectedHero).name} • Equipment`;body=this.equipmentOverlay()}
    if(overlay.type==="gear-picker"){title=overlay.payload.slot;body=this.gearPickerOverlay(overlay.payload.slot)}
    if(overlay.type==="swap"){title="Swap Party Hero";body=this.swapOverlay()}
    if(overlay.type==="blacksmith"){title="Blacksmith";body=this.blacksmithOverlay()}
    if(overlay.type==="gear-detail"){const item=gearDefinition(overlay.payload.itemId);title=item?.name||"Equipment";body=this.gearDetailOverlay(overlay.payload.uid)}
    if(overlay.type==="tester"){title="Tester Tools";body=this.testerOverlay()}
    if(overlay.type==="summon-results"){title="Aether Gate Results";body=this.summonResultsOverlay(overlay.payload.results)}
    return`<div class="overlay-backdrop"></div><section class="overlay-card" role="dialog" aria-modal="true"><header><div><span class="eyebrow">ECHOES OF AETHER</span><h2>${esc(title)}</h2></div><button data-action="overlay-close" aria-label="Close">✕</button></header><div class="overlay-content">${body}</div></section>`;
  }

  settingsOverlay(){return`<div class="settings-list"><button data-action="toggle-motion"><span><b>Reduced Motion</b><small>Shorten battle and menu animations.</small></span><i class="switch ${this.state.settings.reduceMotion?'on':''}"></i></button><button data-action="toggle-hints"><span><b>Combat Hints</b><small>Show targeting and skill-resolution guidance.</small></span><i class="switch ${this.state.settings.combatHints?'on':''}"></i></button><button data-action="tester"><span><b>Tester Tools</b><small>Prototype shortcuts and combat checks.</small></span><i>›</i></button><button class="danger" data-action="reset-save"><span><b>Reset Save</b><small>Erase v0.8.0 progress on this device.</small></span><i>›</i></button></div>`}

  formationOverlay(){return`<p class="overlay-intro">Three lanes run top to bottom. Each lane has Front, Middle, and Back positions. Tap a hero, then an empty position.</p><div class="formation-editor"><div class="formation-labels"><span>FRONT</span><span>MIDDLE</span><span>BACK</span></div>${Array.from({length:9},(_,position)=>{const index=this.state.party.findIndex(x=>x.position===position),slot=this.state.party[index],base=slot&&heroDefinition(this.state,slot.hero);return`<button class="formation-slot ${index>=0?'occupied':''} ${this.formationHero===index?'selected':''}" data-action="formation-cell" data-position="${position}" data-party="${index}">${base?`<span>${base.icon}</span><b>${esc(base.name)}</b><small>${index===0?'MC':`Slot ${index+1}`}</small>`:`<span>＋</span><small>Empty</small>`}</button>`}).join("")}</div><div class="formation-tip"><b>Formation rules</b><p>Melee attacks cannot directly target a protected unit behind a living frontline ally in the same lane. Ranged, Magic, and Piercing skills can.</p></div>`}

  statsOverlay(){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero),stats=index>=0?heroStats(this.state,index):null,base=heroDefinition(this.state,this.selectedHero),owned=getHeroState(this.state,this.selectedHero);if(!stats)return`<div class="empty-state">Place ${esc(base.name)} in the active party to calculate combat stats.</div>`;const rows=[["ATK",stats.atk,"Attack power before skill scaling."],["DEF",stats.def,"Reduces incoming damage with diminishing returns."],["HP",stats.hp,"Maximum health in battle."],["SPD",stats.spd,"Controls the timeline and possible extra turns."],["Crit Rate",`${stats.critRate}%`,"Reduced by enemy Anti-Crit."],["Crit DMG",`${stats.critDamage}%`,"Reduced by enemy Crit Defense."],["Anti-Crit",stats.antiCrit,"Reduces incoming critical chance."],["Precision",stats.precision,"Counters Evasion; failed accuracy becomes a glancing hit."],["Evasion",stats.evasion,"Can turn incoming attacks into 50% glancing damage."],["Resistance",stats.resistance,"Reduces status buildup received."]];return`<div class="hero-overlay-banner ${owned.rarity}"><span>${base.icon}</span><div><b>${esc(base.name)}</b><small>${owned.rarity} • ${base.class} • Lv.${stats.level}</small></div></div><div class="stats-list">${rows.map(([name,value,desc])=>`<article><div><b>${name}</b><small>${desc}</small></div><strong>${typeof value==="number"?fmt(value):esc(value)}</strong></article>`).join("")}</div>`}

  skillsOverlay(){const base=heroDefinition(this.state,this.selectedHero),owned=getHeroState(this.state,this.selectedHero),loadout=this.state.skillLoadouts[this.selectedHero]||[],classResource=CLASSES[base.class];return`<div class="resource-explainer"><span style="--resource:${classResource.color}">${classResource.icon}</span><div><b>${classResource.resource}</b><small>${classResource.description}</small></div></div><p class="overlay-intro">Attack automatically uses the first eligible equipped skill. Long-hold and drag to change priority.</p><div class="skill-priority-list">${loadout.map((id,index)=>{const skill=SKILLS[id];return skill?`<button class="skill-priority-item" data-skill="${id}" data-index="${index}" data-action="skill-detail"><i>${index+1}</i><span>${skillGlyph(skill)}</span><div><b>${esc(skill.name)}</b><small>${skillSummary(skill)}</small></div><em>⋮⋮</em></button>`:""}).join("")}</div><div class="special-slots"><article><small>ULTIMATE</small><b>${rarityIndex(owned.rarity)>=4?esc(SKILLS[HEROES[this.selectedHero]?.ultimate]?.name||"Class Ultimate"):"Locked until Mythic"}</b></article><article><small>PASSIVE</small><b>${rarityIndex(owned.rarity)>=2?"Class passive active":"Unlocks at Rare"}</b></article><article><small>REACTION</small><b>${rarityIndex(owned.rarity)>=5?"Reaction slot ready":"Unlocks at Legendary"}</b></article></div>`}

  skillDetailOverlay(skillId){const skill=SKILLS[skillId];if(!skill)return"";return`<div class="skill-detail"><div class="skill-icon-large">${skillGlyph(skill)}</div><div class="skill-tags">${(skill.tags||[]).map(tag=>`<span>${esc(tag)}</span>`).join("")}</div><p>${skillDescription(skill)}</p><div class="skill-values">${skill.power?`<span><b>${Math.round(skill.power*100)}%</b><small>ATK Power</small></span>`:""}${skill.heal?`<span><b>${Math.round(skill.heal*100)}%</b><small>Max HP Heal</small></span>`:""}${skill.buildup?`<span><b>${skill.buildup}</b><small>${skill.status} Buildup</small></span>`:""}<span><b>${skill.cd||"—"}</b><small>Action Cooldown</small></span><span><b>${skill.resourceCost||0}</b><small>Resource Cost</small></span></div></div>`}

  equipmentOverlay(){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero);if(index<0)return`<div class="empty-state">Reserve heroes must join the party before equipping gear.</div>`;const party=this.state.party[index];return`<button class="auto-equip-button" data-action="auto-equip">✦ AUTO EQUIP BEST</button><div class="equipment-grid">${EQUIP_SLOTS.map(slot=>{const unlocked=this.state.plv>=(EQUIP_UNLOCK[slot]||1),copy=gearCopy(this.state,party.gear[slot]),item=copy&&gearDefinition(copy.itemId);return`<button class="equipment-slot ${unlocked?'':'locked'}" data-action="gear-picker" data-slot="${slot}" ${unlocked?'':'disabled'}><span>${item?.icon||slotIcon(slot)}</span><div><small>${slot}</small><b>${item?esc(item.name):unlocked?'Empty':`Unlock Lv.${EQUIP_UNLOCK[slot]}`}</b>${item?`<em>${item.rarity} • +${copy.level}</em>`:""}</div></button>`}).join("")}</div>`}

  gearPickerOverlay(slot){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero),base=heroDefinition(this.state,this.selectedHero),equipped=new Set(Object.values(this.state.party[index].gear));const items=this.state.inventory.filter(copy=>{const item=gearDefinition(copy.itemId);return item&&(slot.startsWith("Ring")?item.slot==="Ring":item.slot===slot)&&(item.class==="Any"||item.class===base.class)}).sort((a,b)=>rarityIndex(gearDefinition(b.itemId).rarity)-rarityIndex(gearDefinition(a.itemId).rarity));return`<div class="picker-list">${items.map(copy=>{const item=gearDefinition(copy.itemId);return`<button data-action="equip-item" data-slot="${slot}" data-uid="${copy.uid}" class="${equipped.has(copy.uid)?'equipped':''}"><span>${item.icon}</span><div><b>${esc(item.name)}</b><small>${item.rarity} • ATK ${item.atk||0} • DEF ${item.def||0}</small></div><i>${equipped.has(copy.uid)?"EQUIPPED":"EQUIP"}</i></button>`}).join("")||`<div class="empty-state">No compatible ${slot} items.</div>`}</div>`}

  swapOverlay(){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero),reserve=ownedHeroIds(this.state).filter(id=>!this.state.party.some(x=>x.hero===id));return`<p class="overlay-intro">Replace party slot ${index+1}. Equipment stays attached to the slot.</p><div class="picker-list">${reserve.map(id=>{const base=heroDefinition(this.state,id),owned=getHeroState(this.state,id);return`<button data-action="swap-confirm" data-hero="${id}"><span>${base.icon}</span><div><b>${esc(base.name)}</b><small>${owned.rarity} • ${base.class}</small></div><i>SWAP</i></button>`}).join("")||`<div class="empty-state">No reserve heroes available.</div>`}</div>`}

  blacksmithOverlay(){const grouped=[...this.state.inventory].sort((a,b)=>rarityIndex(gearDefinition(b.itemId)?.rarity)-rarityIndex(gearDefinition(a.itemId)?.rarity));return`<div class="blacksmith-summary"><span>⚒</span><div><b>Forge Inventory</b><small>${this.state.inventory.length}/300 items • ${fmt(this.state.dust)} Forge Dust</small></div></div><div class="inventory-grid">${grouped.map(copy=>{const item=gearDefinition(copy.itemId);return item?`<button class="inventory-item ${item.rarity}" data-action="gear-detail" data-uid="${copy.uid}" data-item="${item.id}"><span>${item.icon}</span><b>${esc(item.name)}</b><small>${item.rarity} • +${copy.level}</small></button>`:""}).join("")}</div>`}

  gearDetailOverlay(copyUid){const copy=gearCopy(this.state,copyUid),item=copy&&gearDefinition(copy.itemId);if(!item)return"";return`<div class="gear-detail"><div class="gear-art ${item.rarity}">${item.icon}</div><span class="rarity-label ${item.rarity}">${item.rarity}</span><h3>${esc(item.name)} +${copy.level}</h3><p>${item.slot} • ${item.class}</p><div class="gear-stats"><span><b>+${item.atk||0}</b><small>ATK</small></span><span><b>+${item.def||0}</b><small>DEF</small></span><span><b>+${item.spd||0}</b><small>SPD</small></span></div>${item.signature?`<div class="signature-effect"><b>Signature Effect</b><p>${esc(item.signature)}</p></div>`:""}<button class="primary-button full" data-action="enhance-gear" data-uid="${copy.uid}">ENHANCE • 🪙 ${500*copy.level}</button><button class="danger-button full" data-action="dismantle-gear" data-uid="${copy.uid}">DISMANTLE • +${5+rarityIndex(item.rarity)*3} DUST</button></div>`}

  testerOverlay(){return`<p class="overlay-intro">Prototype controls for testing the rebuilt systems.</p><div class="tester-grid"><button data-action="dev" data-kind="currency">+ Currencies</button><button data-action="dev" data-kind="level">Party Lv.30</button><button data-action="dev" data-kind="shrine">Max Gates</button><button data-action="dev" data-kind="heroes">Unlock Heroes</button><button data-action="test-battle">Combat Sandbox</button><button class="danger" data-action="reset-save">Reset Save</button></div>`}

  summonResultsOverlay(results){return`<div class="summon-results">${results.map((result,i)=>`<article class="${result.rarity}" style="--delay:${i*45}ms"><span>${result.icon}</span><b>${esc(result.name)}</b><small>${result.rarity}</small>${result.isNew?`<i>NEW</i>`:""}</article>`).join("")}</div><button class="primary-button full" data-action="overlay-close">DONE</button>`}

  onClick(event){
    const button=event.target.closest("[data-action]");if(!button)return;if(this.suppressSkillClick){event.preventDefault();return}
    const action=button.dataset.action;
    if(action==="nav"){this.view=button.dataset.view;this.overlays=[];this.render();return}
    if(action==="overlay-close"){this.popOverlay();return}
    if(action==="settings"){this.pushOverlay("settings");return}
    if(action==="go-explore"){this.view="explore";this.overlays=[];this.render();return}
    if(action==="claim-idle"){const reward=claimIdle(this.state);this.notify(`Claimed ${fmt(reward.gold)} gold and ${reward.gems} gems.`,"reward");return}
    if(action==="claim-mine"){const reward=claimMine(this.state);this.notify(`Claimed ${reward.gems} Aether gems.`,"reward");return}
    if(action==="select-hero"){this.selectedHero=button.dataset.hero;this.render();return}
    if(action==="hero-page"){this.pushOverlay(button.dataset.page);return}
    if(action==="formation"){this.formationHero=null;this.pushOverlay("formation");return}
    if(action==="formation-cell"){const party=Number(button.dataset.party),position=Number(button.dataset.position);if(party>=0){this.formationHero=party;this.render()}else if(Number.isFinite(this.formationHero)&&formationMove(this.state,this.formationHero,position)){this.formationHero=null;this.render()}return}
    if(action==="ascend"){if(ascendHero(this.state,this.selectedHero))this.notify(`${heroDefinition(this.state,this.selectedHero).name} ascended!`,"reward");else this.notify("Not enough shards to ascend.","warning");return}
    if(action==="swap"){this.pushOverlay("swap");return}
    if(action==="swap-confirm"){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero);if(swapPartyHero(this.state,index,button.dataset.hero)){this.selectedHero=button.dataset.hero;this.overlays=[];this.notify("Party slot updated.")}return}
    if(action==="skill-detail"){this.pushOverlay("skill-detail",{skillId:button.dataset.skill});return}
    if(action==="auto-equip"){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero);equipBest(this.state,index);this.notify("Best compatible equipment applied.","reward");return}
    if(action==="gear-picker"){this.pushOverlay("gear-picker",{slot:button.dataset.slot});return}
    if(action==="equip-item"){const index=this.state.party.findIndex(x=>x.hero===this.selectedHero);this.state.party[index].gear[button.dataset.slot]=button.dataset.uid;saveState(this.state);this.popOverlay();return}
    if(action==="blacksmith"){this.pushOverlay("blacksmith");return}
    if(action==="gear-detail"){this.pushOverlay("gear-detail",{uid:button.dataset.uid,itemId:button.dataset.item});return}
    if(action==="enhance-gear"){const copy=gearCopy(this.state,button.dataset.uid),cost=500*copy.level;if(this.state.gold>=cost){this.state.gold-=cost;copy.level++;saveState(this.state);this.render()}else this.notify("Not enough gold.","warning");return}
    if(action==="dismantle-gear"){this.dismantle(button.dataset.uid);return}
    if(action==="tester"){this.pushOverlay("tester");return}
    if(action==="dev"){devBoost(this.state,button.dataset.kind);this.render();return}
    if(action==="test-battle"){this.overlays=[];this.startBattle(encounterForNode(10),{type:"test",node:10});return}
    if(action==="toggle-motion"){this.state.settings.reduceMotion=!this.state.settings.reduceMotion;saveState(this.state);this.render();return}
    if(action==="toggle-hints"){this.state.settings.combatHints=!this.state.settings.combatHints;saveState(this.state);this.render();return}
    if(action==="reset-save"){if(confirm("Reset all Echoes of Aether progress on this device?")){this.state=resetState();this.overlays=[];this.view="home";this.render()}return}
    if(action==="select-node"){this.state.explore.selectedNode=Number(button.dataset.node);saveState(this.state);this.render();return}
    if(action==="start-node"){const node=Number(button.dataset.node);this.startBattle(encounterForNode(node),{type:"explore",node});return}
    if(action==="start-tower"){this.startBattle(encounterForNode(1,this.state.tower.floor),{type:"tower",floor:this.state.tower.floor});return}
    if(action==="toggle-tower-auto"){this.state.tower.autoAdvance=!this.state.tower.autoAdvance;saveState(this.state);this.render();return}
    if(action==="select-gate"){this.selectedGate=button.dataset.gate;this.render();return}
    if(action==="gate-pull"){const result=pullGate(this.state,this.selectedGate,Number(button.dataset.count));if(result.error)this.notify(result.error,"warning");else this.pushOverlay("summon-results",{results:result.results});return}
    if(action==="select-target"){this.battle?.setPreferredTarget(button.dataset.unit);this.render();return}
    if(action==="battle-action"){this.takeBattleAction(button.dataset.kind);return}
    if(action==="battle-speed"){this.battle.speed=Number(button.dataset.speed);this.state.settings.battleSpeed=this.battle.speed;saveState(this.state);this.render();return}
    if(action==="toggle-battle-auto"){this.battleAuto=!this.battleAuto;this.render();if(this.battleAuto)this.continueBattle();return}
    if(action==="leave-battle"){this.leaveBattle();return}
    if(action==="finish-battle"){this.finishBattle();return}
  }

  startBattle(encounter,context){clearTimeout(this.enemyTimer);clearTimeout(this.autoTimer);this.battle=new BattleController(this.state,encounter);this.battleContext=context;this.battleAuto=false;this.render();this.continueBattle()}
  takeBattleAction(kind){if(!this.battle?.isPlayerTurn())return;this.battle.playerAction(kind);this.render();this.continueBattle()}
  continueBattle(){
    clearTimeout(this.enemyTimer);clearTimeout(this.autoTimer);if(!this.battle)return;
    if(this.battle.over){this.render();if(this.battle.winner==="heroes"&&this.battleContext?.type==="tower"&&this.state.tower.autoAdvance)this.autoTimer=setTimeout(()=>this.finishBattle(),4000);return}
    const delay=this.state.settings.reduceMotion?70:Math.max(170,560/this.battle.speed);
    if(this.battle.actor()?.team==="enemies")this.enemyTimer=setTimeout(()=>{this.battle.enemyAction();this.render();this.continueBattle()},delay);
    else if(this.battleAuto)this.autoTimer=setTimeout(()=>{this.battle.playerAction("attack");this.render();this.continueBattle()},delay);
  }
  leaveBattle(){clearTimeout(this.enemyTimer);clearTimeout(this.autoTimer);this.battle=null;this.battleContext=null;this.battleAuto=false;this.render()}
  finishBattle(){
    if(!this.battle||this.battle.winner!=="heroes"){this.leaveBattle();return}
    const gear=giveBattleRewards(this.state,this.battle.encounter.reward||{}),context=this.battleContext;
    if(context?.type==="explore"){this.state.explore.cleared=Math.max(this.state.explore.cleared,context.node);this.state.explore.selectedNode=Math.min(10,context.node+1)}
    if(context?.type==="tower"){this.state.tower.best=Math.max(this.state.tower.best,context.floor);this.state.tower.floor=context.floor+1}
    saveState(this.state);this.battle=null;this.battleContext=null;this.battleAuto=false;
    if(gear)this.notify(`${gearDefinition(gear.itemId).name} dropped!`,"reward");else this.render();
    if(context?.type==="tower"&&this.state.tower.autoAdvance)this.autoTimer=setTimeout(()=>this.startBattle(encounterForNode(1,this.state.tower.floor),{type:"tower",floor:this.state.tower.floor}),80);
  }
  dismantle(copyUid){const equipped=this.state.party.some(slot=>Object.values(slot.gear).includes(copyUid));if(equipped){this.notify("Unequip this item before dismantling.","warning");return}const copy=gearCopy(this.state,copyUid),item=copy&&gearDefinition(copy.itemId);if(!item)return;this.state.inventory=this.state.inventory.filter(x=>x.uid!==copyUid);this.state.dust+=5+rarityIndex(item.rarity)*3;saveState(this.state);this.overlays.pop();this.render()}

  bindSkillReorder(){
    const items=[...this.root.querySelectorAll(".skill-priority-item")];if(!items.length)return;
    for(const item of items){let timer=null,dragging=false,target=item;const down=event=>{timer=setTimeout(()=>{dragging=true;item.classList.add("dragging");navigator.vibrate?.(20)},320);item.setPointerCapture?.(event.pointerId)};const move=event=>{if(!dragging)return;event.preventDefault();const under=document.elementFromPoint(event.clientX,event.clientY)?.closest(".skill-priority-item");if(under){target=under;items.forEach(x=>x.classList.toggle("drop-target",x===under))}};const up=event=>{clearTimeout(timer);if(dragging){event.preventDefault();const list=this.state.skillLoadouts[this.selectedHero],from=Number(item.dataset.index),to=Number(target.dataset.index);const [moved]=list.splice(from,1);list.splice(to,0,moved);saveState(this.state);this.suppressSkillClick=true;setTimeout(()=>this.suppressSkillClick=false,400);this.render()}item.classList.remove("dragging");items.forEach(x=>x.classList.remove("drop-target"));item.releasePointerCapture?.(event.pointerId)};item.addEventListener("pointerdown",down);item.addEventListener("pointermove",move);item.addEventListener("pointerup",up);item.addEventListener("pointercancel",()=>clearTimeout(timer))}
  }
}

function formationCells(units,battle,ui){return Array.from({length:9},(_,position)=>{const unit=units.find(x=>x.position===position);if(!unit)return`<div class="battle-cell"></div>`;const selected=battle.preferredTargetId===unit.unitId,statuses=unitStatusSummary(unit);return`<button class="battle-cell unit-token ${unit.team} ${selected?'selected':''} ${unit.hp<=0?'ko':''}" data-action="select-target" data-unit="${unit.unitId}" style="--hp:${pct(unit.hp,unit.maxHp)}%;--res:${pct(unit.resource||0,unit.maxResource||100)}%"><span class="unit-icon">${unit.icon}</span><b>${esc(unit.name)}</b><div class="mini-bar hp"><i></i></div>${unit.team==="heroes"?`<div class="mini-bar resource"><i></i></div>`:""}<small>${fmt(unit.hp)}/${fmt(unit.maxHp)}</small>${statuses.length?`<div class="unit-statuses">${statuses.slice(0,3).map(status=>`<i title="${status.name}">${statusIcon(status.name)}</i>`).join("")}</div>`:""}${unit.telegraphSkill?`<em class="telegraph">!</em>`:""}</button>`}).join("")}
function compact(value){if(value>=1e6)return`${(value/1e6).toFixed(1)}M`;if(value>=1e3)return`${(value/1e3).toFixed(value>=1e4?0:1)}K`;return fmt(value)}
function formatDuration(seconds){const hours=Math.floor(seconds/3600),minutes=Math.floor(seconds%3600/60);return hours?`${hours}h ${minutes}m`:`${minutes}m`}
function elementIcon(element){return({Light:"☀",Dark:"☾",Fire:"🔥",Water:"💧",Earth:"◆",Wind:"➶"}[element]||"✦")}
function slotIcon(slot){return({Weapon:"⚔️",Armor:"🛡️",Helmet:"⛑️",Gloves:"🧤",Legs:"🦿",Boots:"🥾","Ring 1":"💍","Ring 2":"💍",Amulet:"📿","Class Item":"🔷"}[slot]||"◇")}
function skillGlyph(skill){if(skill.heal)return"✚";if(skill.status)return statusIcon(skill.status);if(skill.tags?.includes("Guard"))return"🛡";if(skill.tags?.includes("Mana"))return"💠";if(skill.tags?.includes("Ranged"))return"➶";if(skill.tags?.includes("Magic"))return"✦";return"⚔"}
function skillSummary(skill){const pieces=[];if(skill.condition)pieces.push(skill.condition.replace(/([A-Z])/g," $1").toLowerCase());if(skill.power)pieces.push(`${Math.round(skill.power*100)}% ATK`);if(skill.heal)pieces.push(`${Math.round(skill.heal*100)}% heal`);if(skill.resourceCost)pieces.push(`${skill.resourceCost} resource`);pieces.push(`CD ${skill.cd||0}`);return pieces.join(" • ")}
function skillDescription(skill){const parts=[];if(skill.power)parts.push(`Deals ${Math.round(skill.power*100)}% ATK damage.`);if(skill.heal)parts.push(`Restores ${Math.round(skill.heal*100)}% of the target's Max HP.`);if(skill.status)parts.push(`Adds ${skill.buildup} ${skill.status} buildup.`);if(skill.effect==="guard")parts.push("Guards against the next incoming hit.");if(skill.effect==="restoreMana")parts.push("Restores 40 Mana when its condition is met.");if(skill.condition?.startsWith("allyBelow"))parts.push(`Only triggers when an ally is below ${skill.condition.replace("allyBelow","")}% HP.`);if(skill.condition==="enemyBelow35")parts.push("Only triggers below 35% enemy HP.");return parts.join(" ")||"A utility skill that activates when its requirements are met."}
