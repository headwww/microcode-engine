import { IPublicTypeTitleContent } from '@arvin-shu/microcode-types';
import { defineComponent, PropType } from 'vue';

export const BorderDetectingInstance = defineComponent({
	props: {
		title: {
			type: [String, Object] as PropType<IPublicTypeTitleContent>,
			require: true,
		},
		rect: {
			type: Object as PropType<DOMRect | null>,
			require: true,
		},
		scale: {
			type: Number,
			require: true,
		},
		isLocked: {
			type: Boolean,
		},
	},
	setup(props) {
		return () => {
			const { rect, scale } = props;
			if (!rect) {
				return <></>;
			}
			const style = {
				width: rect.width * scale!,
				height: rect.height * scale!,
				transform: `translate(${rect.left * scale!}px, ${rect.top * scale!}px)`,
			};

			return (
				<div class="mtc-borders mtc-borders-detecting" style={style}></div>
			);
		};
	},
});

export const BorderDetecting = defineComponent({
	setup() {
		return () => <div class="mtc-bem-tools-border-detecting"></div>;
	},
});
