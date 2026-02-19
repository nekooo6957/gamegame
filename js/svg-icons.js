/**
 * SVG图标管理模块
 * 为6种职级定义扁平化人物图标
 * 大写(A-F)=男性=金色系，小写(a-f)=女性=紫色系
 */

const SVG_ICONS = {
    // ===== 男性角色 (A-F) =====

    // CEO - 皇冠装饰 + 最大头部 + 正装领带 + 短发
    'A': `<svg viewBox="0 0 100 120" class="piece-icon ceo male">
        <!-- 皇冠 -->
        <polygon points="35,18 40,8 50,16 60,8 65,18" fill="#FFD700"/>
        <rect x="35" y="16" width="30" height="4" fill="#FFD700"/>
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="28" rx="16" ry="8" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="38" r="18" class="icon-head"/>
        <!-- 眉毛 -->
        <line x1="39" y1="32" x2="46" y2="33" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="54" y1="33" x2="61" y2="32" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 眼睛 -->
        <circle cx="43" cy="36" r="2" fill="#333"/>
        <circle cx="57" cy="36" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M44,44 Q50,49 56,44" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体（宽肩） -->
        <path d="M24,120 L24,62 Q24,52 38,52 L62,52 Q76,52 76,62 L76,120 Z" class="icon-body"/>
        <!-- 领带 -->
        <polygon points="50,54 44,78 50,90 56,78" class="icon-tie"/>
        <!-- 西装领 -->
        <polygon points="38,52 50,68 62,52" fill="rgba(255,255,255,0.2)"/>
    </svg>`,

    // VP - 较大头部 + 简约领带 + 短发
    'B': `<svg viewBox="0 0 100 120" class="piece-icon vp male">
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="30" rx="14" ry="7" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="40" r="16" class="icon-head"/>
        <!-- 眉毛 -->
        <line x1="40" y1="34" x2="47" y2="35" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="53" y1="35" x2="60" y2="34" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 眼睛 -->
        <circle cx="44" cy="38" r="2" fill="#333"/>
        <circle cx="56" cy="38" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M45,46 Q50,50 55,46" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M28,120 L28,60 Q28,52 40,52 L60,52 Q72,52 72,60 L72,120 Z" class="icon-body"/>
        <!-- 领带 -->
        <polygon points="50,54 45,74 50,84 55,74" class="icon-tie"/>
        <!-- 衣领 -->
        <polygon points="40,52 50,64 60,52" fill="rgba(255,255,255,0.2)"/>
    </svg>`,

    // 总监 - 中等头部 + 眼镜装饰 + 短发
    'C': `<svg viewBox="0 0 100 120" class="piece-icon director male">
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="32" rx="12" ry="6" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="42" r="14" class="icon-head"/>
        <!-- 眉毛 -->
        <line x1="41" y1="36" x2="47" y2="37" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="53" y1="37" x2="59" y2="36" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 眼镜框 -->
        <circle cx="43" cy="40" r="6" fill="none" stroke="#333" stroke-width="2"/>
        <circle cx="57" cy="40" r="6" fill="none" stroke="#333" stroke-width="2"/>
        <line x1="49" y1="40" x2="51" y2="40" stroke="#333" stroke-width="2"/>
        <!-- 眼睛 -->
        <circle cx="43" cy="40" r="2" fill="#333"/>
        <circle cx="57" cy="40" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M45,50 Q50,54 55,50" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M30,120 L30,58 Q30,50 42,50 L58,50 Q70,50 70,58 L70,120 Z" class="icon-body"/>
        <!-- 胸牌 -->
        <rect x="40" y="65" width="20" height="10" rx="2" fill="rgba(255,255,255,0.4)"/>
        <line x1="43" y1="68" x2="57" y2="68" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
        <line x1="43" y1="72" x2="52" y2="72" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    </svg>`,

    // 经理 - 标准大小 + 简单衣领 + 短发
    'D': `<svg viewBox="0 0 100 120" class="piece-icon manager male">
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="34" rx="11" ry="5" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="44" r="13" class="icon-head"/>
        <!-- 眉毛 -->
        <line x1="42" y1="38" x2="48" y2="39" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="52" y1="39" x2="58" y2="38" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 眼睛 -->
        <circle cx="45" cy="42" r="2" fill="#333"/>
        <circle cx="55" cy="42" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M46,50 Q50,54 54,50" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M32,120 L32,60 Q32,54 44,54 L56,54 Q68,54 68,60 L68,120 Z" class="icon-body"/>
        <!-- V领 -->
        <polygon points="44,54 50,66 56,54" fill="rgba(255,255,255,0.25)"/>
    </svg>`,

    // 资深 - 稍小头部 + 胸牌装饰 + 短发
    'E': `<svg viewBox="0 0 100 120" class="piece-icon senior male">
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="36" rx="10" ry="5" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="46" r="12" class="icon-head"/>
        <!-- 眉毛 -->
        <line x1="43" y1="40" x2="48" y2="41" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="52" y1="41" x2="57" y2="40" stroke="#333" stroke-width="1.5" stroke-linecap="round"/>
        <!-- 眼睛 -->
        <circle cx="46" cy="44" r="2" fill="#333"/>
        <circle cx="54" cy="44" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M47,52 Q50,55 53,52" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M35,120 L35,62 Q35,56 46,56 L54,56 Q65,56 65,62 L65,120 Z" class="icon-body"/>
        <!-- 胸牌 -->
        <rect x="42" y="70" width="16" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
        <line x1="44" y1="73" x2="56" y2="73" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
    </svg>`,

    // 新人 - 最小头部 + 歪领带 + 短发（可爱感）
    'F': `<svg viewBox="0 0 100 120" class="piece-icon junior male">
        <!-- 头发（短发） -->
        <ellipse cx="50" cy="38" rx="8" ry="4" class="icon-hair-male"/>
        <!-- 头部 -->
        <circle cx="50" cy="48" r="10" class="icon-head"/>
        <!-- 眼睛 - 稍微向外看 -->
        <circle cx="46" cy="46" r="2" fill="#333"/>
        <circle cx="54" cy="46" r="2" fill="#333"/>
        <!-- 不好意思的微笑 -->
        <path d="M47,53 Q50,55 53,53" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 - 略小 -->
        <path d="M38,120 L38,64 Q38,58 46,58 L54,58 Q62,58 62,64 L62,120 Z" class="icon-body"/>
        <!-- 歪领带 -->
        <polygon points="50,60 44,76 49,84 53,74" class="icon-tie" transform="rotate(8, 50, 70)"/>
    </svg>`,

    // ===== 女性角色 (a-f) =====

    // CEO女 - 皇冠装饰 + 长发 + 耳环 + 项链
    'a': `<svg viewBox="0 0 100 120" class="piece-icon ceo female">
        <!-- 皇冠 -->
        <polygon points="35,14 40,4 50,12 60,4 65,14" fill="#FFD700"/>
        <rect x="35" y="12" width="30" height="4" fill="#FFD700"/>
        <!-- 长发 -->
        <ellipse cx="50" cy="30" rx="20" ry="12" class="icon-hair-female"/>
        <ellipse cx="32" cy="50" rx="6" ry="20" class="icon-hair-female"/>
        <ellipse cx="68" cy="50" rx="6" ry="20" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="36" r="16" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="34" cy="40" r="2" fill="#FFD700"/>
        <circle cx="66" cy="40" r="2" fill="#FFD700"/>
        <!-- 睫毛 -->
        <line x1="40" y1="33" x2="43" y2="34" stroke="#333" stroke-width="1"/>
        <line x1="46" y1="33" x2="43" y2="34" stroke="#333" stroke-width="1"/>
        <line x1="54" y1="33" x2="57" y2="34" stroke="#333" stroke-width="1"/>
        <line x1="60" y1="33" x2="57" y2="34" stroke="#333" stroke-width="1"/>
        <!-- 眼睛 -->
        <circle cx="43" cy="35" r="2" fill="#333"/>
        <circle cx="57" cy="35" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M44,42 Q50,47 56,42" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体（纤细） -->
        <path d="M30,120 L30,62 Q30,52 40,52 L60,52 Q70,52 70,62 L70,120 Z" class="icon-body"/>
        <!-- 项链 -->
        <path d="M40,54 Q50,62 60,54" fill="none" stroke="#FFD700" stroke-width="2"/>
        <circle cx="50" cy="62" r="3" fill="#FFD700"/>
        <!-- V领 -->
        <polygon points="40,52 50,64 60,52" fill="rgba(255,255,255,0.2)"/>
    </svg>`,

    // VP女 - 长发 + 耳环 + 项链
    'b': `<svg viewBox="0 0 100 120" class="piece-icon vp female">
        <!-- 长发 -->
        <ellipse cx="50" cy="32" rx="18" ry="10" class="icon-hair-female"/>
        <ellipse cx="34" cy="52" rx="5" ry="18" class="icon-hair-female"/>
        <ellipse cx="66" cy="52" rx="5" ry="18" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="38" r="15" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="35" cy="42" r="2" fill="#FFD700"/>
        <circle cx="65" cy="42" r="2" fill="#FFD700"/>
        <!-- 睫毛 -->
        <line x1="41" y1="35" x2="44" y2="36" stroke="#333" stroke-width="1"/>
        <line x1="47" y1="35" x2="44" y2="36" stroke="#333" stroke-width="1"/>
        <line x1="53" y1="35" x2="56" y2="36" stroke="#333" stroke-width="1"/>
        <line x1="59" y1="35" x2="56" y2="36" stroke="#333" stroke-width="1"/>
        <!-- 眼睛 -->
        <circle cx="44" cy="37" r="2" fill="#333"/>
        <circle cx="56" cy="37" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M45,44 Q50,48 55,44" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M32,120 L32,60 Q32,52 42,52 L58,52 Q68,52 68,60 L68,120 Z" class="icon-body"/>
        <!-- 项链 -->
        <path d="M42,54 Q50,60 58,54" fill="none" stroke="#FFD700" stroke-width="1.5"/>
        <circle cx="50" cy="60" r="2" fill="#FFD700"/>
    </svg>`,

    // 总监女 - 长发 + 眼镜 + 耳环
    'c': `<svg viewBox="0 0 100 120" class="piece-icon director female">
        <!-- 长发 -->
        <ellipse cx="50" cy="34" rx="16" ry="9" class="icon-hair-female"/>
        <ellipse cx="36" cy="54" rx="5" ry="16" class="icon-hair-female"/>
        <ellipse cx="64" cy="54" rx="5" ry="16" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="40" r="14" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="36" cy="44" r="2" fill="#FFD700"/>
        <circle cx="64" cy="44" r="2" fill="#FFD700"/>
        <!-- 眼镜框 -->
        <circle cx="43" cy="38" r="6" fill="none" stroke="#333" stroke-width="2"/>
        <circle cx="57" cy="38" r="6" fill="none" stroke="#333" stroke-width="2"/>
        <line x1="49" y1="38" x2="51" y2="38" stroke="#333" stroke-width="2"/>
        <!-- 眼睛 -->
        <circle cx="43" cy="38" r="2" fill="#333"/>
        <circle cx="57" cy="38" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M45,48 Q50,52 55,48" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M34,120 L34,58 Q34,50 44,50 L56,50 Q66,50 66,58 L66,120 Z" class="icon-body"/>
        <!-- 胸牌 -->
        <rect x="40" y="62" width="20" height="10" rx="2" fill="rgba(255,255,255,0.4)"/>
        <line x1="43" y1="65" x2="57" y2="65" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
        <line x1="43" y1="69" x2="52" y2="69" stroke="rgba(0,0,0,0.3)" stroke-width="1"/>
    </svg>`,

    // 经理女 - 长发 + 耳环
    'd': `<svg viewBox="0 0 100 120" class="piece-icon manager female">
        <!-- 长发 -->
        <ellipse cx="50" cy="36" rx="14" ry="8" class="icon-hair-female"/>
        <ellipse cx="38" cy="56" rx="4" ry="14" class="icon-hair-female"/>
        <ellipse cx="62" cy="56" rx="4" ry="14" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="42" r="13" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="37" cy="46" r="2" fill="#FFD700"/>
        <circle cx="63" cy="46" r="2" fill="#FFD700"/>
        <!-- 睫毛 -->
        <line x1="42" y1="39" x2="45" y2="40" stroke="#333" stroke-width="1"/>
        <line x1="48" y1="39" x2="45" y2="40" stroke="#333" stroke-width="1"/>
        <line x1="52" y1="39" x2="55" y2="40" stroke="#333" stroke-width="1"/>
        <line x1="58" y1="39" x2="55" y2="40" stroke="#333" stroke-width="1"/>
        <!-- 眼睛 -->
        <circle cx="45" cy="40" r="2" fill="#333"/>
        <circle cx="55" cy="40" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M46,48 Q50,52 54,48" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M36,120 L36,60 Q36,54 46,54 L54,54 Q64,54 64,60 L64,120 Z" class="icon-body"/>
        <!-- V领 -->
        <polygon points="44,54 50,64 56,54" fill="rgba(255,255,255,0.25)"/>
    </svg>`,

    // 资深女 - 长发 + 耳环 + 胸牌
    'e': `<svg viewBox="0 0 100 120" class="piece-icon senior female">
        <!-- 长发 -->
        <ellipse cx="50" cy="38" rx="12" ry="7" class="icon-hair-female"/>
        <ellipse cx="40" cy="56" rx="4" ry="12" class="icon-hair-female"/>
        <ellipse cx="60" cy="56" rx="4" ry="12" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="44" r="12" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="38" cy="48" r="2" fill="#FFD700"/>
        <circle cx="62" cy="48" r="2" fill="#FFD700"/>
        <!-- 眼睛 -->
        <circle cx="46" cy="42" r="2" fill="#333"/>
        <circle cx="54" cy="42" r="2" fill="#333"/>
        <!-- 微笑 -->
        <path d="M47,50 Q50,53 53,50" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 -->
        <path d="M38,120 L38,62 Q38,56 48,56 L52,56 Q62,56 62,62 L62,120 Z" class="icon-body"/>
        <!-- 胸牌 -->
        <rect x="42" y="68" width="16" height="8" rx="2" fill="rgba(255,255,255,0.5)"/>
        <line x1="44" y1="71" x2="56" y2="71" stroke="rgba(0,0,0,0.2)" stroke-width="1"/>
    </svg>`,

    // 新人女 - 长发 + 耳环 + 可爱歪头
    'f': `<svg viewBox="0 0 100 120" class="piece-icon junior female">
        <!-- 长发（马尾） -->
        <ellipse cx="50" cy="40" rx="10" ry="6" class="icon-hair-female"/>
        <ellipse cx="42" cy="58" rx="4" ry="10" class="icon-hair-female"/>
        <ellipse cx="58" cy="58" rx="4" ry="10" class="icon-hair-female"/>
        <ellipse cx="68" cy="48" rx="6" ry="10" class="icon-hair-female"/>
        <!-- 头部 -->
        <circle cx="50" cy="46" r="10" class="icon-head"/>
        <!-- 耳环 -->
        <circle cx="40" cy="50" r="2" fill="#FFD700"/>
        <circle cx="60" cy="50" r="2" fill="#FFD700"/>
        <!-- 眼睛 - 稍微向外看 -->
        <circle cx="46" cy="44" r="2" fill="#333"/>
        <circle cx="54" cy="44" r="2" fill="#333"/>
        <!-- 腮红 -->
        <ellipse cx="42" cy="48" rx="3" ry="2" fill="rgba(255,150,150,0.4)"/>
        <ellipse cx="58" cy="48" rx="3" ry="2" fill="rgba(255,150,150,0.4)"/>
        <!-- 不好意思的微笑 -->
        <path d="M47,52 Q50,54 53,52" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round"/>
        <!-- 身体 - 略小 -->
        <path d="M40,120 L40,64 Q40,58 48,58 L52,58 Q60,58 60,64 L60,120 Z" class="icon-body"/>
        <!-- 蝴蝶结领 -->
        <circle cx="50" cy="62" r="3" fill="rgba(255,255,255,0.6)"/>
        <ellipse cx="45" cy="62" rx="4" ry="2" fill="rgba(255,255,255,0.4)"/>
        <ellipse cx="55" cy="62" rx="4" ry="2" fill="rgba(255,255,255,0.4)"/>
    </svg>`
};

