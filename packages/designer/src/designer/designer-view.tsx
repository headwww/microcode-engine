import { defineComponent, PropType } from 'vue';
import { Designer } from './designer';
import { ProjectView } from '../project';

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
		return () => (
			<div class="mtc-designer">
				<ProjectView designer={designer} />
			</div>
		);
	},
});
