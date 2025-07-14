import { cloneVNode, defineComponent, Fragment, h, isVNode } from 'vue';
import { IPublicTypeIconType } from '@arvin-shu/microcode-types';
import * as AntIcons from '@ant-design/icons-vue'; // 导入所有图标
import { isESModule } from './is-es-module';
import { isVueComponent } from './is-vue';

const URL_RE = /^(https?:)\/\//i;

/**
 * 创建图标组件
 * @param icon - 图标类型或组件
 * @param props - 组件属性
 * @returns 图标组件
 */
export function createIcon(
	icon?: IPublicTypeIconType | null,
	props?: Record<string, unknown>
) {
	if (!icon) {
		return <Fragment></Fragment>;
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
				<Fragment></Fragment>
			);
	},
});
