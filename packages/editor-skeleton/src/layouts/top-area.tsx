import { defineComponent, PropType, Fragment } from 'vue';
import { Area } from '../area';

export const TopArea = defineComponent({
	name: 'TopArea',
	props: {
		area: Object as PropType<Area>,
		itemClassName: String,
		className: String,
	},
	setup(props) {
		return () => {
			if (props.area?.isEmpty()) {
				return <Fragment></Fragment>;
			}
			return (
				<div
					class={{
						[props.className || '']: !!props.className,
						'mtc-top-area': true,
						'engine-actionpane': true,
						'mtc-area-visible': props.area?.visible.value,
					}}
				>
					<Contents
						area={props.area}
						itemClassName={props.itemClassName}
					></Contents>
				</div>
			);
		};
	},
});

const Contents = defineComponent({
	name: 'Contents',
	props: {
		area: Object as PropType<Area>,
		itemClassName: String,
	},
	setup(props) {
		return () => {
			const left: any[] = [];
			const center: any[] = [];
			const right: any[] = [];
			props.area?.container.items
				.slice()
				.sort((a, b) => {
					const index1 = a.config?.index || 0;
					const index2 = b.config?.index || 0;
					return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
				})
				.forEach((item) => {
					const content = (
						<div class={props.itemClassName} key={`top-area-${item.name}`}>
							{item.content}
						</div>
					);
					if (item.align === 'center') {
						center.push(content);
					} else if (item.align === 'left') {
						left.push(content);
					} else {
						right.push(content);
					}
				});

			return (
				<Fragment>
					<div class="mtc-top-area-left">{left}</div>
					<div class="mtc-top-area-center">{center}</div>
					<div class="mtc-top-area-right">{right}</div>
				</Fragment>
			);
		};
	},
});
