import {
	IPublicTypePanelConfig,
	IPublicTypePanelConfigProps,
	IPublicTypePanelDockProps,
	IPublicTypeTitleContent,
	IPublicTypeWidgetBaseConfig,
	IPublicTypeWidgetConfigArea,
} from '@arvin-shu/microcode-types';
import { Component, VNode } from 'vue';
import { IWidget } from './widget';

export interface DockProps extends IPublicTypePanelDockProps {}

export interface IDockBaseConfig extends IPublicTypeWidgetBaseConfig {
	props?: DockProps & {
		align?: 'left' | 'right' | 'bottom' | 'center' | 'top';
		onInit?: (widget: IWidget) => void;
	};
}

// 按钮弹窗扩展
export interface DialogDockConfig extends IDockBaseConfig {
	type: 'DialogDock';
	dialogProps?: {
		[key: string]: any;
		title?: IPublicTypeTitleContent;
	};
}

export interface DividerConfig extends IPublicTypeWidgetBaseConfig {
	type: 'Divider';
	props?: {
		align?: 'left' | 'right' | 'center';
	};
}

export function isDividerConfig(obj: any): obj is DividerConfig {
	return obj && obj.type === 'Divider';
}

export interface DockConfig extends IDockBaseConfig {
	type: 'Dock';
	content?: string | VNode | Component;
}

export function isDockConfig(obj: any): obj is DockConfig {
	return obj && /Dock$/.test(obj.type);
}

export interface WidgetConfig extends IPublicTypeWidgetBaseConfig {
	type: 'Widget';
	props?: {
		align?: 'left' | 'right' | 'bottom' | 'center' | 'top';
		onInit?: (widget: IWidget) => void;
		title?: IPublicTypeTitleContent | null;
	};
	content?: string | VNode | Component;
}

export function isPanelConfig(obj: any): obj is IPublicTypePanelConfig {
	return obj && obj.type === 'Panel';
}

export interface PanelDockConfig extends IDockBaseConfig {
	type: 'PanelDock';
	panelName?: string;
	panelProps?: IPublicTypePanelConfigProps & {
		area?: IPublicTypeWidgetConfigArea;
	};
	content?: string | VNode | Component | IPublicTypePanelConfig[]; // content for pane
}

export function isPanelDockConfig(obj: any): obj is PanelDockConfig {
	return obj && obj.type === 'PanelDock';
}
