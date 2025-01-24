import {
	App,
	ComponentPublicInstance,
	createApp,
	markRaw,
	nextTick,
	onUnmounted,
	Ref,
	shallowRef,
} from 'vue';
import { createMemoryHistory, createRouter, type Router } from 'vue-router';
import { Renderer, SimulatorRendererView } from './renderer-view';
import { host } from './host';
import {
	CompRootHTMLElement,
	createComponentRecord,
	findDOMNodes,
	getClientRects,
	getClosestNodeInstance,
	getClosestNodeInstanceByComponent,
	getCompRootData,
	isComponentRecord,
	isVNodeHTMLElement,
	setCompRootData,
	buildComponents,
	getSubComponent,
} from './utils';
import {
	ComponentRecord,
	MixedComponent,
	SimulatorViewLayout,
} from './interface';
import { Slot, Leaf, Page } from './buildin-components';

const builtinComponents = { Slot, Leaf, Page };

/**
 * 检查实例是否已挂载
 * @param instance 组件实例或DOM元素
 * @returns 是否已挂载
 */
const checkInstanceMounted = (
	instance: ComponentPublicInstance | HTMLElement
): boolean => ('$' in instance ? instance.$.isMounted : !!instance);

export class DocumentInstance {
	/** 记录单个节点的组件实例列表 */
	instancesMap = new Map<string, ComponentPublicInstance[]>();

	/** 记录 vue 组件实例和组件 uid 的映射关系 */
	vueInstanceMap = new Map<number, ComponentPublicInstance>();

	get id() {
		return this.document.id;
	}

	get schema(): any {
		return this.document.export('render');
	}

	get path(): string {
		return `/${this.document.fileName}`;
	}

	getNode(id: string) {
		return this.document.getNode(id);
	}

	// eslint-disable-next-line no-useless-constructor
	constructor(
		readonly container: SimulatorRendererContainer,
		readonly document: any
	) {
		//
	}

	setHostInstance = (
		docId: string,
		nodeId: string,
		instances: ComponentPublicInstance[] | null
	) => {
		const instanceRecords = !instances
			? null
			: instances.map((inst) =>
					createComponentRecord(docId, nodeId, inst.$.uid)
				);
		host.setInstance(docId, nodeId, instanceRecords);
	};

	mountInstance(
		id: string,
		instanceOrEl: ComponentPublicInstance | HTMLElement
	) {
		const docId = this.document.id;

		if (instanceOrEl == null) {
			let instances = this.instancesMap.get(id);
			if (instances) {
				instances = instances.filter(checkInstanceMounted);
				if (instances.length > 0) {
					this.instancesMap.set(id, instances);
					this.setHostInstance(docId, id, instances);
				} else {
					this.instancesMap.delete(id);
					this.setHostInstance(docId, id, null);
				}
			}
			return;
		}

		let el: CompRootHTMLElement;
		let instance: ComponentPublicInstance;
		// 如果 instanceOrEl 是 Vue 组件实例
		if ('$' in instanceOrEl) {
			instance = instanceOrEl;
			el = instance.$el; // 获取组件的根 DOM 元素
		}
		// 如果 instanceOrEl 是 VNode 对应的 DOM 元素
		else if (isVNodeHTMLElement(instanceOrEl)) {
			// 获取 VNode 对应的 Vue 组件实例
			// @ts-ignore
			instance = instanceOrEl.__vueParentComponent.proxy!;
			// 直接使用 DOM 元素作为根元素
			// @ts-ignore
			el = instanceOrEl;
		}
		// 其他情况不处理
		else {
			return;
		}

		const origId = getCompRootData(el).nodeId;
		if (origId && origId !== id) {
			// 另外一个节点的 instance 在此被复用了，需要从原来地方卸载
			this.unmountInstance(origId, instance);
		}
		// 组件卸载时自动调用unmountInstance方法
		onUnmounted(() => this.unmountInstance(id, instance), instance.$);

		// 设置组件根节点的关键数据
		setCompRootData(el, {
			nodeId: id,
			docId,
			instance,
		});

		// 获取当前节点ID对应的组件实例数组
		let instances = this.instancesMap.get(id);
		if (instances) {
			// 记录原始长度
			const l = instances.length;
			// 过滤掉已卸载的实例
			instances = instances.filter(checkInstanceMounted);
			// 判断实例数组是否有变化
			let updated = instances.length !== l;
			// 如果当前实例不在数组中,则添加进去
			if (!instances.includes(instance)) {
				instances.push(instance);
				updated = true;
			}
			// 如果没有更新则直接返回
			if (!updated) return;
		} else {
			// 如果没有实例数组则创建新的
			instances = [instance];
		}
		// 将组件实例保存到映射表中
		this.vueInstanceMap.set(instance.$.uid, instance);
		this.instancesMap.set(id, instances);
		// 通知宿主环境实例变化
		this.setHostInstance(docId, id, instances);
	}

	/**
	 * 卸载组件实例
	 * @param id 组件节点ID
	 * @param instance 组件实例
	 */
	private unmountInstance(id: string, instance: ComponentPublicInstance) {
		// 获取节点对应的实例数组
		const instances = this.instancesMap.get(id);
		if (instances) {
			// 查找当前实例的索引
			const i = instances.indexOf(instance);
			if (i > -1) {
				// 从数组中移除实例
				const [instance] = instances.splice(i, 1);
				// 从映射表中删除实例
				this.vueInstanceMap.delete(instance.$.uid);
				// 通知宿主环境实例变化
				this.setHostInstance(this.document.id, id, instances);
			}
		}
	}

