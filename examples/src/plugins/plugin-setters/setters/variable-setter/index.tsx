import { event } from '@arvin-shu/microcode-engine';
import { defineComponent } from 'vue';

export const VariableSetter = defineComponent({
	name: 'VariableSetter',
	isPopup: true,
	show: (params: any) => {
		const { prop: field, ...res } = params;
		event.emit('variableBindModal.openModal', { field, ...res });
	},
	setup() {
		return () => <div>VariableSetter</div>;
	},
});
