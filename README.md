# bcaServer
人体成分数据上传平台；
控制各联网的人体成分分析仪；
也是大数据管理平台；
并提供对外访问的api。

使用node.js技术实现。
server.js是实现web server功能的主文件，在3000端口实现websocket服务，在3001端口实现web访问（使用express框架）。
同时实现数据库操作（postgreSQL)，对外API和静态页面路由。
在服务器上运行命令  node server.js即可运行。平时使用screen 命令查看运行状态。

静态页面包括：
- 单位注册 registerUnit.html
- 人员注册 registerPerson.html
- 测试页面 test.html
- 结果页面 result.html
- 历史记录 history.html
- 膳食管理 diet.html
- 查询页面 serch.html
- 监控页面 monitor.html

具体访问路径和APIc参见server.js内代码注释。