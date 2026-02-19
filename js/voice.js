/**
 * 语音系统 - 使用 Web Speech Synthesis API
 */

class VoiceManager {
    constructor() {
        this.enabled = true;
        this.rate = 1.0;
        this.pitch = 1.0;
    }

    /**
     * 检查语音合成是否可用
     */
    isAvailable() {
        return 'speechSynthesis' in window;
    }

    /**
     * 朗读文本
     * @param {string} text - 要朗读的文本
     * @param {object} options - 选项
     */
    speak(text, options = {}) {
        if (!this.enabled || !this.isAvailable()) return;

        // 取消当前正在播放的语音
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = options.rate || this.rate;
        utterance.pitch = options.pitch || this.pitch;
        utterance.volume = options.volume || 1;

        // 尝试使用中文语音
        const voices = window.speechSynthesis.getVoices();
        const chineseVoice = voices.find(v =>
            v.lang.includes('zh') || v.lang.includes('CN')
        );
        if (chineseVoice) {
            utterance.voice = chineseVoice;
        }

        window.speechSynthesis.speak(utterance);
    }

    /**
     * 根据出牌类型播放语音
     * @param {string[]} pieces - 出牌
     * @param {string} type - 'single', 'pair', 'sequence'
     */
    playCardVoice(pieces, type) {
        if (!this.enabled) return;

        const voice = this.getCardVoice(pieces, type);
        if (voice) {
            this.speak(voice);
        }
    }

    /**
     * 获取出牌语音文本
     * @param {string[]} pieces
     * @param {string} type
     * @returns {string}
     */
    getCardVoice(pieces, type) {
        const piece = pieces[0];
        const isUpper = piece === piece.toUpperCase();

        if (type === 'single') {
            return this.getSingleVoice(piece);
        }

        if (type === 'pair') {
            return this.getPairVoice(piece);
        }

        if (type === 'sequence') {
            return this.getSequenceVoice(pieces);
        }

        return null;
    }

    /**
     * 单个出牌语音
     */
    getSingleVoice(piece) {
        const voices = {
            'A': '我来搞定',
            'a': '我来搞定',
            'B': '交给我',
            'b': '交给我',
            'C': '我去谈谈',
            'c': '我去谈谈',
            'D': '我去沟通',
            'd': '我去沟通',
            'E': '我试试',
            'e': '我试试',
            'F': '老板，让我去？',
            'f': '老板，让我去？'
        };
        return voices[piece];
    }

    /**
     * 成对出牌语音
     */
    getPairVoice(piece) {
        const voices = {
            'B': '咱们俩上',
            'b': '咱们俩上',
            'C': '两个总监，够不够？',
            'c': '两个总监，够不够？',
            'D': '分头行动',
            'd': '分头行动',
            'E': '一起上！',
            'e': '一起上！',
            'F': '新人组合！',
            'f': '新人组合！'
        };
        return voices[piece];
    }

    /**
     * 顺子出牌语音
     */
    getSequenceVoice(pieces) {
        const sorted = [...pieces].sort().join('');

        const voices = {
            'ABC': '高管团出动！',
            'abc': '核心团队，出发！',
            'DEF': '执行层全员出动！',
            'def': '基层突击队！'
        };

        return voices[sorted];
    }

    /**
     * 播放获胜语音
     * @param {string} piece - 获胜棋子
     */
    playWinVoice(piece) {
        if (!this.enabled) return;

        const voices = {
            'A': '理所当然',
            'a': '理所当然',
            'B': '小意思',
            'b': '小意思',
            'C': '谈妥了',
            'c': '谈妥了',
            'D': '搞定了',
            'd': '搞定了',
            'E': '还行吧',
            'e': '还行吧',
            'F': '我做到了！',
            'f': '我做到了！'
        };

        this.speak(voices[piece] || '赢了');
    }

    /**
     * 播放失败语音
     * @param {string} piece - 失败棋子
     */
    playLoseVoice(piece) {
        if (!this.enabled) return;

        const voices = {
            'A': '不可能！',
            'a': '不可能！',
            'B': '大意了',
            'b': '大意了',
            'C': '下次一定',
            'c': '下次一定',
            'D': '有点难搞',
            'd': '有点难搞',
            'E': '尽力了',
            'e': '尽力了',
            'F': '对不起老板',
            'f': '对不起老板'
        };

        this.speak(voices[piece] || '输了', { pitch: 0.8 });
    }

    /**
     * 播放游戏开始语音
     */
    playGameStart() {
        this.speak('游戏开始，准备挖人！');
    }

    /**
     * 播放游戏结束语音
     * @param {boolean} isWinner
     */
    playGameEnd(isWinner) {
        if (isWinner) {
            this.speak('公司吞并成功！');
        } else {
            this.speak('公司被吞并了...');
        }
    }

    /**
     * 播放回合结果
     * @param {boolean} isWin
     */
    playRoundResult(isWin) {
        if (isWin) {
            this.speak('挖人成功！');
        } else {
            this.speak('被挖走了...');
        }
    }

    /**
     * 切换语音开关
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }
}

// 创建全局语音管理器
const voiceManager = new VoiceManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { VoiceManager, voiceManager };
}
