import { defineComponent } from 'vue';
import { Modal } from 'ant-design-vue';

export const VariableBindSetter = defineComponent({
	name: 'VariableBindSetter',
	setup() {
		return () => <Modal></Modal>;
	},
});
