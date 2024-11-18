import { DesignerView } from '@arvin-shu/microcode-designer';
import { Editor } from '@arvin-shu/microcode-editor-core';
import { defineComponent, onMounted, PropType, reactive } from 'vue';

export const DesignerPlugin = defineComponent({
	name: 'DesignerPlugin',
	props: {
		engineEditor: Object as PropType<Editor>,
	},
	setup(props) {
		const { engineEditor: editor } = props;

		const simulatorProps = reactive({
			library: null,
		});

		onMounted(() => {
			editor?.onceGot('assets').then(({ packages }) => {
				simulatorProps.library = packages;
			});
		});

		return () => (
			<DesignerView
				designer={editor?.get('designer')}
				className="microcode-plugin-designer"
				simulatorProps={simulatorProps}
			></DesignerView>
		);
	},
});
