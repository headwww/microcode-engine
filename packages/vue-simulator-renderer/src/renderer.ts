import { createApp } from 'vue';
import rendererView from './renderer-view';

export class SimulatorRendererContainer {
	run() {
		const containerId = 'app';
		let container = document.getElementById(containerId);
		if (!container) {
			container = document.createElement('div');
			document.body.appendChild(container);
			container.id = containerId;
			createApp(rendererView).mount(container);
		}
	}

	dispose() {}
}

export default new SimulatorRendererContainer();
