import { defineComponent, PropType } from 'vue';
import { StyleData } from '../../types';
import { ColorInput, Row } from '../../components';
import { intlLocal } from './locale';

import './index.scss';

const backgroundConfig = intlLocal();

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
			<div class="background-setter">
				<Row title={backgroundConfig.title} styleKey="">
					<ColorInput
						styleKey="backgroundColor"
						styleData={props.styleData}
						onStyleChange={props.onStyleChange}
					/>
				</Row>
			</div>
		);
	},
});
