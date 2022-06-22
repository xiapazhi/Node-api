const test = require('../controllers/test');
const websocket = require('../controllers/websocket');

module.exports = function (router, opts) {
    router.get('/get/test', test.testFunction(opts));
    // router.post('/post/test', test.testFunction(opts));
    // router.put('/put/test', test.testFunction(opts));
    // router.del('/del/test', test.testFunction(opts));

    // socket 测试
    router.get('/websocket', websocket.socketFun(opts));
};