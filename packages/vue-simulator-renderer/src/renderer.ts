import { createApp } from 'vue';
import rendererView from './renderer-view';

export class SimulatorRendererContainer {
	// todo 暂时document对象通过传入的方式，方便调试，后期改成自动获取，打包成js导入到iframe中自动获取
	run(document: Document) {
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