/**
 * 获取棋子SVG图标
 * @param {string} piece - 棋子字符 (A-F, a-f)
 * @returns {string} SVG HTML字符串
 */
function getSvgIcon(piece) {
    return SVG_ICONS[piece] || SVG_ICONS['F'];
}

/**
 * 获取棋子卡片HTML
 * @param {string} piece - 棋子字符
 * @param {number} index - 索引
 * @param {boolean} selected - 是否选中
 * @param {boolean} showIcon - 是否显示图标（false则显示背面）
 * @returns {string} HTML字符串
 */
function getPieceCardHtml(piece, index, selected = false, showIcon = true) {
    const isUpper = piece === piece.toUpperCase();
    const selectedClass = selected ? 'selected' : '';
    const flippedClass = showIcon ? '' : 'flipped';
    const genderClass = isUpper ? 'male-card' : 'female-card';

    return `
        <div class="piece-card ${isUpper ? 'uppercase' : 'lowercase'} ${genderClass} ${selectedClass} ${flippedClass}"
             data-piece="${piece}" data-index="${index}">
            <div class="piece-card__inner">
                <div class="piece-card__front">
                    ${getSvgIcon(piece)}
                    <span class="piece-name">${PIECE_NAMES[piece]}</span>
                </div>
                <div class="piece-card__back">
                    <span class="card-back-icon">?</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * 获取迷你棋子HTML（用于备战区堆显示）- 显示角色简称
 * @param {string} piece - 棋子字符
 * @returns {string} HTML字符串
 */
function getMiniPieceHtml(piece) {
    const isUpper = piece === piece.toUpperCase();
    const roleShort = getRoleShortName(piece);
    return `<span class="piece-mini ${isUpper ? 'uppercase' : 'lowercase'}" title="${PIECE_NAMES[piece]}">${roleShort}</span>`;
}

/**
 * 获取角色简称（用于迷你显示）
 * @param {string} piece - 棋子字符
 * @returns {string} 角色简称
 */
function getRoleShortName(piece) {
    const shortNames = {
        'A': 'CEO', 'a': 'CEO',
        'B': 'VP', 'b': 'VP',
        'C': '总监', 'c': '总监',
        'D': '经理', 'd': '经理',
        'E': '资深', 'e': '资深',
        'F': '新人', 'f': '新人'
    };
    return shortNames[piece] || '?';
}

/**
 * 获取角色图标符号（用于装饰）
 * @param {string} piece - 棋子字符
 * @returns {string} 图标符号
 */
function getRoleIcon(piece) {
    const icons = {
        'A': '👑', 'a': '👑',  // CEO - 皇冠
        'B': '⭐', 'b': '⭐',  // VP - 星星
        'C': '🎓', 'c': '🎓',  // 总监 - 学位帽
        'D': '💼', 'd': '💼',  // 经理 - 公文包
        'E': '📋', 'e': '📋',  // 资深 - 剪贴板
        'F': '🌱', 'f': '🌱'   // 新人 - 幼苗
    };
    return icons[piece] || '❓';
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SVG_ICONS, getSvgIcon, getPieceCardHtml, getMiniPieceHtml };
}
