import {
	IPublicModelNode,
	IPublicModelLocateEvent,
	IPublicModelDropLocation,
} from '@arvin-shu/microcode-types';
import { isLocationChildrenDetail } from '@arvin-shu/microcode-utils';
/**
 * 停留检查计时器
 * 用于处理拖拽过程中在某个节点上停留一段时间后的行为
 * 主要用于展开折叠的节点
 */
export default class DwellTimer {
	// 定时器ID
	private timer: number | undefined;

	// 上一次停留的节点
	private previous?: IPublicModelNode;

	// 当前的定位事件
	private event?: IPublicModelLocateEvent;

	// 停留触发后的回调函数
	private decide: (
		node: IPublicModelNode,
		event: IPublicModelLocateEvent
	) => void;

	// 停留触发的超时时间,默认500ms
	private timeout = 500;

	constructor(
		decide: (node: IPublicModelNode, event: IPublicModelLocateEvent) => void,
		timeout = 500
	) {
		this.decide = decide;
		this.timeout = timeout;
	}

	/**
	 * 聚焦到某个节点
	 * @param node 目标节点
	 * @param event 定位事件
	 */
	focus(node: IPublicModelNode, event: IPublicModelLocateEvent) {
		this.event = event;
		// 如果是同一个节点则不重新计时
		if (this.previous === node) {
			return;
		}
		// 重置之前的计时
		this.reset();
		this.previous = node;
		// 设置新的计时器
		this.timer = setTimeout(() => {
			// 时间到后执行回调并重置
			this.previous && this.decide(this.previous, this.event!);
			this.reset();
		}, this.timeout) as any;
	}

	/**
	 * 尝试聚焦到放置位置
	 * @param loc 放置位置
	 */
	tryFocus(loc?: IPublicModelDropLocation | null) {
		// 如果位置无效或不是子节点类型,则重置
		if (!loc || !isLocationChildrenDetail(loc.detail)) {
			this.reset();
			return;
		}
		// 如果焦点类型是节点,则聚焦到该节点
		if (loc.detail.focus?.type === 'node') {
			this.focus(loc.detail.focus.node, loc.event);
		} else {
			this.reset();
		}
	}

	/**
	 * 重置计时器状态
	 */
	reset() {
		if (this.timer) {
			clearTimeout(this.timer);
			this.timer = undefined;
		}

		this.previous = undefined;
	}
}
