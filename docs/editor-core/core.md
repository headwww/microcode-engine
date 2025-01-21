# 编辑器核心

**定位**：处理编辑器内部逻辑的核心模块。

**功能**：为整个项目提供基础的功能，如事件通信机制，ioc机制，设置器注册机制，日志管理，历史记录，快捷键等模块

下面我们将从源码角度一一分析这些模块的实现。

## EventBus事件总结

### 背景

#### Microcode的架构需求

Microcode编辑器是一个复杂的系统，包含多个核心模块：编辑器核心、插件系统、渲染引擎、状态管理、工具面板、等等...这些模块之间需要频繁通信，但又要保持松耦合的架构设计。传统的直接调用方式会导致模块间强依赖，不利于系统的维护和扩展。

#### 实际业务痛点

1. 模块间通信混乱
   - 之前模块间通信需要互相引用，导致代码耦合度高
   - 组件层级深，props 层层传递，代码维护困难
   - 状态同步不及时，容易出现数据不一致
2. 插件系统的扩展性
   - 插件需要与核心系统交互
   - 插件之间需要通信
   - 需要动态加载和卸载插件
3. 调试难度
   - 数据流向不清晰
   - 问题定位困难
   - 缺乏统一的监控机制

### 简介

为了解决这些痛点使用事件总线的思想来进行模块间通信等问题，EventBus 是微代码编辑器中的核心事件管理系统，它提供了一个中央通信枢纽，用于处理组件和模块之间的事件传递和通信。基于 eventemitter2 库实现，提供了强大的事件管理功能。

### 设计目的

解耦通信：实现模块间的松耦合通信机制

模块化管理：支持创建独立的模块级事件总线

可追踪性：内置日志系统，便于开发调试

灵活性：支持多种事件监听和触发方式

### 核心功能

```typescript
// 普通订阅
const dispose = eventBus.on('eventName', (data) => {
    console.log('接收到数据:', data);
});

// 优先级订阅
eventBus.prependListener('eventName', (data) => {
    console.log('我会先执行');
});

// 触发事件
eventBus.emit('eventName', { key: 'value' });

// 取消特定监听
eventBus.off('eventName', listener);

// 清理所有监听
eventBus.removeAllListeners('eventName');

// 设置最大监听器数量
eventBus.setMaxListeners(20);
```

### 如何使用

事件总线采用了分层设计在引擎内使用

##### 全局事件总线（Editor）

处理跨模块通信，具体事项可参考editor.ts（核心编辑器(Editor)）

##### 模块级事件总线

处理模块内部通信，只需要在每个具体的功能的实现中去创建一个事件总线实例即可，你可以在很多功能模块都看到`createModuleEventBus`的身影。

```typescript
// 创建编辑器事件总线
const editorEventBus = createModuleEventBus('editor');

// 监听状态变化
editorEventBus.on('stateChange', (newState) => {
    updateUI(newState);
});

// 触发状态更新
editorEventBus.emit('stateChange', { isModified: true });
```

##### 插件事件总线

处理插件系统通信，每个插件引擎提供的上下文就会创建一个事件总线。

```typescript
		context.event = new Event(commonEvent, { prefix: eventPrefix });
```





## 核心编辑器(Editor)

### 简介

Editor 类是一个核心编辑器实现，用于管理编辑器的状态、配置、事件和资源。它提供了一个完整的编辑器生命周期管理系统，包括初始化、状态管理、事件处理等功能。

### 主要特性


- **全局状态管理**：通过 context 存储和管理编辑器的全局状态
- **事件系统**：基于 EventEmitter 实现的事件总线，支持事件的发布与订阅
- **资源管理**：支持本地和远程组件的加载和管理
- **钩子系统**：提供可扩展的钩子机制，支持编辑器生命周期的干预
- **配置系统**：支持自定义编辑器配置和组件配置

### 使用指南

#### 创建和初始化

