import { defineComponent, PropType } from 'vue';
import { Project } from '../project';
import {
	BuiltinSimulatorHost,
	builtinSimulatorProps,
	BuiltinSimulatorProps,
} from './host';
import { Designer } from '../designer';

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
		return () => (
			<div class="mtc-simulator-canvas">
				<div
					class="mtc-simulator-canvas-viewport mtc-simulator-device-default"
					ref={(elem: any) => {
						sim?.mountViewport(elem);
					}}
				>
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
