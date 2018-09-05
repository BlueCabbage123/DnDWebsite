
"use strict";

// Global information and attributes
const 
	raceInfo = {
		dragonborn: {movement: 30},
		dwarf: {movement: 30},
		elf: {movement: 30},
		gnome: {movement: 25},
		halfelf: {movement: 30},
		halforc: {movement: 30},
		halfling: {movement: 25},
		human: {movement: 30},
		tiefling: {movement: 30},
	},
	characterClassInfo = {
		barbarian: {hitDie: 12},
		bard: {hitDie: 8},
		cleric: {hitDie: 8},
		druid: {hitDie: 8},
		monk: {hitDie: 8},
		paladin: {hitDie: 10},
		ranger: {hitDie: 10},
		rogue: {hitDie: 8},
		sorcerer: {hitDie: 6},
		warlock: {hitDie: 8},
		wizard: {hitDie: 6},
	},
	primaryAttributeInfo = {
		strength: 10,
		dexterity: 10,
		constitution: 10,
		intelligence: 10,
		wisdom: 10,
		charisma: 10,
	},
	skillProficiencyInfo = {
		acrobatics: 0,
		animalhandling: 0, 
		arcana: 0, 
		athletics: 0, 
		deception: 0, 
		history: 0, 
		insight: 0, 
		intimidation: 0, 
		investigation: 0, 
		medicine: 0, 
		nature: 0, 
		perception: 0, 
		performance: 0, 
		persuasion: 0, 
		religion: 0, 
		sleightofhand: 0, 
		stealth: 0, 
		survival: 0,	
	},	
	healthConditionInfo = {
		maxHp: 0,
		currentHp: 0,
		temporaryHp: 0,
		totalHitDice: 0,
		currentHitDice: 0,
		deathSaveSuccesses: 0,
		deathSaveFailures: 0,
	},
	alignmentInfo = {
		goodLawful: 'Lawful Good',
		goodNeutral: 'Neutral Good',
		goodChaotic: 'Chaotic Good',
		neutralLawful: 'Lawful Neutral',
		neutral: 'Neutral',
		neutralChaotic: 'Chaotic Neutral',
		evilLawful: 'Lawful Evil',
		evilNeutral: 'Neutral Evil',
		evilChaotic: 'Chaotic Evil',
	},
	levelInfo = {
		'1': 0,
		'2': 300,
		'3': 900,
		'4': 2700,
		'5': 6500,
		'6': 14000,
		'7': 23000,
		'8': 34000,
		'9': 48000,
		'10': 64000,
		'11': 85000,
		'12': 100000,
		'13': 120000,
		'14': 140000,
		'15': 165000,
		'16': 195000,
		'17': 225000,
		'18': 265000,
		'19': 305000,
		'20': 355000,
	},
	skillBaseAttributes = {
		acrobatics: 'dexterity',
		animalhandling: 'wisdom', 
		arcana: 'intelligence', 
		athletics: 'strength', 
		deception: 'charisma', 
		history: 'intelligence', 
		insight: 'wisdom', 
		intimidation: 'charisma', 
		investigation: 'intelligence', 
		medicine: 'wisdom', 
		nature: 'intelligence', 
		perception: 'wisdom', 
		performance: 'charisma', 
		persuasion: 'charisma', 
		religion: 'intelligence',  
		sleightofhand: 'dexterity',
		stealth: 'dexterity',
		survival: 'wisdom', 	
	};

class Character {
	constructor(characterObj) {	
		const newCharacter = characterObj;	
			
		this.charClass = {};

		this.charID = newCharacter.charID;
		this.setName(newCharacter.fnames, newCharacter.lname);
		this.setClass(newCharacter.charClass);
		this.setRace(newCharacter.race);
		this.setBackground(newCharacter.background);
		this.setAlignment(newCharacter.alignment);
		this.setPlayerName(newCharacter.playerName);
		this.setExperience(newCharacter.experience);
		this.setInspiration(newCharacter.inspiration);
		this.setPrimaryAttributes(newCharacter.primaryAttributes);
		this.setSavingThrowProficiencies(newCharacter.savingThrowProficiencies);
		this.setSkillProficiencies(newCharacter.skillProficiencies);
		this.setHealthCondition(newCharacter.healthCondition);
		this.setWealth(newCharacter.wealth);
		this.setInventory(newCharacter.inventory);
		
		this.equipped = new Inventory({
			itemID: 'equipped'+this.charID, 
			name: 'Equipped Items',
			description: this.name+"'s equipped combat-effective items",
			value: 0,
			tags: ['equipped', 'intangible'],
			contents: {},
		});
	}
	
