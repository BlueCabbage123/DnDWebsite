
"use strict";

const render = (path) => {
	$.getJSON(path, (result) => {
		console.log('test');
		renderCharacterSheet(JSON.parse(result));
		mousepos();
	});
};

let currentCharacter;

// Attribute renderers backend
function refresh() {
	renderName();
	renderPrimaryAttributes();
	renderProficiencyModifier();
	renderClass();
	renderAttribute('inspiration');
	renderAttribute('armourClass');
	renderAttribute('initiative', currentCharacter.attributeModifier['dexterity'] >= 0 ? '+'+String(currentCharacter.attributeModifier('dexterity')) : String(currentCharacter.attributeModifier('dexterity')));
	renderAttribute('movement', String(raceInfo[currentCharacter['race']]['movement']) + 'ft');
	renderAttribute('passivePerception', String(10 + currentCharacter.attributeModifier('wisdom')));
	
	renderAttribute('race');
	renderAttribute('background');
	renderAttribute('alignment', alignmentInfo[currentCharacter['alignment']]);
	renderAttribute('playerName');
	renderAttribute('experience');
	
	renderSavingThrowModifiers();
	renderSkills();
	renderHealthConditions();	
	renderWealth();
	
	Object.values(currentCharacter.inventory.contents).forEach( item => {
		addItem(item);
	});
}

function modifyAttribute(attr, value) {
	if (typeof(value) != 'undefined') {
		currentCharacter[attr] = value;
	};
}

function renderName() {
	$('#name').html(currentCharacter.fnames + " " + currentCharacter.lname);
	resizeTextSingleLine($('#name'), currentCharacter.fnames + " " + currentCharacter.lname, 25, 24);
}

function resizeTextSingleLine(elem, str, basesize, basecharlen) {
	let size = Math.floor(basesize * basecharlen / str.length);
	if (str.length > basecharlen) {
		elem.css('font-size', String(size) + 'px');
	}
}

function renderPrimaryAttributes() {
	attributeModifierToString(0, currentCharacter.primaryAttributes['strength']);
	attributeModifierToString(1, currentCharacter.primaryAttributes['dexterity']);
	attributeModifierToString(2, currentCharacter.primaryAttributes['constitution']);
	attributeModifierToString(3, currentCharacter.primaryAttributes['intelligence']);
	attributeModifierToString(4, currentCharacter.primaryAttributes['wisdom']);
	attributeModifierToString(5, currentCharacter.primaryAttributes['charisma']);
}

function attributeModifierToString(statid, stat) {
	$('#stat'+String(statid)).html(stat);
	$('#statmod'+String(statid)).html((stat-10 >= 0) ? "+" + String(Math.floor((stat - 10) / 2)) : String(Math.floor((stat - 10) / 2)));	
}	

function renderProficiencyModifier() {
	const modifier = 1 + Math.ceil(currentCharacter.level / 4);
	$('#proficiencyModifier').html('+' + String(modifier));
}

function renderAttribute(name, value=undefined) {
	
	let newValue;
	if (typeof(value) != 'undefined') {
		newValue = value;
	} else {
		newValue = currentCharacter[name];
	};
	if (typeof(newValue) == 'string' || typeof(newValue) == 'number') {
			$('#'+name).html(String(newValue));
	} else {
		const msg = 'Error: type of attribute ' + String(name) + ' is not valid';
		throw msg;
	}
}

function renderClass() {
	let 
		classString = '',
		levelString = '';
	
	Object.keys(currentCharacter['charClass']).forEach(key => {
		classString += key + '/';
		levelString += String(currentCharacter['charClass'][key]) + '/';
	});
	
	classString = classString.substr(0, classString.length - 1);
	levelString = levelString.substr(0, levelString.length - 1);
	
	if (Object.keys(currentCharacter['charClass']).length > 1) {
		levelString += '/(' + String(currentCharacter.level)+ ')';
	};

	renderAttribute('charClass', classString + ', ' + levelString);
}

