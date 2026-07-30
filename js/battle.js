// ===== 战斗系统（3×3 九宫格站位） =====
// 【设计快照 2026-07-30】
// 修复：useSkill/useUlt 提前return未调用nextTurn导致卡死
// 优化：目标选择逻辑——优先前排→同列→最近列→先左后右
// 新增：伤害飘字效果

var Battle = {
    state: null,
    speed: 1,
    auto: false,
    timer: null,

    // 初始化战斗
    start: function(enemyTemplate, count, options) {
        count = count || 1;
        options = options || {};
        var team = Game.state.team;

        // --- 我方单位 ---
        var playerUnits = [];
        for (var i = 0; i < team.length; i++) {
            var u = team[i];
            var stats = calcStats(u);
            var unit = {};
            for (var key in u) {
                if (u.hasOwnProperty(key)) unit[key] = u[key];
            }
            unit._index = i;
            unit._side = 'player';
            unit._maxHp = stats.maxHp;
            unit._maxMp = stats.maxMp;
            unit._hp = stats.hp;
            unit._mp = stats.mp;
            unit._atk = stats.atk;
            unit._def = stats.def;
            unit._spd = stats.spd;
            unit._crit = stats.crit;
            unit._dodge = stats.dodge;
            unit._ult = 0;
            unit._skillCd = [0, 0];
            unit._defending = false;
            unit._dead = false;
            unit._buffs = [];
            unit._debuffs = [];
            unit._battleSkills = this.getBattleSkills(u);
            unit._canUseUlt = this.canUseUlt(u);
            unit._pos = this.getPlayerPos(u.id, i, team.length);
            playerUnits.push(unit);
        }

        // 应用阵型效果
        this.applyFormation(playerUnits);

        // --- 敌方单位 ---
        var enemyUnits = [];
        for (var j = 0; j < count; j++) {
            var e = GAME_DATA.enemies[enemyTemplate];
            if (!e) continue;
            var scale = options.scale || 1;
            var ehp = Math.floor(e.hp * scale * (1 + Game.state.chapter * 0.1));
            var eatk = Math.floor(e.atk * scale * (1 + Game.state.chapter * 0.05));
            var eu = {};
            for (var ek in e) {
                if (e.hasOwnProperty(ek)) eu[ek] = e[ek];
            }
            eu._index = j;
            eu._side = 'enemy';
            eu._maxHp = ehp;
            eu._hp = ehp;
            eu._atk = eatk;
            eu._def = e.def;
            eu._spd = e.spd;
            eu._crit = 5;
            eu._dodge = 3;
            eu._ult = 0;
            eu._dead = false;
            eu._buffs = [];
            eu._debuffs = [];
            eu._battleSkills = [
                { name: '猛击', cost: 20, cd: 3, dmg: 1.5 },
                { name: '重击', cost: 30, cd: 4, dmg: 2.2 }
            ];
            eu._canUseUlt = true;
            eu.id = enemyTemplate;
            eu._pos = this.getEnemyPos(j, count);
            eu._pos = this.getEnemyPos(j, count);
            enemyUnits.push(eu);
        }

        var allUnits = [];
        for (var k = 0; k < playerUnits.length; k++) allUnits.push(playerUnits[k]);
        for (var k = 0; k < enemyUnits.length; k++) allUnits.push(enemyUnits[k]);

        this.state = {
            round: 1,
            turn: 0,
            playerUnits: playerUnits,
            enemyUnits: enemyUnits,
            allUnits: allUnits,
            actionQueue: [],
            currentUnit: null,
            playerTurn: false,
            result: null,
            log: [],
            options: options,
            floatingTexts: []
        };

        this.calcActionOrder();
        Game.toScreen('battle');
        this.render();
        this.nextTurn();
    },

    getPlayerPos: function(unitId, index, teamLen) {
        var positions = Game.state.teamPositions || {};
        if (positions[unitId]) {
            return { x: positions[unitId].x, y: positions[unitId].y };
        }
        var defaults = [
            { x: 1, y: 2 }, { x: 0, y: 2 }, { x: 2, y: 2 }, { x: 1, y: 1 }
        ];
        return defaults[index] || { x: 1, y: 1 };
    },

    getEnemyPos: function(index, total) {
        var slots = [
            { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
            { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
            { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
        ];
        return slots[index] || { x: 1, y: 1 };
    },

    applyFormation: function(playerUnits) {
        var fid = Game.state.currentFormation || 'yulin';
        var f = GAME_DATA.formations[fid];
        if (!f) return;
        var eff = f.effect;

        for (var i = 0; i < playerUnits.length; i++) {
            var u = playerUnits[i];
            var px = u._pos.x;
            var py = u._pos.y;

            if (eff.frontDef && py === 0) {
                u._def = Math.floor(u._def * (1 + eff.frontDef));
            }
            if (eff.firstDmg && px === 1) {
                u._atk = Math.floor(u._atk * (1 + eff.firstDmg));
            }
            if (eff.allDodge) {
                u._dodge = Math.floor(u._dodge + eff.allDodge * 100);
            }
            if (eff.sideDrain && (px === 0 || px === 2)) {
                u._atk = Math.floor(u._atk * 1.1);
            }
            if (eff.backRange && py === 2) {
                u._atk = Math.floor(u._atk * 1.15);
            }
            if (eff.speed) {
                u._spd = Math.floor(u._spd * (1 + eff.speed));
            }
        }
    },

    getBattleSkills: function(unit) {
        var skills = [];
        if (unit.isHero) {
            for (var i = 0; i < unit.equippedSkills.length; i++) {
                var sid = unit.equippedSkills[i];
                if (!sid) continue;
                for (var j = 0; j < unit.knownSkills.length; j++) {
                    if (unit.knownSkills[j].id === sid) {
                        skills.push(unit.knownSkills[j]);
                        break;
                    }
                }
            }
        } else {
            if (unit.skills && unit.skills.s1) skills.push(unit.skills.s1);
            if (unit.skills && unit.skills.s2) skills.push(unit.skills.s2);
        }
        return skills;
    },

    canUseUlt: function(unit) {
        if (unit.isHero) {
            return !!unit.equippedUlt;
        } else {
            return (unit.bondLevel || 0) >= 2;
        }
    },

    getUlt: function(unit) {
        if (unit.isHero) {
            if (!unit.equippedUlt) return null;
            for (var i = 0; i < unit.knownUlts.length; i++) {
                if (unit.knownUlts[i].id === unit.equippedUlt) {
                    return unit.knownUlts[i];
                }
            }
            return null;
        } else {
            if (!unit.skills || !unit.skills.ult) return null;
            return unit.skills.ult;
        }
    },

    calcActionOrder: function() {
        var s = this.state;
        var alive = [];
        for (var i = 0; i < s.allUnits.length; i++) {
            if (!s.allUnits[i]._dead) alive.push(s.allUnits[i]);
        }
        alive.sort(function(a, b) { return b._spd - a._spd; });
        s.actionQueue = alive;
    },

    nextTurn: function() {
        var s = this.state;
        if (this.checkBattleEnd()) return;

        if (s.actionQueue.length === 0) {
            s.round++;
            this.processDots();
            for (var i = 0; i < s.allUnits.length; i++) {
                var u = s.allUnits[i];
                if (u._skillCd) {
                    u._skillCd[0] = Math.max(0, u._skillCd[0] - 1);
                    u._skillCd[1] = Math.max(0, u._skillCd[1] - 1);
                }
                u._defending = false;
                if (Game.state.currentFormation === 'changs' && u._side === 'player') {
                    u._mp = Math.min(u._maxMp, u._mp + 10);
                }
            }
            this.calcActionOrder();
        }

        var unit = s.actionQueue.shift();
        if (!unit || unit._dead) {
            this.nextTurn();
            return;
        }

        s.currentUnit = unit;
        s.playerTurn = unit._side === 'player';
        this.render();

        if (s.playerTurn) {
            if (this.auto) {
                var self = this;
                setTimeout(function() { self.autoAction(); }, 500 / self.speed);
            }
        } else {
            var self = this;
            setTimeout(function() { self.enemyAI(); }, 600 / self.speed);
        }
    },

    processDots: function() {
        var s = this.state;
        for (var i = 0; i < s.allUnits.length; i++) {
            var u = s.allUnits[i];
            if (u._dead) continue;
            var bleed = null;
            for (var j = 0; j < u._debuffs.length; j++) {
                if (u._debuffs[j].type === 'bleed') {
                    bleed = u._debuffs[j];
                    break;
                }
            }
            if (bleed) {
                var dmg = Math.floor(u._maxHp * bleed.value);
                u._hp = Math.max(1, u._hp - dmg);
                this.addFloatingText(u, dmg, 'damage');
                this.addLog(u.name + ' 受到 <span class="log-damage">' + dmg + '</span> 流血伤害', 'damage');
                bleed.turns--;
                if (bleed.turns <= 0) {
                    var newDebuffs = [];
                    for (var j = 0; j < u._debuffs.length; j++) {
                        if (u._debuffs[j] !== bleed) newDebuffs.push(u._debuffs[j]);
                    }
                    u._debuffs = newDebuffs;
                }
            }
            if (u._hp <= 0) {
                u._dead = true;
                u._hp = 0;
                this.addLog(u.name + ' 倒下了！', 'damage');
            }
        }
    },

    // ===== 智能目标选择 =====
    // 1. 优先攻击第一排（敌方y=0，我方y=2）
    // 2. 同排优先同列
    // 3. 然后离自己列最近的一列
    // 4. 距离相同先左后右（x小的优先）
    pickTargetSmart: function(attacker) {
        var s = this.state;
        var targets = attacker._side === 'player' ? s.enemyUnits : s.playerUnits;
        var alive = [];
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i]._dead) alive.push(targets[i]);
        }
        if (alive.length === 0) return null;

        // 玩家打敌方：优先 y 最大（敌方最下排 y=2）
        // 敌方打玩家：优先 y 最小（我方最上排 y=0）
        var preferLargeY = attacker._side === 'player';

        // 1. 按 y 优先排序
        alive.sort(function(a, b) {
            return preferLargeY ? (b._pos.y - a._pos.y) : (a._pos.y - b._pos.y);
        });

        // 2. 找出最优先的 y
        var bestY = alive[0]._pos.y;
        var sameY = [];
        for (var i = 0; i < alive.length; i++) {
            if (alive[i]._pos.y === bestY) sameY.push(alive[i]);
        }

        // 3. 同一 y 中，按与攻击者 x 的距离排序，距离相同 x 小的优先（先左后右）
        var ax = attacker._pos ? attacker._pos.x : 1;
        sameY.sort(function(a, b) {
            var da = Math.abs(a._pos.x - ax);
            var db = Math.abs(b._pos.x - ax);
            if (da !== db) return da - db;
            return a._pos.x - b._pos.x;
        });

        return sameY[0];
    },

    playerAction: function(action, targetIndex) {
        if (!this.state || !this.state.playerTurn) return;
        var unit = this.state.currentUnit;

        if (action === 'attack') {
            this.doAttack(unit, targetIndex);
        } else if (action === 'defend') {
            unit._defending = true;
            this.addLog(unit.name + ' 进入防御姿态', 'skill');
            this.nextTurn();
        } else if (action === 'item') {
            if (Game.consumeItem('jinchuang', 1)) {
                var heal = Math.floor(unit._maxHp * 0.3);
                unit._hp = Math.min(unit._maxHp, unit._hp + heal);
                this.addFloatingText(unit, heal, 'heal');
                this.addLog(unit.name + ' 使用了金疮药，恢复 <span class="log-heal">' + heal + '</span> HP', 'heal');
            } else {
                this.addLog('没有可用的金疮药！', 'skill');
                return; // 玩家回合，提示后让玩家继续操作
            }
            this.nextTurn();
        } else if (action.indexOf('skill') === 0) {
            var si = parseInt(action.replace('skill', ''), 10);
            this.useSkill(unit, si);
        } else if (action === 'ult') {
            this.useUlt(unit);
        }
    },

    doAttack: function(attacker, targetIndex) {
        var s = this.state;
        var targets = attacker._side === 'player' ? s.enemyUnits : s.playerUnits;

        var target;
        if (targetIndex !== null && targetIndex !== undefined) {
            var aliveTargets = [];
            for (var i = 0; i < targets.length; i++) {
                if (!targets[i]._dead) aliveTargets.push(targets[i]);
            }
            if (targetIndex < aliveTargets.length) {
                target = aliveTargets[targetIndex];
            }
        }
        if (!target) {
            target = this.pickTargetSmart(attacker);
        }
        if (!target) {
            this.nextTurn();
            return;
        }

        var dmg = Math.max(1, attacker._atk - target._def);
        var isCrit = rand(1, 100) <= attacker._crit;
        if (isCrit) dmg = Math.floor(dmg * 1.5);
        if (target._defending) dmg = Math.floor(dmg * 0.5);
        var isDodge = rand(1, 100) <= target._dodge;
        if (isDodge) {
            this.addFloatingText(target, '闪避', 'miss');
            this.addLog(target.name + ' 闪避了攻击！', 'skill');
        } else {
            target._hp = Math.max(0, target._hp - dmg);
            this.addFloatingText(target, dmg, isCrit ? 'crit' : 'damage');
            var critText = isCrit ? ' <b>暴击！</b>' : '';
            this.addLog(attacker.name + ' 攻击 ' + target.name + '，造成 <span class="log-damage">' + dmg + '</span> 伤害' + critText, 'damage');
            attacker._ult = Math.min(100, attacker._ult + 5);
            if (isCrit) attacker._ult = Math.min(100, attacker._ult + 5);
            if (target._hp <= 0) {
                target._dead = true;
                attacker._ult = Math.min(100, attacker._ult + 20);
                this.addLog(target.name + ' 被击败了！', 'damage');
            }
        }
        this.render();
        if (!this.checkBattleEnd()) {
            var self = this;
            setTimeout(function() { self.nextTurn(); }, 400 / self.speed);
        }
    },

    // ===== 技能释放（修复卡死：AI调用时提前return必须nextTurn） =====
    useSkill: function(unit, skillIndex) {
        var isAI = unit._side === 'enemy' || (this.state && !this.state.playerTurn);
        var skills = unit._battleSkills;
        if (!skills || skillIndex >= skills.length) {
            if (isAI) this.nextTurn();
            return;
        }
        if (unit._skillCd[skillIndex] > 0) {
            if (isAI) this.nextTurn();
            return;
        }

        var skill = skills[skillIndex];
        if (!skill) {
            if (isAI) this.nextTurn();
            return;
        }

        if (unit._mp < skill.cost) {
            this.addLog('内力不足！' + skill.name + '需要' + skill.cost + 'MP', 'skill');
            if (isAI) this.nextTurn();
            return;
        }
        unit._mp -= skill.cost;
        unit._skillCd[skillIndex] = skill.cd;

        var target = this.pickTargetSmart(unit);
        if (!target) {
            this.nextTurn();
            return;
        }

        var dmgMult = skill.effect && skill.effect.dmg ? skill.effect.dmg : 1.5;
        var dmg = Math.max(1, Math.floor(unit._atk * dmgMult - target._def));
        target._hp = Math.max(0, target._hp - dmg);

        this.addFloatingText(target, dmg, 'skill');
        this.addLog(unit.name + ' 释放 <span class="log-skill">' + skill.name + '</span>，对 ' + target.name + ' 造成 <span class="log-damage">' + dmg + '</span> 伤害', 'skill');
        unit._ult = Math.min(100, unit._ult + 10);
        if (target._hp <= 0) {
            target._dead = true;
            unit._ult = Math.min(100, unit._ult + 20);
            this.addLog(target.name + ' 被击败了！', 'damage');
        }

        this.render();
        if (!this.checkBattleEnd()) {
            var self = this;
            setTimeout(function() { self.nextTurn(); }, 500 / self.speed);
        }
    },

    // ===== 奥义释放（同样修复卡死） =====
    useUlt: function(unit) {
        var isAI = unit._side === 'enemy' || (this.state && !this.state.playerTurn);
        if (unit._ult < 100) {
            if (isAI) this.nextTurn();
            return;
        }
        if (!unit._canUseUlt) {
            this.addLog('奥义未解锁！', 'skill');
            if (isAI) this.nextTurn();
            return;
        }

        var ult = this.getUlt(unit);
        if (!ult) {
            this.addLog('没有可用的奥义！', 'skill');
            if (isAI) this.nextTurn();
            return;
        }

        unit._ult = 0;
        var s = this.state;
        var targets = unit._side === 'player' ? s.enemyUnits : s.playerUnits;
        var aliveTargets = [];
        for (var i = 0; i < targets.length; i++) {
            if (!targets[i]._dead) aliveTargets.push(targets[i]);
        }
        if (aliveTargets.length === 0) {
            this.nextTurn();
            return;
        }

        var ultDmg = 3.0;
        if (ult.effect && ult.effect.dmg) ultDmg = ult.effect.dmg;

        this.addLog(unit.name + ' 释放 <span class="log-ult">奥义·' + ult.name + '</span>！', 'ult');

        var isAoe = rand(0, 1) === 1;
        if (isAoe && aliveTargets.length > 1) {
            for (var j = 0; j < aliveTargets.length; j++) {
                var t = aliveTargets[j];
                var dmg = Math.max(1, Math.floor(unit._atk * ultDmg - t._def));
                t._hp = Math.max(0, t._hp - dmg);
                this.addFloatingText(t, dmg, 'ult');
                this.addLog('对 ' + t.name + ' 造成 <span class="log-damage">' + dmg + '</span> 伤害', 'damage');
                if (t._hp <= 0) {
                    t._dead = true;
                    this.addLog(t.name + ' 被击败了！', 'damage');
                }
            }
        } else {
            var target = this.pickTargetSmart(unit);
            if (!target) target = aliveTargets[rand(0, aliveTargets.length - 1)];
            var dmg = Math.max(1, Math.floor(unit._atk * ultDmg * 1.5 - target._def));
            target._hp = Math.max(0, target._hp - dmg);
            this.addFloatingText(target, dmg, 'ult');
            this.addLog('对 ' + target.name + ' 造成 <span class="log-damage">' + dmg + '</span> 伤害', 'damage');
            if (target._hp <= 0) {
                target._dead = true;
                this.addLog(target.name + ' 被击败了！', 'damage');
            }
        }

        this.render();
        if (!this.checkBattleEnd()) {
            var self = this;
            setTimeout(function() { self.nextTurn(); }, 800 / self.speed);
        }
    },

    enemyAI: function() {
        var unit = this.state.currentUnit;
        if (!unit || unit._dead) {
            this.nextTurn();
            return;
        }
        if (unit._ult >= 100) {
            this.useUlt(unit);
            return;
        }
        var r = rand(1, 100);
        if (r <= 30 && unit._battleSkills && unit._battleSkills.length > 0) {
            this.useSkill(unit, 0);
        } else {
            this.doAttack(unit);
        }
    },

    autoAction: function() {
        var unit = this.state.currentUnit;
        if (!unit) return;
        if (unit._ult >= 100) {
            this.useUlt(unit);
            return;
        }
        if (unit._battleSkills && unit._battleSkills.length > 0) {
            var sk = unit._battleSkills[0];
            if (unit._skillCd[0] === 0 && unit._mp >= (sk ? sk.cost : 20)) {
                this.useSkill(unit, 0);
                return;
            }
        }
        this.doAttack(unit);
    },

    checkBattleEnd: function() {
        var s = this.state;
        var alivePlayer = [];
        var aliveEnemy = [];
        for (var i = 0; i < s.playerUnits.length; i++) {
            if (!s.playerUnits[i]._dead) alivePlayer.push(s.playerUnits[i]);
        }
        for (var i = 0; i < s.enemyUnits.length; i++) {
            if (!s.enemyUnits[i]._dead) aliveEnemy.push(s.enemyUnits[i]);
        }
        if (alivePlayer.length === 0) {
            s.result = 'lose';
            this.showResult();
            return true;
        }
        if (aliveEnemy.length === 0) {
            s.result = 'win';
            this.showResult();
            return true;
        }
        if (s.options.survive && s.round > s.options.survive) {
            s.result = 'win';
            this.showResult();
            return true;
        }
        return false;
    },

    showResult: function() {
        var s = this.state;
        var isWin = s.result === 'win';
        document.getElementById('result-title').textContent = isWin ? '战斗胜利！' : '战斗失败...';
        document.getElementById('result-title').style.color = isWin ? '#6b8e6b' : '#c2392b';

        var rewardsHtml = '';
        if (isWin && s.options.reward) {
            var r = s.options.reward;
            rewardsHtml += '<div class="reward-item">💰 银两 +' + (r.silver || 0) + '</div>';
            rewardsHtml += '<div class="reward-item">⭐ 经验 +' + (r.exp || 0) + '</div>';
            if (r.items) {
                for (var i = 0; i < r.items.length; i++) {
                    rewardsHtml += '<div class="reward-item">📦 ' + r.items[i] + '</div>';
                }
            }
        } else if (isWin) {
            var exp = 50 * Game.state.chapter;
            var silver = 30 * Game.state.chapter;
            rewardsHtml += '<div class="reward-item">💰 银两 +' + silver + '</div>';
            rewardsHtml += '<div class="reward-item">⭐ 经验 +' + exp + '</div>';

            var enemy = s.enemyUnits[0];
            if (enemy && enemy.drops) {
                for (var i = 0; i < enemy.drops.length; i++) {
                    var drop = enemy.drops[i];
                    if (rand(1, 100) <= 30 + Game.state.hero.luk) {
                        Game.addItem(drop, 1);
                        var mat = GAME_DATA.materials[drop];
                        rewardsHtml += '<div class="reward-item">📦 ' + (mat ? mat.name : drop) + ' ×1</div>';
                    }
                }
            }

            // 追踪击杀任务
            if (enemy && enemy.id) {
                Game.trackKill(enemy.id);
            }

            for (var i = 0; i < Game.state.team.length; i++) {
                var u = Game.state.team[i];
                if (!u._dead) Game.gainExp(u, exp);
            }
            Game.addSilver(silver);
        }


        document.getElementById('result-rewards').innerHTML = rewardsHtml;
        document.getElementById('battle-result').classList.add('active');
    },

    endBattle: function() {
        document.getElementById('battle-result').classList.remove('active');
        if (this.state.result === 'win') {
            if (this.state.options.cellKey) {
                Map.markDefeated(this.state.options.cellKey);
            }

            var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
            var pos = Game.state.currentPos;
            if (chapter && pos.x === chapter.exitPos.x && pos.y === chapter.exitPos.y) {
                Game.state.chapter++;
                var nextChapter = GAME_DATA.chapters[Game.state.chapter - 1];
                if (nextChapter) {
                    Game.state.currentPos = { x: nextChapter.startPos.x, y: nextChapter.startPos.y };
                    Game.state.visitedCells = [];
                    Game.state.defeatedCells = [];
                }
                UI.showModal('章节通关！', '恭喜通关<b>' + chapter.name + '</b>！<br><br>下一章已解锁。');
            }
            Game.saveGame();
            Game.toScreen('map');
            Map.init();
        } else {
            for (var i = 0; i < Game.state.team.length; i++) {
                var u = Game.state.team[i];
                var stats = calcStats(u);
                u.hp = Math.floor(stats.maxHp * 0.3);
                u.mp = Math.floor(stats.maxMp * 0.3);
            }
            UI.showModal('战斗失败', '你败下阵来，但保住了性命。<br><br>休息后再次挑战吧。');
            Game.toScreen('map');
            Map.init();
        }
        this.state = null;
    },

    // ===== 飘字系统 =====
    addFloatingText: function(target, value, type) {
        if (!this.state || !target || !target._pos) return;
        var text = value;
        var color = '#ff6b6b';
        if (type === 'heal') color = '#6bff8a';
        else if (type === 'crit') { color = '#ff9f40'; text = value + '!'; }
        else if (type === 'ult') color = '#d4a843';
        else if (type === 'miss') color = '#aaa';
        else if (type === 'skill') color = '#7ab8ff';

        this.state.floatingTexts.push({
            x: target._pos.x,
            y: target._pos.y,
            side: target._side,
            text: String(text),
            color: color,
            time: Date.now()
        });
    },

    // ===== 九宫格渲染 =====
    render: function() {
        if (!this.state) return;
        var s = this.state;
        document.getElementById('battle-round').textContent = s.round;
        document.getElementById('battle-speed').textContent = this.speed;

        var enemyHtml = this.renderGrid(s.enemyUnits, 'enemy');
        document.getElementById('enemy-side').innerHTML = enemyHtml;

        var playerHtml = this.renderGrid(s.playerUnits, 'player');
        document.getElementById('player-side').innerHTML = playerHtml;

        if (s.playerTurn && s.currentUnit && !s.currentUnit._dead) {
            var unit = s.currentUnit;
            document.getElementById('battle-controls').style.display = 'block';

            var skills = unit._battleSkills || [];
            var skillHtml = '';
            for (var si = 0; si < 2; si++) {
                var sk = skills[si];
                if (sk) {
                    var skillDisabled = unit._skillCd[si] > 0 || unit._mp < sk.cost;
                    var skillLabel = unit._mp < sk.cost ? '内力不足' : (unit._skillCd[si] > 0 ? 'CD:' + unit._skillCd[si] : sk.cost + 'MP');
                    skillHtml += '<button class="skill-btn ' + (skillDisabled ? 'disabled' : '') + '" onclick="Battle.playerAction(\'skill' + si + '\')" ' + (skillDisabled ? 'disabled' : '') + '>' +
                        sk.name + '<br><small>' + skillLabel + '</small>' +
                    '</button>';
                } else {
                    skillHtml += '<button class="skill-btn disabled" disabled>空<br><small>未配置</small></button>';
                }
            }
            document.getElementById('skill-bar').innerHTML = skillHtml;

            var ult = this.getUlt(unit);
            var ultDisabled = unit._ult < 100 || !unit._canUseUlt || !ult;
            var ultLabel = !unit._canUseUlt ? '未解锁' : (unit._ult < 100 ? unit._ult + '/100' : (ult ? '可释放！' : '无奥义'));
            var ultHtml = '<button class="ult-btn ' + (ultDisabled ? 'disabled' : 'ready') + '" onclick="Battle.playerAction(\'ult\')" ' + (ultDisabled ? 'disabled' : '') + '>' +
                (ult ? ult.name : '奥义') + '<br><small>' + ultLabel + '</small>' +
            '</button>';
            document.getElementById('ultimate-bar').innerHTML = ultHtml;
        } else {
            document.getElementById('battle-controls').style.display = 'none';
        }
    },

    renderGrid: function(units, side) {
        var posMap = {};
        for (var i = 0; i < units.length; i++) {
            var u = units[i];
            if (!u._pos) continue;
            var key = u._pos.x + ',' + u._pos.y;
            posMap[key] = u;
        }

        // 收集该side的飘字
        var floats = [];
        if (this.state && this.state.floatingTexts) {
            var now = Date.now();
            for (var fi = 0; fi < this.state.floatingTexts.length; fi++) {
                var ft = this.state.floatingTexts[fi];
                if (ft.side === side && now - ft.time < 1200) {
                    floats.push(ft);
                }
            }
        }

        var html = '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;">';
        for (var y = 0; y < 3; y++) {
            for (var x = 0; x < 3; x++) {
                var key = x + ',' + y;
                var u = posMap[key];
                var floatHtml = '';
                for (var fi = 0; fi < floats.length; fi++) {
                    if (floats[fi].x === x && floats[fi].y === y) {
                        floatHtml += '<div class="float-text" style="color:' + floats[fi].color + '">' + floats[fi].text + '</div>';
                    }
                }
                if (u) {
                    var hpPct = u._dead ? 0 : (u._hp / u._maxHp * 100);
                    var ultPct = Math.min(100, u._ult || 0);
                    var isActive = this.state.currentUnit === u ? 'active' : '';
                    var deadClass = u._dead ? 'dead' : '';
                    html += '<div class="battle-unit ' + deadClass + ' ' + isActive + '" ' +
                        (side === 'enemy' && !u._dead ? 'onclick="Battle.selectTarget(' + u._index + ')"' : '') + '>' +
                        floatHtml +
                        '<div class="unit-avatar">' + (u.avatar || (side === 'player' ? '🎭' : '👤')) + '</div>' +
                        '<div class="unit-name">' + u.name + '</div>' +
                        '<div class="unit-hp-bar"><div class="unit-hp-fill" style="width:' + hpPct + '%"></div></div>' +
                        '<div class="unit-hp-text">' + (u._dead ? '0' : Math.floor(u._hp)) + '/' + u._maxHp + '</div>' +
                        (side === 'player' ? '<div class="unit-ult-bar"><div class="unit-ult-fill" style="width:' + ultPct + '%"></div></div>' : '') +
                    '</div>';
                } else {
                    html += '<div style="min-height:80px;border:1px dashed #444;border-radius:6px;background:rgba(0,0,0,0.2);position:relative;">' + floatHtml + '</div>';
                }
            }
        }
        html += '</div>';

        // 清理过期飘字
        if (this.state && this.state.floatingTexts) {
            var now2 = Date.now();
            var kept = [];
            for (var i = 0; i < this.state.floatingTexts.length; i++) {
                if (now2 - this.state.floatingTexts[i].time < 1200) {
                    kept.push(this.state.floatingTexts[i]);
                }
            }
            this.state.floatingTexts = kept;
        }

        return html;
    },

    selectTarget: function(index) {
        if (!this.state || !this.state.playerTurn) return;
        // 暂时不实现手动选目标，自动选择
    },

    addLog: function(text, type) {
        if (!this.state) return;
        this.state.log.push({ text: text, type: type, time: Date.now() });
        var logEl = document.getElementById('battle-log');
        var div = document.createElement('div');
        div.innerHTML = text;
        logEl.appendChild(div);
        logEl.scrollTop = logEl.scrollHeight;
        while (logEl.children.length > 50) {
            logEl.removeChild(logEl.firstChild);
        }
    },

    toggleSpeed: function() {
        this.speed = this.speed === 1 ? 2 : (this.speed === 2 ? 3 : 1);
        document.getElementById('battle-speed').textContent = this.speed;
    },

    toggleAuto: function() {
        this.auto = !this.auto;
        var btn = document.getElementById('auto-btn');
        if (this.auto) btn.classList.add('active');
        else btn.classList.remove('active');
        if (this.auto && this.state && this.state.playerTurn) {
            this.autoAction();
        }
    }
};
