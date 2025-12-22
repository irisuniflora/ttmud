# Monster Image Guide

## Image Specifications

| Type | Size | Ratio | Format | Notes |
|------|------|-------|--------|-------|
| Background | 800x192 px | ~4:1 | PNG | Component height is h-48 (192px) |
| Player | 64x80 px | 4:5 | PNG (transparent) | Pixel art style |
| Normal Monster | 64x80 px | 4:5 | PNG (transparent) | 0.png ~ 9.png |
| Boss | 96x112 px | ~6:7 | PNG (transparent) | 1.5x size of normal |

**Note:** Rare/Legendary monsters use the same images as normal monsters.
They are distinguished by CSS glow effects applied automatically.

---

## Folder Structure

```
public/images/field/
├── backgrounds/
│   ├── floor_1.png      (Abandoned Mine)
│   ├── floor_6.png      (Goblin Den)
│   ├── floor_11.png     (Spider Cave)
│   ├── floor_16.png     (Undead Cemetery)
│   ├── floor_21.png     (Kobold Territory)
│   ├── floor_26.png     (Poison Mushroom Forest)
│   ├── floor_31.png     (Harpy Nest)
│   ├── floor_36.png     (Minotaur Labyrinth)
│   ├── floor_41.png     (Flame Lava Zone)
│   ├── floor_46.png     (Ice Cave)
│   ├── floor_51.png     (Ogre Fortress)
│   ├── floor_56.png     (Dark Elf Dwelling)
│   ├── floor_61.png     (Gargoyle Spire)
│   ├── floor_66.png     (Dragon Nest)
│   ├── floor_71.png     (Demon Hall)
│   ├── floor_76.png     (Spirit Abyss)
│   ├── floor_81.png     (Fallen Knights)
│   ├── floor_86.png     (Ancient Ruins)
│   ├── floor_91.png     (Dragon Tomb)
│   └── floor_96.png     (End of Abyss)
├── characters/
│   └── player.png
└── monsters/
    ├── floor_1/
    │   ├── 0.png ~ 9.png
    │   └── boss.png
    ├── floor_6/
    │   ├── 0.png ~ 9.png
    │   └── boss.png
    └── ... (same for all floors)
```

---

## Region Details (20 Regions)

### Floor 1-5: Abandoned Mine (버려진 광산)
- **Theme:** Dark tunnels, ore, wooden pillars
- **Signature Color:** Brown/Ochre `#8B6914`
- **Monster Colors:** Gray-brown, rusty orange, dark purple (bats)

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 광산 박쥐 (Mine Bat) | Dark purple/black |
| 1 | 동굴 쥐 (Cave Rat) | Gray-brown |
| 2 | 녹슨 골렘 (Rusty Golem) | Rusty orange/brown |
| 3 | 갱도 거미 (Tunnel Spider) | Black/dark gray |
| 4 | 부서진 광부 (Broken Miner) | Pale skin, tattered clothes |
| 5 | 독가스 슬라임 (Poison Gas Slime) | Sickly green |
| 6 | 무너진 수레 (Collapsed Cart) | Wood brown, metal gray |
| 7 | 광석 정령 (Ore Spirit) | Crystal blue/orange glow |
| 8 | 곡괭이 좀비 (Pickaxe Zombie) | Pale green, brown clothes |
| 9 | 갱도 벌레 (Tunnel Worm) | Pale pink/brown |
| boss | 폐광의 수호자 (Mine Guardian) | Stone gray with crystal accents |

---

### Floor 6-10: Goblin Den (고블린 소굴)
- **Theme:** Forest cave, torches, tents
- **Signature Color:** Light Green `#4A7C23`
- **Monster Colors:** Green skin, brown leather, gray wolves

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 고블린 정찰병 (Goblin Scout) | Green skin, light armor |
| 1 | 고블린 전사 (Goblin Warrior) | Green, metal helmet |
| 2 | 늑대기수 (Wolf Rider) | Green goblin + gray wolf |
| 3 | 고블린 투석병 (Goblin Slinger) | Green, sling weapon |
| 4 | 고블린 도적 (Goblin Thief) | Dark green, hood |
| 5 | 고블린 창병 (Goblin Spearman) | Green, spear |
| 6 | 고블린 주술사 견습 (Goblin Shaman Apprentice) | Green, tribal marks |
| 7 | 사냥개 (Hunting Dog) | Brown/gray dog |
| 8 | 고블린 파수꾼 (Goblin Sentry) | Green, armor |
| 9 | 고블린 광전사 (Goblin Berserker) | Green, red war paint |
| boss | 고블린 우두머리 (Goblin Chief) | Large green, crown/throne |

