/**
 * 棋子定义和游戏规则
 * 职场主题：A公司（大写） vs a公司（小写）
 */

// 棋子等级定义（数值越大越强）
const PIECE_RANKS = {
    'A': 12, 'a': 11,
    'B': 10, 'b': 9,
    'C': 8,  'c': 7,
    'D': 6,  'd': 5,
    'E': 4,  'e': 3,
    'F': 2,  'f': 1
};

// 初始棋子配置
const INITIAL_PIECES = {
    uppercase: ['A', 'B', 'B', 'C', 'C', 'D', 'D', 'E', 'E', 'F', 'F'],
    lowercase: ['a', 'b', 'b', 'c', 'c', 'd', 'd', 'e', 'e', 'f', 'f']
};

// 职级名称
const PIECE_NAMES = {
    'A': 'CEO', 'a': 'CEO',
    'B': 'VP',  'b': 'VP',
    'C': '总监', 'c': '总监',
    'D': '经理', 'd': '经理',
    'E': '资深', 'e': '资深',
    'F': '新人', 'f': '新人'
};

// 阵营名称
const FACTION_NAMES = {
    uppercase: 'A公司',
    lowercase: 'a公司'
};

/**
 * 棋子类
 */
class Piece {
    constructor(char) {
        this.char = char;
        this.rank = PIECE_RANKS[char];
        this.isUppercase = char === char.toUpperCase();
        this.name = PIECE_NAMES[char];
        this.faction = this.isUppercase ? 'uppercase' : 'lowercase';
    }

    toString() {
        return this.char;
    }

    /**
     * 比较两个棋子大小
     * @returns {number} 正数表示this大，负数表示other大，0表示相等
     */
    compare(other) {
        return this.rank - other.rank;
    }
}

/**
 * 判断是否为有效的成对出棋
 * @param {string[]} pieces - 两个棋子字符
 * @returns {boolean}
 */
function isValidPair(pieces) {
    if (pieces.length !== 2) return false;
    const [p1, p2] = pieces;
    // 相同字母，相同大小写，且不能是AA或aa
    if (p1.toUpperCase() === p2.toUpperCase() && p1 === p2) {
        // 检查是否是AA或aa
        if (p1.toUpperCase() === 'A') return false;
        return true;
    }
    return false;
}

/**
 * 判断是否为有效的顺子
 * @param {string[]} pieces - 三个棋子字符
 * @returns {boolean}
 */
function isValidSequence(pieces) {
    if (pieces.length !== 3) return false;

    // 检查是否都是同一大小写
    const isAllUpper = pieces.every(p => p === p.toUpperCase());
    const isAllLower = pieces.every(p => p === p.toLowerCase());

    if (!isAllUpper && !isAllLower) return false;

    const sorted = [...pieces].map(p => p.toUpperCase()).sort();

    // 检查是否是ABC或DEF
    const validSequences = [
        ['A', 'B', 'C'],
        ['D', 'E', 'F']
    ];

    return validSequences.some(seq =>
        sorted[0] === seq[0] && sorted[1] === seq[1] && sorted[2] === seq[2]
    );
}

/**
 * 判断是否为成型出棋
 * @param {string[]} pieces - 棋子字符数组
 * @returns {boolean}
 */
function isFormedCards(pieces) {
    if (pieces.length === 1) return true;
    if (pieces.length === 2) return isValidPair(pieces);
    if (pieces.length === 3) return isValidSequence(pieces);
    return false;
}

/**
 * 比较两组棋子的大小
 * @param {string[]} pieces1 - 第一组棋子
 * @param {string[]} pieces2 - 第二组棋子
 * @returns {number} 正数表示pieces1胜，负数表示pieces2胜，0表示平局
 */
function comparePieces(pieces1, pieces2) {
    const formed1 = isFormedCards(pieces1);
    const formed2 = isFormedCards(pieces2);

    // 混合牌必败于成型牌
    if (formed1 && !formed2) return 1;
    if (!formed1 && formed2) return -1;

    // 都是单个棋子
    if (pieces1.length === 1 && pieces2.length === 1) {
        return PIECE_RANKS[pieces1[0]] - PIECE_RANKS[pieces2[0]];
    }

    // 都是成对棋子
    if (pieces1.length === 2 && pieces2.length === 2) {
        return PIECE_RANKS[pieces1[0]] - PIECE_RANKS[pieces2[0]];
    }

    // 都是顺子
    if (pieces1.length === 3 && pieces2.length === 3) {
        // 顺子大小：ABC > abc > DEF > def
        const seqRanks = {
            'ABC': 4, 'abc': 3, 'DEF': 2, 'def': 1
        };

        const getSeqKey = (pieces) => {
            const sorted = [...pieces].sort().join('');
            return sorted;
        };

        return (seqRanks[getSeqKey(pieces1)] || 0) - (seqRanks[getSeqKey(pieces2)] || 0);
    }

    // 备战区多堆比较（4个或6个棋子）
    // 比较所有棋子的总等级值
    if (pieces1.length === pieces2.length && pieces1.length > 3) {
        const sum1 = pieces1.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
        const sum2 = pieces2.reduce((sum, p) => sum + PIECE_RANKS[p], 0);
        return sum1 - sum2;
    }

    return 0;
}

/**
 * 获取顺子类型
 * @param {string[]} pieces - 三个棋子字符
 * @returns {string|null} 顺子类型
 */
function getSequenceType(pieces) {
    if (!isValidSequence(pieces)) return null;

    const sorted = [...pieces].sort().join('');
    return sorted;
}

/**
 * 随机分配棋子
 * @returns {{player1: string[], player2: string[]}}
 */
function shufflePieces() {
    const allPieces = [...INITIAL_PIECES.uppercase, ...INITIAL_PIECES.lowercase];

    // Fisher-Yates 洗牌算法
    for (let i = allPieces.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPieces[i], allPieces[j]] = [allPieces[j], allPieces[i]];
    }

    return {
        player1: allPieces.slice(0, 11),
        player2: allPieces.slice(11, 22)
    };
}

// 导出（用于其他模块）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        PIECE_RANKS,
        INITIAL_PIECES,
        PIECE_NAMES,
        FACTION_NAMES,
        Piece,
        isValidPair,
        isValidSequence,
        isFormedCards,
        comparePieces,
        getSequenceType,
        shufflePieces
    };
}
