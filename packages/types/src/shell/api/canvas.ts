import {
	IPublicModelActiveTracker,
	IPublicModelDragon,
	IPublicModelDropLocation,
	IPublicModelScroller,
	IPublicModelScrollTarget,
} from '../model';
import { IPublicTypeLocationData, IPublicTypeScrollable } from '../type';

/**
 * Tcanvas - 画布 API
 * TODO
 */
export interface IPublicApiCanvas {
	/**
	 * 获取拖拽操作对象的实例
	 *
	 */
	get dragon(): IPublicModelDragon | null;

	/**
	 * 获取活动追踪器实例
	 *
	 * 获取 activeTracker 实例,这是一个在引擎中运行的单例。
	 * 它跟踪文档当前聚焦的节点/节点数组,并在聚焦节点/节点数组发生变化时通知订阅者。
	 */
	get activeTracker(): IPublicModelActiveTracker | null;

	/**
	 * 创一个滚动控制器 Scroller，赋予一个视图滚动的基本能力，
	 * Scroller 是一个控制器,通过 scrollTo API 赋予视图(IPublicTypeScrollable)滚动到指定坐标的能力。
	 * 初始化 Scroller 时需要传入一个带有 scrollTarget 的 scrollable。当调用 scrollTo(options: { left?: number; top?: number }) 时,
	 * Scroller 会将 scrollTarget 的左上角移动到传入的 (options.left, options.top) 坐标。
	 * @param scrollable
	 */
	createScroller(scrollable: IPublicTypeScrollable): IPublicModelScroller;

	/**
	 * 创建一个 ScrollTarget，与 Scroller 一起发挥作用，详见 createScroller 中的描述
	 * 这个与 Scroller 配合使用,参见 createScroller 的描述
	 */
	createScrollTarget(shell: HTMLDivElement): IPublicModelScrollTarget;

	/**
	 * 创建一个文档插入位置对象，该对象用来描述一个即将插入的节点在文档中的位置
	 * 为文档创建一个放置位置,该位置描述了文档中的一个位置
	 */
	createLocation(
		locationData: IPublicTypeLocationData
	): IPublicModelDropLocation;
}
