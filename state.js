import {
  SAVE_KEY,LEGACY_SAVE_KEY,HEROES,CLASSES,SKILLS,RARITIES,RARITY_MULTIPLIER,GEAR,EQUIP_SLOTS,
  EQUIP_UNLOCK,GATE_RATES,rarityIndex,heroSkillIds
} from "./data.js";

const storage=()=>typeof localStorage!=="undefined"?localStorage:null;
const now=()=>Date.now();
const uid=prefix=>`${prefix}_${Date.now()}_${Math.floor(Math.random()*1e6)}`;
const LEGACY_SKILL_MAP={w_power:"powerStrike",w_brace:"brace",r_feint:"feint",r_bleed:"bloodletting",ra_mark:"hunterMark",ra_pin:"pinningShot",ma_bolt:"manaBolt",ma_focus:"meditate",c_mend:"lesserMend",c_smite:"smite",orin_cut:"disciplinedCut",tess_mend:"mend",bram_crush:"shieldCrush",nyx_lac:"lacerate",lyra_lance:"astralLance",vexa_exec:"execution",kael_pierce:"heartseeker",aurel_mend:"worldrootGrace",morwen_stitch:"graveStitch",deus_flare:"sunflare",ga_cleave:"recklessCleave",se_sunder:"lionbreaker",si_cut:"silkenCut",ei_bleed:"blackVein",ro_pin:"foxtrapArrow",so_mark:"sunMark",ve_tide:"manaTide",ig_erupt:"eruption",el_mend:"gracefulMend",mal_debt:"mortalDebt"};

function partySlot(hero,position){
  return{hero,level:1,xp:0,position,equipLv:Object.fromEntries(EQUIP_SLOTS.map(x=>[x,1])),gear:{}};
}

export function createDefaultState(){
  const heroes={};
  for(const id of ["orin","tess","bram","nyx","lyra"])heroes[id]={rarity:HEROES[id].native,shards:0};
  const state={
    saveVersion:8,createdAt:now(),gold:30000,gems:14000,tickets:30,dust:0,skillDust:250,plv:1,pxp:0,
    claimedAt:now(),mineAt:now(),shrine:1,shrineXp:0,
    mc:{name:"Aren",class:"Warrior",rarity:"Common",shards:0},heroes,
    party:[partySlot("mc",3),partySlot("bram",0),partySlot("nyx",6),partySlot("orin",4),partySlot("lyra",7)],
    inventory:[
      {uid:"bronzeSword_starter",itemId:"bronzeSword",level:1,affixes:[]},
      {uid:"leatherJerkin_starter",itemId:"leatherJerkin",level:1,affixes:[]}
    ],
    gates:{Heroes:{level:1,xp:0,pity:0},Weapons:{level:1,xp:0,pity:0},Armor:{level:1,xp:0,pity:0},Accessories:{level:1,xp:0,pity:0}},
    sigils:{Hero:30,Weapon:30,Armor:30,Accessory:30},
    explore:{cleared:0,selectedNode:1},tower:{floor:1,best:0,autoAdvance:false},
    skillLoadouts:{},codex:{heroes:{mc:true},gear:{}},townLevels:{Aethergate:1,Blacksmith:1,"Aether Mine":1,"Guild Hall":1,"Dungeon Hall":1},
    settings:{battleSpeed:1,reduceMotion:false,combatHints:true},lastResults:[]
  };
  ensureState(state);
  return state;
}

function migrateInventory(old){
  const result=[];
  const idMap={bronze:"bronzeSword",leather:"leatherJerkin",iron:"ironLongsword",hunterglove:"hunterGloves",rune:"runeMail",aegis:"aegisCrown",sage:"sageSignet",heartstring:"heartstring",astral:"astralCodex",saint:"saintReliquary",godtear:"godTear",rageidol:"rageIdol",shadowcoin:"shadowCoin",hawkcharm:"hawkCharm",manaheart:"manaPrism"};
  for(const [oldId,copies] of Object.entries(old?.inventory||{})){
    const itemId=idMap[oldId]||oldId;
    if(!GEAR.some(x=>x.id===itemId))continue;
    for(const copy of copies||[])result.push({uid:copy.id||uid(itemId),itemId,level:1,affixes:copy.aff||[]});
  }
  return result;
}

