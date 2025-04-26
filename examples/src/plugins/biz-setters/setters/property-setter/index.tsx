import { defineComponent } from 'vue';
import { PropertySelector } from '../../../materials';

export const PropertySetter = defineComponent({
	name: 'PropertySetter',
	setup() {
		return () => <PropertySelector />;
	},
});
