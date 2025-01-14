import {
	GlobalEvent,
	IBaseModelNode,
	IPublicEnumTransformStage,
	IPublicModelExclusiveGroup,
	IPublicModelNode,
	IPublicTypeComponentAction,
	IPublicTypeComponentSchema,
	IPublicTypeCompositeValue,
	IPublicTypeDisposable,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypePageSchema,
	IPublicTypePropsList,
	IPublicTypePropsMap,
	IPublicTypeSlotSchema,
} from '@arvin-shu/microcode-types';
import {
	isDomText,
	isJSExpression,
	isNode,
	isNodeSchema,
} from '@arvin-shu/microcode-utils';
import {
	createModuleEventBus,
	IEventBus,
	wrapWithEventSwitch,
} from '@arvin-shu/microcode-editor-core';
import { computed, nextTick, ref, Ref, shallowReactive, toRaw } from 'vue';
import { IComponentMeta } from '../../component-meta';
import { IDocumentModel } from '../document-model';
import { getConvertedExtraKey, IProps, Props } from './props/props';
import { INodeChildren, NodeChildren } from './node-children';
import { IProp, Prop } from './props/prop';
import { EDITOR_EVENT, NodeRemoveOptions } from '../../types';
import { includeSlot, removeSlot, foreachReverse } from '../../utils';
import {
	ExclusiveGroup,
	IExclusiveGroup,
	isExclusiveGroup,
} from './exclusive-group';
import { ISettingTopEntry } from '../../designer';

export function isRootNode(node: INode): node is IRootNode {
	return node && node.isRootNode;
}

export interface IBaseNode<
	Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema,
> extends Omit<
		IBaseModelNode<
			IDocumentModel,
			IBaseNode,
			INodeChildren,
			IComponentMeta,
			IProps,
			IProp,
			IExclusiveGroup
		>,
		| 'isRoot'
		| 'isPage'
		| 'isComponent'
		| 'isModal'
		| 'isSlot'
		| 'isParental'
		| 'isLeaf'
		| 'settingEntry'
		// 在内部的 node 模型中不存在
		| 'getExtraPropValue'
		| 'setExtraPropValue'
		| 'exportSchema'
		| 'visible'
		| 'importSchema'
		// 内外实现有差异
		| 'isContainer'
		| 'isEmpty'
	> {
	isNode: boolean;

	get componentMeta(): IComponentMeta;

	// TODO   get settingEntry(): ISettingTopEntry;

	get isPurged(): boolean;

	get index(): number | undefined;

	get isPurging(): boolean;

	getId(): string;

	getParent(): INode | null;

	/**
	 * 内部方法，请勿使用
	 * @param useMutator 是否触发联动逻辑
	 */
	internalSetParent(parent: INode | null, useMutator?: boolean): void;

	setConditionGroup(grp: IPublicModelExclusiveGroup | string | null): void;

	internalToShellNode(): IPublicModelNode | null;

	internalPurgeStart(): void;

	unlinkSlot(slotNode: INode): void;

	/**
	 * 导出 schema
	 */
	export<T = Schema>(stage: IPublicEnumTransformStage, options?: any): T;

	emitPropChange(val: IPublicTypePropChangeOptions): void;

	import(data: Schema, checkId?: boolean): void;

	internalSetSlotFor(slotFor: Prop | null | undefined): void;

	addSlot(slotNode: INode): void;

	onVisibleChange(func: (flag: boolean) => any): () => void;

	onChildrenChange(
		fn: (param?: { type: string; node: INode }) => void
	): IPublicTypeDisposable | undefined;

	onPropChange(
		func: (info: IPublicTypePropChangeOptions) => void
	): IPublicTypeDisposable;

	isModal(): boolean;

	isRoot(): boolean;

	isPage(): boolean;

	isComponent(): boolean;

	isSlot(): boolean;

	isParental(): boolean;

	isLeaf(): boolean;

	isContainer(): boolean;

	isEmpty(): boolean;

	remove(
		useMutator?: boolean,
		purge?: boolean,
		options?: NodeRemoveOptions
	): void;

	didDropIn(dragment: INode): void;

	didDropOut(dragment: INode): void;

	purge(): void;

	removeSlot(slotNode: INode): boolean;

	setVisible(flag: boolean): void;

	getVisible(): boolean;

	getChildren(): INodeChildren | null;

	clearPropValue(path: string | number): void;

	setProps(
		props?: IPublicTypePropsMap | IPublicTypePropsList | Props | null
	): void;

	mergeProps(props: IPublicTypePropsMap): void;

	/** 是否可以选中 */
	canSelect(): boolean;
}

