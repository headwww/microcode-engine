import { Component, VNode } from 'vue';
import { IPublicModelEditor, IPublicTypeNpmInfo } from './shell';

export interface EditorConfig {
	skeleton?: SkeletonConfig; // 骨架配置
	theme?: ThemeConfig; // 主题配置
	plugins?: PluginsConfig; // 插件配置
	hooks?: HooksConfig; // 钩子配置
	shortCuts?: ShortCutsConfig; // 快捷键配置
	utils?: UtilsConfig; // 工具配置
	constants?: ConstantsConfig; // 常量配置
	lifeCycles?: LifeCyclesConfig; // 生命周期配置
	i18n?: I18nConfig; // 国际化配置
}
export interface SkeletonConfig {
	config: IPublicTypeNpmInfo;
	props?: Record<string, unknown>;
	handler?: (config: EditorConfig) => EditorConfig;
}

export interface Theme {
	package: string;
	version: string;
}

export interface ThemeConfig {
	fusion?: Theme;
}

export interface PluginsConfig {
	[key: string]: PluginConfig[];
}

export interface PluginConfig {
	pluginKey: string;
	type: string;
	props: {
		icon?: string;
		title?: string;
		width?: number;
		height?: number;
		visible?: boolean;
		disabled?: boolean;
		marked?: boolean;
		align?: 'left' | 'right' | 'top' | 'bottom';
		onClick?: () => void;
		dialogProps?: Record<string, unknown>;
		balloonProps?: Record<string, unknown>;
		panelProps?: Record<string, unknown>;
		linkProps?: Record<string, unknown>;
	};
	config?: IPublicTypeNpmInfo;
	pluginProps?: Record<string, unknown>;
}

export type HooksConfig = HookConfig[];

export interface HookConfig {
	message: string;
	type: 'on' | 'once';
	handler: (
		this: IPublicModelEditor,
		editor: IPublicModelEditor,
		...args: any[]
	) => void;
}

export type ShortCutsConfig = ShortCutConfig[];

export interface ShortCutConfig {
	keyboard: string;
	handler: (editor: IPublicModelEditor, ev: Event, keymaster: any) => void;
}

export type UtilsConfig = UtilConfig[];

export interface UtilConfig {
	name: string;
	type: 'npm' | 'function';
	content: IPublicTypeNpmInfo | ((...args: []) => any);
}

export type ConstantsConfig = Record<string, unknown>;

export interface LifeCyclesConfig {
	init?: (editor: IPublicModelEditor) => any;
	destroy?: (editor: IPublicModelEditor) => any;
}

export type LocaleType = 'zh-CN' | 'zh-TW' | 'en-US' | 'ja-JP';

export interface I18nMessages {
	[key: string]: string;
}

export interface I18nConfig {
	'zh-CN'?: I18nMessages;
	'zh-TW'?: I18nMessages;
	'en-US'?: I18nMessages;
	'ja-JP'?: I18nMessages;
}

export type I18nFunction = (key: string, params: any) => string;

export interface Utils {
	[key: string]: (...args: any[]) => any;
}

export interface PluginProps {
	editor?: IPublicModelEditor;
	config: PluginConfig;
	[key: string]: any;
}

export type Plugin = VNode & {
	open?: () => boolean | undefined | Promise<any>;
	close?: () => boolean | undefined | Promise<any>;
};

export type HOCPlugin = VNode & {
	open: () => Promise<any>;
	close: () => Promise<any>;
};

export interface PluginSet {
	[key: string]: HOCPlugin;
}

export type PluginClass = Component<PluginProps> & {
	init?: (editor: IPublicModelEditor) => void;
	defaultProps?: {
		locale?: LocaleType;
		messages?: I18nMessages;
	};
};

export interface PluginClassSet {
	[key: string]: PluginClass;
}

export interface PluginStatus {
	disabled?: boolean;
	visible?: boolean;
	marked?: boolean;
	locked?: boolean;
}

export interface PluginStatusSet {
	[key: string]: PluginStatus;
}
