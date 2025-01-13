import {
	ISettingEntry,
	ISettingField,
	ISettingTopEntry,
} from '@arvin-shu/microcode-designer';
import { IPublicTypeCustomView } from '@arvin-shu/microcode-types';
import { createContent, isObject } from '@arvin-shu/microcode-utils';
import { computed, defineComponent, PropType } from 'vue';
import { createField } from '../field';

export const SettingPane = defineComponent({
	name: 'SettingPane',
	inheritAttrs: false,
	props: {
		target: Object as PropType<ISettingTopEntry | ISettingField>,
	},
	setup(props) {
		return () => {
			const { target } = props;
			const { items } = target!;

			return (
				<div class="mtc-settings-pane">
					<div className="mtc-settings-content">
						{items.map((item, index) =>
							createSettingFieldView(item, target!, index)
						)}
					</div>
				</div>
			);
		};
	},
});

export function createSettingFieldView(
	field: ISettingField | IPublicTypeCustomView,
	fieldEntry: ISettingEntry,
	index?: number
) {
	if (isSettingField(field)) {
		if (field.isGroup) {
			return <SettingGroupView field={field} key={field.id} />;
		}
		return <SettingFieldView field={field} key={field.id} />;
	}
	return createContent(field, { key: index, field: fieldEntry });
}

export const SettingFieldView = defineComponent({
	name: 'SettingFieldView',
	inheritAttrs: false,
	props: {
		field: Object as PropType<ISettingField>,
	},
	setup(props) {
		const editor = props.field?.designer?.editor;

		const setters = editor?.get('setters');

		const { setter } = props.field!;

		const setterInfo = computed(() => {
			const setterType: any = setter;

			return {
				setterType,
			};
		});

		const visible = () => {
			if (props.field) {
				const { extraProps } = props.field;
				const { condition } = extraProps;
				try {
					return typeof condition === 'function'
						? condition(props.field.internalToShellField()) !== false
						: true;
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('exception when condition (hidden) is excuted', error);
				}
			}

			return true;
		};

		const ignoreDefaultValue = () => {
			if (props.field) {
				const { extraProps } = props.field;
				const { ignoreDefaultValue } = extraProps;
				try {
					if (typeof ignoreDefaultValue === 'function') {
						return ignoreDefaultValue(props.field.internalToShellField());
					}
					return false;
				} catch (error) {
					// eslint-disable-next-line no-console
					console.error('exception when ignoreDefaultValue is excuted', error);
				}

				return false;
			}
		};
		ignoreDefaultValue;

		return () => {
			const {
				extraProps,
				title,
				componentMeta,
				expanded,
				setExpanded,
				clearValue,
			} = props.field!;

			if (!visible()) {
				return <></>;
			}

			const { setterType } = setterInfo.value;
			return createField(
				{
					meta: componentMeta?.npm || componentMeta?.componentName || '',
					title,
					collapsed: !expanded,
					onExpandChange: (expandState: any) => setExpanded(expandState),
					onClear: () => clearValue(),
					...extraProps,
				} as any,
				setters.createSetterContent(setterType, {}),
				extraProps.forceInline ? 'plain' : extraProps.display
			);
		};
	},
});

export const SettingGroupView = defineComponent({
	name: 'SettingGroupView',
	inheritAttrs: false,
	setup() {
		return () => <div>SettingGroupView</div>;
	},
});

export function isSettingField(obj: any): obj is ISettingField {
	if (!isObject(obj)) {
		return false;
	}

	return 'isSettingField' in obj && obj.isSettingField;
}
