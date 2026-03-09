# 解决ts类型问题

项目后进后，没有生成types类型文件，

原因是dts配置问题，

根目录 tsconfig.json 使用了 project references，且 **"files": []，没有 include**。因此插件认为没有任何文件需要生成声明，只会生成一个占位入口 index.d.ts（内容为 export {}）

tsconfig.build.json