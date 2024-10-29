import { defineComponent, PropType } from 'vue';
import { TipContainer } from '@arvin/microcode-editor-core';
import { ISkeleton } from '../skeleton';
import { TopArea } from './top-area';
import { LeftArea } from './left-area';
import { MainArea } from './main-area';
import { RightArea } from './right-area';
import { LeftFloatPane } from './left-float-pane';

export const Workbench = defineComponent({
	name: 'Workbench',
	props: {
		className: String,
		skeleton: Object as PropType<ISkeleton>,
		topAreaItemClassName: String,
	},
	setup(props) {
		return () => {
			const { className, skeleton, topAreaItemClassName } = props;
			return (
				<div class={['mtc-workbench', className]}>
					<TopArea
						area={skeleton?.topArea}
						itemClassName={topAreaItemClassName}
					></TopArea>
					<div class="mtc-workbench-body">
						<LeftArea area={skeleton?.leftArea}></LeftArea>
						<LeftFloatPane area={skeleton?.leftFloatArea}></LeftFloatPane>
						<div class="mtc-workbench-center">
							<MainArea></MainArea>
						</div>
						<RightArea></RightArea>
					</div>
					<TipContainer></TipContainer>
				</div>
			);
		};
	},
});
