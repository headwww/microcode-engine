import { IPublicTypeNodeData } from '@arvin-shu/microcode-types';
import { Component, computed, Fragment, h, VNode } from 'vue';
import { Hoc } from './leaf/hoc';
import { LeafProps, RendererProps } from './base';

export type RenderComponent = (
	nodeSchema: IPublicTypeNodeData,
	comp?: Component | typeof Fragment
) => VNode | VNode[] | null;

export function useLeaf(leafProps: LeafProps) {
	leafProps;

	const render = (
		schema: IPublicTypeNodeData,
		base: Component,
		comp?: Component | typeof Fragment
	) =>
		h(base, {
			__comp: comp,
		});

	const renderHoc: RenderComponent = (nodeSchema, comp) => {
		const vnode = render(nodeSchema, Hoc, comp);

		return vnode;
	};

	const renderComp: RenderComponent = renderHoc;

	return {
		renderComp,
	};
}

export function useRenderer(rendererProps: RendererProps) {
	const schemaRef = computed(() => rendererProps.__schema);
	const componentsRef = computed(() => rendererProps.__components);

	const leafProps: LeafProps = {
		__comp: null,
		// TODO 后续需要添加 scope
		__isRootNode: true,
		__vnodeProps: {},
		__schema: rendererProps.__schema,
	};

	return { schemaRef, componentsRef, ...useLeaf(leafProps) };
}
