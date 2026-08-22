import {CLASSES,ENEMIES,ENEMY_SKILLS,HEROES,SKILLS,rarityIndex} from "./data.js";
import {heroStats,heroDefinition,getHeroState} from "./state.js";

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const rowOf=position=>Math.floor(position/3);
const colOf=position=>position%3;
const alive=unit=>unit.hp>0;

function defenseReduction(defense,level=1){const k=260+level*18;return clamp(defense/(defense+k),0,.82)}
function critChance(attacker,target){return clamp(((attacker.critRate||8)-(target.antiCrit||5))/100,.02,.85)}
function critMultiplier(attacker,target){return 1+clamp(((attacker.critDamage||150)-(target.critDefense||5))/100,.25,2.25)}
function glanceChance(attacker,target){return clamp((((target.evasion||90)+(target.effects?.evasion?15:0))-(attacker.precision||100))*.006,0,.45)}

function makeHeroUnit(state,partyIndex){
  const stats=heroStats(state,partyIndex),classData=CLASSES[stats.class];
  const classUltimate={Warrior:"vanguardPride",Rogue:"nightfall",Ranger:"heliosArrow",Mage:"starfall",Cleric:"benediction"};
  return{...stats,unitId:`hero-${partyIndex}`,partyIndex,team:"heroes",maxHp:stats.hp,hp:stats.hp,gauge:Math.random()*80,
    resourceName:classData.resource,resource:classData.start,maxResource:100,cooldowns:{},guard:0,shield:0,buildup:{},effects:{},status:{},
    block:stats.class==="Warrior"?18:6,skillIds:[...(state.skillLoadouts[stats.id]||[])],ultimateId:HEROES[stats.id]?.ultimate||classUltimate[stats.class]
  };
}

function makeEnemyUnit(entry,index){
  const base=ENEMIES[entry.enemyId],scale=entry.scale||1;
  return{...base,id:entry.enemyId,unitId:`enemy-${index}`,team:"enemies",position:entry.position,maxHp:Math.floor(base.hp*scale),hp:Math.floor(base.hp*scale),
    atk:Math.floor(base.atk*scale),def:Math.floor(base.def*scale),spd:Math.floor(base.spd*(.96+scale*.04)),level:Math.max(1,Math.round((scale-1)/.11)+1),
    precision:98,evasion:88,critRate:7,critDamage:145,antiCrit:7,critDefense:8,resistance:25,block:base.boss?12:4,gauge:Math.random()*80,
    cooldowns:{},guard:0,shield:0,buildup:{},effects:{},status:{},skillIds:[...(base.skills||[])],phaseIndex:0,telegraphSkill:null
  };
}

export class BattleController{
  constructor(gameState,encounter){
    this.gameState=gameState;this.encounter=encounter;this.units=[...gameState.party.map((_,i)=>makeHeroUnit(gameState,i)),...encounter.enemies.map(makeEnemyUnit)];
    this.currentActorId=null;this.preferredTargetId=null;this.log=[`Entered ${encounter.name}.`];this.events=[];this.over=false;this.winner=null;this.turn=0;this.speed=gameState.settings?.battleSpeed||1;
    this.advance();
  }

  living(team){return this.units.filter(unit=>unit.team===team&&alive(unit))}
  unit(id){return this.units.find(unit=>unit.unitId===id)}
  actor(){return this.unit(this.currentActorId)}
  isPlayerTurn(){return this.actor()?.team==="heroes"&&!this.over}
  setPreferredTarget(id){const target=this.unit(id);if(target&&alive(target))this.preferredTargetId=id;return this.preferredTargetId}
  clearEvents(){this.events=[]}
  pushLog(text,tone="normal"){this.log.push({text,tone,turn:this.turn});if(this.log.length>12)this.log.shift()}

