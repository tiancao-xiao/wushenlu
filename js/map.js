// ===== 地图探索系统（网格迷宫） =====
// 【设计快照 2026-07-30】
// 状态：currentPos{x,y}, visitedCells[], defeatedCells[]
// 移动：上下左右，遇到 battle/elite/boss 未击败则拦截

var Map = {
    init: function() {
        if (!Game.state) return;

        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        if (!chapter) {
            UI.showModal('恭喜！', '你已经通关了所有已开放的章节！');
            return;
        }

        document.getElementById('map-chapter-title').textContent = '第' + chapter.id + '章 ' + chapter.name;

        // 初始化新存档的地图状态
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

    // 标记当前位置为已探索
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

    // 渲染整个迷宫网格（查看全图用）
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

    // 渲染当前位置+四方向（常规视图）
    renderMap: function(chapter) {
        var gridEl = document.getElementById('map-grid');
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        var visited = Game.state.visitedCells;
        var defeated = Game.state.defeatedCells;

        // 四周相邻格子
        var dirs = [
            { key: 'up',    dx: 0,  dy: -1, label: '⬆️ 上' },
            { key: 'down',  dx: 0,  dy: 1,  label: '⬇️ 下' },
            { key: 'left',  dx: -1, dy: 0,  label: '⬅️ 左' },
            { key: 'right', dx: 1,  dy: 0,  label: '➡️ 右' }
        ];

        var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px;">';

        // 上
        html += this.renderDirButton(chapter, pos, dirs[0], visited, defeated);

        // 中排：左 + 当前 + 右
        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += this.renderDirButton(chapter, pos, dirs[2], visited, defeated);
        // 当前格子大显示
        var curIcon = cell ? cell.icon : '⬜';
        html += '<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;border-radius:8px;background:#d4a843;color:#fff;font-size:32px;border:3px solid #fff;">' + curIcon + '</div>';
        html += this.renderDirButton(chapter, pos, dirs[3], visited, defeated);
        html += '</div>';

        // 下
        html += this.renderDirButton(chapter, pos, dirs[1], visited, defeated);

        html += '</div>';
        gridEl.innerHTML = html;

        // 绑定方向按钮事件（因为用了onclick内联不太好处理chapter引用，用事件委托）
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
        var isDefeated = false;
        for (var j = 0; j < defeated.length; j++) {
            if (defeated[j] === key) { isDefeated = true; break; }
        }

        var isBlocked = (ncell.type === 'battle' || ncell.type === 'elite' || ncell.type === 'boss') && !isDefeated;
        var style = 'width:56px;height:56px;display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:6px;cursor:pointer;font-size:12px;';
        if (isBlocked) {
            style += 'background:#c2392b;color:#fff;border:2px solid #fff;';
        } else if (isVisited) {
            style += 'background:#4a7ab8;color:#fff;border:2px solid #666;';
        } else {
            style += 'background:#333;color:#aaa;border:2px solid #555;';
        }

        var label = dir.label;
        if (isBlocked) label += '<br>🚫';

        return '<div data-dir="' + dir.key + '" style="' + style + '">' + label + '<br><span style="font-size:16px;">' + ncell.icon + '</span></div>';
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

        // 检查是否被怪拦住
        var defeated = Game.state.defeatedCells;
        var isDefeated = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === key) { isDefeated = true; break; }
        }
        if ((cell.type === 'battle' || cell.type === 'elite' || cell.type === 'boss') && !isDefeated) {
            UI.showModal('遭遇敌人', '前方有 ' + (cell.desc || '敌人') + '，必须击败才能通过！');
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

        descEl.innerHTML = '<b>' + cell.icon + ' ' + (cell.type === 'start' ? '起点' : cell.type === 'boss' ? 'BOSS' : cell.type === 'battle' ? '战斗' : cell.type === 'elite' ? '精英' : cell.type === 'chest' ? '宝箱' : cell.type === 'npc' ? 'NPC' : '空地') + '</b><br>' + cell.desc;

        var actionsHtml = '';

        switch (cell.type) {
            case 'start':
                actionsHtml = '<button onclick="Map.healAll()">休息恢复</button>';
                break;
            case 'empty':
                actionsHtml = '';
                break;
            case 'battle':
            case 'elite':
                actionsHtml = '<button onclick="Map.startBattle(\'' + cell.enemy + '\', ' + (cell.count || 1) + ')">迎战</button>';
                break;
            case 'boss':
                actionsHtml = '<button onclick="Map.startBossBattle()">挑战Boss</button>';
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

        actionsHtml += '<button class="secondary" onclick="Map.toggleMapView()">查看全图</button>';
        actionsEl.innerHTML = actionsHtml;
    },

    // 切换常规视图/全图视图
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
        // 记录当前战斗的格子，以便胜利后标记为已击败
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
        UI.showModal(name, cell.dialog || '...');
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

    // 进入下一章
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
