import { defineComponent, onMounted, PropType } from 'vue';
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

		onMounted(() => {
			const { onMount } = props;
			if (onMount) {
				onMount(designer);
			}
			designer.postEvent('mount', designer);
		});

		return () => {
			const DragGhost = BuiltinDragGhostComponent;

			return (
				<div class={['mtc-designer', props.className]} style={props.style}>
					<DragGhost designer={designer} />
					<ProjectView designer={designer} />
				</div>
			);
		};
	},
});
