import { Button } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const AntdButton = defineComponent({
	name: 'AntdButton',
	props: {},
	setup() {
		return () => <Button>自定义按钮</Button>;
	},
});
