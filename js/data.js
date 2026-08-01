// ===== 游戏数据配置 =====
// 【设计快照 2026-07-30】
// 等级系统：开局5级，升级+2属性点，满级99级
// 技能系统：每个技能有名称/消耗MP/CD/效果，武将自带2技能+奥义(羁绊2级解锁)
// 羁绊系统：0-5级，2级解锁奥义，4级主角可学武将一个技能
// 装备限定：武将固定兵器类型，主角全能

var GAME_DATA = {
    // ===== 五类兵器 =====
    weaponTypes: {
        quan: { name: '拳', icon: '👊', range: '单体', speed: 1.2, desc: '多段连击，高破防，概率眩晕' },
        jian: { name: '剑', icon: '⚔️', range: '单体/穿透', speed: 1.0, desc: '攻速快，暴击率高，穿透打击' },
        dao: { name: '刀', icon: '🔪', range: '单体/扇形', speed: 0.9, desc: '高伤害，破甲，吸血' },
        gong: { name: '弓', icon: '🏹', range: '全图单体', speed: 0.85, desc: '优先后排，高暴击伤害' },
        qiang: { name: '枪', icon: '🔱', range: '直线/十字', speed: 0.8, desc: '穿透破阵，打乱阵型' }
    },

    // ===== 品质配置 =====
    qualities: {
        white: { name: '普通', color: '#999', factor: 1.0 },
        green: { name: '优秀', color: '#6b8e6b', factor: 1.2 },
        blue: { name: '精良', color: '#4a7ab8', factor: 1.5 },
        purple: { name: '史诗', color: '#8b5a9e', factor: 1.9 },
        orange: { name: '传说', color: '#d4a843', factor: 2.4 },
        red: { name: '神兵', color: '#c2392b', factor: 3.0 }
    },

    // ===== 阵型 =====
    formations: {
        yulin: { name: '鱼鳞阵', desc: '前排防御+25%', effect: { frontDef: 0.25 } },
        fengshi: { name: '锋矢阵', desc: '首发出手伤害+35%', effect: { firstDmg: 0.35 } },
        bagua: { name: '八卦阵', desc: '全体闪避+18%', effect: { allDodge: 0.18 } },
        yanyue: { name: '偃月阵', desc: '两侧吸血15%', effect: { sideDrain: 0.15 } },
        yanxing: { name: '雁行阵', desc: '后排射程+1', effect: { backRange: 1 } },
        changshe: { name: '长蛇阵', desc: '速度+12%，回内10', effect: { speed: 0.12, mpRegen: 10 } }
    },

    // ===== 主角技能库（按兵器类型分级） =====
    // 主角装备某类兵器时，只能使用该类兵器的技能
    // 5级开局默认技能，10/20/25/40级技能，15/30/50级奥义
    heroSkills: {
        quan: [
            { id: 'quan_bengshan', name: '崩山捶', type: 'skill', weaponType: 'quan', cost: 15, cd: 3, levelNeed: 5, desc: '单体150%伤害，概率眩晕', effect: { dmg: 1.5, stunChance: 0.25 } },
            { id: 'quan_handi', name: '撼地拳', type: 'skill', weaponType: 'quan', cost: 18, cd: 3, levelNeed: 10, desc: '单体130%伤害，降低敌方速度20%', effect: { dmg: 1.3, debuffSpeed: 0.2 } },
            { id: 'quan_suigu', name: '碎骨拳', type: 'skill', weaponType: 'quan', cost: 22, cd: 3, levelNeed: 20, desc: '单体180%伤害，破防20%', effect: { dmg: 1.8, pierce: 0.2 } },
            { id: 'quan_huxiao', name: '虎啸拳', type: 'skill', weaponType: 'quan', cost: 25, cd: 4, levelNeed: 25, desc: '扇形范围110%伤害，概率恐惧', effect: { fanDmg: 1.1, fearChance: 0.2 } },
            { id: 'quan_qisha', name: '七杀拳', type: 'skill', weaponType: 'quan', cost: 35, cd: 4, levelNeed: 40, desc: '牺牲10%HP，下3次攻击+60%', effect: { hpCost: 0.1, buff: { dmg: 0.6, hits: 3 } } }
        ],
        jian: [
            { id: 'jian_bairen', name: '白刃斩', type: 'skill', weaponType: 'jian', cost: 15, cd: 3, levelNeed: 5, desc: '单体140%伤害，高暴击率', effect: { dmg: 1.4, critBonus: 0.15 } },
            { id: 'jian_huifeng', name: '回风拂柳', type: 'skill', weaponType: 'jian', cost: 18, cd: 3, levelNeed: 10, desc: '2段攻击每段75%，提升自身闪避20%', effect: { hits: 2, dmg: 0.75, selfBuff: { dodge: 0.2, turns: 2 } } },
            { id: 'jian_zhuifeng', name: '追风剑', type: 'skill', weaponType: 'jian', cost: 22, cd: 3, levelNeed: 20, desc: '单体170%伤害，必定命中', effect: { dmg: 1.7, hit: 1 } },
            { id: 'jian_pokong', name: '破空斩', type: 'skill', weaponType: 'jian', cost: 28, cd: 4, levelNeed: 25, desc: '穿透2格160%伤害', effect: { pierceDmg: 1.6, range: 2 } },
            { id: 'jian_tiaodeng', name: '挑灯看剑', type: 'skill', weaponType: 'jian', cost: 32, cd: 4, levelNeed: 40, desc: '单体220%伤害，50%暴击', effect: { dmg: 2.2, critChance: 0.5 } }
        ],
        dao: [
            { id: 'dao_xuanfeng', name: '旋风裂', type: 'skill', weaponType: 'dao', cost: 15, cd: 3, levelNeed: 5, desc: '扇形范围120%伤害', effect: { fanDmg: 1.2 } },
            { id: 'dao_liedi', name: '裂地斩', type: 'skill', weaponType: 'dao', cost: 18, cd: 3, levelNeed: 10, desc: '单体160%伤害，降低敌方防御20%', effect: { dmg: 1.6, debuffDef: 0.2 } },
            { id: 'dao_duanshan', name: '断山斩', type: 'skill', weaponType: 'dao', cost: 25, cd: 3, levelNeed: 20, desc: '单体200%伤害，破甲', effect: { dmg: 2.0, breakArmor: 0.3 } },
            { id: 'dao_kuangfeng', name: '狂风斩', type: 'skill', weaponType: 'dao', cost: 28, cd: 4, levelNeed: 25, desc: '3段攻击每段70%', effect: { hits: 3, dmg: 0.7 } },
            { id: 'dao_yanhuo', name: '焰火魔斩', type: 'skill', weaponType: 'dao', cost: 35, cd: 4, levelNeed: 40, desc: '扇形范围180%伤害，附带燃烧3回合', effect: { fanDmg: 1.8, burn: { dmg: 0.05, turns: 3 } } }
        ],
        qiang: [
            { id: 'qiang_chuanyun', name: '穿云破', type: 'skill', weaponType: 'qiang', cost: 15, cd: 3, levelNeed: 5, desc: '直线穿透180%伤害', effect: { pierceDmg: 1.8 } },
            { id: 'qiang_tuci', name: '突刺', type: 'skill', weaponType: 'qiang', cost: 18, cd: 3, levelNeed: 10, desc: '单体140%伤害，概率击退', effect: { dmg: 1.4, knockbackChance: 0.3 } },
            { id: 'qiang_lianhuan', name: '连环刺', type: 'skill', weaponType: 'qiang', cost: 22, cd: 3, levelNeed: 20, desc: '2次攻击每次100%', effect: { hits: 2, dmg: 1.0 } },
            { id: 'qiang_huima', name: '回马枪', type: 'skill', weaponType: 'qiang', cost: 28, cd: 4, levelNeed: 25, desc: '单体200%伤害，闪避后反击150%', effect: { dmg: 2.0, dodgeCounter: 1.5 } },
            { id: 'qiang_liaoyuan', name: '燎原百破', type: 'skill', weaponType: 'qiang', cost: 38, cd: 4, levelNeed: 40, desc: '十字5次突刺每次50%', effect: { crossHits: 5, dmg: 0.5 } }
        ],
        gong: [
            { id: 'gong_zhuihun', name: '追魂刺', type: 'skill', weaponType: 'gong', cost: 15, cd: 3, levelNeed: 5, desc: '后排锁定160%伤害', effect: { backDmg: 1.6 } },
            { id: 'gong_chuanyun', name: '穿云箭', type: 'skill', weaponType: 'gong', cost: 18, cd: 3, levelNeed: 10, desc: '单体180%伤害，无视20%防御', effect: { dmg: 1.8, pierce: 0.2 } },
            { id: 'gong_lianzhu', name: '连珠箭', type: 'skill', weaponType: 'gong', cost: 22, cd: 2, levelNeed: 20, desc: '3箭每箭70%', effect: { arrows: 3, dmg: 0.7 } },
            { id: 'gong_baolie', name: '爆裂箭', type: 'skill', weaponType: 'gong', cost: 28, cd: 4, levelNeed: 25, desc: '范围爆炸120%伤害', effect: { aoeDmg: 1.2 } },
            { id: 'gong_shigu', name: '蚀骨箭', type: 'skill', weaponType: 'gong', cost: 32, cd: 4, levelNeed: 40, desc: '后排200%伤害，禁疗3回合', effect: { backDmg: 2.0, antiHeal: 3 } }
        ]
    },

    // ===== 主角奥义库（按兵器类型分级） =====
    // 15/30/50级奥义，需在武学界面手动解锁
    heroUlts: {
        quan: [
            { id: 'quan_xianglong', name: '降龙伏虎', type: 'ult', weaponType: 'quan', levelNeed: 15, desc: '3段递增伤害(80%/100%/120%)，无视15%防御', effect: { hits: 3, dmg: [0.8, 1.0, 1.2], pierce: 0.15 } },
            { id: 'quan_jingang', name: '金刚怒目', type: 'ult', weaponType: 'quan', levelNeed: 30, desc: '自身攻击+50%，防御+30%，持续3回合', effect: { selfBuff: { atk: 0.5, def: 0.3, turns: 3 } } },
            { id: 'quan_guiyuan', name: '归元神掌', type: 'ult', weaponType: 'quan', levelNeed: 50, desc: '单体400%伤害，恢复造成伤害30%的HP', effect: { dmg: 4.0, lifesteal: 0.3 } }
        ],
        jian: [
            { id: 'jian_jinghong', name: '惊鸿一剑', type: 'ult', weaponType: 'jian', levelNeed: 15, desc: '单体250%伤害，无视30%防御', effect: { dmg: 2.5, pierce: 0.3 } },
            { id: 'jian_jiulong', name: '九龙连闪', type: 'ult', weaponType: 'jian', levelNeed: 30, desc: '9段攻击每段40%伤害', effect: { hits: 9, dmg: 0.4 } },
            { id: 'jian_wanjian', name: '万剑归宗', type: 'ult', weaponType: 'jian', levelNeed: 50, desc: '全体150%伤害', effect: { allDmg: 1.5 } }
        ],
        dao: [
            { id: 'dao_xuezhan', name: '血战八方', type: 'ult', weaponType: 'dao', levelNeed: 15, desc: '全体150%伤害，吸血15%', effect: { allDmg: 1.5, drain: 0.15 } },
            { id: 'dao_xiuluo', name: '修罗斩', type: 'ult', weaponType: 'dao', levelNeed: 30, desc: '牺牲20%HP，单体350%伤害', effect: { hpCost: 0.2, dmg: 3.5 } },
            { id: 'dao_xianglong', name: '翔天龙闪', type: 'ult', weaponType: 'dao', levelNeed: 50, desc: '单体300%伤害，无视50%防御', effect: { dmg: 3.0, pierce: 0.5 } }
        ],
        qiang: [
            { id: 'qiang_longdan', name: '龙胆破', type: 'ult', weaponType: 'qiang', levelNeed: 15, desc: '直线250%伤害，自身攻击+20%', effect: { pierceDmg: 2.5, selfBuff: { atk: 0.2, turns: 2 } } },
            { id: 'qiang_pojun', name: '破军', type: 'ult', weaponType: 'qiang', levelNeed: 30, desc: '全体180%伤害，降低敌方防御20%', effect: { allDmg: 1.8, debuffDef: 0.2 } },
            { id: 'qiang_bawang', name: '霸王断魂枪', type: 'ult', weaponType: 'qiang', levelNeed: 50, desc: '单体400%伤害，斩杀线25%', effect: { dmg: 4.0, execute: 0.25 } }
        ],
        gong: [
            { id: 'gong_liuxing', name: '流星赶月', type: 'ult', weaponType: 'gong', levelNeed: 15, desc: '随机5箭每箭100%伤害', effect: { randomArrows: 5, dmg: 1.0 } },
            { id: 'gong_jiutian', name: '九天揽月', type: 'ult', weaponType: 'gong', levelNeed: 30, desc: '全体120%伤害，降低敌方速度20%', effect: { allDmg: 1.2, debuffSpeed: 0.2 } },
            { id: 'gong_sheri', name: '射日弓诀', type: 'ult', weaponType: 'gong', levelNeed: 50, desc: '锁定最低血量350%必暴', effect: { snipe: true, dmg: 3.5, crit: 1 } }
        ]
    },

    // ===== 秘籍技能（只能通过秘籍道具学习，不显示在技能链中）=====
    secretSkills: {
        quan: [
            { id: 'quan_bajibeng', name: '八极崩劲', type: 'skill', weaponType: 'quan', cost: 20, cd: 3, desc: '单体180%伤害，40%概率破甲，20%概率击退', effect: { dmg: 1.8, pierceChance: 0.4, knockbackChance: 0.2 } }
        ],
        jian: [
            { id: 'jian_xiaoxiang', name: '潇湘剑诀', type: 'skill', weaponType: 'jian', cost: 18, cd: 3, desc: '单体200%伤害，30%概率触发连击', effect: { dmg: 2.0, comboChance: 0.3 } }
        ],
        dao: [
            { id: 'dao_juhe', name: '居合一闪', type: 'skill', weaponType: 'dao', cost: 22, cd: 3, desc: '单体250%伤害，首回合必中，15%概率即死', effect: { dmg: 2.5, firstHit: true, executeChance: 0.15 } }
        ],
        qiang: [
            { id: 'qiang_longyin', name: '龙吟九霄', type: 'skill', weaponType: 'qiang', cost: 20, cd: 3, desc: '直线穿透220%伤害，30%概率恐惧', effect: { pierceDmg: 2.2, fearChance: 0.3 } }
        ],
        gong: [
            { id: 'gong_jingyu', name: '惊羽连珠', type: 'skill', weaponType: 'gong', cost: 20, cd: 2, desc: '5箭连射每箭60%，最后一箭必暴', effect: { arrows: 5, dmg: 0.6, lastCrit: true } }
        ]
    },

    secretUlts: {
        quan: [
            { id: 'quan_liudao', name: '六道轮回拳', type: 'ult', weaponType: 'quan', desc: '6段连击每段70%，最后一段眩晕', effect: { hits: 6, dmg: 0.7, finalStun: true } }
        ],
        jian: [
            { id: 'jian_tianxing', name: '天星蝶影剑', type: 'ult', weaponType: 'jian', desc: '全体250%伤害，无视20%防御；3回合内闪避后自动反击150%', effect: { allDmg: 2.5, pierce: 0.2, dodgeCounter: 1.5, turns: 3 } }
        ],
        dao: [
            { id: 'dao_xianshuang', name: '霰雪霜寒斩', type: 'ult', weaponType: 'dao', desc: '最前一排180%冰伤；受伤敌人无法进攻1回合；敌方全体减速30%持续3回合', effect: { frontDmg: 1.8, freeze: 1, debuffSpeed: 0.3, turns: 3 } }
        ],
        qiang: [
            { id: 'qiang_pojunws', name: '破军无双', type: 'ult', weaponType: 'qiang', desc: '单体400%伤害，斩杀线20%；击杀后立即再动', effect: { dmg: 4.0, execute: 0.2, extraTurn: true } }
        ],
        gong: [
            { id: 'gong_luori', name: '落日神射', type: 'ult', weaponType: 'gong', desc: '锁定攻击最高目标400%必暴，禁疗3回合', effect: { snipeAtk: true, dmg: 4.0, crit: 1, antiHeal: 3 } }
        ]
    },

    // ===== 武将库 =====
    // 所有武将招募时自带2个技能，奥义需羁绊2级解锁
    // 招募等级 = 获得难度（关平5级，吕布40级）
    heroes: {
        // ========== 精锐武将（2技能 + 1奥义）==========

        // --- 开局武将 ---
        guanping: {
            id: 'guanping', name: '关平', avatar: '⚔️', faction: '蜀',
            weapon: 'jian', growth: 'tiebi', recruitLevel: 5,
            str: 8, agi: 6, vit: 7, luk: 5,
            skills: {
                s1: { name: '龙鳞一击', type: 'skill', cost: 25, cd: 3, desc: '对单体造成140%伤害，提高自身15%防御，持续2回合', effect: { dmg: 1.4, selfBuff: { def: 0.15, turns: 2 } } },
                s2: { name: '忠护', type: 'skill', cost: 30, cd: 4, desc: '为一名队友抵挡2次攻击，反弹30%伤害给伤害来源，持续2回合', effect: { protect: 2, reflect: 0.3, turns: 2 } },
                ult: { name: '龙鳞血战', type: 'ult', desc: '根据已损失生命值的百分比提升攻击力（每损失10%生命，攻击+8%），对单体造成220%伤害，并获得1回合无敌', effect: { hpScaleDmg: 0.08, dmg: 2.2, invincible: 1 } }
            },
            unlock: { type: 'start' }
        },

        // --- 第一章精锐任务 ---
        liaohua: {
            id: 'liaohua', name: '廖化', avatar: '🔱', faction: '蜀',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 8,
            str: 9, agi: 7, vit: 6, luk: 5,
            skills: {
                s1: { name: '先锋突', type: 'skill', cost: 25, cd: 3, desc: '对单体造成130%伤害，有35%概率降低目标20%防御，持续2回合', effect: { dmg: 1.3, debuffDef: { chance: 0.35, val: 0.2, turns: 2 } } },
                s2: { name: '老当益壮', type: 'skill', cost: 30, cd: 4, desc: '自身攻击提升20%，持续3回合；若当前生命低于50%，额外回复12%最大生命', effect: { selfBuff: { atk: 0.2, turns: 3 }, lowHpHeal: { threshold: 0.5, healPct: 0.12 } } },
                ult: { name: '千里单骑', type: 'ult', desc: '对敌方最前一排造成170%伤害，若目标防御已降低，则伤害提升至230%', effect: { frontDmg: 1.7, frontDmgBonus: 2.3 } }
            },
            unlock: { type: 'elite', chapter: 1 }
        },
        zhangyi: {
            id: 'zhangyi', name: '张翼', avatar: '🔱', faction: '蜀',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 10,
            str: 9, agi: 8, vit: 6, luk: 5,
            skills: {
                s1: { name: '连刺', type: 'skill', cost: 25, cd: 3, desc: '对单体造成2次攻击，每次75%伤害；若暴击则追加第3次（60%）', effect: { hits: 2, dmg: 0.75, critExtraHit: { dmg: 0.6 } } },
                s2: { name: '猛攻', type: 'skill', cost: 30, cd: 4, desc: '牺牲自身10%当前生命，对单体造成190%伤害，本次攻击暴击率+20%', effect: { hpCost: 0.1, dmg: 1.9, selfBuff: { crit: 0.2, turns: 1 } } },
                ult: { name: '破军之势', type: 'ult', desc: '对单体造成260%伤害，无视目标25%防御；若击杀目标，立即回复30%最大内力', effect: { dmg: 2.6, pierceDef: 0.25, killMpRegen: 0.3 } }
            },
            unlock: { type: 'elite', chapter: 1 }
        },

        // --- 第二章精锐任务 ---
        zhoucang: {
            id: 'zhoucang', name: '周仓', avatar: '🔪', faction: '蜀',
            weapon: 'dao', growth: 'mengjiang', recruitLevel: 12,
            str: 10, agi: 7, vit: 7, luk: 4,
            skills: {
                s1: { name: '断喝', type: 'skill', cost: 25, cd: 4, desc: '对单体造成120%伤害，有40%概率使目标眩晕1回合', effect: { dmg: 1.2, stunChance: 0.4, turns: 1 } },
                s2: { name: '追斩', type: 'skill', cost: 25, cd: 3, desc: '对生命最低的目标造成130%伤害；若目标生命低于30%，伤害提升至210%', effect: { lowHpDmg: { dmg: 1.3, bonusDmg: 2.1, threshold: 0.3 } } },
                ult: { name: '刀光乱舞', type: 'ult', desc: '对随机3个敌方目标各造成125%伤害；若目标被眩晕，额外造成80%伤害', effect: { randomHits: 3, dmg: 1.25, stunBonus: 0.8 } }
            },
            unlock: { type: 'elite', chapter: 2 }
        },
        lidian: {
            id: 'lidian', name: '李典', avatar: '🔱', faction: '魏',
            weapon: 'qiang', growth: 'xiaoxiong', recruitLevel: 12,
            str: 7, agi: 7, vit: 7, luk: 6,
            skills: {
                s1: { name: '绊马索', type: 'skill', cost: 20, cd: 3, desc: '对单体造成110%伤害，降低目标25%速度，持续2回合', effect: { dmg: 1.1, debuffSpeed: { val: 0.25, turns: 2 } } },
                s2: { name: '疑兵', type: 'skill', cost: 35, cd: 5, desc: '降低敌方全体15%命中，持续2回合；给我方全体增加10%闪避，持续2回合', effect: { debuffTeamHit: { val: 0.15, turns: 2 }, buffTeamDodge: { val: 0.1, turns: 2 } } },
                ult: { name: '埋伏阵', type: 'ult', desc: '对敌方全体造成140%伤害，有25%概率使目标混乱1回合', effect: { allDmg: 1.4, confuseChance: 0.25, turns: 1 } }
            },
            unlock: { type: 'elite', chapter: 2 }
        },

        // --- 第三章精锐任务 ---
        chengpu: {
            id: 'chengpu', name: '程普', avatar: '🔱', faction: '吴',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 15,
            str: 9, agi: 7, vit: 8, luk: 5,
            skills: {
                s1: { name: '裂阵', type: 'skill', cost: 25, cd: 3, desc: '对敌方最前一排造成115%伤害，降低其15%防御，持续2回合', effect: { frontDmg: 1.15, debuffDef: { val: 0.15, turns: 2 } } },
                s2: { name: '老谋', type: 'skill', cost: 30, cd: 4, desc: '自身闪避提升25%，持续2回合；闪避成功后立即反击（80%伤害）', effect: { selfBuff: { dodge: 0.25, turns: 2 }, counterDmg: 0.8 } },
                ult: { name: '江东猛虎', type: 'ult', desc: '对敌方全体造成150%伤害；若敌方有单位处于防御降低状态，则该单位额外受到60%伤害', effect: { allDmg: 1.5, debuffBonus: 0.6 } }
            },
            unlock: { type: 'elite', chapter: 3 }
        },

        // --- 第四章精锐任务 ---
        huanggai: {
            id: 'huanggai', name: '黄盖', avatar: '🔪', faction: '吴',
            weapon: 'dao', growth: 'tiebi', recruitLevel: 18,
            str: 10, agi: 6, vit: 9, luk: 4,
            skills: {
                s1: { name: '苦肉', type: 'skill', cost: 25, cd: 3, desc: '牺牲自身15%当前生命，对单体造成170%伤害，并嘲讽目标1回合', effect: { hpCost: 0.15, dmg: 1.7, taunt: 1 } },
                s2: { name: '铁壁', type: 'skill', cost: 30, cd: 4, desc: '自身防御提升30%，持续2回合；期间受到的攻击有20%概率完全格挡', effect: { selfBuff: { def: 0.3, turns: 2 }, blockChance: 0.2 } },
                ult: { name: '烈焰焚舟', type: 'ult', desc: '对敌方全体造成160%火属性伤害，自身损失20%最大生命；每有一个敌方单位，伤害提升10%', effect: { allDmg: 1.6, element: 'fire', selfHpCost: 0.2, perEnemyBonus: 0.1 } }
            },
            unlock: { type: 'elite', chapter: 4 }
        },
        caohong: {
            id: 'caohong', name: '曹洪', avatar: '🔪', faction: '魏',
            weapon: 'dao', growth: 'tiebi', recruitLevel: 18,
            str: 9, agi: 6, vit: 10, luk: 4,
            skills: {
                s1: { name: '舍命', type: 'skill', cost: 30, cd: 4, desc: '为一名队友承受下一次攻击的全部伤害，并反弹25%给攻击者', effect: { protectOnce: true, reflect: 0.25 } },
                s2: { name: '血战', type: 'skill', cost: 25, cd: 5, desc: '自身生命越低防御越高（每损失10%生命，防御+5%），持续3回合', effect: { hpScaleDef: { perHp: 0.1, defBonus: 0.05, turns: 3 } } },
                ult: { name: '护卫之魂', type: 'ult', desc: '给我方全体增加护盾（护盾值=曹洪最大生命的15%），持续2回合；护盾存在时受到的伤害减免20%', effect: { shieldAll: { hpPct: 0.15, turns: 2 }, shieldDmgReduce: 0.2 } }
            },
            unlock: { type: 'elite', chapter: 4 }
        },

        // --- 第五章精锐任务 ---
        daqiao: {
            id: 'daqiao', name: '大乔', avatar: '🏹', faction: '吴',
            weapon: 'gong', growth: 'jiyun', recruitLevel: 22,
            str: 5, agi: 8, vit: 6, luk: 10,
            skills: {
                s1: { name: '回春箭', type: 'skill', cost: 25, cd: 3, desc: '回复我方生命最低的单位15%最大生命，并解除1个负面状态', effect: { healLowest: 0.15, dispel: 1 } },
                s2: { name: '凝神', type: 'skill', cost: 35, cd: 5, desc: '给我方全体增加15%攻击和10%速度，持续2回合', effect: { buffTeam: { atk: 0.15, speed: 0.1, turns: 2 } } },
                ult: { name: '惊鸿之舞', type: 'ult', desc: '回复我方全体20%最大生命，给全体增加「庇护」（受到的下一次伤害减免50%）', effect: { healAll: 0.2, grantShield: { dmgReduce: 0.5, hits: 1 } } }
            },
            unlock: { type: 'elite', chapter: 5 }
        },
        xiaoqiao: {
            id: 'xiaoqiao', name: '小乔', avatar: '🏹', faction: '吴',
            weapon: 'gong', growth: 'jiyun', recruitLevel: 22,
            str: 5, agi: 9, vit: 5, luk: 11,
            skills: {
                s1: { name: '迷魂箭', type: 'skill', cost: 25, cd: 3, desc: '对单体造成100%伤害，有35%概率使目标沉睡1回合', effect: { dmg: 1.0, sleepChance: 0.35, turns: 1 } },
                s2: { name: '灵巧', type: 'skill', cost: 30, cd: 4, desc: '给我方全体增加20%闪避，持续2回合', effect: { buffTeam: { dodge: 0.2, turns: 2 } } },
                ult: { name: '流风回雪', type: 'ult', desc: '对敌方全体造成125%冰属性伤害，降低全体30%速度，持续2回合；给我方全体增加15%速度，持续2回合', effect: { allDmg: 1.25, element: 'ice', debuffTeamSpeed: { val: 0.3, turns: 2 }, buffTeamSpeed: { val: 0.15, turns: 2 } } }
            },
            unlock: { type: 'elite', chapter: 5 }
        },

        // --- 第六章精锐任务 ---
        caiwenji: {
            id: 'caiwenji', name: '蔡文姬', avatar: '🏹', faction: '魏',
            weapon: 'gong', growth: 'jiyun', recruitLevel: 25,
            str: 5, agi: 7, vit: 6, luk: 10,
            skills: {
                s1: { name: '胡笳鸣', type: 'skill', cost: 30, cd: 4, desc: '回复我方全体10%最大生命，并解除1个负面状态（优先解除控制类）', effect: { healAll: 0.1, dispel: 1 } },
                s2: { name: '悲歌', type: 'skill', cost: 30, cd: 4, desc: '降低敌方全体10%攻击，持续2回合；若敌方有单位处于控制状态，该单位额外降低15%攻击', effect: { debuffTeamAtk: { val: 0.1, turns: 2 }, ctrlExtraDebuff: 0.15 } },
                ult: { name: '天籁之音', type: 'ult', desc: '回复我方全体18%最大生命，解除所有负面状态，并给全体增加15%防御，持续2回合', effect: { healAll: 0.18, dispelAll: true, buffTeamDef: { val: 0.15, turns: 2 } } }
            },
            unlock: { type: 'elite', chapter: 6 }
        },

        // --- 第八章精锐任务 ---
        xushu: {
            id: 'xushu', name: '徐庶', avatar: '⚔️', faction: '蜀',
            weapon: 'jian', growth: 'qimen', recruitLevel: 30,
            str: 7, agi: 9, vit: 6, luk: 8,
            skills: {
                s1: { name: '奇策', type: 'skill', cost: 25, cd: 3, desc: '对单体造成130%伤害，有30%概率封印目标1回合', effect: { dmg: 1.3, sealChance: 0.3, turns: 1 } },
                s2: { name: '识破', type: 'skill', cost: 30, cd: 4, desc: '给我方全体增加20%命中，持续2回合；敌方全体闪避降低15%，持续2回合', effect: { buffTeamHit: { val: 0.2, turns: 2 }, debuffTeamDodge: { val: 0.15, turns: 2 } } },
                ult: { name: '一剑封喉', type: 'ult', desc: '对单体造成250%伤害，若目标处于封印状态，伤害提升至350%并延长封印1回合', effect: { dmg: 2.5, sealBonusDmg: 3.5, extendSeal: 1 } }
            },
            unlock: { type: 'elite', chapter: 8 }
        },

        // --- 第十章精锐任务 ---
        huangyueying: {
            id: 'huangyueying', name: '黄月英', avatar: '🏹', faction: '蜀',
            weapon: 'gong', growth: 'qimen', recruitLevel: 35,
            str: 6, agi: 8, vit: 6, luk: 9,
            skills: {
                s1: { name: '连弩齐射', type: 'skill', cost: 25, cd: 3, desc: '对敌方随机2个目标各造成100%伤害；若2发命中同一目标，第2发伤害提升至150%', effect: { randomHits: 2, dmg: 1.0, sameTargetBonus: 1.5 } },
                s2: { name: '机关陷阱', type: 'skill', cost: 30, cd: 4, desc: '下回合开始时对敌方全体造成80%伤害，并有25%概率使目标定身1回合', effect: { delayAoe: { dmg: 0.8, turns: 1 }, rootChance: 0.25, rootTurns: 1 } },
                ult: { name: '天工开物', type: 'ult', desc: '召唤机关兽攻击敌方全体，造成180%伤害；若目标被定身，额外造成100%伤害并眩晕1回合', effect: { allDmg: 1.8, rootedBonusDmg: 1.0, rootedStun: 1 } }
            },
            unlock: { type: 'elite', chapter: 10 }
        },

        // ========== 传说武将（3技能 + 1奥义）==========

        // --- 第一章通关：刘备 ---
        liubei: {
            id: 'liubei', name: '刘备', avatar: '👑', faction: '蜀',
            weapon: 'jian', growth: 'xiaoxiong', recruitLevel: 10,
            str: 7, agi: 7, vit: 8, luk: 8,
            skills: {
                s1: { name: '仁德', type: 'skill', cost: 25, cd: 3, desc: '回复我方生命最低的单位18%最大生命，给该单位增加15%防御，持续2回合', effect: { healLowest: 0.18, buffDef: { val: 0.15, turns: 2 } } },
                s2: { name: '激将', type: 'skill', cost: 30, cd: 4, desc: '给一名友方单位增加25%攻击和20%暴击率，持续2回合', effect: { buffAlly: { atk: 0.25, crit: 0.2, turns: 2 } } },
                s3: { name: '以德服人', type: 'skill', cost: 25, cd: 3, desc: '对单体造成100%伤害，有35%概率使目标缴械1回合', effect: { dmg: 1.0, disarmChance: 0.35, turns: 1 } },
                ult: { name: '桃园结义', type: 'ult', desc: '回复我方全体25%最大生命，解除所有负面状态，给全体增加「仁德庇护」（受到致命伤害时保留1点生命，持续2回合）', effect: { healAll: 0.25, dispelAll: true, grantDieHard: { turns: 2 } } }
            },
            unlock: { type: 'story', chapter: 1 }
        },

        // --- 第二章传说任务：张飞 ---
        zhangfei: {
            id: 'zhangfei', name: '张飞', avatar: '🐍', faction: '蜀',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 15,
            str: 13, agi: 6, vit: 10, luk: 5,
            skills: {
                s1: { name: '燕人咆哮', type: 'skill', cost: 30, cd: 3, desc: '对敌方最前一排造成135%伤害，有40%概率使目标恐惧1回合', effect: { frontDmg: 1.35, fearChance: 0.4, turns: 1 } },
                s2: { name: '酣战', type: 'skill', cost: 30, cd: 4, desc: '对单体造成190%伤害，自身损失5%最大生命；若暴击，回复15%最大生命', effect: { dmg: 1.9, selfHpCost: 0.05, critHeal: 0.15 } },
                s3: { name: '酒壮胆', type: 'skill', cost: 25, cd: 5, desc: '自身攻击+20%，受到的控制效果持续时间减少1回合，持续3回合', effect: { selfBuff: { atk: 0.2, turns: 3 }, ccReduce: 1 } },
                ult: { name: '当阳断桥', type: 'ult', desc: '对敌方全体造成190%伤害，有50%概率使目标恐惧1回合；若敌方已有恐惧状态，则恐惧延长1回合', effect: { allDmg: 1.9, fearChance: 0.5, turns: 1, extendFear: true } }
            },
            unlock: { type: 'legend', chapter: 2 }
        },

        // --- 第三章通关：曹操 ---
        caocao: {
            id: 'caocao', name: '曹操', avatar: '🦅', faction: '魏',
            weapon: 'jian', growth: 'xiaoxiong', recruitLevel: 15,
            str: 9, agi: 8, vit: 8, luk: 8,
            skills: {
                s1: { name: '奸雄', type: 'skill', cost: 25, cd: 3, desc: '对单体造成140%伤害，偷取目标10%的攻击（可叠加，最多3层），持续3回合', effect: { dmg: 1.4, stealAtk: { val: 0.1, maxStack: 3, turns: 3 } } },
                s2: { name: '号令天下', type: 'skill', cost: 35, cd: 5, desc: '给我方全体增加15%攻击和10%速度，持续2回合；若场上有3名及以上友方单位，额外增加10%暴击率', effect: { buffTeam: { atk: 0.15, speed: 0.1, turns: 2 }, extraCritIf3Allies: 0.1 } },
                s3: { name: '唯才是举', type: 'skill', cost: 30, cd: 5, desc: '立即为一名友方单位回复20%最大内力，并使其下回合技能冷却减少1回合', effect: { healMpAlly: 0.2, cdReduce: 1 } },
                ult: { name: '魏武霸业', type: 'ult', desc: '对敌方全体造成210%伤害，给敌方全体施加「威压」（攻击力-15%，速度-15%，持续2回合）；给我方全体回复10%最大内力', effect: { allDmg: 2.1, debuffTeam: { atk: 0.15, speed: 0.15, turns: 2 }, healMpAll: 0.1 } }
            },
            unlock: { type: 'story', chapter: 3 }
        },

        // --- 第三章传说任务：貂蝉 ---
        diaochan: {
            id: 'diaochan', name: '貂蝉', avatar: '🌸', faction: '群雄',
            weapon: 'gong', growth: 'jiyun', recruitLevel: 20,
            str: 5, agi: 10, vit: 5, luk: 13,
            skills: {
                s1: { name: '闭月', type: 'skill', cost: 25, cd: 3, desc: '对单体造成110%伤害，有40%概率使目标魅惑1回合', effect: { dmg: 1.1, charmChance: 0.4, turns: 1 } },
                s2: { name: '羞花', type: 'skill', cost: 30, cd: 4, desc: '降低敌方全体12%攻击，持续2回合；若敌方有男性角色，额外降低8%攻击', effect: { debuffTeamAtk: { val: 0.12, turns: 2 }, maleExtraDebuff: 0.08 } },
                s3: { name: '离间', type: 'skill', cost: 35, cd: 5, desc: '对2个敌方目标造成90%伤害，并使其互相攻击1次', effect: { hits: 2, dmg: 0.9, forceAttackEachOther: true } },
                ult: { name: '倾国倾城', type: 'ult', desc: '对敌方全体造成160%伤害，有50%概率使目标魅惑1回合；被魅惑的目标攻击自己人时，伤害+20%', effect: { allDmg: 1.6, charmChance: 0.5, turns: 1, charmedDmgBoost: 0.2 } }
            },
            unlock: { type: 'legend', chapter: 3 }
        },

        // --- 第四章传说任务：关羽 ---
        guanyu: {
            id: 'guanyu', name: '关羽', avatar: '🐉', faction: '蜀',
            weapon: 'dao', growth: 'mengjiang', recruitLevel: 20,
            str: 12, agi: 7, vit: 9, luk: 6,
            skills: {
                s1: { name: '春秋斩', type: 'skill', cost: 30, cd: 3, desc: '对单体造成160%伤害；若目标生命低于50%，伤害提升至240%', effect: { dmg: 1.6, lowHpBonusDmg: { threshold: 0.5, bonusDmg: 2.4 } } },
                s2: { name: '武圣之威', type: 'skill', cost: 30, cd: 5, desc: '自身攻击提升25%，暴击率提升20%，持续3回合', effect: { selfBuff: { atk: 0.25, crit: 0.2, turns: 3 } } },
                s3: { name: '拖刀计', type: 'skill', cost: 25, cd: 4, desc: '本回合进入防御姿态（受到的伤害减免40%），下回合对攻击者进行一次200%伤害的反击', effect: { defend: { dmgReduce: 0.4, turns: 1 }, counterNext: { dmg: 2.0 } } },
                ult: { name: '青龙偃月', type: 'ult', desc: '对单体造成320%伤害，无视30%防御；若击杀目标，立即对另一生命最低的敌方释放一次「春秋斩」', effect: { dmg: 3.2, pierceDef: 0.3, killChain: true } }
            },
            unlock: { type: 'legend', chapter: 4 }
        },
        dianwei: {
            id: 'dianwei', name: '典韦', avatar: '👊', faction: '魏',
            weapon: 'quan', growth: 'tiebi', recruitLevel: 20,
            str: 13, agi: 6, vit: 12, luk: 4,
            skills: {
                s1: { name: '恶来擒拿', type: 'skill', cost: 25, cd: 3, desc: '对单体造成130%伤害，有45%概率使目标定身1回合', effect: { dmg: 1.3, rootChance: 0.45, turns: 1 } },
                s2: { name: '古之恶来', type: 'skill', cost: 30, cd: 4, desc: '自身防御+25%，反弹伤害+30%，持续2回合；期间受到攻击时，有20%概率立即反击', effect: { selfBuff: { def: 0.25, turns: 2 }, reflectBonus: 0.3, counterChance: 0.2 } },
                s3: { name: '掷戟', type: 'skill', cost: 30, cd: 4, desc: '对敌方单体造成160%伤害，若目标正在攻击我方其他单位，则强制将目标攻击目标改为典韦，持续1回合', effect: { dmg: 1.6, taunt: 1 } },
                ult: { name: '死战不退', type: 'ult', desc: '牺牲自身30%当前生命，给自身增加「不屈」状态2回合：受到的所有伤害减免50%，反弹伤害提升至50%，每次受到攻击都会反击', effect: { selfHpCost: 0.3, buffSelf: { dmgReduce: 0.5, reflect: 0.5, autoCounter: true, turns: 2 } } }
            },
            unlock: { type: 'legend', chapter: 4 }
        },

        // --- 第五章通关：孙权 ---
        sunquan: {
            id: 'sunquan', name: '孙权', avatar: '⚔️', faction: '吴',
            weapon: 'jian', growth: 'xiaoxiong', recruitLevel: 22,
            str: 7, agi: 8, vit: 8, luk: 9,
            skills: {
                s1: { name: '制衡', type: 'skill', cost: 30, cd: 4, desc: '随机转移我方一个负面状态给敌方随机单位，并给该友方单位回复12%最大生命', effect: { transferDebuff: true, healAlly: 0.12 } },
                s2: { name: '坚守', type: 'skill', cost: 35, cd: 5, desc: '给我方最前一排增加护盾（护盾值=孙权最大生命的20%），持续2回合；护盾破裂时对攻击者造成100%反弹伤害', effect: { shieldFront: { hpPct: 0.2, turns: 2 }, shieldBreakReflect: 1.0 } },
                s3: { name: '纳贤', type: 'skill', cost: 30, cd: 5, desc: '给我方全体增加10%内力恢复速度，持续3回合；期间我方每次使用技能，有15%概率不进入冷却', effect: { buffTeamMpRegen: { val: 0.1, turns: 3 }, skillNoCdChance: 0.15 } },
                ult: { name: '江东之主', type: 'ult', desc: '给我方全体增加20%攻击和20%防御，持续3回合；期间我方每行动1次，全体回复5%最大生命', effect: { buffTeam: { atk: 0.2, def: 0.2, turns: 3 }, perActionHeal: 0.05 } }
            },
            unlock: { type: 'story', chapter: 5 }
        },

        // --- 第六章传说任务：赵云 ---
        zhaoyun: {
            id: 'zhaoyun', name: '赵云', avatar: '⚡', faction: '蜀',
            weapon: 'qiang', growth: 'youlong', recruitLevel: 25,
            str: 9, agi: 13, vit: 7, luk: 8,
            skills: {
                s1: { name: '龙胆', type: 'skill', cost: 25, cd: 3, desc: '对单体造成150%伤害，自身闪避提升20%，持续2回合', effect: { dmg: 1.5, selfBuff: { dodge: 0.2, turns: 2 } } },
                s2: { name: '七进七出', type: 'skill', cost: 30, cd: 4, desc: '对随机3个敌方目标各造成100%伤害；每命中一个目标，自身回复5%最大生命', effect: { randomHits: 3, dmg: 1.0, perHitHeal: 0.05 } },
                s3: { name: '银枪护主', type: 'skill', cost: 30, cd: 4, desc: '给一名友方单位增加20%闪避，持续2回合；该友方闪避成功后，赵云自动对其身边敌人造成100%伤害', effect: { buffAllyDodge: { val: 0.2, turns: 2 }, allyDodgeCounter: 1.0 } },
                ult: { name: '常胜将军', type: 'ult', desc: '进入「龙魂」状态3回合：闪避率+30%，闪避后自动反击（130%伤害），攻击+20%', effect: { buffSelf: { dodge: 0.3, counterDmg: 1.3, atk: 0.2, turns: 3 } } }
            },
            unlock: { type: 'legend', chapter: 6 }
        },
        zhugeliang: {
            id: 'zhugeliang', name: '诸葛亮', avatar: '🔥', faction: '蜀',
            weapon: 'gong', growth: 'qimen', recruitLevel: 25,
            str: 6, agi: 9, vit: 6, luk: 11,
            skills: {
                s1: { name: '火攻', type: 'skill', cost: 30, cd: 3, desc: '对敌方最前一排造成135%火属性伤害，有35%概率使目标灼烧（每回合损失5%最大生命，持续2回合）', effect: { frontDmg: 1.35, element: 'fire', burnChance: 0.35, burnDmg: 0.05, burnTurns: 2 } },
                s2: { name: '八卦阵', type: 'skill', cost: 35, cd: 5, desc: '给我方全体增加15%闪避和10%速度，持续2回合；我方闪避成功后，攻击者受到50%反弹伤害', effect: { buffTeam: { dodge: 0.15, speed: 0.1, turns: 2 }, dodgeReflect: 0.5 } },
                s3: { name: '观星', type: 'skill', cost: 25, cd: 4, desc: '本回合不行动，下回合开始时，给我方被集火目标增加30%防御，持续1回合', effect: { skipTurn: true, nextTurnBuffFocused: { def: 0.3, turns: 1 } } },
                ult: { name: '东风破', type: 'ult', desc: '对敌方全体造成230%火属性伤害，必定使目标灼烧；若目标已有灼烧状态，则立即结算剩余灼烧伤害并刷新灼烧', effect: { allDmg: 2.3, element: 'fire', forceBurn: true, burnSnap: true } }
            },
            unlock: { type: 'legend', chapter: 6 }
        },
        zhouyu: {
            id: 'zhouyu', name: '周瑜', avatar: '🔥', faction: '吴',
            weapon: 'jian', growth: 'qimen', recruitLevel: 25,
            str: 6, agi: 9, vit: 6, luk: 10,
            skills: {
                s1: { name: '烽火连城', type: 'skill', cost: 30, cd: 3, desc: '对单体造成150%火属性伤害，给目标施加「火种」（受到火属性伤害时额外损失8%最大生命，持续2回合）', effect: { dmg: 1.5, element: 'fire', applyMark: { id: 'huozhong', fireExtraDmg: 0.08, turns: 2 } } },
                s2: { name: '反间', type: 'skill', cost: 25, cd: 4, desc: '对单体造成100%伤害，有40%概率使目标混乱1回合；若目标已有火种，混乱概率提升至70%', effect: { dmg: 1.0, confuseChance: 0.4, turns: 1, markBonusConfuse: 0.7, markId: 'huozhong' } },
                s3: { name: '雅音', type: 'skill', cost: 30, cd: 4, desc: '给我方全体回复8%最大内力，并提高10%火属性伤害，持续2回合', effect: { healMpAll: 0.08, buffTeamFireDmg: { val: 0.1, turns: 2 } } },
                ult: { name: '赤壁烈焰', type: 'ult', desc: '对敌方全体造成210%火属性伤害，所有火属性伤害提升50%，持续2回合；若有目标带有火种，则该目标本次伤害无视防御', effect: { allDmg: 2.1, element: 'fire', buffTeamFireDmg: { val: 0.5, turns: 2 }, markPierce: true, markId: 'huozhong' } }
            },
            unlock: { type: 'legend', chapter: 6 }
        },

        // --- 第七章传说任务：黄忠 ---
        huangzhong: {
            id: 'huangzhong', name: '黄忠', avatar: '🏹', faction: '蜀',
            weapon: 'gong', growth: 'shenshe', recruitLevel: 28,
            str: 8, agi: 11, vit: 7, luk: 9,
            skills: {
                s1: { name: '百步穿杨', type: 'skill', cost: 30, cd: 3, desc: '对敌方生命最低的目标造成170%伤害；若目标生命低于30%，本次攻击暴击率+50%', effect: { snipeLowestHp: { dmg: 1.7, lowHpThreshold: 0.3, bonusCrit: 0.5 } } },
                s2: { name: '凝神一击', type: 'skill', cost: 20, cd: 2, desc: '本回合不行动，下回合首次攻击伤害+80%，暴击率+30%，且无视目标闪避', effect: { skipTurn: true, nextAtkBuff: { dmgBoost: 0.8, crit: 0.3, ignoreDodge: true } } },
                s3: { name: '老兵不死', type: 'skill', cost: 25, cd: 4, desc: '自身暴击伤害提升25%，持续3回合；若本次攻击暴击，有30%概率不进入冷却', effect: { selfBuff: { critDmg: 0.25, turns: 3 }, critNoCdChance: 0.3 } },
                ult: { name: '定军山神箭', type: 'ult', desc: '对敌方单体造成360%伤害，必定暴击，无视闪避；若击杀目标，我方全体攻击+15%，持续2回合', effect: { dmg: 3.6, forceCrit: true, ignoreDodge: true, killTeamBuff: { atk: 0.15, turns: 2 } } }
            },
            unlock: { type: 'legend', chapter: 7 }
        },
        machao: {
            id: 'machao', name: '马超', avatar: '🐴', faction: '蜀',
            weapon: 'qiang', growth: 'youlong', recruitLevel: 28,
            str: 10, agi: 12, vit: 6, luk: 7,
            skills: {
                s1: { name: '铁骑冲阵', type: 'skill', cost: 30, cd: 3, desc: '对敌方最前一排造成145%伤害，有30%概率击退目标', effect: { frontDmg: 1.45, knockbackChance: 0.3 } },
                s2: { name: '西凉烈枪', type: 'skill', cost: 30, cd: 4, desc: '对单体造成2次攻击，每次90%伤害；若目标被击退过，则每次伤害提升至130%', effect: { hits: 2, dmg: 0.9, knockedBonusDmg: 1.3 } },
                s3: { name: '骑术精通', type: 'skill', cost: 25, cd: 5, desc: '自身速度提升25%，持续3回合；期间每次行动后，有20%概率额外行动1次', effect: { selfBuff: { speed: 0.25, turns: 3 }, extraActionChance: 0.2 } },
                ult: { name: '神威天将', type: 'ult', desc: '对敌方单体造成5次攻击，每次75%伤害；每次攻击有20%概率暴击，暴击时伤害翻倍且无视防御', effect: { hits: 5, dmg: 0.75, perHitCritChance: 0.2, critDoubleDmg: true, critPierce: true } }
            },
            unlock: { type: 'legend', chapter: 7 }
        },

        // --- 第八章传说任务：司马懿 ---
        simayi: {
            id: 'simayi', name: '司马懿', avatar: '🦊', faction: '魏',
            weapon: 'jian', growth: 'qimen', recruitLevel: 30,
            str: 7, agi: 9, vit: 7, luk: 10,
            skills: {
                s1: { name: '鬼才', type: 'skill', cost: 25, cd: 3, desc: '对单体造成140%伤害，有35%概率使目标沉默1回合', effect: { dmg: 1.4, silenceChance: 0.35, turns: 1 } },
                s2: { name: '狼顾', type: 'skill', cost: 25, cd: 4, desc: '自身闪避+15%，持续2回合；每次闪避后，下一次攻击伤害+30%', effect: { selfBuff: { dodge: 0.15, turns: 2 }, dodgeNextDmgBonus: 0.3 } },
                s3: { name: '鹰视', type: 'skill', cost: 30, cd: 4, desc: '查看敌方全体当前内力值，并给内力最高的敌方单位施加「摄魂」（每回合损失8%最大内力，持续2回合）', effect: { revealMp: true, debuffHighestMp: { mpDrain: 0.08, turns: 2 } } },
                ult: { name: '冢虎之谋', type: 'ult', desc: '对敌方全体造成200%伤害，有40%概率使目标沉默1回合；若目标已有沉默，则延长1回合并造成额外100%伤害', effect: { allDmg: 2.0, silenceChance: 0.4, turns: 1, extendSilenceBonusDmg: 1.0 } }
            },
            unlock: { type: 'legend', chapter: 8 }
        },

        // --- 特殊/隐藏武将 ---
        lvbu: {
            id: 'lvbu', name: '吕布', avatar: '👹', faction: '群雄',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 40,
            str: 15, agi: 9, vit: 9, luk: 5,
            skills: {
                s1: { name: '无双乱舞', type: 'skill', cost: 30, cd: 3, desc: '对随机3个敌方目标各造成115%伤害；若只有一个敌方目标，则对该目标造成330%伤害', effect: { randomHits: 3, dmg: 1.15, singleTargetBonus: 3.3 } },
                s2: { name: '魔神降世', type: 'skill', cost: 35, cd: 5, desc: '自身攻击+30%，防御-15%，持续3回合；期间每次击杀敌方单位，延长1回合', effect: { selfBuff: { atk: 0.3, def: -0.15, turns: 3 }, killExtend: 1 } },
                s3: { name: '辕门射戟', type: 'skill', cost: 30, cd: 4, desc: '对敌方后排单体造成180%伤害，无视其前排保护，有30%概率使其沉默1回合', effect: { backDmg: 1.8, ignoreFront: true, silenceChance: 0.3, turns: 1 } },
                ult: { name: '鬼神破灭', type: 'ult', desc: '对敌方单体造成420%伤害，无视40%防御；若目标生命高于50%，额外造成目标最大生命15%的真实伤害', effect: { dmg: 4.2, pierceDef: 0.4, highHpTrueDmg: { threshold: 0.5, hpPct: 0.15 } } }
            },
            unlock: { type: 'hidden' }
        }
    },

    // ===== 成长类型基础属性（每级自动增加） =====
    growthTypes: {
        mengjiang: { str: 1.0, agi: 0.3, vit: 0.8, luk: 0.2, label: '猛将型' },
        youlong: { str: 0.5, agi: 1.0, vit: 0.3, luk: 0.2, label: '游龙型' },
        tiebi: { str: 0.5, agi: 0.2, vit: 1.0, luk: 0.3, label: '铁壁型' },
        jiyun: { str: 0.2, agi: 0.5, vit: 0.3, luk: 1.0, label: '机运型' },
        xiaoxiong: { str: 0.6, agi: 0.6, vit: 0.6, luk: 0.4, label: '枭雄型' },
        shenshe: { str: 0.4, agi: 1.0, vit: 0.3, luk: 0.6, label: '神射型' },
        qimen: { str: 0.3, agi: 0.5, vit: 0.3, luk: 0.8, label: '奇门型' }
    },

    // ===== 羁绊系统配置 =====
    // 羁绊0级=刚招募，满级5级
    // 2级解锁武将奥义，4级主角可学武将一个技能，5级全属性+10%
    bondConfig: {
        maxLevel: 5,
        // 每级升级所需羁绊经验
        expNeed: [0, 100, 250, 500, 1000, 2000], // index对应目标等级
        // 每级奖励
        rewards: {
            1: { exp: 200, silver: 500 },
            2: { exp: 500, silver: 1000, rareMat: 1, unlockUlt: true },
            3: { exp: 1000, silver: 2000, frag: 1 },
            4: { exp: 2000, silver: 3000, pages: 2, learnSkill: true },
            5: { exp: 5000, silver: 5000, frag: 1, statBonus: 0.1 }
        }
    },

    // ===== 基础武器（开局/低级） =====
    baseWeapons: {
        quan_tie: { id: 'quan_tie', name: '铁拳套', type: 'quan', quality: 'white', atk: 15, level: 1, materials: { tiekuang: 2, shoupi: 2 } },
        jian_tie: { id: 'jian_tie', name: '铁剑', type: 'jian', quality: 'white', atk: 18, level: 1, materials: { tiekuang: 3, muchai: 1 } },
        dao_tie: { id: 'dao_tie', name: '环首刀', type: 'dao', quality: 'white', atk: 22, level: 1, materials: { tiekuang: 3, muchai: 1 } },
        gong_mu: { id: 'gong_mu', name: '木弓', type: 'gong', quality: 'white', atk: 16, level: 1, materials: { muchai: 3, jiaojin: 1 } },
        qiang_mu: { id: 'qiang_mu', name: '木枪', type: 'qiang', quality: 'white', atk: 20, level: 1, materials: { muchai: 4 } }
    },

    // ===== 可锻造武器列表 =====
    forgeList: [
        { id: 'jian_gang', name: '精钢剑', type: 'jian', quality: 'green', atk: 28, level: 5, materials: { tiekuang: 4, jingtie: 2, muchai: 1 }, success: 0.9 },
        { id: 'dao_gang', name: '斩马刀', type: 'dao', quality: 'green', atk: 35, level: 5, materials: { tiekuang: 5, jingtie: 2, muchai: 1 }, success: 0.9 },
        { id: 'quan_gang', name: '钢爪', type: 'quan', quality: 'green', atk: 25, level: 5, materials: { tiekuang: 4, jingtie: 2, shoupi: 2 }, success: 0.9 },
        { id: 'gong_tie', name: '铁胎弓', type: 'gong', quality: 'green', atk: 26, level: 5, materials: { gumu: 2, jiaojin: 2, jingtie: 2 }, success: 0.9 },
        { id: 'qiang_tie', name: '铁枪', type: 'qiang', quality: 'green', atk: 32, level: 5, materials: { tiekuang: 4, muchai: 3 }, success: 0.9 },
        { id: 'jian_qingfeng', name: '青锋剑', type: 'jian', quality: 'blue', atk: 45, level: 15, materials: { jingtie: 5, tongkuang: 3, gumu: 2 }, success: 0.75 },
        { id: 'dao_hutou', name: '虎头刀', type: 'dao', quality: 'blue', atk: 55, level: 15, materials: { jingtie: 5, tongkuang: 3, shoupi: 2 }, success: 0.75 }
    ],

    // ===== 敌人数据 =====
    enemies: {
        dongzhuo_qinbing: { name: '董卓亲兵', avatar: '👤', hp: 200, atk: 30, def: 16, spd: 10, exp: 55, silver: 70, drops: ['tiekuang', 'tongkuang'] },
        feixiong_jun: { name: '飞熊军', avatar: '🐻', hp: 260, atk: 38, def: 20, spd: 14, exp: 80, silver: 110, drops: ['jingtie', 'shoupi'] },
        xiliang_jingrui: { name: '西凉精锐', avatar: '💀', hp: 320, atk: 44, def: 24, spd: 16, exp: 110, silver: 150, drops: ['xuan_tie', 'jingtie'] },
        xuzhou_bing: { name: '徐州兵', avatar: '👤', hp: 240, atk: 34, def: 18, spd: 12, exp: 65, silver: 85, drops: ['tiekuang', 'muchai'] },
        taoqian_jun: { name: '陶谦军', avatar: '👤', hp: 280, atk: 38, def: 20, spd: 14, exp: 85, silver: 110, drops: ['tongkuang', 'caoyao'] },
        shandao_zei: { name: '山贼', avatar: '🗡️', hp: 220, atk: 36, def: 14, spd: 16, exp: 60, silver: 75, drops: ['muchai', 'shoupi'] },
        yuanjun_xianfeng: { name: '袁军先锋', avatar: '👤', hp: 300, atk: 42, def: 22, spd: 14, exp: 95, silver: 130, drops: ['tiekuang', 'jingtie'] },
        hebei_jingbing: { name: '河北精兵', avatar: '🛡️', hp: 360, atk: 48, def: 28, spd: 12, exp: 120, silver: 160, drops: ['jingtie', 'tongkuang'] },
        yuanjun_qibing: { name: '袁军骑兵', avatar: '🐴', hp: 340, atk: 50, def: 20, spd: 20, exp: 130, silver: 170, drops: ['tongkuang', 'shoupi'] },
        jingzhou_shuishou: { name: '荆州水军', avatar: '⚓', hp: 320, atk: 44, def: 22, spd: 16, exp: 110, silver: 150, drops: ['gumu', 'jiaojin'] },
        caojun_xianfeng: { name: '曹军先锋', avatar: '👤', hp: 350, atk: 46, def: 26, spd: 15, exp: 125, silver: 165, drops: ['jingtie', 'xuan_tie'] },
        huogong_dui: { name: '火攻队', avatar: '🔥', hp: 280, atk: 50, def: 18, spd: 18, exp: 115, silver: 155, drops: ['caoyao', 'lingzhi'] },
        jingzhou_shoujun: { name: '荆州守军', avatar: '🛡️', hp: 380, atk: 48, def: 28, spd: 14, exp: 135, silver: 180, drops: ['tongkuang', 'jingtie'] },
        weijun_nanxia: { name: '魏军南下', avatar: '👤', hp: 400, atk: 52, def: 30, spd: 16, exp: 145, silver: 195, drops: ['xuan_tie', 'jingtie'] },
        wujun_xijin: { name: '吴军西进', avatar: '⚓', hp: 390, atk: 50, def: 26, spd: 20, exp: 140, silver: 190, drops: ['gumu', 'jiaojin'] },
        wujun_huogong: { name: '吴军火攻队', avatar: '🔥', hp: 340, atk: 54, def: 22, spd: 22, exp: 130, silver: 175, drops: ['caoyao', 'lingzhi'] },
        panzhang_bu: { name: '潘璋部', avatar: '👤', hp: 420, atk: 56, def: 30, spd: 18, exp: 155, silver: 210, drops: ['jingtie', 'xuan_tie'] },
        wujun_jingrui: { name: '吴军精锐', avatar: '⚔️', hp: 460, atk: 60, def: 34, spd: 20, exp: 170, silver: 230, drops: ['yuntie', 'xuan_tie'] },
        huangjin_bing: { name: '黄巾兵', avatar: '👤', hp: 80, atk: 15, def: 6, spd: 8, exp: 20, silver: 30, drops: ['tiekuang', 'caoyao'] },
        huangjin_zu: { name: '黄巾卒', avatar: '👤', hp: 100, atk: 18, def: 8, spd: 10, exp: 28, silver: 45, drops: ['tiekuang', 'muchai'] },
        huangjin_xiaoshuai: { name: '黄巾小帅', avatar: '🦹', hp: 150, atk: 24, def: 12, spd: 12, exp: 50, silver: 80, drops: ['jingtie', 'caoyao'] },
        huangjin_daoshuai: { name: '黄巾大帅', avatar: '🦹', hp: 240, atk: 32, def: 18, spd: 14, exp: 90, silver: 150, drops: ['jingtie', 'rensen'] },
        xiliang_bing: { name: '西凉兵', avatar: '👤', hp: 120, atk: 26, def: 14, spd: 10, exp: 45, silver: 60, drops: ['tiekuang', 'tongkuang'] },
        xiliang_qibing: { name: '西凉骑兵', avatar: '🐴', hp: 170, atk: 35, def: 16, spd: 18, exp: 70, silver: 90, drops: ['tongkuang', 'shoupi'] },
        xiliang_daoshuai: { name: '西凉大将', avatar: '🦹', hp: 300, atk: 44, def: 22, spd: 15, exp: 120, silver: 200, drops: ['xuan_tie', 'jingtie'] },
        boss_dongzhuo: { name: '董卓', avatar: '🐷', hp: 900, atk: 55, def: 30, spd: 10, exp: 400, silver: 700, drops: ['xuan_tie', 'miji_canyi'], isBoss: true },
        boss_jiling: { name: '纪灵', avatar: '🔨', hp: 1000, atk: 60, def: 28, spd: 14, exp: 450, silver: 800, drops: ['jingtie', 'tongkuang'], isBoss: true },
        boss_yanliang: { name: '颜良', avatar: '🔴', hp: 1200, atk: 68, def: 32, spd: 16, exp: 550, silver: 1000, drops: ['xuan_tie', 'yuntie'], isBoss: true },
        boss_wenchou: { name: '文丑', avatar: '⚫', hp: 1250, atk: 65, def: 35, spd: 15, exp: 550, silver: 1000, drops: ['xuan_tie', 'yuntie'], isBoss: true },
        boss_caimao: { name: '蔡瑁', avatar: '🚢', hp: 1100, atk: 58, def: 30, spd: 18, exp: 500, silver: 900, drops: ['gumu', 'jiaojin'], isBoss: true },
        boss_caren: { name: '曹仁', avatar: '🛡️', hp: 1400, atk: 62, def: 40, spd: 12, exp: 600, silver: 1100, drops: ['xuan_tie', 'jingtie'], isBoss: true },
        boss_lvmeng: { name: '吕蒙', avatar: '📖', hp: 1350, atk: 66, def: 34, spd: 20, exp: 600, silver: 1100, drops: ['yuntie', 'miji_canyi'], isBoss: true },
        boss_luxun: { name: '陆逊', avatar: '🔥', hp: 1500, atk: 70, def: 36, spd: 22, exp: 700, silver: 1300, drops: ['yuntie', 'lingzhi'], isBoss: true },
        boss_zhangliang: { name: '张梁', avatar: '🔥', hp: 450, atk: 32, def: 16, spd: 12, exp: 200, silver: 300, drops: ['jingtie', 'caoyao'], isBoss: true,
            skills: [
                { name: '妖火咒', cost: 25, cd: 3, dmg: 1.6, desc: '对单体造成160%伤害，30%概率灼烧（每回合损失5%生命，持续2回合）' },
                { name: '地裂术', cost: 30, cd: 4, dmg: 1.3, desc: '对最前一排造成130%伤害' }
            ],
            ult: { name: '太平烈焰', cost: 50, dmg: 2.0, desc: '对敌方全体造成200%火属性伤害，降低全体10%防御，持续2回合' }
        },
        boss_zhangbao: { name: '张宝', avatar: '❄️', hp: 500, atk: 35, def: 18, spd: 14, exp: 250, silver: 400, drops: ['xuan_tie', 'caoyao'], isBoss: true,
            skills: [
                { name: '冰封咒', cost: 25, cd: 3, dmg: 1.5, desc: '对单体造成150%伤害，20%概率冰冻（无法行动1回合）' },
                { name: '寒霜袭', cost: 30, cd: 4, dmg: 1.2, desc: '对随机2个目标造成120%冰属性伤害，降低目标15%速度，持续2回合' }
            ],
            ult: { name: '玄冰风暴', cost: 50, dmg: 1.8, desc: '对敌方全体造成180%冰属性伤害，30%概率冰冻1回合' }
        },
        boss_zhangjiao: { name: '张角', avatar: '⚡', hp: 600, atk: 40, def: 20, spd: 15, exp: 300, silver: 500, drops: ['renshen', 'miji_canyi'], isBoss: true,
            skills: [
                { name: '五雷轰顶', cost: 25, cd: 3, dmg: 1.7, desc: '对单体造成170%雷属性伤害，无视20%防御' },
                { name: '天公护体', cost: 30, cd: 5, dmg: 0, desc: '自身获得护盾（吸收30%最大生命值伤害），持续2回合' }
            ],
            ult: { name: '苍天已死', cost: 60, dmg: 2.2, desc: '对敌方全体造成220%雷属性伤害，降低全体20%攻击，持续2回合' }
        },
        boss_huaxiong: { name: '华雄', avatar: '🐗', hp: 720, atk: 50, def: 26, spd: 12, exp: 350, silver: 600, drops: ['xuan_tie', 'miji_canyi'], isBoss: true },
        boss_lvbu_first: { name: '吕布', avatar: '👹', hp: 2500, atk: 90, def: 45, spd: 25, exp: 1000, silver: 1500, drops: ['yuntie'], isBoss: true }
    },

    // ===== 关卡配置（网格迷宫） =====
    chapters: [
        {
            id: 1, name: '黄巾之乱', location: '巨鹿',
            width: 6, height: 6,
            startPos: { x: 0, y: 5 },
            exitPos: { x: 5, y: 0 },
            desc: '天下大乱，黄巾军四起，你从家乡出发，初涉乱世。',
            cells: {
                // 第一行 y=5（最上排）
                '0,5': { type: 'start', icon: '🏠', desc: '起点：巨鹿城郊的村庄' },
                '1,5': { type: 'npc', icon: '👑', npc: 'liubei', npcName: '刘备', desc: '城守刘备正在组织义军抵抗黄巾。', dialog: '壮士来得正好！黄巾贼众肆虐巨鹿，百姓苦不堪言。我已率部在此抵抗，若能击破贼首张梁张宝张角，巨鹿百姓方能安居乐业。' },
                '2,5': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 2, desc: '前方有黄巾兵拦路！' },
                '3,5': { type: 'empty', icon: '⬜', desc: '一片枯树林，阴风阵阵。' },
                '4,5': { type: 'npc', icon: '👤', npc: 'cunmin_a', npcName: '村民阿福', desc: '一位村民神色慌张，似乎有话要说。', dialog: '壮士！黄巾贼在附近烧杀抢掠，求你出手相助！杀了20个黄巾兵再来找我。' },
                '5,5': { type: 'chest', icon: '📦', desc: '发现一个被遗弃的补给箱。', reward: { items: ['tiekuang:3', 'caoyao:2'], silver: 50 } },

                // 第二行 y=4
                '0,4': { type: 'battle', icon: '⚔️', enemy: 'huangjin_zu', count: 2, desc: '黄巾卒正在搜查村庄！' },
                '1,4': { type: 'empty', icon: '⬜', desc: '破旧的茅草屋，人去楼空。' },
                '2,4': { type: 'npc', icon: '👤', npc: 'tiejiang', npcName: '老铁匠', desc: '一位老铁匠在废墟中整理工具。', dialog: '小伙子，想打造兵器吗？收集材料来找我。' },
                '3,4': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 3, desc: '黄巾兵巡逻队正在靠近！' },
                '4,4': { type: 'empty', icon: '⬜', desc: '干涸的河床，遍布碎石。' },
                '5,4': { type: 'battle', icon: '💀', enemy: 'huangjin_xiaoshuai', count: 1, desc: '黄巾小帅率领手下在此设伏！' },

                // 第三行 y=3
                '0,3': { type: 'chest', icon: '📦', desc: '一棵古树下的藏宝箱。', reward: { items: ['jinchuang:2', 'muchai:3'], silver: 80 } },
                '1,3': { type: 'empty', icon: '⬜', desc: '荒野草地，偶尔有野兔窜过。' },
                '2,3': { type: 'npc', icon: '👤', npc: 'cunmin_b', npcName: '村民阿贵', desc: '一位村民正在采药，却遇到了麻烦。', dialog: '壮士，我最近急需草药治病，你能帮我收集15株草药吗？' },
                '3,3': { type: 'battle', icon: '⚔️', enemy: 'huangjin_zu', count: 3, desc: '一群黄巾卒挡住了去路！' },
                '4,3': { type: 'empty', icon: '⬜', desc: '废弃的驿站，牌匾歪斜。' },
                '5,3': { type: 'hidden', icon: '❓', desc: '空气中弥漫着一股神秘的气息...', condition: { fuqi: 8 }, reward: { items: ['chixiao_frag:1'] } },

                // 第四行 y=2
                '0,2': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 3, desc: '黄巾兵的主力部队！' },
                '1,2': { type: 'empty', icon: '⬜', desc: '荒芜的农田，庄稼早已枯萎。' },
                '2,2': { type: 'battle', icon: '⚔️', enemy: 'huangjin_xiaoshuai', count: 2, desc: '两名黄巾小帅在此驻守！' },
                '3,2': { type: 'chest', icon: '📦', desc: '一辆翻倒的粮车，物资散落一地。', reward: { items: ['jingtie:2', 'caoyao:3'], silver: 100 } },
                '4,2': { type: 'empty', icon: '⬜', desc: '一条蜿蜒的山路，通往黄巾大营。' },
                '5,2': { type: 'battle', icon: '💀', enemy: 'huangjin_daoshuai', count: 1, desc: '黄巾大帅亲率精锐把守要道！' },

                // 第五行 y=1
                '0,1': { type: 'empty', icon: '⬜', desc: '荒凉的村庄，空无一人。' },
                '1,1': { type: 'battle', icon: '⚔️', enemy: 'huangjin_zu', count: 2, desc: '黄巾卒正在搜查残屋！' },
                '2,1': { type: 'empty', icon: '⬜', desc: '一片竹林，风吹过沙沙作响。' },
                '3,1': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 2, desc: '黄巾兵的暗哨！', blockedDirs: ['down'] },
                '4,1': { type: 'npc', icon: '👤', npc: 'liaohua', npcName: '廖化', desc: '一名义军小将正被黄巾兵围困，急需救援！', dialog: '多谢壮士相救！我乃义军廖化，愿随壮士共讨黄巾！', blockedDirs: ['down'] },
                '5,1': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 4, desc: '黄巾兵重重包围！', blockedDirs: ['down'] },

                // 第六行 y=0（最下排，boss区域）
                '0,0': { type: 'empty', icon: '⬜', desc: '黄巾大营外围，戒备森严。' },
                '1,0': { type: 'battle', icon: '⚔️', enemy: 'huangjin_xiaoshuai', count: 2, desc: '最后的防线——黄巾小帅拼死抵抗！' },
                '2,0': { type: 'empty', icon: '⬜', desc: '营门大开，杀声震天。' },
                '3,0': { type: 'battle', icon: '💀', enemy: 'huangjin_daoshuai', count: 1, desc: '黄巾大帅死守营门！' },
                '4,0': { type: 'empty', icon: '⬜', desc: '祭坛外围，旌旗猎猎。' },
                // (5,0) boss关——三阶段：张梁→张宝→张角（最终三人同时出场）
                '5,0': { type: 'boss', icon: '👹', desc: '黄巾祭坛——天公将军的道场，杀气弥漫。', reward: { exp: 800, silver: 1200 }, phases: [ { enemy: 'boss_zhangliang', icon: '🔥', name: '张梁', desc: '人公将军张梁正在祭坛前施法，太平道的妖火在他周身燃烧。', dialog: '张梁：苍天已死，黄天当立！太平道万岁！逆贼，受死吧！' }, { enemy: 'boss_zhangbao', icon: '❄️', name: '张宝', desc: '地公将军张宝踏冰而来，眼中满是复仇的怒火。', dialog: '张宝：二哥！我来为你报仇！玄冰风暴，起！' }, { enemies: ['boss_zhangliang','boss_zhangbao','boss_zhangjiao'], icon: '⚡', name: '张角', desc: '天公将军张角降临，张梁张宝死而复生，三人同列中间，太平道的最终力量在此凝聚。', dialog: '张角：苍天已死，黄天当立！岁在甲子，天下大吉！你们……都要葬身于此！' } ] }
            }
        },
        {
            id: 2, name: '虎牢风云', location: '虎牢关',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '诸侯联军讨伐董卓，虎牢关下，三英战吕布的序幕即将拉开。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '联军大营，旌旗招展。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'xiliang_bing', count: 2, desc: '西凉兵的先锋部队！' },
                '1,1': { type: 'empty', icon: '⬜', desc: '虎牢关外，地势险要。' },
                '1,3': { type: 'battle', icon: '⚔️', enemy: 'xiliang_qibing', count: 2, desc: '西凉铁骑冲锋而来！' },
                '2,2': { type: 'npc', icon: '👤', npc: 'caocao', npcName: '曹操', desc: '曹操正在帐中研究地图。', dialog: '此战关乎天下大势，务必攻破虎牢！' },
                '2,1': { type: 'chest', icon: '📦', desc: '联军辎重队遗落的物资。', reward: { items: ['jingtie:2', 'tongkuang:2'], silver: 100 } },
                '2,3': { type: 'battle', icon: '💀', enemy: 'xiliang_bing', count: 3, desc: '西凉兵的重重包围！' },
                '3,2': { type: 'empty', icon: '⬜', desc: '虎牢关城墙高耸入云。' },
                '3,1': { type: 'battle', icon: '⚔️', enemy: 'xiliang_qibing', count: 3, desc: '西凉铁骑的主力！' },
                '3,3': { type: 'npc', icon: '👤', npc: 'yuanshao', npcName: '袁绍', desc: '袁绍正在召集诸侯议事。', dialog: '吕布勇猛无双，谁敢出战？' },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_lvbu_first', desc: '吕布手持方天画戟，胯下赤兔马，傲立关前！\n（此战只需坚持10回合即可）', reward: { exp: 800, silver: 1500 }, special: { survive: 10 } }
            }
        },
        {
            id: 3, name: '董卓之乱', location: '洛阳',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '董卓入主洛阳，专权跋扈，天下义士暗中谋划，洛阳城内暗流涌动。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '洛阳城外，难民络绎不绝。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'dongzhuo_qinbing', count: 2, desc: '董卓亲兵在城门口盘查行人！' },
                '1,1': { type: 'empty', icon: '⬜', desc: '洛阳街道，商铺紧闭，人心惶惶。' },
                '1,3': { type: 'npc', icon: '👤', npc: 'wangyun', npcName: '王允', desc: '王允神色凝重，似有心事。', dialog: '董卓倒行逆施，必遭天谴！若你能击杀25个董卓亲兵，我可助你接触貂蝉姑娘。' },
                '2,2': { type: 'battle', icon: '⚔️', enemy: 'feixiong_jun', count: 2, desc: '飞熊军巡逻队，气势汹汹！' },
                '2,1': { type: 'chest', icon: '📦', desc: '一处被查封的官邸，角落里藏着物资。', reward: { items: ['jingtie:2', 'tongkuang:2'], silver: 120 } },
                '2,3': { type: 'npc', icon: '👤', npc: 'gongnv', npcName: '宫女', desc: '一名宫女神色慌张，需要草药。', dialog: '宫中有人病重，急需20株草药，你能帮我找来吗？' },
                '2,0': { type: 'battle', icon: '💀', enemy: 'xiliang_jingrui', count: 1, desc: '西凉精锐在此设伏！' },
                '3,2': { type: 'battle', icon: '⚔️', enemy: 'dongzhuo_qinbing', count: 3, desc: '董卓亲兵的重兵把守！' },
                '3,1': { type: 'empty', icon: '⬜', desc: '太庙附近，气氛肃杀。' },
                '3,3': { type: 'hidden', icon: '❓', desc: '废弃的藏书阁，似乎藏着什么……', condition: { fuqi: 10 }, reward: { items: ['yitian_frag:1'] } },
                '3,0': { type: 'battle', icon: '⚔️', enemy: 'feixiong_jun', count: 2, desc: '飞熊军的暗哨！' },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_dongzhuo', desc: '相府深处，董卓横刀立马，杀气滔天！', reward: { exp: 600, silver: 1000 } }
            }
        },
        {
            id: 4, name: '群雄割据', location: '徐州',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '徐州地处要冲，陶谦、袁术、吕布多方势力角逐，百姓流离失所。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '徐州城外，战火纷飞。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'xuzhou_bing', count: 2, desc: '徐州兵的巡逻队！' },
                '1,1': { type: 'npc', icon: '👤', npc: 'chenggong', npcName: '陈宫', desc: '陈宫正在观察局势。', dialog: '徐州乃兵家必争之地，小心中了袁术的圈套。' },
                '1,3': { type: 'battle', icon: '⚔️', enemy: 'shandao_zei', count: 3, desc: '山贼趁乱劫掠商队！' },
                '2,2': { type: 'empty', icon: '⬜', desc: '徐州城内，到处都是逃难的百姓。' },
                '2,1': { type: 'battle', icon: '⚔️', enemy: 'taoqian_jun', count: 2, desc: '陶谦军的残部在负隅顽抗！' },
                '2,3': { type: 'chest', icon: '📦', desc: '商队遗落的货物。', reward: { items: ['jingtie:3', 'caoyao:3'], silver: 150 } },
                '2,0': { type: 'battle', icon: '💀', enemy: 'shandao_zei', count: 2, desc: '山贼大当家率领手下！' },
                '3,2': { type: 'npc', icon: '👤', npc: 'mizhu', npcName: '糜竺', desc: '糜竺正在赈济灾民。', dialog: '感谢壮士相助！若能清缴25个山贼，我定有重谢。' },
                '3,1': { type: 'battle', icon: '⚔️', enemy: 'xuzhou_bing', count: 3, desc: '徐州兵的主力部队！' },
                '3,3': { type: 'empty', icon: '⬜', desc: '一片狼藉的市集。' },
                '3,0': { type: 'hidden', icon: '❓', desc: '古井旁有微光闪烁……', condition: { fuqi: 12 }, reward: { items: ['hanyin_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_jiling', desc: '纪灵手持三尖两刃刀，袁术麾下第一猛将！', reward: { exp: 700, silver: 1100 } }
            }
        },
        {
            id: 5, name: '官渡之战', location: '官渡',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '袁绍举七十万大军南下，曹操在官渡以少敌多，胜负难料。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '曹军大营，军旗猎猎。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'yuanjun_xianfeng', count: 2, desc: '袁军先锋部队探营！' },
                '1,1': { type: 'empty', icon: '⬜', desc: '官渡平原，两军对峙。' },
                '1,3': { type: 'npc', icon: '👤', npc: 'xunyu', npcName: '荀彧', desc: '荀彧手持羽扇，运筹帷幄。', dialog: '官渡之战，胜在粮草。若你能帮我击杀30个袁军先锋，我可为大军续命三日。' },
                '2,2': { type: 'battle', icon: '⚔️', enemy: 'hebei_jingbing', count: 2, desc: '河北精兵列阵而来！' },
                '2,1': { type: 'battle', icon: '💀', enemy: 'yuanjun_qibing', count: 2, desc: '袁军铁骑冲锋！' },
                '2,3': { type: 'chest', icon: '📦', desc: '运粮车翻倒，物资散落一地。', reward: { items: ['xuan_tie:2', 'jingtie:3'], silver: 200 } },
                '2,0': { type: 'battle', icon: '⚔️', enemy: 'yuanjun_xianfeng', count: 3, desc: '袁军先锋的突袭！' },
                '3,2': { type: 'empty', icon: '⬜', desc: '乌巢方向，火光隐隐。' },
                '3,1': { type: 'battle', icon: '⚔️', enemy: 'hebei_jingbing', count: 3, desc: '河北精兵的主力！' },
                '3,3': { type: 'npc', icon: '👤', npc: 'guojia', npcName: '郭嘉', desc: '郭嘉病中仍在分析战局。', dialog: '袁绍虽众，不足为惧。你去收集20份精铁，我为大军打造兵器！' },
                '3,0': { type: 'hidden', icon: '❓', desc: '古战场遗址，杀气未散……', condition: { fuqi: 14 }, reward: { items: ['chixiao_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_yanliang', desc: '颜良横刀立马，河北四庭柱之首！', reward: { exp: 800, silver: 1300 } }
            }
        },
        {
            id: 6, name: '赤壁之战', location: '赤壁',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '长江之上，东风已至，孙刘联军火烧赤壁，曹操百万大军灰飞烟灭。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '赤壁南岸，联军水寨。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'jingzhou_shuishou', count: 2, desc: '荆州水军在江面巡逻！' },
                '1,1': { type: 'npc', icon: '👤', npc: 'zhugeliang', npcName: '诸葛亮', desc: '诸葛亮羽扇纶巾，笑看风云。', dialog: '万事俱备，只欠东风。若你能收集25份火油，火烧赤壁可成！' },
                '1,3': { type: 'battle', icon: '⚔️', enemy: 'caojun_xianfeng', count: 2, desc: '曹军先锋渡江侦察！' },
                '2,2': { type: 'empty', icon: '⬜', desc: '江面雾气弥漫，战船林立。' },
                '2,1': { type: 'battle', icon: '💀', enemy: 'huogong_dui', count: 2, desc: '黄盖的火攻队正在准备！' },
                '2,3': { type: 'chest', icon: '📦', desc: '沉船中捞起的物资。', reward: { items: ['gumu:3', 'jiaojin:2'], silver: 250 } },
                '2,0': { type: 'battle', icon: '⚔️', enemy: 'jingzhou_shuishou', count: 3, desc: '荆州水军的主力战船！' },
                '3,2': { type: 'battle', icon: '⚔️', enemy: 'caojun_xianfeng', count: 3, desc: '曹军先锋的舰队！' },
                '3,1': { type: 'empty', icon: '⬜', desc: '火光照亮夜空，喊杀声震天。' },
                '3,3': { type: 'npc', icon: '👤', npc: 'pangtong', npcName: '庞统', desc: '庞统正在观察铁索连环。', dialog: '铁索连环，一烧皆焚。你去解决20个曹军先锋，为火攻开路！' },
                '3,0': { type: 'hidden', icon: '❓', desc: '江底古物发出幽光……', condition: { fuqi: 16 }, reward: { items: ['yitian_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_caimao', desc: '蔡瑁统领荆州水军，誓死守卫曹军舰队！', reward: { exp: 900, silver: 1400 } }
            }
        },
        {
            id: 7, name: '三国鼎立', location: '荆州',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '赤壁之后，天下三分。荆州成为魏蜀吴争夺的焦点，战火从未停歇。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '荆州边境，三方势力犬牙交错。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'jingzhou_shoujun', count: 2, desc: '荆州守军在关卡盘查！' },
                '1,1': { type: 'empty', icon: '⬜', desc: '荆州城池，城高池深。' },
                '1,3': { type: 'npc', icon: '👤', npc: 'weiyan', npcName: '魏延', desc: '魏延手提大刀，豪气干云。', dialog: '荆州乃必争之地！若你能帮我收集20份精铁，我可为大军打造兵器。' },
                '2,2': { type: 'battle', icon: '⚔️', enemy: 'weijun_nanxia', count: 2, desc: '魏军南下，气势汹汹！' },
                '2,1': { type: 'battle', icon: '💀', enemy: 'wujun_xijin', count: 2, desc: '吴军西进，水军精锐！' },
                '2,3': { type: 'chest', icon: '📦', desc: '战场遗迹中的军需物资。', reward: { items: ['xuan_tie:2', 'jingtie:3'], silver: 280 } },
                '2,0': { type: 'battle', icon: '⚔️', enemy: 'jingzhou_shoujun', count: 3, desc: '荆州守军的主力！' },
                '3,2': { type: 'empty', icon: '⬜', desc: '长江渡口，战船往来不绝。' },
                '3,1': { type: 'battle', icon: '⚔️', enemy: 'weijun_nanxia', count: 3, desc: '魏军南下的主力部队！' },
                '3,3': { type: 'npc', icon: '👤', npc: 'madai', npcName: '马岱', desc: '马岱正在整顿兵马。', dialog: '荆州局势复杂，击杀30个吴军西进部队，可保我方侧翼安全！' },
                '3,0': { type: 'hidden', icon: '❓', desc: '古城墙下发现神秘兵器残片……', condition: { fuqi: 18 }, reward: { items: ['hanyin_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_caren', desc: '曹仁亲率魏军精锐，死守荆州北大门！', reward: { exp: 1000, silver: 1600 } }
            }
        },
        {
            id: 8, name: '夷陵之战', location: '夷陵',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '刘备为报关羽之仇，举兵伐吴。陆逊火烧连营七百里，一代枭雄至此落幕。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '夷陵道口，蜀军连营百里。' },
                '1,2': { type: 'battle', icon: '⚔️', enemy: 'wujun_huogong', count: 2, desc: '吴军火攻队在山间埋伏！' },
                '1,1': { type: 'npc', icon: '👤', npc: 'maliang', npcName: '马良', desc: '马良神色忧虑，似有不好的预感。', dialog: '连营七百里，此乃兵家大忌！若你能收集30份水源物资，或可防火灾。' },
                '1,3': { type: 'battle', icon: '⚔️', enemy: 'panzhang_bu', count: 2, desc: '潘璋部在山道设伏！' },
                '2,2': { type: 'empty', icon: '⬜', desc: '山林间闷热异常，东风渐起。' },
                '2,1': { type: 'battle', icon: '💀', enemy: 'wujun_jingrui', count: 2, desc: '吴军精锐从侧翼杀出！' },
                '2,3': { type: 'chest', icon: '📦', desc: '被遗弃的军需品。', reward: { items: ['yuntie:2', 'lingzhi:2'], silver: 300 } },
                '2,0': { type: 'battle', icon: '⚔️', enemy: 'wujun_huogong', count: 3, desc: '大批火攻队来袭！' },
                '3,2': { type: 'battle', icon: '⚔️', enemy: 'panzhang_bu', count: 3, desc: '潘璋部的主力！' },
                '3,1': { type: 'empty', icon: '⬜', desc: '远处火光冲天，喊杀声四起。' },
                '3,3': { type: 'npc', icon: '👤', npc: 'fazheng', npcName: '法正', desc: '法正焦急地查看地图。', dialog: '陆逊诡计多端！速去击杀35个吴军火攻队，否则大营危矣！' },
                '3,0': { type: 'hidden', icon: '❓', desc: '火山口遗迹，古战场的英灵在徘徊……', condition: { fuqi: 20 }, reward: { items: ['chixiao_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_luxun', desc: '陆逊羽扇轻摇，火烧连营的幕后推手，此刻正等待着最后的胜利！', reward: { exp: 1200, silver: 2000 } }
            }
        }
    ],
    // 每个关卡是一个 width×height 的网格
    // cells 以 "x,y" 为键存储格子数据
    // startPos: 起点坐标, exitPos: 出口/Boss坐标
    // 移动规则：向上下左右相邻格子移动
    // 遇到 battle/elite/boss 类型必须先击败才能通过

    // ===== 材料 =====
    materials: {
        tiekuang: { name: '铁矿', icon: '⛏️', type: 'material' },
        tongkuang: { name: '铜矿', icon: '⛏️', type: 'material' },
        jingtie: { name: '精铁矿', icon: '💎', type: 'material' },
        xuan_tie: { name: '玄铁', icon: '💎', type: 'material' },
        yuntie: { name: '陨铁', icon: '🌠', type: 'material' },
        muchai: { name: '木材', icon: '🪵', type: 'material' },
        gumu: { name: '古木', icon: '🌳', type: 'material' },
        shoupi: { name: '兽皮', icon: '🦁', type: 'material' },
        jiaojin: { name: '蛟筋', icon: '🐍', type: 'material' },
        caoyao: { name: '草药', icon: '🌿', type: 'material' },
        renshen: { name: '人参', icon: '🌱', type: 'material' },
        lingzhi: { name: '灵芝', icon: '🍄', type: 'material' },
        miji_canyi: { name: '秘籍残页', icon: '📜', type: 'material' },
        chixiao_frag: { name: '赤霄碎片', icon: '✨', type: 'fragment' },
        hanyin_frag: { name: '寒饮碎片', icon: '❄️', type: 'fragment' },
        yitian_frag: { name: '倚天碎片', icon: '⚔️', type: 'fragment' }
    },

    // ===== 消耗品 =====
    consumables: {
        jinchuang: { name: '金疮药', icon: '💊', type: 'consumable', effect: { healPct: 0.3 }, desc: '恢复30%体力' },
        dahuan: { name: '大还丹', icon: '💊', type: 'consumable', effect: { healPct: 0.6 }, desc: '恢复60%体力' },
        huiqi: { name: '回气散', icon: '⚗️', type: 'consumable', effect: { mpPct: 0.5 }, desc: '恢复50%内力' },
        duanlianfu: { name: '锻造符', icon: '🔖', type: 'consumable', effect: { forgeBonus: 0.2 }, desc: '锻造成功率+20%' },
        jiebanzheng: { name: '羁绊之证', icon: '💝', type: 'consumable', effect: { bondExp: 50 }, desc: '提升武将羁绊经验50点' }
    },

    // ===== 道具（宝箱、秘籍等）=====
    items: {
        baoxiang_wuxue: { name: '武学宝箱', icon: '🎁', type: 'item', desc: '打开后可获得武学秘籍' },
        baoxiang_miji: { name: '秘籍宝箱', icon: '🎁', type: 'item', desc: '打开后可获得珍稀武学秘籍' },
        miji_bajibeng: { name: '八极崩劲·秘籍', icon: '📕', type: 'item', desc: '研读后可习得拳法秘籍技能「八极崩劲」', skillId: 'quan_bajibeng' },
        miji_liudao: { name: '六道轮回拳·秘籍', icon: '📕', type: 'item', desc: '研读后可习得拳法秘籍奥义「六道轮回拳」', skillId: 'quan_liudao' },
        miji_xiaoxiang: { name: '潇湘剑诀·秘籍', icon: '📕', type: 'item', desc: '研读后可习得剑法秘籍技能「潇湘剑诀」', skillId: 'jian_xiaoxiang' },
        miji_tianxing: { name: '天星蝶影剑·秘籍', icon: '📕', type: 'item', desc: '研读后可习得剑法秘籍奥义「天星蝶影剑」', skillId: 'jian_tianxing' },
        miji_juhe: { name: '居合一闪·秘籍', icon: '📕', type: 'item', desc: '研读后可习得刀法秘籍技能「居合一闪」', skillId: 'dao_juhe' },
        miji_xianshuang: { name: '霰雪霜寒斩·秘籍', icon: '📕', type: 'item', desc: '研读后可习得刀法秘籍奥义「霰雪霜寒斩」', skillId: 'dao_xianshuang' },
        miji_longyin: { name: '龙吟九霄·秘籍', icon: '📕', type: 'item', desc: '研读后可习得枪法秘籍技能「龙吟九霄」', skillId: 'qiang_longyin' },
        miji_pojunws: { name: '破军无双·秘籍', icon: '📕', type: 'item', desc: '研读后可习得枪法秘籍奥义「破军无双」', skillId: 'qiang_pojunws' },
        miji_jingyu: { name: '惊羽连珠·秘籍', icon: '📕', type: 'item', desc: '研读后可习得弓法秘籍技能「惊羽连珠」', skillId: 'gong_jingyu' },
        miji_luori: { name: '落日神射·秘籍', icon: '📕', type: 'item', desc: '研读后可习得弓法秘籍奥义「落日神射」', skillId: 'gong_luori' }
    },

    // ===== 任务 =====
    // location: 任务所在地点名，npc: NPC标识，npcName: NPC显示名
    quests: [
        { id: 'q_kill_huangjin', name: '清缴黄巾', type: 'sub', desc: '击杀黄巾兵×20', location: '巨鹿', npc: 'cunmin_a', npcName: '村民阿福', target: { kill: 'huangjin_bing', count: 20 }, reward: { exp: 500, silver: 1000 } },
        { id: 'q_collect_herb', name: '采集草药', type: 'sub', desc: '提交草药×15', location: '巨鹿', npc: 'cunmin_b', npcName: '村民阿贵', target: { item: 'caoyao', count: 15 }, reward: { exp: 300, items: ['jinchuang:5'] } },
        { id: 'q_forge_first', name: '初次锻造', type: 'sub', desc: '在铁匠铺锻造任意兵器', location: '巨鹿', npc: 'tiejiang', npcName: '老铁匠', target: { forge: 1 }, reward: { exp: 200, silver: 500 } }
    ],

    // ===== 经验表（5-99级，每级升级所需经验） =====
    // 升级公式：level * multiplier
    // 5-20级:×80  21-40级:×160  41-60级:×320  61-80级:×640  81-99级:×1280
    expTable: (function() {
        var table = [];
        table[0] = 0; // index 0 占位
        for (var lv = 1; lv <= 99; lv++) {
            var mult;
            if (lv <= 20) mult = 80;
            else if (lv <= 40) mult = 160;
            else if (lv <= 60) mult = 320;
            else if (lv <= 80) mult = 640;
            else mult = 1280;
            table[lv] = lv * mult;
        }
        return table;
    })()
};

