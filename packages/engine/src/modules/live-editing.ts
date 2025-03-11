import {
	EditingTarget,
	Node as DocNode,
	LiveEditing,
	SaveHandler,
} from '@arvin-shu/microcode-designer';
import { isJSExpression } from '@arvin-shu/microcode-utils';

function getText(node: DocNode, prop: string) {
	const p = node.getProp(prop, false);
	if (!p || p.isUnset()) {
		return null;
	}
	let v = p.getValue();
	if (isJSExpression(v)) {
		v = v.mock;
	}
	if (v == null) {
		return null;
	}
	if (p.type === 'literal') {
		return v;
	}
	return Symbol.for('not-literal');
}

export function liveEditingRule(target: EditingTarget) {
	const { node, event } = target;

	const targetElement = event.target as HTMLElement;

	if (
		!Array.from(targetElement.childNodes).every(
			(item) => item.nodeType === Node.TEXT_NODE
		)
	) {
		return null;
	}

	const { innerText } = targetElement;

	const propTarget = ['title', 'label', 'text', 'content', 'children'].find(
		(prop) => equalText(getText(node as DocNode, prop), innerText)
	);

	if (propTarget) {
		return {
			propElement: targetElement,
			propTarget,
		};
	}
	return null;
}

function equalText(v: any, innerText: string) {
	if (typeof v !== 'string') {
		return false;
	}
	return v.trim() === innerText;
}

export const liveEditingSaveHander: SaveHandler = {
	condition: (prop) => prop.type === 'expression',
	onSaveContent: (content, prop) => {
		const v = prop.getValue();
		let data = v;
		if (isJSExpression(v)) {
			data = v.mock;
		}
		data = content;
		if (isJSExpression(v)) {
			prop.setValue({
				type: 'JSExpression',
				value: v.value,
				mock: data,
			});
		} else {
			prop.setValue(data);
		}
	},
};

LiveEditing.addLiveEditingSpecificRule(liveEditingRule);
LiveEditing.addLiveEditingSaveHandler(liveEditingSaveHander);
