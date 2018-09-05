
const 
	character = require('./characterdisplay/ObjectInterface.js'),
	characterDir = './characterinfo/',
	fs = require('fs');

class CharacterManager {

	constructor(server) {
		this.io = server;
		this.characters = {};
		this.actions = {
			'takeDamage': (charID, action) => {
				this.characters[charID].takeDamage(action.payload);	
			},
			'heal': (charID, action) => {
				this.characters[charID].heal(action.payload);
			},
			'resetCounters': (charID, action) => {
				this.characters[charID].resetCounters();
			},
			'succeedDeathSave': (charID, action) => {
				this.characters[charID].succeedDeathSave(action.payload);
			},
			'gainTempHp': (charID, action) => {
				this.characters[charID].gainTempHp(action.payload);
			},
		};
		fs.readdirSync(characterDir).forEach(file => {
			try {
				const c = JSON.parse(fs.readFileSync(characterDir+file, 'utf8'));
				this.characters[c.charID] = new character.Character(c);
			} catch (err) {
				console.log(file+' is not a valid character file');
			};
		});
	}	
	
	setAction(charID, action, socket) {
		if (this.actions[action.actId]) {
			this.actions[action.actId](charID, action);
			this.writeCharacter(charID);
			this.io.to(`${socket.id}`).emit('actionReceived');
		} else {
			this.io.to(`${socket.id}`).emit('dataNotFound');
		}
	}
	
	writeCharacter(charID) {
		fs.writeFile('./characterinfo/'+charID+'.json', JSON.stringify(this.characters[charID]), (err) => {
			if (err) throw err;
		});
	}
	
}

module.exports = {CharacterManager: CharacterManager};