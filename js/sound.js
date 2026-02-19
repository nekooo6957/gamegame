/**
 * 音效系统 - 使用 Web Audio API 生成
 */

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.enabled = true;
        this.volume = 0.5;
        this.bgmEnabled = true;
        this.bgmGain = null;
        this.bgmOscillator = null;
    }

    /**
     * 初始化音频上下文
     */
    init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('音效系统已初始化');
        } catch (e) {
            console.warn('Web Audio API 不支持');
            this.enabled = false;
        }
    }

    /**
     * 确保音频上下文已激活
     */
    ensureContext() {
        if (!this.audioContext) {
            this.init();
        }
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
    }

    /**
     * 播放音效
     * @param {string} type - 音效类型
     */
    play(type) {
        if (!this.enabled) return;
        this.ensureContext();

        switch (type) {
            case 'click':
                this.playClick();
                break;
            case 'select':
                this.playSelect();
                break;
            case 'play':
                this.playCardSound();
                break;
            case 'win':
                this.playWin();
                break;
            case 'lose':
                this.playLose();
                break;
            case 'pair':
                this.playPair();
                break;
            case 'sequence':
                this.playSequence();
                break;
            case 'mixed':
                this.playMixed();
                break;
            case 'rps':
                this.playRPS();
                break;
            case 'countdown':
                this.playCountdown();
                break;
        }
    }

    /**
     * 点击音效
     */
    playClick() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.frequency.setValueAtTime(800, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.1);

        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * 选择音效
     */
    playSelect() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.05);

        gain.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * 出牌音效
     */
    playCardSound() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(600, this.audioContext.currentTime + 0.15);

        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.2);
    }

    /**
     * 获胜音效
     */
    playWin() {
        const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6

        notes.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.1);

            gain.gain.setValueAtTime(0, this.audioContext.currentTime + i * 0.1);
            gain.gain.linearRampToValueAtTime(this.volume * 0.3, this.audioContext.currentTime + i * 0.1 + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.1 + 0.3);

            osc.start(this.audioContext.currentTime + i * 0.1);
            osc.stop(this.audioContext.currentTime + i * 0.1 + 0.3);
        });
    }

    /**
     * 失败音效
     */
    playLose() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.audioContext.currentTime);
        osc.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + 0.5);

        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.5);
    }

    /**
     * 成对出牌音效
     */
    playPair() {
        [0, 0.1].forEach((delay, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(500 + i * 100, this.audioContext.currentTime + delay);

            gain.gain.setValueAtTime(this.volume * 0.25, this.audioContext.currentTime + delay);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + delay + 0.15);

            osc.start(this.audioContext.currentTime + delay);
            osc.stop(this.audioContext.currentTime + delay + 0.15);
        });
    }

    /**
     * 顺子出牌音效
     */
    playSequence() {
        [400, 500, 600].forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.08);

            gain.gain.setValueAtTime(this.volume * 0.25, this.audioContext.currentTime + i * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.08 + 0.2);

            osc.start(this.audioContext.currentTime + i * 0.08);
            osc.stop(this.audioContext.currentTime + i * 0.08 + 0.2);
        });
    }

    /**
     * 混合牌音效（滑稽）
     */
    playMixed() {
        const freqs = [300, 450, 350, 500];
        freqs.forEach((freq, i) => {
            const osc = this.audioContext.createOscillator();
            const gain = this.audioContext.createGain();

            osc.connect(gain);
            gain.connect(this.audioContext.destination);

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, this.audioContext.currentTime + i * 0.05);

            gain.gain.setValueAtTime(this.volume * 0.15, this.audioContext.currentTime + i * 0.05);
            gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + i * 0.05 + 0.1);

            osc.start(this.audioContext.currentTime + i * 0.05);
            osc.stop(this.audioContext.currentTime + i * 0.05 + 0.1);
        });
    }

    /**
     * 猜拳音效
     */
    playRPS() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
        osc.frequency.setValueAtTime(550, this.audioContext.currentTime + 0.1);
        osc.frequency.setValueAtTime(660, this.audioContext.currentTime + 0.2);

        gain.gain.setValueAtTime(this.volume * 0.3, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.3);
    }

    /**
     * 倒计时音效
     */
    playCountdown() {
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();

        osc.connect(gain);
        gain.connect(this.audioContext.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, this.audioContext.currentTime);

        gain.gain.setValueAtTime(this.volume * 0.2, this.audioContext.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * 开始背景音乐（简单的循环旋律）
     */
    startBGM() {
        if (!this.enabled || !this.bgmEnabled) return;
        this.ensureContext();

        if (this.bgmOscillator) return; // 已经在播放

        // 创建简单的背景音乐
        this.bgmGain = this.audioContext.createGain();
        this.bgmGain.connect(this.audioContext.destination);
        this.bgmGain.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);

        // 使用低频振荡器作为基础
        this.bgmOscillator = this.audioContext.createOscillator();
        this.bgmOscillator.type = 'sine';
        this.bgmOscillator.frequency.setValueAtTime(110, this.audioContext.currentTime);
        this.bgmOscillator.connect(this.bgmGain);
        this.bgmOscillator.start();
    }

    /**
     * 停止背景音乐
     */
    stopBGM() {
        if (this.bgmOscillator) {
            this.bgmOscillator.stop();
            this.bgmOscillator = null;
        }
        if (this.bgmGain) {
            this.bgmGain = null;
        }
    }

    /**
     * 切换音效开关
     */
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * 切换背景音乐开关
     */
    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        if (this.bgmEnabled) {
            this.startBGM();
        } else {
            this.stopBGM();
        }
        return this.bgmEnabled;
    }

    /**
     * 设置音量
     * @param {number} vol - 0到1之间
     */
    setVolume(vol) {
        this.volume = Math.max(0, Math.min(1, vol));
        if (this.bgmGain) {
            this.bgmGain.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
        }
    }
}

// 创建全局音效管理器
const soundManager = new SoundManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SoundManager, soundManager };
}
