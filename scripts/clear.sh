#!/bin/bash
# 设置错误时退出
set -e

echo "正在清理所有包的 dist 目录..."

# 删除各个包的 dist 目录
pnpm --filter @arvin-shu/microcode-types\
  --filter @arvin-shu/microcode-utils\
  --filter @arvin-shu/microcode-shell\
  --filter @arvin-shu/microcode-editor-core\
  --filter @arvin-shu/microcode-editor-skeleton\
  --filter @arvin-shu/microcode-designer\
  --filter @arvin-shu/microcode-renderer-core\
  --filter @arvin-shu/microcode-vue-simulator-renderer\
  --filter @arvin-shu/microcode-theme\
  --filter @arvin-shu/microcode-engine\
  --stream exec -- rm -rf dist

echo "所有包的 dist 目录清理完成"
