import {
	GlobalEvent,
	IBaseModelNode,
	IPublicEnumTransformStage,
	IPublicTypeComponentSchema,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypePageSchema,
	IPublicTypeSlotSchema,
} from '@arvin-shu/microcode-types';
import {
	isDomText,
	isJSExpression,
	isNode,
	isNodeSchema,
} from '@arvin-shu/microcode-utils';
import { IDocumentModel } from '../document-model';
import { IProps, Props } from './props/props';
import { INodeChildren } from './node-children';

export interface IBaseNode<
	Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema,
> extends Omit<IBaseModelNode<IDocumentModel, INodeChildren>, 'importSchema'> {
	get isPurged(): boolean;
	getId(): string;
	import(data: Schema, checkId?: boolean): void;
	/**
	 * 导出 schema
	 */
	export<T = Schema>(stage: IPublicEnumTransformStage, options?: any): T;
	emitPropChange(val: IPublicTypePropChangeOptions): void;
}

export class Node<Schema extends IPublicTypeNodeSchema = IPublicTypeNodeSchema>
	implements IBaseNode
{
	/**
	 * 节点的属性实例
	 */
	props: IProps;

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
	 * 是否已销毁
	 */
	get isPurged() {
		return false;
	}

	protected _children?: INodeChildren;

	constructor(
		readonly document: IDocumentModel,
		nodeSchema: Schema
	) {
		const { id, componentName, children, props, ...extras } = nodeSchema;
		this.id = document.nextId(id);
		this.componentName = componentName;

		if (this.componentName === 'Leaf') {
			this.props = new Props(this, {
				children:
					isDomText(children) || isJSExpression(children) ? children : '',
			});
		} else {
			this.props = new Props(this, props, extras);
		}
	}

	getId() {
		return this.id;
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

	get isLeafNode(): boolean {
		return this.componentName === 'Leaf';
	}

	/**
	 * 当前节点子集
	 */
	get children(): INodeChildren | null {
		return this._children || null;
	}

	import(data: IPublicTypeNodeSchema, checkId?: boolean): void {
		console.log(data, checkId);
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

	emitPropChange(val: IPublicTypePropChangeOptions) {
		console.log(val);
	}
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

	// 处理三种情况:
	// 1. 如果是节点实例且需要复制或者是插槽节点,则导出schema并创建新节点
	if (copy) {
		//
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
