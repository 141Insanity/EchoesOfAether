export const VERSION = "0.8.0";
export const SAVE_KEY = "echoesOfAetherV08";
export const LEGACY_SAVE_KEY = "aetherV04";

export const RARITIES = ["Common", "Uncommon", "Rare", "Epic", "Mythic", "Legendary", "World", "God"];
export const RARITY_MULTIPLIER = {Common:1,Uncommon:1.2,Rare:1.5,Epic:1.9,Mythic:2.5,Legendary:3.3,World:4.4,God:6};

export const CLASSES = {
  Warrior:{icon:"🛡️",resource:"Rage",mode:"build",start:0,basicGain:22,color:"#ffb45e",description:"Builds Rage by attacking and taking damage."},
  Rogue:{icon:"🌙",resource:"Momentum",mode:"build",start:0,basicGain:20,color:"#d58cff",description:"Builds Momentum through rapid turns and pressure."},
  Ranger:{icon:"🏹",resource:"Focus",mode:"build",start:0,basicGain:20,color:"#78e6b1",description:"Builds Focus by attacking and exploiting targets."},
  Mage:{icon:"🔮",resource:"Mana",mode:"spend",start:100,basicGain:14,color:"#75c8ff",description:"Starts with Mana and spends it on spells."},
  Cleric:{icon:"✦",resource:"Faith",mode:"build",start:0,basicGain:18,color:"#ffe491",description:"Builds Faith through support and basic actions."}
};

export const HEROES = {
  mc:{name:"Aren",class:"Warrior",native:"Common",icon:"⚔️",element:"Light",hp:920,atk:116,def:92,spd:96,unique:"aegisBreak"},
  orin:{name:"Orin",class:"Ranger",native:"Common",icon:"🏹",element:"Wind",hp:760,atk:126,def:62,spd:118,unique:"disciplinedCut"},
  tess:{name:"Tess",class:"Cleric",native:"Uncommon",icon:"💠",element:"Water",hp:860,atk:108,def:78,spd:92,unique:"mend"},
  bram:{name:"Bram",class:"Warrior",native:"Rare",icon:"🛡️",element:"Earth",hp:1120,atk:118,def:126,spd:72,unique:"shieldCrush"},
  nyx:{name:"Nyx",class:"Rogue",native:"Epic",icon:"🌙",element:"Dark",hp:720,atk:154,def:58,spd:152,unique:"lacerate"},
  lyra:{name:"Lyra",class:"Mage",native:"Mythic",icon:"🔮",element:"Fire",hp:740,atk:176,def:56,spd:112,unique:"astralLance",ultimate:"starfall"},
  vexa:{name:"Vexa",class:"Rogue",native:"Mythic",icon:"🕷️",element:"Dark",hp:700,atk:182,def:54,spd:158,unique:"execution",ultimate:"nightfall"},
  kael:{name:"Kael",class:"Ranger",native:"Legendary",icon:"🎯",element:"Wind",hp:820,atk:188,def:70,spd:136,unique:"heartseeker",ultimate:"predatorVolley"},
  aurel:{name:"Aurel",class:"Cleric",native:"World",icon:"🌌",element:"Light",hp:980,atk:172,def:96,spd:122,unique:"worldrootGrace",ultimate:"benediction"},
  morwen:{name:"Morwen",class:"Cleric",native:"World",icon:"💀",element:"Dark",hp:920,atk:184,def:86,spd:110,unique:"graveStitch",ultimate:"returnToSender"},
  deus:{name:"Deus",class:"Mage",native:"God",icon:"☀️",element:"Light",hp:1080,atk:218,def:112,spd:142,unique:"sunflare",ultimate:"solarDominion"},
  garrick:{name:"Garrick",class:"Warrior",native:"Uncommon",icon:"🪓",element:"Earth",hp:1060,atk:134,def:104,spd:78,unique:"recklessCleave"},
  seraph:{name:"Seraph",class:"Warrior",native:"Legendary",icon:"🦁",element:"Light",hp:1280,atk:178,def:148,spd:86,unique:"lionbreaker",ultimate:"vanguardPride"},
  silk:{name:"Silk",class:"Rogue",native:"Rare",icon:"🕸️",element:"Dark",hp:750,atk:144,def:64,spd:148,unique:"silkenCut"},
  eir:{name:"Eir",class:"Rogue",native:"World",icon:"🌘",element:"Dark",hp:840,atk:196,def:76,spd:166,unique:"blackVein",ultimate:"noMoon"},
  rowan:{name:"Rowan",class:"Ranger",native:"Uncommon",icon:"🦊",element:"Wind",hp:790,atk:132,def:66,spd:128,unique:"foxtrapArrow"},
  solenne:{name:"Solenne",class:"Ranger",native:"Mythic",icon:"🌤️",element:"Fire",hp:850,atk:174,def:80,spd:144,unique:"sunMark",ultimate:"heliosArrow"},
  vesper:{name:"Vesper",class:"Mage",native:"Epic",icon:"🌒",element:"Water",hp:740,atk:162,def:58,spd:118,unique:"manaTide"},
  ignis:{name:"Ignis",class:"Mage",native:"Legendary",icon:"🌋",element:"Fire",hp:830,atk:194,def:68,spd:114,unique:"eruption",ultimate:"caldera"},
  elara:{name:"Elara",class:"Cleric",native:"Epic",icon:"🕊️",element:"Light",hp:940,atk:126,def:88,spd:104,unique:"gracefulMend"},
  malach:{name:"Malach",class:"Cleric",native:"Mythic",icon:"⚰️",element:"Dark",hp:910,atk:158,def:84,spd:106,unique:"mortalDebt",ultimate:"returnToSender"}
};

