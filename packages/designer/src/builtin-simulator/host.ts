import {
	Component,
	computed,
	ExtractPropTypes,
	PropType,
	reactive,
	Ref,
	ref,
	shallowReactive,
	toRaw,
	watchEffect,
} from 'vue';
import {
	Asset,
	AssetLevel,
	AssetList,
	AssetType,
	IPublicEnumDragObjectType,
	IPublicModelLocateEvent,
	IPublicModelNode,
	IPublicTypeComponentInstance,
	IPublicTypeLocationChildrenDetail,
	IPublicTypeLocationDetailType,
	IPublicTypeNodeInstance,
	IPublicTypePackage,
	IPublicTypeRect,
} from '@arvin-shu/microcode-types';
import {
	assetBundle,
	assetItem,
	getClosestNode,
	hasOwnProperty,
	isDragAnyObject,
	isDragNodeObject,
	isElement,
	isFormEvent,
	isLocationData,
	transactionManager,
	UtilsMetadata,
} from '@arvin-shu/microcode-utils';
import { debounce, isNaN } from 'lodash-es';
import {
	createModuleEventBus,
	engineConfig,
	globalLocale,
	IEventBus,
} from '@arvin-shu/microcode-editor-core';
import {
	CanvasPoint,
	Designer,
	getRectTarget,
	IDesigner,
	ILocateEvent,
	isChildInline,
	isRowContainer,
} from '../designer';
import { IProject, Project } from '../project';
import { DropContainer, ISimulatorHost } from '../simulator';
import { createSimulator } from './create-simulator';
import Viewport from './viewport';
import {
	contains,
	INode,
	isMicrocodeComponent,
	isRootNode,
	Node,
} from '../document';
import { IScroller } from '../designer/scroller';
import {
	getClosestClickableNode,
	isDOMNodeVisible,
	isElementNode,
	parseMetadata,
} from '../utils';
import { isShaken } from '../designer/utils';
import ResourceConsumer from './resource-consumer';
import { BuiltinSimulatorRenderer } from './renderer';
import { LiveEditing } from './liveEditing';
import { clipboard } from '../designer/clipboard';

export type LibraryItem = IPublicTypePackage & {
	package: string;
	library: string;
	urls?: Asset;
	editUrls?: Asset;
};

export const builtinSimulatorProps = {
	designMode: {
		type: String as PropType<
			'live' | 'design' | 'preview' | 'extend' | 'border'
		>,
	},
	device: {
		type: String as PropType<'mobile' | 'iphone' | 'default' | string>,
	},
	deviceClassName: String,
	environment: [Object, String] as PropType<Asset>,
	requestHandlersMap: Object as PropType<any>,
	extraEnvironment: [Object, String] as PropType<Asset>,
	library: Array as PropType<LibraryItem[]>,
	utilsMetadata: Object as PropType<UtilsMetadata>,
	simulatorUrl: [Object, String] as PropType<Asset>,
	theme: [Object, String] as PropType<Asset>,
	componentsAsset: [Object, String] as PropType<Asset>,
	renderEnv: {
		type: String as PropType<'vue' | 'rax' | 'react' | 'default' | string>,
	},
	locale: String,
};

const defaultEnvironment = [
	assetItem(
		AssetType.JSText,
		'window.Vue=parent.Vue;window.vue=parent.Vue',
		undefined,
		'vue'
	),
];

export type BuiltinSimulatorProps = ExtractPropTypes<
	typeof builtinSimulatorProps
> & {
	[key: string]: any;
};