```typescript
// 第一步：在engine-core.ts也就是引擎初始化的时候创建实例
const editor = new Editor();

// 第二步：在整个微码引擎组件引入的时候初始化，通过Workbench.tsx的组件传值调用buildFromConfig传入
// config在引擎组件调用的地方当父子组件传值的方式设置
const config: EditorConfig = {
	lifeCycles: {
		init: (e: any) => {
			console.log('init', e);
		},
		destroy: (e: any) => {
			console.log('destroy', e);
		},
	},
};
// config提供骨架配置、主题配置、插件配置、钩子配置、快捷键配置、工具配置、常量配置、生命周期配置、国际化配置
await editor.init(config);
```

#### 状态管理

编辑器提供了一套完整的状态管理机制：

```typescript
// 设置状态
editor.set('myKey', 'myValue');
// 获取状态
const value = editor.get('myKey');
// 检查状态是否存在
const exists = editor.has('myKey');
// 监听状态变化
const unsubscribe = editor.onChange('myKey', (newValue) => {
console.log('值发生变化:', newValue);
});
// 取消监听
unsubscribe();
```

#### 资源管理

支持加载本地和远程组件元数据：

```typescript
await editor.setAssets({
  components: [
    // 本地组件
    {
    	componentName: 'Button',
    	title: '按钮',
    	props: {
    	// 组件属性配置
    	}
    },
    	// 远程组件
  ]
});

```

#### 事件系统

基于 EventEmitter 的事件处理：

```typescript
// 注册事件监听
editor.on('assets', (data) => {
  // 在组件面板动态的增加组件
});
// 注册一次性事件监听
editor.once('assets', (data) => {
console.log('这个处理器只会执行一次');
});
// 触发事件
editor.emit('assets', { ...... });
// 移除事件监听
editor.removeListener('assets', handler);
```

#### 钩子系统

提供可扩展的钩子机制：因为Editor实现了EventEmitter，EventEmitter提供了`on`和`once`的api，所以registerHooks相当于通过事件总线机制注册了

`editor.on("beforeSave",()=>{})`、`editor.once("afterInit",()=>{})`，通过`editor.emit('beforeSave')`、`editor.emit('afterInit')`

```typescript
// 在引擎组件调用的地方当父子组件传值的方式设置
editor.registerHooks([
  {
    type: 'on',
    message: 'beforeSave',
    handler: (editor, data) => {
    	// 处理保存前的逻辑
    	return data;
    }
  },
  {
    type: 'once',
    message: 'afterInit',
    handler: (editor) => {
   		// 编辑器初始化后的一次性处理
    }
  }
]);
// 注销钩子
editor.unregisterHooks();
```



## 配置管理模块 (EngineConfig)

### 简介

EngineConfig 是微码引擎的核心配置管理模块,用于管理引擎运行时的各项配置。该模块提供了配置项的存储、读取、监听等功能,并支持严格模式下的配置项校验。

### 核心特性

- 支持同步/异步方式获取配置
- 支持配置项变更监听
- 支持严格模式配置校验
- 支持配置默认值
- 支持批量配置设置

### API

#### 配置项管理

```typescript
// 设置单个配置
engineConfig.set('key', value);

// 批量设置配置
engineConfig.setConfig({
  key1: value1,
  key2: value2
});

// 获取配置
const value = engineConfig.get('key', defaultValue);

// 检查配置是否存在
const exists = engineConfig.has('key');
```

#### 异步配置获取

```typescript
// 一次性获取(Promise)
const value = await engineConfig.onceGot('key');

// 监听模式
const unsubscribe = engineConfig.onGot('key', (value) => {
  console.log('配置更新:', value);
});

// 取消监听
unsubscribe();
```

#### 严格模式配置项

在严格模式下(`enableStrictPluginMode=true`),只接受以下预定义的配置项:

