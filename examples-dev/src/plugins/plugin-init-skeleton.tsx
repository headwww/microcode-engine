import {
	IPublicEnumTransformStage,
	IPublicModelPluginContext,
} from '@arvin-shu/microcode-types';
import { Button } from 'ant-design-vue';
import { Preview } from './preview';

const InitSkeleton = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { skeleton, project } = ctx;

		skeleton.add({
			name: 'DemoSkeleton',
			area: 'topArea',
			type: 'Widget',
			content: <div>DemoPane</div>,
		});
		skeleton.add({
			name: 'topArea-widget-right',
			area: 'topArea',
			type: 'Widget',
			content: (
				<Button
					type={'primary'}
					onClick={() => {
						console.log(project.exportSchema(IPublicEnumTransformStage.Save));
						localStorage.setItem(
							'lt_microcode_project',
							JSON.stringify(
								project.exportSchema(IPublicEnumTransformStage.Save)
							)
						);
					}}
				>
					保存
				</Button>
			),
		});

		skeleton.add({
			name: 'preview',
			area: 'topArea',
			type: 'Widget',
			content: <Preview />,
		});

		// skeleton.add({
		// 	name: 'leftArea-PaneDock-1',
		// 	area: 'leftArea',
		// 	type: 'PanelDock',
		// 	props: {
		// 		icon: <PartitionOutlined />,
		// 	},
		// 	content: <div>大纲树内容</div>,
		// 	panelProps: {
		// 		title: '大纲树',
		// 	},
		// });
	},
});

InitSkeleton.pluginName = 'DefaultSkeleton';

export default InitSkeleton;
