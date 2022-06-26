const Crypto = require('crypto');

let lastPribKey = '';
let nodeSecretText = ''

exports.generaPublicKey = function (opts) {
    return async function (ctx) {
        try {

            const { publicKey, privateKey } = Crypto.generateKeyPairSync('rsa', {
                modulusLength: 1024,
                publicKeyEncoding: {
                    type: 'spki',
                    format: 'pem',
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem',
                }
            });

            nodeSecretText = Crypto.publicEncrypt(publicKey, Buffer.from('加加蜜'));

            lastPribKey = privateKey;
            ctx.status = 200;
            ctx.body = `
                <!DOCTYPE html>
                <html>

                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                        <script src="https://polyfill.io/v3/polyfill.min.js?features=WeakRef,BigInt"></script>
                        <script src="https://cdn.jsdelivr.net/npm/superagent"></script>
                    </head>

                    <body>
                        <div id='App'>CRYPTO_非对称加密</div>
                        <script type="module">
                            const fun = async () => {
                                function str2ab(str) {
                                    const buf = new ArrayBuffer(str.length);
                                    const bufView = new Uint8Array(buf);
                                    for (let i = 0, strLen = str.length; i < strLen; i++) {
                                        bufView[i] = str.charCodeAt(i);
                                    }
                                    return buf;
                                }

                                function getMessageEncoding(v) {
                                    const enc = new TextEncoder();
                                    return enc.encode(v);
                                }
    
                                const pem = "${publicKey.toString().replace(/\n/g, '')}";
                                // fetch the part of the PEM string between header and footer
                                const pemHeader = "-----BEGIN PUBLIC KEY-----";
                                const pemFooter = "-----END PUBLIC KEY-----";
                                const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
                                // base64 decode the string to get the binary data
                                const binaryDerString = window.atob(pemContents);
                                // convert from a binary string to an ArrayBuffer
                                const binaryDer = str2ab(binaryDerString);
                            
                                const pubKey = await window.crypto.subtle.importKey(
                                    "spki",
                                    binaryDer,
                                    {
                                        name: "RSA-OAEP",
                                        hash: "SHA-1"
                                    },
                                    true,
                                    ["encrypt"]
                                );
                                
                                console.log(pubKey);
    
                                let jsonD = ''
                                for(let i = 0; i < 82; i++) {
                                    jsonD+='7'
                                }
                                const jsonStr = JSON.stringify(jsonD)
                                const jsonEnc = getMessageEncoding(jsonStr)
                                console.log(jsonStr.length,jsonStr,jsonEnc)
                                const encryptedBuffer = await window.crypto.subtle.encrypt(
                                    { name: "RSA-OAEP", hash: 'SHA-256' },
                                    pubKey,
                                    jsonEnc
                                );
                                
                                console.log(encryptedBuffer);

                                const base64String = btoa(String.fromCharCode.apply(null, new Uint8Array(encryptedBuffer)));
                                console.log(base64String);
                                superagent
                                    .post('/crypto_decrypt', { })
                                    .send({ encryptedText:  base64String, }) 

                                    .set('X-API-Key', 'foobar')
                                    .set('accept', 'json')
                                    .end(function (err, res) {
                                        console.log(err, res.body);
                                });
                            }
                            fun()
                        </script>
                    </body>

                </html>
            `
        } catch (error) {
            opts.log.error(error)
            ctx.status = 400;
        }
    }
}


exports.decrypt = function (opts) {
    return async function (ctx) {
        try {

            const result = Crypto.privateDecrypt(
                {
                    key: lastPribKey,
                    // passphrase: '<passPhrase>',
                    // padding: Crypto.constants.RSA_NO_PADDING
                },
                nodeSecretText
            );
            console.log(result);
            console.log(result.toString());

            const { encryptedText } = ctx.request.body;

            const dataBuffer = Buffer.from(encryptedText, 'base64');
            const decryptData = Crypto.privateDecrypt(
                {
                    key: lastPribKey,
                },
                dataBuffer,
            );

            let b = decryptData.toString('utf8');
            ctx.status = 200;
            ctx.body = { b }
        } catch (error) {
            opts.log.error(error)
            ctx.status = 400;
            ctx.body = error
        }
    }
}