| 配置项 | 类型 | 默认值 | 说明 |
|--------|------|--------|------|
| enableCondition | boolean | - | 是否开启 condition 能力 |
| designMode | string | 'design' | 设计模式,'design'或'live' |
| device | string | 'default' | 设备类型 |
| deviceClassName | string | - | 画布顶层节点的设备类名 |
| locale | string | 'zh-CN' | 语言设置 |
| renderEnv | string | 'react' | 渲染器类型 |
| deviceMapper | object | - | 设备类型映射器 |
| enableStrictPluginMode | boolean | true | 是否开启严格插件模式 |
| enableReactiveContainer | boolean | false | 是否开启拖拽容器视觉反馈 |
| disableAutoRender | boolean | false | 是否关闭画布自动渲染 |
| disableDetecting | boolean | false | 是否关闭拖拽组件虚线响应 |
| disableDefaultSettingPanel | boolean | false | 是否禁用默认设置面板 |
| disableDefaultSetters | boolean | false | 是否禁用默认设置器 |
| enableCanvasLock | boolean | false | 是否开启画布锁定 |
| enableLockedNodeSetting | boolean | false | 锁定容器是否可设置属性 |
| stayOnTheSameSettingTab | boolean | false | 切换节点是否保持相同设置页签 |
| supportVariableGlobally | boolean | false | 是否全局支持变量配置 |
| enableAutoOpenFirstWindow | boolean | true | 是否自动打开第一个窗口 |
| enableWorkspaceMode | boolean | false | 是否开启应用级设计模式 |
| enableContextMenu | boolean | false | 是否开启右键菜单 |
| hideComponentAction | boolean | false | 是否隐藏设计器辅助层 |

### 使用示例

整个引擎使用单例模式创建了一个全局的`engineConfig`

```typescript
// 初始化配置
const engineConfig = new EngineConfig();

// 设置引擎配置
config.setEngineOptions({
  designMode: 'design',
  locale: 'zh-CN',
  enableStrictPluginMode: true,
  device: 'default'
});

// 获取配置
const locale = config.get('locale');

// 监听配置变化
const unsubscribe = config.onGot('designMode', (mode) => {
  console.log('设计模式变更为:', mode);
});

// 异步等待配置
async function init() {
  const device = await config.onceGot('device');
  console.log('当前设备类型:', device);
}

// 取消监听
unsubscribe();
```

### 注意事项

1. 在严格模式下,只能设置预定义的配置项,其他配置项会被忽略并输出警告
2. `onceGot()` 返回 Promise,只会执行一次
3. `onGot()` 返回取消监听函数,可用于清理监听器
4. 建议使用 TypeScript 获得更好的类型提示
5. 配置项的变更会立即生效
6. 在使用异步获取配置时要注意处理异常情况

# 国际化(i18n)

## 简介

国际化模块提供了一套完整的多语言解决方案,支持动态切换语言、变量插值等功能(editor-core/intl)。主要
包含以下特性:

- 支持多语言切换
- 支持变量插值
- 支持组件方式使用
- 支持语言回退机制
- 支持从多个数据源获取语言配置

## 基础用法

### 1. 直接使用 intl 函数

```typescript
import { intl } from '@arvin-shu/microcode-editor-core';

// 基础使用
const message = intl({
    'zh-CN': '你好',
    'en-US': 'Hello',
});

// 带变量插值
const welcome = intl(
    {
        'zh-CN': '你好, {name}',
        'en-US': 'Hello, {name}',
    },
    {
        name: 'World',
    }
);

// 支持嵌套对象的国际化
const data = {
    title: {
        'zh-CN': '标题',
        'en-US': 'Title',
    },
    content: {
        'zh-CN': '内容',
        'en-US': 'Content',
    },
};
const result = shallowIntl(data);
```

### 2. 创建独立的国际化实例

```typescript
import { createIntl } from '@arvin-shu/microcode-editor-core';

// 方式一：从对象创建
const i18n = createIntl({
    'zh-CN': {
        hello: '你好',
        welcome: '欢迎, {name}',
    },
    'en-US': {
        hello: 'Hello',
        welcome: 'Welcome, {name}',
    },
});

// 方式二：从全局变量创建
// window.MICROCODE_MESSAGES 需要包含多语言配置
const i18n = createIntl('MICROCODE_MESSAGES');

// 使用方法
i18n.intl('hello'); // 你好
i18n.intl('welcome', { name: 'World' }); // 欢迎, World

// 在 Vue 组件中使用
i18n.intlNode('hello');
```

