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
            } else if (GAME_DATA.items && GAME_DATA.items[id]) {
                item = GAME_DATA.items[id];
                category = 'item';
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
        var buttons = '';
        if (id.indexOf('miji_') === 0) {
            buttons = '<button class="btn-confirm" onclick="Game.useMiji(\'' + id + '\'); UI.closeModal();">研读</button>';
        }

        if (buttons) {
            this.showModal(item.name, desc + '<br><br>持有数量：' + count, buttons);
        } else {
            this.showModal(item.name, desc + '<br><br>持有数量：' + count);
        }
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
        var detail = document.getElementById('config-detail');
        if (detail) detail.style.display = 'none';
        if (list) list.style.display = 'block';

        var html = '';
        if (!Game.state) return;
        var list = document.getElementById('config-char-list');
        if (!list) return;
        var detail = document.getElementById('config-detail');
        if (detail) detail.style.display = 'none';

        var html = '';
        for (var i = 0; i < Game.state.team.length; i++) {
            var u = Game.state.team[i];
            var wIcon = '?';
            if (u.equip && u.equip.weapon && u.equip.weapon.type) {
                var wt = GAME_DATA.weaponTypes[u.equip.weapon.type];
                if (wt) wIcon = wt.icon;
            }
            html += '<div class="config-char-card" onclick="UI.openConfigDetail(' + "'" + u.id + "'" + ')">' +
                '<div class="char-card-avatar">' + (u.avatar || '\ud83d\udc64') + '</div>' +
                '<div class="char-card-info">' +
                    '<div class="char-card-name">' + u.name + (u.isHero ? ' <span class="hero-tag">\u4e3b\u89d2</span>' : '') + '</div>' +
                    '<div class="char-card-meta">Lv.' + u.level + ' &middot; ' + wIcon + ' ' + (u.equip && u.equip.weapon ? u.equip.weapon.name : '\u65e0\u5175\u5668') + '</div>' +
                    '<div class="char-card-stats">' +
                        '<span>\ud83d\udcaa' + Math.floor(u.str) + '</span>' +
                        '<span>\ud83d\udca8' + Math.floor(u.agi) + '</span>' +
                        '<span>\u2764\ufe0f' + Math.floor(u.vit) + '</span>' +
                        '<span>\ud83c\udf40' + Math.floor(u.luk) + '</span>' +
                    '</div>' +
                '</div>' +
                '<div class="char-card-arrow">&gt;</div>' +
            '</div>';
        }
        list.innerHTML = html;
    },

    openConfigDetail: function(unitId) {
        var list = document.getElementById('config-char-list');
        var detail = document.getElementById('config-detail');
        if (list) list.style.display = 'none';
        if (detail) detail.style.display = 'block';
        UI.renderConfigDetail(unitId);
    },

    closeConfigDetail: function() {
        var list = document.getElementById('config-char-list');
        var detail = document.getElementById('config-detail');
        if (list) list.style.display = 'block';
        if (detail) detail.style.display = 'none';
    },

    renderConfigDetail: function(unitId) {
        if (!Game.state || !unitId) return;

        var unit = null;
        for (var i = 0; i < Game.state.team.length; i++) {
            if (Game.state.team[i].id === unitId) {
                unit = Game.state.team[i];
                break;
            }
        }
        if (!unit) return;

        var stats = calcStats(unit);
        var isHero = unit.isHero;

        var titleEl = document.getElementById('config-detail-title');
        if (titleEl) titleEl.textContent = unit.name + ' \u7684\u914d\u7f6e';

        var html = '<div class="config-detail-section">';

        // \u57fa\u672c\u4fe1\u606f
        html += '<div class="unit-info-header">' +
            '<div class="unit-big-avatar">' + (unit.avatar || '\ud83d\udc64') + '</div>' +
            '<div class="unit-basic-info">' +
                '<div class="unit-name">' + unit.name + (isHero ? ' <span class="hero-tag">\u4e3b\u89d2</span>' : '') + '</div>' +
                '<div class="unit-level">Lv.' + unit.level + (isHero && unit.freePoints ? ' &middot; \u53ef\u5206\u914d\u5c5e\u6027: ' + unit.freePoints + '\u70b9' : '') + '</div>' +
            '</div>' +
        '</div>';

        // \u5c5e\u6027\u9762\u677f
        html += '<div class="unit-attr-panel">' +
            '<h4>\ud83d\udcca \u5c5e\u6027</h4>' +
            '<div class="attr-grid">' +
                '<div class="attr-cell"><span class="attr-label">\ud83d\udcaa \u81c2\u529b</span><span class="attr-value">' + Math.floor(unit.str) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">\ud83d\udca8 \u8eab\u6cd5</span><span class="attr-value">' + Math.floor(unit.agi) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">\u2764\ufe0f \u6839\u9aa8</span><span class="attr-value">' + Math.floor(unit.vit) + '</span></div>' +
                '<div class="attr-cell"><span class="attr-label">\ud83c\udf40 \u798f\u6c14</span><span class="attr-value">' + Math.floor(unit.luk) + '</span></div>' +
            '</div>' +
            '<div class="derived-stats">' +
                '<span>\u2694\ufe0f \u653b\u51fb ' + stats.atk + '</span>' +
                '<span>\ud83d\udee1\ufe0f \u9632\u5fa1 ' + stats.def + '</span>' +
                '<span>\u26a1 \u901f\u5ea6 ' + stats.spd + '</span>' +
                '<span>\ud83c\udfaf \u547d\u4e2d ' + stats.hit + '%</span>' +
                '<span>\ud83d\udcab \u95ea\u907f ' + stats.dodge + '%</span>' +
                '<span>\ud83d\udca5 \u66b4\u51fb ' + stats.crit + '%</span>' +
            '</div>';

        if (isHero && unit.freePoints > 0) {
            html += '<div class="free-points-panel">' +
                '<h5>\u5206\u914d\u5c5e\u6027\u70b9\uff08\u5269\u4f59 ' + unit.freePoints + ' \u70b9\uff09</h5>' +
                '<div class="point-buttons">' +
                    '<button onclick="Game.assignAttr(' + "'" + 'str' + "'" + ', 1)">\ud83d\udcaa \u81c2\u529b +1</button>' +
                    '<button onclick="Game.assignAttr(' + "'" + 'agi' + "'" + ', 1)">\ud83d\udca8 \u8eab\u6cd5 +1</button>' +
                    '<button onclick="Game.assignAttr(' + "'" + 'vit' + "'" + ', 1)">\u2764\ufe0f \u6839\u9aa8 +1</button>' +
                    '<button onclick="Game.assignAttr(' + "'" + 'luk' + "'" + ', 1)">\ud83c\udf40 \u798f\u6c14 +1</button>' +
                '</div>' +
            '</div>';
        }
        html += '</div>';

        // \u5175\u5668\u88c5\u5907
        html += '<div class="unit-weapon-panel">' +
            '<h4>\u2694\ufe0f \u5175\u5668</h4>';
        var cw = unit.equip && unit.equip.weapon;
        if (cw) {
            var wt = GAME_DATA.weaponTypes[cw.type];
            html += '<div class="current-weapon">' +
                '<span class="weapon-icon-big">' + (wt ? wt.icon : '\u2694\ufe0f') + '</span>' +
                '<div class="weapon-info">' +
                    '<div class="weapon-name">' + cw.name + '</div>' +
                    '<div class="weapon-meta">' + (wt ? wt.name : '') + ' &middot; \u653b\u51fb+' + cw.atk + '</div>' +
                '</div>' +
            '</div>';
        } else {
            html += '<div class="current-weapon">\u672a\u88c5\u5907\u5175\u5668</div>';
        }

        html += '<h5>\u66f4\u6362\u5175\u5668</h5><div class="weapon-change-grid">';
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
                if (!isHero && unit.weapon && unit.weapon !== wItem.type) continue;
                hasAny = true;
                var wtt = GAME_DATA.weaponTypes[wItem.type];
                var isEquipped = cw && cw.id === wItem.id;
                html += '<div class="weapon-change-item ' + (isEquipped ? 'equipped' : '') + '" ' +
                    (isEquipped ? '' : 'onclick="Game.equipWeaponFor(' + "'" + unit.id + "'" + ', ' + "'" + wid + "'" + ')"') + '>' +
                    '<span class="w-icon">' + (wtt ? wtt.icon : '\u2694\ufe0f') + '</span>' +
                    '<div class="w-name">' + wItem.name + '</div>' +
                    '<div class="w-atk">\u653b\u51fb+' + wItem.atk + '</div>' +
                    (isEquipped ? '<div class="equipped-mark">\u2713 \u5df2\u88c5\u5907</div>' : '') +
                '</div>';
            }
        }
        if (!hasAny) html += '<div style="color:#999;font-size:13px;">\u80cc\u5305\u4e2d\u6ca1\u6709\u53ef\u88c5\u5907\u7684\u5175\u5668</div>';
        html += '</div></div>';

        // \u6280\u80fd\u9762\u677f
        html += '<div class="unit-skill-panel">' +
            '<h4>\ud83d\udd25 \u6280\u80fd</h4>';

        if (isHero) {
            html += '<div class="skill-slots">' +
                '<h5>\u51fa\u6218\u6280\u80fd</h5>';
            for (var si = 0; si < 2; si++) {
                var sid = unit.equippedSkills[si];
                var sName = '\u7a7a\u69fd\u4f4d';
                var sDesc = '\u70b9\u51fb\u9009\u62e9\u6280\u80fd';
                if (sid) {
                    for (var sk = 0; sk < unit.knownSkills.length; sk++) {
                        if (unit.knownSkills[sk].id === sid) {
                            sName = unit.knownSkills[sk].name;
                            sDesc = unit.knownSkills[sk].desc + ' &middot; ' + unit.knownSkills[sk].cost + 'MP &middot; CD' + unit.knownSkills[sk].cd;
                            break;
                        }
                    }
                }
                html += '<div class="skill-slot" onclick="UI.showSkillSelectModal(' + si + ')">' +
                    '<div class="slot-label">\u6280\u80fd ' + (si + 1) + '</div>' +
                    '<div class="slot-skill-name">' + sName + '</div>' +
                    '<div class="slot-skill-desc">' + sDesc + '</div>' +
                '</div>';
            }
            html += '</div>';

            html += '<div class="ult-slot">' +
                '<h5>\u51fa\u6218\u5965\u4e49</h5>';
            var uid = unit.equippedUlt;
            var uName = '\u7a7a\u69fd\u4f4d';
            var uDesc = '\u70b9\u51fb\u9009\u62e9\u5965\u4e49';
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
                '<div class="slot-label">\u5965\u4e49</div>' +
                '<div class="slot-skill-name">' + uName + '</div>' +
                '<div class="slot-skill-desc">' + uDesc + '</div>' +
            '</div>';
            html += '</div>';
        } else {
            html += '<div class="hero-skills-readonly">' +
                '<div class="skill-item"><b>\u6280\u80fd1\uff1a</b>' + unit.skills.s1.name + '<br><small>' + unit.skills.s1.desc + '</small></div>' +
                '<div class="skill-item"><b>\u6280\u80fd2\uff1a</b>' + unit.skills.s2.name + '<br><small>' + unit.skills.s2.desc + '</small></div>' +
            '</div>';
            if (unit.bondLevel >= 2) {
                html += '<div class="ult-readonly">' +
                    '<b>\u5965\u4e49\uff1a</b>' + unit.skills.ult.name + '<br><small>' + unit.skills.ult.desc + '</small>' +
                '</div>';
            } else {
                html += '<div class="ult-locked">\ud83d\udd12 \u5965\u4e49\u672a\u89e3\u9501\uff08\u7f81\u7ecaLv.2\u5f00\u542f\uff09</div>';
            }
        }
        html += '</div>';

        // \u7f81\u7eca\uff08\u6b66\u5c06\uff09
        if (!isHero) {
            html += '<div class="unit-bond-panel">' +
                '<h4>\ud83d\udc9d \u7f81\u7eca</h4>' +
                '<div class="bond-level">Lv.' + (unit.bondLevel || 0) + ' / 5</div>' +
                '<div class="bond-bar"><div class="bond-fill" style="width:' + (((unit.bondExp || 0) / (GAME_DATA.bondConfig.expNeed[(unit.bondLevel || 0) + 1] || 1)) * 100) + '%"></div></div>' +
                '<div class="bond-rewards">';
            for (var bl = 1; bl <= 5; bl++) {
                var reward = GAME_DATA.bondConfig.rewards[bl];
                var unlocked = (unit.bondLevel || 0) >= bl;
                html += '<div class="bond-reward ' + (unlocked ? 'unlocked' : 'locked') + '">' +
                    '<b>Lv.' + bl + '</b> ' +
                    (reward.unlockUlt ? '\ud83c\udf1f \u89e3\u9501\u5965\u4e49' : '') +
                    (reward.learnSkill ? '\ud83d\udcd6 \u4e3b\u89d2\u53ef\u5b66\u6280\u80fd' : '') +
                    (reward.statBonus ? '\ud83d\udcaa \u5168\u5c5e\u6027+10%' : '') +
                    (bl === 1 ? '\ud83c\udf81 \u521d\u6b21\u76f8\u8bc6\u793c' : '') +
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
                    html += '<button class="btn-primary" onclick="Game.learnHeroSkill(' + "'" + unit.id + "'" + ')">\ud83d\udcd6 \u5b66\u4e60\u8be5\u6b66\u5c06\u5965\u4e49</button>';
                } else {
                    html += '<div style="color:#6b8e6b;font-size:13px;">\u2713 \u5df2\u5b66\u4f1a\u8be5\u6b66\u5c06\u5965\u4e49</div>';
                }
            }
            html += '</div>';
        }

        html += '</div>';

        var contentEl = document.getElementById('config-detail-content');
        if (contentEl) contentEl.innerHTML = html;
    },

    // 主角技能选择弹窗
    showSkillSelectModal: function(slotIndex) {
        var hero = Game.state.hero;
        var currentWType = hero.equip && hero.equip.weapon && hero.equip.weapon.type ? hero.equip.weapon.type : 'quan';
        var availableSkills = [];
        for (var i = 0; i < hero.knownSkills.length; i++) {
            if (hero.knownSkills[i].weaponType === currentWType) {
                availableSkills.push(hero.knownSkills[i]);
            }
        }
        if (availableSkills.length === 0) {
            UI.showModal('提示', '暂无可用' + (GAME_DATA.weaponTypes[currentWType] ? GAME_DATA.weaponTypes[currentWType].name : '') + '技能<br><small>请在武学界面解锁技能</small>');
            return;
        }
        var content = '<div style="max-height:300px;overflow-y:auto;">';
        for (var i = 0; i < availableSkills.length; i++) {
            var sk = availableSkills[i];
            var equipped = false;
            for (var j = 0; j < hero.equippedSkills.length; j++) {
                if (hero.equippedSkills[j] === sk.id) { equipped = true; break; }
            }
            content += '<div style="padding:8px;border-bottom:1px solid #333;' + (equipped ? 'opacity:0.5;' : 'cursor:pointer;') + '" ' +
                (equipped ? '' : 'onclick="UI.closeModal();Game.equipSkill(' + slotIndex + ', \'' + sk.id + '\');UI.renderConfigDetail(\'hero\');"') + '>' +
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
        var currentWType = hero.equip && hero.equip.weapon && hero.equip.weapon.type ? hero.equip.weapon.type : 'quan';
        var availableUlts = [];
        for (var i = 0; i < hero.knownUlts.length; i++) {
            if (hero.knownUlts[i].weaponType === currentWType) {
                availableUlts.push(hero.knownUlts[i]);
            }
        }
        if (availableUlts.length === 0) {
            UI.showModal('提示', '暂无可用' + (GAME_DATA.weaponTypes[currentWType] ? GAME_DATA.weaponTypes[currentWType].name : '') + '奥义<br><small>请在武学界面解锁奥义</small>');
            return;
        }
        var content = '<div style="max-height:300px;overflow-y:auto;">';
        for (var i = 0; i < availableUlts.length; i++) {
            var ul = availableUlts[i];
            var equipped = hero.equippedUlt === ul.id;
            content += '<div style="padding:8px;border-bottom:1px solid #333;' + (equipped ? 'opacity:0.5;' : 'cursor:pointer;') + '" ' +
                (equipped ? '' : 'onclick="UI.closeModal();Game.equipUlt(\'' + ul.id + '\');UI.renderConfigDetail(\'hero\');"') + '>' +
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
    },
    // ===== 武学界面 =====
    martialTab: 'learned',
    martialWeapon: 'quan',

    showMartialTab: function(tab) {
        this.martialTab = tab;
        var tabs = document.querySelectorAll('.martial-tab');
        for (var i = 0; i < tabs.length; i++) {
            tabs[i].classList.remove('active');
        }
        if (event && event.target) event.target.classList.add('active');
        this.renderMartial();
    },

    selectMartialWeapon: function(wt) {
        this.martialWeapon = wt;
        var btns = document.querySelectorAll('.mw-btn');
        for (var i = 0; i < btns.length; i++) {
            btns[i].classList.remove('active');
        }
        var activeBtn = document.querySelector('.mw-btn[data-wt="' + wt + '"]');
        if (activeBtn) activeBtn.classList.add('active');
        this.renderMartial();
    },

    renderMartial: function() {
        try {
            if (!Game.state) return;
            var hero = Game.state.hero;
            if (!hero) return;
            var container = document.getElementById('martial-content');
            if (!container) return;
            if (!hero.knownSkills) hero.knownSkills = [];
            if (!hero.knownUlts) hero.knownUlts = [];

            var wt = this.martialWeapon;
            var wtInfo = GAME_DATA.weaponTypes[wt];
            var skillList = GAME_DATA.heroSkills[wt] || [];
            var ultList = GAME_DATA.heroUlts[wt] || [];

            if (this.martialTab === 'learned') {
                // === 已习得武学：按当前选中的兵器类型筛选显示 ===
                var knownSkills = [];
                var knownUlts = [];
                for (var i = 0; i < hero.knownSkills.length; i++) {
                    if (hero.knownSkills[i].weaponType === wt) knownSkills.push(hero.knownSkills[i]);
                }
                for (var j = 0; j < hero.knownUlts.length; j++) {
                    if (hero.knownUlts[j].weaponType === wt) knownUlts.push(hero.knownUlts[j]);
                }

                var html = '<div class="martial-title">' + (wtInfo ? wtInfo.icon : '') + ' ' + (wtInfo ? wtInfo.name : wt) + ' — 已习得</div>';
                html += '<div class="martial-columns">';

                // 技能列
                html += '<div class="martial-col"><h4>🔥 技能</h4>';
                if (knownSkills.length === 0) {
                    html += '<div class="martial-empty">暂无已习得的' + (wtInfo ? wtInfo.name : '') + '技能</div>';
                } else {
                    for (var s = 0; s < knownSkills.length; s++) {
                        var ksk = knownSkills[s];
                        html += '<div class="martial-item learned" onclick="UI.showMartialDetail(\'' + ksk.id + '\', \'skill\')">' +
                            '<div class="mi-name">' + ksk.name + '</div>' +
                            '<div class="mi-meta">' + ksk.cost + 'MP · CD' + ksk.cd + '</div>' +
                            '<div class="mi-desc">' + ksk.desc + '</div>' +
                        '</div>';
                    }
                }
                html += '</div>';

                // 奥义列
                html += '<div class="martial-col"><h4>⚡ 奥义</h4>';
                if (knownUlts.length === 0) {
                    html += '<div class="martial-empty">暂无已习得的' + (wtInfo ? wtInfo.name : '') + '奥义</div>';
                } else {
                    for (var u = 0; u < knownUlts.length; u++) {
                        var kul = knownUlts[u];
                        html += '<div class="martial-item ult learned" onclick="UI.showMartialDetail(\'' + kul.id + '\', \'ult\')">' +
                            '<div class="mi-name">' + kul.name + '</div>' +
                            '<div class="mi-desc">' + kul.desc + '</div>' +
                        '</div>';
                    }
                }
                html += '</div>';
                html += '</div>';
                container.innerHTML = html;

            } else {
                // === 待习得武学：按当前选中的兵器类型显示技能链 ===
                var html = '<div class="martial-title">' + (wtInfo ? wtInfo.icon : '') + ' ' + (wtInfo ? wtInfo.name : wt) + ' — 技能链</div>';
                html += '<div class="martial-columns">';

                // 技能链
                html += '<div class="martial-col"><h4>🔥 技能</h4>';
                for (var si = 0; si < skillList.length; si++) {
                    var skT = skillList[si];
                    var hasLearned = false;
                    for (var hj = 0; hj < hero.knownSkills.length; hj++) {
                        if (hero.knownSkills[hj].id === skT.id) { hasLearned = true; break; }
                    }
                    var canUnlock = hero.level >= skT.levelNeed && !hasLearned;
                    html += '<div class="martial-item ' + (hasLearned ? 'learned' : (canUnlock ? 'unlockable' : 'locked')) + '">' +
                        '<div class="mi-name">' + skT.name + ' <span class="mi-level">Lv.' + skT.levelNeed + '</span></div>' +
                        '<div class="mi-meta">' + skT.cost + 'MP · CD' + skT.cd + '</div>' +
                        '<div class="mi-desc">' + skT.desc + '</div>';
                    if (canUnlock) {
                        html += '<button class="btn-unlock" onclick="Game.unlockSkill(\'' + skT.id + '\'); UI.renderMartial();">🔓 解锁</button>';
                    } else if (hasLearned) {
                        html += '<div class="mi-status">✓ 已习得</div>';
                    } else {
                        html += '<div class="mi-status">🔒 需 Lv.' + skT.levelNeed + '</div>';
                    }
                    html += '</div>';
                }
                html += '</div>';

                // 奥义链
                html += '<div class="martial-col"><h4>⚡ 奥义</h4>';
                for (var uli = 0; uli < ultList.length; uli++) {
                    var ulT = ultList[uli];
                    var hasLearnedU = false;
                    for (var hj2 = 0; hj2 < hero.knownUlts.length; hj2++) {
                        if (hero.knownUlts[hj2].id === ulT.id) { hasLearnedU = true; break; }
                    }
                    var canUnlockU = hero.level >= ulT.levelNeed && !hasLearnedU;
                    html += '<div class="martial-item ult ' + (hasLearnedU ? 'learned' : (canUnlockU ? 'unlockable' : 'locked')) + '">' +
                        '<div class="mi-name">' + ulT.name + ' <span class="mi-level">Lv.' + ulT.levelNeed + '</span></div>' +
                        '<div class="mi-desc">' + ulT.desc + '</div>';
                    if (canUnlockU) {
                        html += '<button class="btn-unlock" onclick="Game.unlockUlt(\'' + ulT.id + '\'); UI.renderMartial();">🔓 解锁</button>';
                    } else if (hasLearnedU) {
                        html += '<div class="mi-status">✓ 已习得</div>';
                    } else {
                        html += '<div class="mi-status">🔒 需 Lv.' + ulT.levelNeed + '</div>';
                    }
                    html += '</div>';
                }
                html += '</div>';

                html += '</div>';
                container.innerHTML = html;
            }
        } catch(e) {
            console.error('renderMartial error:', e);
            var c2 = document.getElementById('martial-content');
            if (c2) c2.innerHTML = '<div style="text-align:center;color:#c2392b;padding:40px;">武学界面加载出错，请刷新重试</div>';
        }
    },

    showMartialDetail: function(id, type) {
        var hero = Game.state.hero;
        var item = null;
        if (type === 'skill') {
            for (var i = 0; i < hero.knownSkills.length; i++) {
                if (hero.knownSkills[i].id === id) { item = hero.knownSkills[i]; break; }
            }
        } else {
            for (var j = 0; j < hero.knownUlts.length; j++) {
                if (hero.knownUlts[j].id === id) { item = hero.knownUlts[j]; break; }
            }
        }
        if (!item) return;
        var title = type === 'skill' ? '技能详情' : '奥义详情';
        var content = '<b>' + item.name + '</b><br><br>' + item.desc;
        if (type === 'skill') {
            content += '<br><br>消耗: ' + item.cost + 'MP<br>冷却: ' + item.cd + '回合';
        }
        UI.showModal(title, content);
    },

};
