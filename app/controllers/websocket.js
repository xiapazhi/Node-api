const fs = require("fs");
const path = require('path');
const moment = require('moment');
const delDir = require('../utils/delDir');
const Request = require('superagent');

exports.socketFun = function (opts) {
    return async function (ctx) {
        try {
            ctx.status = 200;
            ctx.body = `
                <!DOCTYPE html>
                <html>

                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
                    </head>

                    <body>
                        <div id='App'>WEB_SOCKET</div>
                        <script type="module">
                            import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
                            const socket = io('http://localhost:3000');
                            socket.on('CALL',(d)=>{
                                document.getElementById('App').innerHTML += '<p> CALL：' + d + '</p>';
                            })
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