// ===== 兑换码配置 =====
GAME_DATA.redeemCodes = {
    'WUSHEN666': { rewards: { items: ['baoxiang_wuxue:1'] }, desc: '武学宝箱×1' },
    'WUSHEN888': { rewards: { silver: 500, items: ['jinchuang:5'] }, desc: '银两×500、金疮药×5' },
    'JIANGNIUYAO': { rewards: { items: ['baoxiang_miji:1'] }, desc: '秘籍宝箱×1' }
};


function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randf(min, max) {
    return Math.random() * (max - min) + min;
}

function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
}

// ===== 计算属性 =====
// 根据unit的str/agi/vit/luk/level/equip计算战斗属性
function calcStats(unit) {
    var s = unit.str || 1;
    var a = unit.agi || 1;
    var v = unit.vit || 1;
    var l = unit.luk || 1;
    var level = unit.level || 5;

    // 基础属性计算
    var maxHp = 80 + v * 15 + level * 10;
    var maxMp = 30 + v * 5 + level * 3;
    var atk = s * 4 + level * 2;
    var def = Math.floor(s * 1.5 + v * 1 + level);
    var spd = a * 3 + level;
    var crit = Math.floor(3 + a * 0.5 + l * 0.3);
    var dodge = Math.floor(2 + a * 0.8);

    // 武器加成
    var weaponAtk = 0;
    if (unit.equip && unit.equip.weapon) {
        var w = unit.equip.weapon;
        weaponAtk = w.atk || 0;
        var qf = (GAME_DATA.qualities[w.quality] && GAME_DATA.qualities[w.quality].factor) || 1;
        weaponAtk = Math.floor(weaponAtk * qf);
    }

    // 羁绊5级全属性+10%
    var bondBonus = 1.0;
    if (unit.bondLevel && unit.bondLevel >= 5) {
        bondBonus = 1.1;
    }

    return {
        maxHp: Math.floor(maxHp * bondBonus),
        maxMp: Math.floor(maxMp * bondBonus),
        hp: unit.hp !== undefined && unit.hp !== null ? unit.hp : Math.floor(maxHp * bondBonus),
        mp: unit.mp !== undefined && unit.mp !== null ? unit.mp : Math.floor(maxMp * bondBonus),
        atk: Math.floor((atk + weaponAtk) * bondBonus),
        def: Math.floor(def * bondBonus),
        spd: Math.floor(spd * bondBonus),
        crit: crit,
        dodge: dodge,
        ult: unit.ult || 0
    };
}

// ===== 创建单位实例 =====
// template: 武将模板  level: 招募等级（决定初始等级）
function createUnit(template, level) {
    level = level || 5;
    var unit = {};
    for (var key in template) {
        if (template.hasOwnProperty(key)) {
            unit[key] = template[key];
        }
    }
    unit.level = level;
    unit.hp = 0;
    unit.mp = 0;
    if (!unit.equip) unit.equip = { weapon: null };
    if (!unit.skills) unit.skills = [];
    if (!unit.ult) unit.ult = 0;
    if (!unit.buffs) unit.buffs = [];
    if (!unit.debuffs) unit.debuffs = [];
    if (unit.defending === undefined) unit.defending = false;
    if (unit.exp === undefined) unit.exp = 0;
    // 羁绊系统
    if (unit.bondLevel === undefined) unit.bondLevel = 0;
    if (unit.bondExp === undefined) unit.bondExp = 0;

    var stats = calcStats(unit);
    unit.hp = stats.maxHp;
    unit.mp = stats.maxMp;
    return unit;
}
