import { Tabs } from 'ant-design-vue';
import { defineComponent, PropType, ref } from 'vue';
import './style.scss';

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
		full: {
			type: Boolean,
			default: true,
		},
		onChange: {
			type: Function as PropType<(params?: any) => void>,
		},
		onTabClick: {
			type: Function as PropType<(params?: any) => void>,
		},
	},
	setup(props) {
		const activeKey = ref(props.defaultActiveKey);

		return () => (
			<Tabs
				prefixCls={props.full ? 'lt-tabs-full' : ''}
				size={props.size}
				v-model:activeKey={activeKey.value}
				onChange={props.onChange}
				onTabClick={props.onTabClick}
			>
				{props.items?.map((item) => (
					<Tabs.TabPane tab={item.label} key={item.key}>
						{item?.children?.()}
					</Tabs.TabPane>
				))}
			</Tabs>
		);
	},
});
