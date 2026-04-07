let Server = require('socket.io').Server;
let jwt = require('jsonwebtoken');
let userModel = require('../models/User');

let io = null;

module.exports = {
    ServerSocket: function (server) {
        io = new Server(server, {
            cors: {
                origin: '*'
            }
        });

        io.on('connection', function (socket) {
            socket.on('welcome', async function (data) {
                try {
                    let token = data.auth;
                    let result = jwt.verify(token, 'secret');
                    if (result.exp * 1000 > Date.now()) {
                        let user = await userModel.findById(result.id);
                        if (user) {
                            socket.join(result.id.toString());
                            socket.emit('username', user.username);
                        }
                    }
                } catch (error) {
                    socket.emit('socket-error', error.message);
                }
            });

            socket.on('disconnect', function () {
                // keep alive hook for future realtime features
            });
        });
    },
    EmitEvent: function (eventName, data) {
        if (io) {
            io.emit(eventName, data);
        }
    },
    EmitToUsers: function (eventName, data, userIds) {
        if (io && userIds && userIds.length) {
            for (let userId of userIds) {
                io.to(userId).emit(eventName, data);
            }
        }
    }
};
