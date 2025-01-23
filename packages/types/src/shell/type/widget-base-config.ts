import { Component, VNode } from 'vue';
import { IPublicTypeWidgetConfigArea } from './widget-config-area';
import { TipContent } from './tip-content';
import { IPublicTypeIconType } from './icon-type';
import { IPublicTypeTitleContent } from './title-content';
import { IPublicTypeI18nData } from './i8n-data';

export type IPublicTypeHelpTipConfig =
	| string
	| {
			url?: string;
			content?: string | VNode;
	  };

export interface IPublicTypePanelConfigProps
	extends IPublicTypePanelDockPanelProps {
	title?: IPublicTypeTitleContent;
	icon?: any; // 冗余字段
	description?: string | IPublicTypeI18nData;
	help?: IPublicTypeHelpTipConfig; // 显示问号帮助
	hiddenWhenInit?: boolean; //  when this is true, by default will be hidden
	condition?: (widget: any) => any;
	onInit?: (widget: any) => any;
	onDestroy?: () => any;
	shortcut?: string; // 只有在特定位置，可触发 toggle show
	enableDrag?: boolean; // 是否开启通过 drag 调整 宽度
	keepVisibleWhileDragging?: boolean; // 是否在该 panel 范围内拖拽时保持 visible 状态
}

/**
 * 所有部件的基础配置
 */
export interface IPublicTypeWidgetBaseConfig {
	[extra: string]: any;

	/**
	 * 组件类型
	 */
	type: string;

	/**
	 * 组件名称
	 */
	name: string;

	/**
	 * 停靠位置：
	 * - 当 type 为 'Panel' 时自动为 'leftFloatArea'；
	 * - 当 type 为 'Widget' 时自动为 'mainArea'；
	 * - 其他时候自动为 'leftArea'；
	 */
	area?: IPublicTypeWidgetConfigArea;

	/**
	 * 组件自定义属性
	 */
	props?: Record<string, any>;

	/**
	 * 组件的实现
	 */
	content?: string | VNode | Component | IPublicTypePanelConfig[];

	contentProps?: Record<string, any>;

	/**
	 * 优先级，值越小，优先级越高，优先级越高的排列越靠前
	 */
	index?: number;
}

/**
 * Panel方式展示的组件的基础配置
 */
export interface IPublicTypePanelConfig extends IPublicTypeWidgetBaseConfig {
	type: 'Panel';
	content?: string | VNode | Component | Array<IPublicTypePanelConfig>;
	props?: IPublicTypePanelConfigProps;
}

/**
 * 停靠面板的配置
 */
export interface IPublicTypePanelDockConfig
	extends IPublicTypeWidgetBaseConfig {
	type: 'PanelDock';

	panelProps?: IPublicTypePanelDockPanelProps;

	props?: IPublicTypePanelDockProps;

	/** 面板 name, 当没有 props.title 时, 会使用 name 作为标题 */
	name: string;
}

export interface IPublicTypePanelDockProps {
	[key: string]: any;

	size?: 'small' | 'medium' | 'large';

	className?: string;

	/** 详细描述，hover 时在标题上方显示的 tips 内容 */
	description?: TipContent;

	onClick?: () => void;

	/**
	 * 面板标题前的 icon
	 */
	icon?: IPublicTypeIconType;

	/**
	 * 面板标题
	 */
	title?: IPublicTypeTitleContent;
}
/**
 * 停靠面板的具体实现属性
 */
export interface IPublicTypePanelDockPanelProps {
	[key: string]: any; // 允许任意属性

	hideTitleBar?: boolean; // 控制面板顶部条的显示与隐藏

	width?: number; // 面板的宽度

	height?: number; // 面板的高度

	maxWidth?: number; // 面板的最大宽度

	maxHeight?: number; // 面板的最大高度

	area?: IPublicTypeWidgetConfigArea; // 面板所在的区域配置
}

export type IPublicTypeSkeletonConfig =
	| IPublicTypePanelDockConfig
	| IPublicTypeWidgetBaseConfig;
