import {
	IPublicEnumTransformStage,
	IPublicModelEditor,
	IPublicModelScroller,
	IPublicTypeComponentMetadata,
	IPublicTypeCompositeObject,
	IPublicTypeLocationData,
	IPublicTypePropsList,
	IPublicTypePropsTransducer,
	IPublicTypeScrollable,
} from '@arvin-shu/microcode-types';
import {
	computed,
	CSSProperties,
	ExtractPropTypes,
	isProxy,
	PropType,
	Ref,
	ref,
	toRaw,
} from 'vue';
import {
	isDragNodeDataObject,
	isDragNodeObject,
	isLocationChildrenDetail,
	isNodeSchema,
} from '@arvin-shu/microcode-utils';
import { INode, insertChildren, Node } from '../document';
import { IProject, Project } from '../project';
import { Dragon, IDragon } from './dragon';
import { ComponentMeta, IComponentMeta } from '../component-meta';
import { DropLocation } from './location';
import { Scroller } from './scroller';
import { Detecting } from './detecting';

export const designerProps = {
	editor: {
		type: Object as PropType<IPublicModelEditor>,
		required: true,
	},
	className: {
		type: String,
	},
	style: {
		type: Object as PropType<CSSProperties>,
	},
	onMount: {
		type: Function as PropType<(designer: Designer) => void>,
	},
	simulatorProps: {
		type: Object as PropType<Record<string, any>>,
	},
	componentMetadatas: {
		type: Array as PropType<IPublicTypeComponentMetadata[]>,
	},
};

export type DesignerProps = ExtractPropTypes<typeof designerProps>;

export interface IDesigner {
	get dragon(): IDragon;
	get editor(): IPublicModelEditor;
	readonly project: IProject;
	get detecting(): Detecting;

	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller;

	createComponentMeta(
		data: IPublicTypeComponentMetadata
	): IComponentMeta | null;

	getComponentMeta(
		componentName: string,
		generateMetadata?: () => IPublicTypeComponentMetadata | null
	): IComponentMeta;

	transformProps(
		props: IPublicTypeCompositeObject | IPublicTypePropsList,
		node: Node,
		stage: IPublicEnumTransformStage
	): IPublicTypeCompositeObject | IPublicTypePropsList;

	postEvent(event: string, ...args: any[]): void;

	clearLocation(): void;

	createLocation(locationData: IPublicTypeLocationData<INode>): DropLocation;
}

export class Designer implements IDesigner {
	// 拖拽实例
	dragon: IDragon;

	private props?: DesignerProps;

	readonly editor: IPublicModelEditor;

	private _dropLocation?: DropLocation;

	readonly detecting = new Detecting();

	// 当前正在编排的项目实例
	readonly project: IProject;

	// 丢失的组件元数据映射表
	private _lostComponentMetasMap = new Map<string, ComponentMeta>();

	// 组件元数据映射表
	private _componentMetasMap: Ref<Map<string, IComponentMeta>> = ref(
		new Map<string, IComponentMeta>()
	) as Ref<Map<string, IComponentMeta>>;

	// 模拟器属性
	private _simulatorProps: Ref<Record<string, any>> = ref({});

	private propsReducers = new Map<
		IPublicEnumTransformStage,
		IPublicTypePropsTransducer[]
	>();

	get currentDocument() {
		return this.project.currentDocument;
	}

	get currentSelection() {
		return this.currentDocument?.selection;
	}

	constructor(props: DesignerProps) {
		this.editor = props.editor!;
		this.dragon = new Dragon(this);
		this.project = new Project(this);
		this.setProps(props);
		this.dragon.onDragstart((e) => {
			this.detecting.enable = false;
			const { dragObject } = e;
			if (isDragNodeObject(dragObject)) {
				if (dragObject.nodes.length === 1) {
					if (dragObject.nodes[0].parent) {
						// ensure current selecting
						dragObject.nodes[0].select();
					} else {
						this.currentSelection?.clear();
					}
				}
			} else {
				this.currentSelection?.clear();
			}
			// TODO 拖拽开始事件
			// if (this.props?.onDragstart) {
			// 	this.props.onDragstart(e);
			// }
			this.postEvent('dragstart', e);
		});

		this.dragon.onDrag((e) => {
			// TODO 拖拽中事件
			// if (this.props?.onDrag) {
			// 	this.props.onDrag(e);
			// }
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
						// TODO setTimeout(() => this.activeTracker.track(nodes![0]), 10);
					}
				}
			}
			// TODO 拖拽结束事件
			// if (this.props?.onDragend) {
			// 	this.props.onDragend(e, loc);
			// }
			this.postEvent('dragend', e, loc);
			this.detecting.enable = true;
		});
	}

	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller {
		return new Scroller(scrollable);
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
		// TODO this.activeTracker.track({ node: loc.target, detail: loc.detail });
		return loc;
	}

	simulatorProps = computed(() => this._simulatorProps.value);

	/**
	 * 提供给模拟器使用的属性
	 */
	projectSimulatorProps = computed<Record<string, any>>(() => ({
		...this.simulatorProps.value,
		project: this.project,
		designer: this,
		// 模拟器挂载完成时调用将模拟器实例传递给project
		onMount: (simulator: any) => {
			this.project.mountSimulator(simulator);
			this.editor.set('simulator', simulator);
		},
	}));

	/**
	 * 设置属性
	 *
	 * @param nextProps
	 */
	setProps(nextProps: DesignerProps) {
		const props = this.props ? { ...this.props, ...nextProps } : nextProps;
		if (this.props) {
			//
			if (props.simulatorProps !== this.props.simulatorProps) {
				this._simulatorProps.value = props.simulatorProps || {};
			}
		} else {
			//
			if (props.simulatorProps) {
				this._simulatorProps.value = props.simulatorProps || {};
			}
		}
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

	/**
	 * 获取组件元数据
	 *
	 * @param componentName 组件名
	 * @param generateMetadata 生成组件元数据
	 * @returns 组件元数据实例
	 */
	getComponentMeta(
		componentName: string,
		generateMetadata?: () => IPublicTypeComponentMetadata | null
	): IComponentMeta {
		if (isProxy(this._componentMetasMap)) {
			console.log(this._componentMetasMap);
		}

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

	clearLocation() {}

	postEvent(event: string, ...args: any[]) {
		this.editor.eventBus.emit(`designer.${event}`, ...args);
	}
}
