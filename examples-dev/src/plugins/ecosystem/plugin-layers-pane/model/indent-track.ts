import {
	IPublicModelDropLocation,
	IPublicModelNode,
} from '@arvin-shu/microcode-types';
import { isLocationChildrenDetail } from '@arvin-shu/microcode-utils';
// 缩进敏感度,每移动15像素视为一个缩进级别
const IndentSensitive = 15;

/**
 * 用于跟踪和处理拖拽时的缩进行为
 */
export class IndentTrack {
	// 记录缩进开始时的x坐标
	private indentStart: number | null = null;

	/**
	 * 重置缩进状态
	 */
	reset() {
		this.indentStart = null;
	}

	/**
	 * 获取缩进后的父节点信息
	 * @param lastLoc 上一次的放置位置
	 * @param loc 当前的放置位置
	 * @returns 返回[父节点, 插入索引]或null
	 */
	getIndentParent(
		lastLoc: IPublicModelDropLocation & { source?: any },
		loc: IPublicModelDropLocation & { source?: any }
	): [IPublicModelNode, number | undefined] | null {
		// 检查位置是否发生变化,如果变化则重置缩进
		if (
			lastLoc.target !== loc.target ||
			!isLocationChildrenDetail(lastLoc.detail) ||
			!isLocationChildrenDetail(loc.detail) ||
			lastLoc.source !== loc.source ||
			lastLoc.detail.index !== loc.detail.index ||
			loc.detail.index == null
		) {
			this.indentStart = null;
			return null;
		}

		// 初始化缩进起始位置
		if (this.indentStart == null) {
			this.indentStart = lastLoc.event.globalX;
		}

		// 计算水平移动距离和缩进级别
		const delta = loc.event.globalX - this.indentStart;
		const indent = Math.floor(Math.abs(delta) / IndentSensitive);
		if (indent < 1) {
			return null;
		}
		this.indentStart = loc.event.globalX;
		const direction = delta < 0 ? 'left' : 'right';

		let parent: any = loc.target;
		const { index } = loc.detail;

		// 处理向左缩进(减少层级)
		if (direction === 'left') {
			if (
				!parent.parent ||
				index < (parent.children?.size || 0) ||
				parent.isSlotNode
			) {
				return null;
			}
			return [(parent as any).parent, parent.index + 1];
		}

		// 处理向右缩进(增加层级)
		if (index === 0) {
			return null;
		}
		parent = parent.children?.get(index - 1) as any;
		if (parent && parent.isContainerNode) {
			return [parent, parent.children?.size];
		}

		return null;
	}
}
