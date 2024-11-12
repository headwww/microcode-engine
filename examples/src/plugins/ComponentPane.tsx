import { IEditor } from '@arvin/microcode-editor-core';
import { CSSProperties, defineComponent, onMounted, PropType, ref } from 'vue';

export const ComponentPane = defineComponent({
	name: 'ComponentPane',
	props: {
		editor: Object as PropType<IEditor>,
	},
	setup(props) {
		const { material, canvas } = window.ArvinMicrocodeEngine;

		const shell = ref<HTMLDivElement>();

		const isNewEngineVersion = !!material;

		onMounted(() => {
			// 绑定布局
			canvas.dragon.from(shell.value, (e: Event) => {
				e;
				return {
					type: 'nodedata',
					data: {
						componentName: 'Button',
						props: {
							type: 'primary',
						},
					},
				};
			});

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

		return () => (
			<div ref={shell}>
				<div
					style={
						{
							background: '#989898',
							height: '130px',
							width: '130px',
							cursor: 'pointer',
						} as CSSProperties
					}
				></div>
			</div>
		);
	},
});
