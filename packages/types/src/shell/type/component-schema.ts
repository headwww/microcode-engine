/**
 * 低代码业务组件容器
 */

import { IPublicTypeContainerSchema } from './container-schema';

export interface IPublicTypeComponentSchema extends IPublicTypeContainerSchema {
	componentName: 'Component';
}
