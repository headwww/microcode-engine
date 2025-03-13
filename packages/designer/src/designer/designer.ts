import {
	IPublicEnumTransformStage,
	IPublicModelDragObject,
	IPublicModelEditor,
	IPublicModelLocateEvent,
	IPublicModelScroller,
	IPublicTypeAssetsJson,
	IPublicTypeComponentAction,
	IPublicTypeComponentMetadata,
	IPublicTypeCompositeObject,
	IPublicTypeLocationData,
	IPublicTypeNpmInfo,
	IPublicTypeProjectSchema,
	IPublicTypePropsList,
	IPublicTypePropsTransducer,
	IPublicTypeScrollable,
	IShellModelFactory,
} from '@arvin-shu/microcode-types';
import {
	Component,
	computed,
	CSSProperties,
	ExtractPropTypes,
	PropType,
	Ref,
	ref,
	toRaw,
	VNode,
} from 'vue';
import {
	isDragNodeDataObject,
	isDragNodeObject,
	isLocationChildrenDetail,
	isNodeSchema,
	Logger,
	mergeAssets,
} from '@arvin-shu/microcode-utils';
import { DocumentModel, INode, insertChildren, Node } from '../document';
import { IProject, Project } from '../project';
import { Dragon, IDragon } from './dragon';
import { ComponentMeta, IComponentMeta } from '../component-meta';
import { DropLocation } from './location';
import { Scroller } from './scroller';
import { Detecting } from './detecting';
import { INodeSelector } from '../simulator';
import { createOffsetObserver, OffsetObserver } from './offset-observer';
import { ISelection } from '../document/selection';
import { ComponentActions } from '../component-actions';
import { ISettingTopEntry, SettingTopEntry } from './setting';
import { ActiveTracker, IActiveTracker } from './active-tracker';
import { BemToolsManager } from '../builtin-simulator/bem-tools/manager';

const logger = new Logger({ level: 'warn', bizName: 'designer' });

export const designerProps = {
	editor: {
		type: Object as PropType<IPublicModelEditor>,
		required: true,
	},
	shellModelFactory: {
		type: Object as PropType<IShellModelFactory>,
	},
	className: {
		type: String,
	},
	style: {
		type: Object as PropType<CSSProperties>,
	},
	hotkeys: {
		type: Object,
	},
	viewName: {
		type: String,
	},
	simulatorProps: {
		type: [Object, Function] as PropType<
			Record<string, any> | ((document: DocumentModel) => object)
		>,
	},
	simulatorComponent: {
		type: Object as PropType<Component<any> | VNode>,
	},
	dragGhostComponent: {
		type: Object as PropType<Component<any> | VNode>,
	},
	suspensed: {
		type: Boolean,
	},
	defaultSchema: {
		type: Object as PropType<IPublicTypeProjectSchema>,
	},
	componentMetadatas: {
		type: Array as PropType<IPublicTypeComponentMetadata[]>,
	},
	globalComponentActions: {
		type: Array as PropType<IPublicTypeComponentAction[]>,
	},
	onMount: {
		type: Function as PropType<(designer: Designer) => void>,
	},
	onDragstart: {
		type: Function as PropType<(e: IPublicModelLocateEvent) => void>,
	},
	onDrag: {
		type: Function as PropType<(e: IPublicModelLocateEvent) => void>,
	},
	onDragend: {
		type: Function as PropType<
			(
				e: { dragObject: IPublicModelDragObject; copy: boolean },
				loc?: DropLocation
			) => void
		>,
	},
};

export type DesignerProps = ExtractPropTypes<typeof designerProps>;

export interface IDesigner {
	readonly shellModelFactory: IShellModelFactory;

	viewName: string | undefined;

	readonly project: IProject;

	readonly bemToolsManager: BemToolsManager;

	get dragon(): IDragon;

	get componentActions(): ComponentActions;

	get editor(): IPublicModelEditor;

	get detecting(): Detecting;

	get activeTracker(): IActiveTracker;

	get simulatorComponent(): Component<any> | VNode | undefined;

	get currentSelection(): ISelection | undefined;

	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller;

	refreshComponentMetasMap(): void;

