/**
 * 在线对战游戏类
 * 继承 Game 类，添加网络同步功能
 */

class OnlineGame extends Game {
    constructor(network) {
        super();
        this.network = network;
        this.localPlayerId = null;  // 本地玩家ID (1或2)
        this.isSynced = false;      // 是否已同步

        // 猜拳相关
        this.localRPSChoice = null;
        this.opponentRPSChoice = null;

        // 回调
        this.onRPSDraw = null;  // 猜拳平局回调

        this.setupNetworkCallbacks();
    }

    /**
     * 设置网络回调
     */
    setupNetworkCallbacks() {
        this.network.onMessage = (message) => {
            this.handleNetworkMessage(message);
        };

        this.network.onDisconnected = () => {
            this.handleDisconnect();
        };
    }

    /**
     * 处理网络消息
     */
    handleNetworkMessage(message) {
        const { type, payload } = message;

        switch (type) {
            case MessageType.GAME_INIT:
                this.handleGameInit(payload);
                break;

            case MessageType.RPS_CHOICE:
                this.handleRPSChoice(payload);
                break;

            case MessageType.RPS_RESULT:
                this.handleRPSResult(payload);
                break;

            case MessageType.PLAY_COUNT:
                this.handlePlayCount(payload);
                break;

            case MessageType.FIRST_PLAY:
                this.handleFirstPlay(payload);
                break;

            case MessageType.SECOND_PLAY:
                this.handleSecondPlay(payload);
                break;

            case MessageType.RESERVE_COUNT:
                this.handleReserveCount(payload);
                break;

            case MessageType.DISCONNECT:
                this.handleOpponentDisconnect();
                break;
        }
    }

    /**
     * 初始化在线游戏
     * @param {string} localName - 本地玩家名称
     * @param {string} remoteName - 远程玩家名称
     * @param {boolean} isHost - 是否是房主
     */
    initOnline(localName, remoteName, isHost) {
        this.localPlayerId = isHost ? 1 : 2;

        if (isHost) {
            // 房主负责发牌和初始化
            this.player1 = new Player(1, localName, 'uppercase');
            this.player2 = new Player(2, remoteName, 'lowercase');

            // 分配棋子
            const { player1, player2 } = shufflePieces();
            this.player1.setHand(player1);
            this.player2.setHand(player2);

            this.phase = 'rockPaperScissors';
            this.roundNumber = 0;
            this.winner = null;
            this.gameLog = [];

            this.log('游戏开始！');
            this.log(`${localName} 获得 ${this.player1.getHandCount()} 个棋子`);
            this.log(`${remoteName} 获得 ${this.player2.getHandCount()} 个棋子`);

            // 发送初始化数据给对方
            this.network.send(MessageType.GAME_INIT, {
                player1Name: localName,
                player2Name: remoteName,
                player1Hand: this.player1.handPieces,
                player2Hand: this.player2.handPieces
            });

            this.notifyStateChange();
        }
        // 挑战者在收到 GAME_INIT 消息时初始化
    }

    /**
     * 处理游戏初始化数据（挑战者调用）
     */
    handleGameInit(payload) {
        const { player1Name, player2Name, player1Hand, player2Hand } = payload;

        // 挑战者是玩家2
        this.player1 = new Player(1, player1Name, 'uppercase');
        this.player2 = new Player(2, player2Name, 'lowercase');

        this.player1.setHand(player1Hand);
        this.player2.setHand(player2Hand);

        this.localPlayerId = 2;
        this.phase = 'rockPaperScissors';
        this.roundNumber = 0;
        this.winner = null;
        this.gameLog = [];

        this.log('游戏开始！');
        this.log(`获得 ${this.player2.getHandCount()} 个棋子`);

        // 发送准备确认
        this.network.send(MessageType.PLAYER_READY);

        this.notifyStateChange();
    }

    /**
     * 在线猜拳 - 发送选择
     * @param {string} choice - 'rock', 'paper', 'scissors'
     */
    sendRPSChoice(choice) {
        this.localRPSChoice = choice;
        this.network.send(MessageType.RPS_CHOICE, { choice });

        // 如果对方已经选了，计算结果（房主负责）
        if (this.opponentRPSChoice && this.network.isHost) {
            this.resolveOnlineRPS();
        }
    }

