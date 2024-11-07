import { defineComponent, PropType } from 'vue';
import { Designer } from './designer';

export const DesignerView = defineComponent({
	name: 'DesignerView',
	props: {
		designer: Object as PropType<Designer>,
	},
	setup(props) {
		let designer;
		const { designer: propsDesigner } = props;
		if (propsDesigner) {
			designer = propsDesigner;
		} else {
			designer = new Designer();
		}

		designer;
		return () => <div class="mtc-designer">超级面板</div>;
	},
});
