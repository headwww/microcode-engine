import { IPublicTypeContainerSchema } from '@arvin-shu/microcode-types';
import { DefineComponent, ExtractPropTypes, PropType } from 'vue';

export const rendererProps = {
	__schema: {
		type: Object as PropType<IPublicTypeContainerSchema>,
		required: true,
	},
} as const;

export type RendererProps = ExtractPropTypes<typeof rendererProps>;

export type RendererComponent = DefineComponent<RendererProps, any, any>;

export const leafProps = {
	__comp: null,
} as const;