    /**
     * 处理对方猜拳选择
     */
    handleRPSChoice(payload) {
        this.opponentRPSChoice = payload.choice;

        // 房主负责计算结果
        if (this.network.isHost && this.localRPSChoice) {
            this.resolveOnlineRPS();
        }
    }

    /**
     * 解决在线猜拳
     */
    resolveOnlineRPS() {
        const result = this.compareRPS(this.localRPSChoice, this.opponentRPSChoice);

        let winnerId;
        if (result > 0) {
            winnerId = this.localPlayerId;  // 本地玩家赢
        } else if (result < 0) {
            winnerId = this.localPlayerId === 1 ? 2 : 1;  // 对方赢
        } else {
            winnerId = 0;  // 平局，需要重试
        }

        if (winnerId !== 0) {
            // 发送结果给对方
            this.network.send(MessageType.RPS_RESULT, {
                winnerId,
                player1Choice: this.localPlayerId === 1 ? this.localRPSChoice : this.opponentRPSChoice,
                player2Choice: this.localPlayerId === 1 ? this.opponentRPSChoice : this.localRPSChoice
            });

            // 本地应用结果
            this.setRockPaperScissorsWinner(winnerId);

            // 重置猜拳状态
            this.localRPSChoice = null;
            this.opponentRPSChoice = null;
        } else {
            // 平局，通知UI并重置
            this.network.send(MessageType.RPS_RESULT, {
                winnerId: 0,  // 平局
                player1Choice: this.localPlayerId === 1 ? this.localRPSChoice : this.opponentRPSChoice,
                player2Choice: this.localPlayerId === 1 ? this.opponentRPSChoice : this.localRPSChoice
            });

            // 重置猜拳状态
            this.localRPSChoice = null;
            this.opponentRPSChoice = null;

            // 通知UI平局
            if (this.onRPSDraw) {
                this.onRPSDraw();
            }
        }
    }

    /**
     * 处理猜拳结果
     */
    handleRPSResult(payload) {
        const { winnerId } = payload;

        // 重置猜拳状态
        this.localRPSChoice = null;
        this.opponentRPSChoice = null;

        if (winnerId === 0) {
            // 平局，通知UI
            if (this.onRPSDraw) {
                this.onRPSDraw();
            }
        } else {
            this.setRockPaperScissorsWinner(winnerId);
        }
    }

    /**
     * 比较猜拳
     * @returns {number} 正数=choice1赢，负数=choice2赢，0=平局
     */
    compareRPS(choice1, choice2) {
        if (choice1 === choice2) return 0;

        const wins = {
            'rock': 'scissors',
            'scissors': 'paper',
            'paper': 'rock'
        };

        if (wins[choice1] === choice2) return 1;
        return -1;
    }

    /**
     * 在线设置出牌数量
     */
    onlineSetPlayCount(count) {
        const result = this.setPlayCount(count);
        if (result) {
            this.network.send(MessageType.PLAY_COUNT, { count });
        }
        return result;
    }

    /**
     * 处理出牌数量消息
     */
    handlePlayCount(payload) {
        this.setPlayCount(payload.count);
    }

    /**
     * 在线先手出牌
     */
    onlineFirstPlayerPlay(pieces) {
        const result = this.firstPlayerPlay(pieces);
        if (result) {
            this.network.send(MessageType.FIRST_PLAY, { pieces });
        }
        return result;
    }

    /**
     * 处理先手出牌消息
     */
    handleFirstPlay(payload) {
        // 对方是先手，收到对方的出牌
        if (this.firstPlayerPieces.length === 0) {
            // 从对手手牌中移除（不在本地管理对手手牌时跳过）
            this.firstPlayerPieces = payload.pieces;
            this.notifyStateChange();
        }
    }

    /**
     * 在线后手出牌
     */
    onlineSecondPlayerPlay(pieces) {
        const result = this.secondPlayerPlay(pieces);
        if (result) {
            this.network.send(MessageType.SECOND_PLAY, { pieces });
        }
        return result;
    }