---

### Floor 11-15: Spider Cave (거미 동굴)
- **Theme:** Webs everywhere, dark cave
- **Signature Color:** Dark Gray `#3A3A3A`
- **Monster Colors:** Black, purple, poison green

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 동굴 거미 (Cave Spider) | Black |
| 1 | 맹독 거미 (Venomous Spider) | Purple/green |
| 2 | 거미줄 덫꾼 (Web Trapper) | White web patterns |
| 3 | 점프 거미 (Jumping Spider) | Brown/black |
| 4 | 알 수호자 (Egg Guardian) | Black + white eggs |
| 5 | 독침 거미 (Poison Stinger) | Green glowing |
| 6 | 어둠 거미 (Shadow Spider) | Pure black |
| 7 | 거대 타란툴라 (Giant Tarantula) | Hairy brown/black |
| 8 | 거미 사냥꾼 (Spider Hunter) | Camouflage pattern |
| 9 | 실뿜는 거미 (Web Spinner) | White/silver |
| boss | 거대 여왕거미 (Giant Queen Spider) | Large black + purple accents |

---

### Floor 16-20: Undead Cemetery (언데드 묘지)
- **Theme:** Tombstones, full moon, fog
- **Signature Color:** Pale Purple `#6B5B95`
- **Monster Colors:** Pale green (zombie), bone white, black smoke

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 좀비 (Zombie) | Pale green skin |
| 1 | 스켈레톤 (Skeleton) | Bone white |
| 2 | 그림자 영혼 (Shadow Spirit) | Translucent purple |
| 3 | 구울 (Ghoul) | Gray-green |
| 4 | 스켈레톤 궁수 (Skeleton Archer) | Bone white + bow |
| 5 | 좀비 전사 (Zombie Warrior) | Green + rusty armor |
| 6 | 망령 (Wraith) | Black smoke |
| 7 | 뱀파이어 박쥐 (Vampire Bat) | Black/red eyes |
| 8 | 해골 개 (Skeleton Dog) | Bone white |
| 9 | 부패한 시체 (Rotting Corpse) | Dark green/brown |
| boss | 묘지기 리치 (Gravekeeper Lich) | Black robes, blue glow |

---

### Floor 21-25: Kobold Territory (코볼트 영토)
- **Theme:** Wasteland, cave entrance, flags
- **Signature Color:** Orange-Brown `#B5651D`
- **Monster Colors:** Brown/orange scales, red eyes

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 코볼트 전사 (Kobold Warrior) | Brown scales |
| 1 | 코볼트 주술사 (Kobold Shaman) | Brown + tribal paint |
| 2 | 코볼트 암살자 (Kobold Assassin) | Dark brown, daggers |
| 3 | 코볼트 창병 (Kobold Spearman) | Brown + spear |
| 4 | 코볼트 궁수 (Kobold Archer) | Brown + bow |
| 5 | 코볼트 광부 (Kobold Miner) | Brown, pickaxe |
| 6 | 코볼트 정찰병 (Kobold Scout) | Light brown |
| 7 | 코볼트 폭파병 (Kobold Bomber) | Brown + bomb |
| 8 | 코볼트 사제 (Kobold Priest) | Brown + robes |
| 9 | 코볼트 검사 (Kobold Swordsman) | Brown + sword |
| boss | 코볼트 대족장 (Kobold Chieftain) | Large brown, crown |

---

