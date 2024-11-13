import { ref } from 'vue';
import { Designer, IDesigner } from '../designer';
import { IProject, Project } from '../project';
import { ISimulatorHost } from '../simulator';
import { createSimulator } from './create-simulator';

export class BuiltinSimulatorHost implements ISimulatorHost {
	readonly project: IProject;

	readonly designer: IDesigner;

	private _iframe?: HTMLIFrameElement;

	/**
	 * iframe内部的window对象
	 */
	private _contentWindow = ref<Window | null>(null);

	/**
	 * iframe内部的document对象
	 */
	private _contentDocument = ref<Document>();

	constructor(project: Project, designer: Designer) {
		this.project = project;
		this.designer = designer;
	}

	buildLibrary() {}

	async mountContentFrame(iframe: HTMLIFrameElement) {
		if (!iframe || this._iframe === iframe) {
			return;
		}
		this._iframe = iframe;

		this._contentWindow.value = iframe.contentWindow;
		this._contentDocument.value = this._contentWindow.value?.document;

		// 构建资源库
		this.buildLibrary();

		const renderer: any = await createSimulator(this, iframe);
		// todo 暂时document对象通过传入的方式，方便调试，后期改成自动获取，打包成js导入到iframe中自动获取
		renderer.run(this._contentDocument.value);
	}
}