    /**
     * 处理后手出牌消息
     */
    handleSecondPlay(payload) {
        // 对方是后手，收到对方的出牌，然后结算
        if (this.secondPlayerPieces.length === 0 && this.firstPlayerPieces.length > 0) {
            this.secondPlayerPieces = payload.pieces;
            // 执行结算
            this.resolveRoundOnline();
        }
    }

    /**
     * 在线回合结算（接收方调用）
     */
    resolveRoundOnline() {
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

        // 赢家加入备战区
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

        // 检查阶段转换
        if (this.phase === 'hand') {
            if (this.player1.isHandEmpty() && this.player2.isHandEmpty()) {
                this.phase = 'reserve';
                this.reserveSubPhase = 'select';
                this.log('--- 进入备战区对战阶段 ---');
            } else {
                this.roundNumber++;
            }
        } else if (this.phase === 'reserve') {
            if (this.player1.isHandEmpty() && this.player2.isHandEmpty()) {
                if (this.player1.isReserveEmpty() || this.player2.isReserveEmpty()) {
                    if (this.checkGameEnd()) return;
                } else {
                    this.reserveSubPhase = 'select';
                    this.log('--- 继续备战区对战 ---');
                }
            }
        }

        if (this.checkGameEnd()) return;

        if (this.onRoundEnd) {
            this.onRoundEnd(roundWinner, roundLoser, result);
        }

        this.notifyStateChange();
    }

    /**
     * 在线设置备战区堆数
     */
    onlineSetReservePlayCount(count) {
        const result = this.setReservePlayCount(count);
        if (result) {
            this.network.send(MessageType.RESERVE_COUNT, { count });
        }
        return result;
    }

    /**
     * 处理备战区堆数消息
     */
    handleReserveCount(payload) {
        // 对方选择堆数，本地同步
        this.setReservePlayCount(payload.count);
    }

    /**
     * 判断是否轮到本地玩家操作
     */
    isLocalPlayerTurn() {
        const state = this.getState();

        if (state.phase === 'rockPaperScissors') {
            // 猜拳阶段，双方都可以选
            return this.localRPSChoice === null;
        }

        if (state.phase === 'hand' || (state.phase === 'reserve' && state.reserveSubPhase === 'play')) {
            // 手牌对战阶段
            if (state.firstPlayerPieces.length === 0) {
                // 先手还没出牌
                return state.currentPlayerId === this.localPlayerId;
            } else {
                // 先手已出牌，轮到后手
                return state.waitingPlayerId === this.localPlayerId;
            }
        }

        if (state.phase === 'reserve' && state.reserveSubPhase === 'select') {
            // 备战区选择堆数阶段
            return state.currentPlayerId === this.localPlayerId;
        }

        return false;
    }

    /**
     * 获取本地玩家数据
     */
    getLocalPlayer() {
        if (this.localPlayerId === 1) {
            return this.player1;
        }
        return this.player2;
    }

    /**
     * 获取对手玩家数据
     */
    getOpponentPlayer() {
        if (this.localPlayerId === 1) {
            return this.player2;
        }
        return this.player1;
    }

    /**
     * 获取本地玩家手牌（用于显示）
     */
    getLocalPlayerHand() {
        return this.getLocalPlayer().handPieces;
    }

    /**
     * 获取对手手牌数量（不显示具体牌）
     */
    getOpponentHandCount() {
        return this.getOpponentPlayer().getHandCount();
    }

    /**
     * 处理断开连接
     */
    handleDisconnect() {
        if (this.phase !== 'ended') {
            this.log('对手断开连接');
            if (this.onStateChange) {
                this.onStateChange(this.getState());
            }
        }
    }

    /**
     * 处理对手主动断开
     */
    handleOpponentDisconnect() {
        this.handleDisconnect();
    }

    /**
     * 获取状态（扩展，包含本地玩家信息）
     */
    getState() {
        const state = super.getState();
        state.localPlayerId = this.localPlayerId;
        state.isOnlineMode = true;
        state.isConnected = this.network.isConnected;
        return state;
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { OnlineGame };
}
