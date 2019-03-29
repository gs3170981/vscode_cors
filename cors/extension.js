const vscode = require('vscode');
const express = require('express');
const AJAX = require('./src/util/axios');
const bodyParser = require('body-parser')

const urlencodedParser = bodyParser.urlencoded({
	extended: false
})
console.log('cors - 扩展已被执行');
vscode.window.showInformationMessage('欢迎使用 vscode Cors 扩展')

function activate(context) {
	console.log('cors - 扩展已激活');
	let app = express();
	let server;
	let port;
	const barItemStart = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right)
	barItemStart.text = `$(radio-tower)`;
	barItemStart.tooltip = 'vscode cors'
	barItemStart.command = 'cors.login'
	barItemStart.show()
	let login = vscode.commands.registerCommand('cors.login', () => {
		vscode.window.showInformationMessage('是否启动vscode Cors服务？', '是', '否').then(result => {
			if (result === '是') {
				app.all('*', urlencodedParser, (req, res) => {
					res.header('Access-Control-Allow-Origin', '*');
					res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
					res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
					let VSCODE_CORS = JSON.parse(req.query['VSCODE_CORS'])

					AJAX({
						url: VSCODE_CORS.proxy + req.path,
						type: req.method,
						headers: {
							...VSCODE_CORS.other.requestHeaders,
							'content-type': req.headers['content-type']
						},
						data: req.method === 'POST' ? req.body : req.query,
					}).then(resp => {
						console.log(resp)
						let val
						try {
							val = JSON.stringify(resp.data)
						} catch (error) {
							return res.status(500).send('{"error": "JSON 解析错误"}')
						}
						res.send(val);
					}).catch(err => {
						console.log(err)
						res.status(500).send(`{"error": "服务请求失败，请比较与正式环境的差异(请求参数，header头等各种方面的)", "val": "${err.message}"}`);
					})
				});
				server = app.listen(1337, () => {
					barItemStart.text = `$(circle-slash)`
					barItemStart.command = 'cors.load'
					port = server.address().port
					vscode.window.showInformationMessage('vscode cors 开启成功！listening at http://localhost:' + port, '知道了')
				});
			}
		})
	})
	let load = vscode.commands.registerCommand('cors.load', () => {
		vscode.window.showInformationMessage(`是否关闭vscode Cors服务？(http://localhost:${port})`, '是', '否').then(result => {
			if (result === '是') {
				server.close()
				barItemStart.text = `$(radio-tower)`
				barItemStart.command = 'cors.login'
			}
		})
	})

	context.subscriptions.push(login, load);
}

function deactivate() {
	console.log('cors - 扩展已退出')
}

exports.activate = activate;

module.exports = {
	activate,
	deactivate
}