import { IPublicTypeProjectSchema } from '../type';

export interface IBaseApiProject {
	/**
	 * 导入 project schema
	 * @param schema 待导入的 project 数据
	 */
	importSchema(schema?: IPublicTypeProjectSchema): void;
}

export interface IPublicApiProject extends IBaseApiProject {}
