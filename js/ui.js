/**
 * UI 交互层 - 增强版
 */

class UI {
    constructor() {
        this.selectedPieces = [];
        this.selectedPiles = [];
        this.game = null;
        this.ai = null;
        this.aiDifficulty = 'normal';
        this.tutorialStep = 0;
        this.showTutorial = true;

        // 在线模式相关
        this.isOnlineMode = false;
        this.onlineGame = null;
        this.localRPSChoice = null;
    }

    /**
     * 初始化UI
     */
    init() {
        this.bindEvents();
        this.checkFirstVisit();
        this.showScreen('menu');
    }

    /**
     * 检查是否首次访问
     */
    checkFirstVisit() {
        const hasVisited = localStorage.getItem('chessGame_visited');
        if (!hasVisited) {
            this.showTutorial = true;
            localStorage.setItem('chessGame_visited', 'true');
        } else {
            this.showTutorial = false;
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 主菜单按钮
        document.getElementById('btn-local')?.addEventListener('click', () => {
            soundManager.play('click');
            this.startGame(false);
        });

        document.getElementById('btn-ai')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showDifficultySelector();
        });

        // 教程按钮
        document.getElementById('btn-tutorial')?.addEventListener('click', () => {
            soundManager.play('click');
            this.startTutorial();
        });

