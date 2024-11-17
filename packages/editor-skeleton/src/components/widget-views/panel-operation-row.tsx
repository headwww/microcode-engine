import {
	CloseOutlined,
	PushpinOutlined,
	PushpinTwoTone,
} from '@ant-design/icons-vue';
import { Button } from 'ant-design-vue';
import { defineComponent, h, PropType } from 'vue';
import { Panel } from '../..';

export const PanelOperationRow = defineComponent({
	name: 'PanelOperationRow',
	props: {
		panel: Object as PropType<Panel>,
	},
	setup(props) {
		function setDisplay() {
			const { panel } = props;
			const current = panel;
			if (!current) {
				return;
			}
			panel.skeleton.toggleFloatStatus(panel);
		}

		return () => {
			const { panel } = props;
			const isRightArea = panel?.config?.area === 'rightArea';
			if (isRightArea) {
				return <></>;
			}

			let canSetFixed = true;
			if (panel?.config.props?.canSetFixed === false) {
				canSetFixed = false;
			}

			const hideTitleBar = panel?.config.props?.hideTitleBar;
			const areaName = panel?.parent.value?.name;
			const area = (panel?.skeleton as any)[areaName!];

			PushpinTwoTone;
			return (
				<>
					{!hideTitleBar && (
						<>
							{canSetFixed && (
								<Button
									type="text"
									icon={h(
										areaName === 'leftFloatArea'
											? PushpinOutlined
											: PushpinTwoTone
									)}
									class="mtc-pane-icon-fix"
									onClick={() => {
										setDisplay();
									}}
								></Button>
							)}
							<Button
								type="text"
								icon={h(CloseOutlined)}
								class="mtc-pane-icon-close"
								onClick={() => {
									area && area.setVisible(false);
								}}
							></Button>
						</>
					)}
				</>
			);
		};
	},
});
