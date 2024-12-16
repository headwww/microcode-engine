import { RendererComponent } from '../core';
import { RENDERER_COMPS } from '../renderer';

export type RendererModules = Record<string, RendererComponent>;

export class Config {
	private renderers: RendererModules = { ...RENDERER_COMPS };

	setRenderers(renderers: RendererModules) {
		this.renderers = renderers;
	}

	getRenderers() {
		return this.renderers;
	}
}

export default new Config();
