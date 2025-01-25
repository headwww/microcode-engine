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

## 属性信息(Props)

`IPublicTypePropConfig` 是一个用于定义组件属性信息的接口，它包含了属性的基本信息，如名称、类型、描述和默认值。

### 属性说明

| 属性名       | 类型                | 必填 | 说明           |
| ------------ | ------------------- | ---- | -------------- |
| name         | string              | 是   | 属性的名称标识 |
| propType     | IPublicTypePropType | 是   | 属性的数据类型 |
| description  | string              | 否   | 属性的详细描述 |
| defaultValue | any                 | 否   | 属性的默认值   |

### 使用示例

```typescript
// 组件源码
<template>
	<div></div>
</template>
<script setup lang="ts">
defineProps({
	title: String,
	size: Number,
	options: Array,
});

defineEmits(['change'])
</script>


```



```typescript
{
  name: 'title',
  propType: 'string',
  description: '标题文本',
  defaultValue: '默认标题'
}
{
  name: 'size',
  propType: 'number',
  description: '尺寸大小',
  defaultValue: 16
}
```

### 复杂类型属性
```typescript
{
  name: 'style',
  propType: 'object',
  description: '自定义样式对象',
  defaultValue: { color: '#000' }
}

{
  name: 'options',
  propType: 'array',
  description: '选项列表',
  defaultValue: []
}
```

### 函数类型属性
```typescript
{
  name: 'onChange',
  propType: 'func',
  description: '值变化时的回调函数'
}
```

#### propType**基本类型**

| propType 值                                          | 类型描述               | 参考 PropTypes 类型       |
| ---------------------------------------------------- | ---------------------- | ------------------------- |
| 'array'                                              | 数组类型               | PropTypes.array           |
| 'bool'                                               | 布尔类型               | PropTypes.bool            |
| 'func'                                               | 函数类型               | PropTypes.func            |
| 'number'                                             | 数字类型               | PropTypes.number          |
| 'object'                                             | 对象类型               | PropTypes.object          |
| 'string'                                             | 字符串类型             | PropTypes.string          |
| 'node'                                               | 节点类型               | PropTypes.node            |
| 'element'                                            | 元素类型               | PropTypes.element         |
| 'any'                                                | 任意值类型             | PropTypes.any             |
| {<br />  type: 'xxx',<br />  isRequired: true<br />} | 指定类型，且是必要属性 | PropTypes.xxxx.isRequired |

> 注意：上述类型均支持 PropTypes.xxx.isRequired 链式描述方式描述该属性是否为**必要属性**。




**复合类型**


| propType 值                                                  | 类型描述                                         |
| ------------------------------------------------------------ | ------------------------------------------------ |
| {<br />  type: 'oneOf',<br />  value: ['a', 'b', 'c', '...']<br />} | 枚举值类型                                       |
| {<br />  type: 'oneOfType',<br />  value: ['string', 'number', {<br />    type: 'array',<br />    isRequired: true<br />  }]<br />} | 指定类型中的一种，支持递归描述                   |
| {<br />  type: 'arrayOf',<br />  value: 'number'<br />}      | 指定统一成员**值类型**的数组类型                 |
| {<br />  type: 'objectOf',<br />  value: 'string'<br />}     | 指定统一对象属性**值类型**的对象类型             |
| {<br />  type: 'shape',<br />  value: [{<br />    name: 'color',<br />    propType: 'string'<br />  }, {<br />    name: 'fontSize',<br />    propType: {<br />      type: 'number',<br />      isRequied: true  <br />    }  <br />  }]<br />} | 指定对象的部分**属性名**和**值类型**的对象类型   |
| {<br />  type: 'exact',<br />  value: [{<br />    name: 'name',<br />    propType: 'string'  <br />  }, {<br />    name: 'quantity',<br />    propType: 'number'<br />  }]<br />} | 严格指定对象全部**属性名**和**值类型**的对象类型 |
| {<br />  type: 'instanceOf',<br />  value:SomeClass,<br />}  | 用于指定一个属性的类型为某个特定的类实例         |


描述举例：

```javascript
// 组件属性描述
{
  props: [{
    name: 'title',
    propType: {
      type: 'oneOf',
      value: ['a', 'b'],
    },
    description: '这是用于描述标题',
    defaultValue: '标题一',
  }, {
    name: 'message',
    propType: {
      type: 'oneOfType',
      value: ['string', 'number', {
        type: 'array',
        isRequired: true,
      }],
    },
    description: '这是用于描述消息内容',
    defaultValue: 'xxx',
  }, {
    name: 'size',
    propType: {
      type: 'arrayOf',
      value: 'number',
    },
    description: '这是用于描述大小列表',
    defaultValue: [1, 2, 3],
  }], {
    name: 'bodyStyle',
    propType: {
      type: 'shape',
      value: [{
        name: 'color',
        propType: 'string',
      }, {
        name: 'fontSize',
        propType: {
          type: 'number',
          isRequied: true,
        }
      }],
    },
    description: '这是用于描述主体样式',
    defaultValue: [1, 2, 3],
  },
    {
      type: 'instanceOf',
      value: SomeClass,
      isRequired: true
    }
  ],
}
```
