import { defineComponent, onUpdated, PropType } from 'vue';
import { IPublicTypePanelConfig } from '@arvin-shu/microcode-types';
import { toPx } from '@arvin-shu/microcode-utils';
import { Area } from '../area';
import { Panel } from '..';

export const LeftFixedPane = defineComponent({
	name: 'LeftFixedPane',
	props: {
		area: Object as PropType<Area<IPublicTypePanelConfig, Panel>>,
	},
	setup(props) {
		onUpdated(() => {
			props.area?.skeleton.editor.get('designer').touchOffsetObserver();
		});
		return () => {
			const { area } = props;
			const width = area?.current.value?.config.props?.width;

			const style = width
				? {
						width: toPx(width),
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
					{area?.container.items.map((panel) => panel.content)}
				</div>
			);
		};
	},
});