### Floor 26-30: Poison Mushroom Forest (독버섯 숲)
- **Theme:** Glowing mushrooms, foggy forest
- **Signature Color:** Poison Purple `#9B59B6`
- **Monster Colors:** Purple/green mushrooms, glowing green spores

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 포자 좀비 (Spore Zombie) | Green with mushroom growths |
| 1 | 독버섯인간 (Mushroom Man) | Purple cap, pale body |
| 2 | 맹독 덩굴 (Poison Vine) | Dark green |
| 3 | 버섯 포자 (Mushroom Spore) | Floating green particles |
| 4 | 독초 정령 (Poison Herb Spirit) | Glowing green |
| 5 | 썩은 나무인간 (Rotting Treant) | Dark brown/black |
| 6 | 독안개 정령 (Poison Mist Spirit) | Purple mist |
| 7 | 맹독 슬라임 (Poison Slime) | Bright green |
| 8 | 포자 벌레 (Spore Bug) | Green/yellow |
| 9 | 균사체 괴물 (Mycelium Monster) | White/purple web patterns |
| boss | 버섯왕 미코스 (Mushroom King Mycos) | Large purple, crown-like cap |

---

### Floor 31-35: Harpy Nest (하피 둥지)
- **Theme:** Cliffs, nests, feathers
- **Signature Color:** Sky Blue `#87CEEB`
- **Monster Colors:** White/gray feathers, blue lightning

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 하피 전사 (Harpy Warrior) | White feathers, armor |
| 1 | 깃털 마법사 (Feather Mage) | Blue feathers, magic |
| 2 | 돌풍의 하피 (Gust Harpy) | White + wind effects |
| 3 | 하피 궁수 (Harpy Archer) | Gray feathers, bow |
| 4 | 폭풍 하피 (Storm Harpy) | Dark blue feathers |
| 5 | 하피 정찰병 (Harpy Scout) | Light feathers |
| 6 | 번개 하피 (Lightning Harpy) | Yellow/blue electric |
| 7 | 하피 암살자 (Harpy Assassin) | Black feathers |
| 8 | 회오리 하피 (Whirlwind Harpy) | Spiral patterns |
| 9 | 하피 사냥꾼 (Harpy Hunter) | Brown feathers |
| boss | 폭풍의 여왕 (Storm Queen) | Large, majestic, lightning |

---

### Floor 36-40: Minotaur Labyrinth (미노타우로스 미궁)
- **Theme:** Stone maze, pillars, torches
- **Signature Color:** Dark Brown `#654321`
- **Monster Colors:** Brown hide, black horns, metal axes

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 미로의 전사 (Labyrinth Warrior) | Brown, armor |
| 1 | 황소인간 (Bull-man) | Brown hide, horns |
| 2 | 미궁 수호병 (Maze Guardian) | Stone gray armor |
| 3 | 투우사 미노타우로스 (Matador Minotaur) | Red cape |
| 4 | 도끼 미노타우로스 (Axe Minotaur) | Bronze axe |
| 5 | 미궁 파수꾼 (Maze Sentry) | Dark armor |
| 6 | 광전사 황소인간 (Berserker Bull-man) | Red eyes |
| 7 | 미로 순찰병 (Maze Patrol) | Standard armor |
| 8 | 뿔달린 전사 (Horned Warrior) | Prominent horns |
| 9 | 미궁 광전사 (Maze Berserker) | Battle scars |
| boss | 미로의 지배자 (Lord of the Maze) | Massive, golden horns |

---

### Floor 41-45: Flame Lava Zone (화염 용암지대)
- **Theme:** Lava, flames, black rocks
- **Signature Color:** Orange/Red `#FF4500`
- **Monster Colors:** Orange, red, black soot

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 용암 슬라임 (Lava Slime) | Orange/red |
| 1 | 화염 정령 (Flame Spirit) | Red/yellow flames |
| 2 | 마그마 골렘 (Magma Golem) | Black + orange cracks |
| 3 | 불꽃 박쥐 (Fire Bat) | Red/orange |
| 4 | 용암 벌레 (Lava Worm) | Orange segments |
| 5 | 화염 악마 (Fire Demon) | Red skin, horns |
| 6 | 불의 정령 (Fire Elemental) | Pure flame |
| 7 | 용암 거미 (Lava Spider) | Black + lava patterns |
| 8 | 화염 드레이크 (Fire Drake) | Red scales |
| 9 | 타오르는 해골 (Burning Skeleton) | Bone + flames |
| boss | 불의 군주 (Lord of Fire) | Massive, flame aura |

---

