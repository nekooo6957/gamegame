/**
 * 游戏主逻辑
 */

class Game {
    constructor() {
        this.player1 = null;
        this.player2 = null;
        this.currentPlayer = null;   // 当前先手玩家
        this.waitingPlayer = null;   // 当前后手玩家
        this.phase = 'setup';        // setup, rockPaperScissors, hand, reserve, ended
        this.reserveSubPhase = 'select'; // 备战区子阶段: select(选择堆数), play(手牌对战)
        this.roundNumber = 0;
        this.currentPlayCount = 0;   // 当前回合出牌数量
        this.firstPlayerPieces = []; // 先手玩家出的牌
        this.secondPlayerPieces = []; // 后手玩家出的牌
        this.winner = null;
        this.gameLog = [];

        // 回调函数
        this.onStateChange = null;
        this.onRoundEnd = null;
        this.onGameEnd = null;
    }

    /**
     * 初始化游戏
     * @param {string} player1Name
     * @param {string} player2Name
     * @param {boolean} player2IsAI
     */
    init(player1Name = '玩家1', player2Name = '玩家2', player2IsAI = false) {
        this.player1 = new Player(1, player1Name, 'uppercase');
        this.player2 = new Player(2, player2Name, 'lowercase');
        this.player2.isAI = player2IsAI;

        // 分配棋子
        const { player1, player2 } = shufflePieces();
        this.player1.setHand(player1);
        this.player2.setHand(player2);

        this.phase = 'rockPaperScissors';
        this.roundNumber = 0;
        this.winner = null;
        this.gameLog = [];

        this.log('游戏开始！');
        this.log(`${player1Name} 获得 ${this.player1.getHandCount()} 个棋子`);
        this.log(`${player2Name} 获得 ${this.player2.getHandCount()} 个棋子`);

        this.notifyStateChange();
    }

    /**
     * 猜拳结果
     * @param {number} winnerId - 获胜玩家ID (1 或 2)
     */
    setRockPaperScissorsWinner(winnerId) {
        if (this.phase !== 'rockPaperScissors') return;

        if (winnerId === 1) {
            this.currentPlayer = this.player1;
            this.waitingPlayer = this.player2;
        } else {
            this.currentPlayer = this.player2;
            this.waitingPlayer = this.player1;
        }

        this.phase = 'hand';
        this.roundNumber = 1;

        this.log(`猜拳结束，${this.currentPlayer.name} 先手`);
        this.notifyStateChange();
    }

    /**
     * 先手玩家决定出牌数量
     * @param {number} count - 1, 2, 或 3
     * @returns {boolean} 是否成功
     */
    setPlayCount(count) {
        if (this.phase !== 'hand' && !(this.phase === 'reserve' && this.reserveSubPhase === 'play')) return false;

        // 检查玩家是否有足够的牌
        if (this.currentPlayer.handPieces.length < count) {
            this.log(`${this.currentPlayer.name} 牌不够出 ${count} 张`);
            return false;
        }

        // 检查是否有有效的成型组合
        const formations = this.currentPlayer.getValidFormations(count);
        if (formations.length === 0) {
            this.log(`${this.currentPlayer.name} 没有有效的 ${count} 张成型组合`);
            return false;
        }

        this.currentPlayCount = count;
        this.log(`${this.currentPlayer.name} 决定出 ${count} 张牌`);

        this.notifyStateChange();
        return true;
    }

    /**
     * 先手玩家出牌
     * @param {string[]} pieces
     * @returns {boolean}
     */
    firstPlayerPlay(pieces) {
        const canPlay = this.phase === 'hand' || (this.phase === 'reserve' && this.reserveSubPhase === 'play');
        if (!canPlay || this.currentPlayCount === 0) return false;
        if (pieces.length !== this.currentPlayCount) return false;

        // 检查是否拥有这些牌
        if (!this.currentPlayer.canPlay(pieces)) {
            this.log('没有这些牌');
            return false;
        }

        // 检查是否为成型牌
        if (!isFormedCards(pieces)) {
            this.log('必须出成型牌');
            return false;
        }

        this.firstPlayerPieces = pieces;
        this.currentPlayer.removeFromHand(pieces);

        this.log(`${this.currentPlayer.name} 出牌: ${pieces.join(' ')}`);

        this.notifyStateChange();
        return true;
    }

