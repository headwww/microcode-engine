import { IPublicModelNode } from '@arvin-shu/microcode-types';
import { isObject } from '../is-object';

export function isNode<Node = IPublicModelNode>(node: any): node is Node {
	if (!isObject(node)) {
		return false;
	}
	return node.isNode;
}
