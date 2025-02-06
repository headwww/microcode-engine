import { IPublicApiProject } from '../api';
import { IPublicEnumTransformStage } from '../enum';
import {
	IPublicTypeDisposable,
	IPublicTypeDragNodeDataObject,
	IPublicTypeDragNodeObject,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypeOnChangeOptions,
	IPublicTypePropChangeOptions,
	IPublicTypeRootSchema,
} from '../type';
import { IPublicModelDetecting } from './detecting';
import { IPublicModelDropLocation } from './drop-location';
import { IPublicModelNode } from './node';
import { IPublicModelSelection } from './selection';

export interface IPublicModelDocumentModel<
	Selection = IPublicModelSelection,
	Node = IPublicModelNode,
	DropLocation = IPublicModelDropLocation,
	Project = IPublicApiProject,
> {
	/**
	 * 画布节点 hover 区模型实例
	 */
	detecting: IPublicModelDetecting;

	/**
	 * 节点选中区模型实例
	 */
	selection: Selection;

	/**
	 * id
	 */
	get id(): string;

	set id(id);

	/**
	 * 获取当前文档所属的 project
	 * @returns
	 */
	get project(): Project;

	/**
	 * 获取文档的根节点
	 * @returns
	 */
	get root(): Node | null;

	get focusNode(): Node | null;

	set focusNode(node: Node | null);

	/**
	 * 获取文档下所有节点
	 * @returns
	 */
	get nodesMap(): Map<string, Node>;

	/**
	 * 根据 nodeId 返回 Node 实例
	 * @param nodeId
	 * @returns
	 */
	getNodeById(nodeId: string): Node | null;

	/**
	 * 导入 schema
	 * @param schema
	 */
	importSchema(schema: IPublicTypeRootSchema): void;

	/**
	 * 导出 schema
	 * @param stage
	 * @returns
	 */
	exportSchema(
		stage: IPublicEnumTransformStage
	): IPublicTypeRootSchema | undefined;

	/**
	 * 插入节点
	 */
	insertNode(
		parent: Node,
		thing: Node | IPublicTypeNodeData,
		at?: number | null | undefined,
		copy?: boolean | undefined
	): Node | null;

	/**
	 * 创建一个节点
	 * @param data
	 * @returns
	 */
	createNode<T = Node>(data: IPublicTypeNodeSchema): T | null;

	/**
	 * 移除指定节点/节点id
	 * @param idOrNode
	 */
	removeNode(idOrNode: string | Node): void;

	/**
	 * componentsMap of documentModel
	 * @param extraComps
	 * @returns
	 */
	getComponentsMap(extraComps?: string[]): any;

	/**
	 * 检查拖拽放置的目标节点是否可以放置该拖拽对象
	 * @param dropTarget 拖拽放置的目标节点
	 * @param dragObject 拖拽的对象
	 * @returns boolean 是否可以放置
	 * @since v1.0.16
	 */
	checkNesting(
		dropTarget: Node,
		dragObject: IPublicTypeDragNodeObject | IPublicTypeDragNodeDataObject
	): boolean;

	/**
	 * 当前 document 新增节点事件
	 */
	onAddNode(fn: (node: Node) => void): IPublicTypeDisposable;

	/**
	 * 当前 document 新增节点事件，此时节点已经挂载到 document 上
	 */
	onMountNode(fn: (payload: { node: Node }) => void): IPublicTypeDisposable;

	/**
	 * 当前 document 删除节点事件
	 */
	onRemoveNode(fn: (node: Node) => void): IPublicTypeDisposable;

	/**
	 * 当前 document 的 hover 变更事件
	 *
	 */
	onChangeDetecting(fn: (node: Node) => void): IPublicTypeDisposable;

	/**
	 * 当前 document 的选中变更事件
	 */
	onChangeSelection(fn: (ids: string[]) => void): IPublicTypeDisposable;

	/**
	 * 当前 document 的节点显隐状态变更事件
	 * @param fn
	 */
	onChangeNodeVisible(
		fn: (node: Node, visible: boolean) => void
	): IPublicTypeDisposable;

	/**
	 * 当前 document 的节点 children 变更事件
	 * @param fn
	 */
	onChangeNodeChildren(
		fn: (info: IPublicTypeOnChangeOptions<Node>) => void
	): IPublicTypeDisposable;

	/**
	 * 当前 document 节点属性修改事件
	 * @param fn
	 */
	onChangeNodeProp(
		fn: (info: IPublicTypePropChangeOptions<Node>) => void
	): IPublicTypeDisposable;

	/**
	 * import schema event
	 * @param fn
	 */
	onImportSchema(
		fn: (schema: IPublicTypeRootSchema) => void
	): IPublicTypeDisposable;

	/**
	 * 判断是否当前节点处于被探测状态
	 * @param node
	 */
	isDetectingNode(node: Node): boolean;

	/**
	 * 获取当前的 DropLocation 信息
	 */
	get dropLocation(): DropLocation | null;

	/**
	 * 设置当前的 DropLocation 信息
	 */
	set dropLocation(loc: DropLocation | null);

	/**
	 * 设置聚焦节点变化的回调
	 * @param fn
	 */
	onFocusNodeChanged(
		fn: (doc: IPublicModelDocumentModel, focusNode: Node) => void
	): IPublicTypeDisposable;

	/**
	 * 设置 DropLocation 变化的回调
	 * @param fn
	 */
	onDropLocationChanged(
		fn: (doc: IPublicModelDocumentModel) => void
	): IPublicTypeDisposable;
}
