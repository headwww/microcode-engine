import { defineComponent, PropType } from 'vue';
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
			const { area, itemClassName, className } = props;
			if (area?.isEmpty()) {
				return <></>;
			}
			return (
				<div
					class={{
						[className || '']: !!className,
						'mtc-top-area': true,
						'engine-actionpane': true,
						'mtc-area-visible': area?.visible.value,
					}}
				>
					<Contents area={area} itemClassName={itemClassName}></Contents>
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
			const { area, itemClassName } = props;
			const left: any[] = [];
			const center: any[] = [];
			const right: any[] = [];
			area?.container.items.value
				.slice()
				.sort((a, b) => {
					const index1 = a.config?.index || 0;
					const index2 = b.config?.index || 0;
					return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
				})
				.forEach((item) => {
					const content = (
						<div class={itemClassName} key={`top-area-${item.name}`}>
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
				<>
					<div class="mtc-top-area-left">{left}</div>
					<div class="mtc-top-area-center">{center}</div>
					<div class="mtc-top-area-right">{right}</div>
				</>
			);
		};
	},
});
