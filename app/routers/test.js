const test = require('../controllers/test');
const websocket = require('../controllers/websocket');
const crypto = require('../controllers/crypto');

module.exports = function (router, opts) {
    router.get('/get/test', test.testFunction(opts));
    // router.post('/post/test', test.testFunction(opts));
    // router.put('/put/test', test.testFunction(opts));
    // router.del('/del/test', test.testFunction(opts));

    // 非对称加密测试
    router.get('/genera_publicKey', crypto.generaPublicKey(opts));
    router.post('/crypto_decrypt', crypto.decrypt(opts));

    // socket 测试
    router.get('/websocket', websocket.socketFun(opts));
};