export const SKILLS = {
  powerStrike:{name:"Power Strike",kind:"active",class:"Warrior",cd:2,power:1.35,target:"enemy",tags:["Melee","Physical"],resourceCost:20},
  brace:{name:"Brace",kind:"active",class:"Warrior",cd:3,target:"self",tags:["Guard","Block"],effect:"guard",resourceCost:25},
  feint:{name:"Feint",kind:"active",class:"Rogue",cd:3,power:1,target:"enemy",tags:["Melee","Evasion"],effect:"evasion",resourceCost:20},
  bloodletting:{name:"Bloodletting",kind:"active",class:"Rogue",cd:3,power:1.15,target:"enemy",tags:["Melee","Bleed"],status:"Bleed",buildup:30,resourceCost:30},
  hunterMark:{name:"Hunter Mark",kind:"active",class:"Ranger",cd:3,power:.9,target:"enemy",tags:["Ranged","WeakPoint"],effect:"weakPoint",resourceCost:25},
  pinningShot:{name:"Pinning Shot",kind:"active",class:"Ranger",cd:3,power:1.1,target:"enemy",tags:["Ranged","Stagger"],status:"Stagger",buildup:26,resourceCost:25},
  manaBolt:{name:"Mana Bolt",kind:"active",class:"Mage",cd:1,power:1.1,target:"enemy",tags:["Magic"],resourceCost:8},
  meditate:{name:"Meditate",kind:"active",class:"Mage",cd:5,target:"self",tags:["Mana"],effect:"restoreMana",condition:"manaBelow25"},
  lesserMend:{name:"Lesser Mend",kind:"active",class:"Cleric",cd:2,heal:.22,target:"lowestAlly",tags:["Heal"],condition:"allyBelow75",resourceCost:20},
  smite:{name:"Smite",kind:"active",class:"Cleric",cd:2,power:1.05,target:"enemy",tags:["Magic","Faith"],resourceGain:12},

  aegisBreak:{name:"Aegis Break",kind:"active",cd:3,power:1.4,target:"enemy",tags:["Melee","Stagger"],status:"Stagger",buildup:32,resourceCost:30},
  disciplinedCut:{name:"Disciplined Cut",kind:"active",cd:1,power:1.18,target:"enemy",tags:["Ranged","Physical"],resourceCost:12},
  mend:{name:"Mend",kind:"active",cd:3,heal:.3,target:"lowestAlly",tags:["Heal"],condition:"allyBelow70",resourceCost:28},
  shieldCrush:{name:"Shield Crush",kind:"active",cd:2,power:1.15,target:"enemy",tags:["Melee","Stagger"],status:"Stagger",buildup:38,resourceCost:30},
  lacerate:{name:"Lacerate",kind:"active",cd:2,power:1.22,target:"enemy",tags:["Melee","Bleed"],status:"Bleed",buildup:36,resourceCost:24},
  astralLance:{name:"Astral Lance",kind:"active",cd:3,power:1.75,target:"enemyColumn",tags:["Magic","Piercing"],resourceCost:28},
  execution:{name:"Execution",kind:"active",cd:5,power:2.35,target:"enemy",tags:["Melee","Execute"],condition:"enemyBelow35",resourceCost:50},
  heartseeker:{name:"Heartseeker",kind:"active",cd:3,power:1.65,target:"enemy",tags:["Ranged","WeakPoint"],bonusVsWeak:1.25,resourceCost:35},
  worldrootGrace:{name:"Worldroot Grace",kind:"active",cd:4,heal:.2,target:"allAllies",tags:["Heal","Nature"],condition:"allyBelow85",resourceCost:45},
  graveStitch:{name:"Grave Stitch",kind:"active",cd:3,heal:.3,target:"lowestAlly",tags:["Heal","Dark"],condition:"allyBelow65",resourceCost:32},
  sunflare:{name:"Sunflare",kind:"active",cd:4,power:2.2,target:"enemyRow",tags:["Magic","Burn"],status:"Burn",buildup:36,resourceCost:45},
  recklessCleave:{name:"Reckless Cleave",kind:"active",cd:2,power:1.45,target:"enemyRow",tags:["Melee","Physical"],resourceCost:32},
  lionbreaker:{name:"Lionbreaker",kind:"active",cd:2,power:1.6,target:"enemy",tags:["Melee","Stagger"],status:"Stagger",buildup:34,resourceCost:35},
  silkenCut:{name:"Silken Cut",kind:"active",cd:2,power:1.2,target:"enemy",tags:["Melee","Bleed"],status:"Bleed",buildup:32,resourceCost:25},
  blackVein:{name:"Black Vein",kind:"active",cd:3,power:1.35,target:"enemyRow",tags:["Dark","Bleed"],status:"Bleed",buildup:40,resourceCost:35},
  foxtrapArrow:{name:"Foxtrap Arrow",kind:"active",cd:3,power:1,target:"enemy",tags:["Ranged","Stagger"],status:"Stagger",buildup:30,resourceCost:25},
  sunMark:{name:"Sun Mark",kind:"active",cd:2,power:1.05,target:"enemy",tags:["Ranged","WeakPoint"],effect:"weakPoint",resourceCost:25},
  manaTide:{name:"Mana Tide",kind:"active",cd:5,target:"self",tags:["Mana"],effect:"restoreMana",condition:"manaBelow30"},
  eruption:{name:"Eruption",kind:"active",cd:5,power:2.3,target:"allEnemies",tags:["Magic","Burn"],status:"Burn",buildup:44,resourceCost:48},
  gracefulMend:{name:"Graceful Mend",kind:"active",cd:2,heal:.26,target:"lowestAlly",tags:["Heal"],condition:"allyBelow70",resourceCost:24},
  mortalDebt:{name:"Mortal Debt",kind:"active",cd:4,power:.95,target:"enemy",tags:["Dark","Debuff"],effect:"vulnerable",resourceCost:38},

  starfall:{name:"Starfall",kind:"ultimate",power:3,target:"allEnemies",tags:["Magic","AoE"]},
  nightfall:{name:"Nightfall",kind:"ultimate",power:3.15,target:"enemyRow",tags:["Dark","AoE"]},
  predatorVolley:{name:"Predator Volley",kind:"ultimate",power:2.7,target:"allEnemies",tags:["Ranged","Multi"]},
  benediction:{name:"Worldroot Benediction",kind:"ultimate",heal:.42,target:"allAllies",tags:["Heal","Cleanse"]},
  returnToSender:{name:"Return to Sender",kind:"ultimate",target:"koAlly",tags:["Revive"],revive:.3},
  solarDominion:{name:"Solar Dominion",kind:"ultimate",power:3.35,target:"allEnemies",tags:["Light","Burn"],status:"Burn",buildup:50},
  vanguardPride:{name:"Pride of the Vanguard",kind:"ultimate",power:2.8,target:"enemyRow",tags:["Melee","Guard"],effect:"teamGuard"},
  noMoon:{name:"No Moon",kind:"ultimate",power:3.25,target:"allEnemies",tags:["Dark","Execute"]},
  heliosArrow:{name:"Helios Arrow",kind:"ultimate",power:3,target:"enemyColumn",tags:["Ranged","Piercing"]},
  caldera:{name:"Caldera",kind:"ultimate",power:3.25,target:"allEnemies",tags:["Burn","AoE"],status:"Burn",buildup:50}
};

