
const 
	timeStamp = () => {
		let 
			d = Math.floor((Date.now() + 36000000) / 1000),
			h = Math.floor((d % (86400)) / (60 * 60)),
			m = Math.floor((d % (3600)) / (60));
		
		return '[' + String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0') + ']';
	},
	characterManager = require('./CharacterManager.js'),
	_ = require('underscore'),
	fs = require('fs');

class ClientManager {
	constructor(managerId, server) {
		this.io = server;
		this.id = managerId;
		this.connections = {};
	}
	
	assignClient(socket, sType) {
		this.connections[socket.id] = {'socket': socket, socketType: sType};
		this.setListener(socket);
		this.io.to(`${socket.id}`).emit('serverReceivedSocketType');

		socket.on('disconnect', () => {
			delete this.connections[socket.id];
			console.log(timeStamp() + ' User disconnected (ID: ' + socket.id + ')');
		});
	}
	
	sendJSONData(filename, eventName, socket) {
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) {
				this.io.to(`${socket.id}`).emit('dataNotFound');
				console.log('datanotfound');
			} else {
				this.io.to(`${socket.id}`).emit(eventName, data);
			};
		});
	}
	
	setListener(socket) {
		return undefined;
	}
}

class CharacterDisplayManager extends ClientManager {
	
	constructor(managerId, server) {
		super(managerId, server);
		this.type = 'characterSheet';
		this.characterManager = new characterManager.CharacterManager();
		
		fs.watch('./characterinfo/', (event, filename) => {
			if (filename) {
				const dataId = filename.substr(0, filename.indexOf('.'));
				
				Object.keys(this.connections).forEach (s => {
					if (this.connections[s]['socketType'].substr(this.connections[s]['socketType'].indexOf('_')+1) == dataId) {
						this.sendJSONData(__basedir + '/characterinfo/' + dataId + '.json', 'serverSending', this.connections[s]['socket']);
					};
				});
			
				this.io.emit('serverSentData', './characterinfo/'+ dataId +'.json');
			
			}
		});
	}
	
	setListener(socket) {
		if (this.connections[socket.id]['socketType'].substr(0, this.connections[socket.id]['socketType'].indexOf('_')) != this.type) {
			throw 'Invalid socket type';
		} else {
			socket.on('clientRequesting', (characterIDRequest) => {
				this.sendJSONData(__basedir + '/characterinfo/' + characterIDRequest + '.json', 'serverSending', socket);
			});
			
			socket.on('characterAction', (characterID, action) => {
				this.characterManager.setAction(characterID, action);
			});
			
		};
	}
}

module.exports = {ClientManager: ClientManager, CharacterDisplayManager: CharacterDisplayManager};