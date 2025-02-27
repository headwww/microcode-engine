import { IconProps, SVGIcon } from '@arvin-shu/microcode-utils';
import { defineComponent, PropType } from 'vue';

export const IconUnlock = defineComponent({
	name: 'IconUnlock',
	props: {
		fill: String,
		size: {
			type: [String, Number] as PropType<IconProps['size']>,
			default: 'medium',
		},
		viewBox: {
			type: String,
			default: '0 0 1024 1024',
		},
		className: String,
		style: Object as PropType<Record<string, any>>,
	},
	setup(props) {
		return () => (
			<SVGIcon {...props}>
				<path
					d="M384 480v-160c0-70.4 57.6-128 128-128s128 57.6 128 128v64h64v-64c0-105.6-86.4-192-192-192s-192 86.4-192 192v160H160v416h704V480H384z m416 352H224v-288h576v288z"
					fill="#ffffff"
					p-id="2813"
				/>
				<path d="M416 736h192v-64h-192z" fill="#ffffff" p-id="2814" />
			</SVGIcon>
		);
	},
});
