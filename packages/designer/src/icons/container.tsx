import { IconProps, SVGIcon } from '@arvin-shu/microcode-utils';
import { defineComponent, PropType } from 'vue';

export const IconContainer = defineComponent({
	name: 'IconContainer',
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
				<path d="M800 800h64v64h-64v-64z m-128 0h64v64h-64v-64z m-128 0h64v64h-64v-64z m-128 0h64v64h-64v-64z m-256 0h64v64h-64v-64z m0-640h64v64h-64v-64z m128 640h64v64h-64v-64zM160 672h64v64h-64v-64z m0-128h64v64h-64v-64z m0-128h64v64h-64v-64z m0-128h64v64h-64v-64z m640 384h64v64h-64v-64z m0-128h64v64h-64v-64z m0-128h64v64h-64v-64z m0-128h64v64h-64v-64z m0-128h64v64h-64v-64z m-128 0h64v64h-64v-64z m-128 0h64v64h-64v-64z m-128 0h64v64h-64v-64z m-128 0h64v64h-64v-64z" />
				<path d="M896 64H128c-35.2 0-64 28.8-64 64v768c0 35.2 28.8 64 64 64h768c35.2 0 64-28.8 64-64V128c0-35.2-28.8-64-64-64z m0 800c0 19.2-12.8 32-32 32H160c-19.2 0-32-12.8-32-32V160c0-19.2 12.8-32 32-32h704c19.2 0 32 12.8 32 32v704z" />
			</SVGIcon>
		);
	},
});