  advance(){
    if(this.over)return null;
    if(!this.living("heroes").length){this.finish("enemies");return null}
    if(!this.living("enemies").length){this.finish("heroes");return null}
    const candidates=this.units.filter(alive);let best=null,bestTime=Infinity;
    for(const unit of candidates){const time=(1000-unit.gauge)/Math.max(1,unit.spd);if(time<bestTime){bestTime=time;best=unit}}
    for(const unit of candidates)unit.gauge+=unit.spd*bestTime;
    best.gauge-=1000;this.currentActorId=best.unitId;this.turn++;
    this.applyTurnDamage(best);
    if(!alive(best))return this.advance();
    if(best.effects.staggered){best.effects.staggered--;this.pushLog(`${best.name} is staggered and loses the turn.`,"status");return this.advance()}
    return best;
  }

  applyTurnDamage(unit){
    if(unit.status.poison){const damage=Math.max(1,Math.floor(unit.maxHp*.008*unit.status.poison));this.dealPureDamage(unit,damage,"Poison");}
    if(unit.status.burn){const damage=Math.max(1,Math.floor(unit.maxHp*.025));this.dealPureDamage(unit,damage,"Burn");unit.status.burn--;}
    for(const key of Object.keys(unit.effects))if(typeof unit.effects[key]==="number"&&unit.effects[key]>0&&!["staggered"].includes(key)){unit.effects[key]--;if(unit.effects[key]<=0)delete unit.effects[key]}
  }

  dealPureDamage(target,amount,label){target.hp=Math.max(0,target.hp-amount);this.pushLog(`${label} deals ${amount} to ${target.name}.`,"status");this.events.push({type:"damage",target:target.unitId,amount,label})}

  previewTimeline(count=8){
    const clones=this.units.filter(alive).map(unit=>({id:unit.unitId,gauge:unit.gauge,spd:unit.spd})),result=[];
    if(this.actor())result.push(this.actor().unitId);
    while(result.length<count&&clones.length){let best=null,bestTime=Infinity;for(const unit of clones){const time=(1000-unit.gauge)/Math.max(1,unit.spd);if(time<bestTime){bestTime=time;best=unit}}for(const unit of clones)unit.gauge+=unit.spd*bestTime;best.gauge-=1000;result.push(best.id)}
    return result.map(id=>this.unit(id)).filter(Boolean);
  }

