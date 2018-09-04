

const
	manager = require('./ClientManager.js'),
	express = require('express'),
	serveIndex = require('serve-index'),
	app = express(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	characterDisplays = new manager.CharacterDisplayManager('characterSheet', io),
	designateSocketManager = (socket, sType) => {
		
		if (sType.indexOf('characterSheet') >= 0) {
			characterDisplays.assignClient(socket, sType);
		};
	},
	
	timeStamp = () => {
		let 
			d = Math.floor((Date.now() + 36000000) / 1000),
			h = Math.floor((d % (86400)) / (60 * 60)),
			m = Math.floor((d % (3600)) / (60));
		
		return '[' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ']';
	};

global.__basedir = __dirname;
	
// Serve files
app.use('/', serveIndex('./characterdisplay')); // shows you the file list
app.use('/', express.static('./characterdisplay')); // serve the actual files

io.on('connection', (socket) => {
	console.log(timeStamp() + ' A user connected');
	socket.on('clientSentSocketType', (sType) => {
		designateSocketManager(socket, sType);
	});
	io.to(`${socket.id}`).emit('serverReadyForSocketType');
});

http.listen(8080, () => {
	console.log(timeStamp() + ' listening on port 8080');
});