export class Node<Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema>
	implements IBaseNode
{
	private emitter: IEventBus;

	/**
	 * 是节点实例
	 */
	readonly isNode = true;

	/**
	 * 节点 id
	 */
	readonly id: string;

	/**
	 * 节点组件类型
	 * 特殊节点：
	 *  * Page 页面
	 *  * Block 区块
	 *  * Component 组件/元件
	 *  * Leaf 文字节点 | 表达式节点，无 props，无指令？
	 *  * Slot 插槽节点，无 props，正常 children，有 slotArgs，有指令
	 */
	readonly componentName: string;

	/**
	 * 节点的属性实例
	 */
	props: IProps;

	protected _children?: INodeChildren;

	/**
	 * 节点的父节点
	 */
	private _parent: Ref<INode | null> = ref(null);

	get parent() {
		const self = toRaw(this);
		return self._parent.value;
	}

	/**
	/**
	 * 当前节点子集
	 */
	get children(): INodeChildren | null {
		return this._children || null;
	}

	private readonly computedZLevel = computed(() => {
		if (this._parent.value) {
			return toRaw(this._parent.value).zLevel + 1;
		}
		return 0;
	});

	get zLevel() {
		return this.computedZLevel.value;
	}

	private readonly computedTitle = computed(() => {
		const t = this.getExtraProp('title');
		if (t) {
			const v = t.getAsString();
			if (v) {
				return v;
			}
		}
		return this.componentMeta.title;
	});

	get title() {
		return this.computedTitle.value;
	}

	get icon() {
		return this.componentMeta.icon;
	}

	isInited = false;

	_settingEntry: ISettingTopEntry;

	get settingEntry(): ISettingTopEntry {
		if (this._settingEntry) return this._settingEntry;
		this._settingEntry = this.document.designer.createSettingEntry([
			this as any,
		]);
		return this._settingEntry;
	}

	private _isRGLContainer = false;

	set isRGLContainer(status: boolean) {
		this._isRGLContainer = status;
	}

	get isRGLContainer(): boolean {
		return !!this._isRGLContainer;
	}

	set isRGLContainerNode(status: boolean) {
		this._isRGLContainer = status;
	}

	get isRGLContainerNode(): boolean {
		return !!this._isRGLContainer;
	}

	get isEmptyNode() {
		return this.isEmpty();
	}

	private _slotFor?: IProp | null | undefined = null;

	_slots = shallowReactive<INode[]>([]);

	get slots() {
		return this._slots;
	}

	private _conditionGroup = ref<IExclusiveGroup | null>(null);

	get conditionGroup() {
		return this._conditionGroup.value as any;
	}

	private purged = false;

	/**
	 * 是否已销毁
	 */
	get isPurged() {
		return this.purged;
	}

	/**
	 * 是否正在销毁
	 */
	get isPurging() {
		return this.purging;
	}

	private purging: boolean = false;

	constructor(
		readonly document: IDocumentModel,
		nodeSchema: Schema
	) {
		const { id, componentName, children, props, ...extras } = nodeSchema;
		this.id = document.nextId(id);
		this.componentName = componentName;

		if (this.componentName === 'Leaf') {
			this.props = new Props(this as any, {
				children:
					isDomText(children) || isJSExpression(children) ? children : '',
			});
		} else {
			this.props = new Props(this as any, props, extras);
			this._children = new NodeChildren(
				this as any,
				this.initialChildren(children)
			);
			this._children.internalInitParent();
			this.props.merge(
				this.upgradeProps(this.initProps(props || {})),
				this.upgradeProps(extras)
			);
		}

		this.initBuiltinProps();

		this.isInited = true;
		this.emitter = createModuleEventBus('Node');
		const { editor } = this.document.designer;
		this.onVisibleChange((visible: boolean) => {
			editor?.eventBus.emit(EDITOR_EVENT.NODE_VISIBLE_CHANGE, this, visible);
		});
		this.onChildrenChange((info?: { type: string; node: INode }) => {
			editor?.eventBus.emit(EDITOR_EVENT.NODE_CHILDREN_CHANGE, {
				type: info?.type,
				node: this,
			});
		});
	}

	/**
	 * 节点初始化期间就把内置的一些 prop 初始化好，避免后续不断构造实例导致 reaction 执行多次
	 */
	private initBuiltinProps() {
		this.props.has(getConvertedExtraKey('hidden')) ||
			this.props.add(false, getConvertedExtraKey('hidden'));
		this.props.has(getConvertedExtraKey('title')) ||
			this.props.add('', getConvertedExtraKey('title'));
		this.props.has(getConvertedExtraKey('isLocked')) ||
			this.props.add(false, getConvertedExtraKey('isLocked'));
		this.props.has(getConvertedExtraKey('condition')) ||
			this.props.add(true, getConvertedExtraKey('condition'));
		this.props.has(getConvertedExtraKey('conditionGroup')) ||
			this.props.add('', getConvertedExtraKey('conditionGroup'));
		this.props.has(getConvertedExtraKey('loop')) ||
			this.props.add(undefined, getConvertedExtraKey('loop'));
	}

	private initProps(props: any) {
		return this.document.designer.transformProps(
			props,
			this,
			IPublicEnumTransformStage.Init
		);
	}

	private upgradeProps(props: any): any {
		return this.document.designer.transformProps(
			props,
			this,
			IPublicEnumTransformStage.Upgrade
		);
	}

	/**
	 * 创建节点的时候默认带入的子节点
	 *
	 * @param children
	 * @returns
	 */
	private initialChildren(
		children: IPublicTypeNodeData | IPublicTypeNodeData[] | undefined
	): IPublicTypeNodeData[] {
		const { initialChildren } = this.componentMeta.advanced;
		if (children == null) {
			if (initialChildren) {
				if (typeof initialChildren === 'function') {
					return initialChildren(this.internalToShellNode()!) || [];
				}
				return initialChildren;
			}
			return [];
		}
		if (Array.isArray(children)) {
			return children;
		}
		return [children];
	}

	isContainer(): boolean {
		return this.isContainerNode;
	}

	get isContainerNode(): boolean {
		return this.isParentalNode && this.componentMeta.isContainer;
	}

	isModal(): boolean {
		return this.isModalNode;
	}

	get isModalNode(): boolean {
		return this.componentMeta.isModal;
	}

	isRoot(): boolean {
		return this.isRootNode;
	}

	get isRootNode(): boolean {
		return this.document.rootNode === (this as any);
	}

	isPage(): boolean {
		return this.isPageNode;
	}

	get isPageNode(): boolean {
		return this.isRootNode && this.componentName === 'Page';
	}

	isComponent(): boolean {
		return this.isComponentNode;
	}

	get isComponentNode(): boolean {
		return this.isRootNode && this.componentName === 'Component';
	}

	isSlot(): boolean {
		return this.isSlotNode;
	}

	get isSlotNode(): boolean {
		return this._slotFor != null && this.componentName === 'Slot';
	}

	/**
	 * 是否一个父亲类节点
	 */
	isParental(): boolean {
		return this.isParentalNode;
	}

	get isParentalNode(): boolean {
		return !this.isLeafNode;
	}

	/**
	 * 终端节点，内容一般为 文字 或者 表达式
	 */
	isLeaf(): boolean {
		return this.isLeafNode;
	}

	get isLeafNode(): boolean {
		return this.componentName === 'Leaf';
	}

	/**
	 * 设置节点将要被销毁
	 */
	internalSetWillPurge() {
		// 解除父子关系
		this.internalSetParent(null);
		this.document.addWillPurge(this as any);
	}

	didDropIn(dragment: INode) {
		const self = toRaw(this);
		const { callbacks } = self.componentMeta.advanced;
		if (callbacks?.onNodeAdd) {
			const cbThis = self.internalToShellNode();
			callbacks?.onNodeAdd.call(cbThis, dragment.internalToShellNode(), cbThis);
		}
		if (self._parent.value) {
			self._parent.value.didDropIn(dragment);
		}
	}

	didDropOut(dragment: INode) {
		const { callbacks } = this.componentMeta.advanced;
		if (callbacks?.onNodeRemove) {
			const cbThis = this.internalToShellNode();
			callbacks?.onNodeRemove.call(
				cbThis,
				dragment.internalToShellNode(),
				cbThis
			);
		}
		if (this._parent.value) {
			this._parent.value.didDropOut(dragment);
		}
	}

	internalSetParent(parent: INode | null, useMutator?: boolean): void {
		if (this._parent.value === parent) {
			return;
		}

		if (this._parent.value) {
			if (this.isSlot()) {
				this._parent.value.unlinkSlot(this as any);
			} else {
				this._parent.value.children?.unlinkChild(this as any);
			}
		}
		if (useMutator) {
			this._parent.value?.didDropOut(this as any);
		}
		if (parent) {
			// 建立新的父子关系，尤其注意：对于 parent 为 null 的场景，不会赋值，因为 subtreeModified 等事件可能需要知道该 node 被删除前的父子关系
			this._parent.value = parent;
			this.document.removeWillPurge(this as any);

			if (!this.conditionGroup) {
				// initial conditionGroup
				const grp = this.getExtraProp('conditionGroup', false)?.getAsString();
				if (grp) {
					this.setConditionGroup(grp);
				}
			}

			if (useMutator) {
				parent.didDropIn(this as any);
			}
		}
	}

	internalSetSlotFor(slotFor: Prop | null | undefined) {
		this._slotFor = slotFor;
	}

	/**
	 * 根据node数据创建一个外壳实例节点
	 */
	internalToShellNode(): IPublicModelNode | null {
		return this.document.designer.shellModelFactory.createNode(this);
	}

	/**
	 * 关联属性
	 */
	get slotFor(): IProp | null | undefined {
		return this._slotFor;
	}

	remove(
		useMutator = true,
		purge = true,
		options: NodeRemoveOptions = { suppressRemoveEvent: false }
	) {
		if (this.parent) {
			if (!options.suppressRemoveEvent) {
				this.document.designer.editor?.eventBus.emit('node.remove.topLevel', {
					node: this,
					index: this.parent?.children?.indexOf(this as any),
				});
			}
			if (this.isSlot()) {
				this.parent.removeSlot(this as any);
				this.parent.children?.internalDelete(this as any, purge, useMutator, {
					suppressRemoveEvent: true,
				});
			} else {
				this.parent.children?.internalDelete(this as any, purge, useMutator, {
					suppressRemoveEvent: true,
				});
			}
		}
	}

	/**
	 * 锁住当前节点
	 */
	lock(flag = true) {
		this.setExtraProp('isLocked', flag);
	}

	/**
	 * 获取当前节点的锁定状态
	 */
	get isLocked(): boolean {
		return !!this.getExtraProp('isLocked')?.getValue();
	}

	/**
	 * 判断当前节点是否可被选中
	 */
	canSelect(): boolean {
		const onSelectHook = this.componentMeta?.advanced?.callbacks?.onSelectHook;
		const canSelect =
			typeof onSelectHook === 'function'
				? onSelectHook(this.internalToShellNode()!)
				: true;
		return canSelect;
	}

	/**
	 * 选择当前节点
	 */
	select() {
		this.document.selection.select(this.id);
	}

	/**
	 * 悬停高亮
	 */
	hover(flag = true) {
		if (flag) {
			this.document.designer.detecting.capture(this as any);
		} else {
			this.document.designer.detecting.release(this as any);
		}
	}

	private readonly computedComponentMeta = computed(() =>
		this.document.getComponentMeta(this.componentName)
	);

	get componentMeta() {
		return this.computedComponentMeta.value;
	}

	private readonly computedPropsData = computed(() => {
		if (!this.isParental() || this.componentName === 'Fragment') {
			return null;
		}
		return this.props.export(IPublicEnumTransformStage.Serilize).props || null;
	});

	get propsData() {
		return this.computedPropsData.value;
	}

	hasSlots() {
		return this._slots.length > 0;
	}

	setConditionGroup(grp: IPublicModelExclusiveGroup | string | null) {
		let _grp: IExclusiveGroup | null = null;
		if (!grp) {
			this.getExtraProp('conditionGroup', false)?.remove();
			if (this._conditionGroup.value) {
				this._conditionGroup.value.remove(this as any);
				this._conditionGroup.value = null;
			}
			return;
		}
		if (!isExclusiveGroup(grp)) {
			if (this.prevSibling?.conditionGroup?.name === grp) {
				_grp = this.prevSibling.conditionGroup;
			} else if (this.nextSibling?.conditionGroup?.name === grp) {
				_grp = this.nextSibling.conditionGroup;
			} else if (typeof grp === 'string') {
				_grp = new ExclusiveGroup(grp);
			}
		}
		if (_grp && (this._conditionGroup.value as any) !== _grp) {
			this.getExtraProp('conditionGroup', true)?.setValue(_grp.name);
			if (this._conditionGroup.value) {
				this._conditionGroup.value.remove(this as any);
			}
			this._conditionGroup.value = _grp;
			_grp?.add(this as any);
		}
	}

	/* istanbul ignore next */
	isConditionalVisible(): boolean | undefined {
		return this._conditionGroup.value?.isVisible(this as any);
	}

	/* istanbul ignore next */
	setConditionalVisible() {
		this._conditionGroup.value?.setVisible(this as any);
	}

	hasCondition() {
		const v = this.getExtraProp('condition', false)?.getValue();
		return v != null && v !== '' && v !== true;
	}

	/**
	 * 当满足以下条件之一时存在循环:
	 * 1. loop 是有效数组且长度大于 1
	 * 2. loop 是变量对象
	 * @return boolean, 是否存在循环配置
	 */
	hasLoop() {
		const value = this.getExtraProp('loop', false)?.getValue();
		if (value === undefined || value === null) {
			return false;
		}

		if (Array.isArray(value)) {
			return true;
		}
		if (isJSExpression(value)) {
			return true;
		}
		return false;
	}

	wrapWith(schema: Schema) {
		const wrappedNode = this.replaceWith({
			...schema,
			children: [this.export()],
		});
		return wrappedNode.children!.get(0);
	}

	replaceWith(schema: Schema, migrate = false): any {
		// reuse the same id? or replaceSelection
		schema = { ...(migrate ? this.export() : {}), ...schema };
		return this.parent?.replaceChild(this, schema);
	}

	/**
	 * 替换子节点
	 *
	 * @param {INode} node
	 * @param {object} data
	 */
	replaceChild(node: INode, data: any): INode | null {
		if (this.children?.has(node)) {
			const selected = this.document.selection.has(node.id);

			delete data.id;
			const newNode = this.document.createNode(data);

			if (!isNode(newNode)) {
				return null;
			}

			this.insertBefore(newNode, node, false);
			node.remove(false);

			if (selected) {
				this.document.selection.select(newNode.id);
			}
			return newNode;
		}
		return node;
	}

	setVisible(flag: boolean): void {
		this.getExtraProp('hidden')?.setValue(!flag);
		this.emitter.emit('visibleChange', flag);
	}

	getVisible(): boolean {
		return !this.getExtraProp('hidden')?.getValue();
	}

	onVisibleChange(func: (flag: boolean) => any): () => void {
		const wrappedFunc = wrapWithEventSwitch(func);
		this.emitter.on('visibleChange', wrappedFunc);
		return () => {
			this.emitter.removeListener('visibleChange', wrappedFunc);
		};
	}

	getProp(path: string, createIfNone = true): IProp | null {
		return this.props.query(path, createIfNone) || null;
	}

	getExtraProp(key: string, createIfNone = true): IProp | null {
		return (
			toRaw(this.props).get(getConvertedExtraKey(key), createIfNone) || null
		);
	}

	setExtraProp(key: string, value: IPublicTypeCompositeValue) {
		this.getProp(getConvertedExtraKey(key), true)?.setValue(value);
	}

	/**
	 * 获取单个属性值
	 */
	getPropValue(path: string): any {
		return this.getProp(path, false)?.value;
	}

	/**
	 * 设置单个属性值
	 */
	setPropValue(path: string, value: any) {
		this.getProp(path, true)!.setValue(value);
	}

	/**
	 * 清除已设置的值
	 */
	clearPropValue(path: string): void {
		this.getProp(path, false)?.unset();
	}

	/**
	 * 设置多个属性值，和原有值合并
	 */
	mergeProps(props: IPublicTypePropsMap) {
		this.props.merge(props);
	}

	/**
	 * 设置多个属性值，替换原有值
	 */
	setProps(props?: IPublicTypePropsMap | IPublicTypePropsList | Props | null) {
		if (props instanceof Props) {
			this.props = props;
			return;
		}
		this.props.import(props);
	}

	private readonly computedIndex = computed(() => {
		if (!this.parent) {
			return -1;
		}
		return this.parent.children?.indexOf(this as any);
	});

	/**
	 * 获取节点在父容器中的索引
	 */
	get index() {
		return this.computedIndex.value;
	}

	/**
	 * 获取下一个兄弟节点
	 */
	get nextSibling(): INode | null | undefined {
		if (!this.parent) {
			return null;
		}
		const { index } = this;
		if (typeof index !== 'number') {
			return null;
		}
		if (index < 0) {
			return null;
		}
		return this.parent.children?.get(index + 1);
	}

	/**
	 * 获取上一个兄弟节点
	 */
	get prevSibling(): INode | null | undefined {
		if (!this.parent) {
			return null;
		}
		const { index } = this;
		if (typeof index !== 'number') {
			return null;
		}
		if (index < 1) {
			return null;
		}
		return this.parent.children?.get(index - 1);
	}

	/**
	 * 获取符合搭建协议-节点 schema 结构
	 */
	get schema(): Schema {
		return this.export(IPublicEnumTransformStage.Save);
	}

	set schema(schema: Schema) {
		nextTick(() => {
			this.import(schema);
		});
	}

	import(data: Schema, checkId = false) {
		const { children, props, ...extras } = data;
		if (this.isSlot()) {
			foreachReverse(
				this.children as any,
				(subNode: INode) => {
					subNode.remove(true, true);
				},
				(iterable, idx) => (iterable as INodeChildren).get(idx)
			);
		}
		if (this.isParental()) {
			this.props.import(props, extras);
			this._children?.import(children, checkId);
		} else {
			toRaw(this.props)
				.get('children', true)!
				.setValue(
					isDomText(children) || isJSExpression(children) ? children : ''
				);
		}
	}

	toData() {
		return this.export();
	}

	export<T = IPublicTypeNodeSchema>(
		stage: IPublicEnumTransformStage = IPublicEnumTransformStage.Save,
		options: any = {}
	): T {
		options;
		const baseSchema: any = {
			componentName: this.componentName,
		};
		// 在克隆阶段不设置id,因为克隆出来的节点需要生成新的id,避免id重复
		if (stage !== IPublicEnumTransformStage.Clone) {
			baseSchema.id = this.id;
		}
		// 在渲染阶段需要设置docId,用于标识节点所属的文档,方便后续操作
		if (stage === IPublicEnumTransformStage.Render) {
			baseSchema.docId = this.document.id;
		}

		if (this.isLeaf()) {
			// 在导出阶段不导出children,除非指定bypassChildren
			if (!options.bypassChildren) {
				baseSchema.children = toRaw(this.props).get('children')?.export(stage);
			}
			return baseSchema;
		}

		const { props = {}, extras } = this.props.export(stage) || {};
		const _extras_: { [key: string]: any } = {
			...extras,
		};

		const schema = {
			...baseSchema,
			props: this.document.designer.transformProps(props as any, this, stage),
			...this.document.designer.transformProps(_extras_, this, stage),
		};
		// 如果节点是父节点,并且有子节点,并且子节点数量大于0,并且没有指定bypassChildren,则导出子节点
		if (
			this.isParental() &&
			this.children &&
			this.children.size > 0 &&
			!options.bypassChildren
		) {
			schema.children = this.children.export(stage);
		}
		return schema;
	}

	/**
	 * 判断是否包含特定节点
	 */
	contains(node: INode): boolean {
		return contains(this as any, node);
	}

	/**
	 * 获取特定深度的父亲节点
	 */
	getZLevelTop(zLevel: number): INode | null {
		return getZLevelTop(this as any, zLevel);
	}

	/**
	 * 判断与其它节点的位置关系
	 *
	 *  16 当前节点包含其它节点
	 *  8  当前节点被其它节点包含
	 *  2  当前节点在其它节点前面或后面
	 *  0  当前节点与其它节点相同
	 */
	comparePosition(otherNode: INode): PositionNO {
		return comparePosition(this as any, otherNode);
	}

	unlinkSlot(slotNode: INode) {
		const i = this._slots.indexOf(slotNode);
		if (i < 0) {
			return false;
		}
		this._slots.splice(i, 1);
	}

	removeSlot(slotNode: INode): boolean {
		const i = this._slots.indexOf(slotNode);
		if (i < 0) {
			return false;
		}
		this._slots.splice(i, 1);
		return false;
	}

	addSlot(slotNode: INode) {
		const slotName = slotNode?.getExtraProp('name')?.getAsString();
		// 一个组件下的所有 slot，相同 slotName 的 slot 应该是唯一的
		if (includeSlot(this, slotName)) {
			removeSlot(this, slotName);
		}
		slotNode.internalSetParent(this as any, true);
		this._slots.push(slotNode);
	}

	/**
	 * 当前node对应组件是否已注册可用
	 */
	isValidComponent() {
		const allComponents = this.document?.designer?.componentsMap;
		if (allComponents && allComponents[this.componentName]) {
			return true;
		}
		return false;
	}

	/**
	 * 删除一个节点
	 * @param node
	 */
	removeChild(node: INode) {
		this.children?.delete(node);
	}

	purge(): void {
		if (this.purged) {
			return;
		}
		this.purged = true;
		this.props.purge();
		// TODO settingEntry未注销
	}

	internalPurgeStart() {
		this.purging = true;
	}

	/**
	 * 是否可执行某 action
	 */
	canPerformAction(actionName: string): boolean {
		const availableActions =
			this.componentMeta?.availableActions
				?.filter((action: IPublicTypeComponentAction) => {
					const { condition } = action;
					return typeof condition === 'function'
						? condition(this) !== false
						: condition !== false;
				})
				.map((action: IPublicTypeComponentAction) => action.name) || [];

		return availableActions.indexOf(actionName) >= 0;
	}

	isEmpty(): boolean {
		return this.children ? this.children.isEmpty() : true;
	}

	getChildren() {
		return this.children;
	}

	getComponentName() {
		return this.componentName;
	}

	/**
	 * 插入一个节点
	 * @param node 要插入的节点
	 * @param ref 参考节点,插入位置会在此节点之后
	 * @param useMutator 是否使用变更器,默认为true
	 */
	insert(node: INode, ref?: INode, useMutator = true) {
		this.insertAfter(node, ref, useMutator);
	}

	insertBefore(node: INode, ref?: INode, useMutator = true) {
		const nodeInstance = ensureNode(node, this.document);
		this.children?.internalInsert(
			nodeInstance,
			ref ? ref.index : null,
			useMutator
		);
	}

	insertAfter(node: any, ref?: INode, useMutator = true) {
		const nodeInstance = ensureNode(node, this.document);
		this.children?.internalInsert(
			nodeInstance,
			ref ? (ref.index || 0) + 1 : null,
			useMutator
		);
	}

	getParent() {
		return this.parent;
	}

	getId() {
		return this.id;
	}

	getIndex() {
		return this.index;
	}

	getNode() {
		return this;
	}

	getRoot() {
		return this.document.rootNode;
	}

	getProps() {
		return this.props;
	}

	mergeChildren(
		remover: (node: INode, idx: number) => any,
		adder: (children: INode[]) => IPublicTypeNodeData[] | null,
		sorter: (firstNode: INode, secondNode: INode) => any
	) {
		this.children?.mergeChildren(remover, adder, sorter);
	}

	onChildrenChange(
		fn: (param?: { type: string; node: INode }) => void
	): IPublicTypeDisposable | undefined {
		const wrappedFunc = wrapWithEventSwitch(fn);
		return this.children?.onChange(wrappedFunc);
	}

	getDOMNode(): any {
		const instance = this.document.simulator?.getComponentInstances(
			this as any
		)?.[0];
		if (!instance) {
			return;
		}
		return this.document.simulator?.findDOMNodes(instance)?.[0];
	}

	/**
	 * 获取磁贴相关信息
	 */
	getRGL(): {
		isContainerNode: boolean; // 是否是容器节点
		isEmptyNode: boolean; // 是否是空节点
		isRGLContainerNode: boolean; // 是否是RGL容器节点
		isRGLNode: boolean; // 是否是RGL节点
		isRGL: boolean; // 是否与RGL相关
		rglNode: any | null; // RGL相关的节点
	} {
		const isContainerNode = this.isContainer();
		const isEmptyNode = this.isEmpty();
		const isRGLContainerNode = this.isRGLContainer;
		const isRGLNode = this.getParent()?.isRGLContainer as boolean;
		const isRGL =
			isRGLContainerNode || (isRGLNode && (!isContainerNode || !isEmptyNode));
		const rglNode = isRGLContainerNode
			? this
			: isRGL
				? this?.getParent()
				: null;
		return {
			isContainerNode,
			isEmptyNode,
			isRGLContainerNode,
			isRGLNode,
			isRGL,
			rglNode,
		};
	}

	getRect(): DOMRect | null {
		if (this.isRoot()) {
			return this.document.simulator?.viewport.contentBounds || null;
		}
		return this.document.simulator?.computeRect(this as any) || null;
	}

	getIcon() {
		return this.icon;
	}

	toString() {
		return this.id;
	}

	/**
	 * 触发属性变更事件
	 */
	emitPropChange(val: IPublicTypePropChangeOptions) {
		this.emitter?.emit('propChange', val);
	}

	/**
	 * 监听属性变更事件
	 */
	onPropChange(
		func: (info: IPublicTypePropChangeOptions) => void
	): IPublicTypeDisposable {
		const wrappedFunc = wrapWithEventSwitch(func);
		this.emitter.on('propChange', wrappedFunc);
		return () => {
			this.emitter.removeListener('propChange', wrappedFunc);
		};
	}
}