export function migrateLegacy(old){
  const fresh=createDefaultState();
  if(!old||typeof old!=="object")return fresh;
  for(const key of ["gold","gems","tickets","dust","skillDust","plv","pxp","shrine"]){if(Number.isFinite(old[key]))fresh[key]=old[key]}
  fresh.claimedAt=Number.isFinite(old.claimed)?old.claimed:fresh.claimedAt;
  fresh.mineAt=Number.isFinite(old.mine?.last)?old.mine.last:fresh.mineAt;
  if(old.mc){fresh.mc.name=old.mc.name||fresh.mc.name;fresh.mc.class=old.mc.cls||old.mc.class||fresh.mc.class;fresh.mc.rarity=old.mc.rarity||fresh.mc.rarity;fresh.mc.shards=old.mc.shards||0}
  for(const [id,value] of Object.entries(old.heroes||{}))if(HEROES[id])fresh.heroes[id]={rarity:value.rarity||HEROES[id].native,shards:value.shards||0};
  if(Array.isArray(old.party)){
    const positions=Array.isArray(old.formations)?old.formations:[3,0,6,4,7];
    const next=[];
    for(let i=0;i<Math.min(5,old.party.length);i++){
      const prior=old.party[i],hero=prior.hero||prior.id;
      if(hero!=="mc"&&!HEROES[hero])continue;
      const slot=partySlot(hero,positions[i]??[3,0,6,4,7][i]);
      slot.level=prior.level||1;slot.xp=prior.xp||0;
      Object.assign(slot.equipLv,prior.equipLv||{});
      slot.gear={...(prior.gear||{})};
      next.push(slot);
    }
    if(next.length===5){const mcIndex=next.findIndex(x=>x.hero==="mc");if(mcIndex>0)[next[0],next[mcIndex]]=[next[mcIndex],next[0]];fresh.party=next}
  }
  const migrated=migrateInventory(old);if(migrated.length)fresh.inventory=migrated;
  if(old.gates)for(const key of Object.keys(fresh.gates))Object.assign(fresh.gates[key],old.gates[key]||{});
  if(old.sigils)Object.assign(fresh.sigils,old.sigils);
  fresh.explore.cleared=old.explore?.cleared||0;
  fresh.tower.floor=old.tower?.floor||1;fresh.tower.best=old.tower?.best||0;fresh.tower.autoAdvance=!!old.tower?.autoAdvance;
  fresh.skillLoadouts={...(old.skillLoadouts||{})};
  ensureState(fresh);
  return fresh;
}

export function ensureState(s){
  s.saveVersion=8;s.inventory=Array.isArray(s.inventory)?s.inventory:[];s.skillLoadouts=s.skillLoadouts||{};s.codex=s.codex||{heroes:{},gear:{}};s.codex.heroes=s.codex.heroes||{};s.codex.gear=s.codex.gear||{};
  s.settings={battleSpeed:1,reduceMotion:false,combatHints:true,...(s.settings||{})};s.lastResults=s.lastResults||[];
  s.party=(s.party||[]).slice(0,5);
  for(let i=0;i<s.party.length;i++){
    const slot=s.party[i];slot.position=Number.isFinite(slot.position)?slot.position:[3,0,6,4,7][i];slot.equipLv={...Object.fromEntries(EQUIP_SLOTS.map(x=>[x,1])),...(slot.equipLv||{})};slot.gear=slot.gear||{};
    const hero=getHeroState(s,slot.hero),base=heroDefinition(s,slot.hero),max=rarityIndex(hero.rarity)>=7?4:rarityIndex(hero.rarity)>=3?3:2;
    const valid=[...(s.skillLoadouts[slot.hero]?.active||s.skillLoadouts[slot.hero]||[])].map(x=>typeof x==="string"?x:x?.id).map(x=>LEGACY_SKILL_MAP[x]||x).filter(x=>x&&SKILLS[x]);
    for(const id of heroSkillIds(slot.hero,base.class,hero.rarity))if(valid.length<max&&!valid.includes(id))valid.push(id);
    s.skillLoadouts[slot.hero]=valid.slice(0,max);
    s.codex.heroes[slot.hero]=true;
  }
  for(const copy of s.inventory){if(!copy.uid)copy.uid=uid(copy.itemId||"gear");copy.level=copy.level||1;copy.affixes=copy.affixes||[];if(copy.itemId)s.codex.gear[copy.itemId]=true}
  return s;
}

