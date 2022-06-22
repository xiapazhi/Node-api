const fs = require("fs");
const opts = require('./config');
const log4js = require('log4js');
const Sequelize = require('sequelize');
const Koa = require('koa');
const logger = require('koa-logger');
const koaBody = require('koa-body');
const static = require('koa-static');
const xmlParser = require('koa-xml-body')
const appPrepare = require('./app');
const path = require('path');
const http = require('http');
const https = require('https');

//log 配置
log4js.configure(opts.log)

const logger4js = log4js.getLogger(opts.runEnvironmentIsDev ? 'development' : 'production');
opts.log = logger4js;

//database 配置
let models = {};
let sequelize = new Sequelize(opts.dataBase.uri, opts.dataBase.options);
appPrepare.getDBModels(Sequelize, sequelize, models);
setModelsRelations(sequelize)
opts.sequelize = sequelize;
global.models = models;
let router = appPrepare.getRouters(opts);

//中间件 配置
const app = new Koa();
app.use(logger());
app.use(xmlParser());
app.use(function (ctx, next) {
    if (ctx.url == '/wx/pay/callback') {
        ctx.wxPayBody = ctx.request.body
    }
    return next()
})
app.use(koaBody({
    multipart: true
}));
//加载路由
app.use(router.routes());
//全局
app.use(router.allowedMethods());

// 配置静态web服务的中间件
app.use(static(path.join(__dirname, './app/file/')));

// plan A
// app.listen(3000, function listening() {
//     logger4js.info("API启动成功");
// });

// plan B
const server = http.createServer(app.callback())
const io = require('socket.io')(server);
io.on("connection", (socket) => {
    logger4js.info("socket connect");
    io.on("disconnect", (reason) => {
        logger4js.info("socket disconnect");
    });
});
server.listen(3000);
setInterval(() => {
    // io.emit("CALL", "呼叫青铜时代号~");
}, 1000)

// const httpsOptions = {
//     key: fs.readFileSync(path.join(__dirname, './app/utils/ca.key')), //私钥文件路径
//     cert: fs.readFileSync(path.join(__dirname, './app/utils/ca.pem')) //证书文件路径
// };

// plan C
// https.createServer(httpsOptions, app.callback()).listen(3000, () => {
//     logger4js.info("API启动成功");
// });

// 数据库表关系 配置
function setModelsRelations (sequelize) {
    // const A = sequelize.models.A;
    // const B = sequelize.models.B;

    // A.belongsTo(B, {
    //     foreignKey: 'a_id',
    //     targetKey: 'b_id'
    // });
}