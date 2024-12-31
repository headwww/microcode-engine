import { defineComponent, PropType, computed } from 'vue';
import { BuiltinSimulatorHost } from '../host';
import { INode } from '../../document';

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
					{instances.value.map((instance) => (
						<div>{instance.name}</div>
					))}
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