	get name() {
		return this.fnames + (this.lname != '' ? ' ' + this.lname : '');
	}
	
	get level() {
		return Object.values(this.charClass).reduce((ac, val) => ac + val);
	}
	
	get armourClass() {	
		const itemAC = Object.keys(this.equipped['contents']).reduce((item, ac) => {
			if (this.equipped['contents'][item]['tags'].indexOf('defense') != -1) {
				return this.equipped['contents'][item]['defenseRating'];
			} else {
				return 0;
			}
		}, 0); 
		return itemAC ? itemAC + this.attributeModifier('dexterity') + 10 : this.attributeModifier('dexterity') + 10;	
	}
	
	attributeModifier(attr) {
		if (this.primaryAttributes[attr]) {
			return Math.floor((this.primaryAttributes[attr] - 10) / 2);
		} else {
			throw 'Cannot get modifier for invalid attribute';
		}
	}
	
	// Setters for initial/manual insertion of data. Setters will NOT keep consistency for most attributes; use sparingly
	setName(fnames, lname) {
		if (fnames == '') throw 'First name(s) cannot be empty';
		this.fnames = fnames;
		this.lname = lname;
	} 
	
	setClass(charClass) {
		Object.keys(charClass).forEach( c => {
			if (typeof(characterClassInfo[c]) == 'undefined') throw 'Class does not exist';
			const errorMsg = this.name + ' is already a ' + c.toUpperCase();
			if (typeof(this.charClass[c]) != 'undefined') throw errorMsg;
			this.charClass[c] = charClass[c];
		});
	}
	
	setLevel(level, charClass=this.charClass.keys()[0]) {
		const errorMsg = this.name + ' is not a ' + charClass.toUpperCase();
		if (typeof(this.charClass[charClass]) == 'undefined') throw errorMsg;
		this.charClass[charClass] = level; 
	}
	
	setRace(race) {
		if (typeof(raceInfo[race]) == 'undefined') throw 'Race does not exist';
		this.race = race;
	}
	
	setBackground(background) {
		if (background == '') throw 'Background cannot be empty';
		this.background = background;
	}
	
	setAlignment(alignment) {
		if (typeof(alignmentInfo[alignment]) == 'undefined') throw 'Alignment is not valid';
		this.alignment = alignment;
	}
	
	setPlayerName(name) {
		this.playerName = name;
	}
	
	setExperience(exp) {
		if (exp < 0) throw 'Experience cannot be negative';
		this.experience = exp;
		if (!(levelInfo[this.level] <= this.experience && (this.level < 20 ? levelInfo[this.level+1] < this.experience : true ))) {
			return false;
		} else {
			return true;
		}
	}
	
	setInspiration(inspiration) {
		if (inspiration < 0) throw 'Inspiration cannot be negative';
		this.inspiration = inspiration;
	}
	
	//Needs more preconditions
	setPrimaryAttributes(attr) {
		Object.keys(primaryAttributeInfo).forEach( a => {if (typeof(attr[a]) == 'undefined') throw 'Invalid set of primary attributes'});
		this.primaryAttributes = attr;
	}
	
	setSavingThrowProficiencies(proficiencies) {
		Object.keys(primaryAttributeInfo).forEach( p => {if (typeof(proficiencies[p]) == 'undefined') throw 'Invalid set of saving throw proficiencies'});
		this.savingThrowProficiencies = proficiencies;
	}
	
	setSkillProficiencies(proficiencies) {
		Object.keys(skillProficiencyInfo).forEach( p => {if (typeof(proficiencies[p]) == 'undefined') throw 'Invalid set of skill proficiencies'});
		this.skillProficiencies = proficiencies;
	}
	
	setHealthCondition(condition) {
		Object.keys(healthConditionInfo).forEach( c => {if (typeof(condition[c]) == 'undefined') throw 'Invalid set health conditions'});
		this.healthCondition = condition;
	}
	
	setWealth(wealth) {
		if (wealth < 0) throw 'Character cannot carry negative money';
		this.wealth = wealth;
	}
	
