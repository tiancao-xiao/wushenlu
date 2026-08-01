// ===== 地图探索系统（网格迷宫） =====
// 【设计快照 2026-08-01】
// 章节选择 → 进入具体章节 → 网格探索
// Boss阶段状态机：支持多阶段Boss战（如张梁→张宝→张角）

var Map = {
    // ===== 章节选择界面 =====
    showChapterSelect: function() {
        if (!Game.state) return;
        var gridEl = document.getElementById('map-grid');
        var descEl = document.getElementById('map-event-desc');
        var actionsEl = document.getElementById('map-actions');
        var titleEl = document.getElementById('map-chapter-title');

        if (titleEl) titleEl.textContent = '选择章节';
        if (descEl) descEl.innerHTML = '<b>请选择要探索的章节</b><br>已通关的章节可以随时返回。';
        if (actionsEl) actionsEl.innerHTML = '';

        var html = '<div style="display:flex;flex-direction:column;gap:12px;padding:8px;">';
        var unlocked = Game.state.unlockedChapters || [1];

        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            var ch = GAME_DATA.chapters[i];
            var isUnlocked = false;
            for (var j = 0; j < unlocked.length; j++) {
                if (unlocked[j] === ch.id) { isUnlocked = true; break; }
            }
            var isCurrent = Game.state.currentChapter === ch.id;
            var isCleared = Game.state.chapter > ch.id;

            var style = 'padding:16px;border-radius:8px;border:2px solid ';
            if (isUnlocked) {
                style += (isCleared ? '#6b8e6b' : '#d4a843') + ';background:rgba(212,168,67,0.1);cursor:pointer;';
            } else {
                style += '#555;background:#222;color:#666;cursor:not-allowed;';
            }

            html += '<div style="' + style + '" ' + (isUnlocked ? 'onclick="Map.enterChapter(' + ch.id + ')"' : '') + '>' +
                '<div style="font-size:18px;font-weight:700;color:' + (isUnlocked ? '#fff' : '#666') + '">' +
                    (isCleared ? '✓ ' : isCurrent ? '▶ ' : isUnlocked ? '○ ' : '🔒 ') +
                    '第' + ch.id + '章 ' + ch.name + '——' + ch.location +
                '</div>' +
                '<div style="font-size:13px;color:#aaa;margin-top:4px;">' + ch.desc + '</div>' +
                (isUnlocked ? '<div style="font-size:12px;color:#d4a843;margin-top:6px;">' + (isCleared ? '已通关 · 可返回探索' : isCurrent ? '当前进度' : '已解锁') + '</div>' : '') +
            '</div>';
        }
        html += '</div>';
        if (gridEl) gridEl.innerHTML = html;
    },

    enterChapter: function(chapterId) {
        Game.state.currentChapter = chapterId;
        Game.saveGame();
        this.init(chapterId, true);
    },

    // ===== 进入具体章节 =====
    init: function(chapterId, resetPos) {
        if (!Game.state) return;
        chapterId = chapterId || Game.state.currentChapter || 1;

        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === chapterId) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) {
            UI.showModal('错误', '章节不存在！');
            return;
        }

        var titleEl = document.getElementById('map-chapter-title');
        if (titleEl) titleEl.textContent = '第' + chapter.id + '章 ' + chapter.name + '——' + chapter.location;

        var chapterStateKey = 'chapter_' + chapterId;
        if (!Game.state.chapterStates) Game.state.chapterStates = {};
        if (!Game.state.chapterStates[chapterStateKey]) {
            Game.state.chapterStates[chapterStateKey] = {
                currentPos: { x: chapter.startPos.x, y: chapter.startPos.y },
                visitedCells: [],
                defeatedCells: []
            };
        } else if (resetPos) {
            Game.state.chapterStates[chapterStateKey].currentPos = { x: chapter.startPos.x, y: chapter.startPos.y };
        }
        var cs = Game.state.chapterStates[chapterStateKey];

        Game.state.currentPos = cs.currentPos;
        Game.state.visitedCells = cs.visitedCells;
        Game.state.defeatedCells = cs.defeatedCells;

        this.markVisited();
        this.renderMap(chapter);
        this.showCurrentEvent(chapter);
    },

    saveChapterState: function() {
        if (!Game.state || !Game.state.currentChapter) return;
        var chapterStateKey = 'chapter_' + Game.state.currentChapter;
        if (!Game.state.chapterStates) Game.state.chapterStates = {};
        Game.state.chapterStates[chapterStateKey] = {
            currentPos: Game.state.currentPos,
            visitedCells: Game.state.visitedCells,
            defeatedCells: Game.state.defeatedCells
        };
        Game.saveGame();
    },

    markVisited: function() {
        var pos = Game.state.currentPos;
        var key = pos.x + ',' + pos.y;
        var visited = Game.state.visitedCells;
        var found = false;
        for (var i = 0; i < visited.length; i++) {
            if (visited[i] === key) { found = true; break; }
        }
        if (!found) visited.push(key);
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

                // Boss阶段状态：显示当前阶段的图标
                var displayIcon = cell ? cell.icon : '⬛';
                if (cell && cell.type === 'boss' && cell.phases && isVisited) {
                    var phaseIndex = Game.state.bossPhaseStates[key] || 0;
                    if (phaseIndex < cell.phases.length) {
                        displayIcon = cell.phases[phaseIndex].icon;
                    }
                }

                var style = 'width:40px;height:40px;display:flex;align-items:center;justify-content:center;border-radius:4px;font-size:18px;';
                if (isCurrent) {
                    style += 'background:#d4a843;color:#fff;border:2px solid #fff;';
                } else if (isVisited) {
                    if (cell && (cell.type === 'battle' || cell.type === 'elite' || cell.type === 'boss')) {
                        // Boss有phases时，全部阶段完成才算defeated
                        var bossDefeated = isDefeated;
                        if (cell.type === 'boss' && cell.phases) {
                            var pi = Game.state.bossPhaseStates[key] || 0;
                            bossDefeated = pi >= cell.phases.length;
                        }
                        style += bossDefeated ? 'background:#4a7ab8;color:#fff;' : 'background:#c2392b;color:#fff;';
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

                var icon = isVisited ? displayIcon : '❔';
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

        // 当前格子的显示图标（Boss阶段状态机）
        var curIcon = cell ? cell.icon : '⬜';
        if (cell && cell.type === 'boss' && cell.phases) {
            var key = pos.x + ',' + pos.y;
            var phaseIndex = Game.state.bossPhaseStates[key] || 0;
            if (phaseIndex < cell.phases.length) {
                curIcon = cell.phases[phaseIndex].icon;
            }
        }

        var html = '<div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:12px;">';

        html += this.renderDirButton(chapter, pos, dirs[0], visited, defeated);

        html += '<div style="display:flex;align-items:center;gap:8px;">';
        html += this.renderDirButton(chapter, pos, dirs[2], visited, defeated);
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

        // 检查当前格子是否有方向封锁
        var curKey = pos.x + ',' + pos.y;
        var curCell = chapter.cells[curKey];
        if (curCell && curCell.blockedDirs) {
            if (curCell.blockedDirs.indexOf(dirKey) !== -1) {
                UI.showModal('提示', '此路不通！');
                return;
            }
        }

        // 检查当前格子是否有未击败的怪——Boss阶段单元格允许自由离开（可回去补给）
        var defeated = Game.state.defeatedCells;
        var curDefeated = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === curKey) { curDefeated = true; break; }
        }
        var isBossWithPhases = curCell && curCell.type === 'boss' && curCell.phases;
        if (!isBossWithPhases && curCell && (curCell.type === 'battle' || curCell.type === 'elite' || curCell.type === 'boss') && !curDefeated) {
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
        this.saveChapterState();

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

        // ===== Boss阶段状态机处理 =====
        if (cell.type === 'boss' && cell.phases) {
            var phaseIndex = Game.state.bossPhaseStates[key] || 0;
            var allCleared = phaseIndex >= cell.phases.length;

            if (allCleared) {
                descEl.innerHTML = '<b>' + cell.icon + ' BOSS</b><br>' + cell.desc + '<br><br><i style="color:#6b8e6b">✓ 太平道已灭，巨鹿重获安宁（可再次挑战最终决战）</i>';
                actionsEl.innerHTML = '<button onclick="Map.startBossPhaseBattle()">再次挑战最终决战</button>' +
                    '<button class="secondary" onclick="Map.toggleMapView()">查看全图</button>' +
                    '<button class="secondary" onclick="Map.showChapterSelect()">返回章节选择</button>';
            } else {
                var phase = cell.phases[phaseIndex];
                descEl.innerHTML = '<b>' + phase.icon + ' ' + phase.name + '</b><br>' + phase.desc;
                actionsEl.innerHTML = '<button onclick="Map.talkBossPhase()">对话</button>' +
                    '<button class="secondary" onclick="Map.toggleMapView()">查看全图</button>' +
                    '<button class="secondary" onclick="Map.showChapterSelect()">返回章节选择</button>';
            }
            return;
        }

        var isHostile = (cell.type === 'battle' || cell.type === 'elite' || cell.type === 'boss');
        var isCleared = isHostile && isDefeated;

        descEl.innerHTML = '<b>' + cell.icon + ' ' + (cell.type === 'start' ? '起点' : cell.type === 'boss' ? 'BOSS' : cell.type === 'battle' ? '战斗' : cell.type === 'elite' ? '精英' : cell.type === 'chest' ? '宝箱' : cell.type === 'npc' ? 'NPC' : '空地') + '</b><br>' + cell.desc + (isCleared ? '<br><br><i style="color:#6b8e6b">✓ 已清理（可反复挑战）</i>' : '');

        var actionsHtml = '';

        if (isHostile) {
            if (!isDefeated) {
                if (cell.type === 'boss') {
                    actionsHtml = '<button onclick="Map.startBossBattle()">挑战Boss</button>';
                } else {
                    actionsHtml = '<button onclick="Map.startBattle(\'' + cell.enemy + '\', ' + (cell.count || 1) + ')">迎战</button>';
                }
            } else {
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
        actionsHtml += '<button class="secondary" onclick="Map.showChapterSelect()">返回章节选择</button>';
        actionsEl.innerHTML = actionsHtml;
    },

    isFullView: false,
    toggleMapView: function() {
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
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
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell) return;

        var options = { cellKey: pos.x + ',' + pos.y };
        if (cell.reward) options.reward = cell.reward;
        if (cell.special) options.survive = cell.special.survive;

        Battle.start(cell.enemy, 1, options);
    },

    // Boss阶段对话与战斗（第一章张梁→张宝→张角）
    talkBossPhase: function() {
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell || !cell.phases) return;

        var key = pos.x + ',' + pos.y;
        var phaseIndex = Game.state.bossPhaseStates[key] || 0;
        if (phaseIndex >= cell.phases.length) return;

        var phase = cell.phases[phaseIndex];
        var content = phase.dialog || '...';
        var buttons = '<div class="npc-dialog-actions">' +
            '<button onclick="UI.closeModal();Map.startBossPhaseBattle()">⚔️ 迎战 ' + phase.name + '</button>' +
            '<button class="secondary" onclick="UI.closeModal()">稍后再来</button>' +
            '</div>';

        UI.showModal(phase.name, content + '<br><br>' + buttons);
    },

    startBossPhaseBattle: function() {
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell || !cell.phases) return;

        var key = pos.x + ',' + pos.y;
        var phaseIndex = Game.state.bossPhaseStates[key] || 0;
        if (phaseIndex >= cell.phases.length) return;

        var phase = cell.phases[phaseIndex];
        var options = {
            cellKey: key,
            bossPhase: phaseIndex,
            reward: cell.reward
        };

        if (phase.enemies) {
            options.bossPhaseEnemies = phase.enemies;
            Battle.start(phase.enemies[0], 1, options);
        } else if (phase.enemy) {
            Battle.start(phase.enemy, 1, options);
        }
    },

    markDefeated: function(cellKey) {
        var defeated = Game.state.defeatedCells;
        var found = false;
        for (var i = 0; i < defeated.length; i++) {
            if (defeated[i] === cellKey) { found = true; break; }
        }
        if (!found) defeated.push(cellKey);
        this.saveChapterState();
        Game.saveGame();
    },

    openCurrentChest: function() {
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        this.openChest(cell.reward);
    },

    talkNPC: function() {
        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (!chapter) return;
        var pos = Game.state.currentPos;
        var cell = chapter.cells[pos.x + ',' + pos.y];
        if (!cell) return;

        var npcName = cell.npcName || cell.npc || '陌生人';
        var content = (cell.dialog || '...');

        // 检查该NPC是否有已完成的任务（对话切换为感谢语）
        var hasCompletedQuest = false;
        var completedQuestName = '';
        for (var ci = 0; ci < Game.state.quests.length; ci++) {
            var cq = Game.state.quests[ci];
            if (cq.completed && cq.location === chapter.location && cq.npc === cell.npc) {
                hasCompletedQuest = true;
                completedQuestName = cq.name;
                break;
            }
        }
        if (hasCompletedQuest) {
            content = '多亏有你，「' + completedQuestName + '」已经圆满完成了！真是太感谢了！';
        }

        // 根据NPC类型添加功能按钮
        var buttons = '<div class="npc-dialog-actions">';

        if (cell.npc === 'tiejiang') {
            buttons += '<button onclick="UI.closeModal();Game.toScreen(\'smith\');UI.renderSmith();">去铁匠铺</button>';
            buttons += '<button class="secondary" onclick="Map.buyMaterial()">购买材料</button>';
        }

        // 检查该NPC是否有可提交的任务（按 location + npc 匹配）
        var hasActiveQuest = false;
        for (var qi = 0; qi < Game.state.quests.length; qi++) {
            var q = Game.state.quests[qi];
            if (q.completed) continue;
            if (q.location === chapter.location && q.npc === cell.npc) {
                hasActiveQuest = true;
                var canSubmit = Game.canCompleteQuest(q);
                buttons += '<button ' + (canSubmit ? '' : 'disabled') + ' onclick="UI.closeModal();Game.submitQuest(\'' + q.id + '\')">' +
                    (canSubmit ? '✓ 提交「' + q.name + '」' : '「' + q.name + '」条件未满足') + '</button>';
            }
        }

        // 检查该NPC是否有未接取的任务
        for (var ti = 0; ti < GAME_DATA.quests.length; ti++) {
            var tq = GAME_DATA.quests[ti];
            if (tq.location === chapter.location && tq.npc === cell.npc) {
                var alreadyAccepted = false;
                for (var ai = 0; ai < Game.state.quests.length; ai++) {
                    if (Game.state.quests[ai].id === tq.id) {
                        alreadyAccepted = true;
                        break;
                    }
                }
                if (!alreadyAccepted) {
                    buttons += '<button onclick="UI.closeModal();Game.acceptQuest(\'' + tq.id + '\')">📜 接取任务「' + tq.name + '」</button>';
                }
            }
        }

        buttons += '</div>';

        UI.showModal(npcName, content + '<br><br>' + buttons);
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

        var chapter = null;
        for (var i = 0; i < GAME_DATA.chapters.length; i++) {
            if (GAME_DATA.chapters[i].id === Game.state.currentChapter) {
                chapter = GAME_DATA.chapters[i];
                break;
            }
        }
        if (chapter) this.showCurrentEvent(chapter);
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

    // 通关章节后解锁下一章
    unlockNextChapter: function(chapterId) {
        var unlocked = Game.state.unlockedChapters || [1];
        var nextId = chapterId + 1;
        var already = false;
        for (var i = 0; i < unlocked.length; i++) {
            if (unlocked[i] === nextId) { already = true; break; }
        }
        if (!already) {
            unlocked.push(nextId);
            Game.state.unlockedChapters = unlocked;
            if (nextId > Game.state.chapter) {
                Game.state.chapter = nextId;
            }
            Game.saveGame();
            return true;
        }
        return false;
    }
};
