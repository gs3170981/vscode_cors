# 【插件】cors：vscode cors 扩展 - 解决跨域开发最终版

## 说在前头

解决跨域的方式不下 7 8 种，类似的文章我也发表过，但开发路上总会遇到一些奇奇怪怪的限制，让你始终没法 easy 调试，这次我干脆写了个 vscode 扩展，伴随开发工具一起完灭**Access-Control-Allow-Origin**

---

## 一、下载

![download](https://img-blog.csdnimg.cn/2019040118124712.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

> vscode 扩展应用商店搜索“cors”下载即可

---

## 二、如何使用

### 1、开启

![ui](https://img-blog.csdnimg.cn/20190401181647118.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

右下角会显示**新的 icon**，点击他即可开启内置服务

![icon](https://img-blog.csdnimg.cn/20190401182113769.png)

![start](https://img-blog.csdnimg.cn/20190401182212201.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

![listening](https://img-blog.csdnimg.cn/2019040118231594.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)
至此开启了本地端口 1337 的监听

### 2.1、ajax 联调（get 示例 —— lofter）

借用 lofter 的 API 尝试

```js
$.ajax({
  type: "get",
  url: "http://www.lofter.com/trade/reward/isOpen",
  success: function(res) {
    console.log(res);
  }
});
```

当前请求会报**跨域**错误，将以上转换为

```js
var VSCODE_CORS_URL = {
  key: "http://localhost:1337",
  proxy: "http://www.lofter.com"
};
$.ajax({
  type: "get",
  url:
    "http://localhost:1337/trade/reward/isOpen?VSCODE_CORS=" +
    JSON.stringify(VSCODE_CORS_URL),
  success: function(res) {
    console.log(res);
  }
});
```

![ok](https://img-blog.csdnimg.cn/20190401183658285.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

返回成功

### 2.2、ajax 联调（post 示例 —— 掘金）

借用 juejin 的 API 尝试

```js
$.ajax({
  type: "post",
  url: "https://web-api.juejin.im",
  contentType: "application/json;charset=UTF-8",
  data: JSON.stringify({
    operationName: "",
    query: "",
    variables: {
      limit: 10,
      excluded: []
    },
    extensions: {
      query: {
        id: "5a924f4574e04d67b2ae5df189e8423d"
      }
    }
  }),
  success: function(res) {
    console.log(res);
  }
});
```

当前请求会报**跨域**错误，将以上转换为

```js
var VSCODE_CORS_URL = {
  key: "http://localhost:1337",
  proxy: "https://web-api.juejin.im",
  other: {
    requestHeaders: {
      "X-Agent": "Juejin/Web"
    }
  }
};
$.ajax({
  type: "post",
  url:
    "http://localhost:1337/query?VSCODE_CORS=" +
    JSON.stringify(VSCODE_CORS_URL),
  contentType: "application/json;charset=UTF-8",
  data: JSON.stringify({
    operationName: "",
    query: "",
    variables: {
      limit: 10,
      excluded: []
    },
    extensions: {
      query: {
        id: "5a924f4574e04d67b2ae5df189e8423d"
      }
    }
  }),
  success: function(res) {
    console.log(res);
  }
});
```

![ok2](https://img-blog.csdnimg.cn/20190401184417593.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

返回成功

### 2.3、ajax 联调（代理多地址模式）（version 0.2.6 新增）

处理本地联调多个不同域的情况

```js
var VSCODE_CORS_URL = [
  {
    key: "http://localhost:1337",
    proxy: "https://web-api.juejin.im",
    other: {
      requestHeaders: {
        "X-Agent": "Juejin/Web"
      }
    }
  },
  {
    key: "http://localhost:1337",
    proxy: "http://www.lofter.com"
  }
  // more...
];
$.ajax({
  type: "post",
  url:
    "http://localhost:1337/query?VSCODE_PROXY=https://web-api.juejin.im&VSCODE_CORS=" +
    JSON.stringify(VSCODE_CORS_URL),
  contentType: "application/json;charset=UTF-8",
  data: JSON.stringify({
    operationName: "",
    query: "",
    variables: {
      limit: 10,
      excluded: []
    },
    extensions: {
      query: {
        id: "5a924f4574e04d67b2ae5df189e8423d"
      }
    }
  }),
  success: function(res) {
    console.log(res);
  }
});
$.ajax({
  type: "get",
  url:
    "http://localhost:1337/trade/reward/isOpen?VSCODE_PROXY=http://www.lofter.com&VSCODE_CORS=" +
    JSON.stringify(VSCODE_CORS_URL),
  success: function(res) {
    console.log(res);
  }
});
```

![ok3](https://img-blog.csdnimg.cn/20190515155916770.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

![ok4](https://img-blog.csdnimg.cn/20190515155955464.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)
返回成功

### 3、关闭

![close](https://img-blog.csdnimg.cn/20190401184642685.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L01ja3lfTG92ZQ==,size_16,color_FFFFFF,t_70)

---

## 三、API

因为设计的非常简单，所以目前 API 配置仅有**3 个**

1.  key（指向当前 cors 起的服务器地址）
2.  proxy（指向请求的目标地址）
3.  other（其他相关配置项）

关于 other，目前给开发者提供了 requestHeaders 的变更

```js
var VSCODE_CORS_URL = {
  key: "http://localhost:XX",
  proxy: "https://XX",
  other: {
    requestHeaders: {
      "X-Agent": "XX",
      Cookie: "XX"
      // more
    }
  }
};
```

扩展内部默认为 axios，以上 requestHeaders 会被以下源码处理，如有相同可被覆盖

```js
headers: {
  'Accept': '*/*',
  'Accept-Encoding': 'utf-8',
  'Accept-Language': 'zh-CN,zh;q=0.8',
  'Host': Host,
  'Origin': Host,
  'Referer': 'http://' + Host,
  'Connection': 'keep-alive',
  'Cookie': "",
  ...requestHeaders
}
```

---

## 四、自测情况

Type

- Get √
- Post + application/json √
- Post + application/x-www-form-urlencoded √

Lib

- JQ √
- axios √

---

# 关于

make：o︻そ ╆OVE▅▅▅▆▇◤（清一色天空）

blog：http://blog.csdn.net/mcky_love

掘金：https://juejin.im/user/59fbe6c66fb9a045186a159a/posts

lofter：http://zcxy-gs.lofter.com/

sf：https://segmentfault.com/u/mybestangel

git：https://github.com/gs3170981/vscode_cors.git

---

# 结束语

如有 bug/意见，望提 Issues，如好用请 star~
