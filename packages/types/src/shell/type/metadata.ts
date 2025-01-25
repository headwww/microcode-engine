import { IPublicModelNode } from '../model';
import { IPublicTypeComponentAction } from './component-action';
import { IPublicTypePropType } from './prop-types';

/**
 * children 内容是纯文本，支持双击直接编 的可配置项目
 */
export interface IPublicTypeLiveTextEditingConfig {
	propTarget: string;

	selector?: string;

	/**
	 * 编辑模式 纯文本 | 段落编辑 | 文章编辑（默认纯文本，无跟随工具条）
	 * @default 'plaintext'
	 */
	mode?: 'plaintext' | 'paragraph' | 'article';

	/**
	 * 从 contentEditable 获取内容并设置到属性
	 */
	onSaveContent?: (content: string, prop: any) => any;
}

/**
 * 嵌套控制函数
 */
export type IPublicTypeNestingFilter = (
	testNode: any,
	currentNode: any
) => boolean;

/**
 * 嵌套控制
 * 防止错误的节点嵌套，比如 a 嵌套 a, FormField 只能在 Form 容器下，Column 只能在 Table 下等
 */
export interface IPublicTypeNestingRule {
	/**
	 * 子级白名单
	 */
	childWhitelist?: string[] | string | RegExp | IPublicTypeNestingFilter;

	/**
	 * 父级白名单
	 */
	parentWhitelist?: string[] | string | RegExp | IPublicTypeNestingFilter;

	/**
	 * 后裔白名单
	 */
	descendantWhitelist?: string[] | string | RegExp | IPublicTypeNestingFilter;

	/**
	 * 后裔黑名单
	 */
	descendantBlacklist?: string[] | string | RegExp | IPublicTypeNestingFilter;

	/**
	 * 祖先白名单 可用来做区域高亮
	 */
	ancestorWhitelist?: string[] | string | RegExp | IPublicTypeNestingFilter;
}

export type ConfigureSupportEvent = string | ConfigureSupportEventConfig;

export interface ConfigureSupportEventConfig {
	name: string;
	propType?: IPublicTypePropType;
	description?: string;
	template?: string;
}

/**
 *   通用扩展面板支持性配置
 */
export interface ConfigureSupport {
	/**
	 * 支持事件列表
	 */
	events?: ConfigureSupportEvent[];

	/**
	 * 支持 className 设置
	 */
	className?: boolean;

	/**
	 * 支持样式设置
	 */
	style?: boolean;

	/**
	 * 支持生命周期设置
	 */
	lifecycles?: any[];

	// general?: boolean;
	/**
	 * 支持循环设置
	 */
	loop?: boolean;

	/**
	 * 支持条件式渲染设置
	 */
	condition?: boolean;
}

/**
 * 组件能力配置
 */
export interface IPublicTypeComponentConfigure {
	/**
	 * 是否容器组件
	 */
	isContainer?: boolean;
	/**
	 * 组件是否带浮层，浮层组件拖入设计器时会遮挡画布区域，此时应当辅助一些交互以防止阻挡
	 */
	isModal?: boolean;

	/**
	 * 组件树描述信息
	 */
	descriptor?: string;

	/**
	 * 嵌套控制：防止错误的节点嵌套
	 * 比如 a 嵌套 a, FormField 只能在 Form 容器下，Column 只能在 Table 下等
	 */
	nestingRule?: IPublicTypeNestingRule;

	/**
	 * 是否是最小渲染单元
	 *
	 * 最小渲染单元下的组件渲染和更新都从单元的根节点开始渲染和更新。如果嵌套了多层最小渲染单元，
	 * 渲染会从最外层的最小渲染单元开始渲染。
	 *
	 * 性能优化：
	 * - 当表格内的某个输入框值改变时，如果没有设置 isMinimalRenderUnit，可能会触发整个表单的重新渲染
	 * - 设置后，只会从表格这个组件开始重新渲染，表格以外的组件不受影响
	 *
	 * 更新范围控制：
	 * - 假设用户在低代码编辑器中修改了表格内某个列的配置
	 * - 有 isMinimalRenderUnit 时，只会刷新表格组件
	 * - 没有时，可能会导致整个表单重新渲染
	 *
	 * 嵌套情况：
	 * - 如果有多层 isMinimalRenderUnit，比如表格在一个 Tab 面板内
	 * - 更新时会从最外层的最小渲染单元开始渲染（即 Tab 面板）
	 *
	 * 简单来说就是：
	 * - 这个属性就像在说："这个组件和它的子组件是一个整体，有任何更新就作为一个整体重新渲染"
	 * - 特别适合用于表格、列表等包含大量子组件的复杂组件
	 * - 可以有效防止不必要的父组件重渲染，提高性能
	 */
	isMinimalRenderUnit?: boolean;

	/**
	 * 组件选中框的 cssSelector
	 * 用于指定组件在画布中的根 DOM 节点的 CSS 选择器
	 * 引擎会通过该选择器找到组件的根节点，用于定位组件、显示选中框等交互功能
	 * 例如 '.my-dialog' 用于定位 Dialog 组件的根节点
	 * 当用户要操作这个组件时，请看这里（.my-dialog），这才是组件的真正主体，在这个主体
	 * 外围显示选中框、拖拽手柄等交互元素
	 */
	rootSelector?: string;
	/**
	 * 禁用的行为，可以为 `'copy'`, `'move'`, `'remove'` 或它们组成的数组
	 */
	disableBehaviors?: string[] | string;

	/**
	 * 用于详细配置上述操作项的内容
	 */
	actions?: IPublicTypeComponentAction[];
}

/**
 * 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等
 */
export interface IPublicTypeCallbacks {
	onMouseDownHook?: (
		e: MouseEvent,
		currentNode: IPublicModelNode | null
	) => any;
	/** 选中 hook，如果返回值是 false，可以控制组件不可被选中 */
	onSelectHook?: (currentNode: IPublicModelNode) => boolean;
	onClickHook?: (e: MouseEvent, currentNode: IPublicModelNode | null) => any;
	onChildMoveHook?: (
		childNode: IPublicModelNode,
		currentNode: IPublicModelNode
	) => boolean;

	// events
	onNodeRemove?: (
		removedNode: IPublicModelNode | null,
		currentNode: IPublicModelNode | null
	) => void;
	onNodeAdd?: (
		addedNode: IPublicModelNode | null,
		currentNode: IPublicModelNode | null
	) => void;

	onSubtreeModified?: (currentNode: IPublicModelNode, options: any) => void;
	/**
	 * 移动 hook，如果返回值是 false，可以控制组件不可被移动
	 */
	onMoveHook?: (currentNode: IPublicModelNode) => boolean;

	// thinkof 限制性拖拽
	onHoverHook?: (currentNode: IPublicModelNode) => boolean;
}
