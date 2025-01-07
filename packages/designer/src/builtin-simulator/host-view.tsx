import {
	defineComponent,
	PropType,
	ref,
	onMounted,
	onBeforeUnmount,
} from 'vue';
import { Project } from '../project';
import {
	BuiltinSimulatorHost,
	builtinSimulatorProps,
	BuiltinSimulatorProps,
} from './host';
import { Designer } from '../designer';
import { BemTools } from './bem-tools';

export const BuiltinSimulatorHostView = defineComponent({
	name: 'BuiltinSimulatorHostView',
	props: {
		...builtinSimulatorProps,
		project: Object as PropType<Project>,
		designer: Object as PropType<Designer>,
		onMount: Function as PropType<(host: BuiltinSimulatorHost) => void>,
	},
	setup(props: BuiltinSimulatorProps) {
		const { project, designer, onMount } = props;
		const host = new BuiltinSimulatorHost(project!, designer!);
		host.setProps(props);
		onMount?.(host);
		return () => (
			<div className="mtc-simulator">
				<Canvas host={host} />
			</div>
		);
	},
});

export const Canvas = defineComponent({
	props: {
		host: Object as PropType<BuiltinSimulatorHost>,
	},
	setup(props) {
		const sim = props.host;
		const viewportRef = ref<HTMLDivElement | null>(null);

		onMounted(() => {
			if (viewportRef.value) {
				sim?.mountViewport(viewportRef.value);
			}
		});

		// TODO deviceStyle 用来设置设备样式设置为浏览器还是手机还是平板

		return () => (
			<div className="mtc-simulator-canvas mtc-simulator-device-default">
				<div class="mtc-simulator-canvas-viewport" ref={viewportRef}>
					<BemTools host={sim} />
					<Content host={sim} />
				</div>
			</div>
		);
	},
});

export const Content = defineComponent({
	props: {
		host: Object as PropType<BuiltinSimulatorHost>,
	},
	setup(props) {
		const disabledEvents = ref(false);

		let dispose: () => void;

		onMounted(() => {
			const { editor } = props.host!.designer;
			const onEnableEvents = (type: boolean) => {
				disabledEvents.value = type;
			};

			editor.eventBus.on(
				'designer.builtinSimulator.disabledEvents',
				onEnableEvents
			);

			dispose = () => {
				editor.removeListener(
					'designer.builtinSimulator.disabledEvents',
					onEnableEvents
				);
			};
		});

		onBeforeUnmount(() => {
			dispose?.();
		});
		const iframeRef = ref<HTMLIFrameElement>();

		onMounted(() => {
			if (iframeRef.value) {
				props.host?.mountContentFrame(iframeRef.value);
			}
		});

		return () => {
			const { host } = props;
			const { viewport, designer } = host!;

			const frameStyle: any = {
				transform: `scale(${viewport.scale})`,
				height: `${viewport.contentHeight}px`,
				width: `${viewport.contentWidth}px`,
			};

			return (
				<div class="mtc-simulator-content">
					<iframe
						name={`${designer.viewName}-SimulatorRenderer`}
						class="mtc-simulator-content-frame"
						style={frameStyle}
						ref={iframeRef}
					/>
				</div>
			);
		};
	},
});