### Floor 46-50: Ice Cave (얼음 동굴)
- **Theme:** Glaciers, icicles, snow
- **Signature Color:** Light Blue/White `#ADD8E6`
- **Monster Colors:** White, light blue, transparent ice

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 서리 늑대 (Frost Wolf) | White/light blue |
| 1 | 빙결 좀비 (Frozen Zombie) | Pale blue |
| 2 | 얼음 정령 (Ice Spirit) | Translucent blue |
| 3 | 눈보라 정령 (Blizzard Spirit) | White swirl |
| 4 | 빙하 골렘 (Glacier Golem) | Ice blue |
| 5 | 서리 거미 (Frost Spider) | White/blue |
| 6 | 얼음 드레이크 (Ice Drake) | Blue scales |
| 7 | 냉기 유령 (Cold Ghost) | Translucent white |
| 8 | 눈사람 전사 (Snowman Warrior) | White, carrot nose |
| 9 | 빙결 슬라임 (Frozen Slime) | Light blue |
| boss | 빙설의 마녀 (Ice Witch) | White robes, blue magic |

---

### Floor 51-55: Ogre Fortress (오거 요새)
- **Theme:** Stone fortress, bone decorations
- **Signature Color:** Murky Green `#556B2F`
- **Monster Colors:** Gray-green skin, brown leather

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 오거 전사 (Ogre Warrior) | Gray-green, club |
| 1 | 오거 타격수 (Ogre Striker) | Large fists |
| 2 | 쌍두 오거 (Two-headed Ogre) | Two heads |
| 3 | 오거 광전사 (Ogre Berserker) | Red eyes |
| 4 | 오거 정예병 (Elite Ogre) | Better armor |
| 5 | 오거 투척병 (Ogre Thrower) | Rocks |
| 6 | 철갑 오거 (Armored Ogre) | Metal plates |
| 7 | 오거 파괴자 (Ogre Destroyer) | Massive |
| 8 | 오거 사냥꾼 (Ogre Hunter) | Animal skins |
| 9 | 오거 약탈자 (Ogre Pillager) | Stolen goods |
| boss | 오거 장군 (Ogre General) | Commanding, armor |

---

### Floor 56-60: Dark Elf Dwelling (다크엘프 거처)
- **Theme:** Dark palace, purple lighting
- **Signature Color:** Deep Purple `#4B0082`
- **Monster Colors:** Dark skin, silver hair, purple magic

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 암흑 궁수 (Dark Archer) | Dark skin, bow |
| 1 | 그림자 암살자 (Shadow Assassin) | Black cloak |
| 2 | 어둠 마법사 (Dark Mage) | Purple magic |
| 3 | 다크엘프 검사 (Dark Elf Swordsman) | Elegant blade |
| 4 | 독살자 (Poisoner) | Green vials |
| 5 | 어둠 사제 (Dark Priest) | Dark robes |
| 6 | 그림자 무용수 (Shadow Dancer) | Graceful |
| 7 | 암살단원 (Assassin Guild) | Masked |
| 8 | 어둠 주술사 (Dark Shaman) | Bone accessories |
| 9 | 다크엘프 기사 (Dark Elf Knight) | Dark armor |
| boss | 어둠의 여군주 (Dark Lady) | Regal, powerful |

---

### Floor 61-65: Gargoyle Spire (가고일 첨탑)
- **Theme:** Gothic cathedral, statues
- **Signature Color:** Gray/Silver `#708090`
- **Monster Colors:** Stone gray, red eyes, metal shine

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 석상 가고일 (Stone Gargoyle) | Gray stone |
| 1 | 비행 가고일 (Flying Gargoyle) | Wings spread |
| 2 | 석화의 감시자 (Petrifying Watcher) | Glowing eyes |
| 3 | 대리석 가고일 (Marble Gargoyle) | White stone |
| 4 | 화강암 가고일 (Granite Gargoyle) | Dark gray |
| 5 | 날개 달린 석상 (Winged Statue) | Detailed wings |
| 6 | 첨탑 파수꾼 (Spire Guardian) | Gothic design |
| 7 | 돌 악마 (Stone Demon) | Demonic features |
| 8 | 석화 전사 (Petrified Warrior) | Warrior pose |
| 9 | 고딕 가고일 (Gothic Gargoyle) | Ornate |
| boss | 고대의 가고일 (Ancient Gargoyle) | Massive, ancient |

---

