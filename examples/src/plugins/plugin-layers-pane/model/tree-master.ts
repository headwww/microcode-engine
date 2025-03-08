import {
	IPublicModelNode,
	IPublicModelPluginContext,
	IPublicTypeDisposable,
} from '@arvin-shu/microcode-types';
import EventEmitter2 from 'eventemitter2';
import { Tree } from './tree';
import { TreeNode } from './tree-node';

/**
 * 大纲树插件上下文接口定义
 * 继承自 IPublicModelPluginContext
 */
export interface ILayersPanelPluginContext extends IPublicModelPluginContext {
	/**
	 * 额外标题
	 */
	extraTitle?: string;
}

export interface ITreeBoard {
	readonly at: string | symbol;
	scrollToNode(treeNode: TreeNode, detail?: any): void;
}

export class TreeMaster {
	/**
	 * 插件上下文
	 */
	pluginContext: ILayersPanelPluginContext;

	private boards = new Set<ITreeBoard>();

	private treeMap = new Map<string, Tree>();

	private disposeEvents: (IPublicTypeDisposable | undefined)[] = [];

	event = new EventEmitter2();

	constructor(
		pluginContext: IPublicModelPluginContext,
		readonly options: {
			extraTitle?: string;
		}
	) {
		this.setPluginContext(pluginContext);
		this.initEvent();
	}

	private setPluginContext(pluginContext: IPublicModelPluginContext) {
		if (!pluginContext) {
			return;
		}

		this.pluginContext = {
			...pluginContext,
		};

		this.disposeEvent();
		this.initEvent();
		this.emitPluginContextChange();
	}

	private disposeEvent() {
		this.disposeEvents.forEach((d) => {
			d && d();
		});
	}

	onPluginContextChange(fn: () => void) {
		this.event.on('pluginContextChanged', fn);
	}

	emitPluginContextChange() {
		this.event.emit('pluginContextChanged');
	}

	private initEvent() {
		let startTime: any;
		const { event, project, canvas } = this.pluginContext;
		// TODO const setExpandByActiveTracker = (target: any) => {
		// 	const { node, detail } = target;
		// 	const tree = this.currentTree;
		// 	if (!tree /* || node.document !== tree.document */) {
		// 		return;
		// 	}
		// 	const treeNode = tree.getTreeNode(node);
		// 	if (detail && isLocationChildrenDetail(detail)) {
		// 		treeNode.expand(true);
		// 	} else {
		// 		treeNode.expandParents();
		// 	}
		// 	this.boards.forEach((board) => {
		// 		board.scrollToNode(treeNode, detail);
		// 	});
		// };
		this.disposeEvents = [
			canvas.dragon?.onDragstart(() => {
				startTime = Date.now() / 1000;
				// needs?
				this.toVision();
			}),
			// TODO canvas.activeTracker?.onChange(setExpandByActiveTracker),
			canvas.dragon?.onDragend(() => {
				const endTime: any = Date.now() / 1000;
				const nodes = project.currentDocument?.selection?.getNodes();
				event.emit('outlinePane.dragend', {
					selected: nodes
						?.map((n) => {
							if (!n) {
								return;
							}
							const npm = n?.componentMeta?.npm;
							return (
								[npm?.package, npm?.componentName]
									.filter((item) => !!item)
									.join('-') || n?.componentMeta?.componentName
							);
						})
						.join('&'),
					time: (endTime - startTime).toFixed(2),
				});
			}),
			project.onRemoveDocument((data: { id: string }) => {
				const { id } = data;
				this.treeMap.delete(id);
			}),
		];
		// TODO
		// if (canvas.activeTracker?.target) {
		// 	setExpandByActiveTracker(canvas.activeTracker?.target);
		// }
	}

	private toVision() {
		const tree = this.currentTree;
		if (tree) {
			const selection =
				this.pluginContext.project.getCurrentDocument()?.selection;
			selection?.getTopNodes().forEach((node: IPublicModelNode) => {
				tree.getTreeNode(node).setExpanded(false);
			});
		}
	}

	addBoard(board: ITreeBoard) {
		this.boards.add(board);
	}

	removeBoard(board: ITreeBoard) {
		this.boards.delete(board);
	}

	get currentTree() {
		const doc = this.pluginContext.project.getCurrentDocument();
		if (doc) {
			const { id } = doc;
			if (this.treeMap.has(id)) {
				return this.treeMap.get(id)!;
			}
			const tree = new Tree(this);
			this.treeMap.set(id, tree);
			return tree;
		}

		return null;
	}
}