	createOffsetObserver(nodeInstance: INodeSelector): OffsetObserver | null;

	createLocation(locationData: IPublicTypeLocationData<INode>): DropLocation;

	get componentsMap(): {
		[key: string]: IPublicTypeNpmInfo | Component<any> | object;
	};

	loadIncrementalAssets(
		incrementalAssets: IPublicTypeAssetsJson
	): Promise<void>;

	getComponentMeta(
		componentName: string,
		generateMetadata?: () => IPublicTypeComponentMetadata | null
	): IComponentMeta;

	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null;

	clearLocation(): void;

	createSettingEntry(nodes: INode[]): ISettingTopEntry;

	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null;

	getComponentMetasMap(): Map<string, IComponentMeta>;

	addPropsReducer(
		reducer: IPublicTypePropsTransducer,
		stage: IPublicEnumTransformStage
	): void;

	transformProps(
		props: IPublicTypeCompositeObject | IPublicTypePropsList,
		node: Node,
		stage: IPublicEnumTransformStage
	): IPublicTypeCompositeObject | IPublicTypePropsList;

	postEvent(event: string, ...args: any[]): void;
}

export class Designer implements IDesigner {
	dragon: IDragon;

	viewName: string | undefined;

	readonly componentActions = new ComponentActions();

	readonly shellModelFactory: IShellModelFactory;

	readonly activeTracker = new ActiveTracker();

	private props?: DesignerProps;

	readonly editor: IPublicModelEditor;

	readonly bemToolsManager = new BemToolsManager(this);

	private _dropLocation?: DropLocation;

	readonly detecting = new Detecting();

	private oobxList: OffsetObserver[] = [];

	// 当前正在编排的项目实例
	readonly project: IProject;

	// 丢失的组件元数据映射表
	private _lostComponentMetasMap = new Map<string, ComponentMeta>();

	// 组件元数据映射表
	private _componentMetasMap: Ref<Map<string, IComponentMeta>> = ref(
		new Map<string, IComponentMeta>()
	) as Ref<Map<string, IComponentMeta>>;

	private selectionDispose: undefined | (() => void);

	// 模拟器属性
	private _simulatorProps: Ref<Record<string, any>> = ref({});

	private propsReducers = new Map<
		IPublicEnumTransformStage,
		IPublicTypePropsTransducer[]
	>();

	get currentDocument() {
		return this.project.currentDocument;
	}

	get currentHistory() {
		return this.currentDocument?.history;
	}

	get currentSelection() {
		return this.currentDocument?.selection;
	}

	private _simulatorComponent = ref<Component<any> | VNode | undefined>(
		undefined
	);

	get simulatorComponent() {
		return this._simulatorComponent.value as any;
	}

	private _suspensed = ref<boolean>(false);

	get suspensed() {
		return this._suspensed.value;
	}

	set suspensed(value: boolean) {
		this._suspensed.value = value;
	}

