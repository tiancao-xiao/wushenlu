with open('js/ui.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()

out = []
skip_until = -1
for i, l in enumerate(lines):
    if skip_until >= 0 and i <= skip_until:
        continue
    # 1. 修改标题
    if '当前队伍（顺序即站位）' in l:
        l = l.replace('当前队伍（顺序即站位）', '当前队伍')
    # 2. 跳过 position-controls div (72-75行左右)
    if 'class="position-controls"' in l:
        # 找到匹配的闭合标签
        # 这一行开始，需要找到对应的 </div>
        # 但由于是多行，我们看下一行是否包含 </div>
        # 实际上这个div有3行内容
        skip_until = i + 2  # 跳过当前行+接下来2行
        continue
    # 3. 跳过 moveTeamMember 函数
    if 'moveTeamMember:' in l:
        # 跳过接下来的6行（函数体）
        skip_until = i + 6
        continue
    out.append(l)

with open('js/ui.js', 'w', encoding='utf-8') as f:
    f.writelines(out)

print('Done')
