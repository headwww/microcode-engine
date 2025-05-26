import { Tabs } from 'ant-design-vue';
import { defineComponent, PropType, ref } from 'vue';

type TabItem = {
	label: string;
	key: string;
	children: any;
};

export default defineComponent({
	name: 'LtTabs',
	inheritAttrs: false,
	props: {
		items: {
			type: Array as PropType<TabItem[]>,
			default: () => [],
		},
		defaultActiveKey: {
			type: String,
		},
		size: {
			type: String as PropType<'small' | 'middle' | 'large' | undefined>,
			default: 'middle',
		},
	},
	setup(props) {
		const activeKey = ref(props.defaultActiveKey);

		return () => (
			<Tabs size={props.size} v-model:activeKey={activeKey.value}>
				{props.items.map((item) => (
					<Tabs.TabPane tab={item.label} key={item.key}>
						{item?.children?.()}
					</Tabs.TabPane>
				))}
			</Tabs>
		);
	},
});
