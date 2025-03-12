import {
	IPublicTypeBasicType,
	IPublicTypePropType,
} from '@arvin-shu/microcode-types';

export function isBasicPropType(
	propType: IPublicTypePropType
): propType is IPublicTypeBasicType {
	if (!propType) {
		return false;
	}
	return typeof propType === 'string';
}
