import { defineComponent, PropType } from 'vue';
import { IPublicTypePanelConfig } from '@arvin/microcode-types';
import { Area } from '../area';
import { Panel } from '..';

export const LeftFixedPane = defineComponent({
	name: 'LeftFixedPane',
	props: {
		area: Object as PropType<Area<IPublicTypePanelConfig, Panel>>,
	},
	setup(props) {
		return () => {
			const { area } = props;
			const width = area?.current.value?.config.props?.width;

			const style = width
				? {
						width,
					}
				: undefined;

			return (
				<div
					class={{
						'mtc-left-fixed-pane': true,
						'mtc-area-visible': area?.visible.value,
					}}
					style={style}
				>
					{area?.container.items.value.map((panel) => panel.content)}
				</div>
			);
		};
	},
});
