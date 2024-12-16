import { createApp, markRaw, nextTick, ref } from 'vue';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { Renderer, SimulatorRendererView } from './renderer-view';
import { host } from './host';

export class DocumentInstance {
	get id() {
		return this.document.id;
	}

	get schema(): any {
		return this.document.export('render');
	}

	get path(): string {
		return `/${this.document.fileName}`;
	}

	// eslint-disable-next-line no-useless-constructor
	constructor(
		readonly container: SimulatorRendererContainer,
		readonly document: any
	) {
		//
	}
}

export class SimulatorRendererContainer {
	private _running = false;

	private _documentInstances = ref<DocumentInstance[]>([]);

	private router: Router;

	get documentInstances() {
		return this._documentInstances.value;
	}

	constructor() {
		this.router = markRaw(
			createRouter({
				history: createMemoryHistory('/'),
				routes: [],
			})
		);

		const documentInstanceMap = new Map<string, DocumentInstance>();

		host.watch(
			() => host.project.documents,
			async () => {
				this._documentInstances.value = host.project.documents.map(
					(doc: any) => {
						let inst = documentInstanceMap.get(doc.id);
						if (!inst) {
							inst = new DocumentInstance(this, doc);
							documentInstanceMap.set(doc.id, inst);
						} else if (this.router.hasRoute(inst.id)) {
							this.router.removeRoute(inst.id);
						}
						this.router.addRoute({
							name: inst.id,
							path: inst.path,
							// TODO 需要处理meta
							component: Renderer,
							props: ((doc) => () => ({
								documentInstance: doc,
							}))(inst),
						});
						return inst;
					}
				);

				this.router.getRoutes().forEach((route) => {
					const id = route.name as string;
					const hasDoc = this.documentInstances.some((doc) => doc.id === id);
					if (!hasDoc) {
						this.router.removeRoute(id);
						documentInstanceMap.delete(id);
					}
				});
				const inst = this.getCurrentDocument();
				if (inst) {
					await nextTick(() => {
						this.router.replace({ name: inst.id, force: true });
					});
				}
			},
			{
				immediate: true,
			}
		);
	}

	getCurrentDocument() {
		const crr = host.project.currentDocument;
		const docs = this.documentInstances;
		return crr ? (docs.find((doc) => doc.id === crr.id) ?? null) : null;
	}

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
		createApp(SimulatorRendererView, {
			rendererContainer: this,
		})
			.use(this.router)
			.mount(container);
	}

	dispose() {}
}

export default new SimulatorRendererContainer();