## 在 Vue 组件中使用

### 1. 使用 intlNode

```vue
<template>
    <div>
        <!-- 基础用法 -->
        <div>{{ i18n.intlNode('hello') }}</div>

        <!-- 带参数 -->
        <div>{{ i18n.intlNode('welcome', { name: userName }) }}</div>
    </div>
</template>

<script setup lang="ts">
import { createIntl } from '@arvin-shu/microcode-editor-core';

 const i18n = createIntl({
            'zh-CN': {
                hello: '你好',
                welcome: '欢迎, {name}',
            },
            'en-US': {
                hello: 'Hello',
                welcome: 'Welcome, {name}',
            },
        });
</script>
```

## 语言设置

### 获取当前语言

```typescript
import { globalLocale } from '@arvin-shu/microcode-editor-core';

const currentLocale = globalLocale.getLocale();
```

### 切换语言

```typescript
globalLocale.setLocale('en-US');
```

### 监听语言变化

```typescript
const unsubscribe = globalLocale.onChangeLocale((locale) => {
    console.log('语言已切换为:', locale);
});

// 取消监听
unsubscribe();
```

## 配置持久化

语言配置会自动保存在 localStorage 中，键名为 `arvin-microcode-config`。格式如
下：

```json
{
    "locale": "zh-CN"
}
```

## 语言获取优先级

系统会按照以下优先级获取当前使用的语言:

1. 用户手动设置的语言 (通过 setLocale)
2. localStorage 中存储的语言配置
3. window 全局配置中的语言设置 (window.locale 或 window.g_config.locale 或
   window.pageConfig.locale)
4. 浏览器系统语言 (navigator.language 或 navigator.browserLanguage)
5. 默认使用 'zh-CN'

## 支持的语言

目前支持以下语言:

- 简体中文 (zh-CN)
- 繁体中文 (zh-TW)
- 英语 (en-US)
- 日语 (ja-JP)
- 韩语 (ko-KR)
- 德语 (de-DE)
- 法语 (fr-FR)
- 西班牙语 (es-ES)
- 葡萄牙语 (pt-PT)
- 意大利语 (it-IT)
- 俄语 (ru-RU)
- 阿拉伯语 (ar-SA)
- 土耳其语 (tr-TR)
- 泰语 (th-TH)
- 越南语 (vi-VN)
- 荷兰语 (nl-NL)
- 希伯来语 (iw-IL)
- 印尼语 (in-ID)
- 波兰语 (pl-PL)
- 印地语 (hi-IN)
- 乌克兰语 (uk-UA)
- 马来语 (ms-MY)
- 他加禄语 (tl-PH)

## 语言回退机制

当请求的语言不存在时,系统会按照以下顺序尝试查找:

1. 当前语言 (例如: zh-TW)
2. 替换分隔符后的语言 (例如: zh_TW)
3. 对于中文繁体和英文:
   - 如果是 zh-TW 或 en-US,回退到 zh-CN
4. 对于其他语言:
   - 先尝试 en-US
   - 如果不是中文,最后尝试 zh-CN

如果所有尝试都失败,将返回 `##intl@{locale}##` 作为占位符。

## 最佳实践

1. **组件级别的国际化**

   - 对于独立组件，建议使用 createIntl 创建独立的国际化实例
   - 将语言配置文件与组件放在同一目录下

2. **全局级别的国际化**

   - 对于全局共用的文案，建议使用全局配置
   - 可以通过 window 全局变量配置

3. **动态语言切换**

   - 在切换语言时，注意及时更新相关组件
   - 可以利用 Vue 的响应式特性自动更新

4. **错误处理**
   - 始终提供默认语言(zh-CN)作为兜底
   - 对于未找到的文案，使用占位符标识

## 注意事项

1. 在使用 createIntl 时，确保提供的语言配置对象结构正确
2. 变量插值使用 {varName} 格式
3. 注意及时取消语言变化的监听，避免内存泄漏
4. localStorage 不可用时会自动降级使用其他配置源
5. 建议在应用启动时就确定好默认语言，避免频繁切换

