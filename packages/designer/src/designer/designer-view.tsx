import { defineComponent, PropType } from 'vue';
import { Designer, designerProps } from './designer';
import { ProjectView } from '../project';
import { DragGhost as BuiltinDragGhostComponent } from './drag-ghost';

export const DesignerView = defineComponent({
	name: 'DesignerView',
	props: {
		...designerProps,
		designer: Object as PropType<Designer>,
	},
	setup(props) {
		let { designer } = props;
		const { ...designerProps } = props;
		if (designer) {
			designer.setProps(designerProps);
		} else {
			designer = new Designer(designerProps);
		}

		return () => {
			const DragGhost = BuiltinDragGhostComponent;

			return (
				<div class={['mtc-designer', props.className]}>
					<DragGhost designer={designer} />
					<ProjectView designer={designer} />
				</div>
			);
		};
	},
});