export const CLASS_LOADOUTS = {
  Warrior:["powerStrike","brace"],Rogue:["feint","bloodletting"],Ranger:["hunterMark","pinningShot"],Mage:["manaBolt","meditate"],Cleric:["lesserMend","smite"]
};

export const ENEMIES = {
  whisperWisp:{name:"Whisper Wisp",icon:"🟣",element:"Dark",hp:560,atk:88,def:38,spd:126,skills:["enemyHex"]},
  briarWolf:{name:"Briar Wolf",icon:"🐺",element:"Earth",hp:760,atk:108,def:52,spd:118,skills:["enemyPounce"]},
  thornling:{name:"Thornling",icon:"🌿",element:"Earth",hp:940,atk:92,def:82,spd:76,skills:["enemyThorns"]},
  duskBandit:{name:"Dusk Bandit",icon:"🥷",element:"Dark",hp:680,atk:116,def:48,spd:112,skills:["enemyCut"]},
  alphaWolf:{name:"Whisperwood Alpha",icon:"🐺",element:"Dark",hp:2400,atk:148,def:96,spd:122,boss:true,skills:["enemyHowl","enemyPounce"]},
  whisperAncient:{name:"Whisperwood Ancient",icon:"🌳",element:"Earth",hp:5600,atk:176,def:132,spd:88,boss:true,skills:["enemyRoots","enemyQuake"],phases:[.65,.35]},
  towerSentinel:{name:"Tower Sentinel",icon:"🗿",element:"Light",hp:3400,atk:158,def:118,spd:102,boss:true,skills:["enemyBeam","enemyQuake"],phases:[.5]}
};

