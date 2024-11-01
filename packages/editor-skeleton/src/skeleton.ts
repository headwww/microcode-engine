import {
	EditorConfig,
	IPublicApiSkeleton,
	IPublicModelSkeletonItem,
	IPublicTypeConfigTransducer,
	IPublicTypeDisposable,
	IPublicTypePanelConfig,
	IPublicTypeSkeletonConfig,
	IPublicTypeWidgetBaseConfig,
	IPublicTypeWidgetConfigArea,
	PluginClassSet,
} from '@arvin/microcode-types';
import { isPlainObject, Logger } from '@arvin/microcode-utils';
import { isVNode } from 'vue';
import { Divider } from 'ant-design-vue';
import {
	engineConfig,
	FocusTracker,
	IEditor,
} from '@arvin/microcode-editor-core';
import { Area } from './area';
import {
	Dock,
	isPanel,
	isWidget,
	IWidget,
	Panel,
	PanelDock,
	Widget,
	WidgetContainer,
} from './widget';
import {
	DialogDockConfig,
	DividerConfig,
	DockConfig,
	isDividerConfig,
	isDockConfig,
	isPanelConfig,
	isPanelDockConfig,
	PanelDockConfig,
	WidgetConfig,
} from './types';

export enum SkeletonEvents {
	PANEL_DOCK_ACTIVE = 'skeleton.panel-dock.active',
	PANEL_DOCK_UNACTIVE = 'skeleton.panel-dock.unactive',
	PANEL_SHOW = 'skeleton.panel.show',
	PANEL_HIDE = 'skeleton.panel.hide',
	WIDGET_SHOW = 'skeleton.widget.show',
	WIDGET_HIDE = 'skeleton.widget.hide',
	WIDGET_DISABLE = 'skeleton.widget.disable',
	WIDGET_ENABLE = 'skeleton.widget.enable',
}

const logger = new Logger({ level: 'warn', bizName: 'skeleton' });

export interface ISkeleton
	extends Omit<
		IPublicApiSkeleton,
		| 'showPanel'
		| 'hidePanel'
		| 'showWidget'
		| 'enableWidget'
		| 'hideWidget'
		| 'disableWidget'
		| 'showArea'
		| 'onShowPanel'
		| 'onHidePanel'
		| 'onShowWidget'
		| 'onHideWidget'
		| 'remove'
		| 'hideArea'
		| 'add'
		| 'getPanel'
	> {
	editor: IEditor;

	readonly topArea: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;
	readonly toolbar: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;

	readonly leftArea: Area<DockConfig | PanelDockConfig | DialogDockConfig>;

	readonly leftFloatArea: Area<IPublicTypePanelConfig, Panel>;

	readonly leftFixedArea: Area<IPublicTypePanelConfig, Panel>;

	readonly rightArea: Area<IPublicTypePanelConfig, Panel>;

	readonly bottomArea: Area<IPublicTypePanelConfig, Panel>;

	readonly subTopArea: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;

	readonly mainArea: Area<
		WidgetConfig | IPublicTypePanelConfig,
		Widget | Panel
	>;

	readonly stages: Area;

	readonly widgets: IWidget[];

	readonly focusTracker: FocusTracker;

	postEvent(event: SkeletonEvents, ...args: any[]): void;

	getPanel(name: string): Panel | undefined;

	getWidget(name: string): IWidget | undefined;

	toggleFloatStatus(panel: Panel): void;

	buildFromConfig(config?: EditorConfig, components?: PluginClassSet): void;

	registerConfigTransducer(
		transducer: IPublicTypeConfigTransducer,
		level: number,
		id?: string
	): void;

	/**
	 * 创建并返回一个 WidgetContainer 对象
	 *
	 * @param name 为 WidgetContainer 指定一个名称
	 * @param handle 这是一个处理函数，用于将传入的项目 (item) 转换为容器的标准类型
	 * @param exclusive 用于控制容器是否是独占模式
	 * @param checkVisible 这是一个检查容器是否可见的回调函数
	 * @param defaultSetCurrent 控制容器在初始化时是否自动设置一个默认的当前激活组件
	 */
	createContainer(
		name: string,
		handle: (item: any) => any,
		exclusive?: boolean,
		checkVisible?: () => boolean,
		defaultSetCurrent?: boolean
	): WidgetContainer;

	createPanel(config: IPublicTypePanelConfig): Panel;

	add(
		config: IPublicTypeSkeletonConfig,
		extraConfig?: Record<string, any>
	): IWidget | Widget | Panel | Dock | PanelDock | undefined;
}

export class Skeleton implements ISkeleton {
	private panels = new Map<string, Panel>();

	private configTransducers: IPublicTypeConfigTransducer[] = [];

	private containers = new Map<string, WidgetContainer<any>>();

	readonly leftArea: Area<DockConfig | PanelDockConfig | DialogDockConfig>;

	readonly topArea: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;

	readonly toolbar: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;

	readonly mainArea: Area<
		WidgetConfig | IPublicTypePanelConfig,
		Widget | Panel
	>;

