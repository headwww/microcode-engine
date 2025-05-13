import {
	ComponentPublicInstance,
	computed,
	createApp,
	defineComponent,
	h,
	markRaw,
	onUnmounted,
	reactive,
	ref,
	Ref,
	shallowReactive,
	shallowRef,
	watch,
} from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import { AssetLoader, cursor } from '@arvin-shu/microcode-utils';
import {
	I18nMessages,
	IPublicModelDocumentModel,
	IPublicTypeComponentSchema,
	IPublicTypeProjectSchema,
	IPublicTypeRootSchema,
} from '@arvin-shu/microcode-types';
import MicrocodeRenderer, {
	config,
	SchemaParser,
} from '@arvin-shu/microcode-renderer-core';
import { Renderer, SimulatorRendererView } from './simulator-view';
import {
	buildComponents,
	buildUtils,
	compatibleLegaoSchema,
	CompRootHTMLElement,
	createComponentRecord,
	deepMerge,
	exportSchema,
	findDOMNodes,
	getClientRects,
	getClosestNodeInstance,
	getClosestNodeInstanceByComponent,
	getCompRootData,
	getSubComponent,
	isComponentRecord,
	isVNodeHTMLElement,
	parseFileNameToPath,
	setCompRootData,
	setNativeSelection,
} from './utils';
import { ComponentRecord, MixedComponent } from './interface';
import { host } from './host';
import { Leaf, Page, Slot } from './buildin-components';

export type ComponentInstance = ComponentPublicInstance;

interface DocumentInstance {
	readonly id: string;
	readonly key: string;
	readonly path: string;
	readonly scope: Record<string, unknown>;
	readonly document: IPublicModelDocumentModel;
	readonly instancesMap: Map<string, ComponentInstance[]>;
	readonly schema: IPublicTypeRootSchema;
	readonly messages: I18nMessages;
	readonly appHelper: Record<string, unknown>;
	getComponentInstance(id: number): any;
	mountInstance(
		id: string,
		instance: ComponentInstance | HTMLElement
	): (() => void) | void;
	unmountInstance(id: string, instance: ComponentInstance): void;
	rerender(): void;
	getNode(id: string): any;
}

export interface ProjectContext {
	i18n: Record<string, object>;
	appHelper: {
		utils?: Record<string, unknown>;
		constants?: Record<string, unknown>;
		[x: string]: unknown;
	};
	suspense: boolean;
}

