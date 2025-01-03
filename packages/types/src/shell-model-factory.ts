import { IPublicModelNode, IPublicModelSettingField } from './shell';

export interface IShellModelFactory {
	createNode(node: any | null | undefined): IPublicModelNode | null;

	createSettingField(prop: any): IPublicModelSettingField;
}
