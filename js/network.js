/**
 * 网络管理器 - 使用 PeerJS 实现 P2P 通信
 * 用于在线对战功能
 */

// 消息类型定义
const MessageType = {
    // 连接相关
    PLAYER_JOIN: 'player_join',      // 玩家加入
    PLAYER_READY: 'player_ready',    // 玩家准备

    // 游戏初始化
    GAME_INIT: 'game_init',          // 游戏初始化数据
    RPS_CHOICE: 'rps_choice',        // 猜拳选择
    RPS_RESULT: 'rps_result',        // 猜拳结果

    // 游戏进行中
    PLAY_COUNT: 'play_count',        // 出牌数量决定
    FIRST_PLAY: 'first_play',        // 先手出牌
    SECOND_PLAY: 'second_play',      // 后手出牌
    ROUND_RESULT: 'round_result',    // 回合结果

    // 备战区阶段
    RESERVE_COUNT: 'reserve_count',  // 备战区堆数选择
    RESERVE_SELECT_RESULT: 'reserve_select_result', // 备战区选择结果

    // 系统
    CHAT: 'chat',                    // 聊天消息
    PING: 'ping',                    // 心跳检测
    PONG: 'pong',                    // 心跳响应
    DISCONNECT: 'disconnect'         // 断开通知
};

/**
 * 网络管理器类
 */
class NetworkManager {
    constructor() {
        this.peer = null;           // PeerJS实例
        this.connection = null;     // 当前连接
        this.roomCode = null;       // 房间码
        this.isHost = false;        // 是否是房主
        this.isConnected = false;   // 连接状态

        // 回调函数
        this.onConnected = null;    // 连接成功
        this.onDisconnected = null; // 断开连接
        this.onMessage = null;      // 收到消息
        this.onError = null;        // 错误处理
    }

    /**
     * 生成6位房间码（排除易混淆字符）
     */
    generateRoomCode() {
        // 排除 I, O, 0, 1, L 等易混淆字符
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    /**
     * 创建房间（房主调用）
     * @returns {string} 房间码
     */
    createRoom() {
        this.roomCode = this.generateRoomCode();
        this.isHost = true;

        // 使用固定前缀 + 房间码作为 Peer ID
        const peerId = `CHESS_${this.roomCode}`;

        this.peer = new Peer(peerId, {
            debug: 0
        });

        this.peer.on('open', (id) => {
            console.log('房间创建成功，等待对手加入:', id);
        });

        this.peer.on('connection', (conn) => {
            // 只接受一个连接
            if (this.connection) {
                conn.close();
                return;
            }

            this.connection = conn;
            console.log('对手已连接:', conn.peer);
            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            this.handleError(err);
        });

        return this.roomCode;
    }

    /**
     * 加入房间（挑战者调用）
     * @param {string} code - 房间码
     */
    joinRoom(code) {
        this.roomCode = code.toUpperCase().trim();
        this.isHost = false;

        this.peer = new Peer({
            debug: 0
        });

        this.peer.on('open', () => {
            console.log('正在连接房间:', this.roomCode);

            this.connection = this.peer.connect(`CHESS_${this.roomCode}`, {
                reliable: true,
                serialization: 'json'
            });

            this.setupConnection();
        });

        this.peer.on('error', (err) => {
            this.handleError(err);
        });
    }

    /**
     * 设置连接事件监听
     */
    setupConnection() {
        if (!this.connection) return;

        this.connection.on('open', () => {
            this.isConnected = true;
            console.log('连接已建立');

            if (this.onConnected) {
                this.onConnected(this.isHost);
            }
        });

        this.connection.on('data', (data) => {
            console.log('收到消息:', data.type);
            if (this.onMessage) {
                this.onMessage(data);
            }
        });

        this.connection.on('close', () => {
            this.isConnected = false;
            console.log('连接已断开');

            if (this.onDisconnected) {
                this.onDisconnected();
            }
        });

        this.connection.on('error', (err) => {
            console.error('连接错误:', err);
            this.handleError(err);
        });
    }

    /**
     * 发送消息
     * @param {string} type - 消息类型
     * @param {object} payload - 消息内容
     * @returns {boolean} 是否发送成功
     */
    send(type, payload = {}) {
        if (!this.isConnected || !this.connection) {
            console.warn('未连接，无法发送消息');
            return false;
        }

        const message = {
            type,
            payload,
            timestamp: Date.now()
        };

        try {
            this.connection.send(message);
            return true;
        } catch (err) {
            console.error('发送消息失败:', err);
            return false;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        // 发送断开通知
        if (this.isConnected) {
            this.send(MessageType.DISCONNECT);
        }

        // 关闭连接
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }

        // 销毁 Peer
        if (this.peer) {
            this.peer.destroy();
            this.peer = null;
        }

        this.isConnected = false;
        this.roomCode = null;
        this.isHost = false;
    }

    /**
     * 错误处理
     * @param {Error} err - 错误对象
     */
    handleError(err) {
        console.error('网络错误:', err);

        let message = '连接失败，请重试';

        if (err.type === 'peer-unavailable') {
            message = '房间不存在或已关闭';
        } else if (err.type === 'disconnected') {
            message = '已与服务器断开连接';
        } else if (err.type === 'network') {
            message = '网络连接异常';
        } else if (err.type === 'browser-incompatible') {
            message = '浏览器不支持 WebRTC';
        }

        if (this.onError) {
            this.onError(message);
        }
    }

    /**
     * 获取连接状态
     */
    getState() {
        return {
            isConnected: this.isConnected,
            isHost: this.isHost,
            roomCode: this.roomCode
        };
    }
}

// 导出单例
const networkManager = new NetworkManager();

// 也导出类和消息类型，供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { NetworkManager, networkManager, MessageType };
}
