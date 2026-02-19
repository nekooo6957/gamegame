/**
 * AI 对手逻辑
 */

class AI {
    constructor(difficulty = 'normal') {
        this.difficulty = difficulty; // easy, normal, hard
    }

    /**
     * 设置难度
     * @param {string} difficulty - easy, normal, hard
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
    }

    /**
     * 获取难度描述
     * @returns {object}
     */
    static getDifficultyInfo() {
        return {
            easy: { name: '简单', description: 'AI随机出牌，适合新手' },
            normal: { name: '普通', description: 'AI有一定策略，正常难度' },
            hard: { name: '困难', description: 'AI精心计算，极具挑战' }
        };
    }

    /**
     * 分析手牌
     * @param {Player} aiPlayer
     * @param {Player} opponent
     * @returns {object}
     */
    analyzeHand(aiPlayer, opponent) {
        const hand = aiPlayer.handPieces;

        // 统计各等级棋子数量
        const counts = {};
        for (const p of hand) {
            counts[p] = (counts[p] || 0) + 1;
        }

        // 找出最佳顺子
        let bestSequence = null;
        const sequences = aiPlayer.getValidFormations(3);
        if (sequences.length > 0) {
            bestSequence = sequences.reduce((best, seq) => {
                const seqRanks = { 'ABC': 4, 'abc': 3, 'DEF': 2, 'def': 1 };
                const getSeqKey = (pieces) => [...pieces].sort().join('');
                const bestRank = seqRanks[getSeqKey(best)] || 0;
                const seqRank = seqRanks[getSeqKey(seq)] || 0;
                return seqRank > bestRank ? seq : best;
            });
        }

        // 计算手牌总强度
        const totalStrength = hand.reduce((sum, p) => sum + PIECE_RANKS[p], 0);

        // 计算高等级牌数量
        const highCards = hand.filter(p => PIECE_RANKS[p] >= 10).length;

        return {
            counts,
            bestSequence,
            totalStrength,
            highCards,
            handSize: hand.length
        };
    }

    /**
     * AI决定出牌数量（手牌阶段）
     * @param {Player} aiPlayer - AI玩家
     * @param {Player} opponent - 对手
     * @returns {number} 出牌数量 1/2/3
     */
    decidePlayCount(aiPlayer, opponent) {
        const validCounts = [];

        // 检查哪些出牌数量有有效组合
        for (let count = 1; count <= 3; count++) {
            if (aiPlayer.getValidFormations(count).length > 0) {
                validCounts.push(count);
            }
        }

        if (validCounts.length === 0) {
            return 1; // 默认出1张
        }

        // 根据难度选择策略
        if (this.difficulty === 'easy') {
            // 简单：随机选择
            return validCounts[Math.floor(Math.random() * validCounts.length)];
        }

        if (this.difficulty === 'normal') {
            // 普通：优先出大牌
            // 检查是否有顺子（最强的出牌方式）
            if (validCounts.includes(3)) {
                return 3;
            }
            // 检查是否有成对
            if (validCounts.includes(2)) {
                return 2;
            }
            return 1;
        }

        if (this.difficulty === 'hard') {
            // 困难：根据手牌情况和对手手牌选择最优策略
            const analysis = this.analyzeHand(aiPlayer, opponent);

            // 如果对手手牌少，考虑快速结束
            if (opponent.handPieces.length <= 3) {
                // 优先用大牌压制
                if (validCounts.includes(3)) return 3;
                if (validCounts.includes(2)) return 2;
            }

            // 根据手牌分析选择最佳策略
            if (analysis.bestSequence && analysis.bestSequence.includes('A')) {
                return 3; // 有ABC，优先出
            }

            // 检查是否有强力成对
            if (validCounts.includes(2)) {
                const pairs = aiPlayer.getValidFormations(2);
                const hasStrongPair = pairs.some(p => PIECE_RANKS[p[0]] >= 10); // B或以上
                if (hasStrongPair) return 2;
            }

            // 优先使用顺子
            if (validCounts.includes(3)) {
                return 3;
            }

            // 检查成对
            if (validCounts.includes(2)) {
                return 2;
            }

            return 1;
        }

        return validCounts[0];
    }

    /**
     * AI选择出牌（先手）
     * @param {Player} aiPlayer
     * @param {number} count
     * @returns {string[]} 出牌组合
     */
    selectFirstPlayerPieces(aiPlayer, count) {
        const formations = aiPlayer.getValidFormations(count);

        if (formations.length === 0) {
            return null;
        }

        if (this.difficulty === 'easy') {
            // 随机选择
            return formations[Math.floor(Math.random() * formations.length)];
        }

        // 按强度排序，选择最强的
        formations.sort((a, b) => {
            // 顺子优先
            if (count === 3) {
                const seqRanks = { 'ABC': 4, 'abc': 3, 'DEF': 2, 'def': 1 };
                const getSeqKey = (pieces) => [...pieces].sort().join('');
                return (seqRanks[getSeqKey(b)] || 0) - (seqRanks[getSeqKey(a)] || 0);
            }
            // 其他按第一个棋子等级
            return PIECE_RANKS[b[0]] - PIECE_RANKS[a[0]];
        });

        if (this.difficulty === 'normal') {
            // 70%选最优，30%随机
            if (Math.random() < 0.7) {
                return formations[0];
            }
            return formations[Math.floor(Math.random() * formations.length)];
        }

        // hard：选最优
        return formations[0];
    }

