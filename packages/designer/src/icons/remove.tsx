import { IconProps, SVGIcon } from '@arvin-shu/microcode-utils';
import { defineComponent, PropType } from 'vue';

export const IconRemove = defineComponent({
	name: 'IconRemove',
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
				<path d="M224 256v639.84A64 64 0 0 0 287.84 960h448.32A64 64 0 0 0 800 895.84V256h64a32 32 0 1 0 0-64H160a32 32 0 1 0 0 64h64zM384 96c0-17.664 14.496-32 31.904-32h192.192C625.696 64 640 78.208 640 96c0 17.664-14.496 32-31.904 32H415.904A31.872 31.872 0 0 1 384 96z m-96 191.744C288 270.208 302.4 256 320.224 256h383.552C721.6 256 736 270.56 736 287.744v576.512C736 881.792 721.6 896 703.776 896H320.224A32.224 32.224 0 0 1 288 864.256V287.744zM352 352c0-17.696 14.208-32.032 32-32.032 17.664 0 32 14.24 32 32v448c0 17.664-14.208 32-32 32-17.664 0-32-14.24-32-32V352z m128 0c0-17.696 14.208-32.032 32-32.032 17.664 0 32 14.24 32 32v448c0 17.664-14.208 32-32 32-17.664 0-32-14.24-32-32V352z m128 0c0-17.696 14.208-32.032 32-32.032 17.664 0 32 14.24 32 32v448c0 17.664-14.208 32-32 32-17.664 0-32-14.24-32-32V352z" />
			</SVGIcon>
		);
	},
});
