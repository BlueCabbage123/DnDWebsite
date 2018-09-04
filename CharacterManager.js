
const 
	character = require('./characterdisplay/ObjectInterface.js'),
	characterDir = './characterinfo/',
	fs = require('fs');

class CharacterManager {

	constructor() {
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
	
	setAction(charID, action) {
		this.actions[action.actId](charID, action);
		this.writeCharacter(charID);
	}
	
	writeCharacter(charID) {
		fs.writeFile('./characterinfo/'+charID+'.json', JSON.stringify(this.characters[charID]), (err) => {
			if (err) throw err;
		});
	}
	
}

module.exports = {CharacterManager: CharacterManager};