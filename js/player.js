/**
 * 玩家类
 */

class Player {
    constructor(id, name, faction) {
        this.id = id;
        this.name = name;
        this.faction = faction; // 'uppercase' 或 'lowercase'
        this.handPieces = [];   // 手牌
        this.reservePiles = []; // 备战区（堆叠的棋子）
        this.isAI = false;
    }

    /**
     * 设置初始手牌
     * @param {string[]} pieces
     */
    setHand(pieces) {
        this.handPieces = [...pieces];
    }

    /**
     * 从手牌中移除棋子
     * @param {string[]} piecesToRemove
     */
    removeFromHand(piecesToRemove) {
        for (const piece of piecesToRemove) {
            const index = this.handPieces.indexOf(piece);
            if (index !== -1) {
                this.handPieces.splice(index, 1);
            }
        }
    }

    /**
     * 获取手牌中指定棋子的数量
     * @param {string} piece
     * @returns {number}
     */
    countPiece(piece) {
        return this.handPieces.filter(p => p === piece).length;
    }

    /**
     * 检查是否有足够的棋子出牌
     * @param {string[]} pieces
     * @returns {boolean}
     */
    canPlay(pieces) {
        const tempHand = [...this.handPieces];
        for (const piece of pieces) {
            const index = tempHand.indexOf(piece);
            if (index === -1) return false;
            tempHand.splice(index, 1);
        }
        return true;
    }

    /**
     * 获取所有可能的成型出牌组合
     * @param {number} count - 出牌数量 (1, 2, 或 3)
     * @returns {string[][]}
     */
    getValidFormations(count) {
        const formations = [];
        const hand = this.handPieces;

        if (count === 1) {
            // 单个出牌
            return hand.map(p => [p]);
        }

        if (count === 2) {
            // 成对出牌
            const counts = {};
            for (const p of hand) {
                counts[p] = (counts[p] || 0) + 1;
            }

            for (const [piece, cnt] of Object.entries(counts)) {
                if (cnt >= 2 && piece.toUpperCase() !== 'A') {
                    formations.push([piece, piece]);
                }
            }
            return formations;
        }

        if (count === 3) {
            // 顺子出牌
            const upperPieces = hand.filter(p => p === p.toUpperCase());
            const lowerPieces = hand.filter(p => p === p.toLowerCase());

            // 检查ABC
            const hasA = upperPieces.includes('A');
            const hasB = upperPieces.filter(p => p === 'B').length > 0;
            const hasC = upperPieces.filter(p => p === 'C').length > 0;
            if (hasA && hasB && hasC) {
                formations.push(['A', 'B', 'C']);
            }

            // 检查DEF
            const hasD = upperPieces.filter(p => p === 'D').length > 0;
            const hasE = upperPieces.filter(p => p === 'E').length > 0;
            const hasF = upperPieces.filter(p => p === 'F').length > 0;
            if (hasD && hasE && hasF) {
                formations.push(['D', 'E', 'F']);
            }

            // 检查abc
            const hasa = lowerPieces.includes('a');
            const hasb = lowerPieces.filter(p => p === 'b').length > 0;
            const hasc = lowerPieces.filter(p => p === 'c').length > 0;
            if (hasa && hasb && hasc) {
                formations.push(['a', 'b', 'c']);
            }

            // 检查def
            const hasd = lowerPieces.filter(p => p === 'd').length > 0;
            const hase = lowerPieces.filter(p => p === 'e').length > 0;
            const hasf = lowerPieces.filter(p => p === 'f').length > 0;
            if (hasd && hase && hasf) {
                formations.push(['d', 'e', 'f']);
            }

            return formations;
        }

        return formations;
    }

    /**
     * 添加棋子到备战区
     * @param {string[]} winnerPieces - 赢家的棋子
     * @param {string[]} loserPieces - 输家的棋子
     */
    addToReserve(winnerPieces, loserPieces = []) {
        // 按顺序配对：赢家的第一个牌和输家的第一个牌组成一堆
        // 赢家的牌在上方（第一个位置）
        const maxLen = Math.max(winnerPieces.length, loserPieces.length);

        for (let i = 0; i < maxLen; i++) {
            const pile = [];
            // 赢家的牌在上方
            if (i < winnerPieces.length) {
                pile.push(winnerPieces[i]);
            }
            // 输家的牌在下方
            if (i < loserPieces.length) {
                pile.push(loserPieces[i]);
            }
            if (pile.length > 0) {
                this.reservePiles.push(pile);
            }
        }
    }

    /**
     * 从备战区移除堆
     * @param {number[]} pileIndices
     */
    removeFromReserve(pileIndices) {
        // 从后往前删除，避免索引问题
        const sorted = [...pileIndices].sort((a, b) => b - a);
        for (const index of sorted) {
            this.reservePiles.splice(index, 1);
        }
    }

    /**
     * 从备战区取出N堆，返回到手牌
     * @param {number} count - 要取出的堆数
     * @returns {string[]} 取出的所有棋子
     */
    extractPilesToHand(count) {
        const extractedPieces = [];
        const maxCount = Math.min(count, this.reservePiles.length);

        for (let i = 0; i < maxCount; i++) {
            const pile = this.reservePiles[0]; // 始终取第一堆（从左到右）
            extractedPieces.push(...pile);
            this.reservePiles.shift(); // 移除第一堆
        }

        // 添加到手牌
        this.handPieces.push(...extractedPieces);

        return extractedPieces;
    }

    /**
     * 手牌是否为空
     * @returns {boolean}
     */
    isHandEmpty() {
        return this.handPieces.length === 0;
    }

    /**
     * 备战区是否为空
     * @returns {boolean}
     */
    isReserveEmpty() {
        return this.reservePiles.length === 0;
    }

    /**
     * 是否完全失败（手牌和备战区都为空）
     * @returns {boolean}
     */
    hasLost() {
        return this.isHandEmpty() && this.isReserveEmpty();
    }

    /**
     * 获取手牌数量
     * @returns {number}
     */
    getHandCount() {
        return this.handPieces.length;
    }

    /**
     * 获取备战区堆数
     * @returns {number}
     */
    getReservePileCount() {
        return this.reservePiles.length;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Player };
}
