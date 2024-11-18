import { InfoCircleOutlined } from '@ant-design/icons-vue';
import {
	IPublicTypeHelpTipConfig,
	IPublicTypeTipConfig,
} from '@arvin-shu/microcode-types';
import { Tip } from './tip';

export function HelpTip({
	help,
	direction = 'left',
	size = 16,
}: {
	help: IPublicTypeHelpTipConfig;
	direction?: IPublicTypeTipConfig['direction'];
	size?: Number;
}) {
	if (typeof help === 'string') {
		return (
			<div>
				<div>
					<InfoCircleOutlined
						style={{ fontSize: `${size}px` }}
						class="mtc-help-tip"
					/>
				</div>

				<Tip direction={direction} children={help as any}></Tip>
			</div>
		);
	}

	if (typeof help === 'object' && help.url) {
		return (
			<div>
				<a href={help.url} target="_blank" rel="noopener noreferrer">
					<InfoCircleOutlined
						style={{ fontSize: `${size}px` }}
						class="mtc-help-tip"
					/>
				</a>
				<Tip direction={direction} children={help as any}></Tip>
			</div>
		);
	}
	return (
		<div>
			<InfoCircleOutlined
				style={{ fontSize: `${size}px` }}
				class="mtc-help-tip"
			/>
			<Tip direction={direction} children={help as any}></Tip>
		</div>
	);
}
