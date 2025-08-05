import { computed, defineComponent, PropType } from 'vue';
import { VxeSplit, VxeSplitPane } from 'vxe-pc-ui';

type SplitItem = {
	key: string;
	children: any;
	width: string;
	height: string;
	minWidth: string;
	minHeight: string;
};

export default defineComponent({
	name: 'LtSplit',
	props: {
		vertical: {
			type: Boolean,
			default: true,
		},
		width: {
			type: String,
			default: '100%',
		},
		height: {
			type: String,
			default: '100%',
		},
		splitLine: {
			type: Number,
			default: 2,
		},
		items: {
			type: Array as PropType<SplitItem[]>,
			default: () => [],
		},
	},
	setup(props) {
		const splitLine = computed(() => {
			if (props.vertical) {
				return {
					width: '100%',
					height: `${props.splitLine || 2}px`,
				};
			}
			return {
				width: `${props.splitLine || 2}px`,
				height: '100%',
			};
		});

		return () => (
			<VxeSplit
				width={props.width}
				height={props.height}
				vertical={props.vertical}
				barConfig={splitLine.value}
			>
				{props.items.map((item) => (
					<VxeSplitPane
						key={item.key}
						width={item.width}
						height={item.height}
						minWidth={item.minWidth}
						minHeight={item.minHeight}
					>
						{item?.children?.()}
					</VxeSplitPane>
				))}
			</VxeSplit>
		);
	},
});