function createDocumentInstance(document: any, context: ProjectContext) {
	/** 记录单个节点的组件实例列表 */
	const instancesMap = new Map<string, ComponentInstance[]>();
	/** 记录 vue 组件实例和组件 uid 的映射关系 */
	const vueInstanceMap = new Map<number, ComponentInstance>();

	const timestamp = ref(Date.now());

	const schema = ref<any>(
		exportSchema(document) ?? {
			fileName: '/',
			componentName: 'Page',
		}
	);

	watch(
		() => timestamp.value,
		() => {
			schema.value = exportSchema(document) ?? {
				fileName: '/',
				componentName: 'Page',
			};
		}
	);

	const checkInstanceMounted = (
		instance: ComponentInstance | HTMLElement
	): boolean => ('$' in instance ? instance.$.isMounted : !!instance);

	const setHostInstance = (
		docId: string,
		nodeId: string,
		instances: ComponentInstance[] | null
	) => {
		const instanceRecords = !instances
			? null
			: instances.map((inst) =>
					createComponentRecord(docId, nodeId, inst.$.uid)
				);
		host.setInstance(docId, nodeId, instanceRecords);
	};

	const mountInstance = (
		id: string,
		instanceOrEl: ComponentInstance | HTMLElement
	) => {
		const docId = document.id;
		if (instanceOrEl == null) {
			let instances = instancesMap.get(id);
			if (instances) {
				instances = instances.filter(checkInstanceMounted);
				if (instances.length > 0) {
					instancesMap.set(id, instances);
					setHostInstance(docId, id, instances);
				} else {
					instancesMap.delete(id);
					setHostInstance(docId, id, null);
				}
			}
			return;
		}

		let el: CompRootHTMLElement;
		let instance: ComponentInstance;
		// 如果 instanceOrEl 是 Vue 组件实例
		if ('$' in instanceOrEl) {
			instance = instanceOrEl;
			el = instance.$el; // 获取组件的根 DOM 元素
		}
		// 如果 instanceOrEl 是 VNode 对应的 DOM 元素
		else if (isVNodeHTMLElement(instanceOrEl)) {
			// 获取 VNode 对应的 Vue 组件实例
			instance = instanceOrEl.__vueParentComponent.proxy!;
			// 直接使用 DOM 元素作为根元素
			// @ts-expect-error
			el = instanceOrEl;
		}
		// 其他情况不处理
		else {
			return;
		}

		const origId = getCompRootData(el).nodeId;
		if (origId && origId !== id) {
			// 另外一个节点的 instance 在此被复用了，需要从原来地方卸载
			unmountInstance(origId, instance);
		}

		onUnmounted(() => unmountInstance(id, instance), instance.$);

		setCompRootData(el, {
			nodeId: id,
			docId,
			instance,
		});
		let instances = instancesMap.get(id);
		if (instances) {
			const l = instances.length;
			instances = instances.filter(checkInstanceMounted);
			let updated = instances.length !== l;
			if (!instances.includes(instance)) {
				instances.push(instance);
				updated = true;
			}
			if (!updated) return;
		} else {
			instances = [instance];
		}
		vueInstanceMap.set(instance.$.uid, instance);
		instancesMap.set(id, instances);
		setHostInstance(docId, id, instances);
	};

	const unmountInstance = (id: string, instance: ComponentInstance) => {
		const instances = instancesMap.get(id);
		if (instances) {
			const i = instances.indexOf(instance);
			if (i > -1) {
				const [instance] = instances.splice(i, 1);
				vueInstanceMap.delete(instance.$.uid);
				setHostInstance(document.id, id, instances);
			}
		}
	};

	const getComponentInstance = (id: number) => vueInstanceMap.get(id);

	const getNode = (id: string) => (id ? document.getNode(id) : null);

	return reactive({
		id: computed(() => document.id),
		path: computed(() => parseFileNameToPath(schema.value.fileName ?? '')),
		get key() {
			return `${document.id}:${timestamp.value}`;
		},
		scope: computed(() => ({})),
		schema,
		appHelper: computed(() => {
			const _schema = schema.value;
			const {
				utils: utilsInContext,
				constants: constantsInContext,
				...otherHelpers
			} = context.appHelper;

			return {
				utils: {
					...utilsInContext,
					...buildUtils(host.libraryMap, Reflect.get(_schema, 'utils') ?? []),
				},
				constants: {
					...constantsInContext,
					...Reflect.get(_schema, 'constants'),
				},
				...otherHelpers,
			};
		}),
		document: computed(() => document),
		messages: computed(() =>
			deepMerge(context.i18n, Reflect.get(schema.value, 'i18n'))
		),
		instancesMap: computed(() => instancesMap),
		getNode,
		mountInstance,
		unmountInstance,
		getComponentInstance,
		rerender: () => {
			const now = Date.now();
			if (context.suspense) {
				Object.assign(timestamp, {
					_value: now,
					_rawValue: now,
				});
			} else {
				timestamp.value = now;
			}
			SchemaParser.cleanCachedModules();
		},
	});
}

const loader = new AssetLoader();
const builtinComponents = { Slot, Leaf, Page };

