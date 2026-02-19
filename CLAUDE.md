# 输出语言
始终以中文与我对话

# 称呼规则
每次回复前必须使用“nekooo”作为称呼

# 决策确认
遇到不确定的代码设计问题时，必须先询问nekooo，不得直接行动

# 代码兼容性
不能写兼容性代码，除非nekooo主动要求

# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

**职场大乱斗 (Workplace Battle)** - 一款以职场挖人为主题的双人对战棋牌游戏。纯前端实现 (HTML + CSS + JavaScript)，无需构建步骤。

## 运行项目

直接在浏览器中打开 `index.html`，或使用任意静态文件服务器：
```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .
```

## 架构概览

### 核心类 (js/)

| 文件 | 类 | 职责 |
|------|-----|------|
| `game.js` | `Game` | 状态机，管理游戏阶段、回合、回调 |
| `player.js` | `Player` | 手牌/备战区管理、成型验证 |
| `pieces.js` | - | 棋子定义、比较规则、洗牌 |
| `ui.js` | `UI` | DOM交互、事件处理、渲染 |
| `ai.js` | `AI` | 三种难度的AI策略 |

### 游戏流程

```
setup → rockPaperScissors → hand → reserve → ended
```

- **hand 阶段**: 玩家使用手牌（各11张）
- **reserve 阶段**: 玩家使用备战区的堆叠

### 关键数据结构

```javascript
// 玩家状态
handPieces: string[]      // 如 ['A', 'B', 'B', 'C', ...]
reservePiles: string[][]  // 如 [['B', 'c'], ['B', 'd']] - 赢家的牌在前

// 游戏状态
currentPlayer: Player     // 本回合先手玩家
waitingPlayer: Player     // 本回合后手玩家
firstPlayerPieces: string[]   // 先手出的牌
secondPlayerPieces: string[]  // 后手出的牌
```

## 游戏规则（详细版见 plan_gamerule.md）

### 棋子等级（从大到小）
| 等级 | A公司（男性） | a公司（女性） | 职位 |
|------|-------------|-------------|------|
| 12 | A (男CEO) | a (女CEO) | 首席执行官 |
| 10 | B (男副总裁) | b (女副总裁) | 副总裁 |
| 8 | C (男总监) | c (女总监) | 总监 |
| 6 | D (男经理) | d (女经理) | 经理 |
| 4 | E (男资深) | e (女资深) | 资深员工 |
| 2 | F (男新人) | f (女新人) | 新人 |

- 同等级：男性 > 女性（如 A > a, B > b）
- 跨等级：高等级 > 低等级

### 有效成型
- **单张**: 任意牌
- **成对**: 两张完全相同的牌（BB, bb, CC, cc...）- **不能是AA或aa**（每家公司只有1张CEO）
- **顺子**: 必须是同一公司（全男性或全女性）
  - ABC/abc（高管组：CEO+副总裁+总监）
  - DEF/def（基层组：经理+资深+新人）

### 手牌对战阶段规则
- **先手玩家**: 必须出成型牌，决定出牌数量（1/2/3张）
- **后手玩家**: 必须出相同数量，可以出混合牌（必败）
- **平局**: 先手玩家胜
- **赢家**: 获得所有牌加入备战区，下回合先手

### 备战区对战阶段规则（重要！）

**备战区结构：**
- 每堆包含2张牌（赢家牌在上，输家牌在下）
- 只能看到顶牌，底牌隐藏

**每轮流程：**

1. **选择堆数（先手决定）**
   - 先手玩家选择出1堆、2堆或3堆
   - 双方必须都有足够的堆

2. **提取到手牌**
   - 双方自动从备战区左侧提取相应堆数的牌到手牌
   - 提取的牌只有自己能看到

3. **手牌对战（按手牌对战阶段规则）**
   - 先手玩家决定出牌方式（单张/成对/顺子）
   - 先手玩家出牌（必须成型）
   - 后手玩家出牌（相同数量）
   - 翻牌结算，赢家获得所有牌
   - **重复此步骤直到手牌清空**

4. **循环**
   - 如果双方备战区都还有牌，回到步骤1
   - 如果一方备战区为空，检查游戏结束

## 关键实现细节

### 备战区阶段状态
```javascript
// game.js
this.reserveSubPhase = 'select'; // 'select'(选择堆数) 或 'play'(手牌对战)
```

### 备战区堆叠顺序
赢家的牌始终在每堆的索引0位置：
```javascript
// player.js addToReserve()
pile.push(winnerPieces[i]);  // 索引0 - 可见（顶牌）
pile.push(loserPieces[i]);   // 索引1 - 隐藏（底牌）
```

### 备战区提取到手牌
```javascript
// player.js extractPilesToHand(count)
// 从备战区左侧提取N堆到手牌
for (let i = 0; i < count; i++) {
    const pile = this.reservePiles[0];
    extractedPieces.push(...pile);
    this.reservePiles.shift();
}
this.handPieces.push(...extractedPieces);
```

### 备战区阶段流程
1. `setReservePlayCount(count)` - 先手选择堆数，双方提取到手牌
2. `reserveSubPhase` 切换为 'play'
3. 使用 `setPlayCount()` 和 `firstPlayerPlay()`/`secondPlayerPlay()` 进行手牌对战
4. 对战结束后检查是否继续或回到 'select'

### 多堆比较逻辑
当比较4或6张牌时（备战区出2-3堆），比较总等级值：
```javascript
// pieces.js comparePieces()
const sum1 = pieces1.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
const sum2 = pieces2.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
return sum1 - sum2;
```

## 玩家与显示映射

- 玩家1（人类）→ `p1-cards-slot`, `p1-reserve-slot`, `p1-reserve-grid`
- 玩家2（AI）→ `p2-cards-slot`, `p2-reserve-slot`, `p2-reserve-grid`

手牌区始终显示玩家1的牌，无论当前是谁的回合。
