import { createApp } from 'vue';
import rendererView from './renderer-view';

export class SimulatorRendererContainer {
	private _running = false;

	run() {
		if (this._running) {
			return;
		}
		this._running = true;
		const containerId = 'simulator-app';
		let container = document.getElementById(containerId);
		if (!container) {
			container = document.createElement('div');
			document.body.appendChild(container);
			container.id = containerId;
		}

		document.documentElement.classList.add('engine-page');
		document.body.classList.add('engine-document');
		createApp(rendererView).mount(container);
	}

	dispose() {}
}

export default new SimulatorRendererContainer();
