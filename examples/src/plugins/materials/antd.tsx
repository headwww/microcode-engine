import { Switch } from 'ant-design-vue';
import { defineComponent } from 'vue';

export const AntdButton = defineComponent({
	name: 'AntdButton',
	props: {},
	setup() {
		return () => (
			<div>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
				<Switch></Switch>
			</div>
		);
	},
});