	readonly leftFloatArea: Area<IPublicTypePanelConfig, Panel>;

	readonly leftFixedArea: Area<IPublicTypePanelConfig, Panel>;

	readonly rightArea: Area<IPublicTypePanelConfig, Panel>;

	readonly bottomArea: Area<IPublicTypePanelConfig, Panel>;

	readonly subTopArea: Area<
		DockConfig | DividerConfig | PanelDockConfig | DialogDockConfig
	>;

	readonly widgets: IWidget[] = [];

	readonly stages: Area;

	readonly focusTracker = new FocusTracker();

	constructor(
		readonly editor: IEditor,
		readonly viewName: string = 'global'
	) {
		this.leftArea = new Area(
			this,
			'leftArea',
			(config) => {
				if (isWidget(config)) {
					return config;
				}
				return this.createWidget(config);
			},
			false
		);
		this.topArea = new Area(
			this,
			'topArea',
			(config) => {
				if (isWidget(config)) {
					return config;
				}
				return this.createWidget(config);
			},
			false
		);
		this.toolbar = new Area(
			this,
			'toolbar',
			(config) => {
				if (isWidget(config)) {
					return config;
				}
				return this.createWidget(config);
			},
			false
		);
		this.leftFloatArea = new Area(
			this,
			'leftFloatArea',
			(config) => {
				if (isPanel(config)) {
					return config;
				}
				return this.createPanel(config);
			},
			true
		);

		this.leftFixedArea = new Area(
			this,
			'leftFixedArea',
			(config) => {
				if (isPanel(config)) {
					return config;
				}
				return this.createPanel(config);
			},
			true
		);

		this.rightArea = new Area(
			this,
			'rightArea',
			(config) => {
				if (isPanel(config)) {
					return config;
				}
				return this.createPanel(config);
			},
			false,
			true
		);
		this.bottomArea = new Area(
			this,
			'bottomArea',
			(config) => {
				if (isPanel(config)) {
					return config;
				}
				return this.createPanel(config);
			},
			true
		);

		this.setupEvents();
		this.focusTracker.mount(window);
	}

	getAreaItems(
		areaName: IPublicTypeWidgetConfigArea
	): IPublicModelSkeletonItem[] | undefined {
		throw new Error(`Method not implemented.${areaName}`);
	}

	onDisableWidget(
		listener: (paneName?: string, panel?: IPublicModelSkeletonItem) => void
	): IPublicTypeDisposable {
		throw new Error(`Method not implemented.${listener}`);
	}

	onEnableWidget(
		listener: (paneName?: string, panel?: IPublicModelSkeletonItem) => void
	): IPublicTypeDisposable {
		throw new Error(`Method not implemented.${listener}`);
	}

	setupEvents() {
		this.editor.eventBus.on(SkeletonEvents.PANEL_SHOW, (panelName, panel) => {
			const panelNameKey = `${panelName}-pinned-status-isFloat`;
			const isInFloatAreaPreferenceExists = engineConfig
				.getPreference()
				?.contains(panelNameKey, 'skeleton');

			if (isInFloatAreaPreferenceExists) {
				const isInFloatAreaFromPreference = engineConfig
					.getPreference()
					?.get(panelNameKey, 'skeleton');
				const isCurrentInFloatArea =
					isPanel(panel) && panel?.isChildOfFloatArea();
				if (isInFloatAreaFromPreference !== isCurrentInFloatArea) {
					this.toggleFloatStatus(panel);
				}
			}
		});
	}

	toggleFloatStatus(panel: Panel) {
		const isFloat = panel?.parent?.value?.name === 'leftFloatArea';
		if (isFloat) {
			this.leftFloatArea.remove(panel);
			this.leftFixedArea.add(panel);
			this.leftFixedArea.container.active(panel);
		} else {
			this.leftFixedArea.remove(panel);
			this.leftFloatArea.add(panel);
			this.leftFloatArea.container.active(panel);
		}
		engineConfig
			.getPreference()
			.set(`${panel.name}-pinned-status-isFloat`, !isFloat, 'skeleton');
	}

	buildFromConfig(config?: EditorConfig, components: PluginClassSet = {}) {
		if (config) {
			this.editor.init(config, components);
		}
		this.setupPlugins();
	}

	private setupPlugins() {
		const { config, components = {} } = this.editor;
		if (!config) {
			return;
		}

		const { plugins } = config;
		if (!plugins) {
			return;
		}
		Object.keys(plugins).forEach((area) => {
			plugins[area].forEach((item) => {
				const { pluginKey, type, props = {}, pluginProps } = item;
				const config: IPublicTypeWidgetBaseConfig = {
					area: area as IPublicTypeWidgetConfigArea,
					type: 'Widget',
					name: pluginKey,
					contentProps: pluginProps,
				};
				const {
					dialogProps,
					balloonProps,
					panelProps,
					linkProps,
					...restProps
				} = props;
				config.props = restProps;
				if (dialogProps) {
					config.dialogProps = dialogProps;
				}
				if (balloonProps) {
					config.balloonProps = balloonProps;
				}
				if (panelProps) {
					config.panelProps = panelProps;
				}
				if (linkProps) {
					config.linkProps = linkProps;
				}
				if (type === 'TabPanel') {
					config.type = 'Panel';
				} else if (/Icon$/.test(type)) {
					config.type = type.replace('Icon', 'Dock');
				}
				if (pluginKey in components) {
					config.content = components[pluginKey];
				}
				this.add(config);
			});
		});
	}

