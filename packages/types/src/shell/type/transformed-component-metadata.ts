import { IPublicTypeComponentMetadata, IPublicTypeFieldConfig } from '.';
import { IPublicTypeConfigure } from './configure';

export interface IPublicTypeTransformedComponentMetadata
	extends IPublicTypeComponentMetadata {
	configure: IPublicTypeConfigure & { combined?: IPublicTypeFieldConfig[] };
}