        // 难度选择按钮
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                soundManager.play('click');
                this.aiDifficulty = e.target.dataset.difficulty;
                document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
                e.target.classList.add('selected');
            });
        });

        document.getElementById('btn-start-ai')?.addEventListener('click', () => {
            soundManager.play('click');
            this.startGame(true);
        });

        document.getElementById('btn-back-menu')?.addEventListener('click', () => {
            soundManager.play('click');
            this.hideDifficultySelector();
        });

        // 猜拳按钮
        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                soundManager.play('rps');
                this.handleRockPaperScissors(e.target.dataset.choice);
            });
        });

        // 出牌数量按钮 (旧版兼容)
        document.querySelectorAll('.count-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                soundManager.play('select');
                this.handlePlayCount(parseInt(e.target.dataset.count));
            });
        });

        // 新版出牌方式按钮
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                soundManager.play('select');
                this.handlePlayCount(parseInt(e.target.dataset.count));
            });
        });

        // 确认出牌按钮
        document.getElementById('btn-confirm-play')?.addEventListener('click', () => {
            this.confirmPlay();
        });

        // 备战区确认按钮
        document.getElementById('btn-confirm-reserve')?.addEventListener('click', () => {
            this.confirmReservePlay();
        });

        // 重新开始按钮
        document.getElementById('btn-restart')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showScreen('menu');
        });

        // 教程导航按钮
        document.getElementById('btn-tutorial-next')?.addEventListener('click', () => {
            soundManager.play('click');
            this.nextTutorialStep();
        });

        document.getElementById('btn-tutorial-skip')?.addEventListener('click', () => {
            soundManager.play('click');
            this.endTutorial();
        });

        // 音效设置
        document.getElementById('toggle-sound')?.addEventListener('click', () => {
            const enabled = soundManager.toggle();
            document.getElementById('toggle-sound').textContent = enabled ? '🔊' : '🔇';
        });

        document.getElementById('toggle-voice')?.addEventListener('click', () => {
            const enabled = voiceManager.toggle();
            document.getElementById('toggle-voice').textContent = enabled ? '🗣️' : '🤐';
        });

        // 游戏日志折叠
        document.getElementById('log-toggle')?.addEventListener('click', () => {
            const logAside = document.getElementById('game-log-aside');
            if (logAside) {
                logAside.classList.toggle('expanded');
            }
        });

        // 首次点击启用音效
        document.addEventListener('click', () => {
            soundManager.ensureContext();
        }, { once: true });

        // 在线对战相关事件
        this.bindOnlineEvents();
    }

    /**
     * 绑定在线对战相关事件
     */
    bindOnlineEvents() {
        // 在线对战按钮
        document.getElementById('btn-online')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showOnlineModal();
        });

        // 创建房间
        document.getElementById('btn-create-room')?.addEventListener('click', () => {
            soundManager.play('click');
            this.createOnlineRoom();
        });

        // 加入房间
        document.getElementById('btn-join-room')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showOnlineSection('join');
        });

        // 确认加入
        document.getElementById('btn-confirm-join')?.addEventListener('click', () => {
            soundManager.play('click');
            this.joinOnlineRoom();
        });

        // 复制房间码
        document.getElementById('btn-copy-code')?.addEventListener('click', () => {
            this.copyRoomCode();
        });

        // 分享房间码
        document.getElementById('btn-share-code')?.addEventListener('click', () => {
            this.shareRoomCode();
        });

        // 取消创建
        document.getElementById('btn-cancel-create')?.addEventListener('click', () => {
            soundManager.play('click');
            networkManager.disconnect();
            this.showOnlineSection('mode-select');
        });

        // 取消加入
        document.getElementById('btn-cancel-join')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showOnlineSection('mode-select');
        });

        // 在线返回
        document.getElementById('btn-online-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this.hideOnlineModal();
        });

        // 错误返回
        document.getElementById('btn-error-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this.showOnlineSection('mode-select');
        });

        // 断线返回
        document.getElementById('btn-disconnect-back')?.addEventListener('click', () => {
            soundManager.play('click');
            this.hideDisconnectOverlay();
            this.showScreen('menu');
        });

        // 房间码输入框格式化
        document.getElementById('input-room-code')?.addEventListener('input', (e) => {
            e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
        });

        // 回车键加入房间
        document.getElementById('input-room-code')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('btn-confirm-join')?.click();
            }
        });
    }

    /**
     * 显示难度选择器
     */
    showDifficultySelector() {
        document.getElementById('difficulty-modal')?.classList.add('active');
    }

    /**
     * 隐藏难度选择器
     */
    hideDifficultySelector() {
        document.getElementById('difficulty-modal')?.classList.remove('active');
    }

    /**
     * 显示指定屏幕
     * @param {string} screen - menu, game, result
     */
    showScreen(screen) {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.remove('active');
        });

        const targetScreen = document.getElementById(`screen-${screen}`);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    /**
     * 开始游戏
     * @param {boolean} vsAI
     */
    startGame(vsAI) {
        this.game = new Game();
        this.ai = vsAI ? new AI(this.aiDifficulty) : null;

        // 设置回调
        this.game.onStateChange = (state) => this.updateUI(state);
        this.game.onRoundEnd = (winner, loser, result) => this.handleRoundEnd(winner, loser, result);
        this.game.onGameEnd = (winner, loser) => this.handleGameEnd(winner, loser);

        // 初始化游戏
        const player2Name = vsAI ? `AI (${AI.getDifficultyInfo()[this.aiDifficulty].name})` : '玩家2';
        this.game.init('玩家1', player2Name, vsAI);

        this.selectedPieces = [];
        this.selectedPiles = [];

        // 播放开始音效和语音
        soundManager.play('win');
        voiceManager.playGameStart();

        this.hideDifficultySelector();
        this.showScreen('game');
        this.showGamePhase('rps');
    }

    /**
     * 显示游戏阶段
     * @param {string} phase
     */
    showGamePhase(phase) {
        document.querySelectorAll('.game-phase').forEach(el => {
            el.classList.remove('active');
        });

        const targetPhase = document.getElementById(`phase-${phase}`);
        if (targetPhase) {
            targetPhase.classList.add('active');
        }

        // 处理不同阶段的按钮显示
        const btnConfirmPlay = document.getElementById('btn-confirm-play');
        const btnConfirmReserve = document.getElementById('btn-confirm-reserve');
        const playModeSelector = document.getElementById('play-mode-selector');
        const handContainer = document.getElementById('player-hand');

        const state = this.game.getState();

        if (phase === 'reserve') {
            // 备战区阶段 - 检查子阶段
            if (state.reserveSubPhase === 'select') {
                // 选择堆数阶段
                if (btnConfirmPlay) btnConfirmPlay.style.display = 'none';
                if (btnConfirmReserve) btnConfirmReserve.style.display = 'block';
                if (playModeSelector) playModeSelector.style.display = 'flex';
                this.updateReserveModeButtons();
            } else if (state.reserveSubPhase === 'play') {
                // 手牌对战阶段（在备战区阶段内）
                if (btnConfirmPlay) btnConfirmPlay.style.display = 'block';
                if (btnConfirmReserve) btnConfirmReserve.style.display = 'none';
                if (playModeSelector) playModeSelector.style.display = 'flex';
                // 恢复按钮文本
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    const count = parseInt(btn.dataset.count);
                    const labels = { 1: '单张', 2: '成对', 3: '顺子' };
                    btn.textContent = labels[count] || `${count}张`;
                });
            }
        } else if (phase === 'play') {
            // 手牌对战阶段
            if (btnConfirmPlay) btnConfirmPlay.style.display = 'block';
            if (btnConfirmReserve) btnConfirmReserve.style.display = 'none';
            if (playModeSelector) playModeSelector.style.display = 'flex';
            // 恢复按钮文本
            document.querySelectorAll('.mode-btn').forEach(btn => {
                const count = parseInt(btn.dataset.count);
                const labels = { 1: '单张', 2: '成对', 3: '顺子' };
                btn.textContent = labels[count] || `${count}张`;
            });
        } else {
            // 其他阶段
            if (btnConfirmPlay) btnConfirmPlay.style.display = 'none';
            if (btnConfirmReserve) btnConfirmReserve.style.display = 'none';
            if (playModeSelector) playModeSelector.style.display = 'none';
        }
    }

    /**
     * 更新备战区阶段的按钮状态
     */
    updateReserveModeButtons() {
        const state = this.game.getState();
        const buttons = document.querySelectorAll('.mode-btn');

        // 更新按钮文本为堆数
        const labels = { 1: '1堆', 2: '2堆', 3: '3堆' };
        buttons.forEach(btn => {
            const count = parseInt(btn.dataset.count);
            btn.textContent = labels[count] || `${count}堆`;
        });

        // 判断人类玩家是先手还是后手
        const humanIsFirst = state.currentPlayerId === 1;
        const humanReserveCount = state.player1.reserve?.length || 0;
        const aiReserveCount = state.player2.reserve?.length || 0;

        if (state.firstPlayerPieces.length === 0) {
            // 先手还没出牌
            if (humanIsFirst) {
                // 人类是先手，可以自由选择出堆数量
                buttons.forEach(btn => {
                    const count = parseInt(btn.dataset.count);
                    // 检查是否有足够的堆，且对方也有足够的堆
                    const hasEnoughPiles = humanReserveCount >= count && aiReserveCount >= count;
                    btn.disabled = !hasEnoughPiles;
                });
            } else {
                // 人类是后手，但先手还没出牌，等待先手
                buttons.forEach(btn => btn.disabled = true);
            }
        } else {
            // 先手已经出牌，后手必须出相同堆数
            const requiredCount = state.currentPlayCount; // 使用堆数
            buttons.forEach(btn => {
                const count = parseInt(btn.dataset.count);
                if (count === requiredCount) {
                    btn.disabled = false;
                    btn.classList.add('selected');
                } else {
                    btn.disabled = true;
                    btn.classList.remove('selected');
                }
            });

            // 自动设置出牌数量
            if (this.game.currentPlayCount !== requiredCount) {
                this.game.currentPlayCount = requiredCount;
                this.selectedPiles = [];
            }
        }
    }

    /**
     * 处理猜拳
     * @param {string} choice - rock, paper, scissors
     */
    handleRockPaperScissors(choice) {
        // 在线模式
        if (this.isOnlineMode) {
            this.handleOnlineRockPaperScissors(choice);
            return;
        }

        // 本地/AI模式
        const choices = ['rock', 'paper', 'scissors'];
        const aiChoice = choices[Math.floor(Math.random() * choices.length)];

        this.showRPSResult(choice, aiChoice);

        // 判断胜负
        if (choice === aiChoice) {
            // 平局，需要重新猜拳
            const rpsResult = document.getElementById('rps-result');
            if (rpsResult) {
                const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
                rpsResult.innerHTML = `平局！${emojis[choice]} = ${emojis[aiChoice]}<br>请重新出拳`;
            }
            soundManager.play('rps');
            return; // 不继续，等待玩家再次出拳
        }

        let winner = 0;
        if (
            (choice === 'rock' && aiChoice === 'scissors') ||
            (choice === 'paper' && aiChoice === 'rock') ||
            (choice === 'scissors' && aiChoice === 'paper')
        ) {
            winner = 1; // 玩家1获胜
        } else {
            winner = 2; // AI获胜
        }

        setTimeout(() => {
            this.game.setRockPaperScissorsWinner(winner);
            this.showGamePhase('play');
            // 如果AI在猜拳中获胜，AI是先手，需要触发AI出牌
            this.checkAITurn();
        }, 1000);
    }

    /**
     * 显示猜拳结果
     */
    showRPSResult(playerChoice, aiChoice) {
        const rpsResult = document.getElementById('rps-result');
        if (rpsResult) {
            const emojis = { rock: '✊', paper: '✋', scissors: '✌️' };
            const resultText = this.getRPSResultText(playerChoice, aiChoice);
            rpsResult.innerHTML = `你: ${emojis[playerChoice]} vs ${emojis[aiChoice]} :对方<br>${resultText}`;
        }
    }

    /**
     * 获取猜拳结果文字
     */
    getRPSResultText(playerChoice, aiChoice) {
        if (playerChoice === aiChoice) {
            return '平局！';
        }
        if (
            (playerChoice === 'rock' && aiChoice === 'scissors') ||
            (playerChoice === 'paper' && aiChoice === 'rock') ||
            (playerChoice === 'scissors' && aiChoice === 'paper')
        ) {
            return '你赢了！先手出牌';
        }
        return '你输了！后手出牌';
    }

    /**
     * 处理出牌数量选择（手牌阶段）或出堆数量选择（备战区阶段）
     * @param {number} count
     */
    handlePlayCount(count) {
        const state = this.game.getState();

        if (state.phase === 'hand') {
            // 手牌对战阶段
            const success = this.isOnlineMode
                ? this.onlineGame.onlineSetPlayCount(count)
                : this.game.setPlayCount(count);

            if (success) {
                this.selectedPieces = [];
                this.updatePieceSelection();

                // 更新旧版按钮状态
                document.querySelectorAll('.count-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                document.querySelector(`.count-btn[data-count="${count}"]`)?.classList.add('selected');

                // 更新新版按钮状态
                document.querySelectorAll('.mode-btn').forEach(btn => {
                    btn.classList.remove('selected');
                });
                document.querySelector(`.mode-btn[data-count="${count}"]`)?.classList.add('selected');
            }
        } else if (state.phase === 'reserve') {
            if (state.reserveSubPhase === 'select') {
                // 备战区选择堆数阶段
                const success = this.isOnlineMode
                    ? this.onlineGame.onlineSetReservePlayCount(count)
                    : this.game.setReservePlayCount(count);

                if (success) {
                    // 堆已提取到手牌，切换到手牌对战子阶段
                    this.selectedPieces = [];
                    this.selectedPiles = [];

                    // 更新按钮状态
                    document.querySelectorAll('.mode-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    document.querySelector(`.mode-btn[data-count="${count}"]`)?.classList.add('selected');

                    // 更新显示
                    this.updatePieceSelection();
                    this.updateReserveDisplay();
                    this.showGamePhase('reserve');

                    // 播放提示
                    this.showMessage(`双方各提取了${count}堆牌到手牌，请选择出牌方式`);

                    // 检查AI回合
                    this.checkAITurn();
                }
            } else if (state.reserveSubPhase === 'play') {
                // 备战区手牌对战阶段
                if (this.game.setPlayCount(count)) {
                    this.selectedPieces = [];
                    this.updatePieceSelection();

                    document.querySelectorAll('.mode-btn').forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    document.querySelector(`.mode-btn[data-count="${count}"]`)?.classList.add('selected');
                }
            }
        }
    }

    /**
     * 更新棋子选择 - 使用SVG卡片（带排序）
     * 注意：玩家1始终是人类玩家，手牌区始终显示玩家1的手牌
     */
    updatePieceSelection() {
        const state = this.game.getState();
        // 玩家1始终是人类玩家，手牌区显示玩家1的手牌
        const humanPlayer = state.player1;
        const container = document.getElementById('player-hand');

        if (!container) return;

        container.innerHTML = '';

        // 对手牌进行排序：先按公司分组，再按等级排序
        const sortedHand = this.sortHandCards(humanPlayer.hand);

        sortedHand.forEach(({ piece, originalIndex }) => {
            const isUpper = piece === piece.toUpperCase();
            const isSelected = this.selectedPieces.includes(originalIndex);

            // 使用SVG卡片
            const cardHtml = getPieceCardHtml(piece, originalIndex, isSelected, true);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            const pieceEl = tempDiv.firstElementChild;

            // 只显示角色名和性别
            const genderName = isUpper ? '男性' : '女性';
            pieceEl.title = `${PIECE_NAMES[piece]} - ${genderName}`;

            pieceEl.addEventListener('click', () => {
                soundManager.play('select');
                this.togglePieceSelection(originalIndex, piece);
            });
            container.appendChild(pieceEl);
        });
    }

    /**
     * 对手牌进行排序
     * 排序规则：先按公司分组（A公司在前），每组内按等级从高到低排序
     * @param {string[]} hand - 原始手牌
     * @returns {Array} 排序后的手牌（包含原始索引）
     */
    sortHandCards(hand) {
        // 创建带原始索引的数组
        const indexedHand = hand.map((piece, index) => ({ piece, originalIndex: index }));

        // 排序：先按公司分组，再按等级排序
        indexedHand.sort((a, b) => {
            const aIsUpper = a.piece === a.piece.toUpperCase();
            const bIsUpper = b.piece === b.piece.toUpperCase();

            // 先按公司分组（大写在前）
            if (aIsUpper !== bIsUpper) {
                return aIsUpper ? -1 : 1;
            }

            // 同公司内按等级排序（等级高的在前）
            return PIECE_RANKS[b.piece] - PIECE_RANKS[a.piece];
        });

        return indexedHand;
    }

    /**
     * 切换棋子选择
     */
    togglePieceSelection(index, piece) {
        const state = this.game.getState();
        const maxSelect = state.currentPlayCount;

        // 如果没有设置出牌数量，提示玩家先选择出牌方式
        if (maxSelect === 0) {
            this.showMessage('请先选择出牌方式（单张/成对/顺子）');
            return;
        }

        if (this.selectedPieces.includes(index)) {
            this.selectedPieces = this.selectedPieces.filter(i => i !== index);
        } else {
            if (this.selectedPieces.length < maxSelect) {
                this.selectedPieces.push(index);
            }
        }

        this.updatePieceSelection();
        this.updateSelectedPiecesDisplay();
    }

    /**
     * 更新已选棋子显示 - 使用SVG卡片
     * 注意：玩家1始终是人类玩家
     */
    updateSelectedPiecesDisplay() {
        const state = this.game.getState();
        // 玩家1始终是人类玩家
        const humanPlayer = state.player1;
        const container = document.getElementById('selected-pieces');

        if (!container) return;

        const selectedPieceChars = this.selectedPieces.map(i => humanPlayer.hand[i]);

        // 使用SVG迷你卡片
        container.innerHTML = selectedPieceChars.map((p, i) =>
            getPieceCardHtml(p, i, false, true)
        ).join('');

        // 显示是否成型
        const isValid = isFormedCards(selectedPieceChars);
        const validationEl = document.getElementById('formation-validation');
        if (validationEl) {
            if (selectedPieceChars.length === 0) {
                validationEl.textContent = '';
            } else if (isValid) {
                validationEl.textContent = '✓ 成型';
                validationEl.className = 'formation-valid';
            } else {
                validationEl.textContent = '✗ 混合牌（必败）';
                validationEl.className = 'formation-invalid';
            }
        }
    }

    /**
     * 确认出牌
     * 逻辑说明：
     * - 玩家1始终是人类玩家
     * - currentPlayerId = 先手玩家ID（本轮先出牌的玩家）
     * - waitingPlayerId = 后手玩家ID（本轮后出牌的玩家）
     * - 出牌区：p1-cards-slot = 玩家1（人类），p2-cards-slot = 玩家2（AI）
     */
    async confirmPlay() {
        // 在线模式使用专门的确认方法
        if (this.isOnlineMode) {
            this.confirmOnlinePlay();
            return;
        }

        const state = this.game.getState();

        const canPlay = state.phase === 'hand' || (state.phase === 'reserve' && state.reserveSubPhase === 'play');
        if (!canPlay) return;

        // 判断是否是备战区阶段
        const isReserve = state.phase === 'reserve';

        // 玩家1始终是人类玩家，手牌从玩家1获取
        const humanPlayer = state.player1;
        const selectedPieceChars = this.selectedPieces.map(i => humanPlayer.hand[i]);

        if (selectedPieceChars.length === 0) {
            this.showMessage('请选择要出的牌');
            return;
        }

        // 判断人类玩家是先手还是后手
        const humanIsFirst = state.currentPlayerId === 1;

        if (state.firstPlayerPieces.length === 0) {
            // 本轮还没人出牌，检查是否轮到人类先出
            if (humanIsFirst) {
                // 人类是先手，可以出牌
                if (this.game.firstPlayerPlay(selectedPieceChars)) {
                    // 人类的牌显示在p1区域
                    await this.showPlayCards(selectedPieceChars, 1, isReserve);
                    this.playCardSound(selectedPieceChars);
                    this.selectedPieces = [];
                    this.checkAITurn();
                }
            } else {
                // 人类是后手，但先手还没出牌，等待AI
                this.showMessage('等待对手先出牌');
            }
        } else {
            // 先手已经出牌，检查是否轮到人类后手出牌
            if (!humanIsFirst) {
                // 人类是后手，轮到出牌
                if (this.game.secondPlayerPlay(selectedPieceChars)) {
                    // 人类的牌显示在p1区域
                    await this.showPlayCards(selectedPieceChars, 1, isReserve);
                    this.playCardSound(selectedPieceChars);
                    this.selectedPieces = [];
                    // 双方都已出牌，等待一小段时间确保所有卡片动画完成后再翻牌
                    setTimeout(() => {
                        this.revealAllPlayCards();
                    }, 150);
                }
            } else {
                // 人类是先手但已经出过牌了，不应该到达这里
                this.showMessage('已经出过牌了');
            }
        }
    }

    /**
     * 播放出牌音效和语音
     */
    playCardSound(pieces) {
        if (pieces.length === 1) {
            soundManager.play('play');
            voiceManager.playCardVoice(pieces, 'single');
        } else if (pieces.length === 2) {
            if (isFormedCards(pieces)) {
                soundManager.play('pair');
                voiceManager.playCardVoice(pieces, 'pair');
            } else {
                soundManager.play('mixed');
            }
        } else if (pieces.length === 3) {
            if (isFormedCards(pieces)) {
                soundManager.play('sequence');
                voiceManager.playCardVoice(pieces, 'sequence');
            } else {
                soundManager.play('mixed');
            }
        }
    }

    /**
     * 更新备战区显示 - 格状布局
     */
    updateReserveDisplay() {
        const state = this.game.getState();

        // 更新玩家1备战区
        this.renderReserveGrid(state.player1, 'p1-reserve-grid', 1);

        // 更新玩家2备战区
        this.renderReserveGrid(state.player2, 'p2-reserve-grid', 2);
    }

    /**
     * 渲染备战区网格
     */
    renderReserveGrid(player, containerId, playerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = '';

        // 获取当前玩家ID，判断是否可交互
        const state = this.game.getState();
        const isCurrentPlayer = state.currentPlayerId === playerId;
        const canInteract = state.phase === 'reserve' && isCurrentPlayer;
        const nextSelectableIndex = this.selectedPiles.length; // 下一个可选择的索引

        player.reserve.forEach((pile, index) => {
            const cellEl = document.createElement('div');
            cellEl.className = 'reserve-cell';
            cellEl.dataset.index = index;
            cellEl.dataset.player = playerId;

            if (this.selectedPiles.includes(index) && isCurrentPlayer) {
                cellEl.classList.add('selected');
            }

            // 标记可选择的下一个堆
            if (canInteract && index === nextSelectableIndex) {
                cellEl.classList.add('next-selectable');
            }

            // 标记不可选择的堆（还没有轮到）
            if (canInteract && index > nextSelectableIndex && !this.selectedPiles.includes(index)) {
                cellEl.classList.add('disabled');
            }

            // 创建堆叠显示 - 只显示第一张牌，下面的牌显示为背面
            const pileEl = document.createElement('div');
            pileEl.className = 'reserve-pile stacked';

            if (pile.length > 0) {
                // 第一张牌（顶牌）- 完全可见
                const topCard = document.createElement('div');
                topCard.className = 'pile-top';
                topCard.innerHTML = getMiniPieceHtml(pile[0]);
                pileEl.appendChild(topCard);

                // 如果有第二张牌，显示为背面（堆叠效果）
                if (pile.length > 1) {
                    const bottomCard = document.createElement('div');
                    bottomCard.className = 'pile-bottom';
                    bottomCard.innerHTML = '<div class="piece-mini card-back">?</div>';
                    pileEl.appendChild(bottomCard);
                }
            }

            cellEl.appendChild(pileEl);

            if (canInteract) {
                cellEl.addEventListener('click', () => {
                    soundManager.play('select');
                    this.togglePileSelection(index);
                });
                cellEl.style.cursor = 'pointer';
            } else {
                cellEl.style.cursor = 'default';
            }

            container.appendChild(cellEl);
        });
    }

    /**
     * 切换堆选择
     * 规则：必须从左到右顺序选择，不能跳过
     */
    togglePileSelection(index) {
        const state = this.game.getState();
        const maxSelect = state.currentPlayCount;

        if (this.selectedPiles.includes(index)) {
            // 取消选择：只能从右边开始取消，保持连续性
            // 例如：如果选择了[0,1,2]，必须先取消2才能取消1
            const maxSelected = Math.max(...this.selectedPiles);
            if (index === maxSelected) {
                this.selectedPiles = this.selectedPiles.filter(i => i !== index);
            } else {
                // 不允许跳过取消，显示提示
                this.showMessage('请按从右到左的顺序取消选择');
                return;
            }
        } else {
            // 选择：必须从左到右，不能跳过
            // 期望的下一个索引应该是当前已选数量
            const expectedNext = this.selectedPiles.length;
            if (index === expectedNext && this.selectedPiles.length < maxSelect) {
                this.selectedPiles.push(index);
            } else if (this.selectedPiles.length >= maxSelect) {
                this.showMessage(`最多只能选择${maxSelect}堆`);
                return;
            } else {
                this.showMessage('请按从左到右的顺序选择');
                return;
            }
        }

        this.updateReserveDisplay();
        this.updateReserveSelectionDisplay();
    }

    /**
     * 更新备战区选择显示
     */
    updateReserveSelectionDisplay() {
        const state = this.game.getState();
        const currentPlayer = state.currentPlayerId === 1 ? state.player1 : state.player2;
        const container = document.getElementById('selected-pieces');

        if (!container || state.phase !== 'reserve') return;

        // 显示已选择的堆（选择后显示完整的牌，因为即将出牌）
        container.innerHTML = this.selectedPiles.map(pileIndex => {
            const pile = currentPlayer.reserve[pileIndex];
            if (!pile) return '';
            // 显示堆中的所有牌（选择时揭示）
            return `<div class="selected-pile">${pile.map(p => getMiniPieceHtml(p)).join('')}</div>`;
        }).join(' ');
    }

    /**
     * 确认备战区出牌（新规则：选择堆数阶段）
     * 点击此按钮会提示用户选择出牌方式
     */
    confirmReservePlay() {
        const state = this.game.getState();

        if (state.phase === 'reserve' && state.reserveSubPhase === 'select') {
            // 选择堆数阶段 - 提示用户选择出牌方式
            this.showMessage('请选择出1堆、2堆或3堆');
        }
    }

    /**
     * 检查并执行AI回合
     */
    checkAITurn() {
        const state = this.game.getState();

        if (state.phase === 'ended') return;

        const currentIsAI = state.currentPlayerId === 2 && state.player2.isAI;
        const waitingIsAI = state.waitingPlayerId === 2 && state.player2.isAI;

        if (state.firstPlayerPieces.length === 0 && currentIsAI) {
            setTimeout(() => this.executeAITurn(), 800);
        } else if (state.firstPlayerPieces.length > 0 && waitingIsAI) {
            setTimeout(() => this.executeAITurn(), 800);
        }
    }

    /**
     * 执行AI回合
     * AI始终是玩家2，出牌始终显示在p2区域
     */
    async executeAITurn() {
        const state = this.game.getState();

        if (state.phase === 'hand') {
            if (state.firstPlayerPieces.length === 0) {
                // 先手还没出牌，AI是先手
                const { count, pieces } = this.ai.executeFirstPlayerTurn(this.game);
                if (pieces) {
                    this.game.firstPlayerPlay(pieces);
                    // AI的牌始终显示在p2区域（手牌阶段）
                    await this.showPlayCards(pieces, 2, false);
                    // AI出牌不播放语音，只播放出牌音效
                    soundManager.play('play');
                    // 更新UI状态，禁用按钮并设置出牌数量
                    this.updatePlayModeButtons(this.game.getState());
                    // 显示提示
                    const modeText = count === 1 ? '单张' : (count === 2 ? '成对' : '顺子');
                    this.showMessage(`对手出了${modeText}，请选择${count}张牌回应`);
                }
            } else {
                // 先手已出牌，AI是后手
                const pieces = this.ai.executeSecondPlayerTurn(this.game);
                if (pieces) {
                    this.game.secondPlayerPlay(pieces);
                    // AI的牌始终显示在p2区域（手牌阶段）
                    await this.showPlayCards(pieces, 2, false);
                    // AI出牌不播放语音，只播放出牌音效
                    soundManager.play('play');
                    // 双方都已出牌，等待一小段时间确保所有卡片动画完成后再翻牌
                    setTimeout(() => {
                        this.revealAllPlayCards();
                    }, 150);
                }
            }
        } else if (state.phase === 'reserve') {
            // 备战区AI逻辑 - 新规则
            const aiPlayer = this.game.player2;
            const humanIsFirst = state.currentPlayerId === 1;

            if (state.reserveSubPhase === 'select') {
                // 选择堆数阶段
                if (!humanIsFirst) {
                    // AI是先手，决定出多少堆
                    const count = this.ai.decideReservePlayCount(aiPlayer, this.game.waitingPlayer);

                    if (this.game.setReservePlayCount(count)) {
                        // 堆已提取到手牌，更新UI
                        this.updatePieceSelection();
                        this.updateReserveDisplay();
                        this.showGamePhase('reserve');

                        this.showMessage(`对手选择出${count}堆，双方已提取到手牌`);

                        // 继续AI的手牌对战（延迟执行）
                        setTimeout(() => this.executeAITurn(), 500);
                    }
                }
                // 如果人类是先手，等待人类选择堆数
            } else if (state.reserveSubPhase === 'play') {
                // 手牌对战阶段（在备战区阶段内）
                if (state.firstPlayerPieces.length === 0) {
                    // 先手还没出牌
                    if (!humanIsFirst) {
                        // AI是先手，用手牌对战逻辑
                        const { count, pieces } = this.ai.executeFirstPlayerTurn(this.game);
                        if (pieces) {
                            this.game.firstPlayerPlay(pieces);
                            // 备战区阶段，isReserve = true
                            await this.showPlayCards(pieces, 2, true);
                            soundManager.play('play');
                            this.updatePlayModeButtons(this.game.getState());
                            const modeText = count === 1 ? '单张' : (count === 2 ? '成对' : '顺子');
                            this.showMessage(`对手出了${modeText}，请选择${count}张牌回应`);
                        }
                    }
                } else {
                    // 先手已出牌，AI是后手
                    if (humanIsFirst) {
                        // 人类是先手，AI是后手，需要回应
                        const pieces = this.ai.executeSecondPlayerTurn(this.game);
                        if (pieces) {
                            this.game.secondPlayerPlay(pieces);
                            // 备战区阶段，isReserve = true
                            await this.showPlayCards(pieces, 2, true);
                            soundManager.play('play');
                            // 等待一小段时间确保所有卡片动画完成后再翻牌
                            setTimeout(() => {
                                this.revealAllPlayCards();
                            }, 150);
                        }
                    }
                }
            }
        }
    }

    /**
     * 更新UI
     */
    updateUI(state) {
        this.updatePlayerInfo(state);
        this.updateGameLog(state);
        this.updatePlayModeButtons(state);

        // 更新备战区显示（格状布局）
        this.updateReserveDisplay();

        if (state.phase === 'hand') {
            this.showGamePhase('play');
        } else if (state.phase === 'reserve') {
            this.showGamePhase('reserve');
        } else if (state.phase === 'ended') {
            this.showGamePhase('result');
        }
    }

    /**
     * 更新出牌方式按钮状态
     */
    updatePlayModeButtons(state) {
        const buttons = document.querySelectorAll('.mode-btn');

        if (state.phase === 'reserve') {
            // 备战区阶段 - 检查子阶段
            if (state.reserveSubPhase === 'select') {
                // 选择堆数阶段
                this.updateReserveModeButtons();
                return;
            } else if (state.reserveSubPhase === 'play') {
                // 手牌对战阶段（在备战区阶段内）- 使用手牌对战逻辑
                // 继续执行下面的手牌对战逻辑
            } else {
                buttons.forEach(btn => btn.disabled = true);
                return;
            }
        }

        if (state.phase !== 'hand' && !(state.phase === 'reserve' && state.reserveSubPhase === 'play')) {
            buttons.forEach(btn => btn.disabled = true);
            return;
        }

        // 手牌对战阶段
        // 恢复按钮文本
        const handLabels = { 1: '单张', 2: '成对', 3: '顺子' };
        buttons.forEach(btn => {
            const count = parseInt(btn.dataset.count);
            btn.textContent = handLabels[count] || `${count}张`;
        });

        // 判断人类玩家是先手还是后手
        const humanIsFirst = state.currentPlayerId === 1;
        const humanHand = state.player1.hand || [];

        if (state.firstPlayerPieces.length === 0) {
            // 先手还没出牌
            if (humanIsFirst) {
                // 人类是先手，可以自由选择出牌数量
                buttons.forEach(btn => {
                    const count = parseInt(btn.dataset.count);
                    // 检查是否有足够的牌
                    const hasEnoughCards = humanHand.length >= count;
                    // 检查是否有有效的成型组合（使用Player类的方法）
                    const player = this.game.player1;
                    const formations = player ? player.getValidFormations(count) : [];
                    btn.disabled = !hasEnoughCards || formations.length === 0;
                });
            } else {
                // 人类是后手，但先手还没出牌，等待先手
                buttons.forEach(btn => btn.disabled = true);
            }
        } else {
            // 先手已经出牌，后手必须出相同数量
            const requiredCount = state.firstPlayerPieces.length;
            buttons.forEach(btn => {
                const count = parseInt(btn.dataset.count);
                if (count === requiredCount) {
                    btn.disabled = false;
                    btn.classList.add('selected');
                } else {
                    btn.disabled = true;
                    btn.classList.remove('selected');
                }
            });

            // 自动设置出牌数量
            if (this.game.currentPlayCount !== requiredCount) {
                this.game.currentPlayCount = requiredCount;
                this.selectedPieces = [];
                this.updatePieceSelection();
            }
        }
    }

    /**
     * 获取玩家的有效成型组合
     */
    getPlayerFormations(hand, count) {
        if (hand.length < count) return [];

        const formations = [];

        if (count === 1) {
            // 单张都是有效的
            return hand.map(p => [p]);
        } else if (count === 2) {
            // 成对：相同字母
            for (let i = 0; i < hand.length; i++) {
                for (let j = i + 1; j < hand.length; j++) {
                    const pair = [hand[i], hand[j]];
                    if (isFormedCards(pair)) {
                        formations.push(pair);
                    }
                }
            }
        } else if (count === 3) {
            // 顺子：ABC或DEF（同大小写）
            for (let i = 0; i < hand.length; i++) {
                for (let j = 0; j < hand.length; j++) {
                    for (let k = 0; k < hand.length; k++) {
                        if (i !== j && i !== k && j !== k) {
                            const seq = [hand[i], hand[j], hand[k]];
                            if (isFormedCards(seq)) {
                                formations.push(seq);
                            }
                        }
                    }
                }
            }
        }

        return formations;
    }

    /**
     * 更新玩家信息
     */
    updatePlayerInfo(state) {
        document.getElementById('p1-name').textContent = state.player1.name;
        document.getElementById('p1-hand-count').textContent = state.player1.handCount;
        document.getElementById('p1-reserve-count').textContent = state.player1.reservePileCount;

        document.getElementById('p2-name').textContent = state.player2.name;
        document.getElementById('p2-hand-count').textContent = state.player2.handCount;
        document.getElementById('p2-reserve-count').textContent = state.player2.reservePileCount;

        // 更新旧版面板高亮
        document.getElementById('p1-panel')?.classList.toggle('active', state.currentPlayerId === 1);
        document.getElementById('p2-panel')?.classList.toggle('active', state.currentPlayerId === 2);

        // 更新新版区域高亮
        document.getElementById('player1-area')?.classList.toggle('active', state.currentPlayerId === 1);
        document.getElementById('player2-area')?.classList.toggle('active', state.currentPlayerId === 2);

        document.getElementById('round-info').textContent =
            `第 ${state.roundNumber} 回合 - ${state.currentPlayerId === 1 ? state.player1.name : state.player2.name} 先手`;

        this.updatePieceSelection();
    }

    /**
     * 更新游戏日志
     */
    updateGameLog(state) {
        const logContainer = document.getElementById('game-log');
        if (!logContainer) return;

        logContainer.innerHTML = state.gameLog.slice(-10).map(log =>
            `<div class="log-entry">${log}</div>`
        ).join('');

        logContainer.scrollTop = logContainer.scrollHeight;
    }

    /**
     * 处理回合结束
     */
    handleRoundEnd(winner, loser, result) {
        const isPlayer1Win = winner.id === 1;
        const state = this.game.getState();

        // 延迟显示结果，确保玩家有2秒时间看到翻开的牌
        setTimeout(() => {
            if (isPlayer1Win) {
                soundManager.play('win');
            } else {
                soundManager.play('lose');
            }

            voiceManager.playRoundResult(isPlayer1Win);

            const resultEl = document.getElementById('round-result');
            if (resultEl) {
                resultEl.textContent = `${winner.name} 赢得本回合！`;
                resultEl.classList.add('show');

                setTimeout(() => {
                    resultEl.classList.remove('show');
                    // 回合结束后清空出牌区
                    this.clearPlayCards();
                    // 重置选中的牌/堆
                    this.selectedPieces = [];
                    this.selectedPiles = [];
                    // 显示正确的游戏阶段
                    if (state.phase === 'reserve') {
                        this.showGamePhase('reserve');
                    } else {
                        this.showGamePhase('play');
                    }
                    // 更新按钮状态
                    this.updatePlayModeButtons(this.game.getState());
                    // 更新手牌/备战区显示
                    this.updatePieceSelection();
                    this.updateReserveDisplay();
                    // 检查是否轮到AI出牌（如果AI赢了上一回合，AI是先手）
                    this.checkAITurn();
                }, 1500);
            }
        }, 2000); // 等待2秒让玩家看清翻开的牌
    }

    /**
     * 显示出牌区的卡片（初始显示背面）
     * @param {string[]} pieces - 出牌
     * @param {number} playerId - 玩家ID (1或2)
     * @param {boolean} isReserve - 是否备战区阶段
     * @returns {Promise} 当所有卡片都添加完成时resolve
     */
    showPlayCards(pieces, playerId, isReserve = false) {
        return new Promise((resolve) => {
            const slotId = isReserve
                ? (playerId === 1 ? 'p1-reserve-slot' : 'p2-reserve-slot')
                : (playerId === 1 ? 'p1-cards-slot' : 'p2-cards-slot');

            const slot = document.getElementById(slotId);
            if (!slot) {
                resolve();
                return;
            }

            // 不清空，保留之前出的牌（对战时需要同时显示双方的牌）
            // slot.innerHTML = '';

            let addedCount = 0;
            const totalCount = pieces.length;

            pieces.forEach((piece, index) => {
                const tempDiv = document.createElement('div');
                // showIcon = false 显示背面
                tempDiv.innerHTML = getPieceCardHtml(piece, index, false, false);
                const cardEl = tempDiv.firstElementChild;
                cardEl.classList.add('playing');
                // 添加flipped类显示背面
                cardEl.classList.add('flipped');
                // 存储棋子信息用于翻牌
                cardEl.dataset.piece = piece;

                // 延迟添加动画
                setTimeout(() => {
                    slot.appendChild(cardEl);
                    addedCount++;
                    // 当所有卡片都添加完成时resolve
                    if (addedCount === totalCount) {
                        resolve();
                    }
                }, index * 100);
            });

            // 如果没有卡片，立即resolve
            if (totalCount === 0) {
                resolve();
            }
        });
    }

    /**
     * 翻开所有出牌区的卡片（手牌和备战区都支持）
     */
    revealAllPlayCards() {
        // 同时检查手牌槽位和备战区槽位
        const slots = ['p1-cards-slot', 'p2-cards-slot', 'p1-reserve-slot', 'p2-reserve-slot'];
        let allCards = [];

        // 收集所有需要翻开的卡片
        slots.forEach(slotId => {
            const slot = document.getElementById(slotId);
            if (!slot) return;
            const cards = slot.querySelectorAll('.piece-card.flipped');
            allCards.push(...cards);
        });

        // 如果没有卡片，直接返回
        if (allCards.length === 0) return;

        // 同时翻开所有卡片，带轻微延迟产生连贯效果
        allCards.forEach((card, index) => {
            setTimeout(() => {
                // 移除flipped类，显示正面
                card.classList.remove('flipped');
                // 播放翻牌音效（只播放一次）
                if (index === 0) {
                    soundManager.play('select');
                }
            }, index * 80); // 更快的连续翻牌效果
        });
    }

    /**
     * 清空出牌区
     */
    clearPlayCards() {
        ['p1-cards-slot', 'p2-cards-slot', 'p1-reserve-slot', 'p2-reserve-slot'].forEach(id => {
            const slot = document.getElementById(id);
            if (slot) slot.innerHTML = '';
        });
    }

    /**
     * 显示对战结果动画
     * @param {boolean} player1Win - 玩家1是否获胜
     * @param {string} message - 结果消息
     */
    showBattleResult(player1Win, message) {
        const resultDisplay = document.getElementById('battle-result');
        if (!resultDisplay) return;

        const resultContent = resultDisplay.querySelector('.result-content');
        if (resultContent) {
            const icon = resultContent.querySelector('.result-icon');
            const text = resultContent.querySelector('.result-text');
            if (icon) icon.textContent = player1Win ? '🎉' : '😢';
            if (text) text.textContent = message;
        }

        resultDisplay.classList.remove('win', 'lose');
        resultDisplay.classList.add(player1Win ? 'win' : 'lose');
        resultDisplay.classList.add('show');

        setTimeout(() => {
            resultDisplay.classList.remove('show');
        }, 2000);
    }

    /**
     * 处理游戏结束
     */
    handleGameEnd(winner, loser) {
        const isPlayer1Win = winner.id === 1;

        if (isPlayer1Win) {
            soundManager.play('win');
        } else {
            soundManager.play('lose');
        }

        voiceManager.playGameEnd(isPlayer1Win);

        document.getElementById('winner-name').textContent = winner.name;
        document.getElementById('loser-name').textContent = loser.name;

        setTimeout(() => {
            this.showGamePhase('result');
        }, 1000);
    }

    /**
     * 显示消息
     */
    showMessage(message) {
        const msgEl = document.getElementById('game-message');
        if (msgEl) {
            msgEl.textContent = message;
            msgEl.classList.add('show');
            setTimeout(() => msgEl.classList.remove('show'), 2000);
        }
    }

    /**
     * 开始教程
     */
    startTutorial() {
        this.tutorialStep = 0;
        this.showTutorialStep();
        document.getElementById('tutorial-modal')?.classList.add('active');
    }

    /**
     * 显示教程步骤
     */
    showTutorialStep() {
        const steps = [
            {
                title: '欢迎来到职场大乱斗！',
                content: '这是一款以职场挖人为主题的棋牌游戏。两位玩家分别扮演两家竞争公司的老板，通过挖人来吞并对手。'
            },
            {
                title: '角色说明',
                content: '👑 CEO（最强）- 公司最高领导\n⭐ VP（副总裁）- 高层管理者\n🎓 总监 - 部门负责人\n💼 经理 - 团队管理者\n📋 资深员工 - 经验丰富\n🌱 新人（最弱）- 刚入职\n\n金色卡片= 男性角色，紫色卡片= 女性角色'
            },
            {
                title: '出牌规则',
                content: '• 单个出牌：出任意一张角色牌\n• 成对出牌：相同角色（如两个VP、两个经理）\n• 顺子出牌：CEO+VP+总监 或 经理+资深+新人\n\n先手玩家必须出成型牌，后手玩家可以出混合牌（但必败）'
            },
            {
                title: '比大小规则',
                content: '• 完整排序（从大到小）：\n  男CEO > 女CEO > 男VP > 女VP > 男总监 > 女总监 > 男经理 > 女经理 > 男资深 > 女资深 > 男新人 > 女新人\n\n• 成对：男双VP > 女双VP > ...\n• 顺子：CEO-VP-总监 > 经理-资深-新人\n• 混合牌必败于成型牌'
            },
            {
                title: '游戏流程',
                content: '1. 猜拳决定先手\n2. 手牌对战阶段\n3. 备战区对战阶段\n4. 一方备战区无棋子则失败\n\n每回合赢家先手，赢家获得败家的角色牌'
            }
        ];

        const step = steps[this.tutorialStep];
        document.getElementById('tutorial-title').textContent = step.title;
        document.getElementById('tutorial-content').textContent = step.content;
        document.getElementById('tutorial-progress').textContent = `${this.tutorialStep + 1} / ${steps.length}`;
        document.getElementById('btn-tutorial-next').textContent = this.tutorialStep === steps.length - 1 ? '开始游戏' : '下一步';
    }

    /**
     * 下一个教程步骤
     */
    nextTutorialStep() {
        const totalSteps = 5;
        if (this.tutorialStep < totalSteps - 1) {
            this.tutorialStep++;
            this.showTutorialStep();
        } else {
            this.endTutorial();
        }
    }

    /**
     * 结束教程
     */
    endTutorial() {
        document.getElementById('tutorial-modal')?.classList.remove('active');
    }

    // ============================================
    // 在线对战相关方法
    // ============================================

    /**
     * 显示在线对战模态框
     */
    showOnlineModal() {
        document.getElementById('online-modal')?.classList.add('active');
        this.showOnlineSection('mode-select');
    }

    /**
     * 隐藏在线对战模态框
     */
    hideOnlineModal() {
        document.getElementById('online-modal')?.classList.remove('active');
    }

    /**
     * 显示在线模块的不同区域
     */
    showOnlineSection(section) {
        const sections = ['mode-select', 'create', 'join', 'connecting', 'error'];
        sections.forEach(s => {
            const el = document.getElementById(`online-${s}`);
            if (el) el.style.display = s === section ? 'block' : 'none';
        });
    }

    /**
     * 创建在线房间
     */
    createOnlineRoom() {
        const roomCode = networkManager.createRoom();

        // 显示房间码
        document.getElementById('created-room-code').textContent = roomCode;
        this.showOnlineSection('create');

        // 检查是否支持分享
        const shareBtn = document.getElementById('btn-share-code');
        if (shareBtn && navigator.share) {
            shareBtn.style.display = 'inline-block';
        }

        // 设置连接回调
        networkManager.onConnected = (isHost) => {
            this.hideOnlineModal();
            this.startOnlineGame(isHost);
        };

        networkManager.onError = (message) => {
            document.getElementById('online-error-msg').textContent = message;
            this.showOnlineSection('error');
        };

        networkManager.onDisconnected = () => {
            this.showDisconnectOverlay('对手断开连接');
        };
    }

    /**
     * 加入在线房间
     */
    joinOnlineRoom() {
        const code = document.getElementById('input-room-code').value.trim();

        if (code.length !== 6) {
            this.showMessage('请输入6位房间码');
            return;
        }

        this.showOnlineSection('connecting');

        networkManager.joinRoom(code);

        networkManager.onConnected = (isHost) => {
            this.hideOnlineModal();
            this.startOnlineGame(isHost);
        };

        networkManager.onError = (message) => {
            document.getElementById('online-error-msg').textContent = message;
            this.showOnlineSection('error');
        };

        networkManager.onDisconnected = () => {
            this.showDisconnectOverlay('对手断开连接');
        };
    }

    /**
     * 复制房间码
     */
    async copyRoomCode() {
        const code = document.getElementById('created-room-code').textContent;

        try {
            await navigator.clipboard.writeText(code);
            this.showMessage('房间码已复制！');
            soundManager.play('click');
        } catch (err) {
            // 降级方案
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showMessage('房间码已复制！');
        }
    }

    /**
     * 分享房间码
     */
    async shareRoomCode() {
        const code = document.getElementById('created-room-code').textContent;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: '职场大乱斗 - 在线对战',
                    text: `来和我对战吧！房间码: ${code}`,
                    url: window.location.href
                });
            } catch (err) {
                // 用户取消，回退到复制
                this.copyRoomCode();
            }
        } else {
            this.copyRoomCode();
        }
    }

    /**
     * 开始在线游戏
     */
    startOnlineGame(isHost) {
        this.isOnlineMode = true;

        // 创建在线游戏实例
        this.onlineGame = new OnlineGame(networkManager);
        this.game = this.onlineGame;

        // 设置回调
        this.game.onStateChange = (state) => this.updateOnlineUI(state);
        this.game.onRoundEnd = (winner, loser, result) => this.handleRoundEnd(winner, loser, result);
        this.game.onGameEnd = (winner, loser) => this.handleGameEnd(winner, loser);

        // 设置猜拳平局回调
        this.onlineGame.onRPSDraw = () => this.handleOnlineRPSDraw();

        // 设置收到先手出牌回调 - 显示对手的牌背面
        this.onlineGame.onFirstPlayReceived = async (pieces) => {
            const isReserve = this.game.getState().phase === 'reserve';
            // 对手的牌显示在对手区域（如果本地是玩家1，对手是玩家2，反之亦然）
            const opponentId = this.onlineGame.localPlayerId === 1 ? 2 : 1;
            await this.showPlayCards(pieces, opponentId, isReserve);
            soundManager.play('play');
            this.showMessage(`对手已出牌，请选择${pieces.length}张牌回应`);
        };

        // 初始化游戏
        const localName = isHost ? '房主' : '挑战者';
        const remoteName = isHost ? '挑战者' : '房主';

        this.onlineGame.initOnline(localName, remoteName, isHost);

        this.selectedPieces = [];
        this.selectedPiles = [];
        this.localRPSChoice = null;

        soundManager.play('win');

        this.showScreen('game');
        this.showGamePhase('rps');

        // 挑战者显示等待提示
        if (!isHost) {
            this.showWaitingOverlay('等待房主发牌...');
        }
    }

    /**
     * 更新在线游戏UI
     */
    updateOnlineUI(state) {
        // 更新玩家信息
        this.updateOnlinePlayerInfo(state);

        // 更新手牌显示（只显示自己的牌）
        this.updateOnlineHandDisplay(state);

        // 更新游戏日志
        this.updateGameLog(state);

        // 更新出牌方式按钮
        this.updatePlayModeButtons(state);

        // 更新备战区显示
        this.updateReserveDisplay();

        // 根据阶段切换界面
        if (state.phase === 'hand') {
            this.showGamePhase('play');
        } else if (state.phase === 'reserve') {
            this.showGamePhase('reserve');
        } else if (state.phase === 'ended') {
            this.showGamePhase('result');
        }

        // 检查是否需要显示等待提示 - 使用头像旁的思考状态而非遮罩
        if (this.isOnlineMode) {
            this.updateThinkingIndicator(state);
        }
    }

    /**
     * 更新思考状态指示器
     */
    updateThinkingIndicator(state) {
        if (!this.onlineGame) return;

        const localId = this.onlineGame.localPlayerId;
        const opponentId = localId === 1 ? 2 : 1;
        const isOpponentTurn = !this.isLocalPlayerTurn(state);

        // 获取对手的思考状态元素
        const thinkingEl = document.getElementById(`p${opponentId}-thinking`);
        const thinkingText = document.getElementById(`p${opponentId}-thinking-text`);

        if (isOpponentTurn && state.phase !== 'ended') {
            // 对手正在思考
            if (thinkingEl) thinkingEl.style.display = 'flex';
            if (thinkingText) thinkingText.style.display = 'block';
        } else {
            // 隐藏思考状态
            if (thinkingEl) thinkingEl.style.display = 'none';
            if (thinkingText) thinkingText.style.display = 'none';
        }

        // 同时隐藏本地玩家的思考状态
        const localThinkingEl = document.getElementById(`p${localId}-thinking`);
        const localThinkingText = document.getElementById(`p${localId}-thinking-text`);
        if (localThinkingEl) localThinkingEl.style.display = 'none';
        if (localThinkingText) localThinkingText.style.display = 'none';
    }

    /**
     * 判断是否轮到本地玩家
     */
    isLocalPlayerTurn(state) {
        if (!this.onlineGame) return false;
        return this.onlineGame.isLocalPlayerTurn();
    }

    /**
     * 更新在线玩家信息显示
     */
    updateOnlinePlayerInfo(state) {
        const localId = this.onlineGame?.localPlayerId;
        if (!localId) return;

        // 根据本地玩家ID确定显示
        const isLocalPlayer1 = localId === 1;

        // 更新玩家1区域（下方，本地玩家）
        const p1Name = document.getElementById('p1-name');
        const p1HandCount = document.getElementById('p1-hand-count');
        const p1ReserveCount = document.getElementById('p1-reserve-count');

        // 更新玩家2区域（上方，对手）
        const p2Name = document.getElementById('p2-name');
        const p2HandCount = document.getElementById('p2-hand-count');
        const p2ReserveCount = document.getElementById('p2-reserve-count');

        if (isLocalPlayer1) {
            // 本地是玩家1
            if (p1Name) p1Name.textContent = state.player1.name + ' (你)';
            if (p1HandCount) p1HandCount.textContent = state.player1.handCount;
            if (p1ReserveCount) p1ReserveCount.textContent = state.player1.reservePileCount;

            if (p2Name) p2Name.textContent = state.player2.name;
            if (p2HandCount) p2HandCount.textContent = state.player2.handCount;
            if (p2ReserveCount) p2ReserveCount.textContent = state.player2.reservePileCount;
        } else {
            // 本地是玩家2
            if (p1Name) p1Name.textContent = state.player1.name;
            if (p1HandCount) p1HandCount.textContent = state.player1.handCount;
            if (p1ReserveCount) p1ReserveCount.textContent = state.player1.reservePileCount;

            if (p2Name) p2Name.textContent = state.player2.name + ' (你)';
            if (p2HandCount) p2HandCount.textContent = state.player2.handCount;
            if (p2ReserveCount) p2ReserveCount.textContent = state.player2.reservePileCount;
        }

        // 高亮当前先手玩家
        const player1Area = document.getElementById('player1-area');
        const player2Area = document.getElementById('player2-area');

        if (player1Area) player1Area.classList.toggle('active', state.currentPlayerId === 1);
        if (player2Area) player2Area.classList.toggle('active', state.currentPlayerId === 2);
    }

    /**
     * 更新在线手牌显示（只显示自己的牌）
     */
    updateOnlineHandDisplay(state) {
        const container = document.getElementById('player-hand');
        if (!container || !this.onlineGame) return;

        container.innerHTML = '';

        // 获取本地玩家的手牌
        const localPlayer = this.onlineGame.getLocalPlayer();
        if (!localPlayer) return;

        const hand = localPlayer.handPieces;
        const sortedHand = this.sortHandCards(hand);

        sortedHand.forEach(({ piece, originalIndex }) => {
            const isSelected = this.selectedPieces.includes(originalIndex);
            const cardHtml = getPieceCardHtml(piece, originalIndex, isSelected, true);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            const pieceEl = tempDiv.firstElementChild;

            pieceEl.addEventListener('click', () => {
                if (this.isLocalPlayerTurn(this.game.getState())) {
                    soundManager.play('select');
                    this.togglePieceSelection(originalIndex, piece);
                }
            });

            container.appendChild(pieceEl);
        });
    }

    /**
     * 在线模式确认出牌
     */
    async confirmOnlinePlay() {
        const state = this.game.getState();
        const localId = this.onlineGame.localPlayerId;

        const localPlayer = this.onlineGame.getLocalPlayer();
        const selectedPieceChars = this.selectedPieces.map(i => localPlayer.handPieces[i]);

        if (selectedPieceChars.length === 0) {
            this.showMessage('请选择要出的牌');
            return;
        }

        // 判断是否是备战区阶段
        const isReserve = state.phase === 'reserve';

        const isLocalFirst = state.currentPlayerId === localId;

        if (state.firstPlayerPieces.length === 0) {
            // 本轮还没人出牌
            if (isLocalFirst) {
                // 本地是先手
                if (this.onlineGame.onlineFirstPlayerPlay(selectedPieceChars)) {
                    // 本地玩家是玩家1显示在p1，是玩家2显示在p2
                    const displaySlot = localId === 1 ? 1 : 2;
                    await this.showPlayCards(selectedPieceChars, displaySlot, isReserve);
                    this.playCardSound(selectedPieceChars);
                    this.selectedPieces = [];
                    // 不再显示遮罩，思考状态会在 updateOnlineUI 中自动更新
                }
            }
        } else {
            // 先手已出牌，本地是后手
            if (!isLocalFirst) {
                if (this.onlineGame.onlineSecondPlayerPlay(selectedPieceChars)) {
                    const displaySlot = localId === 1 ? 1 : 2;
                    await this.showPlayCards(selectedPieceChars, displaySlot, isReserve);
                    this.playCardSound(selectedPieceChars);
                    this.selectedPieces = [];
                    // 等待一小段时间后翻牌
                    setTimeout(() => {
                        this.revealAllPlayCards();
                    }, 150);
                }
            }
        }
    }

    /**
     * 在线模式处理猜拳
     */
    handleOnlineRockPaperScissors(choice) {
        if (this.localRPSChoice !== null) return; // 已经选过了

        this.localRPSChoice = choice;
        this.onlineGame.sendRPSChoice(choice);

        // 更新UI显示选择
        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.choice === choice) {
                btn.classList.add('selected');
            }
        });

        // 显示等待
        document.getElementById('rps-result').textContent = '已选择，等待对手...';
    }

    /**
     * 处理在线猜拳平局
     */
    handleOnlineRPSDraw() {
        // 重新启用按钮
        document.querySelectorAll('.rps-btn').forEach(btn => {
            btn.disabled = false;
            btn.classList.remove('selected');
        });

        // 显示平局提示
        const rpsResult = document.getElementById('rps-result');
        if (rpsResult) {
            rpsResult.innerHTML = '平局！请重新出拳';
        }

        soundManager.play('rps');
    }

    /**
     * 显示等待遮罩
     */
    showWaitingOverlay(text = '等待对手...') {
        const overlay = document.getElementById('waiting-overlay');
        const textEl = document.getElementById('waiting-text');
        if (overlay) {
            overlay.style.display = 'flex';
            if (textEl) textEl.textContent = text;
        }
    }

    /**
     * 隐藏等待遮罩
     */
    hideWaitingOverlay() {
        const overlay = document.getElementById('waiting-overlay');
        if (overlay) overlay.style.display = 'none';
    }

    /**
     * 显示断线遮罩
     */
    showDisconnectOverlay(text = '连接已断开') {
        this.hideWaitingOverlay();

        const overlay = document.getElementById('disconnect-overlay');
        const textEl = document.getElementById('disconnect-text');
        if (overlay) {
            overlay.style.display = 'flex';
            if (textEl) textEl.textContent = text;
        }
    }

    /**
     * 隐藏断线遮罩
     */
    hideDisconnectOverlay() {
        const overlay = document.getElementById('disconnect-overlay');
        if (overlay) overlay.style.display = 'none';
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UI };
}
