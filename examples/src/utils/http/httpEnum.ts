/**
 * 枚举：请求内容类型
 * 用于定义常见的请求内容类型及其对应的 MIME 类型
 */
export enum ContentTypeEnum {
	JSON = 'application/json;charset=UTF-8',
	FORM_URLENCODED = 'application/x-www-form-urlencoded;charset=UTF-8',
	FORM_DATA = 'multipart/form-data;charset=UTF-8',
}

/**
 * 枚举：HTTP 请求方法
 * 用于定义常见的 HTTP 请求方法，包括 GET、POST、PUT 和 DELETE
 */
export enum RequestEnum {
	GET = 'GET',
	POST = 'POST',
	PUT = 'PUT',
	DELETE = 'DELETE',
}
