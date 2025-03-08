import {
	IPublicModelDragObject,
	IPublicModelDropLocation,
	IPublicModelLocateEvent,
	IPublicModelNode,
	IPublicModelScroller,
	IPublicModelScrollTarget,
	IPublicModelSensor,
	IPublicTypeComponentInstance,
	IPublicTypeLocationChildrenDetail,
	IPublicTypeLocationDetailType,
	IPublicTypeNodeInstance,
	IPublicTypeScrollable,
} from '@arvin-shu/microcode-types';
import {
	isDragAnyObject,
	isDragNodeObject,
	isLocationChildrenDetail,
	uniqueId,
} from '@arvin-shu/microcode-utils';
import { toRaw } from 'vue';
// @ts-ignore
import requestIdleCallback, { cancelIdleCallback } from 'ric-shim';
import { ILayersPanelPluginContext, TreeMaster } from './tree-master';
import { TreeNode } from './tree-node';
import { IndentTrack } from './indent-track';
import DwellTimer from './dwell-timer';

export class PaneController
	implements IPublicModelSensor, IPublicTypeScrollable
{
	private pluginContext: ILayersPanelPluginContext;

	private treeMaster?: TreeMaster;

	readonly id = uniqueId('layers');

	private indentTrack = new IndentTrack();

	readonly at: string | symbol;

	private _sensorAvailable = false;

	private tryScrollAgain: number | null = null;

	get sensorAvailable() {
		return this._sensorAvailable;
	}

	private _shell: HTMLDivElement | null = null;

	private _scrollTarget?: IPublicModelScrollTarget;

	get scrollTarget() {
		return this._scrollTarget;
	}

	get bounds(): DOMRect | null {
		if (!this._shell) {
			return null;
		}
		return this._shell.getBoundingClientRect();
	}

	private scroller?: IPublicModelScroller;

	private sensing = false;

	constructor(at: string | symbol, treeMaster: TreeMaster) {
		this.pluginContext = treeMaster.pluginContext;
		this.treeMaster = treeMaster;
		this.at = at;
		let inited = false;
		const setup = () => {
			if (inited) {
				return false;
			}
			inited = true;
			this.treeMaster?.addBoard(this);
			const { canvas } = this.pluginContext;
			canvas.dragon?.addSensor(this);
			this.scroller = toRaw(canvas.createScroller(this));
		};
		setup();
	}

	private dwell = new DwellTimer((target, event) => {
		const { canvas, project } = this.pluginContext;
		const document = project.getCurrentDocument();
		let index: any;
		let focus: any;
		let valid = true;
		if (target.hasSlots()) {
			index = null;
			focus = { type: 'slots' };
		} else {
			index = 0;
			valid = !!document?.checkNesting(target, event.dragObject as any);
		}
		canvas.createLocation({
			target,
			source: this.id,
			event,
			detail: {
				type: IPublicTypeLocationDetailType.Children,
				index,
				focus,
				valid,
			},
		});
	});

	mount(shell: HTMLDivElement | null) {
		if (this._shell === shell) {
			return;
		}
		this._shell = shell;

		const { canvas } = this.pluginContext;
		const project = toRaw(this.pluginContext.project);

		if (shell) {
			this._scrollTarget = toRaw(canvas.createScrollTarget(shell));
			this._sensorAvailable = true;
			const selection = project.currentDocument?.selection;
			const topNodes = selection?.getTopNodes(true);
			const tree = toRaw(this.treeMaster)?.currentTree;
			if (topNodes && topNodes[0] && tree) {
				const treeNode = tree.getTreeNodeById(topNodes[0].id);
				if (treeNode) {
					setTimeout(() => {
						tree.setNodeSelected(treeNode.nodeId);
						this.scrollToNode(treeNode, null, 4);
					}, 0);
				}
			}
		} else {
			this._scrollTarget = undefined;
			this._sensorAvailable = false;
		}
	}

	fixEvent(e: IPublicModelLocateEvent): IPublicModelLocateEvent {
		if (e.fixed) {
			return e;
		}
		const notMyEvent = e.originalEvent.view?.document !== document;
		if (!e.target || notMyEvent) {
			e.target = document.elementFromPoint(e.canvasX!, e.canvasY!);
		}
		e.documentModel = this.pluginContext.project.getCurrentDocument();
		e.fixed = true;
		return e;
	}

	isEnter(e: IPublicModelLocateEvent): boolean {
		if (!this._shell) {
			return false;
		}
		const rect = this._shell.getBoundingClientRect();
		return (
			e.globalY >= rect.top &&
			e.globalY <= rect.bottom &&
			e.globalX >= rect.left &&
			e.globalX <= rect.right
		);
	}

	deactiveSensor() {
		this.sensing = false;
		this.scroller?.cancel();
		this.dwell.reset();
		this.indentTrack.reset();
	}

	scrollToNode(treeNode: TreeNode, detail?: any, tryTimes = 0) {
		if (tryTimes < 1 && this.tryScrollAgain) {
			cancelIdleCallback(this.tryScrollAgain);
			this.tryScrollAgain = null;
		}
		if (!this.bounds || !this.scroller || !this.scrollTarget) {
			return;
		}

		let rect: ClientRect | undefined;
		if (detail && isLocationChildrenDetail(detail)) {
			rect = this.getInsertionRect();
		} else {
			rect = this.getTreeNodeRect(treeNode);
		}

		if (!rect) {
			if (tryTimes < 3) {
				this.tryScrollAgain = requestIdleCallback(() =>
					this.scrollToNode(treeNode, detail, tryTimes + 1)
				);
			}
			return;
		}
		const { scrollHeight, top: scrollTop } = this.scrollTarget;
		const { height, top, bottom } = this.bounds;
		if (rect.top < top || rect.bottom > bottom) {
			const opt: any = {};
			opt.top = Math.min(
				rect.top + rect.height / 2 + scrollTop - top - height / 2,
				scrollHeight - height
			);
			if (rect.height >= height) {
				opt.top = Math.min(scrollTop + rect.top - top, opt.top);
			}
			this.scroller.scrollTo(opt);
		}
		if (tryTimes < 4) {
			this.tryScrollAgain = requestIdleCallback(() =>
				this.scrollToNode(treeNode, detail, 4)
			);
		}
	}

	locate(
		e: IPublicModelLocateEvent
	): IPublicModelDropLocation | undefined | null {
		this.sensing = true;
		this.scroller?.scrolling(e);
		const { globalY, dragObject } = e;
		const nodes = dragObject?.nodes;
		const tree = this.treeMaster?.currentTree;
		if (!tree || !tree.root || !this._shell) {
			return null;
		}

		const operationalNodes = nodes?.filter((node: any) => {
			const onMoveHook = node.componentMeta?.advanced.callbacks?.onMoveHook;
			const canMove =
				onMoveHook && typeof onMoveHook === 'function'
					? onMoveHook(node)
					: true;

			return canMove;
		});

		// 如果拖拽的是 Node 才需要后面的判断，拖拽 data 不需要
		if (
			isDragNodeObject(dragObject) &&
			(!operationalNodes || operationalNodes.length === 0)
		) {
			return;
		}

		const { project, canvas } = this.pluginContext;
		const document = project.getCurrentDocument();
		const pos = getPosFromEvent(e, this._shell);
		const irect = this.getInsertionRect();
		const originLoc = document?.dropLocation;
		const componentMeta = e.dragObject?.nodes
			? e?.dragObject?.nodes?.[0]?.componentMeta
			: null;
		if (
			e.dragObject?.type === 'node' &&
			componentMeta &&
			componentMeta.isModal &&
			document?.focusNode
		) {
			return canvas.createLocation({
				target: document?.focusNode,
				detail: {
					type: IPublicTypeLocationDetailType.Children,
					index: 0,
					valid: true,
				},
				source: this.id,
				event: e,
			});
		}
		// 处理已存在的放置位置
		if (
			originLoc &&
			((pos && pos === 'unchanged') ||
				(irect && globalY >= irect.top && globalY <= irect.bottom)) &&
			dragObject
		) {
			const loc = originLoc.clone(e);
			const indented = this.indentTrack.getIndentParent(originLoc, loc);
			if (indented) {
				const [parent, index] = indented;
				if (checkRecursion(parent, dragObject)) {
					if (tree.getTreeNode(parent).expanded) {
						this.dwell.reset();
						return canvas.createLocation({
							target: parent,
							source: this.id,
							event: e,
							detail: {
								type: IPublicTypeLocationDetailType.Children,
								index,
								valid: document?.checkNesting(parent, e.dragObject as any),
							},
						});
					}

					(originLoc.detail as IPublicTypeLocationChildrenDetail).focus = {
						type: 'node',
						node: parent,
					};
					// focus try expand go on
					this.dwell.focus(parent, e);
				} else {
					this.dwell.reset();
				}
				// FIXME: recreate new location
			} else if ((originLoc.detail as IPublicTypeLocationChildrenDetail).near) {
				(originLoc.detail as IPublicTypeLocationChildrenDetail).near =
					undefined;
				this.dwell.reset();
			}
			return;
		}

		// 重置缩进跟踪器
		this.indentTrack.reset();

		if (pos && pos !== 'unchanged') {
			let treeNode = tree.getTreeNodeById(pos.nodeId);
			if (treeNode) {
				let { focusSlots } = pos;
				let { node } = treeNode;
				if (isDragNodeObject(dragObject)) {
					const newNodes = operationalNodes;
					let i = newNodes?.length ?? 0;
					let p: any = node;
					while (i-- > 0) {
						if (newNodes?.[i]?.contains(p)) {
							p = newNodes?.[i]?.parent;
						}
					}
					if (p !== node) {
						node = p || document?.focusNode;
						treeNode = tree.getTreeNode(node);
						focusSlots = false;
					}
				}

				if (focusSlots) {
					this.dwell.reset();
					return canvas.createLocation({
						target: node as IPublicModelNode,
						source: this.id,
						event: e,
						detail: {
							type: IPublicTypeLocationDetailType.Children,
							index: null,
							valid: false,
							focus: { type: 'slots' },
						},
					});
				}

				if (!treeNode.isRoot()) {
					const loc = this.getNear(treeNode, e);
					this.dwell.tryFocus(loc);
					return loc;
				}
			}
		}

		const loc = this.drillLocate(tree.root, e);
		this.dwell.tryFocus(loc);
		return loc;
	}

	private getNear(
		treeNode: TreeNode,
		e: IPublicModelLocateEvent,
		originalIndex?: number,
		originalRect?: DOMRect
	) {
		const { canvas, project } = this.pluginContext;
		const document = project.getCurrentDocument();
		const { globalY, dragObject } = e;
		if (!dragObject) {
			return null;
		}
		const { node, expanded } = treeNode;
		let rect = originalRect;
		if (!rect) {
			rect = this.getTreeNodeRect(treeNode);
			if (!rect) {
				return null;
			}
		}
		let index = originalIndex;
		if (index == null) {
			index = node.index;
		}

		if (node.isSlotNode) {
			// 是个插槽根节点
			if (!treeNode.isContainer() && !treeNode.hasSlots()) {
				return canvas.createLocation({
					target: node.parent!,
					source: this.id,
					event: e,
					detail: {
						type: IPublicTypeLocationDetailType.Children,
						index: null,
						near: { node, pos: 'replace' },
						valid: true,
					},
				});
			}
			const loc1 = this.drillLocate(treeNode, e);
			if (loc1) {
				return loc1;
			}

			return canvas.createLocation({
				target: node.parent!,
				source: this.id,
				event: e,
				detail: {
					type: IPublicTypeLocationDetailType.Children,
					index: null,
					valid: false,
					focus: { type: 'slots' },
				},
			});
		}

		let focusNode: IPublicModelNode | undefined;
		// focus
		if (!expanded && (treeNode.isContainer() || treeNode.hasSlots())) {
			focusNode = node;
		}

		// before
		const titleRect = this.getTreeTitleRect(treeNode) || rect;
		if (globalY < titleRect.top + titleRect.height / 2) {
			return canvas.createLocation({
				target: node.parent!,
				source: this.id,
				event: e,
				detail: {
					type: IPublicTypeLocationDetailType.Children,
					index,
					valid: document?.checkNesting(node.parent!, dragObject as any),
					near: { node, pos: 'before' },
					focus: checkRecursion(focusNode, dragObject)
						? { type: 'node', node: focusNode }
						: undefined,
				},
			});
		}

		if (globalY > titleRect.bottom) {
			focusNode = undefined;
		}

		if (expanded) {
			// drill
			const loc = this.drillLocate(treeNode, e);
			if (loc) {
				return loc;
			}
		}

		// after
		return canvas.createLocation({
			target: node.parent!,
			source: this.id,
			event: e,
			detail: {
				type: IPublicTypeLocationDetailType.Children,
				index: (index || 0) + 1,
				valid: document?.checkNesting(node.parent!, dragObject as any),
				near: { node, pos: 'after' },
				focus: checkRecursion(focusNode, dragObject)
					? { type: 'node', node: focusNode }
					: undefined,
			},
		});
	}

	private drillLocate(
		treeNode: TreeNode,
		e: IPublicModelLocateEvent
	): IPublicModelDropLocation | null {
		const { canvas, project } = this.pluginContext;
		const document = project.getCurrentDocument();
		const { dragObject, globalY } = e;
		if (!dragObject) {
			return null;
		}

		if (!checkRecursion(treeNode.node, dragObject)) {
			return null;
		}

		if (isDragAnyObject(dragObject)) {
			return null;
		}

		const container = treeNode.node as IPublicModelNode;
		const detail: IPublicTypeLocationChildrenDetail = {
			type: IPublicTypeLocationDetailType.Children,
		};
		const locationData: any = {
			target: container,
			detail,
			source: this.id,
			event: e,
		};
		const isSlotContainer = treeNode.hasSlots();
		const isContainer = treeNode.isContainer();

		if (container.isSlotNode && !treeNode.expanded) {
			// 未展开，直接定位到内部第一个节点
			if (isSlotContainer) {
				detail.index = null;
				detail.focus = { type: 'slots' };
				detail.valid = false;
			} else {
				detail.index = 0;
				detail.valid = document?.checkNesting(container, dragObject as any);
			}
		}

		let items: TreeNode[] | null = null;
		let slotsRect: DOMRect | undefined;
		let focusSlots = false;
		// isSlotContainer
		if (isSlotContainer) {
			slotsRect = this.getTreeSlotsRect(treeNode);
			if (slotsRect) {
				if (globalY <= slotsRect.bottom) {
					focusSlots = true;
					items = treeNode.slots;
				} else if (!isContainer) {
					// 不在 slots 范围，又不是 container 的情况，高亮 slots 区
					detail.index = null;
					detail.focus = { type: 'slots' };
					detail.valid = false;
					return canvas.createLocation(locationData);
				}
			}
		}

		if (!items && isContainer) {
			items = treeNode.children;
		}

		if (!items) {
			return null;
		}

		const l = items.length;
		let index = 0;
		let before = l < 1;
		let current: TreeNode | undefined;
		let currentIndex = index;
		for (; index < l; index++) {
			current = items[index];
			currentIndex = index;
			const rect = this.getTreeNodeRect(current);
			if (!rect) {
				continue;
			}

			// rect
			if (globalY < rect.top) {
				before = true;
				break;
			}

			if (globalY > rect.bottom) {
				continue;
			}

			const loc = this.getNear(current, e, index, rect);
			if (loc) {
				return loc;
			}
		}

		if (focusSlots) {
			detail.focus = { type: 'slots' };
			detail.valid = false;
			detail.index = null;
		} else {
			if (current) {
				detail.index = before ? currentIndex : currentIndex + 1;
				detail.near = { node: current.node, pos: before ? 'before' : 'after' };
			} else {
				detail.index = l;
			}
			detail.valid = document?.checkNesting(container, dragObject as any);
		}

		return canvas.createLocation(locationData);
	}

	purge() {
		const { canvas } = this.pluginContext;
		canvas.dragon?.removeSensor(this);
		this.treeMaster?.removeBoard(this);
	}

	getNodeInstanceFromElement?:
		| ((
				e: Element | null
		  ) => IPublicTypeNodeInstance<
				IPublicTypeComponentInstance,
				IPublicModelNode
		  > | null)
		| undefined;

	private getInsertionRect(): DOMRect | undefined {
		if (!this._shell) {
			return undefined;
		}
		return this._shell.querySelector('.insertion')?.getBoundingClientRect();
	}

	private getTreeNodeRect(treeNode: TreeNode): DOMRect | undefined {
		if (!this._shell) {
			return undefined;
		}
		return this._shell
			.querySelector(`.mtc-tree-node[data-id="${treeNode.nodeId}"]`)
			?.getBoundingClientRect();
	}

	private getTreeTitleRect(treeNode: TreeNode): DOMRect | undefined {
		if (!this._shell) {
			return undefined;
		}
		return this._shell
			.querySelector(`.mtc-tree-node-title[data-id="${treeNode.nodeId}"]`)
			?.getBoundingClientRect();
	}

	private getTreeSlotsRect(treeNode: TreeNode): DOMRect | undefined {
		if (!this._shell) {
			return undefined;
		}
		return this._shell
			.querySelector(`.mtc-tree-node-slots[data-id="${treeNode.nodeId}"]`)
			?.getBoundingClientRect();
	}
}
/**
 * 检查拖拽对象是否会导致循环引用
 * @param parent 目标父节点
 * @param dragObject 被拖拽的对象
 * @returns
 * - true: 不会导致循环引用
 * - false: 会导致循环引用或parent为空
 */
