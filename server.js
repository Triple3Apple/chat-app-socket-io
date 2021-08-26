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
    console.log('A viewer has connected to the website @' + getTime());

    // message request
    socket.on('chat message', (msg, name) => {

        // If not in users (server got refreshed) readd user to users array
        if (users.some(u => u.displayName === name) === false) {

            // add to users array
            let user = {
                displayName: name
            }
            // add name to server user records
            users.push(user);

        }

        let user = users.filter(u => u.displayName === socket.id)[0];

        if (!user) {
            console.log('user is NULL');
        }

        let time = getTime();
        console.log(`message (${time}): ${msg}`);
        io.emit('chat message', `${time} ~ ${user.displayName} ~ ${msg}`);
    });

    // Below activates when user closes the window (disconnect event)
    socket.on('disconnect', () => {
        console.log('A user has disconnected :C');

        let user = users.filter(u => u.displayName === socket.id)[0];

        let time = getTime();
        // Check if undefined
        if (!user) {
            console.error('could not find user that disconnected');
            io.emit('chat message', `${time} ~ Someone has disconnected!`);
            return;
        }

        let name = user.displayName;

        // Remove user from users array
        let newUserArr = users.filter(u => u.displayName != socket.id);
        users = [...newUserArr];

        console.log('removed user, current users:' + users.length);

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
                displayName: name
            }
            // add name to server user records
            users.push(user);
            // setting the sockets id to the name so I can tell who disconnected
            socket.id = name;
            console.log('User list: ' + users);


            io.emit('validation success', name);
            io.emit('chat message', `${getTime()} ~ ${user.displayName} has connected!`);
        }
    })
});

const getTime = () => {
    let hours = formatTime(d.getHours());
    let minutes = formatTime(d.getMinutes());
    let seconds = formatTime(d.getSeconds());

    return (hours + ':' + minutes + ':' + seconds);
}

function formatTime(time) {
    let formatted;
    if (time < 10) {
        if (time === 0) {
            formatted = '00';
        } else {
            formatted = '0' + time;
        }
    } else {
        formatted = time;
    }

    return formatted;
}

server.listen(3000, () => {
    console.log('listening on *:3000');
});
