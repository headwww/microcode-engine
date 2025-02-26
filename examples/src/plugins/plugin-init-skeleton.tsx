import { WalletFilled } from '@ant-design/icons-vue';
import {
	IPublicEnumTransformStage,
	IPublicModelPluginContext,
} from '@arvin-shu/microcode-types';
import { Button } from 'ant-design-vue';

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
					}}
				>
					保存
				</Button>
			),
		});

		skeleton.add({
			area: 'leftArea',
			type: 'Dock',
			name: 'opener',
			props: {
				icon: <WalletFilled />, // Icon 组件实例
				align: 'bottom',
				onClick() {
					// 打开外部链接
					window.open('http://www.ltscm.com.cn/');
				},
			},
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
