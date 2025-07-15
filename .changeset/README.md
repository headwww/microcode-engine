# Changesets

这是一个关于 CI/CD 流程设计思路的文档。官方地址(https://github.com/changesets/changesets)

## 一、依赖关系分析

在开始 CI/CD 流程设计之前，首先要彻底分析项目依赖关系。

1. **明确每个包的依赖**：

   - **`@arvin-shu/microcode-types`**：不依赖任何本地包（最底层）。
   - **`@arvin-shu/microcode-utils`**：依赖 `@arvin-shu/microcode-types`。
   - **`@arvin-shu/microcode-editor-core`**：依赖 `@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。
   - **`@arvin-shu/microcode-editor-skeleton`**：依赖 `@arvin-shu/microcode-editor-core`、`@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。
   - **`@arvin-shu/microcode-designer`**：依赖 `@arvin-shu/microcode-editor-core`、`@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。
   - **`@arvin-shu/microcode-theme`**：不依赖任何本地包。
   - **`@arvin-shu/microcode-renderer-core`**：依赖 `@arvin-shu/microcode-designer`、`@arvin-shu/microcode-types`。
   - **`@arvin-shu/microcode-vue-simulator-renderer`**：依赖 `@arvin-shu/microcode-renderer-core`、`@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。
   - **`@arvin-shu/microcode-shell`**：依赖 `@arvin-shu/microcode-designer`、`@arvin-shu/microcode-editor-core`、`@arvin-shu/microcode-editor-skeleton`、`@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。
   - **`@arvin-shu/microcode-engine`**：依赖 `@arvin-shu/microcode-designer`、`@arvin-shu/microcode-editor-core`、`@arvin-shu/microcode-editor-skeleton`、`@arvin-shu/microcode-shell`、`@arvin-shu/microcode-types`、`@arvin-shu/microcode-utils`。

   *确保每个包的 `package.json` 文件中都准确地写明了它们所依赖的其他本地包，并使用 `semver` 版本号。避免循环依赖。*

2. **梳理依赖拓扑结构**：

   - **最底层（不依赖其他本地包）**：`@arvin-shu/microcode-types`、`@arvin-shu/microcode-theme`。
   - **中间层（既依赖别人也被别人依赖）**：`@arvin-shu/microcode-utils`、`@arvin-shu/microcode-editor-core`、`@arvin-shu/microcode-editor-skeleton`、`@arvin-shu/microcode-designer`、`@arvin-shu/microcode-renderer-core`、`@arvin-shu/microcode-vue-simulator-renderer`、`@arvin-shu/microcode-shell`。
   - **顶层（依赖别人但很少被依赖）**：`@arvin-shu/microcode-engine`。
   - **依赖关系图**：建议绘制一个依赖关系图，清晰地展示各个包之间的依赖关系，找出“叶子节点”和“根节点”（CI/CD流程会自动分析）。

3. **分析依赖链的复杂度**：

   - **多级依赖**：例如 `@arvin-shu/microcode-engine` 依赖 `@arvin-shu/microcode-shell`，而 `@arvin-shu/microcode-shell` 又依赖 `@arvin-shu/microcode-designer` 等，形成多级依赖。
   - **多对多依赖**：例如 `@arvin-shu/microcode-designer` 和 `@arvin-shu/microcode-editor-core` 都依赖 `@arvin-shu/microcode-types` 和 `@arvin-shu/microcode-utils`。
   - **交叉依赖或潜在的循环依赖**：在绘制依赖图时特别注意这一点，确保没有循环依赖。

## 二、CI/CD 流程设计

根据我的设计思路，CI/CD 流程应该关注以下几点：

1. **变更检测与依赖链递归升级**：
   - 无论哪个包发生变更（无论是底层还是中间层），所有直接或间接依赖它的包都必须自动更新依赖版本并重新打包发布。
   - 确保依赖链递归处理，以保证所有受影响的包都能升级到最新版本。
2. **自动化打包**：
   - 发生变更的包以及所有受影响的包都需要重新进行 `build`，确保产物集成了最新的依赖代码。
   - 推荐采用**全量 build** 的方式，虽然可能耗时，但更简单可靠，能避免只 build 受影响包可能带来的遗漏问题。
3. **自动化发布顺序**：
   - 发布时必须严格按照依赖链的顺序进行：**先发布被依赖的包，再发布依赖它的包**。
   - 避免出现“主包已经发布，但其依赖的包尚未发布”的情况。
4. **CI/CD 触发时机**：
   - **推荐在主分支（如 `main` 分支）合并后自动触发**，这样可以保证主分支的代码始终是可发布状态。
   - 也可以根据需要设置手动触发机制，例如在发布前进行人工确认。
5. **安全与权限**：
   - 发布到 npm 需要使用安全的 token，例如可以配置为 GitHub Secrets，避免敏感信息泄露。
   - CI/CD 环境需要有足够的权限来访问和发布所有包。
6. **变更记录与回溯**：
   - 每次发布都应该生成 `changelog`，方便团队成员追踪和回顾每次变更的内容。
   - CI/CD 流程应该具备失败回滚或重试的能力，以应对发布过程中出现的问题。

## 三、流程大致步骤 (基于 `changesets`)

使用 `changesets`，它能很好地支持 monorepo 的版本管理和发布。

1. **开发者本地变更**：
   - 当开发者完成代码变更后，在本地执行 `npx changeset` 命令。
   - `changeset` 会引导生成一个变更集文件，其中包含了本次变更的类型（patch, minor, major）和描述信息。
2. **推送到主分支**：
   - 开发者将包含变更集文件的代码推送到主分支（例如 `main` 分支）。
3. **CI 自动执行**：
   - 当代码合并到主分支后，CI/CD 系统（如 GitHub Actions, GitLab CI, Jenkins 等）会自动触发构建流程。
   - **安装依赖**：CI 脚本首先执行 `pnpm install` 来安装所有项目的依赖。
   - **递归 bump 受影响包的版本**：接着，执行 `npx changeset version`。 这个命令会根据已有的变更集文件，自动更新所有受影响包的 `package.json` 中的版本号，并更新它们的依赖版本（例如，如果 `@arvin-shu/microcode-types` 发生了 `minor` 变更，所有依赖它的包的 `package.json` 都会将 `@arvin-shu/microcode-types` 的依赖版本升级到新版本）。同时，`changeset` 也会生成 `CHANGELOG.md` 文件。
   - **全量 build**：然后，执行 `pnpm build` 命令。 确保这个命令能够对所有包进行完整的构建，生成最终的产物。在 `package.json` 的 `scripts` 中可以定义一个 `build` 脚本来支持这个操作，例如：`"build": "pnpm -r build"`。
   - **按依赖顺序自动发布**：最后，执行 `npx changeset publish`。 `changesets` 会自动识别包的依赖关系，并按照正确的拓扑顺序将它们发布到 npm。它会先发布没有依赖的包，然后是依赖这些包的包，以此类推，确保依赖的包总是在被依赖的包之前发布。
   - **发布完成后**：所有包的 npm 版本和它们之间的依赖链都将保持“最新一致性”。

## 四、关键点

1. **依赖关系维护**：
   - **持续确保每个包的 `package.json` 中的依赖是准确无误的。** 这是整个 CI/CD 流程的基础。
2. **build 脚本健壮性**：
   - **确保每个包都能独立地进行 `build` 操作。**
   - **确保根目录的 `pnpm build` 命令能够触发所有子包的全量构建。** 这通常在根 `package.json` 的 `scripts` 中通过 `pnpm run build` 实现。
3. **CI/CD 自动化**：
   - **力求流程全自动化，尽量减少人工干预。** 这能提高效率，减少人为错误。
4. **发布顺序安全**：
   - **利用 `changesets` 自动保证依赖链的发布顺序**，避免出现“未发布依赖”导致的问题。

## 五、完整的 CI/CD 流程实现指南

这个指南将涵盖从项目初始化到 GitHub Actions 配置的每一个步骤，以实现上面设计的 CI/CD 流程。

#### 步骤 1: 项目准备与 `changesets` 初始化

1. **创建或导航到 Monorepo 项目根目录**： 确保项目是一个 `pnpm` Monorepo，并且在根目录有 `pnpm-workspace.yaml` 文件。

2. **为每个子包定义 `build` 脚本**： 在每个 `packages/*/package.json` 中，添加一个 `build` 脚本，例如：

   JSON

   ```json
   {
   	"name": "@arvin-shu/microcode-designer",
     "version": "1.0.0",
     "scripts": {
   		"build": "cross-env ORIGINAL_CWD=$PWD pnpm --filter ../../build-scripts run start",
     }
   }
   ```

   **重要**：确保这些 `build` 脚本是可执行且成功的。

3. **在根目录定义全量 `build` 脚本**： 在 Monorepo 根目录的 `package.json` 中，添加一个 `build` 脚本来触发所有子包的构建：

   JSON

   ```json
   {
   	"name": "microcode-engine",
     "private": true,
     "scripts": {
   		"build": "./scripts/build.sh", // 确保能全量 build
     }
   }
   ```

4. **安装 `changesets` CLI**： 在 Monorepo 根目录，运行以下命令安装 `changesets` 作为开发依赖：

   Bash

   ```bash
   pnpm add -w @changesets/cli
   ```

   `-w` 参数表示将其安装到 workspace 的根目录。

5. **初始化 `changesets` 配置**： 运行以下命令来初始化 `changesets`。这会在项目根目录创建一个 `.changeset` 文件夹，其中包含一个 `config.json` 文件。

   Bash

   ```
   npx changeset init
   ```

   可以根据需要修改 `config.json`，例如，调整 `baseBranch`（默认为 `main`）或 `commit` 策略。

   我们需要的策略是这样的

   ```json
   {
   	"$schema": "https://unpkg.com/@changesets/config@3.1.1/schema.json",
   	"changelog": [
   		"@changesets/cli/changelog",
   		{ "repo": "headwww/microcode-engine" }
   	],
   	"commit": false,
   	"fixed": [],
   	"linked": [],
   	"access": "public",
   	"baseBranch": "main",
   	"updateInternalDependencies": "patch",
   	"ignore": [],
   	"packages": ["packages/*"]
   }
   ```

   这份 `config.json` 文件是 `@changesets/cli` 工具的核心配置文件，它定义了 `changesets` 在 Monorepo 中如何管理版本、生成更新日志和发布包的行为。

   - `$schema`: `https://unpkg.com/@changesets/config@3.1.1/schema.json`
     - **作用**：这是一个 JSON Schema 的引用。它不影响 `changesets` 的运行，但对开发者非常有用。它允许代码编辑器（如 VS Code）提供自动补全、类型检查和错误提示，确保编写的配置符合 `changesets` 的标准。
   - `changelog`: `["@changesets/cli/changelog", { "repo": "headwww/microcode-engine" }]`
     - **作用**：定义了如何生成 `CHANGELOG.md` 文件。
     - `"@changesets/cli/changelog"`: 这是 `changesets` 默认的 changelog 格式化器，它会创建一个包含版本号和变更描述的列表。
     - `{ "repo": "headwww/microcode-engine" }`: 这个选项告诉 `changelog` 格式化器， Git 仓库地址是 `https://github.com/headwww/microcode-engine`。这样，在生成的 `CHANGELOG.md` 中，`changesets` 就可以自动生成指向 GitHub commits 或 Pull Request 的链接，方便追溯。
   - `commit`: `false`
     - **作用**：决定 `changesets` 在执行 `npx changeset add` 或 `npx changeset version` 命令后，是否自动提交更改。
     - `false`: 表示 `changesets` 不会自动提交。需要手动执行 `git add .` 和 `git commit -m "..."` 来提交由 `changesets` 产生的变更（例如新的 `.md` 变更集文件或更新后的 `package.json` 和 `CHANGELOG.md`）。在 CI/CD 流程中，就是手动提交的，所以这个设置是正确的。
   - `fixed`: `[]`
     - **作用**：用于定义一组**始终一起发布并拥有相同版本号**的包。
     - `[]` (空数组): 表示没有设置任何固定版本号的包组。这意味着每个包都会根据自己的变更集独立地提升版本。
   - `linked`: `[]`
     - **作用**：与 `fixed` 类似，用于定义一组**版本号彼此关联的包**，当其中任何一个包需要发布时，这组中所有包都会以**相同的版本号**发布。不同于 `fixed` 的是，`linked` 组中的包版本号会根据组内最高版本提升来决定，而不是固定某个版本。
     - `[]` (空数组): 表示没有设置任何链接版本号的包组。
   - `access`: `"public"`
     - **作用**：设置发布带 `scope` 的包（例如 `@arvin-shu/...`）时，它们的默认访问级别。
     - `"public"`: 意味着 scoped 包将以公开的形式发布到 npm 注册表。这是发布公开 scoped 包所必需的设置。
   - `baseBranch`: `"main"`
     - **作用**：指定 `changesets` 在检测哪些包有变更时，用来与当前分支进行比较的基准分支。
     - `"main"`: 表示 `changesets` 会比较当前分支与 `main` 分支之间的差异来识别变更。
   - `updateInternalDependencies`: `"patch"`
     - **作用**：这是关注的“依赖他的包没有重新打包发布升级”的关键配置！
     - `"patch"`: 这个选项告诉 `changesets`，当一个包（例如 `@arvin-shu/microcode-utils`）发布了新版本时，所有直接或间接依赖它的**内部包**（即 Monorepo 内部的其他包）的版本号也应该自动提升一个 `patch` 版本。
     - **重要提示**：尽管配置了 `"patch"`，但如果依赖包没有被正确识别或它们的 `package.json` 中的依赖声明不准确，`changesets` 仍然可能无法正确触发这些依赖包的升级。这个设置本身是正确的，它表明期望这种行为。
   - `ignore`: `[]`
     - **作用**：用于指定 `changesets` 在版本化和发布过程中应该忽略的包。
     - `[]` (空数组): 表示没有忽略任何包。
   - `packages`: `["packages/*"]`
     - **作用**：告诉 `changesets` 在 Monorepo 中的哪些路径下可以找到需要管理的包。
     - `"packages/*"`: 表示 `changesets` 会查找 `packages` 目录下所有子文件夹中的包。这个设置与 `pnpm-workspace.yaml` 中的 `packages` 字段应该保持一致。

6. **检查 `package.json` 依赖**： 仔细检查并确保所有子包的 `package.json` 文件中，本地依赖都已正确声明，并使用 `semver` 版本号（例如 `"@arvin-shu/microcode-types": "^1.0.0"`）。这是 `changesets` 正确处理版本和发布的基础。

#### 步骤 2: 配置 GitHub Actions

1. **创建工作流文件**： 在项目根目录创建 `.github/workflows/` 文件夹（如果不存在）。 在这个文件夹中创建一个名为 `ci-cd.yml` 的文件。
2. **编辑 `ci-cd.yml` 文件**： 将以下 YAML 内容复制并粘贴到 `ci-cd.yml` 文件中：

```yaml
name: CI/CD Pipeline

on:
  push:
    branches:
      - main # 当代码合并到 main 分支时触发

permissions:
  contents: write # 允许写入内容以更新版本和创建发布
  pull-requests: write # 如果需要自动创建或更新 Pull Request（例如 for changesets next 模式）
  id-token: write # 用于 OIDC，如果需要发布到私有 registry 或进行其他身份验证

jobs:
  build-and-publish:
    runs-on: ubuntu-latest # 使用最新的 Ubuntu runner

    steps:
      - name: 📝 Checkout code
        uses: actions/checkout@v4
        with:
          fetch-depth: 0 # 获取所有历史，changesets 需要

      - name: ⎔ Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # 推荐使用 LTS 版本
          registry-url: 'https://registry.npmjs.org/' # 指向 npm 官方 registry
          scope: '@arvin-shu' # 替换为你的 npm scope，例如：@your-org。如果你的包没有scope，可以省略此行。
          token: ${{ secrets.NPM_TOKEN }} # 使用你的 npm token 进行认证

      - name: 📥 Install pnpm
        run: npm install -g pnpm@10.13.1 # 全局安装 pnpm

      - name: 📦 Install dependencies
        run: pnpm install --frozen-lockfile # 安装所有项目依赖

      # ====== 关键调试步骤 ======
      - name: 🕵️ Show npm config userconfig path
        run: npm config get userconfig

      - name: 🕵️ Show .npmrc (actual)
        run: cat $(npm config get userconfig)

      - name: 🕵️ Check npm registry
        run: npm config get registry

      - name: 🕵️ Who am I
        run: npx npm whoami
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
      # ========================

      - name: 🏷️ Version packages (changesets)
        id: changesets_version
        run: |
          # 只有当存在 changeset 文件时才执行版本升级和changelog生成
          if [ -d ".changeset" ] && [ "$(ls -A .changeset | grep '.md$')" ]; then
            echo "Changeset files detected. Bumping versions and generating changelog."
            npx changeset version # 递归 bump 受影响包的版本，并生成 changelog
            echo "::set-output name=has_changes::true"
          else
            echo "No changeset files found. Skipping version bump."
            echo "::set-output name=has_changes::false"
          fi
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }} # changesets 可能需要此token来推送到仓库

      - name: 📦 Full build
        run: pnpm build # 对所有包进行全量 build

      - name: 🚀 Publish packages (changesets)
        if: steps.changesets_version.outputs.has_changes == 'true' # 只有当有版本变更时才执行发布
        run: npx changeset publish --access public # **这里添加了 --access public**
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: ⬆️ Push changes back to main branch
        if: steps.changesets_version.outputs.has_changes == 'true' # 只有当有版本变更时才推回
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          git commit -m "chore: release changes [skip ci]" # 提交版本和changelog文件
          git push
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

#### 步骤 3: 配置 GitHub Secrets

1. **生成 npm Token**：
   - 登录到 npmjs.com 账号。
   - 导航到 `Access Tokens` (通常在用户头像下拉菜单 -> `Access Tokens`)。
   - 点击 `Generate New Token`。
   - 选择 `Automation` 类型，它拥有发布包的权限。
   - 复制生成的 Token。
2. **在 GitHub 仓库中添加 Secret**：
   - 打开 GitHub 仓库。
   - 导航到 `Settings` -> `Secrets and variables` -> `Actions`。
   - 点击 `New repository secret`。
   - 将 `Name` 设置为 `NPM_TOKEN`。
   - 将 `Secret` 设置为上一步中复制的 npm Token。
   - 点击 `Add secret`。
   - `GITHUB_TOKEN` 是 GitHub Actions 默认提供的，无需手动配置。

#### 步骤 4: 开发与发布流程

1. **本地开发与变更集生成**：

   - 当完成代码变更并准备发布时（无论是一个新功能、bug 修复还是重大更新），在 Monorepo 的根目录执行：

     Bash

     ```bash
     npx changeset
     ```

   - `changesets` 会引导完成以下步骤：

     - **选择受影响的包**：根据代码改动，选择哪些包需要发布新版本。
     - **选择版本类型**：为每个选定的包选择版本类型（`patch`、`minor` 或 ``major`）。
       - `patch`: 小的 bug 修复或不影响 API 的内部改动。
       - `minor`: 新功能，但 API 兼容旧版本。
       - `major`: 破坏性变更，API 不兼容旧版本。
     - **填写变更描述**：为本次变更添加简短的描述，这些描述将用于生成 `CHANGELOG.md` 文件。

   - 执行 `npx changeset` 后，`.changeset` 目录下会生成一个或多个 Markdown 文件，这些文件包含了本次变更的信息。

2. **提交并推送代码**：

   - 将代码变更以及 `.changeset` 文件夹中新生成的 Markdown 文件提交到 Git：

     Bash

     ```bash
     git add .
     git commit -m "feat: Add new feature and changeset for release"
     ```

   - 将代码推送到 `main` 分支：

     Bash

     ```bash
     git push origin main
     ```

3. **CI/CD 流程自动执行**：

   - 一旦代码合并到 `main` 分支，GitHub Actions 工作流将自动触发。
   - **安装依赖**：工作流会执行 `pnpm install` 安装所有项目依赖。
   - **版本化包**：`npx changeset version` 会读取 `.changeset` 目录下的变更集文件，更新受影响包的 `package.json` 中的版本号，并更新其依赖的本地包版本（如果被依赖的包也有更新）。同时，`CHANGELOG.md` 文件也会自动生成和更新。完成此步骤后，`.changeset` 目录下的 Markdown 文件会被删除。
   - **全量构建**：工作流执行 `pnpm build` 命令，对所有包进行全量构建，确保产物包含最新的代码和依赖。
   - **发布包**：`npx changeset publish` 将自动识别需要发布的包，并严格按照依赖拓扑顺序将它们发布到 npm。这保证了被依赖的包总是在依赖它的包之前发布，避免了“未发布依赖”的问题。
   - **推送变更**：最后，工作流会将 `package.json` 中更新后的版本号以及生成的 `CHANGELOG.md` 文件推回到 `main` 分支。这一步非常关键，因为它使 Git 仓库的状态与已发布的 npm 包保持同步。`[skip ci]` 标记确保这次自动提交不会再次触发 CI 循环。