/** *  16 当前节点包含其它节点
 *  8  当前节点被其它节点包含
 *  2  当前节点在其它节点前面或后面
 *  0  当前节点与其它节点相同 */
export enum PositionNO {
	Contains = 16,
	ContainedBy = 8,
	BeforeOrAfter = 2,
	TheSame = 0,
}

export function comparePosition(node1: INode, node2: INode): PositionNO {
	if (node1 === node2) {
		return PositionNO.TheSame;
	}
	const l1 = node1.zLevel;
	const l2 = node2.zLevel;
	if (l1 === l2) {
		return PositionNO.BeforeOrAfter;
	}

	let p: any;
	if (l1 < l2) {
		p = getZLevelTop(node2, l1);
		if (p && p === node1) {
			return PositionNO.Contains;
		}
		return PositionNO.BeforeOrAfter;
	}

	p = getZLevelTop(node1, l2);
	if (p && p === node2) {
		return PositionNO.ContainedBy;
	}

	return PositionNO.BeforeOrAfter;
}

/**
 * 获取指定层级的父节点
 * @param child 子节点
 * @param zLevel 目标层级
 * @returns 返回指定层级的父节点,如果找不到则返回 null
 */
export function getZLevelTop(child: INode, zLevel: number): INode | null {
	let l = child.zLevel;

	if (l < zLevel || zLevel < 0) {
		return null;
	}
	if (l === zLevel) {
		return child;
	}
	let r: any = child;
	while (r && l-- > zLevel) {
		r = r.parent;
	}
	return r;
}