	setInventory(inv) {
		this.inventory = new Inventory(inv);
	}
	
	failDeathSave(n=1) {
		this.healthCondition['deathSaveFailures'] += n;
		if (this.healthCondition['deathSaveFailures'] > 3) {
			this.healthCondition['deathSaveFailures'] = 3;
		}
	}
	
	succeedDeathSave(n=1) {
		if (this.healthCondition['currentHp'] <= 0 && this.healthCondition['deathSaveFailures'] < 3) {
			this.healthCondition['deathSaveSuccesses'] += n;
			if (this.healthCondition['deathSaveSuccesses'] >= 3) {
				this.resetCounters();
				this.healthCondition['currentHp'] = 1;
			};
		};
	}
	
	resetCounters() {
		this.healthCondition['deathSaveFailures'] = 0;
		this.healthCondition['deathSaveSuccesses'] = 0;
	}
	
	gainTempHp(val) {
		if (this.healthCondition['currentHp'] > 0 && val > this.healthCondition['temporaryHp']) {
			this.healthCondition['temporaryHp'] = val;
		};
		
	}
	
	heal(val) {
		
		if (val > 0 && this.healthCondition['deathSaveFailures'] < 3) {
			if (this.healthCondition['currentHp'] == 0) {
				this.resetCounters();
			}
			this.healthCondition['currentHp'] += val;
			if (this.healthCondition['currentHp'] > this.healthCondition['maxHp']) {
				this.healthCondition['currentHp'] = this.healthCondition['maxHp'];
			};
		};
	}
	
	takeDamage(val) {
		const conscious = this.healthCondition['currentHp'];
		let remaining = val;
		if (this.healthCondition['temporaryHp'] > 0) {
			this.healthCondition['temporaryHp'] -= remaining;
			remaining = 0;
			if (this.healthCondition['temporaryHp'] < 0) {
				remaining = -this.healthCondition['temporaryHp'];
				this.healthCondition['temporaryHp'] = 0;
			}
		};
		
		if (remaining > 0 && this.healthCondition['currentHp'] > 0) {
			this.healthCondition['currentHp'] -= remaining;
			remaining = 0;
			if (this.healthCondition['currentHp'] < 0) {
				remaining = -this.healthCondition['currentHp'];
				this.healthCondition['currentHp'] = 0;
			}
		};
		
		if (remaining > 0 && this.healthCondition['currentHp'] <= 0) {
			if (remaining > this.healthCondition['maxHp']) {
				this.failDeathSave(3);
			} else {
				if (!conscious) {
					this.failDeathSave();
				};
			};
		};
		
	}
	
}

class Item {
	constructor(itemObj) {
		const newItem = itemObj;
		
		this.itemID = newItem.itemID;
		this.name = newItem.name;
		this.description = newItem.description;
		this.value = newItem.value;
		this.tags = newItem.tags;
	}
}

class Inventory extends Item {
	constructor(inventoryObj) {
		super(inventoryObj);
		const newInventory = inventoryObj;
		this.contents = inventoryObj.contents;
		this.identifyContents();
	}
	
	identifyContents() {
		Object.keys(this.contents).forEach( key => {
			const type = this.contents[key]['tags'][0];		
			if (type == 'weapon') {
				this.contents[key] = new Weapon(this.contents[key]);
			} else if (type == 'inventory') {
				this.contents[key] = new Inventory(this.contents[key]);
			};
		});
	}
		
	isEmpty() {
		if (Object.keys(this.contents).length() == 0) {
			return true;
		} else {
			return false;
		}
	}
	
	addItem(item) {
		if (typeof(contents[item.itemID]) == 'undefined') {
			contents[item.itemID] = item;
			return true;
		} else {
			return false;
		}
	}
	
	removeItem(item) {
	if (typeof(contents[item.itemID]) == 'undefined') {
			return false;
		} else {
			delete contents[item.itemID];
			return true;
		}
	}
}

class Weapon extends Item {
	constructor(weaponObj) {
		super(weaponObj);
		const newWeapon = weaponObj;

		this.damage1h = newWeapon.damage1h;
		this.damage2h = newWeapon.damage2h;
		this.damageRange = newWeapon.damageRange;
	}
	
	get ranged() {
		return typeof(this.damageRange) != 'undefined';
	}
}

try {
	module.exports = {Character: Character};
} catch (e) {}







