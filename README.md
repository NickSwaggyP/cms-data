#cms.js为爬取页面的文件
#表格数据为爬取出来的表格数据
#图表数据为爬取出来的图表数据
#server.js为将爬取出来的数据挂载到本机服务器上的文件
#图表展示.html为使用爬取的数据展示的表格和图表页面


#运行方式
#1.先清空表格数据和图表数据中的内容
#1.在cmd中进入项目根目录，输入node cms.js
#2.输入从今天开始往前爬取多少天的数据
#3.爬取完后数据将会存储到本地表格数据、图表数据中

#4.在cmd中进入项目根目录，输入node server.js
#5.使用Live in Server插件打开图表展示.html