    /**
     * AI选择出牌（后手）
     * @param {Player} aiPlayer
     * @param {string[]} opponentPieces - 对手出的牌
     * @param {number} count
     * @returns {string[]} 出牌组合
     */
    selectSecondPlayerPieces(aiPlayer, opponentPieces, count) {
        // 获取所有可能的出牌组合
        const allCombinations = this.getAllCombinations(aiPlayer.handPieces, count);

        if (allCombinations.length === 0) {
            return null;
        }

        // 筛选出成型牌
        const formedCombinations = allCombinations.filter(combo => isFormedCards(combo));

        if (this.difficulty === 'easy') {
            // 简单：随机选择
            return allCombinations[Math.floor(Math.random() * allCombinations.length)];
        }

        // 找出能赢的成型牌
        const winningCombinations = formedCombinations.filter(combo =>
            comparePieces(combo, opponentPieces) > 0
        );

        if (winningCombinations.length > 0) {
            // 有能赢的牌，选择其中最小的（节省大牌）
            winningCombinations.sort((a, b) => {
                const aMin = Math.min(...a.map(p => PIECE_RANKS[p]));
                const bMin = Math.min(...b.map(p => PIECE_RANKS[p]));
                return aMin - bMin;
            });

            if (this.difficulty === 'hard') {
                return winningCombinations[0];
            }
            // normal：可能随机选
            if (Math.random() < 0.8) {
                return winningCombinations[0];
            }
            return winningCombinations[Math.floor(Math.random() * winningCombinations.length)];
        }

        // 没有能赢的成型牌，判断是否要出混合牌（弃牌）
        if (formedCombinations.length === 0 || this.shouldSurrender(aiPlayer, opponentPieces)) {
            // 出最小的混合牌
            return this.getSmallestCombination(allCombinations);
        }

        // 出最小的成型牌（尽量减少损失）
        return this.getSmallestCombination(formedCombinations);
    }

    /**
     * 判断是否应该弃牌（出混合牌）
     * @param {Player} aiPlayer
     * @param {string[]} opponentPieces
     * @returns {boolean}
     */
    shouldSurrender(aiPlayer, opponentPieces) {
        // 对手出的是大牌时，考虑弃牌
        const opponentStrength = Math.max(...opponentPieces.map(p => PIECE_RANKS[p]));

        if (this.difficulty === 'hard') {
            // 困难：对手出A时弃牌保留实力
            return opponentStrength >= 12; // A的等级
        }

        return false;
    }

    /**
     * 获取所有组合
     * @param {string[]} pieces
     * @param {number} count
     * @returns {string[][]}
     */
    getAllCombinations(pieces, count) {
        const result = [];

        const combine = (start, current) => {
            if (current.length === count) {
                result.push([...current]);
                return;
            }

            for (let i = start; i < pieces.length; i++) {
                // 跳过重复（同一位置的棋子）
                current.push(pieces[i]);
                combine(i + 1, current);
                current.pop();
            }
        };

        combine(0, []);
        return result;
    }

    /**
     * 获取最小的组合
     * @param {string[][]} combinations
     * @returns {string[]}
     */
    getSmallestCombination(combinations) {
        if (combinations.length === 0) return null;

        return combinations.reduce((min, combo) => {
            const minSum = min.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
            const comboSum = combo.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
            return comboSum < minSum ? combo : min;
        });
    }

    /**
     * 备战区阶段：AI选择出牌数量
     * @param {Player} aiPlayer
     * @param {Player} opponent
     * @returns {number}
     */
    decideReservePlayCount(aiPlayer, opponent) {
        const maxCount = Math.min(
            aiPlayer.reservePiles.length,
            opponent.reservePiles.length,
            3
        );

        if (maxCount === 0) return 1;

        if (this.difficulty === 'easy') {
            return Math.floor(Math.random() * maxCount) + 1;
        }

        // 分析自己的堆和对手的堆
        // 选择能赢的最大堆数
        for (let count = maxCount; count >= 1; count--) {
            // 简化：优先出多的
            return count;
        }

        return 1;
    }

    /**
     * 备战区阶段：AI选择出哪些堆
     * @param {Player} aiPlayer
     * @param {number} count
     * @param {string[]} opponentPieces - 对手出的牌（如果是后手）
     * @returns {number[]} 堆索引
     */
    selectReservePiles(aiPlayer, count, opponentPieces = null) {
        const pileCount = aiPlayer.reservePiles.length;
        const indices = [];

        // 简化：选择前count堆（从左到右）
        for (let i = 0; i < count && i < pileCount; i++) {
            indices.push(i);
        }

        return indices;
    }

    /**
     * 执行AI回合（手牌阶段，先手）
     * @param {Game} game
     * @returns {object} 决策结果
     */
    executeFirstPlayerTurn(game) {
        const aiPlayer = game.currentPlayer;
        const opponent = game.waitingPlayer;

        // 决定出牌数量
        const count = this.decidePlayCount(aiPlayer, opponent);
        game.setPlayCount(count);

        // 选择出牌
        const pieces = this.selectFirstPlayerPieces(aiPlayer, count);

        return { count, pieces };
    }

    /**
     * 执行AI回合（手牌阶段，后手）
     * @param {Game} game
     * @returns {string[]} 出牌
     */
    executeSecondPlayerTurn(game) {
        const aiPlayer = game.waitingPlayer;
        const opponentPieces = game.firstPlayerPieces;
        const count = game.currentPlayCount;

        return this.selectSecondPlayerPieces(aiPlayer, opponentPieces, count);
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AI };
}
