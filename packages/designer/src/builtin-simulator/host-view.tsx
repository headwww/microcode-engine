import { defineComponent } from 'vue';

export const BuiltinSimulatorHostView = defineComponent({
	name: 'BuiltinSimulatorHostView',
	setup() {
		return () => (
			<div className="mtc-simulator">
				<Canvas />
			</div>
		);
	},
});

export const Canvas = defineComponent({
	setup() {
		return () => (
			<div class="mtc-simulator-canvas">
				<div class="mtc-simulator-canvas-viewport mtc-simulator-device-default">
					<Content></Content>
				</div>
			</div>
		);
	},
});

export const Content = defineComponent({
	setup() {
		return () => (
			<div class="mtc-simulator-content">
				<iframe class="mtc-simulator-content-frame" />
			</div>
		);
	},
});
