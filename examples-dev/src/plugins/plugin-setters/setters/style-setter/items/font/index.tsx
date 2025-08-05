import { defineComponent, PropType } from 'vue';
import { Select } from 'ant-design-vue';
import { StyleData } from '../../types';
import { ColorInput, Row, UnitInput } from '../../components';
import { intlLocal } from './locale';

import './index.scss';

const fontConfig = intlLocal();

export default defineComponent({
	name: 'FontSetter',
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
		return () => (
			<div class="font-setter">
				<Row title={fontConfig.fontSize} styleKey="">
					<UnitInput
						min={0}
						max={100}
						styleKey="fontSize"
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
					></UnitInput>
				</Row>
				<Row title={fontConfig.lineHeight} styleKey="">
					<UnitInput
						min={0}
						styleKey="lineHeight"
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
					></UnitInput>
				</Row>
				<Row title={fontConfig.fontWeight.title} styleKey="">
					<Select
						allowClear
						style={{ width: '100%' }}
						options={fontConfig.fontWeight.dataList}
						value={props.styleData.fontWeight}
						onChange={(value) => {
							props.onStyleChange([
								{
									styleKey: 'fontWeight',
									value: value as any,
								},
							]);
						}}
					></Select>
				</Row>
				<Row title={fontConfig.color} styleKey="">
					<ColorInput
						styleKey="color"
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
					/>
				</Row>

				<Row title={fontConfig.opacity} styleKey="">
					<UnitInput
						min={0}
						max={1}
						step={0.1}
						styleKey="opacity"
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
						enableUnit={false}
					></UnitInput>
				</Row>

				<Row
					styleKey="textAlign"
					title={fontConfig.textAlign.title}
					items={fontConfig.textAlign.dataList}
					longTitle={true}
					{...props}
				/>
			</div>
		);
	},
});
