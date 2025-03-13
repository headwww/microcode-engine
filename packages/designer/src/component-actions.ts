import {
	IPublicModelNode,
	IPublicTypeComponentAction,
	IPublicTypeMetadataTransducer,
} from '@arvin-shu/microcode-types';
import { engineConfig } from '@arvin-shu/microcode-editor-core';
import { toRaw } from 'vue';
import {
	IconClone,
	IconHidden,
	IconLock,
	IconRemove,
	IconUnlock,
} from './icons';
import { intlNode } from './locale';
import { componentDefaults } from './transducers';

function deduplicateRef(node: IPublicModelNode | null | undefined) {
	const currentRef = node?.getPropValue('ref');
	if (currentRef) {
		node?.setPropValue(
			'ref',
			`${node.componentName.toLowerCase()}-${Math.random().toString(36).slice(2, 9)}`
		);
	}
	node?.children?.forEach(deduplicateRef);
}

export class ComponentActions {
	private metadataTransducers: IPublicTypeMetadataTransducer[] = [];

	actions: IPublicTypeComponentAction[] = [
		{
			name: 'remove',
			content: {
				icon: IconRemove,
				title: intlNode('remove'),
				action: (node: IPublicModelNode) => {
					node.remove();
				},
			},
			important: true,
		},
		{
			name: 'hide',
			content: {
				icon: IconHidden,
				title: intlNode('hide'),
				action: (node: IPublicModelNode) => {
					node.visible = false;
				},
			},
			condition: (node: IPublicModelNode) => !!node.componentMeta?.isModal,
			important: true,
		},
		{
			name: 'copy',
			content: {
				icon: IconClone,
				title: intlNode('copy'),
				action: (node: IPublicModelNode) => {
					const { document: doc, parent, index } = node;
					if (parent) {
						const newNode = doc?.insertNode(
							parent,
							node,
							(index ?? 0) + 1,
							true
						);
						deduplicateRef(newNode);
						newNode?.select();
						// 获取节点的RGL(React Grid Layout)相关信息
						// eslint-disable-next-line no-unsafe-optional-chaining
						const { isRGL, rglNode } = node?.getRGL();
						if (isRGL) {
							// 如果是RGL布局,需要复制layout信息
							const layout: any = rglNode?.getPropValue('layout') || [];
							// 找到当前节点的layout配置
							const curLayout = layout.filter(
								(item: any) => item.i === node.getPropValue('fieldId')
							);
							if (curLayout && curLayout[0]) {
								// 复制layout配置并更新fieldId
								layout.push({
									...curLayout[0],
									i: newNode?.getPropValue('fieldId'),
								});
								// 更新RGL节点的layout属性
								rglNode?.setPropValue('layout', layout);
								// 滚动到新节点位置,需要延迟执行确保DOM已更新
								setTimeout(
									() =>
										newNode?.document?.project?.simulatorHost?.scrollToNode(
											newNode
										),
									10
								);
							}
						}
					}
				},
			},
			important: true,
		},
		{
			name: 'lock',
			content: {
				icon: IconLock,
				title: intlNode('lock'),
				action(node: IPublicModelNode) {
					node.lock();
				},
			},
			condition: (n: IPublicModelNode) => {
				const node = toRaw(n);
				return (
					engineConfig.get('enableCanvasLock', false) &&
					node.isContainerNode &&
					!node.isLocked
				);
			},
			important: true,
		},
		{
			name: 'unlock',
			content: {
				icon: IconUnlock,
				title: intlNode('unlock'),
				action(node: IPublicModelNode) {
					node.lock(false);
				},
			},
			condition: (n: IPublicModelNode) => {
				const node = toRaw(n);
				return (
					engineConfig.get('enableCanvasLock', false) &&
					node.isContainerNode &&
					node.isLocked
				);
			},
			important: true,
		},
	];

	constructor() {
		this.registerMetadataTransducer(
			componentDefaults,
			100,
			'component-defaults'
		);
	}

	removeBuiltinComponentAction(name: string) {
		const i = this.actions.findIndex((action) => action.name === name);
		if (i > -1) {
			this.actions.splice(i, 1);
		}
	}

	addBuiltinComponentAction(action: IPublicTypeComponentAction) {
		this.actions.push(action);
	}

	modifyBuiltinComponentAction(
		actionName: string,
		handle: (action: IPublicTypeComponentAction) => void
	) {
		const builtinAction = this.actions.find(
			(action) => action.name === actionName
		);
		if (builtinAction) {
			handle(builtinAction);
		}
	}

	registerMetadataTransducer(
		transducer: IPublicTypeMetadataTransducer,
		level = 100,
		id?: string
	) {
		transducer.level = level;
		transducer.id = id;
		const i = this.metadataTransducers.findIndex(
			(item) => item.level != null && item.level > level
		);
		if (i < 0) {
			this.metadataTransducers.push(transducer);
		} else {
			this.metadataTransducers.splice(i, 0, transducer);
		}
	}

	getRegisteredMetadataTransducers(): IPublicTypeMetadataTransducer[] {
		return this.metadataTransducers;
	}
}