	constructor(props: DesignerProps) {
		const { editor, viewName, shellModelFactory, defaultSchema } = props;
		this.editor = editor!;
		this.viewName = viewName;
		this.shellModelFactory = shellModelFactory!;
		this.setProps(props);
		this.project = new Project(this, defaultSchema, viewName);
		this.dragon = new Dragon(this);
		this.dragon.onDragstart((e) => {
			this.detecting.enable = false;
			const { dragObject } = e;
			if (isDragNodeObject(dragObject)) {
				if (dragObject.nodes.length === 1) {
					if (dragObject.nodes[0].parent) {
						dragObject.nodes[0].select();
					} else {
						this.currentSelection?.clear();
					}
				}
			} else {
				this.currentSelection?.clear();
			}
			if (this.props?.onDragstart) {
				this.props.onDragstart(e);
			}
			this.postEvent('dragstart', e);
		});

		this.dragon.onDrag((e) => {
			if (this.props?.onDrag) {
				this.props.onDrag(e);
			}
			this.postEvent('drag', e);
		});
		this.dragon.onDragend((e) => {
			// 插入
			const { dragObject, copy } = e;
			const loc = this._dropLocation;

			if (loc) {
				// @ts-ignore
				if (
					isLocationChildrenDetail(loc.detail) &&
					loc.detail.valid !== false
				) {
					let nodes: INode[] | undefined;
					if (isDragNodeObject(dragObject)) {
						nodes = insertChildren(
							loc.target,
							// @ts-ignore
							[...dragObject.nodes],
							loc.detail.index,
							copy
						);
					} else if (isDragNodeDataObject(dragObject)) {
						// @ts-ignore
						const nodeData = Array.isArray(dragObject.data)
							? dragObject.data
							: [dragObject.data];
						const isNotNodeSchema = nodeData.find(
							(item) => !isNodeSchema(item)
						);
						if (isNotNodeSchema) {
							return;
						}
						nodes = insertChildren(loc.target, nodeData, loc.detail.index);
					}
					if (nodes) {
						loc.document?.selection.selectAll(nodes.map((o) => o.id));
						setTimeout(() => this.activeTracker.track(nodes![0]), 10);
					}
				}
			}
			if (this.props?.onDragend) {
				this.props.onDragend(e as any, loc);
			}
			this.postEvent('dragend', e, loc);
			this.detecting.enable = true;
		});

		this.activeTracker.onChange(({ node, detail }) => {
			node.document?.simulator?.scrollToNode(node, detail);
		});

		let historyDispose: undefined | (() => void);
		const setupHistory = () => {
			if (historyDispose) {
				historyDispose();
				historyDispose = undefined;
			}
			this.postEvent('history.change', this.currentHistory);
			if (this.currentHistory) {
				const { currentHistory } = this;
				historyDispose = currentHistory.onStateChange(() => {
					this.postEvent('history.change', currentHistory);
				});
			}
		};
		this.project.onCurrentDocumentChange(() => {
			this.postEvent('current-document.change', this.currentDocument);
			this.postEvent('selection.change', this.currentSelection);
			this.postEvent('history.change', this.currentHistory);
			this.setupSelection();
			setupHistory();
		});
		this.postEvent('init', this);
		this.setupSelection();
		setupHistory();
	}

	setupSelection() {
		if (this.selectionDispose) {
			this.selectionDispose();
			this.selectionDispose = undefined;
		}
		const { currentSelection } = this;
		// 避免选中 Page 组件，默认选中第一个子节点；新增规则 或 判断 Live 模式
		if (
			currentSelection &&
			currentSelection.selected.length === 0 &&
			(this.simulatorProps as any)?.designMode === 'live'
		) {
			const rootNodeChildrens = this.currentDocument
				?.getRoot()
				?.getChildren()?.children;
			if (rootNodeChildrens && rootNodeChildrens.length > 0) {
				currentSelection.select(rootNodeChildrens[0].id);
			}
		}

		this.postEvent('selection.change', currentSelection);
		if (currentSelection) {
			this.selectionDispose = currentSelection.onSelectionChange(() => {
				this.postEvent('selection.change', currentSelection);
			});
		}
	}

	postEvent(event: string, ...args: any[]) {
		this.editor.eventBus.emit(`designer.${event}`, ...args);
	}

	get dropLocation() {
		return this._dropLocation;
	}

	createLocation(locationData: IPublicTypeLocationData<INode>): DropLocation {
		const loc = new DropLocation(locationData);
		if (
			this._dropLocation &&
			this._dropLocation.document &&
			this._dropLocation.document !== loc.document
		) {
			this._dropLocation.document.dropLocation = null;
		}
		this._dropLocation = loc;
		this.postEvent('dropLocation.change', loc);
		if (loc.document) {
			toRaw(loc.document).dropLocation = loc;
		}
		this.activeTracker.track({ node: loc.target, detail: loc.detail });
		return loc;
	}

	clearLocation() {
		if (this._dropLocation && this._dropLocation.document) {
			this._dropLocation.document.dropLocation = null;
		}
		this.postEvent('dropLocation.change', undefined);
		this._dropLocation = undefined;
	}

	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller {
		return new Scroller(scrollable);
	}

	createOffsetObserver(nodeInstance: INodeSelector): OffsetObserver | null {
		const oobx = createOffsetObserver(nodeInstance);
		this.clearOobxList();
		if (oobx) {
			this.oobxList.push(oobx);
		}
		return oobx;
	}

