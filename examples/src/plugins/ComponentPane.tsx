import { IEditor } from '@arvin/microcode-editor-core';
import { defineComponent, onMounted, PropType } from 'vue';

export const ComponentPane = defineComponent({
	name: 'ComponentPane',
	props: {
		editor: Object as PropType<IEditor>,
	},
	setup(props) {
		const { material } = window.ArvinMicrocodeEngine;

		const isNewEngineVersion = !!material;

		onMounted(() => {
			const { editor } = props;
			if (!editor) {
				initComponentList();
				return;
			}
			const assets = isNewEngineVersion
				? material.getAssets()
				: editor.get('assets');
			if (assets) {
				initComponentList();
			} else {
				// eslint-disable-next-line no-console
				console.warn('[ComponentsPane]:资产包为准备就绪');
			}
		});

		/**
		 * 初始化组件列表
		 */
		function initComponentList() {
			const { editor } = props;
			const rawData = isNewEngineVersion
				? material.getAssets()
				: editor?.get('assets');

			console.log(rawData);
		}

		return () => <div>组件</div>;
	},
});
