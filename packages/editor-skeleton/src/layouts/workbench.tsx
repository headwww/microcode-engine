import { defineComponent, PropType, provide } from 'vue';
import { TipContainer } from '@arvin-shu/microcode-editor-core';
import { EditorConfig, PluginClassSet } from '@arvin-shu/microcode-types';
import { ISkeleton, SkeletonKey } from '../skeleton';
import { TopArea } from './top-area';
import { LeftArea } from './left-area';
import { MainArea } from './main-area';
import { RightArea } from './right-area';
import { LeftFloatPane } from './left-float-pane';
import { LeftFixedPane } from './left-fixed-pane';
import { Toolbar } from './toolbar';
import { BottomArea } from './bottom-area';

export const Workbench = defineComponent({
	name: 'Workbench',
	props: {
		skeleton: Object as PropType<ISkeleton>,
		config: Object as PropType<EditorConfig>,
		components: Object as PropType<PluginClassSet>,
		className: String,
		topAreaItemClassName: String,
	},
	setup(props) {
		props.skeleton?.buildFromConfig(props.config, props.components);

		provide(SkeletonKey, props.skeleton!);

		return () => (
			<div class={['mtc-workbench', props.className]}>
				<TopArea
					area={props.skeleton?.topArea}
					itemClassName={props.topAreaItemClassName}
				></TopArea>
				<div class="mtc-workbench-body">
					<LeftArea area={props.skeleton?.leftArea}></LeftArea>
					<LeftFloatPane area={props.skeleton?.leftFloatArea}></LeftFloatPane>
					<LeftFixedPane area={props.skeleton?.leftFixedArea}></LeftFixedPane>
					<div class="mtc-workbench-center">
						<Toolbar area={props.skeleton?.toolbar} />
						<MainArea area={props.skeleton?.mainArea}></MainArea>
						<BottomArea area={props.skeleton?.bottomArea}></BottomArea>
					</div>
					<RightArea area={props.skeleton?.rightArea}></RightArea>
				</div>
				<TipContainer></TipContainer>
			</div>
		);
	},
});