	createSettingEntry(nodes: INode[]) {
		return new SettingTopEntry(this.editor, nodes);
	}

	private clearOobxList(force?: boolean) {
		let l = this.oobxList.length;
		if (l > 20 || force) {
			while (l-- > 0) {
				if (this.oobxList[l].isPurged()) {
					this.oobxList.splice(l, 1);
				}
			}
		}
	}

	touchOffsetObserver() {
		this.clearOobxList(true);
		this.oobxList.forEach((item) => item.compute());
	}

	/**
	 * 设置属性
	 *
	 * @param nextProps
	 */
	setProps(nextProps: DesignerProps) {
		const props = this.props ? { ...this.props, ...nextProps } : nextProps;
		if (this.props) {
			if (props.simulatorComponent !== this.props.simulatorComponent) {
				this._simulatorComponent.value = props.simulatorComponent;
			}
			if (props.simulatorProps !== this.props.simulatorProps) {
				this._simulatorProps.value = props.simulatorProps || {};
				// 重新 setupSelection
				if (
					// @ts-ignore
					props.simulatorProps?.designMode !==
					// @ts-ignore
					this.props.simulatorProps?.designMode
				) {
					this.setupSelection();
				}
			}
			if (props.suspensed !== this.props.suspensed && props.suspensed != null) {
				this.suspensed = props.suspensed;
			}
			if (props.simulatorProps !== this.props.simulatorProps) {
				this._simulatorProps.value = props.simulatorProps || {};
			}
			if (
				props.componentMetadatas !== this.props.componentMetadatas &&
				props.componentMetadatas != null
			) {
				this.buildComponentMetasMap(props.componentMetadatas);
			}
		} else {
			if (props.simulatorComponent) {
				this._simulatorComponent.value = props.simulatorComponent;
			}
			if (props.simulatorProps) {
				this._simulatorProps.value = props.simulatorProps || {};
			}
			if (props.suspensed != null) {
				this.suspensed = props.suspensed;
			}
			if (props.componentMetadatas != null) {
				this.buildComponentMetasMap(props.componentMetadatas);
			}
		}
		this.props = props;
	}

	async loadIncrementalAssets(
		incrementalAssets: IPublicTypeAssetsJson
	): Promise<void> {
		const { components, packages } = incrementalAssets;
		components && this.buildComponentMetasMap(components);
		if (packages) {
			await this.project.simulator?.setupComponents(packages);
		}

		if (components) {
			// 合并 assets
			const assets = this.editor.get('assets') || {};
			const newAssets = mergeAssets(assets, incrementalAssets);
			// 对于 assets 存在需要二次网络下载的过程，必须 await 等待结束之后，再进行事件触发
			await this.editor.set('assets', newAssets);
		}
		//  因为涉及修改 prototype.view，之后在 renderer 里修改了 vc 的 view 获取逻辑后，可删除
		this.refreshComponentMetasMap();
		// 完成加载增量资源后发送事件，方便插件监听并处理相关逻辑
		this.editor.eventBus.emit('designer.incrementalAssetsReady');
	}

	get(key: string) {
		// @ts-ignore
		return this.props?.[key];
	}

	/**
	 * 刷新 componentMetasMap，可间接触发模拟器里的 buildComponents
	 */
	refreshComponentMetasMap() {
		this._componentMetasMap.value = new Map(this._componentMetasMap.value);
	}

	private readonly computedSimulatorProps = computed(() => {
		if (typeof this._simulatorProps.value === 'function') {
			return this._simulatorProps.value(this.project);
		}
		return this._simulatorProps.value || {};
	});

	get simulatorProps() {
		return this.computedSimulatorProps.value;
	}

	/**
	 * 提供给模拟器使用的属性
	 */
	private readonly computedProjectSimulatorProps = computed(() => ({
		...this.simulatorProps,
		project: this.project,
		designer: this,
		// 模拟器挂载完成时调用将模拟器实例传递给project
		onMount: (simulator: any) => {
			this.project.mountSimulator(simulator);
			this.editor.set('simulator', simulator);
		},
	}));

	get projectSimulatorProps() {
		return this.computedProjectSimulatorProps.value;
	}

