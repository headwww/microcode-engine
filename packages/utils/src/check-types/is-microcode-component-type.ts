import {
	IPublicTypeComponentMap,
	IPublicTypeMicrocodeComponent,
} from '@arvin-shu/microcode-types';
import { isProCodeComponentType } from './is-procode-component-type';

export function isMicrocodeComponentType(
	desc: IPublicTypeComponentMap
): desc is IPublicTypeMicrocodeComponent {
	return !isProCodeComponentType(desc);
}
