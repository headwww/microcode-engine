import { DesignerView } from '@arvin-shu/microcode-designer';
import { Editor, engineConfig } from '@arvin-shu/microcode-editor-core';
import { defineComponent, PropType, reactive } from 'vue';

export const DesignerPlugin = defineComponent({
	name: 'DesignerPlugin',
	props: {
		engineEditor: Object as PropType<Editor>,
	},
	setup(props) {
		const { engineEditor: editor } = props;

		const simulatorProps = reactive({
			library: null,
			simulatorUrl: null,
		});

		async function setupAssets() {
			const assets = await editor?.onceGot('assets');
			// 获取资源库
			simulatorProps.library = assets.packages;
			// 获取模拟器地址
			simulatorProps.simulatorUrl =
				engineConfig.get('simulatorUrl') || editor?.get('simulatorUrl');
		}

		setupAssets();

		return () => {
			if (!simulatorProps.library) {
				return null;
			}

			return (
				<DesignerView
					className="microcode-plugin-designer"
					designer={editor?.get('designer')}
					simulatorProps={simulatorProps}
				></DesignerView>
			);
		};
	},
});
