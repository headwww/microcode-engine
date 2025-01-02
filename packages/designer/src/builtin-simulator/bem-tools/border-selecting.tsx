import {
	defineComponent,
	PropType,
	computed,
	toRaw,
	onBeforeUnmount,
} from 'vue';
import { BuiltinSimulatorHost } from '../host';
import { INode } from '../../document';
import { OffsetObserver } from '../../designer/offset-observer';

export const BorderSelectingInstance = defineComponent({
	name: 'BorderSelectingInstance',
	props: {
		observed: {
			type: Object as PropType<OffsetObserver>,
			require: true,
		},
		dragging: Boolean,
		highlight: Boolean,
	},
	setup(props) {
		onBeforeUnmount(() => {
			props.observed?.purge();
		});

		const { observed, highlight, dragging } = props;

		const className = computed(() => [
			'mtc-borders',
			'mtc-borders-selecting',
			{ highlight, dragging },
		]);

		const { offsetWidth, offsetHeight, offsetTop, offsetLeft } = observed!;

		const style = {
			width: `${offsetWidth}px`,
			height: `${offsetHeight}px`,
			transform: `translate3d(${offsetLeft}px, ${offsetTop}px, 0)`,
		};

		// TODO 工具栏
		return () => {
			const { observed } = props;
			if (!observed?.hasOffset) {
				return <></>;
			}
			return <div class={className.value} style={style}></div>;
		};
	},
});

export const BorderSelectingForNode = defineComponent({
	name: 'BorderSelectingForNode',
	props: {
		node: {
			type: Object as PropType<INode>,
			require: true,
		},
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const { node, host } = props;

		// @ts-ignore
		const instances = computed(() => host?.getComponentInstances(node));

		return () => {
			if (!instances.value || instances.value.length < 1) {
				return <></>;
			}
			return (
				<>
					{toRaw(instances.value).map((instance) => {
						const observed = host?.designer.createOffsetObserver({
							node: node!,
							instance: toRaw(instance),
						});
						if (!observed) {
							return <></>;
						}

						return (
							<BorderSelectingInstance
								key={observed.id}
								dragging={host?.designer.dragon.dragging}
								observed={observed}
							/>
						);
					})}
				</>
			);
		};
	},
});

export const BorderSelecting = defineComponent({
	name: 'BorderSelecting',
	props: {
		host: {
			type: Object as PropType<BuiltinSimulatorHost>,
			require: true,
		},
	},
	setup(props) {
		const { host } = props;

		const selecting = computed(() => {
			const doc = host?.currentDocument;
			//  TODO host.liveEditing.editing
			if (!doc || doc.suspensed) {
				return null;
			}

			const s = doc.selection;
			return host.designer.dragon.dragging ? s.getTopNodes() : s.getNodes();
		});

		return () => {
			if (!selecting.value || selecting.value.length < 1) {
				return <></>;
			}
			return (
				<>
					{selecting.value.map((node) => (
						<BorderSelectingForNode key={node.id} node={node} host={host} />
					))}
				</>
			);
		};
	},
});