export class BuiltinSimulatorHost
	implements ISimulatorHost<BuiltinSimulatorProps>
{
	readonly isSimulator = true;

	readonly project: IProject;

	readonly designer: IDesigner;

	readonly viewport = shallowReactive(new Viewport());

	readonly scroller: IScroller;

	readonly emitter: IEventBus = createModuleEventBus('BuiltinSimulatorHost');

	readonly componentsConsumer: ResourceConsumer;

	readonly injectionConsumer: ResourceConsumer;

	readonly i18nConsumer: ResourceConsumer;

	/**
	 * 是否为画布自动渲染
	 */
	autoRender = true;

	private readonly computedRenderEnv = computed(
		() => this.get('renderEnv') || 'default'
	);

	get renderEnv() {
		return this.computedRenderEnv.value;
	}

	private readonly computedLocale = computed(
		() => this.get('locale') || globalLocale.getLocale()
	);

	get locale() {
		return this.computedLocale.value;
	}

	private readonly computedDeviceClassName = computed(() =>
		this.get('deviceClassName')
	);

	get deviceClassName() {
		return this.computedDeviceClassName.value;
	}

	private readonly computedDevice = computed(
		() => this.get('device') || 'default'
	);

	get device() {
		return this.computedDevice.value;
	}

	private _iframe?: HTMLIFrameElement;

	readonly asyncLibraryMap: { [key: string]: {} } = {};

	readonly libraryMap: { [key: string]: string } = {};

	_props: Ref<BuiltinSimulatorProps> = ref({});

	/**
	 * iframe内部的window对象
	 */
	private _contentWindow = ref<Window>();

	get contentWindow() {
		return this._contentWindow.value;
	}

	/**
	 * iframe内部的document对象
	 */
	private _contentDocument = ref<Document>();

	get contentDocument() {
		return this._contentDocument.value;
	}

	private _renderer?: BuiltinSimulatorRenderer;

	get renderer() {
		return this._renderer;
	}

	private sensing = false;

	private disableHovering?: () => void;

	private disableDetecting?: () => void;

	private _sensorAvailable = true;

	get sensorAvailable(): boolean {
		return this._sensorAvailable;
	}

	private instancesMap = reactive<{
		[docId: string]: Map<string, IPublicTypeComponentInstance[]>;
	}>({});

	get currentDocument() {
		return this.project.currentDocument;
	}

	private readonly computedDesignMode = computed(
		() => this.get('designMode') || 'design'
	);

	private readonly computedRequestHandlersMap = computed(
		() => this.get('requestHandlersMap') || null
	);

	get requestHandlersMap() {
		return this.computedRequestHandlersMap.value;
	}

	get designMode() {
		return this.computedDesignMode.value;
	}

	get thisRequiredInJSE(): boolean {
		return engineConfig.get('thisRequiredInJSE') ?? true;
	}

	get enableStrictNotFoundMode(): any {
		return engineConfig.get('enableStrictNotFoundMode') ?? false;
	}

	get notFoundComponent(): any {
		return engineConfig.get('notFoundComponent') ?? null;
	}

	get faultComponent(): any {
		return engineConfig.get('faultComponent') ?? null;
	}

	get faultComponentMap(): any {
		return engineConfig.get('faultComponentMap') ?? null;
	}

	private _appHelper: Ref<any> = ref();

	private readonly computedComponentsAsset = computed(() =>
		this.get('componentsAsset')
	);

	private readonly computedComponentsMap = computed(
		() => this.designer.componentsMap
	);

	get componentsMap() {
		return this.computedComponentsMap.value;
	}

	private readonly computedDeviceStyle = computed(() =>
		this.get('deviceStyle')
	);

	get deviceStyle() {
		return this.computedDeviceStyle.value;
	}

	get componentsAsset() {
		return this.computedComponentsAsset.value;
	}

	private readonly computedTheme = computed(() => this.get('theme'));

	get theme() {
		return this.computedTheme.value;
	}

	readonly liveEditing = new LiveEditing();

	constructor(project: Project, designer: Designer) {
		this.project = project;
		this.designer = designer;
		this.scroller = this.designer.createScroller(this.viewport);
		this.autoRender = !engineConfig.get('disableAutoRender', false);
		this._appHelper.value = engineConfig.get('appHelper');

		this.componentsConsumer = new ResourceConsumer<Asset | undefined>(
			() => this.componentsAsset
		);
		this.injectionConsumer = new ResourceConsumer(() => ({
			appHelper: toRaw(this._appHelper.value),
		}));

		engineConfig.onGot('appHelper', (data) => {
			// appHelper被config.set修改后触发injectionConsumer.consume回调
			this._appHelper.value = data;
		});

		this.i18nConsumer = new ResourceConsumer(() => this.project.i18n);

		transactionManager.onStartTransaction(() => {
			this.stopAutoRepaintNode();
		}, 'REPAINT');
		// 防止批量调用 transaction 时，执行多次 rerender
		const rerender = debounce(this.rerender.bind(this), 28);
		transactionManager.onEndTransaction(() => {
			rerender();
			this.enableAutoRepaintNode();
		}, 'REPAINT');
	}

	stopAutoRepaintNode() {
		this.renderer?.stopAutoRepaintNode();
	}

	enableAutoRepaintNode() {
		this.renderer?.enableAutoRepaintNode();
	}

	/**
	 * 设置属性
	 * @param props
	 */
	setProps(props: BuiltinSimulatorProps) {
		this._props.value = props;
	}

	set(key: string, value: any) {
		this._props.value = {
			...this._props.value,
			[key]: value,
		};
	}

	get(key: string): any {
		if (key === 'device') {
			return (
				this.designer?.editor
					?.get('deviceMapper')
					?.transform?.(this._props.value.device) || this._props.value.device
			);
		}
		return this._props.value[key];
	}

	/**
	 *  renderer设置类型，有 Renderer 进程连接进来，设置同步机制
	 */
	connect(renderer: any, effect: any, options?: any) {
		this._renderer = renderer;
		return watchEffect(effect, options);
	}

	watchEffect(callback: any, options?: any) {
		return watchEffect(callback, options);
	}

	purge(): void {
		this._mutationObserver?.disconnect();
		this._mutationObserver = undefined;
	}

	mountViewport(viewport: HTMLElement | null) {
		this.viewport.mount(viewport);
	}

	/**
	 * 构建资源库
	 */
	buildLibrary(library?: LibraryItem[]) {
		// 获取库配置,如果没有传入则使用内部配置
		const _library = library || (this.get('library') as LibraryItem[]);
		// 初始化资源列表和导出列表
		const libraryAsset: AssetList = [];
		const libraryExportList: string[] = [];
		const functionCallLibraryExportList: string[] = [];

		if (_library && _library.length) {
			_library.forEach((item) => {
				// 记录包名和库名的映射关系
				this.libraryMap[item.package] = item.library;

				// 处理异步加载的库
				if (item.async) {
					this.asyncLibraryMap[item.package] = item;
				}

				// 处理导出名称和库名不一致的情况
				if (item.exportName && item.library) {
					libraryExportList.push(
						`Object.defineProperty(window,'${item.exportName}',{get:()=>window.${item.library}});`
					);
				}

				// 处理函数调用方式的导出
				if (item.exportMode === 'functionCall' && item.exportSourceLibrary) {
					functionCallLibraryExportList.push(
						`window["${item.library}"] = window["${item.exportSourceLibrary}"]("${item.library}", "${item.package}");`
					);
				}

				// 添加库的资源URL
				if (item.editUrls) {
					libraryAsset.push(item.editUrls);
				} else if (item.urls) {
					libraryAsset.push(item.urls);
				}
			});
		}

		// 合并所有资源配置
		libraryAsset.unshift(
			assetItem(AssetType.JSText, libraryExportList.join(''))
		);
		libraryAsset.push(
			assetItem(AssetType.JSText, functionCallLibraryExportList.join(''))
		);

		return libraryAsset;
	}

	rerender() {
		this.designer.refreshComponentMetasMap();
		this.renderer?.rerender?.();
	}

	async mountContentFrame(iframe: HTMLIFrameElement) {
		if (!iframe || this._iframe === iframe) {
			return;
		}
		this._iframe = iframe;

		this._contentWindow.value = iframe.contentWindow!;
		this._contentDocument.value = this._contentWindow.value?.document;

		// 构建资源库
		const libraryAsset = this.buildLibrary();

		const vendors = [
			// vue环境
			assetBundle(defaultEnvironment, AssetLevel.Environment),
			// 额外的环境
			assetBundle(this.get('extraEnvironment'), AssetLevel.Environment),
			// 资产包定义的环境
			assetBundle(libraryAsset, AssetLevel.Library),
			// 主题
			assetBundle(this.theme, AssetLevel.Theme),
			// TODO 渲染器模拟器环境  没有设置内置的模拟器环境
			assetBundle(this.get('simulatorUrl'), AssetLevel.Runtime),
		];

		// 解决cssInJs样式问题
		this.setMutationObserver(iframe);

		const renderer: any = await createSimulator(this, iframe, vendors);

		await this.componentsConsumer.waitFirstConsume();

		await this.injectionConsumer.waitFirstConsume();

		if (Object.keys(this.asyncLibraryMap).length > 0) {
			// 加载异步 Library
			await renderer.loadAsyncLibrary(this.asyncLibraryMap);
			Object.keys(this.asyncLibraryMap).forEach((key) => {
				delete this.asyncLibraryMap[key];
			});
		}

		renderer.run();

		this.viewport.setScrollTarget(this._contentWindow.value!);
		this.setupEvents();

		const hotkey = this.designer.editor.get('innerHotkey');
		hotkey?.mount(this._contentWindow.value);
		const innerSkeleton = this.designer.editor.get('skeleton');
		innerSkeleton?.focusTracker.mount(this._contentWindow.value);
		clipboard.injectCopyPaster(this._contentDocument.value!);
	}

	private _mutationObserver?: MutationObserver;

	/**
	 * 处理cssInJs产生的样式将其插入到模拟器的iframe中
	 */
	private setMutationObserver(iframe: HTMLIFrameElement) {
		if (this._mutationObserver) {
			this._mutationObserver.disconnect();
			this._mutationObserver = undefined;
		}
		this._mutationObserver = new MutationObserver(() => {
			const doc = iframe.contentDocument!;
			const jsInCssStyles = document.head.querySelectorAll(
				'style[data-vc-order]'
			);
			const iframeJsInCssStyles = doc.head.querySelectorAll(
				'style[data-vc-order]'
			);
			// 移除iframe中所有旧的js-in-css样式
			iframeJsInCssStyles?.forEach((style) => style.remove());

			const clonedStyles: HTMLStyleElement[] = [];
			jsInCssStyles.forEach((style) => {
				const clonedStyle = style.cloneNode(true) as HTMLStyleElement;
				clonedStyles.push(clonedStyle);
			});

			clonedStyles.reverse().forEach((style) => {
				doc?.head?.insertBefore(style, doc.head.firstChild);
			});
		});

		// 开始监听document.head的变化
		this._mutationObserver.observe(document.head, {
			childList: true,
			subtree: true,
			characterData: true,
		});
	}

	async setupComponents(library: LibraryItem[]): Promise<void> {
		const libraryAsset: AssetList = this.buildLibrary(library);
		await this.renderer?.load(libraryAsset);
		if (Object.keys(this.asyncLibraryMap).length > 0) {
			// 加载异步 Library
			await this.renderer?.loadAsyncLibrary(this.asyncLibraryMap);
			Object.keys(this.asyncLibraryMap).forEach((key) => {
				delete this.asyncLibraryMap[key];
			});
		}
	}

	setupEvents() {
		this.setupDragAndClick();
		this.setupDetecting();
		this.setupLiveEditing();
		// TODO setupContextMenu
	}

	postEvent(eventName: string, ...data: any[]) {
		this.emitter.emit(eventName, ...data);
	}

	setupDragAndClick() {
		const { designer } = this;
		const doc = this.contentDocument!;

		doc.addEventListener(
			'mousedown',
			(downEvent) => {
				document.dispatchEvent(new Event('mousedown'));
				const documentModel = this.project.currentDocument;

				if (this.liveEditing.editing || !documentModel) {
					return;
				}
				const { selection } = documentModel;
				let isMulti = false;

				// 根据设计模式判断是否为多选操作
				if (this.designMode === 'design') {
					// 按住 Command/Ctrl 键为多选模式
					isMulti = downEvent.metaKey || downEvent.ctrlKey;
				} else if (!downEvent.metaKey) {
					// live 模式下必须按住 Command/Ctrl 才能选中
					return;
				}
				// 移除 label 的 for 属性,避免触发原生行为
				// @ts-ignore
				downEvent.target?.removeAttribute('for');

				// 获取点击位置对应的节点实例
				const nodeInst = this.getNodeInstanceFromElement(
					downEvent.target as any
				);

				// @ts-ignore
				const { focusNode } = documentModel;

				// 获取最近的可点击节点
				const node = getClosestClickableNode(
					nodeInst?.node || focusNode,
					downEvent
				);

				// 如果找不到可点击节点,直接返回
				if (!node) {
					return;
				}

				// 触发节点的鼠标按下钩子函数
				const onMouseDownHook =
					node.componentMeta.advanced.callbacks?.onMouseDownHook;
				if (onMouseDownHook) {
					onMouseDownHook(downEvent, node.internalToShellNode());
				}

				const rglNode = node?.getParent();
				const isRGLNode = rglNode?.isRGLContainer;
				if (isRGLNode) {
					// 如果拖拽的是磁铁块的右下角 handle，则直接跳过
					// @ts-ignore
					if (downEvent.target?.classList.contains('react-resizable-handle'))
						return;
					// 禁止多选
					isMulti = false;
					designer.dragon.emitter.emit('rgl.switch', {
						action: 'start',
						rglNode,
					});
				} else {
					// stop response document focus event
					// 禁止原生拖拽
					downEvent.stopPropagation();
					downEvent.preventDefault();
				}
				// 判断是否为左键点击
				const isLeftButton = downEvent.which === 1 || downEvent.button === 0;

				// 处理选中检查的函数
				const checkSelect = (e: MouseEvent) => {
					doc.removeEventListener('mouseup', checkSelect, true);
					doc.removeEventListener('mouseup', checkSelect, true);
					// 取消移动;
					designer.dragon.emitter.emit('rgl.switch', {
						action: 'end',
						rglNode,
					});

					if (!isShaken(downEvent, e) || isRGLNode) {
						let { id } = node;
						designer.activeTracker.track({
							node,
							instance: nodeInst?.instance,
						});
						// 处理多选逻辑
						if (
							isMulti &&
							focusNode &&
							!node.contains(focusNode) &&
							selection.has(id)
						) {
							// 多选模式下,如果节点已经被选中,则取消选中
							selection.remove(id);
						} else {
							// 处理页面组件的特殊选中逻辑
							if (
								node.isPage() &&
								node.getChildren()?.notEmpty() &&
								this.designMode === 'live'
							) {
								const firstChildId = node.getChildren()?.get(0)?.getId();
								if (firstChildId) id = firstChildId;
							}

							// 选中节点
							if (focusNode) {
								selection.select(node.contains(focusNode) ? focusNode.id : id);
							}

							// 触发选中事件
							const editor = this.designer?.editor;
							const npm = node?.componentMeta?.npm;
							const selected =
								[npm?.package, npm?.componentName]
									.filter((item) => !!item)
									.join('-') ||
								node?.componentMeta?.componentName ||
								'';
							editor?.eventBus.emit('designer.builtinSimulator.select', {
								selected,
							});
						}
					}
				};

				// 处理拖拽开始
				if (isLeftButton && focusNode && !node.contains(focusNode)) {
					let nodes: INode[] = [node];
					let ignoreUpSelected = false;
					// 处理多选拖拽
					if (isMulti) {
						if (!selection.has(node.id)) {
							designer.activeTracker.track({
								node,
								instance: nodeInst?.instance,
							});
							selection.add(node.id);
							ignoreUpSelected = true;
						}
						focusNode?.id && selection.remove(focusNode.id);
						// 获取所有选中的顶层节点
						nodes = selection.getTopNodes();
					} else if (selection.containsNode(node, true)) {
						nodes = selection.getTopNodes();
					}

					// 启动拖拽
					designer.dragon.boost(
						{
							type: IPublicEnumDragObjectType.Node,
							nodes,
						},
						downEvent,
						isRGLNode ? rglNode : undefined
					);

					if (ignoreUpSelected) {
						return;
					}
				}

				doc.addEventListener('mouseup', checkSelect, true);
			},
			true
		);
		doc.addEventListener(
			'click',
			(e) => {
				const x = new Event('click');
				x.initEvent('click', true);
				this._iframe?.dispatchEvent(x);
				const { target } = e;

				const customizeIgnoreSelectors = engineConfig.get(
					'customizeIgnoreSelectors'
				);
				const defaultIgnoreSelectors: string[] = ['.editor-container'];
				const ignoreSelectors =
					customizeIgnoreSelectors?.(defaultIgnoreSelectors, e) ||
					defaultIgnoreSelectors;
				const ignoreSelectorsString = ignoreSelectors.join(',');
				if (
					(!customizeIgnoreSelectors && isFormEvent(e)) ||
					// @ts-ignore
					target?.closest(ignoreSelectorsString)
				) {
					e.preventDefault();
					e.stopPropagation();
				}
			},
			true
		);
	}

	/**
	 * 设置检测处理
	 * 主要用于处理画布中的鼠标悬停、移动等事件
	 */
	setupDetecting() {
		// 获取内容文档对象
		const doc = this.contentDocument!;
		const { detecting, dragon } = this.designer;

		/**
		 * 处理鼠标悬停事件
		 * 用于检测当前悬停的节点并更新detecting状态
		 */
		const hover = (e: MouseEvent) => {
			// 如果检测被禁用或不是设计模式则直接返回
			if (!detecting.enable || this.designMode !== 'design') {
				return;
			}

			// 从目标元素获取节点实例
			const nodeInst = this.getNodeInstanceFromElement(e.target as Element);

			if (nodeInst?.node) {
				let { node } = nodeInst;
				// 如果存在焦点节点且当前节点包含焦点节点,则使用焦点节点
				const focusNode = node.document?.focusNode;
				if (focusNode && node.contains(focusNode)) {
					node = focusNode;
				}
				detecting.capture(node);
			} else {
				detecting.capture(null);
			}

			// 根据配置决定是否阻止事件冒泡
			if (
				!engineConfig.get('enableMouseEventPropagationInCanvas', false) ||
				dragon.dragging
			) {
				e.stopPropagation();
			}
		};

		/**
		 * 处理鼠标离开事件
		 * 清除detecting状态
		 */
		const leave = () => {
			this.project.currentDocument &&
				detecting.leave(this.project.currentDocument);
		};

		// 绑定事件监听器
		doc.addEventListener('mouseover', hover, true);
		doc.addEventListener('mouseleave', leave, false);

		doc.addEventListener(
			'mousemove',
			(e: Event) => {
				// 根据配置决定是否阻止事件冒泡
				if (
					!engineConfig.get('enableMouseEventPropagationInCanvas', false) ||
					dragon.dragging
				) {
					e.stopPropagation();
				}
			},
			true
		);
	}

	setupLiveEditing() {
		const doc = this.contentDocument!;
		doc.addEventListener(
			'dblclick',
			(e: MouseEvent) => {
				e.stopPropagation();
				e.preventDefault();
				const targetElement = e.target as HTMLElement;

				const nodeInst = this.getNodeInstanceFromElement(targetElement);
				if (!nodeInst) {
					return;
				}
				const focusNode = this.project.currentDocument?.focusNode;
				const node = nodeInst.node || focusNode;
				if (!node || isMicrocodeComponent(node)) {
					return;
				}

				const rootElement = this.findDOMNodes(
					nodeInst.instance,
					node.componentMeta.rootSelector
				)?.find((item) => item && item.contains(targetElement)) as HTMLElement;
				if (!rootElement) {
					return;
				}
				this.liveEditing.apply({
					node,
					rootElement,
					event: e,
				});
			},
			true
		);
	}

	setSuspense() {
		return false;
	}

	// TODO setupContextMenu

	generateComponentMetadata(componentName: string) {
		if (isHTMLTag(componentName)) {
			return {
				componentName,
			};
		}
		const component = this.getComponent(componentName);
		if (!component) {
			return {
				componentName,
			};
		}
		return {
			componentName,
			...parseMetadata(component),
		};
	}

	getComponent(componentName: string): Component<any> | object | null {
		return this.renderer?.getComponent(componentName) || null;
	}

	createComponent() {
		return null;
	}

	setInstance(
		docId: string,
		id: string,
		instances: IPublicTypeComponentInstance[] | null
	) {
		if (!hasOwnProperty(this.instancesMap, docId)) {
			this.instancesMap[docId] = new Map();
		}
		if (instances == null) {
			this.instancesMap[docId].delete(id);
		} else {
			this.instancesMap[docId].set(id, instances.slice());
		}
	}

	getComponentInstances(
		node: INode,
		context?: IPublicTypeNodeInstance
	): IPublicTypeComponentInstance[] | null {
		const docId = node.document?.id;
		if (!docId) {
			return null;
		}

		const instances = this.instancesMap[docId]?.get(node.id) || null;
		if (!instances || !context) {
			return instances;
		}

		return instances.filter(
			(instance) =>
				this.getClosestNodeInstance(instance, context?.nodeId)?.instance ===
				context.instance
		);
	}

	getComponentContext(): any {
		throw new Error('Method not implemented.');
	}

	/**
	 * 获取最近的节点实例
	 *
	 * @param from 组件实例
	 * @param specId 可选的ID,用于指定特定的节点实例
	 * @returns 返回一个包含节点实例信息的IPublicTypeNodeInstance对象,如果找不到则返回null
	 */
	getClosestNodeInstance(
		from: IPublicTypeComponentInstance,
		specId?: string
	): IPublicTypeNodeInstance<IPublicTypeComponentInstance> | null {
		return this.renderer?.getClosestNodeInstance(from, specId) || null;
	}

	/**
	 * 计算组件实例的DOM矩形区域
	 *
	 * @param node 组件实例
	 * @returns 返回一个包含位置和尺寸信息的矩形对象,如果找不到DOM节点则返回null
	 */
	computeRect(node: INode): IPublicTypeRect | null {
		const instances = this.getComponentInstances(node);
		if (!instances) {
			return null;
		}
		return this.computeComponentInstanceRect(
			instances[0],
			toRaw(node).componentMeta.rootSelector
		);
	}

	/**
	 * 计算组件实例的DOM矩形区域
	 *
	 * @param instance 组件实例
	 * @param selector 可选的CSS选择器,用于指定特定的DOM节点
	 * @returns 返回一个包含位置和尺寸信息的矩形对象,如果找不到DOM节点则返回null
	 */
	computeComponentInstanceRect(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): IPublicTypeRect | null {
		const renderer = this.renderer!;
		// 获取组件实例对应的DOM节点
		const elements = this.findDOMNodes(instance, selector);
		if (!elements) {
			return null;
		}

		const elems = elements.slice();
		let rects: DOMRect[] | undefined;
		// 用于存储计算得到的最终矩形区域的边界值
		let last: { x: number; y: number; r: number; b: number } | undefined;
		// 标记是否进行了边界计算
		let _computed = false;
		// eslint-disable-next-line no-constant-condition
		while (true) {
			// 如果没有矩形数据或矩形数组为空,则获取下一个DOM元素的矩形数据
			if (!rects || rects.length < 1) {
				const elem = elems.pop();
				if (!elem) {
					break;
				}
				rects = renderer.getClientRects(elem);
			}
			const rect = rects?.pop();
			if (!rect) {
				break;
			}
			// 忽略宽高为0的矩形
			if (rect.width === 0 && rect.height === 0) {
				continue;
			}
			// 如果是第一个有效矩形,直接记录其边界值
			if (!last) {
				last = {
					x: rect.left,
					y: rect.top,
					r: rect.right,
					b: rect.bottom,
				};
				continue;
			}
			// 更新边界值,取最小的x/y和最大的right/bottom
			if (rect.left < last.x) {
				last.x = rect.left;
				_computed = true;
			}
			if (rect.top < last.y) {
				last.y = rect.top;
				_computed = true;
			}
			if (rect.right > last.r) {
				last.r = rect.right;
				_computed = true;
			}
			if (rect.bottom > last.b) {
				last.b = rect.bottom;
				_computed = true;
			}
		}

		// 如果找到了有效的矩形区域,创建并返回最终的矩形对象
		if (last) {
			const r: IPublicTypeRect = new DOMRect(
				last.x,
				last.y,
				last.r - last.x,
				last.b - last.y
			);
			r.elements = elements;
			r.computed = _computed;
			return r;
		}

		return null;
	}

	/**
	 * 获取组件实例的DOM节点
	 * @param instance
	 * @param selector 指定的根节点
	 * @returns
	 */
	findDOMNodes(
		instance: IPublicTypeComponentInstance,
		selector?: string
	): Array<Element | Text> | null {
		const elements = this._renderer?.findDOMNodes(instance);
		if (!elements) {
			return null;
		}
		if (selector) {
			const matched = getMatched(elements, selector);
			if (!matched) {
				return null;
			}
			return [matched];
		}
		return elements;
	}

	// @ts-ignore
	getNodeInstanceFromElement(
		target: Element | null
	): IPublicTypeNodeInstance<IPublicTypeComponentInstance, INode> | null {
		if (!target) {
			return null;
		}
		const nodeInstance = this.getClosestNodeInstance(target);
		if (!nodeInstance) {
			return null;
		}
		const { docId } = nodeInstance;
		const doc = this.project.getDocument(docId)!;
		const node = doc.getNode(nodeInstance.nodeId);
		return {
			...nodeInstance,
			node,
		};
	}

	scrollToNode(node: Node, detail?: any) {
		if (this.sensing) {
			return;
		}
		const opt: any = {};
		let scroll = false;

		const componentInstance = this.getComponentInstances(
			detail?.near?.node || node
		)?.[0];
		if (!componentInstance) return;
		const domNode = this.findDOMNodes(componentInstance)?.[0] as Element;
		if (!domNode) return;
		if (isElementNode(domNode) && !isDOMNodeVisible(domNode, this.viewport)) {
			const { left, top } = domNode.getBoundingClientRect();
			const { scrollTop = 0, scrollLeft = 0 } =
				this.contentDocument?.documentElement || {};
			opt.left = left + scrollLeft;
			opt.top = top + scrollTop;
			scroll = true;
		}

		if (scroll && this.scroller) {
			this.scroller.scrollTo(opt);
		}
	}

	setNativeSelection(enableFlag: boolean) {
		this.renderer?.setNativeSelection &&
			this.renderer?.setNativeSelection(enableFlag);
	}

	setDraggingState(state: boolean) {
		this.renderer?.setDraggingState && this.renderer?.setDraggingState(state);
	}

	setCopyState(state: boolean) {
		this.renderer?.setCopyState && this.renderer?.setCopyState(state);
	}

	clearState() {
		this.renderer?.clearState && this.renderer?.clearState();
	}

	/**
	 * 修复事件 当从模拟器感应器和外部结构树感应器切换的时候，需要处理事件的坐标
	 * @param e
	 */
	fixEvent(e: ILocateEvent): ILocateEvent {
		if (e.fixed) {
			return e;
		}

		const notMyEvent = e.originalEvent.view?.document !== this.contentDocument;
		if (notMyEvent || !('canvasX' in e) || !('canvasY' in e)) {
			const l = this.viewport.toLocalPoint({
				clientX: e.globalX,
				clientY: e.globalY,
			});
			e.canvasX = l.clientX;
			e.canvasY = l.clientY;
		}

		if (!e.target || notMyEvent) {
			if (!isNaN(e.canvasX!) && !isNaN(e.canvasY!)) {
				e.target = this.contentDocument?.elementFromPoint(
					e.canvasX!,
					e.canvasY!
				);
			}
		}
		e.fixed = true;
		return e;
	}

	isEnter(e: IPublicModelLocateEvent): boolean {
		const rect = this.viewport.bounds;
		return (
			e.globalY >= rect.top && // 点的Y坐标大于等于渲染区域模拟器矩形的顶部
			e.globalY <= rect.bottom && // 点的Y坐标小于等于渲染区域模拟器矩形的底部
			e.globalX >= rect.left && // 点的X坐标大于等于渲染区域模拟器矩形的左侧
			e.globalX <= rect.right // 点的X坐标小于等于渲染区域模拟器矩形的右侧
		);
	}

	deactiveSensor() {
		this.sensing = false;
		this.scroller.cancel();
	}

	locate(e: ILocateEvent) {
		const { dragObject } = e;

		const nodes = dragObject?.nodes;
		const operationalNodes = nodes?.filter((node) => {
			const onMoveHook = node?.componentMeta?.advanced.callbacks?.onMoveHook;
			const canMove =
				onMoveHook && typeof onMoveHook === 'function'
					? // @ts-ignore
						onMoveHook(node.internalToShellNode())
					: true;

			let parentContainerNode: INode | null = null;
			let parentNode = toRaw(node?.parent);

			while (parentNode) {
				if (!parentNode.isContainerNode) {
					// @ts-ignore
					parentContainerNode = parentNode;
					break;
				}

				parentNode = parentNode.parent;
			}

			const onChildMoveHook =
				parentContainerNode?.componentMeta?.advanced.callbacks?.onChildMoveHook;

			const childrenCanMove =
				onChildMoveHook &&
				parentContainerNode &&
				typeof onChildMoveHook === 'function'
					? onChildMoveHook(
							// @ts-ignore
							node?.internalToShellNode(),
							// @ts-ignore
							parentContainerNode.internalToShellNode()
						)
					: true;

			return canMove && childrenCanMove;
		});

		if (nodes && (!operationalNodes || operationalNodes.length === 0)) {
			return;
		}

		// 获取可放置的容器
		this.sensing = true;
		this.scroller.scrolling(e);

		const document = this.project.currentDocument;
		if (!document) {
			return null;
		}

		const dropContainer = this.getDropContainer(e);

		const lockedNode = getClosestNode(
			// @ts-ignore
			dropContainer?.container,
			(node) => node.isLocked
		);
		if (lockedNode) return null;
		if (!dropContainer) {
			return null;
		}

		if (isLocationData(dropContainer)) {
			return this.designer.createLocation(dropContainer as any);
		}

		const { container, instance: containerInstance } = dropContainer!;

		const edge = this.computeComponentInstanceRect(
			containerInstance,
			toRaw(container).componentMeta.rootSelector
		);

		if (!edge) {
			return null;
		}

		const { children } = toRaw(container);

		const detail: IPublicTypeLocationChildrenDetail = {
			type: IPublicTypeLocationDetailType.Children,
			index: 0,
			edge: edge!,
		};

		const locationData = {
			target: container,
			detail,
			source: `simulator${document.id}`,
			event: e,
		};

		if (
			e.dragObject &&
			e.dragObject.nodes &&
			e.dragObject.nodes.length &&
			e.dragObject?.nodes[0]?.componentMeta?.isModal &&
			document.focusNode
		) {
			return this.designer.createLocation({
				target: document.focusNode,
				detail,
				source: `simulator${document.id}`,
				event: e,
			});
		}

		// 如果容器没有子节点或子节点数量小于1，或者没有计算到矩形区域，则创建位置数据
		if (!children || children.size < 1 || !edge) {
			return this.designer.createLocation(locationData);
		}
		let nearRect: IPublicTypeRect | null = null;
		let nearIndex: number = 0;
		let nearNode: INode | null = null;
		let nearDistance: number | null = null;
		let minTop: number | null = null;
		let maxBottom: number | null = null;

		// 遍历子节点寻找最近节点
		for (let i = 0, l = children.size; i < l; i++) {
			const node = children.get(i)!;
			const instances = this.getComponentInstances(node);
			const index = i;

			const inst = instances
				? instances.length > 1
					? instances.find(
							(_inst) =>
								this.getClosestNodeInstance(_inst, container.id)?.instance ===
								containerInstance
						)
					: instances[0]
				: null;

			const rect = inst
				? this.computeComponentInstanceRect(
						inst,
						toRaw(node).componentMeta.rootSelector
					)
				: null;

			if (!rect) {
				continue;
			}

			const distance = isPointInRect(e as any, rect!)
				? 0
				: distanceToRect(e as any, rect!);

			if (distance === 0) {
				nearDistance = distance;
				nearNode = node;
				nearIndex = index;
				nearRect = rect;
				break;
			}

			if (minTop === null || rect.top < minTop) {
				minTop = rect.top;
			}
			if (maxBottom === null || rect.bottom > maxBottom) {
				maxBottom = rect.bottom;
			}

			if (nearDistance === null || distance < nearDistance) {
				nearDistance = distance;
				nearNode = node;
				nearIndex = index;
				nearRect = rect;
			}
		}

		detail.index = nearIndex;

		if (nearNode && nearRect) {
			// 获取最近节点的dom元素
			const el = getRectTarget(nearRect);
			// 判断这个元素是否是行内元素
			const inline = el ? isChildInline(el) : false;
			// 判断这个元素是否是行容器
			const row = el ? isRowContainer(el.parentElement!) : false;
			// 判断这个元素是否是垂直容器 根据行内元素和行容器来判断 任意一个为true则认为是垂直容器
			const vertical = inline || row;

			const near: {
				node: IPublicModelNode;
				pos: 'before' | 'after' | 'replace';
				rect?: IPublicTypeRect;
				align?: 'V' | 'H';
			} = {
				node: nearNode.internalToShellNode()!,
				pos: 'before',
				align: vertical ? 'V' : 'H',
			};
			detail.near = near;
			if (isNearAfter(e as any, nearRect, vertical)) {
				near.pos = 'after';
				detail.index = nearIndex + 1;
			}
			if (!row && nearDistance !== 0) {
				const edgeDistance = distanceToEdge(e as any, edge);
				if (edgeDistance.distance < nearDistance!) {
					const { nearAfter } = edgeDistance;
					if (minTop == null) {
						minTop = edge.top;
					}
					if (maxBottom == null) {
						maxBottom = edge.bottom;
					}
					near.rect = new DOMRect(
						edge.left,
						minTop,
						edge.width,
						maxBottom - minTop
					);
					near.align = 'H';
					near.pos = nearAfter ? 'after' : 'before';
					detail.index = nearAfter ? children.size : 0;
				}
			}
		}

		return this.designer.createLocation(locationData) as any;
	}

	getDropContainer(e: ILocateEvent) {
		const { target, dragObject } = e;
		const isAny = isDragAnyObject(dragObject);
		const document = this.project.currentDocument!;
		const { currentRoot } = document;
		let container: INode | null = null;
		let nodeInstance:
			| IPublicTypeNodeInstance<IPublicTypeComponentInstance, INode>
			| undefined;

		if (target) {
			const ref = this.getNodeInstanceFromElement(target);
			if (ref?.node) {
				nodeInstance = ref;
				container = ref.node;
			} else if (isAny) {
				return null;
			} else {
				container = currentRoot;
			}
		} else if (isAny) {
			return null;
		} else {
			container = currentRoot;
		}

		if (!container?.isParental()) {
			container = container?.parent || currentRoot;
		}

		if (isAny) {
			return null;
		}

		// 获取共同父节点，避免拖拽容器被拖拽对象包含
		// 创建一个 Set 用于存储需要排除的节点
		const drillDownExcludes = new Set<INode>();
		// 如果拖拽对象是节点类型
		if (isDragNodeObject(dragObject)) {
			// 获取拖拽的节点列表
			const { nodes } = dragObject;
			let i = nodes.length;
			let p: any = container;
			// 遍历所有拖拽的节点
			while (i-- > 0) {
				// 检查当前节点是否包含目标容器
				if (contains(nodes[i] as any, p)) {
					// 如果包含,则向上查找父节点,避免拖拽节点包含目标容器
					p = nodes[i].parent;
				}
			}
			// 如果找到了新的容器节点
			if (p !== container) {
				// 更新容器为新找到的父节点或当前焦点节点
				container = p || document.focusNode;
				// 将新容器添加到排除列表中
				container && drillDownExcludes.add(container);
			}
		}
		// 用于存储组件实例的变量,这个实例将用于后续的拖拽放置判断
		let instance: any;
		if (nodeInstance) {
			// 如果存在节点实例(通常是拖拽过程中鼠标悬停的组件实例)
			if (nodeInstance.node === container) {
				// 如果节点实例的节点与容器相同,说明当前悬停的就是目标容器
				// 直接使用节点实例的实例,避免重复查找
				instance = nodeInstance.instance;
			} else {
				// 如果节点实例与容器不同,说明需要向上查找合适的容器实例
				// 通过 getClosestNodeInstance 获取最接近的父级节点实例
				instance = this.getClosestNodeInstance(
					nodeInstance.instance as any,
					container?.id
				)?.instance;
			}
		} else {
			// 如果不存在节点实例(比如拖拽到了空白区域)
			// 则尝试获取容器的默认组件实例
			instance = container && this.getComponentInstances(container)?.[0];
		}

		let dropContainer: DropContainer = {
			container: container!,
			instance,
		};

		let res: any;
		let upward: DropContainer | null = null;
		while (container) {
			res = this.handleAccept(dropContainer, e);
			// if (isLocationData(res)) {
			//   return res;
			// }
			if (res === true) {
				return dropContainer;
			}
			if (!res) {
				drillDownExcludes.add(container);
				if (upward) {
					dropContainer = upward;
					container = dropContainer.container;
					upward = null;
				} else if (container.parent) {
					container = toRaw(container.parent);
					instance = this.getClosestNodeInstance(
						dropContainer.instance,
						container.id
					)?.instance;
					dropContainer = {
						container,
						instance,
					};
				} else {
					return null;
				}
			}
		}
		return null;
	}

	isAcceptable(): boolean {
		return false;
	}

	/**
	 * 处理拖拽放置的接受判断
	 * 主要用于判断拖拽的组件是否可以放置到目标容器中:
	 * 1. 如果目标是根节点或包含当前焦点节点,则检查焦点节点与拖拽对象的嵌套关系
	 * 2. 如果目标是普通容器,则检查:
	 *   - 目标容器的组件元数据
	 *   - 目标是否为容器或可接受拖拽
	 *   - 目标与拖拽对象的嵌套关系
	 * @param param0 拖拽的目标容器对象,包含容器节点和实例
	 * @param e 定位事件对象,包含拖拽对象等信息
	 * @returns 是否可以接受拖放,true表示可以放置,false表示不可放置
	 */
	handleAccept({ container }: DropContainer, e: ILocateEvent): boolean {
		const { dragObject } = e;
		const document = this.currentDocument!;
		const { focusNode } = document;
		if (isRootNode(container) || container.contains(focusNode as any)) {
			return document.checkNesting(focusNode!, dragObject as any);
		}

		const meta = container.componentMeta;

		const acceptable: boolean = this.isAcceptable();
		if (!meta.isContainer && !acceptable) {
			return false;
		}

		// check nesting
		return document.checkNesting(container, dragObject as any);
	}

	/**
	 * 查找邻近容器
	 */
	getNearByContainer(
		{ container, instance }: DropContainer,
		drillDownExcludes: Set<INode>
	) {
		const { children } = toRaw(container);
		if (!children || children.isEmpty()) {
			return null;
		}

		const nearBy: any = null;
		for (let i = 0, l = children.size; i < l; i++) {
			let child = children.get(i);

			if (!child) {
				continue;
			}
			if (child.conditionGroup) {
				const bn = child.conditionGroup;
				i = (bn.index || 0) + bn.length - 1;
				child = bn.visibleNode;
			}
			if (!child.isParental() || drillDownExcludes.has(child)) {
				continue;
			}
			this.findDOMNodes(instance);
			this.getComponentInstances(child);
			const rect = this.computeRect(child);
			if (!rect) {
				continue;
			}
		}

		return nearBy;
	}
}

