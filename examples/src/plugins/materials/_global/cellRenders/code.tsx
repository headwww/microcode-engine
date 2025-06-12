import { defineComponent, PropType, Fragment } from 'vue';
import { QRCode, Popover } from 'ant-design-vue';
import BarCode from '../../bar-code';

export default defineComponent({
	componentName: 'LtCodeRenderTableCell',
	props: {
		code: {
			type: String,
		},
		type: {
			type: String as PropType<'qrCode' | 'barCode'>,
			default: 'qrCode',
		},
	},
	setup(props) {
		return () => (
			<Fragment>
				{props.code === undefined || props.code === null ? (
					<span>{props.code}</span>
				) : (
					<Popover>
						{{
							default: () => <span>{props.code}</span>,
							content: () => (
								<Fragment>
									{props.type === 'qrCode' ? (
										<QRCode value={props.code || 'N/A'} />
									) : (
										<BarCode value={props.code || 'N/A'} />
									)}
								</Fragment>
							),
						}}
					</Popover>
				)}
			</Fragment>
		);
	},
});
