import { RendererComponent } from '../core';
import { PageRenderer } from './page';

export * from './renderer';

export const RENDERER_COMPS: Record<string, RendererComponent> = {
	PageRenderer,
};
