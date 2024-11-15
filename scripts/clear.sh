#!/bin/bash

# 设置错误时退出
set -e

echo "正在清理所有包的 dist 目录..."

# 删除各个包的 dist 目录
pnpm --filter @arvin/microcode-types\
  --filter @arvin/microcode-utils\
  --filter @arvin/microcode-shell\
  --filter @arvin/microcode-editor-core\
  --filter @arvin/microcode-editor-skeleton\
  --filter @arvin/microcode-designer\
  --filter @arvin/microcode-vue-simulator-renderer\
  --filter @arvin/microcode-theme\
  --filter @arvin/microcode-engine\
  --stream exec -- rm -rf dist

echo "所有包的 dist 目录清理完成"
