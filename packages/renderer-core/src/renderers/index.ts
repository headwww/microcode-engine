import type { RendererComponent } from '../core';
import { PageRenderer } from './page';
import { ComponentRenderer } from './component';
import { BlockRenderer } from './block';

export const RENDERER_COMPS: Record<string, RendererComponent> = {
	PageRenderer,
	ComponentRenderer,
	BlockRenderer,
};
