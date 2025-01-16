import { PropType, defineComponent } from 'vue';

const SizePresets: any = {
	xsmall: 8,
	small: 12,
	medium: 16,
	large: 20,
	xlarge: 30,
};

export interface IconProps {
	className?: string;
	fill?: string;
	size?: 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge' | number;
	style?: Record<string, unknown>;
}

export const SVGIcon = defineComponent({
	name: 'SVGIcon',
	props: {
		fill: String,
		size: {
			type: [String, Number] as PropType<IconProps['size']>,
			default: 'medium',
		},
		viewBox: {
			type: String,
		},
		className: String,
		style: Object as PropType<Record<string, any>>,
	},
	setup(props, { slots }) {
		const getSize = (size: IconProps['size']) =>
			SizePresets[size as string] ?? size;

		return () => {
			const finalSize = getSize(props.size);

			return (
				<svg
					fill="currentColor"
					preserveAspectRatio="xMidYMid meet"
					width={finalSize}
					height={finalSize}
					viewBox={props.viewBox}
					class={props.className}
					style={{
						color: props.fill,
						...(props.style || {}),
					}}
				>
					{slots.default?.()}
				</svg>
			);
		};
	},
});
