export function checkStatus(
	status: number,
	msg: string,
	errorMessageMode: any = 'message'
): void {
	let errMessage = '';

	switch (status) {
		// case 400:
		// 	errMessage = `${msg}`;
		// break;
		case 401:
			errMessage = '用户登录失效！';
			break;
		case 404:
			errMessage = '网络请求错误，未找到该资源！';
			break;
		// case 531:
		// 	errMessage = `${msg}`;
		// 	break;
		// case 600:
		// 	errMessage = `${msg}`;
		// 	break;
		// case 500:
		// 	errMessage = `${msg}`;
		// 	break;
		default:
			errMessage = `${msg}`;
			break;
	}
	if (errMessage) {
		if (errorMessageMode === 'modal') {
			console.log('错误提示');
		} else if (errorMessageMode === 'message') {
			console.log('错误提示');
		} else if (errorMessageMode === 'notification') {
			console.log('请求失败');
		}
	}
}