export function loadState(){
  const db=storage();if(!db)return createDefaultState();
  try{
    const current=JSON.parse(db.getItem(SAVE_KEY)||"null");if(current)return ensureState(current);
    const legacy=JSON.parse(db.getItem(LEGACY_SAVE_KEY)||"null");const state=legacy?migrateLegacy(legacy):createDefaultState();saveState(state);return state;
  }catch(error){console.warn("Save recovery",error);return createDefaultState()}
}

export function saveState(state){try{storage()?.setItem(SAVE_KEY,JSON.stringify(ensureState(state)))}catch(error){console.warn("Save failed",error)}}
export function resetState(){storage()?.removeItem(SAVE_KEY);return createDefaultState()}

export function heroDefinition(state,id){
  if(id!=="mc")return HEROES[id];
  const cls=state.mc.class||"Warrior",base=HEROES.mc;
  return{...base,name:state.mc.name||"Aren",class:cls,hp:cls==="Warrior"?980:cls==="Cleric"?880:780,atk:cls==="Mage"?146:cls==="Rogue"?138:124,def:cls==="Warrior"?108:72,spd:cls==="Rogue"?142:cls==="Ranger"?122:100,unique:base.unique};
}
export function getHeroState(state,id){return id==="mc"?state.mc:(state.heroes[id]||{rarity:HEROES[id]?.native||"Common",shards:0})}
export function ownedHeroIds(state){return["mc",...Object.keys(state.heroes).filter(id=>HEROES[id])].sort((a,b)=>rarityIndex(getHeroState(state,b).rarity)-rarityIndex(getHeroState(state,a).rarity))}

export function gearDefinition(itemId){return GEAR.find(x=>x.id===itemId)}
export function gearCopy(state,copyUid){return state.inventory.find(x=>x.uid===copyUid)}
export function slotAccepts(slot,item){if(!item)return false;if(slot.startsWith("Ring"))return item.slot==="Ring";return item.slot===slot}

export function heroStats(state,partyIndex){
  const slot=state.party[partyIndex],base=heroDefinition(state,slot.hero),owned=getHeroState(state,slot.hero),rarity=owned.rarity||base.native,mult=RARITY_MULTIPLIER[rarity]||1,level=slot.level||1,levelMult=1+(level-1)*.035;
  let hp=Math.floor(base.hp*mult*levelMult),atk=Math.floor(base.atk*mult*levelMult),def=Math.floor(base.def*mult*levelMult),spd=Math.floor(base.spd*(1+(level-1)*.006));
  for(const [equipSlot,copyUid] of Object.entries(slot.gear||{})){
    const copy=gearCopy(state,copyUid),item=copy&&gearDefinition(copy.itemId);if(!item)continue;
    const itemScale=(1+(copy.level-1)*.06)*(1+((slot.equipLv[equipSlot]||1)-1)*.025);
    atk+=Math.floor((item.atk||0)*itemScale);def+=Math.floor((item.def||0)*itemScale);spd+=Math.floor(item.spd||0);
  }
  const r=rarityIndex(rarity);
  return{id:slot.hero,name:base.name,icon:base.icon,class:base.class,element:base.element,rarity,level,hp,atk,def,spd,critRate:8+r*2,critDamage:150+r*5,antiCrit:4+r,critDefense:5+r*2,precision:100+r*5,evasion:92+r*3,resistance:25+r*5,position:slot.position};
}

