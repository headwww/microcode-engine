/*
 * @Author: shuwen 1243889238@qq.com
 * @Date: 2025-04-25 15:08:48
 * @LastEditors: shuwen 1243889238@qq.com
 * @LastEditTime: 2025-04-29 15:38:51
 * @FilePath: /microcode-engine/examples/src/plugins/materials/property-selector/types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
/**
 * 属性选择器返回值说明
 *
 * 示例：当选择 [prop1].[prop2].[prop3] 时（如 corp.dept.name）：
 *
 * @property targetClass - prop1就是targetClass这个类的属性
 * @property fieldName - 完整的属性路径，如 "corp.dept.name"
 * @property fieldTypeFlag - [prop3] 的类型标识：
 *   - '0': 基础类型
 *   - '1': 实体类型
 *   - '2': 枚举类型
 * @property fieldType - [prop3] 的类型信息：
 *   - 基础类型：如 "java.lang.String"
 *   - 枚举类型：如 "com.lt.fw.core.model.biz.Dept.DeptType.$Dept" 带$符号的算枚举
 * @property enumInfo - 当 fieldTypeFlag 为 '2' 时的枚举信息，如：
 *   { "value": "集团", "key": "HEAD" }
 * @property topFieldTypeFlag - [prop1] 的类型标识，如 corp 的类型标识
 * @property topFieldType - [prop1] 的类型信息，如 "lt.fw.core.model.biz.Corp"
 */
export interface PropertySelectorValue {
	/** 目标类名 */
	targetClass?: string;
	/** 属性名称 例如:编码 */
	fieldTitle?: string;
	/** 完整的属性路径，如 corp.dept.name */
	fieldName?: string;
	/** 当前属性的类型标识：0-基础类型，1-实体类型，2-枚举类型 */
	fieldTypeFlag?: '0' | '1' | '2';
	/** 当前属性的类型信息，如 java.lang.String */
	fieldType?: string;
	/** 枚举类型信息，当 fieldTypeFlag 为 2 时有效 */
	enumInfo?: {
		// 枚举值
		value: string;
		// 枚举名称
		key: string;
		/** 枚举序号 */
		ordinal?: number;
	}[];
	/** 顶级属性的类型标识 */
	topFieldTypeFlag?: '0' | '1' | '2';
	/** 顶级属性的类型信息，如 lt.fw.core.model.biz.Corp */
	topFieldType?: string;
}

/**
 * 请求返回的信息
 */
export interface FieldListByClass {
	// 属性名称 例如: corp.dept.name
	fieldName?: string;
	// 属性的名称 例如: 编码
	fieldCommnet?: string;
	// 属性类型标识 0: 基本类型 1: class实体 2: 枚举实体
	fieldTypeFlag?: string;
	// 属性类型 实体.包名.属性名 例如: lt.fw.core.model.biz.Corp，也可以是java.lang.String
	fieldType?: string;
	// 是否为空
	notNull?: 0 | 1;
	// 枚举信息 { "value": "集团", "key": "HEAD"},
	enumInfo?: {
		// 枚举值
		value: string;
		// 枚举名称
		key: string;
		/** 枚举序号 */
		ordinal?: number;
	}[];
}
