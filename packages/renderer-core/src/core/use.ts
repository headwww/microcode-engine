import { IPublicTypeNodeData } from '@arvin-shu/microcode-types';
import { Component, computed, Fragment, h, VNode } from 'vue';
import { Hoc } from './leaf/hoc';
import { RendererProps } from './base';

export type RenderComponent = (
	nodeSchema: IPublicTypeNodeData,
	comp?: Component | typeof Fragment
) => VNode | VNode[] | null;

export function useLeaf() {
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

	return { schemaRef, ...useLeaf() };
}
