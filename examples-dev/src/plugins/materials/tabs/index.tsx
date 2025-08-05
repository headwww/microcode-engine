import { Tabs } from 'ant-design-vue';
import { computed, defineComponent, nextTick, PropType, ref } from 'vue';
import './style.scss';

type TabItem = {
	label: string;
	key: string;
	children: any;
};

export default defineComponent({
	name: 'LtTabs',
	emits: ['update:activeKey'],
	props: {
		items: {
			type: Array as PropType<TabItem[]>,
			default: () => [],
		},
		defaultActiveKey: {
			type: String,
		},
		activeKey: {
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
	setup(props, { emit }) {
		const innerActiveKey = ref(props.defaultActiveKey);

		const activeKey = computed({
			get() {
				return props.activeKey !== undefined
					? props.activeKey
					: innerActiveKey.value;
			},
			set(value) {
				emit('update:activeKey', value);
			},
		});

		return () => (
			<Tabs
				prefixCls={props.full ? 'lt-tabs-full' : ''}
				size={props.size}
				v-model:activeKey={activeKey.value}
				onChange={(key) => {
					emit('update:activeKey', key);
					nextTick(() => {
						props.onChange?.(key);
					});
				}}
				onTabClick={(key) => {
					emit('update:activeKey', key);
					nextTick(() => {
						props.onTabClick?.(key);
					});
				}}
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
