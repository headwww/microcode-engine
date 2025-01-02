import { defineComponent, PropType, toRaw } from 'vue';
import {
	IPublicTypeLocationChildrenDetail,
	IPublicTypeNodeData,
	IPublicTypeNodeSchema,
	IPublicTypeRect,
} from '@arvin-shu/microcode-types';
import { isLocationChildrenDetail } from '@arvin-shu/microcode-utils';
import { BuiltinSimulatorHost } from '../host';
import { DropLocation, isVertical } from '../../designer';
import { ISimulatorHost } from '../../simulator';
import { INode } from '../../document';

export const InsertionView = defineComponent({
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
		},
	},
	setup(props) {
		return () => {
			const { host } = props;
			if (!host) {
				return <></>;
			}
			const loc = host.currentDocument?.dropLocation;

			if (!loc) {
				return <></>;
			}
			// 如果是个绝对定位容器，不需要渲染插入标记
			if (loc.target?.componentMeta?.advanced.isAbsoluteLayoutContainer) {
				return <></>;
			}

			const { scale, scrollX, scrollY } = host.viewport;
			const { edge, insertType, coverRect, nearRect, vertical, nearNode } =
				processDetail(loc as any);

			if (!edge) {
				return <></>;
			}

			let className = 'mtc-insertion';
			if ((loc.detail as any)?.valid === false) {
				className += ' invalid';
			}

			const style: any = {};
			let x: number;
			let y: number;

			if (insertType === 'cover') {
				className += ' cover';
				x = (coverRect!.left + scrollX) * scale;
				y = (coverRect!.top + scrollY) * scale;
				style.width = `${coverRect!.width * scale}px`;
				style.height = `${coverRect!.height * scale}px`;
			} else {
				if (!nearRect) {
					return null;
				}
				if (vertical) {
					className += ' vertical';
					x =
						((insertType === 'before' ? nearRect.left : nearRect.right) +
							scrollX) *
						scale;
					y = (nearRect.top + scrollY) * scale;
					style.height = `${nearRect!.height * scale}px`;
				} else {
					x = (nearRect.left + scrollX) * scale;
					y =
						((insertType === 'before' ? nearRect.top : nearRect.bottom) +
							scrollY) *
						scale;
					style.width = `${nearRect.width * scale}px`;
				}
				if (
					y === 0 &&
					// @ts-ignore
					(nearNode as IPublicTypeNodeSchema)?.componentMeta?.isTopFixed
				) {
					return null;
				}
			}
			style.transform = `translate3d(${x}px, ${y}px, 0) ${
				vertical ? `scaleY(1)` : `scaleX(1)`
			}`;

			style.transformOrigin = vertical ? 'center left' : 'left top';
			style.transition =
				'transform 0.15s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.1s ease-in-out';
			style.opacity = '1';
			style.willChange = 'transform, opacity';

			return <div class={className} style={style} />;
		};
	},
});

interface InsertionData {
	edge?: DOMRect;
	insertType?: string;
	vertical?: boolean;
	nearRect?: IPublicTypeRect;
	coverRect?: DOMRect;
	nearNode?: IPublicTypeNodeData;
}

/**
 * 将 detail 信息转换为页面"坐标"信息
 */
function processDetail({
	target,
	detail,
	document,
}: DropLocation): InsertionData {
	const sim = document?.simulator;
	if (!sim) {
		return {};
	}
	if (isLocationChildrenDetail(detail)) {
		return processChildrenDetail(sim, target, detail);
	}
	const instances = sim.getComponentInstances(target);
	if (!instances) {
		return {};
	}
	const edge = sim.computeComponentInstanceRect(
		instances[0],
		target.componentMeta.rootSelector
	);
	return edge ? { edge, insertType: 'cover', coverRect: edge } : {};
}

/**
 * 处理拖拽子节点(INode)情况
 */
function processChildrenDetail(
	sim: ISimulatorHost,
	container: INode,
	detail: IPublicTypeLocationChildrenDetail
): InsertionData {
	let edge = detail.edge || null;

	if (!edge) {
		edge = sim.computeRect(container);
		if (!edge) {
			return {};
		}
	}

	const ret: any = {
		edge,
		insertType: 'before',
	};

	if (detail.near) {
		const { node, pos, rect, align } = detail.near;
		ret.nearRect = rect || toRaw(sim).computeRect(toRaw(node) as any);
		ret.nearNode = toRaw(node);
		if (pos === 'replace') {
			ret.coverRect = ret.nearRect;
			ret.insertType = 'cover';
		} else if (
			!ret.nearRect ||
			(ret.nearRect.width === 0 && ret.nearRect.height === 0)
		) {
			ret.nearRect = ret.edge;
			ret.insertType = 'after';
			ret.vertical = isVertical(ret.nearRect);
		} else {
			ret.insertType = pos;
			ret.vertical = align ? align === 'V' : isVertical(ret.nearRect);
		}
		return ret;
	}

	const { index } = detail;
	if (index == null) {
		ret.coverRect = ret.edge;
		ret.insertType = 'cover';
		return ret;
	}
	// @ts-ignore
	let nearNode = container.children.get(index);
	if (!nearNode) {
		// index = 0, eg. nochild,
		// @ts-ignore
		nearNode = container.children.get(index > 0 ? index - 1 : 0);
		if (!nearNode) {
			ret.insertType = 'cover';
			ret.coverRect = edge;
			return ret;
		}
		ret.insertType = 'after';
	}
	if (nearNode) {
		ret.nearRect = sim.computeRect(nearNode);
		if (
			!ret.nearRect ||
			(ret.nearRect.width === 0 && ret.nearRect.height === 0)
		) {
			ret.nearRect = ret.edge;
			ret.insertType = 'after';
		}
		ret.vertical = isVertical(ret.nearRect);
		ret.nearNode = nearNode;
	} else {
		ret.insertType = 'cover';
		ret.coverRect = edge;
	}
	return ret;
}
