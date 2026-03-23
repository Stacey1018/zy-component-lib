# 解决打包后样式文件问题

```json
│   │   └── style
│   │       ├── index.cjs.js
│   │       ├── index.es.js
│   │       └── index.js
```

上一节打包生成的产物 style里面有有三个文件，index.js是我们自己拷贝生成的，同时也没有被编译为es，cjs格式的文件，还是维持了源代码的样子

解决

# gulp
vite打包已经不满足我们的需求了，接下来我们使用gulp和Rollup来进行打包

