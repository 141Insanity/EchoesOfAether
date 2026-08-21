ECHOES OF AETHER v0.4 — EQUIPMENT & PROGRESSION

Key changes:
- Stronger mobile app feel; double-tap zoom suppression and gesture prevention
- 5 permanent party-training slots; Slot 1 is permanently the MC
- Hero level belongs to party slot, not hero
- All five slots gain equal XP, including KO'd units
- Each of 10 equipment positions levels independently per party slot
- Equipped item inherits that slot level
- Equipment slots unlock by Adventurer progression
- Fixed native equipment rarity identities
- Common-Rare clean gear; affixes begin at Epic
- General and class-specific equipment
- Two ring slots cannot use the same ring item
- Gacha rarity ceiling requires both Adventurer Level and Summoning Shrine Level
- Specific boss-drop test can exceed current gacha rarity ceiling
- Mage Mana starts full and is spent; build-up resources behave separately
- Gear stats affect battle

Deploy the echoes_of_aether_v04 folder to your existing Netlify project.

Validation patch: hero gacha retained, Slots 2-5 can swap heroes, duplicate gear supports Equip / Dismantle / Feed.

v0.4.1 POLISH
- Gear now shows scaled ATK/DEF and affixes.
- Best sorting is default, with Rarity/ATK/DEF options.
- Compatible gear is default; toggle can show all.
- Equipped gear is highlighted.
- Tester panel adds infinite summon resources and progression skips.
- Aether Mine provides a legitimate repeatable diamond source with a 24-hour cap.

v0.5.0 EXPLORATION
- Navigation: Home / Heroes / Explore / Dungeons / Aethergate.
- Home is now the first town-hub foundation.
- Aethergate replaces generic Summon naming.
- Heroes consolidates active party, reserve roster, hero details, Ascend and Swap.
- Reserve roster sorts highest rarity first.
- Whisperwood now has 10 progression nodes.
- Normal nodes use watchable auto combat with 1x/2x/4x controls.
- Miniboss and boss nodes use manual commands.
- Background farm toggle added.
- Trial Tower added with unlimited attempts.
- Dungeon Hall established for unique dungeons and future events.
- WOMP WOMP failure flavor added.

v0.5.1 FIXES
- Fixed blank Aethergate.
- Restored 24-hour expedition buildup to Home.
- Removed duplicate/dead equipment entry points; Equipment subtab is now functional inside Heroes.
- Trial Tower now uses the 5-character SPD command engine.
- Whisperwood miniboss/boss now use the same party command engine.
- Normal Explore auto battles use real hero rarity, training-slot levels, gear stats, ATK/DEF/HP.
- Increased rarity scaling so World/God pulls meaningfully affect combat.

v0.5.2 loot/drop scaling, split equipment banners, visible rarity odds, auto-equip, reward summaries, tower flow controls.

v0.5.3 REPAIR
- Aethergate explicitly shows percentage odds for all 8 rarities.
- Weapons / Armor / Accessories are three separate equipment Gate categories.
- Zero-percent rarities can no longer appear as fallback pulls; max Gate Common remains 0%.
- Auto Equip Best moved into the Equipment sub-tab.
- Command-battle victory now produces actual loot/reward summaries.
- Explore miniboss/boss Return to Map uses deterministic command-state cleanup.
- Trial Tower now uses one Enter Next Floor action on the hub.
- Tower wins show Next Floor + Leave Tower; Auto Advance is a separate persistent toggle.
- Removed stale prototype flow from Tower/Explore completion UI.

v0.5.4 FIXED
- Rings and Amulets are usable by any class.
- Added more Rings and Amulets to Accessories.
- Tower Auto Advance waits ~4 seconds.
- Explore and Tower command fights can be left mid-battle.

v0.5.5 quick fix: Hero Aethergate pulls now work and display results/duplicate shards correctly.

v0.6.0 BUILDCRAFT FOUNDATION
- 11-stat core combat architecture: HP/ATK/DEF/SPD/Crit Rate/Crit Damage/Crit Resistance/Crit Defense/Precision/Evasion/Resistance.
- Diminishing-return DEF, crit-vs-resistance, crit-damage-vs-defense, and glancing-hit math.
- Expanded affix vocabulary without bloating the permanent stat sheet.
- Separate Hero/Weapon/Armor/Accessory Sigils. Sigils never mix with gems. 10 Sigils grant 11 pulls.
- 300-item inventory cap and equipment Codex foundation.
- Rogue combo follow-ups and Ranger Precision Crit prototype mechanics.

v0.6.1: independent Gate XP/odds/pity, Sigil icons, endgame Epic+ curve, full tappable stat sheet, fusion foundation.

v0.6.2 INVENTORY & BLACKSMITH POLISH
- Stat descriptions now use Back to return to Full Stats instead of closing everything.
- Equipment menus have explicit Back and X buttons for inspection-only use.
- Added Blacksmith building to Home.
- Full inventory browser with filters/sorting.
- Direct item detail view with stats, affixes, equipped-by, lock, dismantle and fusion access.
- Heroes Equipment remains loadout-focused; inventory maintenance moves to Blacksmith.
- Lock protection added for important items.

v0.6.3: visible Blacksmith access; small top-right X controls; stats detail uses Back only; equipment inspection clean close hierarchy.

v0.6.4 MOBILE LAYOUT FIX
- Browser/page remains locked to the phone viewport.
- Active app screens scroll vertically inside the app.
- Header and bottom navigation stay fixed.
- Modals use internal scrolling with iOS momentum scrolling.
- Tabs reset to the top when opened.
- Blacksmith moved into the Home town grid.
- Home is now ready to grow vertically with additional town buildings.

v0.6.5 POLISH
- Blacksmith item Back returns to the Blacksmith inventory instead of closing the Blacksmith.
- Fusion Back returns to the selected item.
- Heroes equipment/details no longer crush the Reserve Heroes section.
- Reserve Heroes now sits naturally below the hero detail/loadout content inside the scrollable app screen.
- Removed duplicate Aether Mine town building; the dedicated Aether Mine card remains.

v0.6.6 MODAL CONSISTENCY POLISH
- Standardized menus around a small top-right X.
- Top-level modal X closes the menu.
- Nested modal X returns to its parent.
- Removed duplicate Back + X combinations across Blacksmith, Fusion, Stats, Equipment and other modal flows.
- Blacksmith item X now returns to the Blacksmith inventory instead of closing the entire Blacksmith.
- Stat-detail X returns to Full Stats.

v0.7.0 ARSENAL & HEROES
- 10 summonable heroes across the five core classes.
- Skill loadout editor with rarity-based active-slot caps, manual priority ordering and Auto Priority.
- Hero-action cooldown foundation, Mage MP-aware skills, and Cleric conditional healing.
- Bleed/Hemorrhage, Poison/Toxicity, Burn/Ignite and Stagger/Break buildup foundations.
- Compact visible buildup indicators during command combat.
- 3x3 formation editor and lane-role foundation.
- Expanded equipment pool with Legendary / World / God signature effects.
- Hero / Equipment Codex access.
- Tester RESET SAVE and +100 All Sigils controls for clean development testing.

v0.7.1 SAVE HOTFIX
- Fresh installs now persist the initial save immediately on boot.
- Idle Expedition and Aether Mine timestamps now survive refresh/close even before the player performs another action.
- Package is GitHub Pages-ready: index.html and assets are at ZIP root; Netlify config removed.

v0.7.2: Skill Lv1-10 with Gold + Skill Dust, Lv5/Lv10 milestones, signature skill modifiers, deterministic Fusion scaling foundation, Codex milestone trigger tracker.