export function xpNeed(level){return 100+level*55}
export function gainHeroXp(state,index,amount){const slot=state.party[index];slot.xp+=amount;while(slot.xp>=xpNeed(slot.level)){slot.xp-=xpNeed(slot.level);slot.level++}}
export function gainAccountXp(state,amount){state.pxp+=amount;while(state.pxp>=xpNeed(state.plv)){state.pxp-=xpNeed(state.plv);state.plv++}}

export function idlePreview(state){const seconds=Math.min(86400,Math.max(0,(now()-state.claimedAt)/1000)),battles=Math.floor(seconds/11);return{seconds,battles,gold:Math.floor(seconds*(12+(state.explore.cleared||1)*2)),gems:Math.floor(battles/55)}}
export function claimIdle(state){const reward=idlePreview(state);state.gold+=reward.gold;state.gems+=reward.gems;state.claimedAt=now();state.party.forEach((_,i)=>gainHeroXp(state,i,Math.floor(reward.battles/6)));gainAccountXp(state,Math.floor(reward.battles/8));saveState(state);return reward}
export function minePreview(state){const seconds=Math.min(86400,Math.max(0,(now()-state.mineAt)/1000)),rate=1+(state.townLevels?.["Aether Mine"]||1)*.35;return{seconds,gems:Math.floor(seconds/60*rate)}}
export function claimMine(state){const reward=minePreview(state);state.gems+=reward.gems;state.mineAt=now();saveState(state);return reward}

export function addGear(state,itemId){const item=gearDefinition(itemId);if(!item)return null;const copy={uid:uid(itemId),itemId,level:1,affixes:rarityIndex(item.rarity)>=3?[{name:"ATK%",value:3+rarityIndex(item.rarity)}]:[]};state.inventory.push(copy);state.codex.gear[itemId]=true;return copy}
export function equipBest(state,index){
  const slot=state.party[index],hero=heroDefinition(state,slot.hero),used=new Set();
  for(const equipSlot of EQUIP_SLOTS){if(state.plv<(EQUIP_UNLOCK[equipSlot]||1))continue;const candidates=state.inventory.filter(copy=>{const item=gearDefinition(copy.itemId);return slotAccepts(equipSlot,item)&&(item.class==="Any"||item.class===hero.class)&&!used.has(copy.uid)}).sort((a,b)=>gearScore(b)-gearScore(a));if(candidates[0]){slot.gear[equipSlot]=candidates[0].uid;used.add(candidates[0].uid)}}
  saveState(state);
}
function gearScore(copy){const item=gearDefinition(copy.itemId);return((item?.atk||0)*1.25+(item?.def||0)+(item?.spd||0)*2)*(1+(copy.level-1)*.06)}

export function ascendHero(state,id){const hero=getHeroState(state,id),idx=rarityIndex(hero.rarity);if(idx>=7)return false;const cost=20+idx*15;if((hero.shards||0)<cost)return false;hero.shards-=cost;hero.rarity=RARITIES[idx+1];ensureState(state);saveState(state);return true}

