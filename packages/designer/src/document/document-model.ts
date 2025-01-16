import {
	IPublicEnumTransformStage,
	IPublicModelDocumentModel,
	IPublicTypeComponentsMap,
	IPublicTypeDisposable,
	IPublicTypeDragNodeDataObject,
	IPublicTypeDragNodeObject,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypeOnChangeOptions,
	IPublicTypePageSchema,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import {
	isDomText,
	isDragNodeDataObject,
	isDragNodeObject,
	isJSExpression,
	isNode,
	isNodeSchema,
	isPlainObject,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import {
	createModuleEventBus,
	engineConfig,
	IEventBus,
	runWithGlobalEventOff,
	wrapWithEventSwitch,
} from '@arvin-shu/microcode-editor-core';
import { ref, shallowReactive, toRaw } from 'vue';
import { IProject } from '../project';
import { INode, insertChild, insertChildren, IRootNode, Node } from './node';
import { ISimulatorHost } from '../simulator';
import { IDesigner, IDropLocation } from '../designer';
import { EDITOR_EVENT } from '../types';
import { IComponentMeta } from '../component-meta';
import { ISelection, Selection } from './selection';

/**
 * 获取数据类型的工具类型
 * @template T - 输入类型参数
 * @template NodeType - 节点类型参数
 * @returns 如果 T 是 undefined,则:
 *          - 如果 NodeType 有 schema 属性,返回 schema 的类型
 *          - 否则返回 any
 *          如果 T 不是 undefined,则返回 T 本身
 */
export type GetDataType<T, NodeType> = T extends undefined
	? NodeType extends {
			schema: infer R;
		}
		? R
		: any
	: T;

export interface IDocumentModel
	extends Omit<
		IPublicModelDocumentModel<ISelection, INode, IDropLocation, IProject>,
		| 'detecting'
		| 'checkNesting'
		| 'getNodeById'
		// 以下属性在内部的 document 中不存在
		| 'exportSchema'
		| 'importSchema'
		| 'onAddNode'
		| 'onRemoveNode'
		| 'onChangeDetecting'
		| 'onChangeSelection'
		| 'onChangeNodeProp'
		| 'onImportSchema'
		| 'isDetectingNode'
		| 'onFocusNodeChanged'
		| 'onDropLocationChanged'
	> {
	readonly designer: IDesigner;

	selection: ISelection;

	get rootNode(): INode | null;

	get simulator(): ISimulatorHost | null;

	get active(): boolean;

	get nodesMap(): Map<string, INode>;

	/**
	 * 是否为非激活状态
	 */
	get suspensed(): boolean;

	get fileName(): string;

	get currentRoot(): INode | null;

	isBlank(): boolean;

	/**
	 * 根据 id 获取节点
	 */
	getNode(id: string): INode | null;

	getRoot(): INode | null;

	checkNesting(
		dropTarget: INode,
		dragObject:
			| IPublicTypeDragNodeObject
			| IPublicTypeNodeSchema
			| INode
			| IPublicTypeDragNodeDataObject
	): boolean;

	getNodeCount(): number;

	nextId(possibleId: string | undefined): string;

	import(schema: IPublicTypeRootSchema, checkId?: boolean): void;

	export(stage: IPublicEnumTransformStage): IPublicTypeRootSchema | undefined;

	onNodeCreate(func: (node: INode) => void): IPublicTypeDisposable;

	onNodeDestroy(func: (node: INode) => void): IPublicTypeDisposable;

	onChangeNodeVisible(
		fn: (node: INode, visible: boolean) => void
	): IPublicTypeDisposable;

	addWillPurge(node: INode): void;

	removeWillPurge(node: INode): void;

	getComponentMeta(componentName: string): IComponentMeta;

	insertNodes(
		parent: INode,
		thing: INode[] | IPublicTypeNodeData[],
		at?: number | null,
		copy?: boolean
	): INode[];

	open(): IDocumentModel;

	remove(): void;

	suspense(): void;

	close(): void;

	unlinkNode(node: INode): void;

	destroyNode(node: INode): void;
}

export class DocumentModel implements IDocumentModel {
	/**
	 * 根节点 类型有：Page/Component/Block
	 */
	rootNode: IRootNode | null;

	/**
	 * 文档编号
	 */
	id: string = uniqueId('doc');

	/**
	 * 选区控制
	 */
	readonly selection: ISelection = shallowReactive(new Selection(this));

	// TODO 操作记录控制

	// TODO 模态节点管理

	private _nodesMap = new Map<string, INode>();

	readonly project: IProject;

	readonly designer: IDesigner;

	private nodes = shallowReactive<Set<INode>>(new Set());

	private seqId = 0;

	private emitter: IEventBus;

	// TODO rootNodeVisitorMap

	// 模拟器
	get simulator(): ISimulatorHost | null {
		return this.project.simulator;
	}

	get nodesMap(): Map<string, INode> {
		return this._nodesMap;
	}

	get fileName(): string {
		return (
			this.rootNode?.getExtraProp('fileName', false)?.getAsString() || this.id
		);
	}

	set fileName(value: string) {
		this.rootNode?.getExtraProp('fileName', true)?.setValue(value);
	}

	get focusNode() {
		if (this._drillDownNode && this._drillDownNode.value) {
			return this._drillDownNode.value;
		}
		const selector = engineConfig.get('focusNodeSelector');
		if (selector && typeof selector === 'function') {
			return selector(this.rootNode!);
		}
		return this.rootNode;
	}

	// 聚焦节点
	private _drillDownNode = ref<INode | null>(null);

	// TODO _modalNode

	// 是否是空白文档
	private _blank?: boolean;

	// 是否初始化完成
	private inited = false;

	// 将要被删除的节点
	private willPurgeSpace = shallowReactive<INode[]>([]);

	// TODO modalNode

	get currentRoot() {
		// TODO 没有考虑modal的情况
		return this.focusNode;
	}

	private _dropLocation = ref<IDropLocation | null>(null);

	set dropLocation(loc: IDropLocation | null) {
		this._dropLocation.value = loc;
		this.designer.editor.eventBus.emit('document.dropLocation.changed', {
			document: this,
			location: loc,
		});
	}

	/**
	 * 投放插入位置标记
	 */
	get dropLocation(): IDropLocation | null {
		return this._dropLocation.value as any;
	}

	get schema() {
		return this.rootNode?.schema;
	}

	private _opened = ref(false);

	private _suspensed = ref(false);

	get suspended() {
		return this._suspensed.value || !this._opened.value;
	}

	/**
	 * 与 suspensed 相反，是否为激活状态，这个函数可能用的更多一点
	 */
	get active(): boolean {
		return !this._suspensed.value;
	}

	/**
	 * 是否打开
	 */
	get opened() {
		return this._opened.value;
	}

	get root() {
		return this.rootNode;
	}

	constructor(project: IProject, schema?: IPublicTypeRootSchema) {
		this.project = project;
		this.designer = project.designer;
		this.emitter = createModuleEventBus('DocumentModel');
		// 是否是空白文档
		if (!schema) {
			this._blank = true;
		}

		this.id = project.getSchema()?.id || this.id;

		// 创建根节点
		this.rootNode = this.createNode(
			schema || {
				componentName: 'Page',
				id: 'root',
				fileName: '',
			}
		);

		// TODO 历史记录的功能
		// TODO modal情况的处理
		// TODO Modal窗口管理

		// 初始化完成
		this.inited = true;
	}

	/**
	 * 聚焦节点
	 * @param node
	 */
	drillDown(node: INode | null) {
		this._drillDownNode.value = node;
	}

	/**
	 * 监听节点显示状态变化
	 *
	 * @param fn
	 * @returns
	 */
	onChangeNodeVisible(
		fn: (node: INode, visible: boolean) => void
	): IPublicTypeDisposable {
		this.designer.editor.eventBus.on(EDITOR_EVENT.NODE_VISIBLE_CHANGE, fn);
		return () => {
			this.designer.editor.eventBus.on(EDITOR_EVENT.NODE_VISIBLE_CHANGE, fn);
		};
	}

	/**
	 * 监听节点子节点变化
	 *
	 * @param fn 变化的父节点的实例的回调函数
	 * @returns
	 */
	onChangeNodeChildren(
		fn: (options: IPublicTypeOnChangeOptions<INode>) => void
	): IPublicTypeDisposable {
		this.designer.editor.eventBus.on(EDITOR_EVENT.NODE_CHILDREN_CHANGE, fn);
		return () => {
			this.designer.editor.eventBus.off(EDITOR_EVENT.NODE_CHILDREN_CHANGE, fn);
		};
	}

	/**
	 * 将节点标记为"将要删除"
	 *
	 * @param node
	 */
	addWillPurge(node: INode) {
		this.willPurgeSpace.push(node);
	}

	/**
	 * 当节点不再需要被标记为"将要删除"时，从跟踪数组中移除它
	 *
	 * @param node
	 */
	removeWillPurge(node: INode) {
		const index = this.willPurgeSpace.indexOf(node);
		if (index > -1) {
			this.willPurgeSpace.splice(index, 1);
		}
	}

	/**
	 * 是否是空白文档
	 * 不仅要求文档初始化时是空的，而且要求初始化之后也没有做过任何修改
	 * @returns
	 */
	isBlank() {
		return !!(this._blank && !this.isModified());
	}

	/**
	 * 生成node唯一id
	 * 生成规则:
	 * 1. 前缀固定为 'node_'
	 * 2. 取当前文档 id 的后 10 位
	 * 3. 将序列号 seqId 自增并转为 36 进制
	 * 4. 拼接文档 id 和序列号并转小写
	 *
	 * @param possibleId 可能的id
	 * @returns 生成的唯一id
	 */
	nextId(possibleId: string | undefined): string {
		let id = possibleId;
		while (!id || this.nodesMap.get(id)) {
			id = `node_${(String(this.id).slice(-10) + (++this.seqId).toString(36)).toLocaleLowerCase()}`;
		}
		return id;
	}

	/**
	 * 获取节点
	 *
	 * @param id
	 * @returns
	 */
	getNode(id: string): INode | null {
		return this.nodesMap.get(id) || null;
	}

	/**
	 * 获取节点数量
	 *
	 * @returns
	 */
	getNodeCount(): number {
		return this.nodesMap.size;
	}

	/**
	 * 是否包含某个节点
	 *
	 * @param id
	 * @returns
	 */
	hasNode(id: string): boolean {
		const node = this.getNode(id);
		return node ? !node.isPurged : false;
	}

	/**
	 * 监听节点挂载
	 *
	 * @param fn
	 * @returns
	 */
	onMountNode(fn: (payload: { node: INode }) => void) {
		this.designer.editor.eventBus.on('node.add', fn);
		return () => {
			this.designer.editor.eventBus.off('node.add', fn);
		};
	}

	/**
	 * 根据schema创建一个节点
	 *
	 * @param data
	 * @returns
	 */
	createNode<T = INode>(data: GetDataType<undefined, T>): T {
		let schema: any;
		// 如果传递进来的是一个文本或表达式，则创建一个Leaf节点来承载这段协议
		if (isDomText(data) || isJSExpression(data)) {
			schema = {
				componentName: 'Leaf',
				children: data,
			};
		} else {
			schema = data;
		}

		let node: INode | null = null;
		if (this.hasNode(schema.id)) {
			schema.id = null;
		}

		if (schema.id) {
			// 尝试获取已存在的同id节点
			node = this.getNode(schema.id);

			// 如果找到同id节点,且组件名称也相同
			if (node && node.componentName === schema.componentName) {
				// 如果该节点有父节点
				if (node.parent) {
					// 解除与父节点的关系
					node.internalSetParent(null, false);
					// 注释表明这个节点将被移动到新位置
					// TODO: this.activeNodes?.push(node);
				}
				// 用新的schema更新节点
				node.import(schema, true);
			}
			// 如果找到同id节点,但组件名称不同
			else if (node) {
				// 将node设为null,后续会创建新节点
				node = null;
			}
		}
		if (!node) {
			node = new Node(this as any, schema);
		}

		this._nodesMap.set(node.id, node);
		this.nodes.add(node);

		this.emitter.emit('nodecreate', node);
		return node as any;
	}

	destroyNode(node: INode) {
		this.emitter.emit('nodedestroy', node);
	}

	/**
	 * 插入一个节点
	 */
	insertNode(
		parent: INode,
		thing: INode | IPublicTypeNodeData,
		at?: number | null,
		copy?: boolean
	): INode | null {
		return insertChild(parent, thing, at, copy);
	}

	/**
	 * 插入多个节点
	 */
	insertNodes(
		parent: INode,
		thing: INode[] | IPublicTypeNodeData[],
		at?: number | null,
		copy?: boolean
	) {
		return insertChildren(parent, thing, at, copy);
	}

	/**
	 * 移除一个节点
	 */
	removeNode(idOrNode: string | INode) {
		let id: string;
		let node: INode | null = null;
		if (typeof idOrNode === 'string') {
			id = idOrNode;
			node = this.getNode(id);
		} else if (idOrNode.id) {
			id = idOrNode.id;
			node = this.getNode(id);
		}
		if (!node) {
			return;
		}
		this.internalRemoveAndPurgeNode(node, true);
	}

	/**
	 * 移除并销毁一个节点
	 *
	 * @param node 节点
	 * @param useMutator 用于追踪和记录操作历史的机制，使得操作可以被撤销(undo)和重做(redo)。
	 */
	internalRemoveAndPurgeNode(node: INode, useMutator = false) {
		// 检查节点是否存在于文档中
		if (!this.nodes.has(node)) {
			return;
		}
		// 调用节点的remove方法移除节点
		node.remove(useMutator);
	}

	unlinkNode(node: INode) {
		this.nodes.delete(node);
		this._nodesMap.delete(node.id);
	}

	/**
	 * 包裹当前选区中的节点
	 */
	wrapWith(schema: IPublicTypeNodeSchema): INode | null {
		const nodes = this.selection.getTopNodes();
		if (nodes.length < 1) {
			return null;
		}
		const wrapper = this.createNode(schema);
		if (wrapper.isParental()) {
			const first = nodes[0];
			// TODO: check nesting rules x 2
			insertChild(first.parent!, wrapper, first.index);
			insertChildren(wrapper, nodes);
			this.selection.select(wrapper.id);
			return wrapper;
		}

		this.removeNode(wrapper);
		return null;
	}

	/**
	 *  导入节点
	 *
	 * @param schema 节点schema
	 * @param checkId 是否检查id
	 * @returns
	 */
	import(schema: IPublicTypeNodeSchema, checkId = false) {
		const drillDownNodeId = this._drillDownNode.value?.id;
		runWithGlobalEventOff(() => {
			this.nodes.forEach((node) => {
				if (node.isRoot()) return;
				this.internalRemoveAndPurgeNode(node, true);
			});
			this.rootNode?.import(schema as any, checkId);
			// TODO model节点没有导入

			if (drillDownNodeId) {
				this.drillDown(this.getNode(drillDownNodeId));
			}
		});
	}

	export(stage: IPublicEnumTransformStage): IPublicTypeRootSchema {
		const currentSchema = this.rootNode?.export<IPublicTypeRootSchema>(stage);
		if (
			Array.isArray(currentSchema?.children) &&
			currentSchema?.children?.length &&
			currentSchema?.children?.length > 0
		) {
			const FixedTopNodeIndex = currentSchema?.children
				.filter((i) => isPlainObject(i))
				.findIndex((i) => (i as IPublicTypeNodeSchema).props?.__isTopFixed__);
			if (FixedTopNodeIndex > 0) {
				const FixedTopNode = currentSchema?.children.splice(
					FixedTopNodeIndex,
					1
				);
				currentSchema?.children.unshift(FixedTopNode[0]);
			}
		}
		return currentSchema!;
	}

	/**
	 * 导出节点数据
	 */
	getNodeSchema(id: string): IPublicTypeNodeData | null {
		const node = this.getNode(id);
		if (node) {
			return node.schema;
		}
		return null;
	}

	// isModified 是否已修改

	/**
	 *  TODO 是否有状态变更但未保存
	 */
	isModified(): boolean {
		// TODO   return this.history.isSavePoint();

		return true;
	}

	getComponent(componentName: string): any {
		return this.simulator!.getComponent(componentName);
	}

	getComponentMeta(componentName: string): IComponentMeta {
		return toRaw(this.designer).getComponentMeta(
			componentName,
			() =>
				toRaw(this.simulator)?.generateComponentMetadata(componentName) || null
		);
	}

	/**
	 * 切换激活，只有打开的才能激活
	 * 不激活，打开之后切换到另外一个时发生，比如 tab 视图，切换到另外一个标签页
	 */
	private setSuspense(flag: boolean) {
		if (!this._opened && !flag) {
			return;
		}
		this._suspensed.value = flag;
		this.simulator?.setSuspense(flag);
		if (!flag) {
			this.project.checkExclusive(this);
		}
	}

	suspense() {
		this.setSuspense(true);
	}

	activate() {
		this.setSuspense(false);
	}

	// @ts-ignore
	open(): DocumentModel {
		const originState = this._opened.value;
		this._opened.value = true;
		if (originState === false) {
			this.designer.postEvent('document-open', this);
		}
		if (this._suspensed.value) {
			this.setSuspense(false);
		} else {
			this.project.checkExclusive(this);
		}
		return this;
	}

	/**
	 * 关闭，相当于 sleep，仍然缓存，停止一切响应，如果有发生的变更没被保存，仍然需要去取数据保存
	 */
	close(): void {
		this.setSuspense(true);
		this._opened.value = false;
	}

	remove(): void {
		this.designer.postEvent('document.remove', { id: this.id });
		this.purge();
		this.project.removeDocument(this as any);
	}

	purge() {
		this.rootNode?.purge();
		this.nodes.clear();
		this.nodesMap.clear();
		this.rootNode = null;
	}

	/**
	 * 检查嵌套规则
	 */
	checkNesting(
		dropTarget: INode,
		dragObject:
			| IPublicTypeDragNodeDataObject
			| IPublicTypeNodeSchema
			| INode
			| IPublicTypeDragNodeDataObject
	): boolean {
		let items: Array<INode | IPublicTypeNodeSchema>;
		if (isDragNodeDataObject(dragObject)) {
			items = Array.isArray(dragObject.data)
				? dragObject.data
				: [dragObject.data];
		} else if (isDragNodeObject<INode>(dragObject)) {
			items = dragObject.nodes;
		} else if (isNode<INode>(dragObject) || isNodeSchema(dragObject)) {
			items = [dragObject];
		} else {
			// eslint-disable-next-line no-console
			console.warn(
				'the dragObject is not in the correct type, dragObject:',
				dragObject
			);
			return true;
		}
		return items.every(
			(item) =>
				this.checkNestingDown(dropTarget, item) &&
				this.checkNestingUp(dropTarget, item)
		);
	}

	/**
	 * 检查对象对父级的要求，涉及配置 parentWhitelist
	 */
	checkNestingUp(parent: INode, obj: IPublicTypeNodeSchema | INode): boolean {
		if (isNode(obj) || isNodeSchema(obj)) {
			const config = isNode(obj)
				? obj.componentMeta
				: this.getComponentMeta(obj.componentName);
			if (config) {
				return config.checkNestingUp(obj, parent);
			}
		}

		return true;
	}

	/**
	 * 检查投放位置对子级的要求，涉及配置 childWhitelist
	 */
	checkNestingDown(parent: INode, obj: IPublicTypeNodeSchema | INode): boolean {
		const config = parent.componentMeta;
		return config.checkNestingDown(parent, obj);
	}

	getRoot() {
		return this.rootNode;
	}

	toData(extraComps?: string[]) {
		const node = this.export(IPublicEnumTransformStage.Save);
		const data = {
			componentsMap: this.getComponentsMap(extraComps),
			utils: this.getUtilsMap(),
			componentsTree: [node],
		};
		return data;
	}

	// TODO getHistory
	// TODO acceptRootNodeVisitor
	// TODO getRootNodeVisitor

	getComponentsMap(extraComps?: string[]) {
		const componentsMap: IPublicTypeComponentsMap = [];
		// 组件去重
		const exsitingMap: { [componentName: string]: boolean } = {};
		for (const node of this._nodesMap.values()) {
			const { componentName } = node || {};
			if (componentName === 'Slot') continue;
			if (!exsitingMap[componentName]) {
				exsitingMap[componentName] = true;
				if (node.componentMeta?.npm?.package) {
					componentsMap.push({
						...node.componentMeta.npm,
						componentName,
					});
				} else {
					componentsMap.push({
						devMode: 'microCode',
						componentName,
					});
				}
			}
		}
		// 合并外界传入的自定义渲染的组件
		if (Array.isArray(extraComps)) {
			extraComps.forEach((componentName) => {
				if (componentName && !exsitingMap[componentName]) {
					const meta = this.getComponentMeta(componentName);
					if (meta?.npm?.package) {
						componentsMap.push({
							...meta?.npm,
							componentName,
						});
					} else {
						componentsMap.push({
							devMode: 'microCode',
							componentName,
						});
					}
				}
			});
		}
		return componentsMap;
	}

	/**
	 * 获取 schema 中的 utils 节点，当前版本不判断页面中使用了哪些 utils，直接返回资产包中所有的 utils
	 * @returns
	 */
	getUtilsMap() {
		return this.designer?.editor?.get('assets')?.utils?.map((item: any) => ({
			name: item.name,
			type: item.type || 'npm',
			// TODO 当前只有 npm 类型，content 直接设置为 item.npm，有 function 类型之后需要处理
			content: item.npm,
		}));
	}

	onNodeCreate(func: (node: INode) => void) {
		const wrappedFunc = wrapWithEventSwitch(func);
		this.emitter.on('nodecreate', wrappedFunc);
		return () => {
			this.emitter.removeListener('nodecreate', wrappedFunc);
		};
	}

	onNodeDestroy(func: (node: INode) => void) {
		const wrappedFunc = wrapWithEventSwitch(func);
		this.emitter.on('nodedestroy', wrappedFunc);
		return () => {
			this.emitter.removeListener('nodedestroy', wrappedFunc);
		};
	}

	onReady(fn: (...args: any[]) => void) {
		this.designer.editor.eventBus.on('document-open', fn);
		return () => {
			this.designer.editor.eventBus.off('document-open', fn);
		};
	}
}

export function isDocumentModel(obj: any): obj is IDocumentModel {
	return obj && obj.rootNode;
}

export function isPageSchema(obj: any): obj is IPublicTypePageSchema {
	return obj?.componentName === 'Page';
}
