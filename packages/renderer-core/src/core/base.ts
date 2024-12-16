import { DefineComponent, ExtractPropTypes } from 'vue';

export const rendererProps = {} as const;

export type RendererProps = ExtractPropTypes<typeof rendererProps>;

export type RendererComponent = DefineComponent<RendererProps, any, any>;
