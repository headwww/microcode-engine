import {
	IPublicTypeContainerSchema,
	IPublicTypeNodeSchema,
} from '@arvin-shu/microcode-types';
import { Component, DefineComponent, ExtractPropTypes, PropType } from 'vue';

export const rendererProps = {
	__schema: {
		type: Object as PropType<IPublicTypeContainerSchema>,
		required: true,
	},
	__components: {
		type: Object as PropType<Record<string, Component>>,
		required: true,
	},
} as const;

export type RendererProps = ExtractPropTypes<typeof rendererProps>;

export type RendererComponent = DefineComponent<RendererProps, any, any>;

export const leafProps = {
	// TODO 后续需要添加 scope
	__comp: null,
	__schema: {
		type: Object as PropType<IPublicTypeNodeSchema>,
		default: () => ({}),
	},
	__vnodeProps: {
		type: Object as PropType<Record<string, unknown>>,
		default: () => ({}),
	},
	__isRootNode: Boolean,
} as const;

export type LeafProps = ExtractPropTypes<typeof leafProps>;
