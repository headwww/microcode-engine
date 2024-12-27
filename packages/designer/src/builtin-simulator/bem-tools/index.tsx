import { defineComponent, PropType } from 'vue';
import { BuiltinSimulatorHost } from '../host';
import { BorderDetecting } from './border-detecting';

export const BemTools = defineComponent({
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	name: 'BemTools',
	setup() {
		// TODO designMode === 'live' 取消掉这个 处理滚动的情况

		return () => (
			<div class="mtc-bem-tools">
				<BorderDetecting />
			</div>
		);
	},
});
