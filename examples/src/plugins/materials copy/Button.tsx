import { Button } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const LtButton = defineComponent({
	name: 'LtButton',
	setup(props, { slots }) {
		return () => <Button>{slots.default?.()}</Button>;
	},
});
