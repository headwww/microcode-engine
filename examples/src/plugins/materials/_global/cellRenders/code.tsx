import { defineComponent, PropType, Fragment } from 'vue';
import { QRCode, Popover } from 'ant-design-vue';
import BarCode from '../../bar-code';

export default defineComponent({
	componentName: 'LtCodeRenderTableCell',
	props: {
		code: {
			type: String,
			required: true,
		},
		type: {
			type: String as PropType<'qrCode' | 'barCode'>,
			default: 'qrCode',
		},
	},
	setup(props) {
		return () => (
			<Popover>
				{{
					default: () => <span>{props.code}</span>,
					content: () => (
						<Fragment>
							{props.type === 'qrCode' ? (
								<QRCode value={props.code} />
							) : (
								<BarCode value={props.code} />
							)}
						</Fragment>
					),
				}}
			</Popover>
		);
	},
});
