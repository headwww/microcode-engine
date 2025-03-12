import { VNode } from 'vue';
import {
	IPublicTypeCompositeValue,
	IPublicTypeI18nData,
	IPublicTypeIconType,
	IPublicTypeNodeSchema,
	IPublicTypePropsList,
	IPublicTypePropsMap,
} from '../type';
import { IPublicModelDocumentModel } from './document-model';
import { IPublicModelNodeChildren } from './node-children';
import { IPublicModelProp } from './prop';
import { IPublicEnumTransformStage } from '../enum';
import { IPublicModelComponentMeta } from './component-meta';
import { IPublicModelProps } from './props';
import { IPublicModelExclusiveGroup } from './exclusive-group';
import { IPublicModelSettingTopEntry } from './setting-top-entry';

export interface IBaseModelNode<
	Document = IPublicModelDocumentModel,
	Node = IPublicModelNode,
	NodeChildren = IPublicModelNodeChildren,
	ComponentMeta = IPublicModelComponentMeta,
	SettingTopEntry = IPublicModelSettingTopEntry,
	Props = IPublicModelProps,
	Prop = IPublicModelProp,
	ExclusiveGroup = IPublicModelExclusiveGroup,
> {
	/**
	 * 节点id
	 */
	id: string;

	/**
	 * 节点标题
	 */
	get title(): string | IPublicTypeI18nData | VNode;

	/**
	 * @deprecated please use isContainerNode
	 */
	get isContainer(): boolean;

	/**
	 * 是否为「容器型」节点
	 */
	get isContainerNode(): boolean;

	/**
	 * @deprecated please use isRootNode
	 */
	get isRoot(): boolean;

	/**
	 * 是否为根节点
	 */
	get isRootNode(): boolean;

	/**
	 * @deprecated please use isEmptyNode
	 */
	get isEmpty(): boolean;

	/**
	 * 是否为空节点（无 children 或者 children 为空）
	 */
	get isEmptyNode(): boolean;

	/**
	 * @deprecated please use isPageNode
	 * 是否为 Page 节点
	 */
	get isPage(): boolean;

	/**
	 * 是否为 Page 节点
	 */
	get isPageNode(): boolean;

	/**
	 * @deprecated please use isComponentNode
	 */
	get isComponent(): boolean;

	/**
	 * 是否为 Component 节点
	 */
	get isComponentNode(): boolean;

	/**
	 * @deprecated please use isModalNode
	 */
	get isModal(): boolean;

	/**
	 * 是否为「模态框」节点
	 */
	get isModalNode(): boolean;

	/**
	 * @deprecated please use isSlotNode
	 */
	get isSlot(): boolean;

	/**
	 * 是否为插槽节点
	 */
	get isSlotNode(): boolean;

	/**
	 * @deprecated please use isParentalNode
	 */
	get isParental(): boolean;

	/**
	 * 是否为父类/分支节点
	 */
	get isParentalNode(): boolean;

	/**
	 * @deprecated please use isLeafNode
	 */
	get isLeaf(): boolean;

	/**
	 * 是否为叶子节点
	 */
	get isLeafNode(): boolean;

	/**
	 * 获取当前节点的锁定状态
	 */
	get isLocked(): boolean;

	/**
	 * @deprecated please use isRGLContainerNode
	 */
	set isRGLContainer(flag: boolean);

	/**
	 * @deprecated please use isRGLContainerNode
	 * @returns Boolean
	 */
	get isRGLContainer();

	/**
	 * 设置为磁贴布局节点
	 */
	set isRGLContainerNode(flag: boolean);

	/**
	 * 获取磁贴布局节点设置状态
	 * @returns Boolean
	 */
	get isRGLContainerNode();

	/**
	 * 下标
	 */
	get index(): number | undefined;

	/**
	 * 图标
	 */
	get icon(): IPublicTypeIconType;

	/**
	 * 节点所在树的层级深度，根节点深度为 0
	 */
	get zLevel(): number;

	/**
	 * 节点 componentName
	 */
	get componentName(): string;

	/**
	 * 节点的物料元数据
	 */
	get componentMeta(): ComponentMeta | null;

	/**
	 * 获取节点所属的文档模型对象
	 */
	get document(): Document | null;

	/**
	 * 获取当前节点的前一个兄弟节点
	 */
	get prevSibling(): Node | null | undefined;

	/**
	 * 获取当前节点的后一个兄弟节点
	 */
	get nextSibling(): Node | null | undefined;

	/**
	 * 获取当前节点的父亲节点
	 */
	get parent(): Node | null;

	/**
	 * 获取当前节点的孩子节点模型
	 */
	get children(): NodeChildren | null;

	/**
	 * 节点上挂载的插槽节点们
	 */
	get slots(): Node[];

	/**
	 * 当前节点为插槽节点时，返回节点对应的属性实例
	 */
	get slotFor(): Prop | null | undefined;

	/**
	 * 返回节点的属性集
	 */
	get props(): Props | null;

	/**
	 * 返回节点的属性集
	 */
	get propsData(): IPublicTypePropsMap | IPublicTypePropsList | null;

	/**
	 * get conditionGroup
	 */
	get conditionGroup(): ExclusiveGroup | null;

	/**
	 * 获取符合搭建协议 - 节点 schema 结构
	 */
	get schema(): IPublicTypeNodeSchema;

	/**
	 * 获取对应的 setting entry
	 */
	get settingEntry(): SettingTopEntry;

	/**
	 * 返回节点的尺寸、位置信息
	 */
	getRect(): DOMRect | null;

	/**
	 * 是否有挂载插槽节点
	 */
	hasSlots(): boolean;
	/**
	 * 是否设定了渲染条件
	 */
	hasCondition(): boolean;

	/**
	 * 是否设定了循环数据
	 */
	hasLoop(): boolean;

	/**
	 * 获取指定 path 的属性模型实例
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param createIfNone 如果不存在，是否新建，默认为 true
	 */
	getProp(path: string | number, createIfNone?: boolean): Prop | null;

	/**
	 * 获取指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 */
	getPropValue(path: string): any;

	/**
	 * 获取指定 path 的属性模型实例，
	 *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
	 *
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param createIfNone 当没有属性的时候，是否创建一个属性
	 */
	getExtraProp(path: string, createIfNone?: boolean): Prop | null;

	/**
	 * 获取指定 path 的属性模型实例，
	 *  注：导出时，不同于普通属性，该属性并不挂载在 props 之下，而是与 props 同级
	 *
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @returns
	 */
	getExtraPropValue(path: string): any;

	/**
	 * 设置指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param value 值
	 */
	setPropValue(path: string | number, value: IPublicTypeCompositeValue): void;

	/**
	 * 设置指定 path 的属性模型实例值
	 * @param path 属性路径，支持 a / a.b / a.0 等格式
	 * @param value 值
	 */
	setExtraPropValue(path: string, value: IPublicTypeCompositeValue): void;

	/**
	 * 导入节点数据
	 * @param data
	 */
	importSchema(data: IPublicTypeNodeSchema): void;

	/**
	 * 导出节点数据
	 * @param stage
	 * @param options
	 */
	exportSchema(
		stage: IPublicEnumTransformStage,
		options?: any
	): IPublicTypeNodeSchema;

	/**
	 * 在指定位置之前插入一个节点
	 * @param node
	 * @param ref
	 * @param useMutator
	 */
	insertBefore(node: Node, ref?: Node | undefined, useMutator?: boolean): void;

	/**
	 * 在指定位置之后插入一个节点
	 * @param node
	 * @param ref
	 * @param useMutator
	 */
	insertAfter(node: Node, ref?: Node | undefined, useMutator?: boolean): void;

	/**
	 * 替换指定节点
	 * @param node 待替换的子节点
	 * @param data 用作替换的节点对象或者节点描述
	 * @returns
	 */
	replaceChild(node: Node, data: any): Node | null;

	/**
	 * 将当前节点替换成指定节点描述
	 */
	replaceWith(schema: IPublicTypeNodeSchema): any;

	/**
	 * 选中当前节点实例
	 */
	select(): void;

	/**
	 * 设置悬停态
	 */
	hover(flag: boolean): void;

	/**
	 * 设置节点锁定状态
	 */
	lock(flag?: boolean): void;

	/**
	 * 删除当前节点实例
	 */
	remove(): void;

	/**
	 * 执行新增、删除、排序等操作
	 */
	mergeChildren(
		remover: (node: Node, idx: number) => boolean,
		adder: (children: Node[]) => any,
		sorter: (firstNode: Node, secondNode: Node) => number
	): any;

	/**
	 * 当前节点是否包含某子节点
	 */
	contains(node: Node): boolean;

	/**
	 * 是否可执行某 action
	 * @param actionName action 名字
	 */
	canPerformAction(actionName: string): boolean;

	/**
	 * 当前节点是否可见
	 */
	get visible(): boolean;

	/**
	 * 设置当前节点是否可见
	 */
	set visible(value: boolean);

	/**
	 * 获取该节点的 ConditionalVisible 值
	 */
	isConditionalVisible(): boolean | undefined;

	/**
	 * 设置该节点的 ConditionalVisible 为 true
	 */
	setConditionalVisible(): void;

	/**
	 * 获取节点实例对应的 dom 节点
	 */
	getDOMNode(): HTMLElement;

	/**
	 * 获取磁贴相关信息
	 */
	getRGL(): {
		isContainerNode: boolean;
		isEmptyNode: boolean;
		isRGLContainerNode: boolean;
		isRGLNode: boolean;
		isRGL: boolean;
		rglNode: Node | null;
	};
}

export interface IPublicModelNode
	extends IBaseModelNode<IPublicModelDocumentModel, IPublicModelNode> {}
