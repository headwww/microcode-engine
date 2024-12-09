import {
	IPublicEnumTransformStage,
	IPublicModelEditor,
	IPublicTypeComponentMetadata,
	IPublicTypeCompositeObject,
	IPublicTypePropsList,
	IPublicTypePropsTransducer,
} from '@arvin-shu/microcode-types';
import {
	computed,
	CSSProperties,
	ExtractPropTypes,
	PropType,
	Ref,
	ref,
} from 'vue';
import { insertChildren, Node } from '../document';
import { IProject, Project } from '../project';
import { Dragon, IDragon } from './dragon';
import { ComponentMeta, IComponentMeta } from '../component-meta';

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
}

export class Designer implements IDesigner {
	// 拖拽实例
	dragon: IDragon;

	private props?: DesignerProps;

	readonly editor: IPublicModelEditor;

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

	constructor(props: DesignerProps) {
		this.editor = props.editor!;
		this.dragon = new Dragon(this);
		this.project = new Project(this);
		this.setProps(props);
		this.dragon.onDragend((e) => {
			// 插入
			const { dragObject } = e;

			const nodeData = Array.isArray(dragObject)
				? dragObject.data
				: [dragObject.data];
			nodeData;
			insertChildren;
		});
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
