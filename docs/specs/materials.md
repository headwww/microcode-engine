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

## 属性信息(props)

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

## 编辑体验增强(configure)

按照组件结构描述完组件的基本属性之后会自动通过管道函数产出一套具有基本编辑行为能力的描述文件，但是当这份描述文件无法满足需求的时候就需要一些额外的配置来增强优化搭建产品的编辑体验，定制编辑能力的配置信息，通过能力抽象分类，主要包含如下几个维度的配置项：

| 字段      | 字段描述               | 字段类型 | 备注                                                         |
| --------- | ---------------------- | -------- | ------------------------------------------------------------ |
| props     | 属性面板配置           | Array    | 用于属性面板能力描述                                         |
| component | 组件能力配置           | Object   | 与组件相关的能力、约束、行为等描述，有些信息可从组件视图实例上直接获取 |
| supports  | 通用扩展配置能力支持性 | Object   | 用于通用扩展面板能力描述                                     |
| advanced  | 高级特性配置           | Object   | 用户可以在这些配置通过引擎上下文控制组件在设计器中的表现，例如自动初始化组件的子组件、截获组件的操作事件进行个性化处理等 |

### 属性面板配置 props

对于描述的直接的props的一种增强，configure内的props 数组下对象字段描述：

| 字段                | 字段描述                                                     | 字段类型                                       | 备注                                                         |
| ------------------- | ------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------------------------ |
| type                | 指定类型                                                     | Enum                                           | 可选值为 `'field'                                            |
| display             | 指定类型                                                     | Enum                                           | 可选值为 `'accordion' \| 'inline' \| 'block' \| 'plain' \| 'popup' \| 'entry'` ，默认为 'inline' |
| title               | 分类标题                                                     | 属性标题                                       | String                                                       |
| items               | 分类下的属性列表                                             | Array\<Object>                                 | type = 'group' 生效                                          |
| name                | 属性名                                                       | String                                         | type = 'field' 生效                                          |
| defaultValue        | 默认值                                                       | Any(视字段类型而定)                            | type = 'field' 生效                                          |
| supportVariable     | 是否支持配置变量                                             | Boolean                                        | type = 'field' 生效                                          |
| condition           | 配置当前 prop 是否展示                                       | (target: IPublicModelSettingField) => boolean; | -                                                            |
| ignoreDefaultValue  | 配置当前 prop 是否忽略默认值处理逻辑，如果返回值是 true 引擎不会处理默认值 | (target: IPublicModelSettingField) => boolean; | -                                                            |
| setter              | 单个控件 (setter) 描述，搭建基础协议组件的描述对象，支持 JSExpression / JSFunction / JSSlot | `String\|Object\|Function`                     | type = 'field' 生效                                          |
| extraProps          | 其他配置属性（不做流通要求）                                 | Object                                         | 其他配置                                                     |
| extraProps.getValue | setter 渲染时被调用，setter 会根据该函数的返回值设置 setter 当前值 | Function                                       | (target: IPublicModelSettingField, value: any) => any;       |
| extraProps.setValue | setter 内容修改时调用，开发者可在该函数内部修改节点 schema 或者进行其他操作 | Function                                       | (target: IPublicModelSettingField, value: any) => void;      |

### 通用扩展面板支持性配置 supports

样式配置面板能力描述，描述是否支持行业样式编辑、是否支持类名设置等。

```json
{
  "configure": {
    // 支持的事件枚举
    "supports": {
      // 支持事件列表
      "events": ["onClick", "onChange"],
      // 支持循环设置
      "loop": true,
      // 支持条件设置
      "condition": true,
      // 支持样式设置
      "style": true,
    }
  }
}
```



### 组件能力配置 component[]

与组件相关的能力、约束、行为等描述，有些信息可从组件视图实例上直接获取，包含如下字段：

| 字段                            | 用途                                                         | 类型               |
| ------------------------------- | ------------------------------------------------------------ | ------------------ |
| isContainer                     | 是否容器组件                                                 | Boolean            |
| isModal                         | 组件是否带浮层，浮层组件拖入设计器时会遮挡画布区域，此时应当辅助一些交互以防止阻挡 | Boolean            |
| descriptor                      | 组件树描述信息                                               | String             |
| nestingRule                     | 嵌套控制：防止错误的节点嵌套，比如 a 嵌套 a, FormField 只能在 Form 容器下，Column 只能在 Table 下等 | Object             |
| nestingRule.childWhitelist      | 子节点类型白名单                                             | `String\|Function` |
| nestingRule.parentWhitelist     | 父节点类型白名单                                             | `String\|Function` |
| nestingRule.descendantBlacklist | 后裔节点类型黑名单                                           | `String\|Function` |
| nestingRule.ancestorWhitelist   | 祖父节点类型白名单                                           | `String\|Function` |
| isNullNode                      | 是否存在渲染的根节点                                         | Boolean            |
| isLayout                        | 是否是 layout 布局组件                                       | Boolean            |
| rootSelector                    | 组件选中框的 cssSelector                                     | String             |
| disableBehaviors                | 用于屏蔽在设计器中选中组件时提供的操作项，默认操作项有 copy、hide、remove | String[]           |
| actions                         | 用于详细配置上述操作项的内容                                 | Object             |
| isMinimalRenderUnit             | 是否是最小渲染单元，最小渲染单元下的组件渲染和更新都从单元的根节点开始渲染和更新。如果嵌套了多层最小渲染单元，渲染会从最外层的最小渲染单元开始渲染。 | Boolean            |

描述举例：

```js
{
  configure: {
    component: {
      isContainer: true,
      isModal: false,
      descriptor: 'title',
      nestingRule: {
        childWhitelist: ['SelectOption'],
        parentWhitelist: ['Select', 'Table'],
      },
      rootSelector: '.next-dialog',
      disableBehaviors: ['copy', 'remove'],
      actions: {
        name: 'copy', // string;
        content: '＋', // string | ReactNode | ActionContentObject;
        items: [], // ComponentAction[];
        condition: 'always', // boolean | ((currentNode: any) => boolean) | 'always';
        important: true, // boolean;
      },
    },
  },
}
```



### 高级功能配置 advanced

组件在低代码引擎设计器中的事件回调和 hooks 等高级功能配置，包含如下字段：

| 字段                        | 用途                                                         | 类型                           | 备注                                                |
| --------------------------- | ------------------------------------------------------------ | ------------------------------ | --------------------------------------------------- |
| initialChildren             | 组件拖入“设计器”时根据此配置自动生成 children 节点 schema    | NodeData[]/Function NodeData[] | ((target: IPublicModelSettingField) => NodeData[]); |
| getResizingHandlers         | 用于配置设计器中组件 resize 操作工具的样式和内容             | Function                       | (currentNode: any) => Array<{ type: 'N'             |
| callbacks                   | 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等 | Callback                       | -                                                   |
| callbacks.onNodeAdd         | 在容器中拖入组件时触发的事件回调                             | Function                       | (e: MouseEvent, currentNode: any) => any            |
| callbacks.onNodeRemove      | 在容器中删除组件时触发的事件回调                             | Function                       | (e: MouseEvent, currentNode: any) => any            |
| callbacks.onResize          | 调整容器尺寸时触发的事件回调，常常与 getResizingHandlers 搭配使用 | Function                       | 详见 Types 定义                                     |
| callbacks.onResizeStart     | 调整容器尺寸开始时触发的事件回调，常常与 getResizingHandlers 搭配使用 | Function                       | 详见 Types 定义                                     |
| callbacks.onResizeEnd       | 调整容器尺寸结束时触发的事件回调，常常与 getResizingHandlers 搭配使用 | Function                       | 详见 Types 定义                                     |
| callbacks.onSubtreeModified | 容器节点结构树发生变化时触发的回调                           | Function                       | (currentNode: any, options: any) => void;           |
| callbacks.onMouseDownHook   | 鼠标按下操作回调                                             | Function                       | (e: MouseEvent, currentNode: any) => any;           |
| callbacks.onClickHook       | 鼠标单击操作回调                                             | Function                       | (e: MouseEvent, currentNode: any) => any;           |
| callbacks.onDblClickHook    | 鼠标双击操作回调                                             | Function                       | (e: MouseEvent, currentNode: any) => any;           |
| callbacks.onMoveHook        | 节点被拖动回调                                               | Function                       | (currentNode: any) => boolean;                      |
| callbacks.onHoverHook       | 节点被 hover 回调                                            | Function                       | (currentNode: any) => boolean;                      |
| callbacks.onChildMoveHook   | 容器节点的子节点被拖动回调                                   | Function                       | (childNode: any, currentNode: any) => boolean;      |

```js
{
  configure: {
    advanced: {
      callbacks: {
        onNodeAdd: (dragment, currentNode) => {

        }
      },
      getResizingHandlers: () => {
        return [ 'E' ];
      },
      initials: [
        {
          name: 'linkType',
          initial: () => 'link'
        },
      ]
    },
  }
}
```
