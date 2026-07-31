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

    // ===== 武将库 =====
    // 所有武将招募时自带2个技能，奥义需羁绊2级解锁
    // 招募等级 = 获得难度（关平5级，吕布40级）
    heroes: {
        // --- 开局武将 ---
        guanping: {
            id: 'guanping', name: '关平', avatar: '⚔️', faction: '蜀',
            weapon: 'jian', growth: 'mengjiang', recruitLevel: 5,
            str: 8, agi: 6, vit: 7, luk: 5,
            skills: {
                s1: { name: '龙鳞一击', type: 'skill', cost: 15, cd: 3, desc: '单体180%伤害', effect: { dmg: 1.8 } },
                s2: { name: '忠护', type: 'skill', cost: 25, cd: 4, desc: '帮队友抵挡2次伤害，反弹30%给伤害来源', effect: { protect: 2, reflect: 0.3 } },
                ult: { name: '龙鳞血战', type: 'ult', desc: '根据损失血量提升攻击力（每损10%HP攻击+10%，最高+100%）', effect: { hpScaleDmg: 0.1 } }
            },
            unlock: { type: 'start' }
        },

        // --- 第一章解锁 ---
        zhangfei: {
            id: 'zhangfei', name: '张飞', avatar: '🐍', faction: '蜀',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 10,
            str: 13, agi: 6, vit: 10, luk: 5,
            skills: {
                s1: { name: '咆哮', type: 'skill', cost: 20, cd: 3, desc: '降低敌方全体攻击15%', effect: { debuffAtk: 0.15 } },
                s2: { name: '横扫', type: 'skill', cost: 30, cd: 4, desc: '十字范围180%伤害', effect: { aoe: 'cross', dmg: 1.8 } },
                ult: { name: '当阳断喝', type: 'ult', desc: '全体震慑1回合+300%伤害', effect: { stunAll: true, dmg: 3.0 } }
            },
            unlock: { type: 'story', chapter: 1, stage: 6 }
        },

        // --- 第二章解锁 ---
        guanyu: {
            id: 'guanyu', name: '关羽', avatar: '🐉', faction: '蜀',
            weapon: 'dao', growth: 'mengjiang', recruitLevel: 15,
            str: 12, agi: 7, vit: 9, luk: 6,
            skills: {
                s1: { name: '拖刀计', type: 'skill', cost: 20, cd: 3, desc: '下回合攻击+80%', effect: { nextDmg: 0.8 } },
                s2: { name: '武圣斩', type: 'skill', cost: 30, cd: 4, desc: '单体250%伤害，50%破甲', effect: { dmg: 2.5, breakArmor: 0.5 } },
                ult: { name: '青龙斩', type: 'ult', desc: '扇形300%伤害，吸血20%', effect: { aoe: 'fan', dmg: 3.0, drain: 0.2 } }
            },
            unlock: { type: 'story', chapter: 2, stage: 8 }
        },
        caocao: {
            id: 'caocao', name: '曹操', avatar: '🦅', faction: '魏',
            weapon: 'jian', growth: 'xiaoxiong', recruitLevel: 20,
            str: 9, agi: 8, vit: 8, luk: 8,
            skills: {
                s1: { name: '奸雄', type: 'skill', cost: 20, cd: 3, desc: '偷取目标10%攻击', effect: { stealAtk: 0.1 } },
                s2: { name: '号令', type: 'skill', cost: 30, cd: 4, desc: '全体攻击+20%', effect: { teamBuff: { atk: 0.2, turns: 3 } } },
                ult: { name: '横槊赋诗', type: 'ult', desc: '全体250%伤害+吸血15%', effect: { allDmg: 2.5, drain: 0.15 } }
            },
            unlock: { type: 'story', chapter: 1, stage: 12 }
        },
        xuchu: {
            id: 'xuchu', name: '许褚', avatar: '🐯', faction: '魏',
            weapon: 'quan', growth: 'mengjiang', recruitLevel: 20,
            str: 13, agi: 5, vit: 11, luk: 4,
            skills: {
                s1: { name: '裸衣', type: 'skill', cost: 20, cd: 3, desc: '牺牲10%HP，伤害+60%', effect: { hpCost: 0.1, dmgBoost: 0.6 } },
                s2: { name: '虎痴', type: 'skill', cost: 30, cd: 4, desc: '3段攻击，每段80%', effect: { hits: 3, dmg: 0.8 } },
                ult: { name: '霸天战意', type: 'ult', desc: '单体400%伤害，自身无敌1回合', effect: { dmg: 4.0, invincible: 1 } }
            },
            unlock: { type: 'story', chapter: 2, stage: 5 }
        },

        // --- 传说任务解锁（25级） ---
        zhaoyun: {
            id: 'zhaoyun', name: '赵云', avatar: '⚡', faction: '蜀',
            weapon: 'qiang', growth: 'youlong', recruitLevel: 25,
            str: 9, agi: 13, vit: 7, luk: 8,
            skills: {
                s1: { name: '七探', type: 'skill', cost: 20, cd: 2, desc: '7次40%伤害', effect: { hits: 7, dmg: 0.4 } },
                s2: { name: '盘蛇', type: 'skill', cost: 25, cd: 3, desc: '闪避+50%，闪避后反击', effect: { dodge: 0.5, counter: 1.8 } },
                ult: { name: '银龙逆鳞', type: 'ult', desc: '直线350%伤害，自身增益', effect: { lineDmg: 3.5, selfBuff: { atk: 0.3, dodge: 0.2, turns: 2 } } }
            },
            unlock: { type: 'legend' }
        },
        huangzhong: {
            id: 'huangzhong', name: '黄忠', avatar: '🏹', faction: '蜀',
            weapon: 'gong', growth: 'shenshe', recruitLevel: 25,
            str: 8, agi: 11, vit: 7, luk: 9,
            skills: {
                s1: { name: '连珠', type: 'skill', cost: 20, cd: 2, desc: '4箭，每箭70%伤害', effect: { arrows: 4, dmg: 0.7 } },
                s2: { name: '狙心', type: 'skill', cost: 25, cd: 3, desc: '后排150%伤害，50%禁疗', effect: { backDmg: 1.5, antiHeal: 0.5 } },
                ult: { name: '百步穿杨', type: 'ult', desc: '锁定最低血量，350%必暴', effect: { snipe: true, dmg: 3.5, crit: 1 } }
            },
            unlock: { type: 'legend' }
        },
        machao: {
            id: 'machao', name: '马超', avatar: '🐴', faction: '蜀',
            weapon: 'qiang', growth: 'youlong', recruitLevel: 25,
            str: 10, agi: 12, vit: 6, luk: 7,
            skills: {
                s1: { name: '铁骑', type: 'skill', cost: 20, cd: 3, desc: '冲锋250%伤害', effect: { chargeDmg: 2.5 } },
                s2: { name: '狂狮', type: 'skill', cost: 30, cd: 4, desc: '攻击+40%，暴击+20%', effect: { selfBuff: { atk: 0.4, crit: 0.2, turns: 3 } } },
                ult: { name: '西凉风暴', type: 'ult', desc: '十字300%伤害，自身提速', effect: { aoe: 'cross', dmg: 3.0, selfBuff: { speed: 0.3, turns: 2 } } }
            },
            unlock: { type: 'legend' }
        },
        zhangliao: {
            id: 'zhangliao', name: '张辽', avatar: '⚔️', faction: '魏',
            weapon: 'qiang', growth: 'youlong', recruitLevel: 25,
            str: 10, agi: 11, vit: 7, luk: 7,
            skills: {
                s1: { name: '突袭', type: 'skill', cost: 20, cd: 2, desc: '200%伤害，首回合必中', effect: { dmg: 2.0, firstHit: true } },
                s2: { name: '威震', type: 'skill', cost: 25, cd: 3, desc: '降低敌方全体速度', effect: { debuffSpeed: 0.2 } },
                ult: { name: '逍遥津破', type: 'ult', desc: '穿透400%伤害，恐惧效果', effect: { pierceDmg: 4.0, fear: true } }
            },
            unlock: { type: 'legend' }
        },
        zhouyu: {
            id: 'zhouyu', name: '周瑜', avatar: '🔥', faction: '吴',
            weapon: 'jian', growth: 'qimen', recruitLevel: 25,
            str: 6, agi: 9, vit: 6, luk: 10,
            skills: {
                s1: { name: '火攻', type: 'skill', cost: 30, cd: 3, desc: '范围燃烧3回合', effect: { burn: { dmg: 0.05, turns: 3 } } },
                s2: { name: '反间', type: 'skill', cost: 25, cd: 4, desc: '让敌人攻击队友', effect: { confuse: 1 } },
                ult: { name: '赤壁业火', type: 'ult', desc: '全体300%火伤+燃烧', effect: { allDmg: 3.0, burnAll: { dmg: 0.08, turns: 3 } } }
            },
            unlock: { type: 'legend' }
        },
        taishici: {
            id: 'taishici', name: '太史慈', avatar: '🏹', faction: '吴',
            weapon: 'gong', growth: 'shenshe', recruitLevel: 25,
            str: 9, agi: 11, vit: 7, luk: 8,
            skills: {
                s1: { name: '神射', type: 'skill', cost: 20, cd: 2, desc: '200%精准射击', effect: { dmg: 2.0, hit: 1 } },
                s2: { name: '信义', type: 'skill', cost: 25, cd: 3, desc: '攻击+吸血', effect: { dmg: 1.5, drain: 0.2 } },
                ult: { name: '天义破空', type: 'ult', desc: '穿透3箭，每箭150%', effect: { pierceArrows: 3, dmg: 1.5 } }
            },
            unlock: { type: 'legend' }
        },

        // --- 第五章解锁（30级） ---
        ganning: {
            id: 'ganning', name: '甘宁', avatar: '🔔', faction: '吴',
            weapon: 'gong', growth: 'youlong', recruitLevel: 30,
            str: 9, agi: 12, vit: 6, luk: 8,
            skills: {
                s1: { name: '铃响', type: 'skill', cost: 20, cd: 2, desc: '攻击后提升速度', effect: { dmg: 1.5, selfBuff: { speed: 0.2, turns: 2 } } },
                s2: { name: '劫营', type: 'skill', cost: 25, cd: 3, desc: '偷袭后排200%伤害', effect: { backstab: 2.0 } },
                ult: { name: '百骑劫寨', type: 'ult', desc: '随机6箭，每箭100%', effect: { randomArrows: 6, dmg: 1.0 } }
            },
            unlock: { type: 'story', chapter: 5, stage: 10 }
        },

        // --- 特殊武将 ---
        diaochan: {
            id: 'diaochan', name: '貂蝉', avatar: '🌸', faction: '群雄',
            weapon: 'jian', growth: 'jiyun', recruitLevel: 35,
            str: 5, agi: 10, vit: 5, luk: 13,
            skills: {
                s1: { name: '闭月', type: 'skill', cost: 20, cd: 3, desc: '魅惑1人攻击队友', effect: { charm: 1 } },
                s2: { name: '离间', type: 'skill', cost: 25, cd: 4, desc: '敌方2人互相攻击', effect: { turncoat: 2 } },
                ult: { name: '倾城之舞', type: 'ult', desc: '全体混乱+伤害', effect: { confuseAll: true, dmg: 2.0 } }
            },
            unlock: { type: 'special' }
        },
        lvbu: {
            id: 'lvbu', name: '吕布', avatar: '👹', faction: '群雄',
            weapon: 'qiang', growth: 'mengjiang', recruitLevel: 40,
            str: 15, agi: 9, vit: 9, luk: 5,
            skills: {
                s1: { name: '无双', type: 'skill', cost: 30, cd: 3, desc: '攻击+50%', effect: { selfBuff: { atk: 0.5, turns: 2 } } },
                s2: { name: '乱舞', type: 'skill', cost: 35, cd: 4, desc: '随机攻击4次', effect: { randomHits: 4, dmg: 1.2 } },
                ult: { name: '鬼神降临', type: 'ult', desc: '单体500%伤害，斩杀线30%', effect: { dmg: 5.0, execute: 0.3 } }
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
        boss_zhangjiao: { name: '张角', avatar: '⚡', hp: 600, atk: 40, def: 20, spd: 15, exp: 300, silver: 500, drops: ['renshen', 'miji_canyi'], isBoss: true },
        boss_huaxiong: { name: '华雄', avatar: '🐗', hp: 720, atk: 50, def: 26, spd: 12, exp: 350, silver: 600, drops: ['xuan_tie', 'miji_canyi'], isBoss: true },
        boss_lvbu_first: { name: '吕布', avatar: '👹', hp: 2500, atk: 90, def: 45, spd: 25, exp: 1000, silver: 1500, drops: ['yuntie'], isBoss: true }
    },

    // ===== 关卡配置（网格迷宫） =====
    chapters: [
        {
            id: 1, name: '黄巾之乱', location: '巨鹿',
            width: 5, height: 5,
            startPos: { x: 0, y: 2 },
            exitPos: { x: 4, y: 2 },
            desc: '天下大乱，黄巾军四起，你从家乡出发，初涉乱世。',
            cells: {
                '0,2': { type: 'start', icon: '🏠', desc: '起点：你的故乡' },
                '1,2': { type: 'empty', icon: '⬜', desc: '一片荒野，风沙漫天。' },
                '1,1': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 2, desc: '前方有黄巾兵拦路！' },
                '1,3': { type: 'npc', icon: '👤', npc: 'cunmin_a', npcName: '村民阿福', desc: '一位村民神色慌张，似乎有话要说。', dialog: '壮士！黄巾贼在附近烧杀抢掠，求你出手相助！杀了20个黄巾兵再来找我。' },
                '2,2': { type: 'battle', icon: '⚔️', enemy: 'huangjin_zu', count: 2, desc: '一群黄巾卒挡住了去路。' },
                '2,1': { type: 'chest', icon: '📦', desc: '发现了一个被遗弃的箱子。', reward: { items: ['tiekuang:3', 'caoyao:2'], silver: 50 } },
                '2,3': { type: 'battle', icon: '💀', enemy: 'huangjin_xiaoshuai', count: 1, desc: '黄巾小帅率领手下在此设伏！' },
                '2,0': { type: 'empty', icon: '⬜', desc: '荒凉的村庄，空无一人。' },
                '3,2': { type: 'battle', icon: '⚔️', enemy: 'huangjin_bing', count: 3, desc: '黄巾兵的巡逻队！' },
                '3,1': { type: 'npc', icon: '👤', npc: 'tiejiang', npcName: '老铁匠', desc: '一位老铁匠在废墟中整理工具。', dialog: '小伙子，想打造兵器吗？收集材料来找我。' },
                '3,3': { type: 'npc', icon: '👤', npc: 'cunmin_b', npcName: '村民阿贵', desc: '一位村民正在采药，却遇到了麻烦。', dialog: '壮士，我最近急需草药治病，你能帮我收集15株草药吗？' },
                '3,0': { type: 'hidden', icon: '❓', desc: '空气中弥漫着一股神秘的气息...', condition: { fuqi: 8 }, reward: { items: ['chixiao_frag:1'] } },
                '4,2': { type: 'boss', icon: '👹', enemy: 'boss_zhangjiao', desc: '巨鹿城外，张角正在施法召唤雷霆！', reward: { exp: 500, silver: 1000, unlock: 'guanyu' } }
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
        miji_quan: { name: '拳法精要', icon: '📕', type: 'item', desc: '研读后可领悟拳法基础技能「崩山捶」', skillId: 'quan_bengshan' },
        miji_jian: { name: '剑法精要', icon: '📕', type: 'item', desc: '研读后可领悟剑法基础技能「白刃斩」', skillId: 'jian_bairen' },
        miji_dao: { name: '刀法精要', icon: '📕', type: 'item', desc: '研读后可领悟刀法基础技能「旋风裂」', skillId: 'dao_xuanfeng' },
        miji_qiang: { name: '枪法精要', icon: '📕', type: 'item', desc: '研读后可领悟枪法基础技能「穿云破」', skillId: 'qiang_chuanyun' },
        miji_gong: { name: '弓法精要', icon: '📕', type: 'item', desc: '研读后可领悟弓法基础技能「追魂刺」', skillId: 'gong_zhuihun' }
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
    'WUSHEN2025': { rewards: { items: ['miji_quan:1', 'miji_jian:1'] }, desc: '拳法精要×1、剑法精要×1' }
};

// ===== 工具函数 =====

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
