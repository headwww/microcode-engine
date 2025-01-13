import { INode, ISettingField } from '@arvin-shu/microcode-designer';
import {
	IShellModelFactory,
	IPublicModelNode,
	IPublicModelSettingField,
} from '@arvin-shu/microcode-types';
import { Node, SettingField } from '@arvin-shu/microcode-shell';

class ShellModelFactory implements IShellModelFactory {
	createNode(node: INode | null | undefined): IPublicModelNode | null {
		return Node.create(node);
	}

	createSettingField(prop: ISettingField): IPublicModelSettingField {
		return SettingField.create(prop);
	}
}
export const shellModelFactory = new ShellModelFactory();