function createSimulatorRenderer() {
	const layout: Ref<any> = shallowRef({});
	const device: Ref<string> = shallowRef('default');
	const locale: Ref<string | undefined> = shallowRef();
	const autoRender = shallowRef(host.autoRender);
	const designMode: Ref<string> = shallowRef('design');
	const libraryMap: Ref<Record<string, string>> = shallowRef({});
	const components: Ref<Record<string, ComponentInstance>> = shallowRef({});
	const componentsMap: Ref<Record<string, MixedComponent>> = shallowRef({});
	const disableCompMock: Ref<boolean | string[]> = shallowRef(true);
	const requestHandlersMap: Ref<Record<string, CallableFunction>> = shallowRef(
		{}
	);
	const documentInstanceMap = new Map<string, DocumentInstance>();
	const documentInstances: Ref<DocumentInstance[]> = shallowRef([]);
	const thisRequiredInJSE: Ref<boolean> = shallowRef(false);

	const context: ProjectContext = shallowReactive({
		i18n: {},
		appHelper: {
			utils: {},
			constants: {},
		},
		suspense: false,
	});

	const disposeFunctions: Array<() => void> = [];

	function _buildComponents() {
		components.value = buildComponents(
			libraryMap.value,
			componentsMap.value,
			createComponent
		);

		components.value = {
			...builtinComponents,
			...components.value,
		} as any;
	}

	function createComponent(
		schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema>
	) {
		const _schema: IPublicTypeProjectSchema<IPublicTypeComponentSchema> = {
			...schema,
			componentsTree: schema.componentsTree.map(compatibleLegaoSchema),
		};

		const componentsTreeSchema = _schema.componentsTree[0];
		if (
			componentsTreeSchema.componentName === 'Component' &&
			componentsTreeSchema.css
		) {
			const doc = window.document;
			const s = doc.createElement('style');
			s.setAttribute('type', 'text/css');
			s.setAttribute('id', `Component-${componentsTreeSchema.id || ''}`);
			s.appendChild(doc.createTextNode(componentsTreeSchema.css || ''));
			doc.getElementsByTagName('head')[0].appendChild(s);
		}
		const renderer = simulator;

		const MicroCodeComponent = defineComponent({
			setup() {
				const messages = _schema.i18n?.messages || {};

				return () => {
					const extraProps = {};
					return h(MicrocodeRenderer, {
						...extraProps,
						locale: renderer.locale.value,
						messages,
						schema: componentsTreeSchema,
						appHelper: renderer.context,
						designMode: renderer.designMode.value,
						device: renderer.device.value,
						components: renderer.components,
						requestHandlersMap: renderer.requestHandlersMap.value,
						thisRequiredInJSE: host.thisRequiredInJSE,
						getNode: (id: any) =>
							renderer.documentInstanceMap.get(id)?.getNode(id),
						onCompGetCtx: (schema: any, inst: any) => {
							renderer.documentInstanceMap
								.get(schema.id!)
								?.mountInstance(schema.id!, inst);
						},
					});
				};
			},
		});

		return MicroCodeComponent;
	}

	const simulator = reactive<any>({
		config: markRaw(config),
		layout,
		device,
		locale,
		designMode,
		libraryMap,
		components,
		autoRender,
		componentsMap,
		disableCompMock,
		documentInstances,
		requestHandlersMap,
		thisRequiredInJSE,
		isSimulatorRenderer: true,
	});

	simulator.app = markRaw(
		createApp(SimulatorRendererView, { rendererContainer: simulator })
	);

	simulator.router = markRaw(
		createRouter({
			history: createMemoryHistory('/'),
			routes: [],
		})
	);

	simulator.getComponent = (componentName: string) => {
		const paths = componentName.split('.');
		const subs: string[] = [];
		// eslint-disable-next-line no-constant-condition
		while (paths.length > 0) {
			const component = components.value?.[componentName];
			if (component) {
				return getSubComponent(component, subs);
			}

			const sub = paths.pop();
			if (!sub) break;
			subs.unshift(sub);
			componentName = paths.join('.');
		}
		return null!;
	};

	simulator.getClosestNodeInstance = (el: ComponentRecord, specId?: string) => {
		if (isComponentRecord(el)) {
			const { cid, did } = el;
			const documentInstance = documentInstanceMap.get(did);
			const instance = documentInstance?.getComponentInstance(cid) ?? null;
			return instance && getClosestNodeInstanceByComponent(instance.$, specId);
		}
		return getClosestNodeInstance(el, specId);
	};

	simulator.findDOMNodes = (instance: ComponentRecord) => {
		if (instance) {
			const { did, cid } = instance;
			const documentInstance = documentInstanceMap.get(did);
			const compInst = documentInstance?.getComponentInstance(cid);
			return compInst ? findDOMNodes(compInst) : null;
		}
		return null;
	};

	simulator.getClientRects = (element: Element | Text) =>
		getClientRects(element);
	simulator.setNativeSelection = (enable: boolean) =>
		setNativeSelection(enable);
	simulator.setDraggingState = (state: boolean) => cursor.setDragging(state);
	simulator.setCopyState = (state: boolean) => cursor.setCopy(state);
	simulator.clearState = () => cursor.release();
	simulator.rerender = () =>
		documentInstances.value.forEach((doc) => doc.rerender());
	simulator.dispose = () => {
		simulator.app.unmount();
		disposeFunctions.forEach((fn) => fn());
	};

	simulator.getCurrentDocument = () => {
		const crr = host.project.currentDocument;
		const docs = documentInstances.value;
		return crr ? (docs.find((doc) => doc.id === crr.id) ?? null) : null;
	};

	simulator.load = (assets: any) => loader.load(assets);
	simulator.loadAsyncLibrary = async (asyncLibraryMap: Record<string, any>) => {
		await loader.loadAsyncLibrary(asyncLibraryMap);
		_buildComponents();
	};

	let running = false;
	simulator.run = () => {
		if (running) return;
		running = true;
		const containerId = 'simulator-app';
		let container = document.getElementById(containerId);
		if (!container) {
			container = document.createElement('div');
			document.body.appendChild(container);
			container.id = containerId;
		}
		document.documentElement.classList.add('engine-page');
		document.body.classList.add('engine-document');
		simulator.app.use(simulator.router).mount(container);
		host.project.setRendererReady(simulator);
	};

	disposeFunctions.push(
		host.connect(simulator, () => {
			const config = host.project.get('config') || {};
			layout.value = config.layout ?? {};
			disableCompMock.value = Array.isArray(config.disableCompMock)
				? config.disableCompMock
				: Boolean(config.disableCompMock);

			// todo: split with others, not all should recompute
			if (
				libraryMap.value !== host.libraryMap ||
				componentsMap.value !== host.designer.componentsMap
			) {
				libraryMap.value = host.libraryMap || {};
				componentsMap.value = host.designer.componentsMap;
				_buildComponents();
			}

			locale.value = host.locale;

			// sync device
			device.value = host.device;

			// sync designMode
			designMode.value = host.designMode;

			// sync requestHandlersMap
			requestHandlersMap.value = host.requestHandlersMap ?? {};

			thisRequiredInJSE.value = host.thisRequiredInJSE ?? false;

			documentInstances.value.forEach((doc) => doc.rerender());
		})
	);

	disposeFunctions.push(
		host.watchEffect(async () => {
			const { router } = simulator;

			documentInstances.value = host.project.documents.map((doc: any) => {
				let documentInstance: any = documentInstanceMap.get(doc.id);
				if (!documentInstance) {
					documentInstance = createDocumentInstance(
						{
							id: doc.id,
							getNode: doc?.getNode?.bind(doc),
							export: doc?.export?.bind(doc),
							exportSchema: doc?.exportSchema?.bind(doc),
						},
						context
					) as any;
					documentInstanceMap.set(doc.id, documentInstance as any);
				} else if (router.hasRoute(documentInstance.id)) {
					router.removeRoute(documentInstance.id);
				}
				router.addRoute({
					name: documentInstance.id,
					path: documentInstance.path,
					meta: {},
					component: Renderer,
					props: ((doc, sim) => () => ({
						simulator: sim,
						documentInstance: doc,
					}))(documentInstance, simulator),
				});
				return documentInstance;
			});

			router.getRoutes().forEach((route: any) => {
				const id = route.name as string;
				const hasDoc = documentInstances.value.some((doc) => doc.id === id);
				if (!hasDoc) {
					router.removeRoute(id);
					documentInstanceMap.delete(id);
				}
			});
			// TODO:切换documents用 路由切换实现不同的协议的加载， 先不考虑路由切换会出现无限循环的问题
			// const inst = simulator.getCurrentDocument();
			// if (inst) {
			// 	try {
			// 		context.suspense = true;
			// 		await router.replace({ name: inst.id, force: true });
			// 	} finally {
			// 		context.suspense = false;
			// 	}
			// }
		})
	);

	host.componentsConsumer.consume(async (componentsAsset: any) => {
		if (componentsAsset) {
			await loader.load(componentsAsset);
			_buildComponents();
		}
	});

	host.injectionConsumer.consume((data: any) => {
		if (data.appHelper) {
			const { utils, constants, ...others } = data.appHelper;
			Object.assign(context.appHelper, {
				utils: Array.isArray(utils)
					? buildUtils(host.libraryMap, utils)
					: (utils ?? {}),
				constants: constants ?? {},
				...others,
			});
		}
		context.i18n = data.i18n ?? {};
	});

	return simulator;
}

export default createSimulatorRenderer();
