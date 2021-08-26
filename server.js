const express = require('express');
const app = express();
const http = require('http');
const { SocketAddress } = require('net');
const server = http.createServer(app);

const { Server } = require('socket.io');
const io = new Server(server);

const { v4: uuidv4 } = require('uuid');

// [https://socket.io/get-started/chat/]

// Serve Static Assets
// Used this to load css file
app.use(express.static('public'));

var d = new Date();

var users = [];

app.get('/', (req, res) => {
    // res.send('<h1>Hello world</h1>');
    res.sendFile(__dirname + '/index.html');
});

// Listen on the connection event for incoming sockets and log it to the console.
io.on('connection', (socket) => {
    console.log('A user has connected');

    let connectedTime = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
    // io.emit('chat message', `${connectedTime} ~ A user has connected!`);

    socket.on('chat message', (msg) => {
        let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        console.log(`message (${time}): ${msg}`);
        io.emit('chat message', `${time} ~ ${msg}`);
    });

    // Below activates when user closes the window (disconnect event)
    socket.on('disconnect', () => {
        console.log('A user has disconnected :C');

        let user = users.find(u => u.displayName === socket.id);

        // Check if undefined
        if (typeof user === undefined) {
            console.error('could not find user that disconnected');
            return;
        }

        let name = user.displayName;

        // Remove user from users array
        // users.splice(u => u.displayName === socket.id);

        let newUserArr = users.filter(u => u.displayName != socket.id);
        users = [...newUserArr];

        console.log('removed user, current users:' + users.length);

        let time = d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds();
        io.emit('chat message', `${time} ~ ${name} has disconnected!`);
    });

    // Validate name
    socket.on('validate name', (name) => {
        // the some() method returns a boolean value. It tests whether at least one element in the array satisfies the test condition
        if (users.some(u => u.displayName === name)) {
            console.log('validation failed for name: ' + name);

            io.emit('validation fail');
        } else {
            // Validation Success
            console.log('validation success for name: ' + name);

            let user = {
                displayName: name,
                id: uuidv4().toString()
            }
            // add name to server user records
            users.push(user);
            // setting the sockets id to the name so I can tell who disconnected
            socket.id = name;
            console.log('User list: ' + users);


            io.emit('validation success');
            io.emit('chat message', `${connectedTime} ~ ${user.displayName} has connected!`);
        }
    })
});

// const getTime = () => {

// }

server.listen(3000, () => {
    console.log('listening on *:3000');
});
