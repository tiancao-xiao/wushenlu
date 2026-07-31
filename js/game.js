// ===== 游戏核心 =====
// 【设计快照 2026-07-30】
// 主角开局5级，每次升级+2属性点
// 羁绊系统：0-5级，2级解锁奥义，4级主角可学技能
// 主角配置：武器栏+技能栏(2个)+奥义栏(1个)

var Game = {
    state: null,
    currentScreen: 'splash',

    // ===== 初始化 =====
    init: function() {
        var saved = null;
        try {
            saved = localStorage.getItem('wushen_save');
        } catch(e) {
            console.warn('localStorage不可用');
        }
        if (saved) {
            try {
                this.state = JSON.parse(saved);
                // 兼容旧存档：补充 teamPositions
                if (!this.state.teamPositions) {
                    this.state.teamPositions = {};
                    for (var i = 0; i < this.state.team.length; i++) {
                        var t = this.state.team[i];
                        var defaults = { hero: {x:1,y:2}, guanping: {x:0,y:2} };
                        this.state.teamPositions[t.id] = defaults[t.id] || { x: i % 3, y: 2 };
                    }
                }
                // 兼容旧存档：补充 unlockedChapters
                if (!this.state.unlockedChapters) {
                    this.state.unlockedChapters = [];
                    for (var c = 1; c <= this.state.chapter; c++) {
                        this.state.unlockedChapters.push(c);
                    }
                }
                // 兼容旧存档：补充 currentChapter
                if (!this.state.currentChapter) {
                    this.state.currentChapter = this.state.chapter;
                }
            } catch(e) {
                this.state = null;
            }
        }
        var continueBtn = document.querySelector('#splash-screen .btn-secondary');
        if (continueBtn) {
            continueBtn.style.display = this.state ? 'block' : 'none';
        }
        console.log('乱世武神录 已初始化');
    },

    // ===== 屏幕切换 =====
    toScreen: function(screenId, options) {
        var screens = document.querySelectorAll('.screen');
        for (var i = 0; i < screens.length; i++) {
            screens[i].classList.remove('active');
        }
        var target = document.getElementById(screenId + '-screen');
        if (target) target.classList.add('active');
        this.currentScreen = screenId;

        if (screenId === 'main') this.updateMainUI();
        if (screenId === 'map') { Map.showChapterSelect(); Map.init(); }
        if (screenId === 'heroes') UI.renderHeroes();
        if (screenId === 'bag') UI.renderBag();
        if (screenId === 'smith') UI.renderSmith();
        if (screenId === 'tasks') UI.renderTasks();
        if (screenId === 'config') UI.renderConfig();
    },
    // ===== 角色创建 =====
    // 开局5级，20点自由分配
    createAttrs: { bili: 5, shenfa: 5, gengu: 5, fuqi: 5 },
    createWeapon: 'quan',
    pointsLeft: 20,

    adjustAttr: function(attr, delta) {
        var current = this.createAttrs[attr];
        var newVal = current + delta;
        if (newVal < 5 || newVal > 25) return; // 最低5，最高25
        if (delta > 0 && this.pointsLeft <= 0) return;
        if (delta < 0 && this.pointsLeft >= 20) return;
        this.createAttrs[attr] = newVal;
        this.pointsLeft -= delta;
        var attrEl = document.getElementById('attr-' + attr);
        var ptsEl = document.getElementById('points-left');
        if (attrEl) attrEl.textContent = newVal;
        if (ptsEl) ptsEl.textContent = this.pointsLeft;
    },

    selectWeapon: function(type) {
        this.createWeapon = type;
        var options = document.querySelectorAll('.weapon-option');
        for (var i = 0; i < options.length; i++) {
            options[i].classList.remove('selected');
        }
        var selected = document.querySelector('.weapon-option[data-weapon="' + type + '"]');
        if (selected) selected.classList.add('selected');
    },

    confirmCreate: function() {
        var nameInput = document.getElementById('hero-name');
        var name = nameInput ? nameInput.value.trim() : '无名';
        if (!name) name = '无名';

        var weaponType = this.createWeapon;
        // 获取该类兵器的初始技能
        var initialSkill = null;
        var heroSkillList = GAME_DATA.heroSkills[weaponType];
        if (heroSkillList && heroSkillList.length > 0) {
            initialSkill = copyObj(heroSkillList[0]);
        }

        var hero = {
            id: 'hero',
            name: name,
            isHero: true,
            avatar: '🎭',
            level: 5,
            exp: 0,
            str: this.createAttrs.bili,
            agi: this.createAttrs.shenfa,
            vit: this.createAttrs.gengu,
            luk: this.createAttrs.fuqi,
            equip: {
                weapon: copyObj(GAME_DATA.baseWeapons[weaponType + '_tie'])
            },
            inventory: {
                tiekuang: 5,
                muchai: 5,
                caoyao: 10,
                jinchuang: 3
            },
            // 已学会的技能/奥义
            knownSkills: initialSkill ? [initialSkill] : [],
            knownUlts: [],
            // 出战配置
            equippedSkills: [initialSkill ? initialSkill.id : null, null],
            equippedUlt: null,
            // 自由属性点（升级后未分配的）
            freePoints: 0,
            formation: 'yulin'
        };

        // 初始武将：关平（招募等级5）
        var gpTemplate = GAME_DATA.heroes['guanping'];
        var guanping = createUnit(gpTemplate, gpTemplate.recruitLevel);
        guanping.equip = { weapon: copyObj(GAME_DATA.baseWeapons['jian_tie']) };

        var team = [hero, guanping];

        this.state = {
            hero: hero,
            team: team,
            unlockedHeroes: ['guanping'],
            chapter: 1,
            currentChapter: 1,
            unlockedChapters: [1],
            stage: 0,
            currentPos: { x: GAME_DATA.chapters[0].startPos.x, y: GAME_DATA.chapters[0].startPos.y },
            visitedCells: [],
            defeatedCells: [],
            silver: 200,
            actionPoints: 100,
            maxActionPoints: 100,
            quests: [],
            formations: ['yulin', 'fengshi', 'bagua'],
            currentFormation: 'yulin',
            defeatedBosses: [],
            playTime: 0,
            teamPositions: {
                hero: { x: 1, y: 2 },
                guanping: { x: 0, y: 2 }
            }
        };

        this.saveGame();
        this.toScreen('main');
        UI.showModal('踏入乱世', '欢迎，<b>' + name + '</b>！<br><br>你已是Lv.5的武将，黄巾之乱已起，带上你的兵器，去闯出一番天地吧！<br><br><i>提示：点击"闯关"开始探索。</i>');
    },

    // ===== 加载/保存 =====
    loadGame: function() {
        if (!this.state) {
            UI.showModal('提示', '没有找到存档，请开始新游戏。');
            return;
        }
        this.toScreen('main');
    },

    saveGame: function() {
        if (!this.state) return;
        try {
            localStorage.setItem('wushen_save', JSON.stringify(this.state));
        } catch(e) {
            console.warn('存档失败', e);
        }
    },

    // ===== 主界面UI =====
    updateMainUI: function() {
        if (!this.state) return;
        var hero = this.state.hero;
        var stats = calcStats(hero);

        var nameEl = document.getElementById('main-hero-name');
        var lvlEl = document.getElementById('main-hero-level');
        var hpBar = document.getElementById('main-hp-bar');
        var hpText = document.getElementById('main-hp-text');
        var mpBar = document.getElementById('main-mp-bar');
        var mpText = document.getElementById('main-mp-text');
        var actEl = document.getElementById('main-action');
        var silverEl = document.getElementById('main-silver');

        if (nameEl) nameEl.textContent = hero.name;
        if (lvlEl) lvlEl.textContent = hero.level;
        if (hpBar) hpBar.style.width = (stats.hp / stats.maxHp * 100) + '%';
        if (hpText) hpText.textContent = Math.floor(stats.hp) + '/' + stats.maxHp;
        if (mpBar) mpBar.style.width = (stats.mp / stats.maxMp * 100) + '%';
        if (mpText) mpText.textContent = Math.floor(stats.mp) + '/' + stats.maxMp;
        if (actEl) actEl.textContent = this.state.actionPoints;
        if (silverEl) silverEl.textContent = this.state.silver;
    },

    // ===== 经验与升级 =====
    // 主角：升级+2自由属性点，武将：自动按成长类型增加
    gainExp: function(target, amount) {
        target.exp = (target.exp || 0) + amount;
        while (target.level < 99) {
            var need = GAME_DATA.expTable[target.level];
            if (target.exp >= need) {
                target.exp -= need;
                this.levelUp(target);
            } else {
                break;
            }
        }
    },

    levelUp: function(unit) {
        unit.level++;

        if (unit.isHero) {
            // 主角：+2自由属性点
            unit.freePoints = (unit.freePoints || 0) + 2;
            UI.showModal('升级！', '<b>' + unit.name + '</b> 升到了 <b>Lv.' + unit.level + '</b>！<br><br>获得 <b>2点</b> 自由属性点，请在主角配置中分配。');
            // 检查是否解锁新技能
            this.checkSkillUnlock(unit);
        } else {
            // 武将：自动成长
            var growth = GAME_DATA.growthTypes[unit.growth];
            if (growth) {
                unit.str = Math.round((unit.str + growth.str) * 10) / 10;
                unit.agi = Math.round((unit.agi + growth.agi) * 10) / 10;
                unit.vit = Math.round((unit.vit + growth.vit) * 10) / 10;
                unit.luk = Math.round((unit.luk + growth.luk) * 10) / 10;
            }
            // 每5级额外加主属性
            if (unit.level % 5 === 0 && growth) {
                var entries = [];
                for (var k in growth) {
                    if (k !== 'label') entries.push([k, growth[k]]);
                }
                entries.sort(function(a, b) { return b[1] - a[1]; });
                var mainAttr = entries[0][0];
                if (mainAttr === 'str') unit.str += 1;
                else if (mainAttr === 'agi') unit.agi += 1;
                else if (mainAttr === 'vit') unit.vit += 1;
                else if (mainAttr === 'luk') unit.luk += 1;
            }
        }

        var stats = calcStats(unit);
        unit.hp = stats.maxHp;
        unit.mp = stats.maxMp;
    },

    // 检查主角技能解锁
    checkSkillUnlock: function(hero) {
        var weaponType = 'quan';
        if (hero.equip && hero.equip.weapon && hero.equip.weapon.type) {
            weaponType = hero.equip.weapon.type;
        }
        var skillList = GAME_DATA.heroSkills[weaponType];
        if (!skillList) return;

        for (var i = 0; i < skillList.length; i++) {
            var sk = skillList[i];
            if (hero.level >= sk.levelNeed) {
                // 检查是否已学会
                var hasIt = false;
                for (var j = 0; j < hero.knownSkills.length; j++) {
                    if (hero.knownSkills[j].id === sk.id) {
                        hasIt = true;
                        break;
                    }
                }
                if (!hasIt) {
                    var newSkill = copyObj(sk);
                    hero.knownSkills.push(newSkill);
                    UI.showModal('领悟新技能！', '你领悟了 <b>' + newSkill.name + '</b>！<br><br>' + newSkill.desc);
                }
            }
        }
    },

    // ===== 主角属性分配 =====
    // 在主角配置界面使用
    assignAttr: function(attr, delta) {
        var hero = this.state.hero;
        if (!hero.freePoints || hero.freePoints <= 0) return;
        if (delta > hero.freePoints) return;

        hero[attr] += delta;
        hero.freePoints -= delta;
        Game.saveGame();
        UI.renderConfigDetail(Game.state.hero.id);
    },

    // ===== 主角装备更换 =====
    equipWeapon: function(weaponId) {
        var hero = this.state.hero;
        var weapon = null;
        // 在背包中找
        if (hero.inventory[weaponId]) {
            // 基础武器
            if (GAME_DATA.baseWeapons[weaponId]) {
                weapon = copyObj(GAME_DATA.baseWeapons[weaponId]);
            }
            // 锻造武器
            for (var i = 0; i < GAME_DATA.forgeList.length; i++) {
                if (GAME_DATA.forgeList[i].id === weaponId) {
                    weapon = copyObj(GAME_DATA.forgeList[i]);
                    break;
                }
            }
        }
        if (!weapon) {
            UI.showModal('错误', '该武器不在背包中！');
            return;
        }

        // 更换武器
        hero.equip.weapon = weapon;

        // 清空已装备的技能/奥义（因为兵器类型变了）
        hero.equippedSkills = [null, null];
        hero.equippedUlt = null;

        // 重新计算可学技能
        var wType = weapon.type;
        var skillList = GAME_DATA.heroSkills[wType];
        hero.knownSkills = [];
        for (var i = 0; i < skillList.length; i++) {
            if (hero.level >= skillList[i].levelNeed) {
                hero.knownSkills.push(copyObj(skillList[i]));
            }
        }

        Game.saveGame();
        UI.renderConfigDetail('hero');
        UI.showModal('装备更换', '你已装备 <b>' + weapon.name + '</b>！<br><br>技能已根据兵器类型重新配置。');
    },

    // 为任意队伍成员装备武器
    equipWeaponFor: function(unitId, weaponId) {
        var unit = null;
        for (var i = 0; i < this.state.team.length; i++) {
            if (this.state.team[i].id === unitId) {
                unit = this.state.team[i];
                break;
            }
        }
        if (!unit) {
            UI.showModal('错误', '角色不存在！');
            return;
        }
        var weapon = null;
        var inv = this.state.hero.inventory;
        if (inv[weaponId]) {
            if (GAME_DATA.baseWeapons[weaponId]) {
                weapon = copyObj(GAME_DATA.baseWeapons[weaponId]);
            }
            for (var j = 0; j < GAME_DATA.forgeList.length; j++) {
                if (GAME_DATA.forgeList[j].id === weaponId) {
                    weapon = copyObj(GAME_DATA.forgeList[j]);
                    break;
                }
            }
        }
        if (!weapon) {
            UI.showModal('错误', '该武器不在背包中！');
            return;
        }
        if (!unit.isHero && unit.weapon && unit.weapon !== weapon.type) {
            var wtName = GAME_DATA.weaponTypes[unit.weapon] ? GAME_DATA.weaponTypes[unit.weapon].name : unit.weapon;
            UI.showModal('错误', unit.name + ' 只能使用 ' + wtName + ' 类兵器！');
            return;
        }
        unit.equip = unit.equip || {};
        unit.equip.weapon = weapon;
        if (unit.isHero) {
            unit.equippedSkills = [null, null];
            unit.equippedUlt = null;
            var wType = weapon.type;
            var skillList = GAME_DATA.heroSkills[wType];
            unit.knownSkills = [];
            for (var k = 0; k < skillList.length; k++) {
                if (unit.level >= skillList[k].levelNeed) {
                    unit.knownSkills.push(copyObj(skillList[k]));
                }
            }
        }
        Game.saveGame();
        UI.renderConfigDetail(unit.id);
        UI.showModal('装备更换', unit.name + ' 已装备 <b>' + weapon.name + '</b>！');
    },

    // ===== 主角技能配置 =====
    equipSkill: function(slotIndex, skillId) {
        var hero = this.state.hero;
        // 验证该技能是否已学会
        var skill = null;
        for (var i = 0; i < hero.knownSkills.length; i++) {
            if (hero.knownSkills[i].id === skillId) {
                skill = hero.knownSkills[i];
                break;
            }
        }
        if (!skill) return;

        // 检查是否已装备在另一槽位
        for (var j = 0; j < hero.equippedSkills.length; j++) {
            if (j !== slotIndex && hero.equippedSkills[j] === skillId) {
                hero.equippedSkills[j] = null;
            }
        }

        hero.equippedSkills[slotIndex] = skillId;
        Game.saveGame();
        UI.renderConfigDetail('hero');
    },

    equipUlt: function(ultId) {
        var hero = this.state.hero;
        // 验证该奥义是否已学会
        var hasUlt = false;
        for (var i = 0; i < hero.knownUlts.length; i++) {
            if (hero.knownUlts[i].id === ultId) {
                hasUlt = true;
                break;
            }
        }
        if (!hasUlt) return;
        hero.equippedUlt = ultId;
        Game.saveGame();
        UI.renderConfigDetail('hero');
    },

    // ===== 羁绊系统 =====
    // 给指定武将增加羁绊经验
    addBondExp: function(heroId, amount) {
        var unit = null;
        for (var i = 0; i < this.state.team.length; i++) {
            if (this.state.team[i].id === heroId) {
                unit = this.state.team[i];
                break;
            }
        }
        if (!unit) return;
        if (unit.bondLevel >= 5) return; // 已满级

        unit.bondExp = (unit.bondExp || 0) + amount;
        var config = GAME_DATA.bondConfig;
        var nextNeed = config.expNeed[unit.bondLevel + 1];

        while (unit.bondLevel < 5 && unit.bondExp >= nextNeed) {
            unit.bondExp -= nextNeed;
            unit.bondLevel++;
            var reward = config.rewards[unit.bondLevel];

            var msg = '<b>' + unit.name + '</b> 羁绊升至 <b>Lv.' + unit.bondLevel + '</b>！';
            if (reward.unlockUlt) {
                msg += '<br><br>🌟 <b>解锁奥义：' + unit.skills.ult.name + '</b>';
            }
            if (reward.learnSkill) {
                msg += '<br><br>📖 主角可学习该武将的一个技能了！';
            }
            if (reward.statBonus) {
                msg += '<br><br>💪 该武将全属性+10%！';
                // 重新计算属性
                var stats = calcStats(unit);
                unit.hp = stats.maxHp;
                unit.mp = stats.maxMp;
            }
            UI.showModal('羁绊升级！', msg);

            if (unit.bondLevel < 5) {
                nextNeed = config.expNeed[unit.bondLevel + 1];
            }
        }
        Game.saveGame();
    },

    // 主角学习武将技能（需羁绊4级）
    learnHeroSkill: function(heroId) {
        var unit = null;
        for (var i = 0; i < this.state.team.length; i++) {
            if (this.state.team[i].id === heroId) {
                unit = this.state.team[i];
                break;
            }
        }
        if (!unit) return;
        if (unit.bondLevel < 4) {
            UI.showModal('提示', '需要羁绊达到4级才能学习该武将的技能！');
            return;
        }

        // 检查是否已学会
        var hero = this.state.hero;
        var ultId = unit.skills.ult.id || (unit.id + '_ult');
        var hasUlt = false;
        for (var j = 0; j < hero.knownUlts.length; j++) {
            if (hero.knownUlts[j].id === ultId) {
                hasUlt = true;
                break;
            }
        }

        if (hasUlt) {
            UI.showModal('提示', '你已经学会了 ' + unit.name + ' 的奥义！');
            return;
        }

        // 学习奥义
        var ultSkill = copyObj(unit.skills.ult);
        ultSkill.id = ultId;
        hero.knownUlts.push(ultSkill);
        Game.saveGame();
        UI.showModal('习得奥义！', '你从 <b>' + unit.name + '</b> 那里学会了奥义 <b>' + ultSkill.name + '</b>！');
    },

    // ===== 任务系统 =====
    // 追踪击杀任务（支持批量计数）
    trackKill: function(enemyId, count) {
        count = count || 1;
        if (!this.state || !this.state.quests) return;
        for (var i = 0; i < this.state.quests.length; i++) {
            var q = this.state.quests[i];
            if (q.completed) continue;
            if (q.target && q.target.kill === enemyId) {
                q.progress = (q.progress || 0) + count;
            }
        }
        Game.saveGame();
    },

    // 检查任务是否可以提交
    canCompleteQuest: function(quest) {
        if (!quest || quest.completed) return false;
        if (quest.target) {
            if (quest.target.kill) {
                return (quest.progress || 0) >= quest.target.count;
            } else if (quest.target.item) {
                var have = this.state.hero.inventory[quest.target.item] || 0;
                return have >= quest.target.count;
            } else if (quest.target.forge) {
                return (quest.forgeCount || 0) >= quest.target.forge;
            }
        }
        return false;
    },

    // 提交任务
    submitQuest: function(questId) {
        var quest = null;
        for (var i = 0; i < this.state.quests.length; i++) {
            if (this.state.quests[i].id === questId) {
                quest = this.state.quests[i];
                break;
            }
        }
        if (!quest) {
            UI.showModal('错误', '任务不存在！');
            return;
        }
        if (quest.completed) {
            UI.showModal('提示', '该任务已完成！');
            return;
        }
        if (!this.canCompleteQuest(quest)) {
            UI.showModal('提示', '任务条件尚未满足！');
            return;
        }

        // 扣除材料（如果有）
        if (quest.target && quest.target.item) {
            if (!this.consumeItem(quest.target.item, quest.target.count)) {
                UI.showModal('提示', '材料不足！');
                return;
            }
        }

        // 发放奖励
        quest.completed = true;
        var r = quest.reward;
        var msg = '任务「' + quest.name + '」完成！<br><br>';
        if (r.exp) {
            for (var j = 0; j < this.state.team.length; j++) {
                this.gainExp(this.state.team[j], r.exp);
            }
            msg += '⭐ 经验 +' + r.exp + '<br>';
        }
        if (r.silver) {
            this.addSilver(r.silver);
            msg += '💰 银两 +' + r.silver + '<br>';
        }
        if (r.items) {
            for (var k = 0; k < r.items.length; k++) {
                var parts = r.items[k].split(':');
                var itemId = parts[0];
                var count = parseInt(parts[1], 10) || 1;
                this.addItem(itemId, count);
                var mat = GAME_DATA.materials[itemId];
                msg += '📦 ' + (mat ? mat.name : itemId) + ' ×' + count + '<br>';
            }
        }

        Game.saveGame();
        UI.showModal('任务完成', msg);
    },

    // 接取任务（从NPC处接取）
    acceptQuest: function(questId) {
        if (!this.state) return;
        // 检查是否已接取
        for (var i = 0; i < this.state.quests.length; i++) {
            if (this.state.quests[i].id === questId) {
                UI.showModal('提示', '你已经接取了该任务！');
                return;
            }
        }
        // 从任务模板中找到该任务
        var template = null;
        for (var j = 0; j < GAME_DATA.quests.length; j++) {
            if (GAME_DATA.quests[j].id === questId) {
                template = GAME_DATA.quests[j];
                break;
            }
        }
        if (!template) {
            UI.showModal('错误', '任务不存在！');
            return;
        }
        var quest = copyObj(template);
        quest.progress = 0;
        quest.completed = false;
        this.state.quests.push(quest);
        Game.saveGame();
        UI.showModal('接取任务', '你接取了任务「' + quest.name + '」！<br><br>' + quest.desc);
    },

    // ===== 物品系统 =====
    addItem: function(itemId, count) {
        count = count || 1;
        if (!this.state) return;
        var inv = this.state.hero.inventory;
        inv[itemId] = (inv[itemId] || 0) + count;
    },

    consumeItem: function(itemId, count) {
        count = count || 1;
        if (!this.state) return false;
        var inv = this.state.hero.inventory;
        if (!inv[itemId] || inv[itemId] < count) return false;
        inv[itemId] -= count;
        if (inv[itemId] <= 0) delete inv[itemId];
        return true;
    },

    addSilver: function(amount) {
        if (!this.state) return;
        this.state.silver += amount;
    },

    // ===== 重置游戏 =====
    resetGame: function() {
        if (confirm('确定要删除所有存档并重新开始吗？此操作不可恢复！')) {
            try {
                localStorage.removeItem('wushen_save');
            } catch(e) {}
            this.state = null;
            location.reload();
        }
    },

    // ===== 设置 =====
    musicOn: true,
    soundOn: true,
    toggleMusic: function() {
        this.musicOn = !this.musicOn;
        var btn = document.getElementById('music-toggle');
        if (btn) {
            btn.textContent = this.musicOn ? '开' : '关';
            btn.classList.toggle('active', this.musicOn);
        }
    },
    toggleSound: function() {
        this.soundOn = !this.soundOn;
        var btn = document.getElementById('sound-toggle');
        if (btn) {
            btn.textContent = this.soundOn ? '开' : '关';
            btn.classList.toggle('active', this.soundOn);
        }
    }
};

// 深度拷贝辅助
function copyObj(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// 页面加载完成后初始化
function _initGame() {
    Game.init();
}
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initGame);
} else {
    _initGame();
}
