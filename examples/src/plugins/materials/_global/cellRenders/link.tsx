import { defineComponent } from 'vue';
import { Button } from 'ant-design-vue';

export default defineComponent({
	componentName: 'LtLinkRenderTableCell',
	setup(props, { slots }) {
		return () => <Button type="link">{slots.default?.()}</Button>;
	},
});
