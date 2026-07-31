#!/usr/bin/env python
# -*- coding: utf-8 -*-
with open('js/game.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 当前文件结构（0-based索引）:
# 70:     },              <- toScreen正确结束
# 71:     // ===== 角色创建 =====
# 72:     },              <- 垃圾
# 73:     // ===== 角色创建 =====
# 74:     },              <- 垃圾
# 75:             if (options && options.unitId) UI.configTargetId = options.unitId;
# 76:             UI.renderUnitConfig();
# 77:         }
# 78:     },              <- 垃圾
# 79:     // ===== 角色创建 =====
# 80: (空行)
# 81:     // ===== 角色创建 =====
# 82:     // 开局5级，20点自由分配
#
# 保留 0-71（包含71行的 '// ===== 角色创建 ====='）
# 删除 72-81（全是垃圾）
# 保留 82 及以后

fixed = lines[0:72] + lines[82:]

with open('js/game.js', 'w', encoding='utf-8') as f:
    f.writelines(fixed)

print('Fixed! Removed lines 72-81 (residual garbage).')
print(f'New total lines: {len(fixed)}')
