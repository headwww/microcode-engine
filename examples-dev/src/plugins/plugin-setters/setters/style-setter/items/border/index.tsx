import { computed, defineComponent, PropType, ref } from 'vue';
import './index.scss';
import { Select } from 'ant-design-vue';
import { StyleData } from '../../types';
import { ColorInput, Row, UnitInput } from '../../components';
import { intlLocal } from './locale';

const borderConfig = intlLocal();

export default defineComponent({
	name: 'BorderSetter',
	inheritAttrs: false,
	props: {
		styleData: {
			type: Object as PropType<StyleData | any>,
			default: () => ({}),
		},
		onStyleChange: {
			type: Function as PropType<(style: StyleData[]) => void>,
			default: () => {},
		},
	},
	setup(props) {
		const borderPosition = ref<'Left' | 'Top' | 'Middle' | 'Bottom' | 'Right'>(
			'Middle'
		);

		const borderRadius = ref<
			'TopLeft' | 'TopRight' | 'Middle' | 'BottomLeft' | 'BottomRight'
		>('Middle');

		function onBorderPositionChange(
			value: 'Left' | 'Top' | 'Middle' | 'Bottom' | 'Right'
		) {
			borderPosition.value = value;
		}

		function onBorderRadiusChange(
			value: 'TopLeft' | 'TopRight' | 'Middle' | 'BottomLeft' | 'BottomRight'
		) {
			borderRadius.value = value;
		}

		const borderStyleValue = computed(() => {
			const position = borderPosition.value;

			if (position === 'Middle') {
				return props.styleData.borderStyle;
			}
			const styleKey = `border${position}Style`;

			return props.styleData[styleKey] || props.styleData.borderStyle || '';
		});

		const borderWidthKey = computed(() => {
			const position = borderPosition.value;
			if (position === 'Middle') {
				return 'borderWidth';
			}
			const styleKey = `border${position}Width`;
			return styleKey;
		});

		const borderColorKey = computed(() => {
			const position = borderPosition.value;
			if (position === 'Middle') {
				return 'borderColor';
			}
			return `border${position}Color`;
		});

		const borderRadiusKey = computed(() => {
			const radius = borderRadius.value;
			if (radius === 'Middle') {
				return 'borderRadius';
			}
			return `border${radius}Radius`;
		});

		return () => (
			<div class="border-setter">
				<div class="border-style">
					<div class="border-left-pane">
						<div class="border-row">
							<div
								onClick={() => onBorderPositionChange('Left')}
								class={borderPosition.value === 'Left' ? 'selected' : ''}
							>
								┣
							</div>
						</div>
						<div class="border-row">
							<div
								onClick={() => onBorderPositionChange('Top')}
								class={borderPosition.value === 'Top' ? 'selected' : ''}
							>
								┳
							</div>
							<div
								onClick={() => onBorderPositionChange('Middle')}
								class={borderPosition.value === 'Middle' ? 'selected' : ''}
							>
								╋
							</div>
							<div
								onClick={() => onBorderPositionChange('Bottom')}
								class={borderPosition.value === 'Bottom' ? 'selected' : ''}
							>
								┻
							</div>
						</div>
						<div class="border-row">
							<div
								onClick={() => onBorderPositionChange('Right')}
								class={borderPosition.value === 'Right' ? 'selected' : ''}
							>
								┫
							</div>
						</div>
					</div>
					<div class="border-right-pane">
						<Row title={borderConfig.borderStyle.title} styleKey="">
							<Select
								style={{ width: '100%' }}
								allowClear
								options={borderConfig.borderStyle.dataList}
								value={borderStyleValue.value}
								onUpdate:value={(value) => {
									props.onStyleChange([
										{
											styleKey:
												borderPosition.value === 'Middle'
													? 'borderStyle'
													: `border${borderPosition.value}Style`,
											value: value as any,
										},
									]);
								}}
							></Select>
						</Row>
						<Row title={borderConfig.borderWidth} styleKey="">
							<UnitInput
								min={0}
								max={100}
								styleKey={borderWidthKey.value}
								styleData={props.styleData}
								onStyleChange={props.onStyleChange}
							></UnitInput>
						</Row>
						<Row title={borderConfig.borderColor} styleKey="">
							<ColorInput
								styleKey={borderColorKey.value}
								styleData={props.styleData}
								onStyleChange={props.onStyleChange}
							/>
						</Row>
					</div>
				</div>
				<div class="border-radius">
					<div class="border-left-pane">
						<div class="border-row">
							<div
								onClick={() => onBorderRadiusChange('TopLeft')}
								class={borderRadius.value === 'TopLeft' ? 'selected' : ''}
							>
								┏
							</div>
							<div
								onClick={() => onBorderRadiusChange('BottomLeft')}
								class={borderRadius.value === 'BottomLeft' ? 'selected' : ''}
							>
								┗
							</div>
						</div>
						<div class="border-row">
							<div
								onClick={() => onBorderRadiusChange('Middle')}
								class={borderRadius.value === 'Middle' ? 'selected' : ''}
							>
								╋
							</div>
						</div>
						<div class="border-row">
							<div
								onClick={() => onBorderRadiusChange('TopRight')}
								class={borderRadius.value === 'TopRight' ? 'selected' : ''}
							>
								┓
							</div>
							<div
								onClick={() => onBorderRadiusChange('BottomRight')}
								class={borderRadius.value === 'BottomRight' ? 'selected' : ''}
							>
								┛
							</div>
						</div>
					</div>
					<div class="border-right-pane">
						<Row title={borderConfig.borderRadius} styleKey="">
							<UnitInput
								min={0}
								max={100}
								styleKey={borderRadiusKey.value}
								styleData={props.styleData}
								onStyleChange={props.onStyleChange}
							></UnitInput>
						</Row>
					</div>
				</div>
			</div>
		);
	},
});
