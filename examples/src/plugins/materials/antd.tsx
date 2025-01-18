import { Button } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const AntdButton = defineComponent({
	name: 'AntdButton',
	props: {},
	setup() {
		return () => <Button type="primary">Antd</Button>;
	},
});
