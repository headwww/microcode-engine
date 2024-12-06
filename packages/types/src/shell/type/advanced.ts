import { IPublicModelNode } from '../model';
import { IPublicTypeCallbacks } from './metadata';
import { IPublicTypeNodeData } from './node-data';

/**
 * 组件元数据中高级配置部分
 */
export interface IPublicTypeAdvanced {
	/**
	 * 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等
	 */
	callbacks?: IPublicTypeCallbacks;

	/**
	 * 拖入容器时，自动带入 children 列表
	 */
	initialChildren?:
		| IPublicTypeNodeData[]
		| ((target: IPublicModelNode) => IPublicTypeNodeData[]);
}
