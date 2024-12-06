import { Node } from '../document';

export function includeSlot(node: Node, slotName: string | undefined): boolean {
	const { slots = [] } = node;
	return slots.some(
		(slot) => slotName && slotName === slot?.getExtraProp('name')?.getAsString()
	);
}

export function removeSlot(node: Node, slotName: string | undefined): boolean {
	const { slots = [] } = node;
	return slots.some((slot, idx) => {
		if (slotName && slotName === slot?.getExtraProp('name')?.getAsString()) {
			slot.remove();
			slots.splice(idx, 1);
			return true;
		}
		return false;
	});
}