    /**
     * 后手玩家出牌
     * @param {string[]} pieces
     * @returns {boolean}
     */
    secondPlayerPlay(pieces) {
        const canPlay = this.phase === 'hand' || (this.phase === 'reserve' && this.reserveSubPhase === 'play');
        if (!canPlay || this.firstPlayerPieces.length === 0) return false;
        if (pieces.length !== this.currentPlayCount) return false;

        // 检查是否拥有这些牌
        if (!this.waitingPlayer.canPlay(pieces)) {
            this.log('没有这些牌');
            return false;
        }

        this.secondPlayerPieces = pieces;
        this.waitingPlayer.removeFromHand(pieces);

        this.log(`${this.waitingPlayer.name} 出牌: ${pieces.join(' ')}`);

        // 结算回合
        this.resolveRound();

        return true;
    }

    /**
     * 结算回合
     */
    resolveRound() {
        const result = comparePieces(this.firstPlayerPieces, this.secondPlayerPieces);

        let roundWinner = null;
        let roundLoser = null;
        let winnerPieces = [];
        let loserPieces = [];

        if (result > 0) {
            roundWinner = this.currentPlayer;
            roundLoser = this.waitingPlayer;
            winnerPieces = [...this.firstPlayerPieces];
            loserPieces = [...this.secondPlayerPieces];
        } else if (result < 0) {
            roundWinner = this.waitingPlayer;
            roundLoser = this.currentPlayer;
            winnerPieces = [...this.secondPlayerPieces];
            loserPieces = [...this.firstPlayerPieces];
        } else {
            // 平局 - 先手玩家胜
            roundWinner = this.currentPlayer;
            roundLoser = this.waitingPlayer;
            winnerPieces = [...this.firstPlayerPieces];
            loserPieces = [...this.secondPlayerPieces];
            this.log('平局！先手玩家获胜');
        }

        // 赢家加入备战区（赢家牌在上方）
        roundWinner.addToReserve(winnerPieces, loserPieces);

        const totalPieces = winnerPieces.length + loserPieces.length;
        this.log(`${roundWinner.name} 赢得本回合！获得 ${totalPieces} 个棋子`);

        // 设置下一回合先手（赢家先手）
        if (roundWinner === this.player1) {
            this.currentPlayer = this.player1;
            this.waitingPlayer = this.player2;
        } else {
            this.currentPlayer = this.player2;
            this.waitingPlayer = this.player1;
        }

        // 重置回合状态
        this.firstPlayerPieces = [];
        this.secondPlayerPieces = [];
        this.currentPlayCount = 0;

        // 检查当前阶段并决定下一步
        if (this.phase === 'hand') {
            // 手牌阶段：检查是否进入备战区阶段
            if (this.player1.isHandEmpty() && this.player2.isHandEmpty()) {
                this.phase = 'reserve';
                this.reserveSubPhase = 'select';
                this.log('--- 进入备战区对战阶段 ---');
                this.log(`${this.player1.name} 备战区: ${this.player1.getReservePileCount()} 堆`);
                this.log(`${this.player2.name} 备战区: ${this.player2.getReservePileCount()} 堆`);
            } else {
                this.roundNumber++;
            }
        } else if (this.phase === 'reserve') {
            // 备战区阶段：检查手牌是否都清空
            if (this.player1.isHandEmpty() && this.player2.isHandEmpty()) {
                // 双方手牌都清空，检查是否继续备战区对战
                if (this.player1.isReserveEmpty() || this.player2.isReserveEmpty()) {
                    // 一方备战区为空，检查游戏结束
                    if (this.checkGameEnd()) {
                        return;
                    }
                } else {
                    // 双方备战区都有牌，回到选择堆数阶段
                    this.reserveSubPhase = 'select';
                    this.log('--- 继续备战区对战 ---');
                }
            }
            // 如果手牌没清空，继续当前对战（保持在 'play' 子阶段）
        }

        // 检查胜负
        if (this.checkGameEnd()) {
            return;
        }

        if (this.onRoundEnd) {
            this.onRoundEnd(roundWinner, roundLoser, result);
        }

        this.notifyStateChange();
    }

