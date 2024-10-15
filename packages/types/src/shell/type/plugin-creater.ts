import { IPublicTypePluginConfig } from '.';
import { IPublicModelPluginContext } from '..';

export type IPublicTypePluginCreater = (
	ctx: IPublicModelPluginContext,
	options: any
) => IPublicTypePluginConfig;