function isHTMLTag(name: string) {
	return /^[a-z]\w*$/.test(name);
}

function isPointInRect(point: CanvasPoint, rect: IPublicTypeRect) {
	return (
		point.canvasY >= rect.top &&
		point.canvasY <= rect.bottom &&
		point.canvasX >= rect.left &&
		point.canvasX <= rect.right
	);
}

function distanceToRect(point: CanvasPoint, rect: IPublicTypeRect) {
	let minX = Math.min(
		Math.abs(point.canvasX - rect.left),
		Math.abs(point.canvasX - rect.right)
	);
	let minY = Math.min(
		Math.abs(point.canvasY - rect.top),
		Math.abs(point.canvasY - rect.bottom)
	);
	if (point.canvasX >= rect.left && point.canvasX <= rect.right) {
		minX = 0;
	}
	if (point.canvasY >= rect.top && point.canvasY <= rect.bottom) {
		minY = 0;
	}

	return Math.sqrt(minX ** 2 + minY ** 2);
}

/**
 * 判断拖拽点是否更靠近目标矩形的后方
 * @param point 拖拽点坐标
 * @param rect 目标矩形区域
 * @param inline 是否为内联元素
 * @returns 如果拖拽点更靠近矩形后方返回true,否则返回false
 *
 * 对于内联元素:
 * - 计算拖拽点到矩形左上角和右下角的曼哈顿距离
 * - 如果到右下角的距离更近,说明更靠近后方
 *
 * 对于块级元素:
 * - 只需比较拖拽点到矩形上边和下边的垂直距离
 * - 如果到上边的距离更大,说明更靠近后方
 */
