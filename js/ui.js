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

        var html = '<h4 style="margin-bottom:10px;color:#5a4a3a;">当前队伍（顺序即站位）</h4>';

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
                '<div class="position-controls" style="display:flex;flex-direction:column;gap:4px;margin-left:auto;">' +
                    (j > 0 ? '<button onclick="UI.moveTeamMember(' + j + ', -1)">⬆️</button>' : '<button disabled>⬆️</button>') +
                    (j < Game.state.team.length - 1 ? '<button onclick="UI.moveTeamMember(' + j + ', 1)">⬇️</button>' : '<button disabled>⬇️</button>') +
                '</div>' +
            '</div>';
        }

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

    moveTeamMember: function(index, direction) {
        var team = Game.state.team;
        var newIndex = index + direction;
        if (newIndex < 0 || newIndex >= team.length) return;
        var temp = team[index];
        team[index] = team[newIndex];
        team[newIndex] = temp;
        Game.saveGame();
        this.renderHeroes();
    },

    selectFormation: function(fid) {
        Game.state.currentFormation = fid;
        Game.saveGame();
        this.renderHeroes();
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
                q.completed = true;
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
            html += '<div class="task-item ' + (completed ? 'completed' : '') + '">' +
                '<div class="task-title">' +
                    '<span>' + q.name + '</span>' +
                '</div>' +
                '<div class="task-desc">' + q.desc + '</div>' +
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

    // ===== 主角配置界面 =====
    renderConfig: function() {
        if (!Game.state) return;
        var hero = Game.state.hero;
        var stats = calcStats(hero);

        // --- 兵器 ---
        var weaponDisplay = document.getElementById('config-weapon-display');
        var weaponList = document.getElementById('config-weapon-list');
        if (weaponDisplay) {
            var cw = hero.equip && hero.equip.weapon;
            var wTypeName = '无';
            if (cw && cw.type && GAME_DATA.weaponTypes[cw.type]) {
                wTypeName = GAME_DATA.weaponTypes[cw.type].name;
            }
            weaponDisplay.innerHTML = '<div class="config-current-weapon">' +
                '<span class="weapon-big-icon">' + (cw ? (GAME_DATA.weaponTypes[cw.type] ? GAME_DATA.weaponTypes[cw.type].icon : '⚔️') : '❓') + '</span>' +
                '<div><b>' + (cw ? cw.name : '无兵器') + '</b><br><small>' + wTypeName + ' · 攻击+' + (cw ? cw.atk : 0) + '</small></div>' +
            '</div>';
        }
        if (weaponList) {
            var inv = hero.inventory;
            var wHtml = '<h5>背包中的兵器（点击装备）</h5><div class="config-weapon-grid">';
            var hasWeapon = false;
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
                    hasWeapon = true;
                    var wt = GAME_DATA.weaponTypes[wItem.type];
                    wHtml += '<div class="config-weapon-item" onclick="Game.equipWeapon(\'' + wid + '\')">' +
                        '<span class="w-icon">' + (wt ? wt.icon : '⚔️') + '</span>' +
                        '<div class="w-name">' + wItem.name + '</div>' +
                        '<div class="w-atk">攻击+' + wItem.atk + '</div>' +
                    '</div>';
                }
            }
            if (!hasWeapon) wHtml += '<div style="color:#999">背包中没有其他兵器</div>';
            wHtml += '</div>';
            weaponList.innerHTML = wHtml;
        }

        // --- 属性分配 ---
        var freePointsEl = document.getElementById('config-free-points');
        var attrList = document.getElementById('config-attr-list');
        if (freePointsEl) freePointsEl.textContent = '(剩余' + (hero.freePoints || 0) + '点)';
        if (attrList) {
            var attrHtml = '<div class="config-attr-row"><span>💪 臂力 ' + hero.str + '</span>' +
                (hero.freePoints > 0 ? '<button onclick="Game.assignAttr(\'str\', 1)">+</button>' : '') + '</div>' +
                '<div class="config-attr-row"><span>💨 身法 ' + hero.agi + '</span>' +
                (hero.freePoints > 0 ? '<button onclick="Game.assignAttr(\'agi\', 1)">+</button>' : '') + '</div>' +
                '<div class="config-attr-row"><span>❤️ 根骨 ' + hero.vit + '</span>' +
                (hero.freePoints > 0 ? '<button onclick="Game.assignAttr(\'vit\', 1)">+</button>' : '') + '</div>' +
                '<div class="config-attr-row"><span>🍀 福气 ' + hero.luk + '</span>' +
                (hero.freePoints > 0 ? '<button onclick="Game.assignAttr(\'luk\', 1)">+</button>' : '') + '</div>';
            attrList.innerHTML = attrHtml;
        }

        // --- 技能配置 ---
        var skillSlots = document.getElementById('config-skill-slots');
        var skillPool = document.getElementById('config-skill-pool');
        if (skillSlots) {
            var sHtml = '<h5>出战技能（2个）</h5>';
            for (var si = 0; si < 2; si++) {
                var sid = hero.equippedSkills[si];
                var sName = '空';
                var sDesc = '';
                if (sid) {
                    for (var sk = 0; sk < hero.knownSkills.length; sk++) {
                        if (hero.knownSkills[sk].id === sid) {
                            sName = hero.knownSkills[sk].name;
                            sDesc = hero.knownSkills[sk].desc;
                            break;
                        }
                    }
                }
                sHtml += '<div class="config-slot ' + (sid ? 'filled' : 'empty') + '">' +
                    '<b>槽位' + (si + 1) + ':</b> ' + sName +
                    (sDesc ? '<br><small>' + sDesc + '</small>' : '') +
                '</div>';
            }
            skillSlots.innerHTML = sHtml;
        }
        if (skillPool) {
            var pHtml = '<h5>可用技能（点击装备到空槽位）</h5><div class="config-skill-grid">';
            if (hero.knownSkills.length === 0) {
                pHtml += '<div style="color:#999">暂无可用技能</div>';
            } else {
                for (var ki = 0; ki < hero.knownSkills.length; ki++) {
                    var ks = hero.knownSkills[ki];
                    var equipped = false;
                    for (var ej = 0; ej < hero.equippedSkills.length; ej++) {
                        if (hero.equippedSkills[ej] === ks.id) { equipped = true; break; }
                    }
                    pHtml += '<div class="config-skill-item ' + (equipped ? 'equipped' : '') + '" ' +
                        (equipped ? '' : 'onclick="UI.equipSkillToSlot(\'' + ks.id + '\')"') + '>' +
                        '<b>' + ks.name + '</b><br>' +
                        '<small>' + ks.desc + '</small><br>' +
                        '<small style="color:#999">' + ks.cost + 'MP · CD' + ks.cd + '</small>' +
                    '</div>';
                }
            }
            pHtml += '</div>';
            skillPool.innerHTML = pHtml;
        }

        // --- 奥义配置 ---
        var ultSlot = document.getElementById('config-ult-slot');
        var ultPool = document.getElementById('config-ult-pool');
        if (ultSlot) {
            var uHtml = '<h5>出战奥义（1个）</h5>';
            var uid = hero.equippedUlt;
            var uName = '空';
            var uDesc = '';
            if (uid) {
                for (var uk = 0; uk < hero.knownUlts.length; uk++) {
                    if (hero.knownUlts[uk].id === uid) {
                        uName = hero.knownUlts[uk].name;
                        uDesc = hero.knownUlts[uk].desc;
                        break;
                    }
                }
            }
            uHtml += '<div class="config-slot ' + (uid ? 'filled' : 'empty') + '">' +
                '<b>奥义槽:</b> ' + uName +
                (uDesc ? '<br><small>' + uDesc + '</small>' : '') +
            '</div>';
            ultSlot.innerHTML = uHtml;
        }
        if (ultPool) {
            var upHtml = '<h5>可用奥义（点击装备）</h5><div class="config-ult-grid">';
            if (hero.knownUlts.length === 0) {
                upHtml += '<div style="color:#999">暂无可用奥义<br><small>提升武将羁绊至2级可解锁其奥义</small></div>';
            } else {
                for (var ui = 0; ui < hero.knownUlts.length; ui++) {
                    var ku = hero.knownUlts[ui];
                    var equipped = hero.equippedUlt === ku.id;
                    upHtml += '<div class="config-ult-item ' + (equipped ? 'equipped' : '') + '" ' +
                        (equipped ? '' : 'onclick="Game.equipUlt(\'' + ku.id + '\')"') + '>' +
                        '<b>' + ku.name + '</b><br>' +
                        '<small>' + ku.desc + '</small>' +
                    '</div>';
                }
            }
            upHtml += '</div>';
            ultPool.innerHTML = upHtml;
        }
    },

    // 点击技能池中的技能，装备到第一个空槽位
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
