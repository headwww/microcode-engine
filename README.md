# 模块分析

## 事件通信模块

- 方便模块之间的通信
- 细粒度的追踪系统事件
- 使得模块和模块之间通信更加方便

核心类 EventBus、Event、Editor，目前已知Editor实例管理一条总线，commonEvent管理一条纵线

### event-bus.ts

简化了 EventEmitter 的复杂性，统一事件的管理

提供统一的事件处理接口

添加了日志、前缀等额外功能

提供了**createModuleEventBus**函数方便模块创建自己的事件总线

### editor.ts

设计一个编辑器Editor继承自EventEmitter，内部实例化了一个EventBus，将自身传递给了EventBus

用于管理。

职责：事件管理与通信，资源管理，配置管理，生命周期管理

使用：在engine-core的时候初始化这个实例，初始化实例的构造器中初始化了EventBus实例，实例化后会在skeleton中调用init函数初始化编辑器，在init的时候可以通过Skeleton组件传递一下EditorConfig，EditorConfig是提供了一个统一的配置结构，使得编辑器的各个部分可以被灵活配置例如SkeletonConfig、HookConfig、PluginsConfig等







## 入料模块

核心类 Material

设计思路 利用Editor实例带的特性（详见Editor介绍）来管理物料资产

入料流程：资产包协议，在自定义插件中通过material来注册物料，因为内置插件**componentMetaParser**中设置了material.onChangeAssets这个监听，它监听了assets的变化，当自定义插件物料完成注册则通知内置插件来完成designer物料元数据实例ComponentMeta的组装。

```typescript

/**
 * 资产包协议
 */
export interface IPublicTypeAssetsJson {
	/**
	 * 资产包协议版本号
	 */
	version: string;

	/**
	 *  低代码编辑器中加载的资源列表，packages中的资源是在渲染器中加载的
	 */
	packages?: IPublicTypePackage[];

	/**
	 * 所有组件的描述协议列表所有组件的列表,本地协议和远程协议
	 * 通过editor.setAssets解析，解析完格式IPublicTypeComponentMetadata用于ComponentMeta实例的构建
	 */
	components: Array<
		IPublicTypeComponentDescription | IPublicTypeRemoteComponentDescription
	>;

	/**
	 * 用于描述组件面板中的 tab 和 category
	 */
	sort?: IPublicTypeComponentSort;
}
```

ComponentMeta职责：

