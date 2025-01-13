/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2024-11-06 10:16:24
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-01-07 15:28:24
 * @FilePath: /microcode-engine/packages/designer/src/designer/designer-view.tsx
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { defineComponent, onMounted, PropType, h } from 'vue';
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
			const { dragGhostComponent, className, style } = props;
			const DragGhost = dragGhostComponent || BuiltinDragGhostComponent;

			return (
				<div class={['mtc-designer', className]} style={style}>
					{h(DragGhost, { designer })}
					<ProjectView designer={designer} />
				</div>
			);
		};
	},
});
