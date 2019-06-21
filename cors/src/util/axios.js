const axios = require('axios');
const getUrlHost = (url) => {
  let i = url.indexOf('//') + 2
  return url.substring(i, url.indexOf('/', i))
}
axios.defaults.withCredentials = true

const AJAX = ({
  type,
  data,
  url,
  headers
}) => (new Promise((resolve, reject) => {
  const Host = getUrlHost(url)
  axios({
    method: type,
    url: url,
    params: data,
    data: data,
    headers: {
      'Accept': '*/*',
      'Accept-Encoding': 'utf-8',
      'Accept-Language': 'zh-CN,zh;q=0.8',
      'Host': Host,
      'Origin': Host,
      'Referer': 'http://' + Host,
      'Connection': 'keep-alive',
      'Cookie': "",
      ...headers
    },
  }).then(res => {
    resolve(res)
  }).catch(err => {
    reject(err)
  })
}))
module.exports = AJAX