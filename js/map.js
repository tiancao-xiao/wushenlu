// ===== 地图探索系统 =====
var Map = {
    init: function() {
        if (!Game.state) return;

        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        if (!chapter) {
            UI.showModal('恭喜！', '你已经通关了所有已开放的章节！');
            return;
        }

        document.getElementById('map-chapter-title').textContent = '第' + chapter.id + '章 ' + chapter.name;
        document.getElementById('map-progress').textContent = (Game.state.gridIndex + 1) + '/' + chapter.grids.length;

        this.renderGrid(chapter);
        this.showCurrentEvent(chapter);
    },

    renderGrid: function(chapter) {
        var gridEl = document.getElementById('map-grid');
        var currentIdx = Game.state.gridIndex;
        var visited = Game.state.visitedGrids;

        var html = '';
        for (var i = 0; i < chapter.grids.length; i++) {
            var grid = chapter.grids[i];
            var className = 'map-cell';
            var icon = grid.icon;

            if (i === currentIdx) {
                className += ' current';
                icon = '🎭';
            } else {
                var isVisited = false;
                for (var j = 0; j < visited.length; j++) {
                    if (visited[j] === i) {
                        isVisited = true;
                        break;
                    }
                }
                if (isVisited) {
                    className += ' visited';
                } else if (i > currentIdx + 1) {
                    className += ' locked';
                }
            }

            if (grid.type === 'boss') className += ' boss';
            if (grid.type === 'hidden' && Game.state.hero.luk >= 8) className += ' hidden-found';

            html += '<div class="' + className + '" data-index="' + i + '">' + icon + '</div>';
        }

        gridEl.innerHTML = html;

        var cells = gridEl.querySelectorAll('.map-cell:not(.locked)');
        for (var k = 0; k < cells.length; k++) {
            (function(cell, chapterRef) {
                cell.addEventListener('click', function() {
                    var idx = parseInt(cell.getAttribute('data-index'), 10);
                    Map.moveTo(idx, chapterRef);
                });
            })(cells[k], chapter);
        }
    },

    moveTo: function(index, chapter) {
        var currentIdx = Game.state.gridIndex;

        if (Math.abs(index - currentIdx) > 1) {
            UI.showModal('提示', '只能一格一格前进！');
            return;
        }

        if (index < currentIdx) {
            return;
        }

        if (Game.state.actionPoints < 1) {
            UI.showModal('行动力不足', '你的行动力已耗尽，请等待恢复（每小时恢复10点）或明日再来。');
            return;
        }

        Game.state.actionPoints--;
        Game.state.gridIndex = index;

        this.renderGrid(chapter);
        this.showCurrentEvent(chapter);
        Game.saveGame();
    },

    showCurrentEvent: function(chapter) {
        var idx = Game.state.gridIndex;
        var grid = chapter.grids[idx];
        var descEl = document.getElementById('map-event-desc');
        var actionsEl = document.getElementById('map-actions');

        if (!grid) return;

        descEl.textContent = grid.desc;

        var actionsHtml = '';

        switch (grid.type) {
            case 'start':
                actionsHtml = '<button onclick="Map.healAll()">休息恢复</button>';
                if (idx < chapter.grids.length - 1) {
                    actionsHtml += '<button onclick="Map.moveTo(' + (idx + 1) + ', GAME_DATA.chapters[' + (Game.state.chapter - 1) + '])">前进</button>';
                }
                break;

            case 'empty':
                actionsHtml = this.getMoveButtons(idx, chapter);
                break;

            case 'battle':
            case 'elite':
                actionsHtml = '<button onclick="Map.startBattle(\'' + grid.enemy + '\', ' + (grid.count || 1) + ')">迎战</button>';
                actionsHtml += '<button class="secondary" onclick="' + this.getMoveBack(idx, chapter) + '">后退</button>';
                break;

            case 'boss':
                actionsHtml = '<button onclick="Map.startBossBattle()">挑战Boss</button>';
                break;

            case 'npc':
                actionsHtml = '<button onclick="Map.talkNPC()">对话</button>';
                actionsHtml += this.getMoveButtons(idx, chapter);
                break;

            case 'chest':
                actionsHtml = '<button onclick="Map.openCurrentChest()">打开</button>';
                actionsHtml += this.getMoveButtons(idx, chapter);
                break;

            case 'hidden':
                if (Game.state.hero.luk >= 8) {
                    actionsHtml = '<button onclick="Map.openCurrentChest()">探索</button>';
                } else {
                    descEl.textContent += '\n\n（需要福气≥8才能发现隐藏内容）';
                    actionsHtml = this.getMoveButtons(idx, chapter);
                }
                break;

            case 'recover':
                actionsHtml = '<button onclick="Map.healAll()">恢复状态</button>';
                actionsHtml += this.getMoveButtons(idx, chapter);
                break;

            default:
                actionsHtml = this.getMoveButtons(idx, chapter);
        }

        actionsEl.innerHTML = actionsHtml;
    },

    getMoveButtons: function(idx, chapter) {
        var html = '';
        if (idx > 0) {
            html += '<button class="secondary" onclick="Map.moveTo(' + (idx - 1) + ', GAME_DATA.chapters[' + (Game.state.chapter - 1) + '])">后退</button>';
        }
        if (idx < chapter.grids.length - 1) {
            html += '<button onclick="Map.moveTo(' + (idx + 1) + ', GAME_DATA.chapters[' + (Game.state.chapter - 1) + '])">前进</button>';
        }
        return html;
    },

    getMoveBack: function(idx, chapter) {
        return 'Map.moveTo(' + Math.max(0, idx - 1) + ', GAME_DATA.chapters[' + (Game.state.chapter - 1) + '])';
    },

    startBattle: function(enemyId, count, options) {
        options = options || {};
        Battle.start(enemyId, count, options);
    },

    startBossBattle: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var grid = chapter.grids[Game.state.gridIndex];
        if (!grid) return;

        var options = {};
        if (grid.reward) options.reward = grid.reward;
        if (grid.special) options.survive = grid.special.survive;

        Battle.start(grid.enemy, 1, options);
    },

    openCurrentChest: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var grid = chapter.grids[Game.state.gridIndex];
        this.openChest(grid.reward);
    },

    talkNPC: function() {
        var chapter = GAME_DATA.chapters[Game.state.chapter - 1];
        var grid = chapter.grids[Game.state.gridIndex];
        if (!grid) return;

        var npcNames = {
            cunmin: '村民',
            tiejiang: '老铁匠',
            caocao: '曹操',
            yuanshao: '袁绍'
        };

        var name = npcNames[grid.npc] || '陌生人';
        UI.showModal(name, grid.dialog || '...');
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

        var idx = Game.state.gridIndex;
        var visited = false;
        for (var i = 0; i < Game.state.visitedGrids.length; i++) {
            if (Game.state.visitedGrids[i] === idx) {
                visited = true;
                break;
            }
        }
        if (!visited) {
            Game.state.visitedGrids.push(idx);
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
    }
};
