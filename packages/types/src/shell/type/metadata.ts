import { IPublicModelNode } from '../model';

/**
 * 配置 callbacks 可捕获引擎抛出的一些事件，例如 onNodeAdd、onResize 等
 */
export interface IPublicTypeCallbacks {
	/** 选中 hook，如果返回值是 false，可以控制组件不可被选中 */
	onSelectHook?: (currentNode: IPublicModelNode) => boolean;
	// events
	onNodeRemove?: (
		removedNode: IPublicModelNode | null,
		currentNode: IPublicModelNode | null
	) => void;
	onNodeAdd?: (
		addedNode: IPublicModelNode | null,
		currentNode: IPublicModelNode | null
	) => void;
}
