set -e
echo "正在执行所有包的 build 命令..."

pnpm --filter @arvin/microcode-types\
  --filter @arvin/microcode-theme\
  --filter @arvin/microcode-utils\
  --filter @arvin/microcode-shell\
  --filter @arvin/microcode-editor-core\
  --filter @arvin/microcode-editor-skeleton\
  --filter @arvin/microcode-designer\
  --filter @arvin/microcode-vue-simulator-renderer\
  --filter @arvin/microcode-engine\
  
  --stream run build 

echo "所有包的 build 命令执行完成"
