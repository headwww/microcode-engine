import { defineComponent, PropType } from 'vue';
import { Area } from '../area';

export const LeftArea = defineComponent({
	name: 'LeftArea',
	props: {
		className: String,
		area: Object as PropType<Area>,
	},
	setup(props) {
		return () => {
			const { className = 'mtc-left-area', area } = props;
			if (area?.isEmpty()) {
				return null;
			}

			return (
				<div
					class={{
						[className || '']: !!className,
						'mtc-area-visible': area?.visible.value,
					}}
				>
					<Contents area={props.area}></Contents>
				</div>
			);
		};
	},
});

const Contents = defineComponent({
	name: 'Contents',
	props: { area: Object as PropType<Area> },
	setup(props) {
		return () => {
			const { area } = props;
			const top: any[] = [];
			const bottom: any[] = [];
			area?.container.items.value
				.slice()
				.sort((a, b) => {
					const index1 = a.config?.index || 0;
					const index2 = b.config?.index || 0;
					return index1 === index2 ? 0 : index1 > index2 ? 1 : -1;
				})
				.forEach((item) => {
					const content = (
						<div key={`left-area-${item.name}`}>{item.content}</div>
					);

					if (item.align === 'bottom') {
						bottom.push(content);
					} else {
						top.push(content);
					}
				});
			return (
				<>
					<div className="mtc-left-area-top">{top}</div>
					<div className="mtc-left-area-bottom">{bottom}</div>
				</>
			);
		};
	},
});
