#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sys

# 0-based indices:
# Line 72 (index 71) is "    },\n"  (toScreen correctly ends)
# Line 73 (index 72) is "    // ===== \u89d2\u8272\u521b\u5efa =====\n"
# ...残留垃圾到第82行 (index 81)
# Line 83 (index 82) is "    // ===== \u89d2\u8272\u521b\u5efa =====\n"
# 我们要保留 0-71，然后从 82 开始保留
# (因为第82行是0-based索引81, 83行是索引82)

with open('js/game.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# 先看前90行，确认索引
for i in range(min(90, len(lines))):
    print(f"{i:3d}: {lines[i].rstrip()}")

print(f"\nTotal lines: {len(lines)}")
