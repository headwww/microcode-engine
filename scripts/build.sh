set -e
echo "正在执行所有包的 build 命令..."

pnpm  --filter @arvin-shu/microcode-types\
  --filter @arvin-shu/microcode-theme\
  --filter @arvin-shu/microcode-utils\
  --filter @arvin-shu/microcode-shell\
  --filter @arvin-shu/microcode-editor-core\
  --filter @arvin-shu/microcode-editor-skeleton\
  --filter @arvin-shu/microcode-designer\
  --filter @arvin-shu/microcode-vue-simulator-renderer\
  --filter @arvin-shu/microcode-engine\
  --stream run build 

echo "所有包的 build 命令执行完成"
