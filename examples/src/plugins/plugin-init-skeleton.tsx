import {
	DatabaseOutlined,
	PartitionOutlined,
	SlackOutlined,
} from '@ant-design/icons-vue';
import { IPublicModelPluginContext } from '@arvin-shu/microcode-types';
import { Button } from 'ant-design-vue';
import { ComponentPane } from './ComponentPane';

const InitSkeleton = (ctx: IPublicModelPluginContext) => ({
	async init() {
		const { skeleton } = ctx;
		skeleton.add({
			name: 'topArea-widget-right',
			area: 'topArea',
			type: 'Widget',
			content: <Button type={'primary'}>保存</Button>,
		});

		skeleton.add({
			name: 'leftArea-PaneDock-1',
			area: 'leftArea',
			type: 'PanelDock',
			props: {
				icon: <PartitionOutlined />,
			},
			content: <div>大纲树内容</div>,
			panelProps: {
				title: '大纲树',
			},
		});
		skeleton.add({
			name: 'leftArea-PaneDock-2',
			area: 'leftArea',
			type: 'PanelDock',
			props: {
				icon: <SlackOutlined />,
			},
			content: <ComponentPane></ComponentPane>,
			panelProps: {
				title: '组件',
			},
		});
		skeleton.add({
			name: 'leftArea-PaneDock-3',
			area: 'leftArea',
			type: 'PanelDock',
			props: {
				icon: <DatabaseOutlined />,
			},
			content: <div>数据源</div>,
			panelProps: {
				title: '数据源',
			},
		});
	},
});

InitSkeleton.pluginName = 'DefaultSkeleton';

export default InitSkeleton;
