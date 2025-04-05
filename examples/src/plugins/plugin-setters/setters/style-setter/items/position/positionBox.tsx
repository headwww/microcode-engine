import { defineComponent, PropType } from 'vue';
import { InputNumber } from 'ant-design-vue';
import { isNaN, parseInt } from 'lodash-es';
import { StyleData } from '../../types';
import { addUnit, removeUnit } from '../../utils';
import { Row } from '../../components';
import './index.scss';
import { intlLocal } from './locale';

const KEY_ARROW_DOWN = 'ArrowDown';
const KEY_ARROW_UP = 'ArrowUp';

const positionConfig = intlLocal();
export default defineComponent({
	name: 'PositionBox',
	props: {
		styleData: {
			type: Object as PropType<StyleData>,
			required: true,
		},
		onStyleChange: {
			type: Function as PropType<
				(changes: Array<{ styleKey: string; value: any }>) => void
			>,
			required: true,
		},
		unit: {
			type: String,
			default: 'px',
		},
	},
	setup(props) {
		const onInputChange = (styleKey: string, value: string) => {
			if (value !== '') {
				if (!isNaN(parseInt(value))) {
					props.onStyleChange([
						{
							styleKey,
							value: addUnit(value, props.unit),
						},
					]);
				}
			} else {
				props.onStyleChange([
					{
						styleKey,
						value: null,
					},
				]);
			}
		};

		const onInputKeyDown = (key: string, styleKey: string) => {
			const value = props.styleData[styleKey] || 0;
			if (key === KEY_ARROW_DOWN) {
				props.onStyleChange([
					{
						styleKey,
						value: addUnit(parseInt(value) - 1, props.unit),
					},
				]);
			} else if (key === KEY_ARROW_UP) {
				props.onStyleChange([
					{
						styleKey,
						value: addUnit(parseInt(value) + 1, props.unit),
					},
				]);
			}
		};

		const onPositionTempleteChange = (styleDataList: Array<StyleData>) => {
			styleDataList.forEach((item) => {
				const changes = {
					topLeft: [
						{ styleKey: 'top', value: 0 },
						{ styleKey: 'left', value: 0 },
						{ styleKey: 'bottom', value: null },
						{ styleKey: 'right', value: null },
					],
					topRight: [
						{ styleKey: 'top', value: 0 },
						{ styleKey: 'left', value: null },
						{ styleKey: 'bottom', value: null },
						{ styleKey: 'right', value: 0 },
					],
					bottomLeft: [
						{ styleKey: 'top', value: null },
						{ styleKey: 'left', value: 0 },
						{ styleKey: 'bottom', value: 0 },
						{ styleKey: 'right', value: null },
					],
					bottomRight: [
						{ styleKey: 'top', value: null },
						{ styleKey: 'left', value: null },
						{ styleKey: 'bottom', value: 0 },
						{ styleKey: 'right', value: 0 },
					],
				}[item.value as 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight'];

				if (changes) {
					props.onStyleChange(changes);
				}
			});
		};

		return () => (
			<div>
				{props.styleData.position === 'absolute' && (
					<Row
						items={positionConfig.positionTemplete.dataList}
						onStyleChange={onPositionTempleteChange}
						styleKey={'positionTemplete'}
					/>
				)}
				<div class="position-box-container">
					<div class="top-div">
						<InputNumber
							controls={false}
							bordered={false}
							placeholder="auto"
							value={removeUnit(props.styleData.top)}
							onUpdate:value={(v: any) => onInputChange('top', v)}
							onKeydown={(e: any) => onInputKeyDown(e.key, 'top')}
						/>
					</div>
					<div class="right-div">
						<InputNumber
							controls={false}
							bordered={false}
							placeholder="auto"
							value={removeUnit(props.styleData.right)}
							onUpdate:value={(v: any) => onInputChange('right', v)}
							onKeydown={(e: any) => onInputKeyDown(e.key, 'right')}
						/>
					</div>
					<div class="bottom-div">
						<InputNumber
							controls={false}
							bordered={false}
							placeholder="auto"
							value={removeUnit(props.styleData.bottom)}
							onUpdate:value={(v: any) => onInputChange('bottom', v)}
							onKeydown={(e: any) => onInputKeyDown(e.key, 'bottom')}
						/>
					</div>
					<div class="left-div">
						<InputNumber
							controls={false}
							bordered={false}
							placeholder="auto"
							value={removeUnit(props.styleData.left)}
							onUpdate:value={(v: any) => onInputChange('left', v)}
							onKeydown={(e: any) => onInputKeyDown(e.key, 'left')}
						/>
					</div>
				</div>
			</div>
		);
	},
});