function isNearAfter(
	point: CanvasPoint,
	rect: IPublicTypeRect,
	inline: boolean
) {
	if (inline) {
		return (
			Math.abs(point.canvasX - rect.left) + Math.abs(point.canvasY - rect.top) >
			Math.abs(point.canvasX - rect.right) +
				Math.abs(point.canvasY - rect.bottom)
		);
	}
	return (
		Math.abs(point.canvasY - rect.top) > Math.abs(point.canvasY - rect.bottom)
	);
}

/**
 * 计算拖拽点到矩形边缘的最短距离
 * @param point 拖拽点坐标
 * @param rect 目标矩形区域
 * @returns
 * - distance: 拖拽点到矩形上下边缘的最短距离
 * - nearAfter: 是否更靠近矩形下边缘,true表示更靠近下边缘,false表示更靠近上边缘
 */
function distanceToEdge(point: CanvasPoint, rect: IPublicTypeRect) {
	// 计算拖拽点到矩形上边缘的垂直距离
	const distanceTop = Math.abs(point.canvasY - rect.top);
	// 计算拖拽点到矩形下边缘的垂直距离
	const distanceBottom = Math.abs(point.canvasY - rect.bottom);

	return {
		// 返回到上下边缘的最短距离
		distance: Math.min(distanceTop, distanceBottom),
		// 返回是否更靠近下边缘
		nearAfter: distanceBottom < distanceTop,
	};
}

function getMatched(
	elements: Array<Element | Text>,
	selector: string
): Element | null {
	let firstQueried: Element | null = null;
	for (const elem of elements) {
		if (isElement(elem)) {
			if (elem.matches(selector)) {
				return elem;
			}

			if (!firstQueried) {
				firstQueried = elem.querySelector(selector);
			}
		}
	}
	return firstQueried;
}
