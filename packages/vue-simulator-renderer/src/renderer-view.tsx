import { defineComponent } from 'vue';
import { Renderer as MicrocodeRenderer } from '@arvin-shu/microcode-renderer-core';

export default defineComponent({
	setup() {
		const components = {
			MyButton,
		};

		const schema = {
			componentName: 'MyButton',
			id: 'node_ocm3gxtp4a1',
			props: {
				type: 'primary',
			},
		};

		return () => (
			<MicrocodeRenderer
				class="tstststs"
				schema={schema as any}
				components={components}
				style={{ background: '#fff' }}
			></MicrocodeRenderer>
		);
	},
});

const MyButton = defineComponent({
	name: 'MyButton',
	setup() {
		return () => <button>Button</button>;
	},
});