function renderSavingThrowModifiers() {
	Object.keys(currentCharacter.savingThrowProficiencies).forEach(key => {
		const modifier = currentCharacter.attributeModifier(key) + (currentCharacter.savingThrowProficiencies[key] ? 1 + Math.ceil(currentCharacter.level / 4) : 0);
		renderAttribute('savingThrow'+key.substr(0, 1).toUpperCase()+key.substr(1,key.length), modifier >= 0 ? '+' + String(modifier) : String(modifier));
		currentCharacter.savingThrowProficiencies[key] ? setDotOpacity('savingThrowProficiency'+key.substr(0, 1).toUpperCase()+key.substr(1,key.length), 0.4) : undefined;
	});
}

function renderSkills() {
	let i = 0;
	Object.keys(currentCharacter.skillProficiencies).forEach(key => {
		const 
			attribute = skillBaseAttributes[key],
			modifier = currentCharacter.attributeModifier(attribute) + (currentCharacter.skillProficiencies[key] ? 1 + Math.ceil(currentCharacter.level / 4) : 0);
		renderAttribute(key, modifier >= 0 ? '+' + String(modifier) : String(modifier));
		currentCharacter.skillProficiencies[key] ? setDotOpacity(key+'Proficiency', 0.4) : undefined;
		i++;
	})
}

function renderHealthConditions() {
	renderAttribute('maxHp', currentCharacter.healthCondition['maxHp']);
	renderAttribute('currentHp', currentCharacter.healthCondition['currentHp']);
	renderAttribute('temporaryHp', currentCharacter.healthCondition['temporaryHp']);
	renderAttribute('totalHitDice', currentCharacter.healthCondition['totalHitDice']);
	renderAttribute('currentHitDice', currentCharacter.healthCondition['currentHitDice']);
	renderDeathSaveCounter();
}

function renderDeathSaveCounter() {
	const 
		saves = currentCharacter.healthCondition['deathSaveSuccesses'],
		fails = currentCharacter.healthCondition['deathSaveFailures'];
	
	saves == 3 ? setDotOpacity('deathsuccess2', 0.4) : setDotOpacity('deathsuccess2', 0);
	saves >= 2 ? setDotOpacity('deathsuccess1', 0.4) : setDotOpacity('deathsuccess1', 0);
	saves >= 1 ? setDotOpacity('deathsuccess0', 0.4) : setDotOpacity('deathsuccess0', 0);
	
	fails == 3 ? setDotOpacity('deathfail2', 0.4) : setDotOpacity('deathfail2', 0);
	fails >= 2 ? setDotOpacity('deathfail1', 0.4) : setDotOpacity('deathfail1', 0);
	fails >= 1 ? setDotOpacity('deathfail0', 0.4) : setDotOpacity('deathfail0', 0);
}

function renderWealth() {
	// See if we want currency to not auto convert
	const 
		money = currentCharacter.wealth,
		copper = money % 10,
		silver = Math.floor((money % 100) / 10),
		gold = Math.floor((money % 1000) / 100),
		platinum = Math.floor(money / 1000);
	
	renderAttribute('currencyCopper', copper);
	renderAttribute('currencySilver', silver);
	renderAttribute('currencyElectrum', 0);
	renderAttribute('currencyGold', gold);
	renderAttribute('currencyPlatinum', platinum);
	resizeTextSingleLine(document.getElementById('currency4'), String(platinum), 22, 4);
}

// Testing purposes
function mousepos() {
	
	const coord = () => document.getElementById("sheetsvg").getBoundingClientRect();
	let toggle = true;
	
	document.addEventListener('mousemove', e => {
		let {left, top} = coord();
		const p = String(e.clientX - left) + ', ' + String(e.clientY - top);
		if (toggle) {
			document.getElementById("pos").innerHTML = p;	
		};
	});
	document.addEventListener('mousedown', e => {
		if (toggle) {
			toggle = false;
		} else {
			toggle = true;;
	}});
}

function setDotOpacity(dotid, opacity) {
	$('#'+dotid).css('opacity', opacity);
}

function renderCharacterSheet(character) {

	currentCharacter = new Character(character);

	refresh();
}

// 
//	if (typeof window != 'undefined') {
//		window.onload = () => {
//			const charObj = new Character(getCharacterJSON());
//			refresh(charObj);
//		
//			mousepos(); // Temporary 
//		}	
//	}
//