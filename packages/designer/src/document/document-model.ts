import {
	IPublicEnumTransformStage,
	IPublicModelDocumentModel,
	IPublicTypeComponentsMap,
	IPublicTypeDisposable,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypeOnChangeOptions,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import {
	isDomText,
	isJSExpression,
	isPlainObject,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import {
	createModuleEventBus,
	engineConfig,
	IEventBus,
	runWithGlobalEventOff,
} from '@arvin-shu/microcode-editor-core';
import { ref, shallowReactive } from 'vue';
import { IProject } from '../project';
import { INode, insertChild, insertChildren, IRootNode, Node } from './node';
import { ISimulatorHost } from '../simulator';
import { IDesigner } from '../designer';
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
	extends Omit<IPublicModelDocumentModel<INode>, ''> {
	readonly designer: IDesigner;

	get simulator(): ISimulatorHost | null;

	get nodesMap(): Map<string, INode>;

	get rootNode(): INode | null;

	get active(): boolean;

	get currentRoot(): INode | null;

	isBlank(): boolean;

	nextId(possibleId: string | undefined): string;

	import(schema: IPublicTypeRootSchema, checkId?: boolean): void;

	getComponentMeta(componentName: string): IComponentMeta;

	insertNodes(
		parent: INode,
		thing: INode[] | IPublicTypeNodeData[],
		at?: number | null,
		copy?: boolean
	): INode[];

	open(): IDocumentModel;
	unlinkNode(node: INode): void;
	destroyNode(node: INode): void;
	addWillPurge(node: INode): void;
	remove(): void;
	suspense(): void;
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

	private _nodesMap = new Map<string, INode>();

	readonly project: IProject;

	readonly designer: IDesigner;

	private nodes = shallowReactive<Set<INode>>(new Set());

	private seqId = 0;

	private emitter: IEventBus;

	// 模拟器
	get simulator(): ISimulatorHost | null {
		return this.project.simulator;
	}

	/**
	 * 选区控制
	 */
	readonly selection: ISelection = new Selection(this);

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
		if (this._drillDownNode.value) {
			return this._drillDownNode.value;
		}
		const selector = engineConfig.get('focusSelector');
		if (selector && typeof selector === 'function') {
			return selector(this.rootNode!);
		}
		return this.rootNode;
	}

	// 聚焦节点
	private _drillDownNode = ref<INode | null>(null);

	// 是否是空白文档
	private _blank?: boolean;

	// 是否初始化完成
	private inited = false;

	// 将要被删除的节点
	private willPurgeSpace = shallowReactive<INode[]>([]);

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

	get currentRoot() {
		// TODO 没有考虑modal的情况
		return this.focusNode;
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
					// todo: this.activeNodes?.push(node);
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
			node = new Node(this, schema);
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
	 * TODO 导入节点
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

	open() {
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

	/**
	 * TODO 包裹当前选中的节点，后期可以做组合操作
	 * @param schema
	 * @returns
	 */
	wrapWith(schema: IPublicTypeNodeSchema): INode | null {
		schema;
		return null;
	}

	remove(): void {
		this.designer.postEvent('document.remove', { id: this.id });
		this.purge();
		this.project.removeDocument(this);
	}

	purge() {
		this.rootNode?.purge();
		this.nodes.clear();
		this.nodesMap.clear();
		this.rootNode = null;
	}

	/**
	 * 是否有状态变更但未保存
	 */
	isModified(): boolean {
		return true;
	}

	getComponentsMap(extraComps?: string[]): any {
		const componentsMap: IPublicTypeComponentsMap = [];
		extraComps;
		return componentsMap;
	}

	getComponentMeta(componentName: string): IComponentMeta {
		return this.designer.getComponentMeta(
			componentName,
			() => this.simulator?.generateComponentMetadata(componentName) || null
		);
	}
}
