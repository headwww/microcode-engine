import { defineComponent, PropType, ref, watch } from 'vue';
import { RadioGroup, RadioButton, Popover } from 'ant-design-vue';
import './index.scss';
import { StyleData } from '../../types';

type RowItem = {
	tips: string;
	title: string;
	icon: string;
	value: string;
};

export const Row = defineComponent({
	name: 'Row',
	inheritAttrs: false,
	props: {
		title: String,
		items: {
			type: Array as PropType<RowItem[]>,
			default: () => [],
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
		styleKey: {
			type: String,
			required: true,
		},
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		value: {
			type: null,
		},
		longTitle: {
			type: Boolean,
		},
		transformStyle: {
			type: Object as PropType<any>,
			default: () => ({}),
		},
	},
	setup(props, { slots }) {
		const renderIcon = (Icon: any) => (
			<Icon
				style={{
					verticalAlign: 'middle',
					...props.transformStyle,
				}}
			></Icon>
		);

		const value = ref(
			typeof props.value !== 'string'
				? props.styleData && props.styleData[props.styleKey]
				: props.value
		);

		watch(
			() => props.styleData,
			(newVal) => {
				value.value = newVal[props.styleKey];
			}
		);

		return () => {
			const { items, longTitle } = props;

			return (
				<div class="row-container">
					<div>
						{props.title && (
							<div
								class={
									value.value
										? `${!longTitle ? 'title-contaienr' : 'title-contaienr-long'} title-text title-text-active`
										: `${!longTitle ? 'title-contaienr' : 'title-contaienr-long'} title-text`
								}
							>
								{props.title}
							</div>
						)}
					</div>
					<div class="content-container">
						{slots.default ? (
							slots.default()
						) : (
							<RadioGroup
								value={value.value}
								onUpdate:value={(v: any) => {
									value.value = v;
									props.onStyleChange([{ styleKey: props.styleKey, value: v }]);
								}}
							>
								{items.map((item) => (
									<RadioButton
										value={item.value}
										key={item.value}
										onClick={(v: any) => {
											if (v?.target?.value === value.value) {
												value.value = null;
												props.onStyleChange([
													{ styleKey: props.styleKey, value: null },
												]);
											}
										}}
									>
										<Popover content={item.tips + item.value}>
											{item.icon && renderIcon(item.icon)}
											{item.title}
										</Popover>
									</RadioButton>
								))}
							</RadioGroup>
						)}
					</div>
				</div>
			);
		};
	},
});