/**
 * 测试两个节点是否为包含关系
 * @param node1 测试的父节点
 * @param node2 测试的被包含节点
 * @returns 是否包含
 */
export function contains(node1: INode, node2: INode): boolean {
	if (node1 === node2) {
		return true;
	}

	if (!node1.isParentalNode || !toRaw(node2.parent)) {
		return false;
	}

	const p = toRaw(getZLevelTop(node2, node1.zLevel));

	if (!p) {
		return false;
	}

	return node1 === p;
}

/**
 * 确保返回一个节点实例
 * @param node 输入的节点,可以是节点实例或节点数据
 * @param document 文档模型实例
 * @returns 返回节点实例
 */
function ensureNode(node: any, document: IDocumentModel): INode {
	let nodeInstance = node;
	if (!isNode(node)) {
		// 如果输入的是带有getComponentName方法的对象
		if (node.getComponentName) {
			nodeInstance = document.createNode({
				componentName: node.getComponentName(),
			});
		} else {
			// 直接使用输入创建新节点
			nodeInstance = document.createNode(node);
		}
	}
	return nodeInstance;
}

export type IPublicTypePropChangeOptions = Omit<
	GlobalEvent.Node.Prop.ChangeOptions,
	'node'
>;

export type ISlotNode = IBaseNode<IPublicTypeSlotSchema>;
export type IPageNode = IBaseNode<IPublicTypePageSchema>;
export type IComponentNode = IBaseNode<IPublicTypeComponentSchema>;
export type IRootNode = IPageNode | IComponentNode;
export type INode = IPageNode | ISlotNode | IComponentNode | IRootNode;

