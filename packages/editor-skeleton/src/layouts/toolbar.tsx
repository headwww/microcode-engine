import { defineComponent, PropType, Fragment } from 'vue';
import { Area } from '../area';

export const Toolbar = defineComponent({
	name: 'Toolbar',
	props: {
		area: Object as PropType<Area>,
	},
	setup(props) {
		return () => {
			if (props.area?.isEmpty()) {
				return <Fragment></Fragment>;
			}

			const left: any[] = [];
			const center: any[] = [];
			const right: any[] = [];

			props.area?.container.items.forEach((item) => {
				if (item.align === 'center') {
					center.push(item.content);
				} else if (item.align === 'right') {
					right.push(item.content);
				} else {
					left.push(item.content);
				}
			});
			return (
				<div
					class={{
						'mtc-toolbar': true,
						'mtc-area-visible': props.area?.visible.value,
					}}
				>
					<div class="mtc-toolbar-left">{left}</div>
					<div class="mtc-toolbar-center">{center}</div>
					<div class="mtc-toolbar-right">{right}</div>
				</div>
			);
		};
	},
});
