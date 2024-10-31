import { cloneVNode, defineComponent, h, isVNode } from 'vue';
import { IPublicTypeIconType } from '@arvin/microcode-types';
import * as AntIcons from '@ant-design/icons-vue'; // 导入所有图标
import { isESModule } from './is-es-module';
import { isVueComponent } from './is-vue';

const URL_RE = /^(https?:)\/\//i;

export function createIcon(
	icon?: IPublicTypeIconType | null,
	props?: Record<string, unknown>
) {
	if (!icon) {
		return <></>;
	}
	if (isESModule(icon)) {
		icon = icon.default;
	}

	if (typeof icon === 'string') {
		if (URL_RE.test(icon)) {
			return h('img', {
				src: icon,
				class: props?.className,
				...props,
			});
		}
		return <IconWrapper type={icon} {...props} />;
	}

	if (isVNode(icon)) {
		return cloneVNode(icon, { ...props });
	}
	if (isVueComponent(icon)) {
		return h(icon, {
			class: props?.className,
			...props,
		});
	}
}

export const IconWrapper = defineComponent({
	name: 'IconWrapper',
	props: {
		type: {
			type: String,
			required: true,
		},
		iconProps: {
			type: Object as () => Record<string, unknown>,
			default: () => ({}),
		},
	},
	setup(props) {
		const IconComponent: any = AntIcons[props.type as keyof typeof AntIcons];
		return () =>
			IconComponent ? (
				<IconComponent {...props.iconProps}></IconComponent>
			) : (
				<></>
			);
	},
});