	get schema(): IPublicTypeProjectSchema {
		return this.project.getSchema();
	}

	setSchema(schema?: IPublicTypeProjectSchema) {
		this.project.load(schema);
	}

	/**
	 * 构建组件元数据映射表
	 * 方法再内置插件中进行调用，监听通过material来assets变化通过designer的实例进行调用
	 *
	 * @param metas 组件元数据
	 */
	buildComponentMetasMap(metas: IPublicTypeComponentMetadata[]) {
		metas.forEach((meta) => {
			this.createComponentMeta(meta);
		});
	}

	/**
	 * 创建组件元数据
	 *
	 * @param data 组件元数据配置
	 * @returns 组件元数据实例,如果组件名为空则返回null
	 */
	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null {
		// 获取组件名作为key
		const key = data.componentName;
		if (!key) {
			return null;
		}
		// 从组件元数据映射表中查找是否已存在
		let meta = this._componentMetasMap.value.get(key);
		if (meta) {
			// 如果存在则更新元数据
			meta.setMetadata(data);
			this._componentMetasMap.value.set(key, meta);
		} else {
			// 从丢失的组件元数据映射表中查找
			meta = this._lostComponentMetasMap.get(key);
			if (meta) {
				// 如果在丢失表中找到则更新元数据并从丢失表中删除
				meta.setMetadata(data);
				this._lostComponentMetasMap.delete(key);
			} else {
				// 如果都没有找到则创建新的组件元数据
				meta = new ComponentMeta(this, data);
			}
			// 将元数据添加到映射表中
			this._componentMetasMap.value.set(key, meta);
		}

		return meta;
	}

	getGlobalComponentActions(): IPublicTypeComponentAction[] | null {
		return this.props?.globalComponentActions || null;
	}

	getComponentMeta(
		componentName: string,
		generateMetadata?: () => IPublicTypeComponentMetadata | null
	): IComponentMeta {
		if (this._componentMetasMap.value.has(componentName)) {
			return this._componentMetasMap.value.get(componentName)!;
		}

		if (this._lostComponentMetasMap.has(componentName)) {
			return this._lostComponentMetasMap.get(componentName)!;
		}

		const meta = new ComponentMeta(this, {
			componentName,
			...(generateMetadata ? generateMetadata() : null),
		});
		// 将元数据添加到丢失表中
		this._lostComponentMetasMap.set(componentName, meta);

		return meta;
	}

	getComponentMetasMap() {
		return this._componentMetasMap.value;
	}

	private readonly computedComponentsMap = computed(() => {
		const maps: any = {};
		const designer = this;
		designer._componentMetasMap.value.forEach((config, key) => {
			const metaData = config.getMetadata();
			if (metaData.devMode === 'microCode') {
				maps[key] = metaData.schema;
			} else {
				const { view } = config.advanced;
				if (view) {
					maps[key] = view;
				} else {
					maps[key] = toRaw(config.npm);
				}
			}
		});
		return maps;
	});

	get componentsMap() {
		return this.computedComponentsMap.value;
	}

	/**
	 * 转换属性
	 *
	 * @param props 属性
	 * @param node 节点
	 * @param stage 阶段
	 * @returns 转换后的属性
	 */
	transformProps(
		props: IPublicTypeCompositeObject | IPublicTypePropsList,
		node: Node,
		stage: IPublicEnumTransformStage
	) {
		if (Array.isArray(props)) {
			return props;
		}

		const reducers = this.propsReducers.get(stage);
		// 如果没有reducer则返回props
		if (!reducers) {
			return props;
		}

		return reducers.reduce((xprops, reducer) => {
			try {
				return reducer(xprops, node.internalToShellNode() as any, { stage });
			} catch (e) {
				// eslint-disable-next-line no-console
				console.warn(e);
				return xprops;
			}
		}, props);
	}

	addPropsReducer(
		reducer: IPublicTypePropsTransducer,
		stage: IPublicEnumTransformStage
	) {
		if (!reducer) {
			logger.error('reducer is not available');
			return;
		}
		const reducers = this.propsReducers.get(stage);
		if (reducers) {
			reducers.push(reducer);
		} else {
			this.propsReducers.set(stage, [reducer]);
		}
	}
}
