import { DesignerView } from '@arvin/microcode-designer';
import { Editor } from '@arvin/microcode-editor-core';
import { defineComponent, PropType } from 'vue';

export const DesignerPlugin = defineComponent({
	name: 'DesignerPlugin',
	props: {
		engineEditor: Object as PropType<Editor>,
	},
	setup(props) {
		return () => {
			const { engineEditor } = props;
			return (
				<DesignerView
					designer={engineEditor?.get('designer')}
					class="microcode-plugin-designer"
				></DesignerView>
			);
		};
	},
});
