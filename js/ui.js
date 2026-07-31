// ===== UI渲染与交互 =====
var UI = {
    currentModal: null,

    showModal: function(title, content, buttons) {
        var titleEl = document.getElementById('modal-title');
        var bodyEl = document.getElementById('modal-body');
        var footerEl = document.getElementById('modal-footer');
        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = content.replace(/\n/g, '<br>');
        if (buttons) {
            if (footerEl) footerEl.innerHTML = buttons;
        } else {
            if (footerEl) footerEl.innerHTML = '<button class="btn-confirm" onclick="UI.closeModal()">确定</button>';
        }
        if (footerEl) footerEl.style.display = 'block';
        var overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.add('active');
    },

    closeModal: function() {
        var overlay = document.getElementById('modal-overlay');
        if (overlay) overlay.classList.remove('active');
    },

    confirm: function(title, content, onConfirm, onCancel) {
        var buttons = '<button class="btn-cancel" onclick="UI.closeModal()">取消</button>' +
                      '<button class="btn-confirm" onclick="UI.closeModal(); ' + onConfirm + '">确定</button>';
        this.showModal(title, content, buttons);
    },

    // ===== 武将界面 =====
    renderHeroes: function() {
        if (!Game.state) return;
        var list = document.getElementById('heroes-list');
        if (!list) return;

        var teamIds = [];
        for (var i = 0; i < Game.state.team.length; i++) {
            teamIds.push(Game.state.team[i].id);
        }

        var html = '<h4 style="margin-bottom:10px;color:#5a4a3a;">当前队伍</h4>';

        for (var j = 0; j < Game.state.team.length; j++) {
            var u = Game.state.team[j];
            var stats = calcStats(u);
            var weaponType = '无';
            var weaponIcon = '❓';
            if (u.equip && u.equip.weapon && u.equip.weapon.type) {
                var wt = GAME_DATA.weaponTypes[u.equip.weapon.type];
                if (wt) {
                    weaponType = wt.name;
                    weaponIcon = wt.icon;
                }
            }
            var growth = GAME_DATA.growthTypes[u.growth];

            html += '<div class="hero-card in-team">' +
                '<div class="card-avatar">' + (u.avatar || '🎭') + '</div>' +
                '<div class="card-info">' +
                    '<div class="card-name">' + u.name + (u.isHero ? ' (主角)' : '') + ' <span>' + weaponIcon + '</span></div>' +
                    '<div class="card-meta">Lv.' + u.level + ' · ' + (growth ? growth.label : '') + '</div>' +
                    '<div class="card-stats">' +
                        '<span class="card-stat">💪' + u.str + '</span>' +
                        '<span class="card-stat">💨' + u.agi + '</span>' +
                        '<span class="card-stat">❤️' + u.vit + '</span>' +
                        '<span class="card-stat">🍀' + u.luk + '</span>' +
                    '</div>' +
                    (!u.isHero ? '<div class="card-bond">💝 羁绊 Lv.' + (u.bondLevel || 0) + ' <small>(' + (u.bondExp || 0) + '/' + (GAME_DATA.bondConfig.expNeed[(u.bondLevel || 0) + 1] || 'MAX') + ')</small></div>' : '') +
                '</div>' +
            '</div>';
        }

        html += '<h4 style="margin:20px 0 10px;color:#5a4a3a;">阵型站位（3×3）</h4>';
        html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;">';
        var positions = Game.state.teamPositions || {};
        var posToHero = {};
        for (var hid in positions) {
            if (!positions.hasOwnProperty(hid)) continue;
            var pk = positions[hid].x + ',' + positions[hid].y;
            posToHero[pk] = hid;
        }
        for (var py = 0; py < 3; py++) {
            for (var px = 0; px < 3; px++) {
                var pk2 = px + ',' + py;
                var placedId = posToHero[pk2];
                if (placedId) {
                    var pu = null;
                    for (var ti = 0; ti < Game.state.team.length; ti++) {
                        if (Game.state.team[ti].id === placedId) { pu = Game.state.team[ti]; break; }
                    }
                    if (pu) {
                        html += '<div style="border:1px solid #555;border-radius:6px;padding:6px;text-align:center;background:#2a2520;">' +
                            '<div style="font-size:24px;">' + (pu.avatar || '👤') + '</div>' +
                            '<div style="font-size:11px;color:#ccc;">' + pu.name + '</div>' +
                            '<button style="font-size:10px;padding:2px 6px;margin-top:2px;" onclick="UI.removeTeamPosition(\'' + placedId + '\')">移除</button>' +
                        '</div>';
                    } else {
                        html += '<div style="border:1px dashed #444;border-radius:6px;padding:6px;text-align:center;color:#666;">空位</div>';
                    }
                } else {
                    html += '<div style="border:1px dashed #444;border-radius:6px;padding:6px;text-align:center;color:#666;cursor:pointer;" onclick="UI.showPlaceHeroModal(' + px + ',' + py + ')">' +
                        '<div style="font-size:20px;">+</div>' +
                        '<div style="font-size:10px;">点击放置</div>' +
                    '</div>';
                }
            }
        }
        html += '</div>';
        html += '<p style="font-size:12px;color:#999;margin-bottom:12px;">前排(y=0)先挨打，后排(y=2)相对安全。敌方优先攻击我方最上面一排。</p>';

        var otherHeroes = [];
        for (var k = 0; k < Game.state.unlockedHeroes.length; k++) {
            if (teamIds.indexOf(Game.state.unlockedHeroes[k]) === -1) {
                otherHeroes.push(Game.state.unlockedHeroes[k]);
            }
        }

        if (otherHeroes.length > 0) {
            html += '<h4 style="margin:20px 0 10px;color:#5a4a3a;">已招募</h4>';
            for (var m = 0; m < otherHeroes.length; m++) {
                var template = GAME_DATA.heroes[otherHeroes[m]];
                if (!template) continue;
                var wName = '';
                if (template.weapon && GAME_DATA.weaponTypes[template.weapon]) {
                    wName = GAME_DATA.weaponTypes[template.weapon].name;
                }
                html += '<div class="hero-card">' +
                    '<div class="card-avatar">' + (template.avatar || '👤') + '</div>' +
                    '<div class="card-info">' +
                        '<div class="card-name">' + template.name + '</div>' +
                        '<div class="card-meta">' + template.faction + ' · ' + wName + '</div>' +
                    '</div>' +
                '</div>';
            }
        }

        list.innerHTML = html;

        var formEl = document.getElementById('formation-options');
        if (!formEl) return;
        var formHtml = '';
        for (var n = 0; n < Game.state.formations.length; n++) {
            var fid = Game.state.formations[n];
            var f = GAME_DATA.formations[fid];
            var selected = Game.state.currentFormation === fid;
            formHtml += '<div class="formation-option ' + (selected ? 'selected' : '') + '" onclick="UI.selectFormation(\'' + fid + '\')">' +
                f.name + '<br><small style="color:#999">' + f.desc + '</small>' +
            '</div>';
        }
        formEl.innerHTML = formHtml;
    },

    selectFormation: function(fid) {
        Game.state.currentFormation = fid;
        Game.saveGame();
        this.renderHeroes();
    },

    showPlaceHeroModal: function(x, y) {
        var positions = Game.state.teamPositions || {};
        var placedIds = {};
        for (var hid in positions) {
            if (positions.hasOwnProperty(hid)) placedIds[hid] = true;
        }
        var unplaced = [];
        for (var i = 0; i < Game.state.team.length; i++) {
            var t = Game.state.team[i];
            if (!placedIds[t.id]) unplaced.push(t);
        }
        if (unplaced.length === 0) {
            UI.showModal('提示', '所有武将都已放置，如需调整请先移除。');
            return;
        }
        var content = '选择要放置在 (' + x + ',' + y + ') 的武将：<br><br>';
        for (var j = 0; j < unplaced.length; j++) {
            var u = unplaced[j];
            content += '<button style="margin:4px;padding:8px 12px;" onclick="UI.closeModal();UI.setTeamPosition(\'' + u.id + '\',' + x + ',' + y + ')">' + (u.avatar || '👤') + ' ' + u.name + '</button>';
        }
        UI.showModal('选择武将', content);
    },

    setTeamPosition: function(heroId, x, y) {
        if (!Game.state.teamPositions) Game.state.teamPositions = {};
        for (var hid in Game.state.teamPositions) {
            if (!Game.state.teamPositions.hasOwnProperty(hid)) continue;
            var p = Game.state.teamPositions[hid];
            if (p.x === x && p.y === y) {
                delete Game.state.teamPositions[hid];
                break;
            }
        }
        Game.state.teamPositions[heroId] = { x: x, y: y };
        Game.saveGame();
        this.renderHeroes();
    },

    removeTeamPosition: function(heroId) {
        if (Game.state.teamPositions && Game.state.teamPositions[heroId]) {
            delete Game.state.teamPositions[heroId];
            Game.saveGame();
            this.renderHeroes();
        }
    },

    // ===== 背包界面 =====
    bagTab: 'all',

    showBagTab: function(tab) {
        this.bagTab = tab;
        var tabs = document.querySelectorAll('.bag-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        if (event && event.target) event.target.classList.add('active');
        this.renderBag();
    },

    renderBag: function() {
        if (!Game.state) return;
        var inv = Game.state.hero.inventory;
        var grid = document.getElementById('bag-grid');
        if (!grid) return;

        var items = [];
        for (var id in inv) {
            if (!inv.hasOwnProperty(id)) continue;
            var count = inv[id];
            var item = null;
            var category = 'other';

            if (GAME_DATA.materials[id]) {
                item = GAME_DATA.materials[id];
                category = 'material';
            } else if (GAME_DATA.consumables[id]) {
                item = GAME_DATA.consumables[id];
                category = 'consumable';
            } else if (GAME_DATA.baseWeapons[id]) {
                item = GAME_DATA.baseWeapons[id];
                category = 'weapon';
            }

            if (!item) {
                for (var fi = 0; fi < GAME_DATA.forgeList.length; fi++) {
                    if (GAME_DATA.forgeList[fi].id === id) {
                        item = GAME_DATA.forgeList[fi];
                        category = 'weapon';
                        break;
                    }
                }
            }

            if (item) {
                item = copyObj(item);
                item.id = id;
                item.count = count;
                item.category = category;
                items.push(item);
            }
        }

        if (this.bagTab !== 'all') {
            items = items.filter(function(i) {
                return i.category === UI.bagTab;
            });
        }

        var html = '';
        for (var j = 0; j < items.length; j++) {
            var it = items[j];
            html += '<div class="bag-item" onclick="UI.showItemDetail(\'' + it.id + '\', \'' + it.category + '\')">' +
                '<span class="item-icon">' + (it.icon || '📦') + '</span>' +
                '<span class="item-name">' + it.name + '</span>' +
                (it.count > 1 ? '<span class="item-count">' + it.count + '</span>' : '') +
            '</div>';
        }

        if (items.length === 0) {
            html = '<div style="grid-column:span 4;text-align:center;color:#999;padding:40px;">暂无物品</div>';
        }

        grid.innerHTML = html;
    },

    showItemDetail: function(id, category) {
        var item = null;
        var desc = '';

        if (GAME_DATA.materials[id]) {
            item = GAME_DATA.materials[id];
            desc = item.desc || '材料';
        } else if (GAME_DATA.consumables[id]) {
            item = GAME_DATA.consumables[id];
            desc = item.desc || '';
        } else if (GAME_DATA.baseWeapons[id]) {
            item = GAME_DATA.baseWeapons[id];
            if (item) {
                var wName = '';
                if (item.type && GAME_DATA.weaponTypes[item.type]) {
                    wName = GAME_DATA.weaponTypes[item.type].name;
                }
                desc = '攻击+' + item.atk + ' · ' + wName;
            }
        } else {
            for (var fi = 0; fi < GAME_DATA.forgeList.length; fi++) {
                if (GAME_DATA.forgeList[fi].id === id) {
                    item = GAME_DATA.forgeList[fi];
                    var wName2 = '';
                    if (item.type && GAME_DATA.weaponTypes[item.type]) {
                        wName2 = GAME_DATA.weaponTypes[item.type].name;
                    }
                    desc = '攻击+' + item.atk + ' · ' + wName2;
                    break;
                }
            }
        }

        if (!item) return;

        var count = Game.state.hero.inventory[id] || 1;
        this.showModal(item.name, desc + '<br><br>持有数量：' + count);
    },

    // ===== 铁匠铺 =====
    smithTab: 'forge',

    showSmithTab: function(tab) {
        this.smithTab = tab;
        var tabs = document.querySelectorAll('.smith-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        if (event && event.target) event.target.classList.add('active');
        this.renderSmith();
    },

    renderSmith: function() {
        var content = document.getElementById('smith-content');
        if (!content) return;

        if (this.smithTab === 'forge') {
            this.renderForgeList(content);
        } else {
            content.innerHTML = '<div style="text-align:center;color:#999;padding:40px;">合成功能即将开放</div>';
        }
    },

    renderForgeList: function(container) {
        var inv = Game.state.hero.inventory;
        var html = '<div class="forge-list">';

        for (var i = 0; i < GAME_DATA.forgeList.length; i++) {
            var item = GAME_DATA.forgeList[i];
            var canForge = true;
            var materialsHtml = '';

            for (var matId in item.materials) {
                if (!item.materials.hasOwnProperty(matId)) continue;
                var need = item.materials[matId];
                var have = inv[matId] || 0;
                var enough = have >= need;
                if (!enough) canForge = false;
                var mat = GAME_DATA.materials[matId];
                materialsHtml += '<span style="color:' + (enough ? '#6b8e6b' : '#c2392b') + '">' + (mat ? mat.name : matId) + ':' + have + '/' + need + '</span> ';
            }

            var quality = GAME_DATA.qualities[item.quality];
            var qColor = (quality && quality.color) || '#999';
            var wIcon = '⚔️';
            if (item.type && GAME_DATA.weaponTypes[item.type]) {
                wIcon = GAME_DATA.weaponTypes[item.type].icon;
            }

            html += '<div class="forge-item">' +
                '<div class="forge-icon">' + wIcon + '</div>' +
                '<div class="forge-info">' +
                    '<div class="forge-name" style="color:' + qColor + '">' + item.name + '</div>' +
                    '<div class="forge-meta" style="font-size:12px;color:#999">攻击+' + item.atk + ' · 成功率' + Math.floor((item.success || 0.5) * 100) + '%</div>' +
                    '<div class="forge-materials" style="font-size:12px">' + materialsHtml + '</div>' +
                '</div>' +
                '<button class="forge-btn" ' + (!canForge ? 'disabled' : '') + ' onclick="UI.forgeWeapon(\'' + item.id + '\')">' +
                    (canForge ? '锻造' : '材料不足') +
                '</button>' +
            '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
    },

    forgeWeapon: function(weaponId) {
        var item = null;
        for (var i = 0; i < GAME_DATA.forgeList.length; i++) {
            if (GAME_DATA.forgeList[i].id === weaponId) {
                item = GAME_DATA.forgeList[i];
                break;
            }
        }
        if (!item) return;

        for (var matId in item.materials) {
            if (!item.materials.hasOwnProperty(matId)) continue;
            var need = item.materials[matId];
            if (!Game.consumeItem(matId, need)) {
                UI.showModal('错误', '材料不足！');
                return;
            }
        }

        var success = Math.random() < (item.success || 0.5);

        if (success) {
            Game.state.hero.inventory[weaponId] = (Game.state.hero.inventory[weaponId] || 0) + 1;
            var quality = GAME_DATA.qualities[item.quality];
            var qColor = (quality && quality.color) || '#999';
            UI.showModal('锻造成功！', '你成功锻造了 <b style="color:' + qColor + '">' + item.name + '</b>！<br><br>攻击+' + item.atk);

            var q = null;
            for (var j = 0; j < Game.state.quests.length; j++) {
                if (Game.state.quests[j].id === 'q_forge_first') {
                    q = Game.state.quests[j];
                    break;
                }
            }
            if (q && !q.completed) {
                q.forgeCount = (q.forgeCount || 0) + 1;
            }
        } else {
            var refund = Math.floor(Object.keys(item.materials).length * 50);
            Game.addSilver(refund);
            UI.showModal('锻造失败', '锻造失败了...<br><br>材料已消耗，但返还了 ' + refund + ' 银两。');
        }

        Game.saveGame();
        this.renderSmith();
    },

    // ===== 任务界面 =====
    renderTasks: function() {
        if (!Game.state) return;
        var list = document.getElementById('task-list');
        if (!list) return;

        var html = '';
        for (var i = 0; i < Game.state.quests.length; i++) {
            var q = Game.state.quests[i];
            var completed = q.completed || false;
            var sourceText = '';
            // 用 location + npcName 来定位
            if (q.location && q.npcName) {
                sourceText = '<div class="task-source">📍 ' + q.location + ' · ' + q.npcName + '</div>';
            }

            var progressText = '';
            var actionHint = '';
            if (!completed && q.target) {
                if (q.target.kill) {
                    var prog = q.progress || 0;
                    progressText = '<div class="task-progress">进度: ' + prog + '/' + q.target.count + '</div>';
                    if (prog >= q.target.count) {
                        actionHint = '<div style="font-size:12px;color:#6b8e6b;margin-top:4px;">✓ 已完成！请去 ' + q.location + ' 找 ' + q.npcName + ' 答复</div>';
                    } else {
                        actionHint = '<div style="font-size:12px;color:#999;margin-top:4px;">前往 ' + q.location + ' 的迷宫击杀 ' + q.target.count + ' 个目标</div>';
                    }
                } else if (q.target.item) {
                    var have = Game.state.hero.inventory[q.target.item] || 0;
                    progressText = '<div class="task-progress">持有: ' + have + '/' + q.target.count + '</div>';
                    if (have >= q.target.count) {
                        actionHint = '<div style="font-size:12px;color:#6b8e6b;margin-top:4px;">✓ 材料齐全！请去 ' + q.location + ' 找 ' + q.npcName + ' 提交</div>';
                    } else {
                        actionHint = '<div style="font-size:12px;color:#999;margin-top:4px;">收集 ' + q.target.count + ' 个 ' + (GAME_DATA.materials[q.target.item] ? GAME_DATA.materials[q.target.item].name : q.target.item) + '</div>';
                    }
                } else if (q.target.forge) {
                    var fcount = q.forgeCount || 0;
                    progressText = '<div class="task-progress">锻造: ' + fcount + '/' + q.target.forge + '</div>';
                    if (fcount >= q.target.forge) {
                        actionHint = '<div style="font-size:12px;color:#6b8e6b;margin-top:4px;">✓ 已完成！请去 ' + q.location + ' 找 ' + q.npcName + ' 提交</div>';
                    } else {
                        actionHint = '<div style="font-size:12px;color:#999;margin-top:4px;">去 ' + q.location + ' 的铁匠铺锻造 ' + q.target.forge + ' 次兵器</div>';
                    }
                }
            }

            html += '<div class="task-item ' + (completed ? 'completed' : '') + '">' +
                sourceText +
                '<div class="task-title">' +
                    '<span>' + q.name + '</span>' +
                '</div>' +
                '<div class="task-desc">' + q.desc + '</div>' +
                progressText +
                actionHint +
                '<div class="task-reward">' +
                    '奖励: ' + (q.reward.exp ? '经验+' + q.reward.exp : '') + ' ' +
                    (q.reward.silver ? '银两+' + q.reward.silver : '') +
                '</div>' +
            '</div>';
        }

        if (html === '') {
            html = '<div style="text-align:center;color:#999;padding:40px;">暂无任务</div>';
        }

        list.innerHTML = html;
    },

    // ===== 角色配置选择页 =====
    renderConfig: function() {
        if (!Game.state) return;
        var list = document.getElementById('config-char-list');
        if (!list) return;

        var html = '';
        for (var i = 0; i < Game.state.team.length; i++) {
            var u = Game.state.team[i];
            var stats = calcStats(u);
            var wIcon = '❓';
            if (u.equip && u.equip.weapon && u.equip.weapon.type) {
                var wt = GAME_DATA.weaponTypes[u.equip.weapon.type];
                if (wt) wIcon = wt.icon;
            }
            html += '<div class="config-char-card" onclick="UI.openUnitConfig(\'' + u.id + '\')">' +
                '<div class="char-card-avatar">' + (u.avatar || '👤') + '</div>' +
                '<div class="char-card-info">' +
                    '<div class="char-card-name">' + u.name + (u.isHero ? ' <span class="hero-tag">主角</span>' : '') + '</div>' +
                    '<div class="char-card-meta">Lv.' + u.level + ' · ' + wIcon + ' ' + (u.equip && u.equip.weapon ? u.equip.weapon.name : '无兵器') + '</div>' +
                    '<div class="char-card-stats">' +
                        '<span>💪' + Math.floor(u.str) + '</span>' +
                        '<span>💨' + Math.floor(u.agi) + '</span>' +
                        '<span>❤️' + Math.floor(u.vit) + '</span>' +
                        '<span>🍀' + Math.floor(u.luk) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="char-card-arrow">▶</div>' +
            '</div>';
        }
        list.innerHTML = html;
    },

    // 当前正在配置的角色ID
    configTargetId: null,

    openUnitConfig: function(unitId) {
        UI.configTargetId = unitId;
        Game.toScreen('unit-config');
    },
    // ===== 单个角色配置页 =====
    renderUnitConfig: function() {
        if (!Game.state || !this.configTargetId) return;

        var unit = null;
        for (var i = 0; i < Game.state.team.length; i++) {
            if (Game.state.team[i].id === this.configTargetId) {
                unit = Game.state.team[i];
                break;
            }
        }
        if (!unit) return;

        var stats = calcStats(unit);
        var isHero = unit.isHero;

        // 标题
        var titleEl = document.getElementById('unit-config-title');
        if (titleEl) titleEl.textContent = unit.name + ' 的配置';

        var html = '<div class="unit-config-section">';

        // 基本信息
        html += '<div class="unit-info-header">' +
            '<div class="unit-big-avatar">' + (unit.avatar || '👤') + '</div>' +
            '<div class="unit-basic-info">' +
                '<div class="unit-name">' + unit.name + (isHero ? ' <span class="hero-tag">主角</span>' : '') + '</div>' +
                '<div class="unit-level">Lv.' + unit.level + (isHero && unit.freePoints ? ' · 可分配属性: ' + unit.freePoints + '点' : '') + '</div>' +
            '</div>' +
        '</div>';

        // 属性面板
        html += '<div class="unit-attr-panel">' +
            '<h4>📊 属性</h4>' +
            '<div class="attr-grid">' +
                '<div class="attr-cell"><span class="attr-label">💪 臂力</span><span class="attr-value">' + Math.floor(unit.str) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">💨 身法</span><span class="attr-value">' + Math.floor(unit.agi) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">❤️ 根骨</span><span class="attr-value">' + Math.floor(unit.vit) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">🍀 福气</span><span class="attr-value">' + Math.floor(unit.luk) + '</span></div>' +
            '</div>' +
            '<div class="derived-stats">' +
                '<span>⚔️ 攻击 ' + stats.atk + '</span>' +
                '<span>🛡️ 防御 ' + stats.def + '</span>' +
                '<span>⚡ 速度 ' + stats.spd + '</span>' +
                '<span>🎯 命中 ' + stats.hit + '%</span>' +
                '<span>💫 闪避 ' + stats.dodge + '%</span>' +
                '<span>💥 暴击 ' + stats.crit + '%</span>' +
            '</div>';

        // 主角可分配属性点
        if (isHero && unit.freePoints > 0) {
            html += '<div class="free-points-panel">' +
                '<h5>分配属性点（剩余 ' + unit.freePoints + ' 点）</h5>' +
                '<div class="point-buttons">' +
                    '<button onclick="Game.assignAttr(\'str\', 1)">💪 臂力 +1</button>' +
                    '<button onclick="Game.assignAttr(\'agi\', 1)">💨 身法 +1</button>' +
                    '<button onclick="Game.assignAttr(\'vit\', 1)">❤️ 根骨 +1</button>' +
                    '<button onclick="Game.assignAttr(\'luk\', 1)">🍀 福气 +1</button>' +
                '</div>' +
            '</div>';
        }
        html += '</div>';

        // 兵器装备
        html += '<div class="unit-weapon-panel">' +
            '<h4>⚔️ 兵器</h4>';
        var cw = unit.equip && unit.equip.weapon;
        if (cw) {
            var wt = GAME_DATA.weaponTypes[cw.type];
            html += '<div class="current-weapon">' +
                '<span class="weapon-icon-big">' + (wt ? wt.icon : '⚔️') + '</span>' +
                '<div class="weapon-info">' +
                    '<div class="weapon-name">' + cw.name + '</div>' +
                    '<div class="weapon-meta">' + (wt ? wt.name : '') + ' · 攻击+' + cw.atk + '</div>' +
                '</div>' +
            '</div>';
        } else {
            html += '<div class="current-weapon">未装备兵器</div>';
        }

        // 兵器更换列表
        html += '<h5>更换兵器</h5><div class="weapon-change-grid">';
        var inv = Game.state.hero.inventory;
        var hasAny = false;
        for (var wid in inv) {
            if (!inv.hasOwnProperty(wid)) continue;
            var wItem = null;
            if (GAME_DATA.baseWeapons[wid]) wItem = GAME_DATA.baseWeapons[wid];
            if (!wItem) {
                for (var fi = 0; fi < GAME_DATA.forgeList.length; fi++) {
                    if (GAME_DATA.forgeList[fi].id === wid) {
                        wItem = GAME_DATA.forgeList[fi];
                        break;
                    }
                }
            }
            if (wItem) {
                // 武将检查武器类型限制
                if (!isHero && unit.weapon && unit.weapon !== wItem.type) continue;
                hasAny = true;
                var wtt = GAME_DATA.weaponTypes[wItem.type];
                var isEquipped = cw && cw.id === wItem.id;
                html += '<div class="weapon-change-item ' + (isEquipped ? 'equipped' : '') + '" ' +
                    (isEquipped ? '' : 'onclick="Game.equipWeaponFor(\'' + unit.id + '\', \'' + wid + '\')"') + '>' +
                    '<span class="w-icon">' + (wtt ? wtt.icon : '⚔️') + '</span>' +
                    '<div class="w-name">' + wItem.name + '</div>' +
                    '<div class="w-atk">攻击+' + wItem.atk + '</div>' +
                    (isEquipped ? '<div class="equipped-mark">✓ 已装备</div>' : '') +
                '</div>';
            }
        }
        if (!hasAny) html += '<div style="color:#999;font-size:13px;">背包中没有可装备的兵器</div>';
        html += '</div></div>';

        // 技能面板（主角可编辑，武将只读）
        html += '<div class="unit-skill-panel">' +
            '<h4>🔥 技能</h4>';

        if (isHero) {
            // 主角：显示已装备技能槽位 + 可更换
            html += '<div class="skill-slots">' +
                '<h5>出战技能</h5>';
            for (var si = 0; si < 2; si++) {
                var sid = unit.equippedSkills[si];
                var sName = '空槽位';
                var sDesc = '点击选择技能';
                if (sid) {
                    for (var sk = 0; sk < unit.knownSkills.length; sk++) {
                        if (unit.knownSkills[sk].id === sid) {
                            sName = unit.knownSkills[sk].name;
                            sDesc = unit.knownSkills[sk].desc + ' · ' + unit.knownSkills[sk].cost + 'MP · CD' + unit.knownSkills[sk].cd;
                            break;
                        }
                    }
                }
                html += '<div class="skill-slot" onclick="UI.showSkillSelectModal(' + si + ')">' +
                    '<div class="slot-label">技能 ' + (si + 1) + '</div>' +
                    '<div class="slot-skill-name">' + sName + '</div>' +
                    '<div class="slot-skill-desc">' + sDesc + '</div>' +
                '</div>';
            }
            html += '</div>';

            // 奥义
            html += '<div class="ult-slot">' +
                '<h5>出战奥义</h5>';
            var uid = unit.equippedUlt;
            var uName = '空槽位';
            var uDesc = '点击选择奥义';
            if (uid) {
                for (var uk = 0; uk < unit.knownUlts.length; uk++) {
                    if (unit.knownUlts[uk].id === uid) {
                        uName = unit.knownUlts[uk].name;
                        uDesc = unit.knownUlts[uk].desc;
                        break;
                    }
                }
            }
            html += '<div class="skill-slot" onclick="UI.showUltSelectModal()">' +
                '<div class="slot-label">奥义</div>' +
                '<div class="slot-skill-name">' + uName + '</div>' +
                '<div class="slot-skill-desc">' + uDesc + '</div>' +
            '</div>';
            html += '</div>';
        } else {
            // 武将：只读显示
            html += '<div class="hero-skills-readonly">' +
                '<div class="skill-item"><b>技能1：</b>' + unit.skills.skill1.name + '<br><small>' + unit.skills.skill1.desc + '</small></div>' +
                '<div class="skill-item"><b>技能2：</b>' + unit.skills.skill2.name + '<br><small>' + unit.skills.skill2.desc + '</small></div>' +
            '</div>';
            if (unit.bondLevel >= 2) {
                html += '<div class="ult-readonly">' +
                    '<b>奥义：</b>' + unit.skills.ult.name + '<br><small>' + unit.skills.ult.desc + '</small>' +
                '</div>';
            } else {
                html += '<div class="ult-locked">🔒 奥义未解锁（羁绊Lv.2开启）</div>';
            }
        }
        html += '</div>';

        // 羁绊（武将）
        if (!isHero) {
            html += '<div class="unit-bond-panel">' +
                '<h4>💝 羁绊</h4>' +
                '<div class="bond-level">Lv.' + (unit.bondLevel || 0) + ' / 5</div>' +
                '<div class="bond-bar"><div class="bond-fill" style="width:' + (((unit.bondExp || 0) / (GAME_DATA.bondConfig.expNeed[(unit.bondLevel || 0) + 1] || 1)) * 100) + '%"></div></div>' +
                '<div class="bond-rewards">';
            for (var bl = 1; bl <= 5; bl++) {
                var reward = GAME_DATA.bondConfig.rewards[bl];
                var unlocked = (unit.bondLevel || 0) >= bl;
                html += '<div class="bond-reward ' + (unlocked ? 'unlocked' : 'locked') + '">' +
                    '<b>Lv.' + bl + '</b> ' +
                    (reward.unlockUlt ? '🌟 解锁奥义' : '') +
                    (reward.learnSkill ? '📖 主角可学技能' : '') +
                    (reward.statBonus ? '💪 全属性+10%' : '') +
                    (bl === 1 ? '🎁 初次相识礼' : '') +
                '</div>';
            }
            html += '</div>';
            if (unit.bondLevel >= 4) {
                var hero = Game.state.hero;
                var ultId = unit.skills.ult.id || (unit.id + '_ult');
                var hasLearned = false;
                for (var hi = 0; hi < hero.knownUlts.length; hi++) {
                    if (hero.knownUlts[hi].id === ultId) { hasLearned = true; break; }
                }
                if (!hasLearned) {
                    html += '<button class="btn-primary" onclick="Game.learnHeroSkill(\'' + unit.id + '\')">📖 学习该武将奥义</button>';
                } else {
                    html += '<div style="color:#6b8e6b;font-size:13px;">✓ 已学会该武将奥义</div>';
                }
            }
            html += '</div>';
        }

        html += '</div>';

        var contentEl = document.getElementById('unit-config-content');
        if (contentEl) contentEl.innerHTML = html;
    },

    // 主角技能选择弹窗
    showSkillSelectModal: function(slotIndex) {
        var hero = Game.state.hero;
        if (!hero.knownSkills || hero.knownSkills.length === 0) {
            UI.showModal('提示', '暂无可用技能');
            return;
        }
        var content = '<div style="max-height:300px;overflow-y:auto;">';
        for (var i = 0; i < hero.knownSkills.length; i++) {
            var sk = hero.knownSkills[i];
            var equipped = false;
            for (var j = 0; j < hero.equippedSkills.length; j++) {
                if (hero.equippedSkills[j] === sk.id) { equipped = true; break; }
            }
            content += '<div style="padding:8px;border-bottom:1px solid #333;' + (equipped ? 'opacity:0.5;' : 'cursor:pointer;') + '" ' +
                (equipped ? '' : 'onclick="UI.closeModal();Game.equipSkill(' + slotIndex + ', \'' + sk.id + '\');UI.renderUnitConfig();"') + '>' +
                '<b>' + sk.name + '</b> ' + (equipped ? '<span style="color:#999">[已装备]</span>' : '') + '<br>' +
                '<small style="color:#999">' + sk.desc + ' · ' + sk.cost + 'MP · CD' + sk.cd + '</small>' +
            '</div>';
        }
        content += '</div>';
        UI.showModal('选择技能', content);
    },

    // 主角奥义选择弹窗
    showUltSelectModal: function() {
        var hero = Game.state.hero;
        if (!hero.knownUlts || hero.knownUlts.length === 0) {
            UI.showModal('提示', '暂无可用奥义<br><small>提升武将羁绊至2级可解锁其奥义</small>');
            return;
        }
        var content = '<div style="max-height:300px;overflow-y:auto;">';
        for (var i = 0; i < hero.knownUlts.length; i++) {
            var ul = hero.knownUlts[i];
            var equipped = hero.equippedUlt === ul.id;
            content += '<div style="padding:8px;border-bottom:1px solid #333;' + (equipped ? 'opacity:0.5;' : 'cursor:pointer;') + '" ' +
                (equipped ? '' : 'onclick="UI.closeModal();Game.equipUlt(\'' + ul.id + '\');UI.renderUnitConfig();"') + '>' +
                '<b>' + ul.name + '</b> ' + (equipped ? '<span style="color:#999">[已装备]</span>' : '') + '<br>' +
                '<small style="color:#999">' + ul.desc + '</small>' +
            '</div>';
        }
        content += '</div>';
        UI.showModal('选择奥义', content);
    },

    // 点击技能池中的技能，装备到第一个空槽位（旧版兼容）
    equipSkillToSlot: function(skillId) {
        var hero = Game.state.hero;
        for (var i = 0; i < hero.equippedSkills.length; i++) {
            if (!hero.equippedSkills[i]) {
                Game.equipSkill(i, skillId);
                return;
            }
        }
        Game.equipSkill(0, skillId);
    }
};