/**
 * 向容器节点中插入一个子节点
 * @param container 容器节点,要插入子节点的目标节点
 * @param thing 要插入的内容,可以是节点实例(INode)或节点数据(IPublicTypeNodeData)
 * @param at 插入的位置索引,如果为空则插入到最后
 * @param copy 是否复制,如果为true则会克隆一份新的节点
 * @returns 返回插入的节点实例,插入失败返回null
 */
export function insertChild(
	container: INode,
	thing: INode | IPublicTypeNodeData,
	at?: number | null,
	copy?: boolean
): INode | null {
	let node: INode | null | IRootNode | undefined;
	let nodeSchema: IPublicTypeNodeSchema;

	// 处理三种情况:
	// 1. 如果是节点实例且需要复制或者是插槽节点,则导出schema并创建新节点
	if (copy) {
		nodeSchema = (thing as any).export(IPublicEnumTransformStage.Clone);
		node = container.document?.createNode(nodeSchema);
	} else if (isNode<INode>(thing)) {
		// 2. 如果是节点实例但不需要复制,则直接使用该节点
		node = thing;
	} else if (isNodeSchema(thing)) {
		// 3. 如果是节点schema数据,则根据schema创建新节点
		node = container.document?.createNode(thing);
	}

	if (isNode<INode>(node)) {
		// 建立node之间的树状结构嵌套guan
		container.children?.insert(node, at);
		return node;
	}

	return null;
}
/**
 * 向容器节点中批量插入多个子节点
 * @param container 容器节点,要插入子节点的目标节点
 * @param nodes 要插入的节点数组,可以是节点实例数组(INode[])或节点数据数组(IPublicTypeNodeData[])
 * @param at 插入的起始位置索引,如果为空则插入到最后
 * @param copy 是否复制,如果为true则会克隆一份新的节点
 * @returns 返回插入的所有节点实例数组
 */
export function insertChildren(
	container: INode,
	nodes: INode[] | IPublicTypeNodeData[],
	at?: number | null,
	copy?: boolean
): INode[] {
	// 记录当前插入位置
	let index = at;
	let node: any;
	// 存储所有成功插入的节点
	const results: INode[] = [];
	// 从后往前遍历要插入的节点数组
	// eslint-disable-next-line no-cond-assign
	while ((node = nodes.pop())) {
		// 调用insertChild插入单个节点
		node = insertChild(container, node, index, copy);
		// 将插入成功的节点加入结果数组
		results.push(node);
		// 更新下一个节点的插入位置为当前节点的索引
		index = node.index;
	}
	return results;
}
