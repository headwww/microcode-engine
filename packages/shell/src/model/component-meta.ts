import {
	IPublicModelComponentMeta,
	IPublicModelNode,
	IPublicTypeAdvanced,
	IPublicTypeFieldConfig,
	IPublicTypeI18nData,
	IPublicTypeIconType,
	IPublicTypeNodeData,
	IPublicTypeNpmInfo,
} from '@arvin-shu/microcode-types';
import { VNode, RendererNode, RendererElement } from 'vue';
import {
	IComponentMeta as InnerComponentMeta,
	INode,
} from '@arvin-shu/microcode-designer';
import { componentMetaSymbol, nodeSymbol } from '../symbols';

export class ComponentMeta implements IPublicModelComponentMeta {
	private readonly [componentMetaSymbol]: InnerComponentMeta;

	isComponentMeta = true;

	constructor(componentMeta: InnerComponentMeta) {
		this[componentMetaSymbol] = componentMeta;
	}

	static create(
		componentMeta: InnerComponentMeta | null
	): IPublicModelComponentMeta | null {
		if (!componentMeta) {
			return null;
		}
		return new ComponentMeta(componentMeta);
	}

	/**
	 * 组件名
	 */
	get componentName(): string {
		return this[componentMetaSymbol].componentName;
	}

	/**
	 * 是否是「容器型」组件
	 */
	get isContainer(): boolean {
		return this[componentMetaSymbol].isContainer;
	}

	/**
	 * 是否是最小渲染单元。
	 * 当组件需要重新渲染时：
	 *  若为最小渲染单元，则只渲染当前组件，
	 *  若不为最小渲染单元，则寻找到上层最近的最小渲染单元进行重新渲染，直至根节点。
	 */
	get isMinimalRenderUnit(): boolean {
		return this[componentMetaSymbol].isMinimalRenderUnit;
	}

	/**
	 * 是否为「模态框」组件
	 */
	get isModal(): boolean {
		return this[componentMetaSymbol].isModal;
	}

	/**
	 * 元数据配置
	 */
	get configure(): IPublicTypeFieldConfig[] {
		return this[componentMetaSymbol].configure;
	}

	get title():
		| string
		| VNode<RendererNode, RendererElement, { [key: string]: any }>
		| IPublicTypeI18nData {
		return this[componentMetaSymbol].title;
	}

	get icon(): IPublicTypeIconType {
		return this[componentMetaSymbol].icon;
	}

	get npm(): IPublicTypeNpmInfo {
		return this[componentMetaSymbol].npm;
	}

	get advanced(): IPublicTypeAdvanced {
		return this[componentMetaSymbol].advanced;
	}

	setNpm(npm: IPublicTypeNpmInfo): void {
		this[componentMetaSymbol].setNpm(npm);
	}

	checkNestingUp(
		my: IPublicModelNode | IPublicTypeNodeData,
		parent: INode
	): boolean {
		const curNode = (my as any).isNode ? (my as any)[nodeSymbol] : my;
		return this[componentMetaSymbol].checkNestingUp(curNode as any, parent);
	}
}
