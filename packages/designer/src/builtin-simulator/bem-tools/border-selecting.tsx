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

		const style = computed(() => ({
			width: `${observed?.offsetWidth}px`,
			height: `${observed?.offsetHeight}px`,
			transform: `translate3d(${observed?.offsetLeft}px, ${observed?.offsetTop}px, 0)`,
		}));

		// TODO 工具栏
		return () => {
			const { observed } = props;
			if (!observed?.hasOffset.value) {
				return <></>;
			}
			return <div class={className.value} style={style.value}></div>;
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
		const observedMap = new Map();

		const instances = computed(() => host?.getComponentInstances(node!));

		onBeforeUnmount(() => {
			observedMap.forEach((observed) => {
				observed.purge();
			});
			observedMap.clear();
		});

		return () => {
			if (!instances.value || instances.value.length < 1) {
				return <></>;
			}

			return (
				<>
					{instances.value.map((instance) => {
						const instanceKey = toRaw(instance);

						// TODO 滚动需要优化

						if (host?.viewport.scrolling) {
							// 滚动时使用缓存的observed
							const cachedObserved = observedMap.get(instanceKey);
							if (cachedObserved) {
								return (
									<BorderSelectingInstance
										key={cachedObserved.id}
										dragging={host?.designer.dragon.dragging}
										observed={cachedObserved}
									/>
								);
							}
							return;
						}

						const observed = host?.designer.createOffsetObserver({
							node: node!,
							instance: instanceKey,
						});

						if (!observed) {
							return <></>;
						}
						// 缓存observed用于滚动时使用
						observedMap.set(instanceKey, observed);
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
