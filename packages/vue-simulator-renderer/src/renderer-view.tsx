/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-13 17:38:59
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2024-11-18 21:44:41
 * @FilePath: /microcode-engine/packages/vue-simulator-renderer/src/renderer-view.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
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