export const ENEMY_SKILLS = {
  enemyHex:{name:"Aether Hex",cd:2,power:1.15,target:"hero",tags:["Magic","Dark"]},
  enemyPounce:{name:"Briar Pounce",cd:2,power:1.35,target:"hero",tags:["Melee"]},
  enemyThorns:{name:"Thorn Volley",cd:3,power:1.05,target:"heroRow",tags:["Ranged","Bleed"],status:"Bleed",buildup:24},
  enemyCut:{name:"Dusk Cut",cd:2,power:1.2,target:"hero",tags:["Melee"]},
  enemyHowl:{name:"Predator's Howl",cd:4,target:"self",effect:"enrage",tags:["Buff"]},
  enemyRoots:{name:"Grasping Roots",cd:3,power:1.15,target:"heroRow",status:"Stagger",buildup:32,tags:["Earth","Stagger"]},
  enemyQuake:{name:"Ancient Quake",cd:5,power:1.3,target:"allHeroes",status:"Stagger",buildup:25,tags:["Earth","AoE"],telegraph:true},
  enemyBeam:{name:"Judgment Beam",cd:4,power:1.65,target:"heroColumn",tags:["Light","Piercing"],telegraph:true}
};

export const GEAR = [
  {id:"bronzeSword",name:"Bronze Sword",rarity:"Common",slot:"Weapon",class:"Any",atk:12,def:0,icon:"🗡️"},
  {id:"ironLongsword",name:"Iron Longsword",rarity:"Uncommon",slot:"Weapon",class:"Warrior",atk:22,def:4,icon:"⚔️"},
  {id:"moonKnives",name:"Moon Knives",rarity:"Epic",slot:"Weapon",class:"Rogue",atk:38,def:0,icon:"🗡️"},
  {id:"heartstring",name:"Heartstring",rarity:"Legendary",slot:"Weapon",class:"Ranger",atk:58,def:4,icon:"🏹",signature:"Weak Point attacks gain +30 Precision."},
  {id:"astralCodex",name:"Astral Codex",rarity:"Mythic",slot:"Weapon",class:"Mage",atk:48,def:6,icon:"📘",signature:"Astral skills deal 20% more damage."},
  {id:"saintReliquary",name:"Saint's Reliquary",rarity:"World",slot:"Class Item",class:"Cleric",atk:42,def:36,icon:"✝️",signature:"Excess healing becomes a shield."},
  {id:"leatherJerkin",name:"Leather Jerkin",rarity:"Common",slot:"Armor",class:"Any",atk:0,def:14,icon:"🥋"},
  {id:"runeMail",name:"Rune Mail",rarity:"Epic",slot:"Armor",class:"Any",atk:8,def:38,icon:"🛡️"},
  {id:"aegisCrown",name:"Aegis Crown",rarity:"Mythic",slot:"Helmet",class:"Any",atk:4,def:30,icon:"👑"},
  {id:"hunterGloves",name:"Hunter Gloves",rarity:"Uncommon",slot:"Gloves",class:"Any",atk:10,def:8,icon:"🧤"},
  {id:"wardedGreaves",name:"Warded Greaves",rarity:"Rare",slot:"Legs",class:"Any",atk:3,def:20,icon:"🦿"},
  {id:"windstepBoots",name:"Windstep Boots",rarity:"Epic",slot:"Boots",class:"Any",atk:8,def:12,spd:8,icon:"🥾"},
  {id:"sageSignet",name:"Sage Signet",rarity:"Mythic",slot:"Ring",class:"Any",atk:16,def:12,icon:"💍"},
  {id:"godTear",name:"Tear of the First God",rarity:"God",slot:"Amulet",class:"Any",atk:42,def:38,icon:"💠",signature:"Survive lethal damage once per battle."},
  {id:"rageIdol",name:"War Banner Idol",rarity:"Mythic",slot:"Class Item",class:"Warrior",atk:18,def:24,icon:"🚩"},
  {id:"shadowCoin",name:"Shadow Coin",rarity:"Mythic",slot:"Class Item",class:"Rogue",atk:24,def:10,icon:"🪙"},
  {id:"hawkCharm",name:"Hunter's Talon",rarity:"Mythic",slot:"Class Item",class:"Ranger",atk:22,def:12,icon:"🦅"},
  {id:"manaPrism",name:"Mana Prism",rarity:"Mythic",slot:"Class Item",class:"Mage",atk:22,def:8,icon:"🔷"}
];