function checkRecursion(
	parent: IPublicModelNode | undefined | null,
	dragObject: IPublicModelDragObject
): boolean {
	// 如果父节点不存在,返回false
	if (!parent) {
		return false;
	}
	// 如果拖拽对象是节点类型
	if (isDragNodeObject(dragObject)) {
		const { nodes } = dragObject;
		// 检查被拖拽的节点是否包含目标父节点
		// 如果包含则会导致循环引用,返回false
		if (nodes.some((node: IPublicModelNode) => node.contains(parent))) {
			return false;
		}
	}
	// 不会导致循环引用,返回true
	return true;
}

/**
 * 从事件中获取位置信息
 * @param target - 定位事件目标元素
 * @param stop - 停止向上查找的元素
 * @returns
 * - null: 未找到有效位置
 * - 'unchanged': 点击了插入标记,位置不变
 * - {nodeId, focusSlots}: 返回节点ID和是否聚焦在slots区域
 */
function getPosFromEvent(
	{ target }: IPublicModelLocateEvent,
	stop: Element
): null | 'unchanged' | { nodeId: string; focusSlots: boolean } {
	// 检查目标元素是否存在且在stop元素内
	if (!target || !stop.contains(target)) {
		return null;
	}

	// 如果点击了插入标记,返回unchanged
	if (target.matches('.insertion')) {
		return 'unchanged';
	}

	// 向上查找最近的带data-id属性的元素
	const closest = target.closest('[data-id]');
	if (!closest || !stop.contains(closest)) {
		return null;
	}

	// 获取节点ID
	const nodeId = (closest as HTMLDivElement).dataset.id!;
	return {
		// 判断是否点击在slots区域
		focusSlots: closest.matches('.mtc-tree-node-slots'),
		nodeId,
	};
}
