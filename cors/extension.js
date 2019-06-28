const vscode = require('vscode');
const express = require('express');
const AJAX = require('./src/util/axios');
const bodyParser = require('body-parser')
const qs = require('qs')

const urlencodedParser = bodyParser.urlencoded({
	extended: false
})
console.log('cors - 扩展已被执行');

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

	const AJAX_THEN = ({
		resp,
		res
	}) => {
		console.log(resp)
		let val
		try {
			val = JSON.stringify(resp.data)
		} catch (error) {
			return res.status(500).send('{"error": "JSON 解析错误"}')
		}
		res.send(val);
	}
	const AJAX_CATCH = ({
		err,
		res
	}) => {
		console.log(err)
		res.status(500).send(`{"error": "服务请求失败，请比较与正式环境的差异(请求参数，header头等各种方面的)", "val": "${err.message}"}`);
	}
	let login = vscode.commands.registerCommand('cors.login', () => {
		vscode.window.showInformationMessage('是否启动vscode Cors服务？', '是', '否').then(result => {
			if (result === '是') {
				app.all('*', urlencodedParser, (req, res) => {
					res.header('Access-Control-Allow-Origin', '*');
					res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild');
					res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
					let VSCODE_CORS, requestHeaders, url, VSCODE_PROXY
					try {
						VSCODE_CORS = JSON.parse(req.query['VSCODE_CORS'])
						VSCODE_PROXY = req.query['VSCODE_PROXY']
					} catch (err) {
						res.status(500).send(`{"error": "URL中未获取到VSCODE_CORS或JSON.parse失败，请查看相关配置", "val": "${err}"}`);
						return
					}
					if (VSCODE_CORS instanceof Array) {
						VSCODE_CORS = VSCODE_CORS.find(item => item.proxy === VSCODE_PROXY)
					}
					requestHeaders = VSCODE_CORS.other ? VSCODE_CORS.other.requestHeaders : {}
					url = VSCODE_CORS.proxy + req.path

					if (req.method === 'GET') {
						AJAX({
							url: url,
							type: req.method,
							headers: {
								...requestHeaders,
							},
							data: req.query,
						}).then(resp => AJAX_THEN({
							resp,
							res
						})).catch(err => AJAX_CATCH({
							err,
							res
						}))
					} else if (req.method === 'OPTIONS') {
						AJAX({
							url: url,
							type: req.method,
							headers: {
								...requestHeaders,
								"access-control-request-headers": req.headers["access-control-request-headers"] || "content-type",
								"access-control-request-method": req.headers["access-control-request-method"] || "POST"
							},
							data: req.query || req.body,
						}).then(resp => AJAX_THEN({
							resp,
							res
						})).catch(err => AJAX_CATCH({
							err,
							res
						}))
					} else {
						// POST application/json
						if (req.headers['content-type'] && req.headers['content-type'].includes('application/json')) {
							let str = ''
							req.on("data", chunk => {
								str += chunk
							})
							req.on("end", () => {
								AJAX({
									url: url,
									type: req.method,
									headers: {
										...requestHeaders,
										'content-type': req.headers['content-type'] || 'application/json'
									},
									data: str,
								}).then(resp => AJAX_THEN({
									resp,
									res
								})).catch(err => AJAX_CATCH({
									err,
									res
								}))
							})
						} else {
							// application/x-www-form-urlencoded
							AJAX({
								url: url,
								type: req.method,
								headers: {
									...requestHeaders,
									'content-type': req.headers['content-type'] || 'application/x-www-form-urlencoded'
								},
								data: qs.stringify(req.body),
							}).then(resp => AJAX_THEN({
								resp,
								res
							})).catch(err => AJAX_CATCH({
								err,
								res
							}))
						}
					}
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