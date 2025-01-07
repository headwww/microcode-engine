import { VNode } from 'vue';
import {
	IPublicTypeI18nData,
	IPublicTypeNodeData,
	IPublicTypeNpmInfo,
	IPublicTypeAdvanced,
	IPublicTypeFieldConfig,
	IPublicTypeIconType,
	IPublicTypeTransformedComponentMetadata,
	IPublicTypeNodeSchema,
	IPublicTypeComponentAction,
} from '../type';
import { IPublicModelNode } from './node';

/**
 * 组件元数据
 */
export interface IPublicModelComponentMeta<Node = IPublicModelNode> {
	/**
	 * 组件名称
	 */
	get componentName(): string;

	/**
	 * 是否是「容器型」组件
	 */
	get isContainer(): boolean;

	/**
	 * 是否是最小渲染单元。
	 * 当组件需要重新渲染时：
	 *  若为最小渲染单元，则只渲染当前组件，
	 *  若不为最小渲染单元，则寻找到上层最近的最小渲染单元进行重新渲染，直至根节点。
	 */
	get isMinimalRenderUnit(): boolean;

	/**
	 * 是否为「模态框」组件
	 */
	get isModal(): boolean;

	/**
	 * 获取用于设置面板显示用的配置
	 */
	get configure(): IPublicTypeFieldConfig[];

	/**
	 * 标题
	 */
	get title(): string | IPublicTypeI18nData | VNode;

	/**
	 * 图标
	 * icon config for this component
	 */
	get icon(): IPublicTypeIconType;

	/**
	 * 组件 npm 信息
	 */
	get npm(): IPublicTypeNpmInfo;

	get availableActions(): IPublicTypeComponentAction[];

	/**
	 * 组件元数据中高级配置部分
	 */
	get advanced(): IPublicTypeAdvanced;

	/**
	 * 设置 npm 信息
	 * @param npm
	 */
	setNpm(npm: IPublicTypeNpmInfo): void;

	/**
	 * 获取元数据
	 * get component metadata
	 */
	getMetadata(): IPublicTypeTransformedComponentMetadata;

	/**
	 * 检测当前对应节点是否可被放置在父节点中
	 *
	 * @param my 当前节点
	 * @param parent 父节点
	 */
	checkNestingUp(my: Node | IPublicTypeNodeData, params: any): boolean;

	/**
	 * 检测目标节点是否可被放置在父节点中
	 * @param my 当前节点
	 * @param parent 父节点
	 */
	checkNestingDown(
		my: Node | IPublicTypeNodeData,
		target: IPublicTypeNodeSchema | Node | IPublicTypeNodeSchema[]
	): boolean;

	/**
	 * 刷新元数据，会触发元数据的重新解析和刷新
	 */
	refreshMetadata(): void;
}
