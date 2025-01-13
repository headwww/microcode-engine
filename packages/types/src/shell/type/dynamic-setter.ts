import { IPublicModelSettingField } from '../model';
import { IPublicTypeCustomView } from './custom-view';
import { IPublicTypeSetterConfig } from './setter-config';

export type IPublicTypeDynamicSetter = (
	target: IPublicModelSettingField
) => string | IPublicTypeSetterConfig | IPublicTypeCustomView;