export function gateRates(state,gate){return GATE_RATES[Math.min(7,Math.max(0,(state.gates[gate]?.level||1)-1))]}
export function pullGate(state,gate,count){
  const multi=count===10,pulls=multi?11:count,sigilName=gate==="Heroes"?"Hero":gate==="Weapons"?"Weapon":gate==="Armor"?"Armor":"Accessory",sigilCost=count;
  if((state.sigils[sigilName]||0)>=sigilCost)state.sigils[sigilName]-=sigilCost;else{const gems=multi?1000:120;if(state.gems<gems)return{error:"Not enough gems."};state.gems-=gems}
  const results=[];for(let i=0;i<pulls;i++)results.push(gate==="Heroes"?pullHero(state,gate):pullGear(state,gate));
  addGateXp(state,gate,pulls);state.lastResults=results;saveState(state);return{results};
}
function rollRarity(state,gate){const g=state.gates[gate],rates=[...gateRates(state,gate)];if(g.pity>=140){g.pity=0;return"God"}let soft=Math.min(6,Math.max(0,g.pity-70)*.08);rates[7]+=soft;for(let i=0;i<7&&soft>0;i++){const take=Math.min(rates[i],soft);rates[i]-=take;soft-=take}let p=Math.random()*100,total=0;for(let i=0;i<rates.length;i++){total+=rates[i];if(p<total){g.pity=i===7?0:g.pity+1;return RARITIES[i]}}g.pity++;return"World"}
function pullHero(state,gate){const rarity=rollRarity(state,gate);let pool=Object.entries(HEROES).filter(([id,h])=>id!=="mc"&&h.native===rarity);if(!pool.length)pool=Object.entries(HEROES).filter(([id])=>id!=="mc");const [id,hero]=pool[Math.floor(Math.random()*pool.length)],isNew=!state.heroes[id];if(isNew){state.heroes[id]={rarity:hero.native,shards:0};state.codex.heroes[id]=true}else state.heroes[id].shards+=10+rarityIndex(hero.native)*4;return{type:"hero",id,name:hero.name,icon:hero.icon,rarity:hero.native,isNew}}
function pullGear(state,gate){const rarity=rollRarity(state,gate),slots=gate==="Weapons"?["Weapon"]:gate==="Armor"?["Armor","Helmet","Gloves","Legs","Boots"]:["Ring","Amulet","Class Item"];let pool=GEAR.filter(x=>x.rarity===rarity&&slots.includes(x.slot));if(!pool.length)pool=GEAR.filter(x=>slots.includes(x.slot));const item=pool[Math.floor(Math.random()*pool.length)],copy=addGear(state,item.id);return{type:"gear",id:item.id,copyUid:copy.uid,name:item.name,icon:item.icon,rarity:item.rarity}}
function addGateXp(state,gate,pulls){const g=state.gates[gate];g.xp+=pulls;while(g.level<8&&g.xp>=20+g.level*15){g.xp-=20+g.level*15;g.level++}}

export function giveBattleRewards(state,reward){state.gold+=reward.gold||0;state.gems+=reward.gems||0;let gear=null;if(reward.fixedGear)gear=addGear(state,reward.fixedGear);else if(Math.random()<.32){const pool=GEAR.filter(x=>rarityIndex(x.rarity)<=Math.min(4,Math.floor((state.explore.cleared||1)/2)+1));if(pool.length)gear=addGear(state,pool[Math.floor(Math.random()*pool.length)].id)}state.party.forEach((_,i)=>gainHeroXp(state,i,35));gainAccountXp(state,20);saveState(state);return gear}

export function formationMove(state,partyIndex,position){if(position<0||position>8||state.party.some((x,i)=>i!==partyIndex&&x.position===position))return false;state.party[partyIndex].position=position;saveState(state);return true}
export function swapPartyHero(state,partyIndex,heroId){if(partyIndex===0||heroId==="mc"||state.party.some(x=>x.hero===heroId))return false;state.party[partyIndex].hero=heroId;ensureState(state);saveState(state);return true}

export function devBoost(state,kind){if(kind==="currency"){state.gold+=100000;state.gems+=50000;state.skillDust+=1000}else if(kind==="level"){state.plv=30;state.party.forEach(x=>x.level=30)}else if(kind==="shrine"){state.shrine=8;for(const gate of Object.values(state.gates))gate.level=8}else if(kind==="heroes"){for(const [id,h] of Object.entries(HEROES))if(id!=="mc")state.heroes[id]=state.heroes[id]||{rarity:h.native,shards:1000}}saveState(state)}
