import { createApp } from 'vue';
import rendererView from './renderer-view';

export class SimulatorRendererContainer {
	run() {
		const containerId = 'simulator-app';
		let container = document.getElementById(containerId);
		if (!container) {
			container = document.createElement('div');
			document.body.appendChild(container);
			container.id = containerId;
			createApp(rendererView).mount(container);
		}
	}
}

export default new SimulatorRendererContainer();
