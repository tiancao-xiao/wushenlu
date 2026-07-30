// ===== 地图探索系统（网格迷宫） =====
// 【设计快照 2026-07-30】
// 状态：currentPos{x,y}, visitedCells[], defeatedCells[]
// 移动：上下左右，走进怪格子后才拦路（必须击败才能离开）
// 小怪：击败后不拦路但不消失，可反复刷

var Map = {
    init: function() {
        if (!Game.state) return;

        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        if (!chapter) {
            UI.showModal('恭喜！', '你已经通关了所有已开放的章节！');
            return;
        }

        document.getElementById('map-chapter-title').textContent = '第' + chapter.id + '章 ' + chapter.name;

        if (!Game.state.currentPos) {
            Game.state.currentPos = { x: chapter.startPos.x, y: chapter.startPos.y };
        }
        if (!Game.state.visitedCells) {
            Game.state.visitedCells = [];
        }
        if (!Game.state.defeatedCells) {
            Game.state.defeatedCells = [];
        }

        this.markVisited();
        this.renderMap(chapter);
        this.showCurrentEvent(chapter);
    },

    markVisited: function() {
        var pos = Game.state.currentPos;
        var key = pos.x + ',' + pos.y;
        var visited = Game.state.visitedCells;
        var found = false;
        for (var i = 0; i < visited.length; i++) {
            if (visited[i] === key) {
                found = true;
                break;
            }
        }
        if (!found) {
            visited.push(key);
        }
    },

    renderFullMap: function(chapter) {
        var gridEl = document.getElementById('map-grid');
        var w = chapter.width;
        var h = chapter.height;
        var visited = Game.state.visitedCells;
        var defeated = Game.state.defeatedCells;

        var html = '<div style="display:grid;grid-template-columns:repeat(' + w + ',40px);gap:4px;margin-bottom:12px;">';
        for (var y = 0; y < h; y++) {
            for (var x = 0; x < w; x++) {
                var key = x + ',' + y;
                var cell = chapter.cells[key];
                var isVisited = false;
                for (var i = 0; i < visited.length; i++) {
                    if (visited[i] === key) { isVisited = true; break; }
                }
                var isDefeated = false;
                for (var j = 0; j < defeated.length; j++) {
                    if (defeated[j] === key) { isDefeated = true; break; }
                }
                var isCurrent = Game.state.currentPos.x === x && Game.state.currentPos.y === y;

                var style = 'width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:18px;';
                if (isCurrent) {
                    style += 'background:#d4a843;color:#fff;border:2px solid #fff;';
                } else if (isVisited) {
                    if (cell && (cell.type === 'battle' || cell.type === 'elite' || cell.type === 'boss')) {
                        style += isDefeated ? 'background:#4a7ab8;color:#fff;' : 'background:#c2392b;color:#fff;';
                    } else if (cell && cell.type === 'chest') {
                        style += 'background:#8b5a9e;color:#fff;';
                    } else if (cell && cell.type === 'npc') {
                        style += 'background:#6b8e6b;color:#fff;';
                    } else {
                        style += 'background:#333;color:#aaa;';
                    }
                } else {
                    style += 'background:#111;color:#333;';
                }

                var icon = isVisited ? (cell ? cell.icon : '⬛') : '❔';
                html += '<div style="' + style + '" title="' + (isVisited && cell ? cell.desc : '未探索') + '">' + icon + '</div>';
            }
        }
        html += '</div>';
        gridEl.innerHTML = html;
    },

    renderMap: function(chapter) {
        var gridEl = document.getElementById('map-grid');
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        var visited = Game.state.visitedCells;
        var defeated = Game.state.defeatedCells;

        var dirs = [
            { key: 'up',    dx: 0,  dy: -1, label: '⬆️ 上' },
            { key: 'down',  dx: 0,  dy: 1,  label: '⬇️ 下' },
            { key: 'left',  dx: -1, dy: 0,  label: '⬅️ 左' },
            { key: 'right', dx: 1,  dy: 0,  label: '➡️ 右' }
        ];

        var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px;">';

        html += this.renderDirButton(chapter, pos, dirs[0], visited, defeated);

        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += this.renderDirButton(chapter, pos, dirs[2], visited, defeated);
        var curIcon = cell ? cell.icon : '⬜';
        html += '<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#d4a843;color:#fff;font-size:32px;border:3px solid #fff;">' + curIcon + '</div>';
        html += this.renderDirButton(chapter, pos, dirs[3], visited, defeated);
        html += '</div>';

        html += this.renderDirButton(chapter, pos, dirs[1], visited, defeated);

        html += '</div>';
        gridEl.innerHTML = html;

        var self = this;
        gridEl.onclick = function(e) {
            var btn = e.target.closest('[data-dir]');
            if (!btn) return;
            var dir = btn.getAttribute('data-dir');
            self.moveDir(dir, chapter);
        };
    },

    renderDirButton: function(chapter, pos, dir, visited, defeated) {
        var nx = pos.x + dir.dx;
        var ny = pos.y + dir.dy;
        var key = nx + ',' + ny;
        var ncell = chapter.cells[key];
        var inBounds = nx >= 0 && nx < chapter.width && ny >= 0 && ny < chapter.height;

        if (!inBounds || !ncell) {
            return '<div style="width:56px;height:56px;"></div>';
        }

        var isVisited = false;
        for (var i = 0; i < visited.length; i++) {
            if (visited[i] === key) { isVisited = true; break; }
        }

        var style = 'width:56px;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;font-size:12px;';
        if (isVisited) {
            style += 'background:#4a7ab8;color:#fff;border:2px solid #666;';
        } else {
            style += 'background:#333;color:#aaa;border:2px solid #555;';
        }

        return '<div data-dir="' + dir.key + '" style="' + style + '">' + dir.label + '<br><span style="font-size:16px;">' + ncell.icon + '</span></div>';
    },

    moveDir: function(dirKey, chapter) {
        var pos = Game.state.currentPos;
        var dx = 0, dy = 0;
        if (dirKey === 'up') dy = -1;
        else if (dirKey === 'down') dy = 1;
        else if (dirKey === 'left') dx = -1;
        else if (dirKey === 'right') dx = 1;

        var nx = pos.x + dx;
        var ny = pos.y + dy;
        var key = nx + ',' + ny;
        var cell = chapter.cells[key];

        if (nx < 0 || nx >= chapter.width || ny < 0 || ny >= chapter.height || !cell) {
            UI.showModal('提示', '此路不通！');
            return;
        }

        // 【关键】检查当前格子是否有未击败的怪——如果有，必须先击败才能离开
        var curKey = pos.x + ',' + pos.y;
        var curCell = chapter.cells[curKey];
        var defeated = Game.state.defeatedCells;
        var curDefeated = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === curKey) { curDefeated = true; break; }
        }
        if (curCell && (curCell.type === 'battle' || curCell.type === 'elite' || curCell.type === 'boss') && !curDefeated) {
            UI.showModal('遭遇敌人', '这里有 ' + (curCell.desc || '敌人') + '，必须先击败它才能离开！');
            return;
        }

        if (Game.state.actionPoints < 1) {
            UI.showModal('行动力不足', '你的行动力已耗尽，请等待恢复（每小时恢复10点）或明日再来。');
            return;
        }

        Game.state.actionPoints--;
        Game.state.currentPos = { x: nx, y: ny };
        this.markVisited();

        this.renderMap(chapter);
        this.showCurrentEvent(chapter);
        Game.saveGame();
    },

    showCurrentEvent: function(chapter) {
        var pos = Game.state.currentPos;
        var key = pos.x + ',' + pos.y;
        var cell = chapter.cells[key];
        var descEl = document.getElementById('map-event-desc');
        var actionsEl = document.getElementById('map-actions');

        if (!cell) return;

        var defeated = Game.state.defeatedCells;
        var isDefeated = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === key) { isDefeated = true; break; }
        }
        var isHostile = (cell.type === 'battle' || cell.type === 'elite' || cell.type === 'boss');
        var isCleared = isHostile && isDefeated;

        descEl.innerHTML = '<b>' + cell.icon + ' ' + (cell.type === 'start' ? '起点' : cell.type === 'boss' ? 'BOSS' : cell.type === 'battle' ? '战斗' : cell.type === 'elite' ? '精英' : cell.type === 'chest' ? '宝箱' : cell.type === 'npc' ? 'NPC' : '空地') + '</b><br>' + cell.desc + (isCleared ? '<br><br><i style="color:#6b8e6b">✓ 已清理（可反复挑战）</i>' : '');

        var actionsHtml = '';

        if (isHostile) {
            if (!isDefeated) {
                // 未击败：只能迎战
                if (cell.type === 'boss') {
                    actionsHtml = '<button onclick="Map.startBossBattle()">挑战Boss</button>';
                } else {
                    actionsHtml = '<button onclick="Map.startBattle(\'' + cell.enemy + '\', ' + (cell.count || 1) + ')">迎战</button>';
                }
            } else {
                // 已击败：仍然可以迎战（反复刷），同时可以离开
                if (cell.type === 'boss') {
                    actionsHtml = '<button onclick="Map.startBossBattle()">再次挑战</button>';
                } else {
                    actionsHtml = '<button onclick="Map.startBattle(\'' + cell.enemy + '\', ' + (cell.count || 1) + ')">再次挑战</button>';
                }
            }
        } else {
            switch (cell.type) {
                case 'start':
                    actionsHtml = '<button onclick="Map.healAll()">休息恢复</button>';
                    break;
                case 'npc':
                    actionsHtml = '<button onclick="Map.talkNPC()">对话</button>';
                    break;
                case 'chest':
                    actionsHtml = '<button onclick="Map.openCurrentChest()">打开</button>';
                    break;
                case 'hidden':
                    if (Game.state.hero.luk >= 8) {
                        actionsHtml = '<button onclick="Map.openCurrentChest()">探索</button>';
                    } else {
                        descEl.innerHTML += '<br><br><i style="color:#999">（需要福气≥8才能发现隐藏内容）</i>';
                    }
                    break;
                case 'recover':
                    actionsHtml = '<button onclick="Map.healAll()">恢复状态</button>';
                    break;
            }
        }

        actionsHtml += '<button class="secondary" onclick="Map.toggleMapView()">查看全图</button>';
        actionsEl.innerHTML = actionsHtml;
    },

    isFullView: false,
    toggleMapView: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        this.isFullView = !this.isFullView;
        if (this.isFullView) {
            this.renderFullMap(chapter);
        } else {
            this.renderMap(chapter);
        }
    },

    startBattle: function(enemyId, count, options) {
        options = options || {};
        options.cellKey = Game.state.currentPos.x + ',' + Game.state.currentPos.y;
        Battle.start(enemyId, count, options);
    },

    startBossBattle: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell) return;

        var options = { cellKey: pos.x + ',' + pos.y };
        if (cell.reward) options.reward = cell.reward;
        if (cell.special) options.survive = cell.special.survive;

        Battle.start(cell.enemy, 1, options);
    },

    markDefeated: function(cellKey) {
        var defeated = Game.state.defeatedCells;
        var found = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === cellKey) { found = true; break; }
        }
        if (!found) {
            defeated.push(cellKey);
        }
        Game.saveGame();
    },

    openCurrentChest: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        this.openChest(cell.reward);
    },

    talkNPC: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell) return;

        var npcNames = {
            cunmin: '村民',
            tiejiang: '老铁匠',
            caocao: '曹操',
            yuanshao: '袁绍'
        };

        var name = npcNames[cell.npc] || '陌生人';
        var content = (cell.dialog || '...');

        // 根据NPC类型添加功能按钮
        var buttons = '<div class="npc-dialog-actions">';

        if (cell.npc === 'tiejiang') {
            // 铁匠：购买材料 + 去铁匠铺
            buttons += '<button onclick="UI.closeModal();Game.toScreen(\'smith\');UI.renderSmith();">去铁匠铺</button>';
            buttons += '<button class="secondary" onclick="Map.buyMaterial()">购买材料</button>';
        }

        // 检查该NPC是否有可提交的任务
        var hasQuest = false;
        for (var i = 0; i < Game.state.quests.length; i++) {
            var q = Game.state.quests[i];
            if (q.completed) continue;
            if (q.npc === cell.npc && q.chapter === chapter.id) {
                hasQuest = true;
                var canSubmit = Game.canCompleteQuest(q);
                buttons += '<button ' + (canSubmit ? '' : 'disabled') + ' onclick="UI.closeModal();Game.submitQuest(\'' + q.id + '\')">' +
                    (canSubmit ? '✓ 提交「' + q.name + '」' : '「' + q.name + '」材料不足') + '</button>';
            }
        }

        buttons += '</div>';

        UI.showModal(name, content + '<br><br>' + buttons);
    },

    buyMaterial: function() {
        var items = [
            { id: 'tiekuang', name: '铁矿', price: 30 },
            { id: 'muchai', name: '木材', price: 20 },
            { id: 'jingtie', name: '精铁矿', price: 80 },
            { id: 'caoyao', name: '草药', price: 15 },
            { id: 'shoupi', name: '兽皮', price: 25 }
        ];
        var html = '<div style="display:flex;flex-direction:column;gap:8px;">';
        for (var i = 0; i < items.length; i++) {
            var it = items[i];
            html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">' +
                '<span>' + it.name + '</span>' +
                '<button onclick="Map.doBuyMaterial(\'' + it.id + '\',' + it.price + ')" style="padding:4px 12px;">' + it.price + '银两</button>' +
            '</div>';
        }
        html += '</div>';
        UI.showModal('购买材料', html);
    },

    doBuyMaterial: function(itemId, price) {
        if (Game.state.silver < price) {
            UI.showModal('提示', '银两不足！需要 ' + price + ' 银两。');
            return;
        }
        Game.state.silver -= price;
        Game.addItem(itemId, 1);
        Game.saveGame();
        UI.showModal('购买成功', '你购买了 ' + (GAME_DATA.materials[itemId] ? GAME_DATA.materials[itemId].name : itemId) + ' ×1');
    },

    openChest: function(reward) {
        if (!reward) {
            UI.showModal('空的', '箱子里什么都没有...');
            return;
        }

        var msg = '你获得了：\n\n';

        if (reward.silver) {
            Game.addSilver(reward.silver);
            msg += '💰 银两 +' + reward.silver + '\n';
        }

        if (reward.exp) {
            for (var i = 0; i < Game.state.team.length; i++) {
                Game.gainExp(Game.state.team[i], reward.exp);
            }
            msg += '⭐ 经验 +' + reward.exp + '\n';
        }

        if (reward.items) {
            for (var i = 0; i < reward.items.length; i++) {
                var parts = reward.items[i].split(':');
                var itemId = parts[0];
                var count = parseInt(parts[1], 10) || 1;
                Game.addItem(itemId, count);
                var mat = GAME_DATA.materials[itemId];
                msg += '📦 ' + (mat ? mat.name : itemId) + ' ×' + count + '\n';
            }
        }

        UI.showModal('获得物品', msg);
        Game.saveGame();

        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        this.showCurrentEvent(chapter);
    },

    healAll: function() {
        for (var i = 0; i < Game.state.team.length; i++) {
            var u = Game.state.team[i];
            var stats = calcStats(u);
            u.hp = stats.maxHp;
            u.mp = stats.maxMp;
        }

        UI.showModal('休息完毕', '全队状态已恢复！');
        Game.saveGame();
    },

    nextChapter: function() {
        Game.state.chapter++;
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        if (chapter) {
            Game.state.currentPos = { x: chapter.startPos.x, y: chapter.startPos.y };
            Game.state.visitedCells = [];
            Game.state.defeatedCells = [];
        }
        Game.saveGame();
        this.init();
    }
};