  skillDefinition(id,team){return team==="heroes"?SKILLS[id]:ENEMY_SKILLS[id]}
  lowestAlly(actor,includeKo=false){const pool=this.units.filter(unit=>unit.team===actor.team&&(includeKo?!alive(unit):alive(unit)));return pool.sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0]||null}
  hasResource(actor,skill){const cost=skill.resourceCost||0;return actor.resource>=cost}

  conditionMet(actor,skill){
    if(!skill||!this.hasResource(actor,skill))return false;
    const lowest=this.lowestAlly(actor),allyPct=lowest?lowest.hp/lowest.maxHp:1,enemy=this.living(actor.team==="heroes"?"enemies":"heroes").sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(skill.condition==="allyBelow85")return allyPct<.85;
    if(skill.condition==="allyBelow75")return allyPct<.75;
    if(skill.condition==="allyBelow70")return allyPct<.70;
    if(skill.condition==="allyBelow65")return allyPct<.65;
    if(skill.condition==="allyBelow30")return allyPct<.30;
    if(skill.condition==="enemyBelow35")return enemy&&enemy.hp/enemy.maxHp<.35;
    if(skill.condition==="manaBelow25")return actor.resource<25;
    if(skill.condition==="manaBelow30")return actor.resource<30;
    if(skill.target==="koAlly")return this.units.some(unit=>unit.team===actor.team&&!alive(unit));
    return true;
  }

  eligibleSkills(actor){return actor.skillIds.map(id=>({id,skill:this.skillDefinition(id,actor.team)})).filter(x=>x.skill&&(actor.cooldowns[x.id]||0)<=0&&this.conditionMet(actor,x.skill))}
  eligibleUltimate(actor){const skill=actor.ultimateId&&SKILLS[actor.ultimateId];return actor.team==="heroes"&&rarityIndex(actor.rarity)>=4&&skill&&actor.resource>=100?skill:null}

  isProtected(target,skill){
    if(!target||!skill||["Ranged","Magic","Piercing"].some(tag=>(skill.tags||[]).includes(tag)))return false;
    if(colOf(target.position)===0)return false;
    return this.units.some(unit=>unit.team===target.team&&alive(unit)&&rowOf(unit.position)===rowOf(target.position)&&colOf(unit.position)<colOf(target.position));
  }

  primaryTarget(actor,skill){
    const allyTarget=["lowestAlly","allAllies","koAlly","self"].includes(skill.target),desiredTeam=allyTarget?actor.team:(actor.team==="heroes"?"enemies":"heroes");
    let preferred=this.unit(this.preferredTargetId);
    if(preferred&&preferred.team===desiredTeam&&(alive(preferred)||skill.target==="koAlly")&&!this.isProtected(preferred,skill))return preferred;
    if(skill.target==="self")return actor;
    if(skill.target==="lowestAlly")return this.lowestAlly(actor);
    if(skill.target==="koAlly")return this.lowestAlly(actor,true);
    const pool=this.units.filter(unit=>unit.team===desiredTeam&&alive(unit)),valid=pool.filter(unit=>!this.isProtected(unit,skill));
    const choices=valid.length?valid:pool;
    if((skill.tags||[]).includes("Execute"))return choices.sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp)[0];
    if(skill.effect==="weakPoint")return choices.sort((a,b)=>b.maxHp-a.maxHp)[0];
    return choices.sort((a,b)=>colOf(a.position)-colOf(b.position)||a.hp-b.hp)[0]||null;
  }

  targetsFor(actor,skill){
    const primary=this.primaryTarget(actor,skill);if(!primary)return[];
    const team=primary.team,pool=this.units.filter(unit=>unit.team===team&&(skill.target==="koAlly"?!alive(unit):alive(unit)));
    if(["allEnemies","allHeroes","allAllies"].includes(skill.target))return pool;
    if(["enemyRow","heroRow"].includes(skill.target))return pool.filter(unit=>rowOf(unit.position)===rowOf(primary.position));
    if(["enemyColumn","heroColumn"].includes(skill.target))return pool.filter(unit=>colOf(unit.position)===colOf(primary.position));
    return[primary];
  }

  playerAction(kind){
    const actor=this.actor();if(!actor||actor.team!=="heroes"||this.over)return null;
    if(kind==="defend")return this.execute(actor,{name:"Defend",target:"self",effect:"guard",tags:["Guard"]},"defend");
    if(kind==="ultimate"){
      const skill=this.eligibleUltimate(actor);if(!skill)return null;actor.resource=0;return this.execute(actor,skill,actor.ultimateId);
    }
    const chosen=this.eligibleSkills(actor)[0];
    if(chosen)return this.execute(actor,chosen.skill,chosen.id);
    const baseSkill={name:"Basic Attack",power:1,target:"enemy",tags:actor.class==="Ranger"?["Ranged"]:actor.class==="Mage"?["Magic"]:["Melee"],basic:true};
    return this.execute(actor,baseSkill,"basic");
  }

  enemyAction(){
    const actor=this.actor();if(!actor||actor.team!=="enemies"||this.over)return null;
    if(actor.telegraphSkill){const id=actor.telegraphSkill,skill=ENEMY_SKILLS[id];actor.telegraphSkill=null;return this.execute(actor,skill,id)}
    const ready=actor.skillIds.map(id=>({id,skill:ENEMY_SKILLS[id]})).filter(x=>x.skill&&(actor.cooldowns[x.id]||0)<=0);
    const chosen=ready[0];
    if(chosen?.skill.telegraph){actor.telegraphSkill=chosen.id;actor.cooldowns[chosen.id]=chosen.skill.cd||0;this.pushLog(`${actor.name} prepares ${chosen.skill.name}!`,"warning");this.events.push({type:"telegraph",actor:actor.unitId,name:chosen.skill.name});this.endAction(actor,chosen.id);return{actor,skill:chosen.skill,telegraph:true}}
    const skill=chosen?.skill||{name:"Attack",power:1,target:"hero",tags:["Melee"],basic:true};return this.execute(actor,skill,chosen?.id||"basic");
  }

  execute(actor,skill,skillId){
    this.clearEvents();const targets=this.targetsFor(actor,skill);if(!targets.length)return null;
    if(skill.resourceCost)actor.resource=Math.max(0,actor.resource-skill.resourceCost);
    if(skill.basic){const gain=CLASSES[actor.class]?.basicGain||18;actor.resource=Math.min(actor.maxResource,actor.resource+gain)}
    if(skill.resourceGain)actor.resource=Math.min(actor.maxResource,actor.resource+skill.resourceGain);
    const result={actor,skill,skillId,targets:[]};
    for(const target of targets){
      if(skill.revive){target.hp=Math.max(1,Math.floor(target.maxHp*skill.revive));result.targets.push({target,revive:true});this.events.push({type:"revive",target:target.unitId});continue}
      if(skill.heal){const amount=Math.max(1,Math.floor(target.maxHp*skill.heal));const actual=Math.min(amount,target.maxHp-target.hp);target.hp+=actual;if(actor.class==="Cleric")actor.resource=Math.min(100,actor.resource+10);result.targets.push({target,heal:actual});this.events.push({type:"heal",target:target.unitId,amount:actual});continue}
      if(skill.power){const hit=this.damage(actor,target,skill);result.targets.push({target,...hit});}
      this.applyEffect(actor,target,skill);
      if(skill.status&&alive(target))this.addBuildup(target,skill.status,skill.buildup||0,actor);
    }
    const description=this.describeAction(actor,skill,result);this.pushLog(description,skill.kind==="ultimate"?"ultimate":"normal");
    if(skillId!=="basic"&&skillId!=="defend"&&skill.cd)actor.cooldowns[skillId]=skill.cd;
    this.checkBossPhases();this.endAction(actor,skillId);return result;
  }

  damage(actor,target,skill){
    let raw=Math.max(1,actor.atk*(1-defenseReduction(target.def,actor.level||1))),glance=Math.random()<glanceChance(actor,target),crit=Math.random()<critChance(actor,target),mult=skill.power||1;
    if(target.effects.weakPoint)mult*=1.12;if(skill.bonusVsWeak&&target.effects.weakPoint)mult*=skill.bonusVsWeak;if(target.effects.vulnerable)mult*=1.12;if(actor.effects.enraged)mult*=1.2;
    let amount=Math.max(1,Math.floor(raw*mult*(crit?critMultiplier(actor,target):1)*(glance?.5:1)));
    let blocked=false;if(target.guard){amount=Math.floor(amount*.5);target.guard=0;blocked=true}else if(Math.random()*100<(target.block||0)&&colOf(target.position)===0){amount=Math.floor(amount*.62);blocked=true}
    if(target.shield){const absorbed=Math.min(target.shield,amount);target.shield-=absorbed;amount-=absorbed}
    target.hp=Math.max(0,target.hp-amount);if(target.team==="heroes"&&target.class==="Warrior")target.resource=Math.min(100,target.resource+12);
    this.events.push({type:"damage",actor:actor.unitId,target:target.unitId,amount,crit,glance,blocked});return{damage:amount,crit,glance,blocked};
  }

  applyEffect(actor,target,skill){
    if(skill.effect==="guard")target.guard=1;
    if(skill.effect==="teamGuard")for(const ally of this.living(actor.team))ally.guard=1;
    if(skill.effect==="evasion")actor.effects.evasion=2;
    if(skill.effect==="weakPoint")target.effects.weakPoint=2;
    if(skill.effect==="vulnerable")target.effects.vulnerable=2;
    if(skill.effect==="restoreMana")actor.resource=Math.min(100,actor.resource+40);
    if(skill.effect==="enrage")actor.effects.enraged=3;
  }

  addBuildup(target,status,amount,source){
    const resisted=Math.max(1,Math.floor(amount*(1-clamp((target.resistance||0)/200,0,.5))));target.buildup[status]=(target.buildup[status]||0)+resisted;
    const threshold=status==="Poison"?110:status==="Stagger"?120:100;
    this.events.push({type:"buildup",target:target.unitId,status,amount:resisted,total:target.buildup[status],threshold});
    if(target.buildup[status]<threshold)return;
    target.buildup[status]-=threshold;
    if(status==="Bleed")this.dealPureDamage(target,Math.max(1,Math.floor(target.maxHp*.04)),"Hemorrhage");
    if(status==="Burn")target.status.burn=Math.max(target.status.burn||0,2);
    if(status==="Poison")target.status.poison=Math.min(3,(target.status.poison||0)+1);
    if(status==="Stagger"){target.effects.staggered=1;target.gauge-=300}
    this.pushLog(`${target.name} suffers ${status}!`,"status");
  }

  describeAction(actor,skill,result){
    const heals=result.targets.reduce((sum,x)=>sum+(x.heal||0),0),damage=result.targets.reduce((sum,x)=>sum+(x.damage||0),0),revives=result.targets.filter(x=>x.revive).length;
    if(revives)return`${actor.name} uses ${skill.name} and revives an ally!`;
    if(heals)return`${actor.name} uses ${skill.name}, restoring ${heals} HP.`;
    if(damage)return`${actor.name} uses ${skill.name} for ${damage} damage.`;
    return`${actor.name} uses ${skill.name}.`;
  }

  endAction(actor,usedSkillId){
    for(const id of Object.keys(actor.cooldowns))if(id!==usedSkillId&&actor.cooldowns[id]>0)actor.cooldowns[id]--;
    if(!this.living("heroes").length)this.finish("enemies");else if(!this.living("enemies").length)this.finish("heroes");else this.advance();
  }

  checkBossPhases(){
    for(const boss of this.units.filter(unit=>unit.team==="enemies"&&unit.boss&&alive(unit))){const phases=boss.phases||[];while(boss.phaseIndex<phases.length&&boss.hp/boss.maxHp<=phases[boss.phaseIndex]){boss.phaseIndex++;boss.atk=Math.floor(boss.atk*1.14);boss.spd=Math.floor(boss.spd*1.08);boss.effects.enraged=99;this.pushLog(`${boss.name} enters Phase ${boss.phaseIndex+1}!`,"warning");this.events.push({type:"phase",target:boss.unitId,phase:boss.phaseIndex+1})}}
  }

  finish(winner){this.over=true;this.winner=winner;this.currentActorId=null;this.pushLog(winner==="heroes"?"Victory!":"The party was defeated.",winner==="heroes"?"victory":"defeat")}
}

export function unitStatusSummary(unit){
  const result=[];for(const [name,value] of Object.entries(unit.buildup||{}))if(value>0)result.push({name,value,threshold:name==="Poison"?110:name==="Stagger"?120:100,type:"buildup"});
  if(unit.status.poison)result.push({name:"Poison",value:unit.status.poison,type:"active"});if(unit.status.burn)result.push({name:"Burn",value:unit.status.burn,type:"active"});if(unit.effects.weakPoint)result.push({name:"Weak Point",value:unit.effects.weakPoint,type:"active"});if(unit.effects.vulnerable)result.push({name:"Vulnerable",value:unit.effects.vulnerable,type:"active"});return result;
}

export function targetIsSelectable(battle,unit){const actor=battle.actor();if(!actor||!alive(unit))return false;return unit.team!==actor.team||battle.eligibleSkills(actor).some(({skill})=>["lowestAlly","allAllies","self"].includes(skill.target))}
