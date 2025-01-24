# 组件元数据 (ComponentMetadata) 配置说明

## 简介
对源码组件在平台中使用时所具备的配置能力和交互行为进行规范化描述

## 基础属性

### 基础信息
| 属性名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| componentName | string | 是 | 组件名称 |
| uri | string | 否 | 组件唯一标识 |
| title | IPublicTypeTitleContent | 否 | 组件标题或描述 |
| description | string | 否 | 组件详细描述 |
| docUrl | string | 否 | 组件文档链接 |

### 展示相关
| 属性名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| icon | IPublicTypeIconType | 否 | 组件图标(SVG) |
| screenshot | string | 否 | 组件快照图片 |
| tags | string[] | 否 | 组件标签 |

### 分组与排序
| 属性名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| group | string \| IPublicTypeI18nData | 否 | 一级分组 |
| category | string \| IPublicTypeI18nData | 否 | 二级分组 |
| priority | number | 否 | 组件优先级排序 |

### 开发配置
| 属性名 | 类型 | 必填 | 说明 |
|-------|------|------|------|
| devMode | 'proCode' \| 'microCode' | 否 | 组件研发模式 |
| npm | IPublicTypeNpmInfo | 否 | npm 包信息 |
| props | IPublicTypePropConfig[] | 否 | 组件属性配置 |
| configure | IPublicTypeFieldConfig[] \| IPublicTypeConfigure | 否 | 自定义属性设置器,编辑体验增强 |
| schema | IPublicTypeComponentSchema | 否 | 组件 schema |
| snippets | IPublicTypeSnippet[] | 否 | 可用代码片段 |

好的,我来根据 `npm-info.ts` 详细说明 `IPublicTypeNpmInfo` 的配置。

## 包配置说明 (npm)

### 简介
`IPublicTypeNpmInfo` 接口用于定义组件的 NPM 包信息，包含了包的基本信息、导出配置等。辅助设计器快速的定位到组件的引用，因为组件可以通过`script`标签资源的方式导入的，所以可以在window上找到对应的引用，`IPublicTypeNpmInfo`描述的就是这些资源到处到全局的组件（入料介绍的时候会详细分析原理）。

### 属性说明

| 属性名        | 类型    | 必填 | 说明             |
| ------------- | ------- | ---- | ---------------- |
| package       | string  | 是   | NPM 包名         |
| version       | string  | 是   | 包版本号         |
| exportName    | string  | 否   | 导出的组件名称   |
| main          | string  | 否   | 包的入口文件路径 |
| destructuring | boolean | 否   | 是否需要解构引入 |
| subName       | string  | 否   | 子组件名称       |
| componentName | string  | 否   | 组件名称         |

### 详细说明

```typescript
package: string
```
NPM 包的名称，例如："antd"`等，那么引擎就会去window对象上找到window.antd

```typescript
version: string
```
NPM 包的版本号，例如：`"1.0.0"`、`"^2.1.0"`等。

```typescript
exportName?: string
```
组件在包中导出的名称。例如，如果组件是通过 `export { Button }` 导出的，那么 `exportName` 就是 `"Button"`。

```typescript
main?: string
```
包的入口文件路径，例如：`"lib/index.js"`、`"dist/index.esm.js"`等。

```typescript
destructuring?: boolean
```
是否需要解构引入：
- `true`: 使用解构方式引入，如 `import { Button } from 'antd'`
- `false`: 使用默认导入方式，如 `import Button from 'antd/lib/button'`

```typescript
subName?: string
```
子组件名称，用于引入组件库中的子组件，例如 `Table.Column` 中的 `"Column"`。

```typescript
componentName?: string
```
组件的实际使用名称，可能与 exportName 不同。

### 使用示例

#### 基础用法
```typescript
const npmInfo: IPublicTypeNpmInfo = {
  package: "antd",
  version: "1.0.0",
  exportName: "Button",
  main: "lib/index.js",
  destructuring: true
}
```

#### 子组件配置
```typescript
const tableColumnNpmInfo: IPublicTypeNpmInfo = {
  package: "antd",
  version: "4.0.0",
  exportName: "Table",
  subName: "Column",
  destructuring: true
}
```

#### 不需要解构的组件
```typescript
const customComponentNpmInfo: IPublicTypeNpmInfo = {
  package: "my-components",
  version: "1.0.0",
  exportName: "MyButton",
  main: "dist/index.js",
  destructuring: false
}
```

### 注意事项

1. `package` 和 `version` 是必填属性
2. 当 `destructuring` 为 `true` 时，通常需要配置 `exportName`
3. 使用子组件时，需要正确配置 `subName`
4. `main` 路径要与实际的包结构相匹配
5. 确保 NPM 包已正确安装并且版本号匹配

### 最佳实践

1. 建议始终指定确切的版本号，避免使用模糊版本号
2. 对于大型组件库，推荐使用解构导入（`destructuring: true`）
3. 正确配置 `main` 字段以确保打包工具可以找到正确的入口文件
4. 当使用组件库的子组件时，确保正确配置 `subName`