	getComponentInstance(cid: number) {
		return this.vueInstanceMap.get(cid);
	}
}

export class SimulatorRendererContainer {
	private _running = false;

	private _documentInstances = shallowRef<DocumentInstance[]>([]);

	private router: Router;

	get documentInstances() {
		return this._documentInstances.value;
	}

	private _components: Ref<Record<string, ComponentPublicInstance>> =
		shallowRef({});

	get components() {
		return this._components.value;
	}

	private documentInstanceMap = new Map<string, DocumentInstance>();

	private layout: Ref<SimulatorViewLayout> = shallowRef({});

	private disableCompMock: Ref<boolean | string[]> = shallowRef(true);

	private libraryMap: Ref<Record<string, string>> = shallowRef({});

	private componentsMap: Ref<Record<string, MixedComponent>> = shallowRef({});

	private device: Ref<string> = shallowRef('default');

	private locale: Ref<string | undefined> = shallowRef();

	private designMode: Ref<boolean> = shallowRef(false);

	private requestHandlersMap: Ref<Record<string, CallableFunction>> =
		shallowRef({});

	private thisRequiredInJSE: Ref<boolean> = shallowRef(false);

	private disposeFunctions: Array<() => void> = [];

	private app: App<any>;

	constructor() {
		this.router = markRaw(
			createRouter({
				history: createMemoryHistory('/'),
				routes: [],
			})
		);

		this.app = markRaw(
			createApp(SimulatorRendererView, {
				rendererContainer: this,
			})
		);

		this.disposeFunctions.push(
			host.connect(this, () => {
				const config = host.project.get('config') || {};
				this.layout = config.layout ?? {};

				this.disableCompMock.value = Array.isArray(config.disableCompMock)
					? config.disableCompMock
					: Boolean(config.disableCompMock);
				if (
					this.libraryMap.value !== host.libraryMap ||
					this.componentsMap.value !== host.designer.componentsMap
				) {
					this.libraryMap.value = host.libraryMap || {};
					this.componentsMap.value = host.designer.componentsMap;
					this.buildComponents();
				}

				this.locale.value = host.locale;

				this.device.value = host.device;

				this.designMode.value = host.designMode;

				this.requestHandlersMap.value = host.requestHandlersMap ?? {};

				this.thisRequiredInJSE.value = host.thisRequiredInJSE ?? false;
			})
		);

		this.disposeFunctions.push(
			host.watch(
				() => host.project.documents,
				async () => {
					this._documentInstances.value = host.project.documents.map(
						(doc: any) => {
							let inst = this.documentInstanceMap.get(doc.id);
							if (!inst) {
								inst = new DocumentInstance(this, doc);
								this.documentInstanceMap.set(doc.id, inst);
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
									simulator: this,
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
							this.documentInstanceMap.delete(id);
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
			)
		);

		host.componentsConsumer.consume(async (componentsAsset: any) => {
			if (componentsAsset) {
				// TODO
				//   await this.load(componentsAsset);
				//   this.buildComponents();
			}
		});
	}

	private buildComponents() {
		// TODO 第三个参数创建低代码函数的方式没有创建
		this._components.value = buildComponents(
			this.libraryMap.value,
			this.componentsMap.value
		);
		this._components.value = {
			...builtinComponents,
			...this._components.value,
		} as any;
	}

	getCurrentDocument() {
		const crr = host.project.currentDocument;
		const docs = this.documentInstances;
		return crr ? (docs.find((doc) => doc.id === crr.id) ?? null) : null;
	}

	/**
	 * 根据组件名称获取组件实例
	 * 支持通过点号获取子组件,例如:
	 * - "Button" 获取Button组件
	 * - "Form.Item" 获取Form组件下的Item子组件
	 * @param componentName 组件名称,支持通过点号获取子组件
	 * @returns 返回对应的组件实例,如果未找到则返回null
	 */
	getComponent(componentName: string) {
		const paths = componentName.split('.');
		const subs: string[] = [];

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const component = this._components.value?.[componentName];
			if (component) {
				return getSubComponent(component, subs);
			}

			const sub = paths.pop();
			if (!sub) {
				return null;
			}
			subs.unshift(sub);
			componentName = paths.join('.');
		}
	}

	getClientRects(element: Element | Text) {
		return getClientRects(element);
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
		this.app.use(this.router).mount(container);

		host.project.setRendererReady(this);
	}

	findDOMNodes(instance: ComponentRecord): Array<Element | Text> | null {
		if (instance) {
			const { did, cid } = instance;
			const documentInstance = this.documentInstanceMap.get(did);
			const compInst = documentInstance?.getComponentInstance(cid);
			return compInst ? findDOMNodes(compInst) : null;
		}
		return null;
	}

	getClosestNodeInstance(el: ComponentRecord, specId?: string) {
		if (isComponentRecord(el)) {
			const { cid, did } = el;
			const documentInstance = this.documentInstanceMap.get(did);
			const instance = documentInstance?.getComponentInstance(cid) ?? null;
			return instance && getClosestNodeInstanceByComponent(instance.$, specId);
		}
		return getClosestNodeInstance(el, specId);
	}

	dispose() {
		this.app.unmount();
		this.disposeFunctions.forEach((fn) => fn());
	}
}

export default new SimulatorRendererContainer();
