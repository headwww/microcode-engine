import { IPublicTypePreferenceValueType } from '.';

export interface IPublicTypePluginDeclarationProperty {
	/**
	 * 配置项的唯一标识符，可以是简单的名称或分组名称。
	 */
	key: string;
	/**
	 * 这是配置项的文本描述，帮助用户理解该配置项的用途。
	 */
	description: string;
	/**
	 * 定义配置项的类型。
	 */
	type: string;
	/**
	 * 定义配置项的默认值。
	 * 这是配置项的默认值，它仅在配置 UI 中生效，运行时不会影响实际的插件逻辑。
	 */
	default?: IPublicTypePreferenceValueType;
	/**
	 * 当配置项类型为 string 时，指定是否使用多行文本框进行输入。
	 */
	useMultipleLineTextInput?: boolean;
	/**
	 * 定义配置项的可选枚举值，仅在 type: 'string' 时有效。
	 */
	enum?: any[];
	/**
	 * 为枚举值提供描述。
	 */
	enumDescriptions?: string[];
	/**
	 * 标识该配置项已废弃时的提示信息。
	 */
	deprecationMessage?: string;
}
