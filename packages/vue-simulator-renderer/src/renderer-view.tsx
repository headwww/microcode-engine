import { defineComponent } from 'vue';
import { Renderer as MicrocodeRenderer } from '@arvin-shu/microcode-renderer-core';
import { Button } from 'ant-design-vue';

export default defineComponent({
	setup() {
		const components = {
			Button,
		};

		const schema = {
			componentName: 'Button',
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