### Floor 66-70: Dragon Nest (드래곤 둥지)
- **Theme:** Volcanic cave, treasure piles
- **Signature Color:** Gold/Red `#DAA520`
- **Monster Colors:** Red/green/gold scales

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 와이번 (Wyvern) | Green scales |
| 1 | 드레이크 (Drake) | Blue scales |
| 2 | 용인족 전사 (Dragonkin Warrior) | Humanoid dragon |
| 3 | 드래곤 새끼 (Dragon Hatchling) | Small, various colors |
| 4 | 용비늘 전사 (Dragonscale Warrior) | Scale armor |
| 5 | 불 드레이크 (Fire Drake) | Red |
| 6 | 용 사냥꾼 (Dragon Hunter) | Hunter gear |
| 7 | 드래곤 기사 (Dragon Knight) | Dragon-themed armor |
| 8 | 용인족 주술사 (Dragonkin Shaman) | Tribal + dragon |
| 9 | 익룡 (Pterosaur) | Flying reptile |
| boss | 고룡 발라크 (Ancient Dragon Balak) | Massive dragon |

---

### Floor 71-75: Demon Hall (악마의 전당)
- **Theme:** Hell background, magic circles
- **Signature Color:** Crimson `#8B0000`
- **Monster Colors:** Red, black, purple flames

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 임프 (Imp) | Small red |
| 1 | 서큐버스 (Succubus) | Purple, seductive |
| 2 | 헬하운드 (Hellhound) | Black + fire |
| 3 | 지옥 기사 (Hell Knight) | Black armor, fire |
| 4 | 악마 사제 (Demon Priest) | Dark robes |
| 5 | 인큐버스 (Incubus) | Male demon |
| 6 | 지옥 마법사 (Hell Mage) | Fire magic |
| 7 | 악마 전사 (Demon Warrior) | Red skin, horns |
| 8 | 마귀 (Devil) | Classic demon |
| 9 | 지옥 창병 (Hell Spearman) | Flaming spear |
| boss | 지옥의 대공 (Archduke of Hell) | Massive, majestic demon |

---

### Floor 76-80: Spirit Abyss (정령의 심연)
- **Theme:** Space rifts, starlight, chaos
- **Signature Color:** Cosmic Purple `#9932CC`
- **Monster Colors:** Multi-color mix, transparent, glowing

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 혼돈 정령 (Chaos Spirit) | Multi-colored |
| 1 | 폭주 원소 (Rampant Elemental) | All elements |
| 2 | 차원 균열수 (Rift Guardian) | Space patterns |
| 3 | 공간 정령 (Space Spirit) | Starry |
| 4 | 시간 정령 (Time Spirit) | Clockwork |
| 5 | 무형 정령 (Formless Spirit) | Translucent |
| 6 | 원소 융합체 (Elemental Fusion) | Mixed elements |
| 7 | 균열 악마 (Rift Demon) | Dark energy |
| 8 | 뒤틀린 정령 (Twisted Spirit) | Distorted |
| 9 | 차원 포식자 (Dimension Eater) | Void-like |
| boss | 원소의 화신 (Avatar of Elements) | All elements combined |

---

### Floor 81-85: Fallen Knights (타락한 기사단)
- **Theme:** Ruined castle, darkness
- **Signature Color:** Black `#1A1A1A`
- **Monster Colors:** Black armor, red eyes, purple aura

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 흑기사 (Black Knight) | Full black armor |
| 1 | 타락한 성기사 (Fallen Paladin) | Corrupted gold |
| 2 | 망령 기사 (Specter Knight) | Ghostly |
| 3 | 사신 기사 (Death Knight) | Skull helmet |
| 4 | 타락 검사 (Fallen Swordsman) | Dark blade |
| 5 | 어둠 기사 (Dark Knight) | Shadow armor |
| 6 | 죽음의 기사 (Knight of Death) | Bone details |
| 7 | 타락한 십자군 (Fallen Crusader) | Broken cross |
| 8 | 복수의 기사 (Vengeful Knight) | Red accents |
| 9 | 저주받은 기사 (Cursed Knight) | Cursed symbols |
| boss | 타락의 기사단장 (Fallen Knight Commander) | Grand, corrupted |

---