	createContainer(
		name: string,
		handle: (item: any) => any,
		exclusive?: boolean,
		checkVisible?: () => boolean,
		defaultSetCurrent?: boolean
	): WidgetContainer {
		const container = new WidgetContainer(
			name,
			handle,
			exclusive,
			checkVisible,
			defaultSetCurrent
		);
		this.containers.set(name, container);
		return container;
	}

	postEvent(event: SkeletonEvents, ...args: any[]) {
		this.editor.eventBus.emit(event, ...args);
	}

	getPanel(name: string): Panel | undefined {
		return this.panels.get(name);
	}

	getWidget(name: string): IWidget | undefined {
		return this.widgets.find((widget) => widget.name === name);
	}

	createWidget(config: IPublicTypeWidgetBaseConfig | IWidget) {
		if (isWidget(config)) {
			return config;
		}
		config = this.parseConfig(config);
		let widget: IWidget;
		if (isDockConfig(config)) {
			if (isPanelDockConfig(config)) {
				widget = new PanelDock(this, config);
			} else {
				widget = new Dock(this, config);
			}
		} else if (isDividerConfig(config)) {
			// 分割线
			widget = new Widget(this, {
				...config,
				type: 'Widget',
				content: Divider,
			});
		} else if (isPanelConfig(config)) {
			widget = this.createPanel(config);
		} else {
			widget = new Widget(this, config as WidgetConfig);
		}
		this.widgets.push(widget!);
		return widget!;
	}

	createPanel(config: IPublicTypePanelConfig) {
		const parsedConfig = this.parseConfig(config);
		const panel = new Panel(this, parsedConfig as IPublicTypePanelConfig);
		this.panels.set(panel.name, panel);
		logger.debug(
			`Panel created with name: ${panel.name} \nconfig:`,
			config,
			'\n current panels: ',
			this.panels
		);
		return panel;
	}

	registerConfigTransducer(
		transducer: IPublicTypeConfigTransducer,
		level = 100,
		id?: string
	) {
		transducer.level = level;
		transducer.id = id;
		const i = this.configTransducers.findIndex(
			(item) => item.level != null && item.level > level
		);
		if (i < 0) {
			this.configTransducers.push(transducer);
		} else {
			this.configTransducers.splice(i, 0, transducer);
		}
	}

	getRegisteredConfigTransducers(): IPublicTypeConfigTransducer[] {
		return this.configTransducers;
	}

	add(config: IPublicTypeSkeletonConfig, extraConfig?: Record<string, any>) {
		const registeredTransducers = this.getRegisteredConfigTransducers();

		const parsedConfig = registeredTransducers.reduce(
			(prevConfig, current) => current(prevConfig),
			{
				...this.parseConfig(config),
				...extraConfig,
			}
		);
		let { area } = parsedConfig;
		// 如果仅设置了type位置设置所属area则根据type来分配所属area
		if (!area) {
			if (parsedConfig.type === 'Panel') {
				area = 'leftFloatArea';
			} else if (parsedConfig.type === 'Widget') {
				area = 'mainArea';
			} else {
				area = 'leftArea';
			}
		}

		switch (area) {
			case 'leftArea':
			case 'left':
				return this.leftArea.add(parsedConfig as PanelDockConfig);
			case 'rightArea':
			case 'right':
				return this.rightArea.add(parsedConfig as IPublicTypePanelConfig);
			case 'topArea':
			case 'top':
				return this.topArea.add(parsedConfig as PanelDockConfig);
			case 'toolbar':
				return this.toolbar.add(parsedConfig as PanelDockConfig);
			case 'leftFixedArea':
				return this.leftFixedArea.add(parsedConfig as IPublicTypePanelConfig);
			case 'leftFloatArea':
				return this.leftFloatArea.add(parsedConfig as IPublicTypePanelConfig);
			case 'bottomArea':
			case 'bottom':
				return this.bottomArea.add(parsedConfig as IPublicTypePanelConfig);
		}
	}

	private parseConfig(config: IPublicTypeWidgetBaseConfig) {
		if (config.parsed) {
			return config;
		}
		const { content, ...restConfig } = config;
		if (content) {
			if (isPlainObject(content) && !isVNode(content)) {
				Object.keys(content).forEach((key) => {
					if (/props$/i.test(key) && restConfig[key]) {
						restConfig[key] = {
							...restConfig[key],
							...(content as any)[key],
						};
					} else {
						restConfig[key] = (content as any)[key];
					}
				});
			} else {
				restConfig.content = content;
			}
		}
		restConfig.pluginKey = restConfig.name;
		restConfig.parsed = true;
		return restConfig;
	}
}
