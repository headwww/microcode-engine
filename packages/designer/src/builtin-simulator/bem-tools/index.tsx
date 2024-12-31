import { defineComponent, PropType } from 'vue';
import { BuiltinSimulatorHost } from '../host';
import { BorderDetecting } from './border-detecting';
import { InsertionView } from './insertion';
import { BorderSelecting } from './border-selecting';

export const BemTools = defineComponent({
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	name: 'BemTools',
	setup(props) {
		// TODO designMode === 'live' 取消掉这个 处理滚动的情况

		// TODO设置配置状态engineConfig

		return () => {
			const { host } = props;
			const { scrollX, scrollY, scale } = host!.viewport;

			return (
				<div
					class="mtc-bem-tools"
					style={{
						transform: `translate(${-scrollX * scale}px,${-scrollY * scale}px)`,
					}}
				>
					<BorderDetecting key="hovering" host={host} />
					<InsertionView key="insertion" host={host} />
					<BorderSelecting key="selecting" host={host} />
				</div>
			);
		};
	},
});