export const EQUIP_SLOTS = ["Weapon","Armor","Helmet","Gloves","Legs","Boots","Ring 1","Ring 2","Amulet","Class Item"];
export const EQUIP_UNLOCK = {Weapon:1,Armor:3,Helmet:5,Gloves:7,Legs:9,Boots:11,"Ring 1":13,"Ring 2":15,Amulet:18,"Class Item":22};

export const GATE_RATES = [
 [72,20,7,1,0,0,0,0],[55,28,13,3.5,.5,0,0,0],[35,32,21,9,2.5,.5,0,0],
 [18,27,28,18,7,1.8,.2,0],[5,17,29,25,16,6.5,1.4,.1],[0,5,20,29,25,15,5,1],
 [0,0,5,22,31,26,13,3],[0,0,0,8,30,34,24,4]
];

export const WHISPERWOOD_NODES = Array.from({length:10},(_,i)=>({
  id:i+1,
  type:i===9?"Boss":i===4?"Mini":"Battle",
  title:i===9?"Heart of the Whisperwood":i===4?"The Alpha's Den":["Murmuring Path","Briar Crossing","Wisp Hollow","Broken Shrine","The Alpha's Den","Moonlit Ford","Dusk Encampment","Rootbound Ruins","Ancient Approach","Heart of the Whisperwood"][i]
}));

export function rarityIndex(rarity){return Math.max(0,RARITIES.indexOf(rarity))}
export function heroSkillIds(heroId, heroClass, rarity){
  const hero=HEROES[heroId]||HEROES.mc;
  const slots=rarityIndex(rarity)>=7?4:rarityIndex(rarity)>=3?3:2;
  return [hero.unique,...(CLASS_LOADOUTS[heroClass]||[])].filter(Boolean).filter((x,i,a)=>a.indexOf(x)===i).slice(0,slots);
}

export function encounterForNode(node, towerFloor=0){
  if(towerFloor){
    const scale=1+(towerFloor-1)*.18;
    return {id:`tower-${towerFloor}`,name:`Trial Tower • Floor ${towerFloor}`,background:"tower",reward:{gems:55+towerFloor*5,gold:500+towerFloor*90},enemies:[
      {enemyId:"towerSentinel",position:1,scale},
      ...(towerFloor%3===0?[{enemyId:"whisperWisp",position:3,scale:.8*scale},{enemyId:"whisperWisp",position:6,scale:.8*scale}]:[])
    ]};
  }
  const scale=1+(node-1)*.11;
  if(node===10)return{id:"whisperwood-10",name:"Whisperwood Ancient",background:"forest",reward:{gold:2200,gems:120,fixedGear:"heartstring"},enemies:[{enemyId:"whisperAncient",position:1,scale},{enemyId:"thornling",position:3,scale:.85},{enemyId:"thornling",position:6,scale:.85}]};
  if(node===5)return{id:"whisperwood-5",name:"The Alpha's Den",background:"forest",reward:{gold:1200,gems:65,fixedGear:"runeMail"},enemies:[{enemyId:"alphaWolf",position:1,scale},{enemyId:"briarWolf",position:3,scale:.9},{enemyId:"briarWolf",position:6,scale:.9}]};
  const pools=[["whisperWisp","briarWolf"],["briarWolf","thornling"],["duskBandit","whisperWisp"],["thornling","duskBandit"]];
  const pool=pools[(node-1)%pools.length];
  return{id:`whisperwood-${node}`,name:WHISPERWOOD_NODES[node-1].title,background:"forest",reward:{gold:300+node*90,gems:10+node*3},enemies:[{enemyId:pool[0],position:0,scale},{enemyId:pool[1],position:4,scale},{enemyId:pool[0],position:6,scale:.9}]};
}