### Floor 86-90: Ancient Ruins (고대 유적)
- **Theme:** Rune scripts, golden statues
- **Signature Color:** Gold/Bronze `#CD7F32`
- **Monster Colors:** Gold, teal runes, stone

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 고대 골렘 (Ancient Golem) | Stone + gold |
| 1 | 룬 수호자 (Rune Guardian) | Glowing runes |
| 2 | 마법 파수꾼 (Magic Sentinel) | Energy shields |
| 3 | 석판 골렘 (Tablet Golem) | Inscribed stone |
| 4 | 마법 석상 (Magic Statue) | Animated |
| 5 | 고대 전사 (Ancient Warrior) | Old armor |
| 6 | 룬 정령 (Rune Spirit) | Floating runes |
| 7 | 마법진 수호자 (Circle Guardian) | Magic circles |
| 8 | 고대 마법사 (Ancient Mage) | Old robes |
| 9 | 유적 골렘 (Ruin Golem) | Crumbling stone |
| boss | 고대 마법사왕 (Ancient Mage King) | Crown, powerful |

---

### Floor 91-95: Dragon Tomb (용의 무덤)
- **Theme:** Giant dragon bones, darkness
- **Signature Color:** Bone/Black `#2F2F2F`
- **Monster Colors:** Bone white, purple souls, black smoke

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 본 드래곤 (Bone Dragon) | Skeleton dragon |
| 1 | 드래곤 리치 (Dragon Lich) | Undead mage |
| 2 | 용혼의 파수꾼 (Dragon Soul Guardian) | Soul energy |
| 3 | 해골 용 (Skeleton Dragon) | Pure bone |
| 4 | 망령 와이번 (Specter Wyvern) | Ghostly |
| 5 | 용 언데드 (Dragon Undead) | Rotting dragon |
| 6 | 용혼 전사 (Dragon Soul Warrior) | Soul armor |
| 7 | 뼈 드레이크 (Bone Drake) | Skeletal drake |
| 8 | 용의 저주 (Dragon's Curse) | Curse entity |
| 9 | 용혼 악령 (Dragon Evil Spirit) | Dark soul |
| boss | 고룡의 망령 (Ancient Dragon Specter) | Massive ghost dragon |

---

### Floor 96-100: End of Abyss (심연의 끝)
- **Theme:** Complete darkness, rifts
- **Signature Color:** Pure Black `#000000`
- **Monster Colors:** Black + purple/red glow

| Index | Monster Name | Color Suggestion |
|-------|--------------|------------------|
| 0 | 심연의 괴수 (Abyss Monster) | Black mass |
| 1 | 공포의 화신 (Avatar of Fear) | Terror form |
| 2 | 혼돈의 군주 (Lord of Chaos) | Chaotic energy |
| 3 | 어둠의 지배자 (Dark Ruler) | Pure darkness |
| 4 | 공허의 포식자 (Void Devourer) | Consuming darkness |
| 5 | 종말의 사자 (Harbinger of End) | Ominous |
| 6 | 심연 악마 (Abyss Demon) | Deep void |
| 7 | 절망의 괴물 (Despair Monster) | Sorrowful |
| 8 | 파멸의 화신 (Avatar of Destruction) | Destructive energy |
| 9 | 무의 지배자 (Lord of Nothing) | Empty void |
| boss | 심연의 지배자 (Lord of Abyss) | Ultimate darkness |

---

## Glow Effects (Applied Automatically)

**Rare Monsters:** Purple glow effect
```css
filter: drop-shadow(0 0 8px #A855F7) drop-shadow(0 0 16px #A855F7);
transform: scale(1.05);
```

**Legendary Monsters:** Gold glow + pulse animation
```css
filter: drop-shadow(0 0 12px #FFD700) drop-shadow(0 0 24px #FFA500);
transform: scale(1.1);
animation: pulse;
```

No separate images needed for Rare/Legendary - they use the same monster images with CSS effects!

---

## Quick Checklist

Per region, you need:
- [ ] 1 background image (800x192)
- [ ] 10 normal monster images (64x80 each, named 0.png ~ 9.png)
- [ ] 1 boss image (96x112, named boss.png)
- [ ] Player character (64x80, only need one)

**Total images needed:**
- 20 backgrounds
- 200 normal monsters (20 regions x 10)
- 20 bosses
- 1 player
= **241 images total**