    /**
     * 备战区阶段：先手玩家选择堆数并提取到手牌
     * @param {number} count
     * @returns {boolean}
     */
    setReservePlayCount(count) {
        if (this.phase !== 'reserve' || this.reserveSubPhase !== 'select') return false;

        // 检查双方是否有足够的堆
        if (this.currentPlayer.reservePiles.length < count) {
            this.log(`${this.currentPlayer.name} 备战区不够 ${count} 堆`);
            return false;
        }

        if (this.waitingPlayer.reservePiles.length < count) {
            this.log(`${this.waitingPlayer.name} 备战区不够 ${count} 堆`);
            return false;
        }

        this.currentPlayCount = count;
        this.log(`${this.currentPlayer.name} 决定出 ${count} 堆`);

        // 双方从备战区提取N堆到手牌
        const firstPlayerPieces = this.currentPlayer.extractPilesToHand(count);
        const secondPlayerPieces = this.waitingPlayer.extractPilesToHand(count);

        this.log(`${this.currentPlayer.name} 从备战区提取 ${firstPlayerPieces.length} 张牌到手牌`);
        this.log(`${this.waitingPlayer.name} 从备战区提取 ${secondPlayerPieces.length} 张牌到手牌`);

        // 切换到手牌对战子阶段
        this.reserveSubPhase = 'play';
        this.currentPlayCount = 0; // 重置，等待先手玩家决定出牌数量

        this.notifyStateChange();
        return true;
    }

    /**
     * 检查游戏是否结束
     * @returns {boolean}
     */
    checkGameEnd() {
        if (this.player1.hasLost()) {
            this.winner = this.player2;
            this.phase = 'ended';
            this.log(`游戏结束！${this.player2.name} 获胜！`);
            this.log(`${this.player1.name} 的公司被吞并了...`);

            if (this.onGameEnd) {
                this.onGameEnd(this.player2, this.player1);
            }

            this.notifyStateChange();
            return true;
        }

        if (this.player2.hasLost()) {
            this.winner = this.player1;
            this.phase = 'ended';
            this.log(`游戏结束！${this.player1.name} 获胜！`);
            this.log(`${this.player2.name} 的公司被吞并了...`);

            if (this.onGameEnd) {
                this.onGameEnd(this.player1, this.player2);
            }

            this.notifyStateChange();
            return true;
        }

        return false;
    }

    /**
     * 获取当前状态
     * @returns {object}
     */
    getState() {
        return {
            phase: this.phase,
            reserveSubPhase: this.reserveSubPhase,
            roundNumber: this.roundNumber,
            currentPlayerId: this.currentPlayer?.id,
            waitingPlayerId: this.waitingPlayer?.id,
            currentPlayCount: this.currentPlayCount,
            firstPlayerPieces: this.firstPlayerPieces,
            secondPlayerPieces: this.secondPlayerPieces,
            player1: {
                id: this.player1?.id,
                name: this.player1?.name,
                handCount: this.player1?.getHandCount(),
                reservePileCount: this.player1?.getReservePileCount(),
                isAI: this.player1?.isAI,
                hand: this.player1?.handPieces || [],
                reserve: this.player1?.reservePiles || []
            },
            player2: {
                id: this.player2?.id,
                name: this.player2?.name,
                handCount: this.player2?.getHandCount(),
                reservePileCount: this.player2?.getReservePileCount(),
                isAI: this.player2?.isAI,
                hand: this.player2?.handPieces || [],
                reserve: this.player2?.reservePiles || []
            },
            winner: this.winner?.id,
            gameLog: this.gameLog
        };
    }

    /**
     * 记录日志
     * @param {string} message
     */
    log(message) {
        this.gameLog.push(message);
        console.log(`[Game] ${message}`);
    }

    /**
     * 通知状态变化
     */
    notifyStateChange() {
        if (this.onStateChange) {
            this.onStateChange(this.getState());
        }
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Game };
}
