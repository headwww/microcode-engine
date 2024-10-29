import { defineComponent, PropType, watch } from 'vue';
import { IPublicTypePanelConfig } from '@arvin/microcode-types';
import { Area } from '../area';
import { Panel } from '..';

export const LeftFloatPane = defineComponent({
	name: 'LeftFloatPane',
	props: {
		area: Object as PropType<Area<IPublicTypePanelConfig, Panel>>,
	},
	setup(props) {
		watch(
			() => props.area?.current,
			() => {
				console.log(props.area?.container.items.value);
			}
		);
		return () => {
			const { area } = props;
			const width = area?.current?.config.props?.width;

			const style = width
				? {
						width,
					}
				: undefined;

			return (
				<div
					class={{
						'mtc-left-float-pane': true,
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
