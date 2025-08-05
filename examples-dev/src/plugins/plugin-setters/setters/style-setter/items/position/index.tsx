import { defineComponent, PropType } from 'vue';
import { Select } from 'ant-design-vue';
import { StyleData } from '../../types';
import { intlLocal } from './locale';
import { Row, UnitInput } from '../../components';
import './index.scss';
import PositionBox from './positionBox';

const positionConfig = intlLocal();

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
			<div class="position-setter">
				<Row styleKey="" title={positionConfig.position.title}>
					<Select
						allowClear
						style={{ width: '100%' }}
						options={positionConfig.position.dataList}
						value={props.styleData.position}
						onChange={(value) => {
							props.onStyleChange([
								{
									styleKey: 'position',
									value: value as any,
								},
							]);
						}}
					></Select>
				</Row>

				{props.styleData.position && props.styleData.position !== 'static' && (
					<PositionBox
						{...props}
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
					/>
				)}

				<Row title="zIndex" styleKey="">
					<UnitInput
						min={0}
						styleKey="zIndex"
						styleData={props.styleData}
						enableUnit={false}
						onStyleChange={props.onStyleChange}
					></UnitInput>
				</Row>

				<Row styleKey="" title={positionConfig.float.title}>
					<Select
						allowClear
						style={{ width: '100%' }}
						options={positionConfig.float.dataList}
						value={props.styleData.float}
						onChange={(value) => {
							props.onStyleChange([
								{
									styleKey: 'float',
									value: value as any,
								},
							]);
						}}
					></Select>
				</Row>
				<Row styleKey="" title={positionConfig.clear.title}>
					<Select
						allowClear
						style={{ width: '100%' }}
						options={positionConfig.clear.dataList}
						value={props.styleData.clear}
						onChange={(value) => {
							props.onStyleChange([
								{
									styleKey: 'clear',
									value: value as any,
								},
							]);
						}}
					></Select>
				</Row>
			</div>
		);
	},
});
