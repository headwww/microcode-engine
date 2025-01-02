import { defineComponent, PropType, ref, onMounted } from 'vue';
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

		return () => (
			<div className="mtc-simulator-canvas mtc-simulator-device-default">
				<div class="mtc-simulator-canvas-viewport" ref={viewportRef}>
					<BemTools host={sim} />
					<Content host={sim}></Content>
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
		return () => {
			const { host } = props;

			return (
				<div class="mtc-simulator-content">
					<iframe
						class="mtc-simulator-content-frame"
						onload={(event: any) => {
							const frame = event.target as HTMLIFrameElement;
							host?.mountContentFrame(frame);
						}}
					/>
				</div>
			);
		};
	},
});
