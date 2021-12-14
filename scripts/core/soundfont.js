/*
 * Script for soundfont
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

class ADSRInfo extends EventTarget {
	// Members
	_attack = 0.0; // s
	_decay = 0.0; // s
	_sustain = 1.0; // ratio
	_release = 0.0; // s
	
	// Constructor
	constructor(attack = 0.0, decay = 0.0, sustain = 1.0, release = 0.0) {
		super();

		this._attack = attack;
		this._decay = decay;
		this._sustain = sustain;
		this._release = release;
	}
	
	// Getters
	get attack() { return this._attack; }
	get decay() { return this._decay; }
	get sustain() { return this._sustain; }
	get release() { return this._release; }
	
	// Setters
	set attack(value) {
		this._attack = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set decay(value) {
		this._decay = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set sustain(value) {
		this._sustain = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set release(value) {
		this._release = value;
		super.dispatchEvent(new Event("change"));
	}
	
	// Functions
	toObject() {
		const obj = {};
		
		obj.attack = this.attack;
		obj.decay = this.decay;
		obj.sustain = this.sustain;
		obj.release = this.release;
		
		return obj;
	}
}

class OscillatorInfo extends EventTarget {
	// Members
	_waveform = "sine";
	_amp = 1.0;
	_octaveRelative = 0;
	_freqOffset = 0;
	
	// Constructor
	constructor(waveform = "sine", amp = 1.0, octaveRelative = 0, freqOffset = 0) {
		super();

		this._waveform = waveform;
		this._amp = amp;
		this._octaveRelative = octaveRelative;
		this._freqOffset = freqOffset;
	}
	
	// Getters
	get waveform() { return this._waveform; }
	get amp() { return this._amp; }
	get octaveRelative() { return this._octaveRelative; }
	get freqOffset() { return this._freqOffset; }
	
	// Setters
	set waveform(value) {
		this._waveform = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set amp(value) {
		this._amp = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set octaveRelative(value) {
		this._octaveRelative = value;
		super.dispatchEvent(new Event("change"));
	}
	
	set freqOffset(value) {
		this._freqOffset = value;
		super.dispatchEvent(new Event("change"));
	}
	
	// Functions
	toObject() {
		const obj = {};
		
		obj.waveform = this.waveform;
		obj.amp = parseFloat(this.amp.toPrecision(4));
		obj.octave = this.octaveRelative;
		obj["freq_offset"] = this.freqOffset;
		
		return obj;
	}
}

class Soundfont {
	// Members
	_id = "soundfont" + Date.now().toString();
	_name = "Unnamed soundfont";
	_author = "(이름 없는 황야의 무법자)";
	_description = "(설명 없음)";
	
	_masterAmp = 1.0;
	_masterAmpAdsr = new ADSRInfo();
	_oscillators = new Array();
	
	_custom = false;
	
	// Constructor
	constructor(id, name, custom = false) {
		if(!id || !name) {
			throw new TypeError("Valid string must be given for each constructor arguments.");
		}
		
		this._id = id;
		this._name = name;
		this._custom = false;
	}
	
	// Getters
	get id() {
		return this._id;
	}
	
	get name() {
		return this._name;
	}
	
	get author() {
		return this._author;
	}
	
	get description() {
		return this._description;
	}
	
	get masterAmp() {
		return this._masterAmp;
	}
	
	get masterAmpAdsr() {
		return this._masterAmpAdsr;
	}
	
	get oscillators() {
		return this._oscillators;
	}
	
	get custom() {
		return this._custom;
	}
	
	// Setters
	set id(value) {
		if(!value || value.search(" ") != -1) {
			throw new TypeError("Valid string without any whitespaces must be given.");
		}
		
		this._id = value;
	}
	
	set name(value) {
		if(!value) {
			throw new TypeError("Valid string must be given.");
		}
		
		this._name = value;
	}
	
	set author(value) {
		if(!value) {
			throw new TypeError("Valid string must be given.");
		}
		
		this._author = value;
	}
	
	set description(value) {
		if(!value) {
			throw new TypeError("Valid string must be given.");
		}
		
		this._description = value;
	}
	
	set masterAmp(value) {
		if(typeof value != "number") {
			throw new TypeError("Valid number must be given.");
		}
		
		this._masterAmp = value;
	}
	
	set masterAmpAdsr(value) {
		if(!(value instanceof ADSRInfo)) {
			throw new TypeError("ADSRInfo instance must be given.");
		}
		
		this._masterAmpAdsr = value;
	}

	// Static functions
	static createSoundfontFromJson(json) {
		const jsonParsed = (typeof json == "string") ? JSON.parse(json) : json;
		const newSoundfont = new Soundfont(jsonParsed["id"], jsonParsed["display_name"]);
		newSoundfont.author = jsonParsed["author"];
		newSoundfont.description = jsonParsed["description"];
		
		// MASTER AMP
		if(jsonParsed.attributes["master_amp"]) {
			newSoundfont.masterAmp = parseFloat(jsonParsed.attributes["master_amp"].value.toString() || "1.0");
			
			if(jsonParsed.attributes["master_amp"].adsr) {
				newSoundfont.masterAmpAdsr = new ADSRInfo(
					parseFloat(jsonParsed.attributes["master_amp"].adsr["attack"].toString() || "0.0"),
					parseFloat(jsonParsed.attributes["master_amp"].adsr["decay"].toString() || "0.0"),
					parseFloat(jsonParsed.attributes["master_amp"].adsr["sustain"].toString() || "1.0"),
					parseFloat(jsonParsed.attributes["master_amp"].adsr["release"].toString() || "0.0"));
			}
		}
		
		// OSCILLATORS
		for(const osc of jsonParsed.attributes["osc"]) {
			const oscInfo = new OscillatorInfo(osc["waveform"], osc["amp"] || 1, osc["octave"] || 0, osc["freq_offset"] || 0);

			newSoundfont.addOscillator(oscInfo);
		}
		
		return newSoundfont;
	}
	
	static copySoundfont(targetSoundfont) {
		// Copy soundfont
		const newSoundfont = new Soundfont(targetSoundfont.id, targetSoundfont.name);
		
		newSoundfont._author = targetSoundfont.author;
		newSoundfont._description = targetSoundfont.description;
		newSoundfont._masterAmp = targetSoundfont.masterAmp;
		newSoundfont._masterAmpAdsr = targetSoundfont.masterAmpAdsr;
		newSoundfont._oscillators = targetSoundfont.oscillators;
		
		return newSoundfont;
	}
	
	// Functions
	saveSoundfontToSettings() {
		if(this.custom) {
			settings.set(`soundfont.custom_soundfonts.${this.id}`, JSON.stringify(this.toJSONObject()));
		}
	}

	addOscillator(oscillatorInfo) {
		if(!(oscillatorInfo instanceof OscillatorInfo)) {
			throw new TypeError("OscillatorInfo instance must be given.");
		}
		
		this._oscillators.push(oscillatorInfo);
	}
	
	removeOscillatorByIndex(index) {
		if(!isFinite(index)) {
			throw new TypeError("index must be number.");
		}
		
		this._oscillators.splice(index, 1);
	}
	
	toJSONObject() {
		// SOUNDFONT ATTRIBUTES
		const jsonAttributes = {};
		// Master Amp
		const masterAmpObj = {
			value: this.masterAmp,
			adsr: this.masterAmpAdsr.toObject()
		};
		
		jsonAttributes["master_amp"] = masterAmpObj;
		// Oscillators
		const oscList = [];
		this.oscillators.forEach((osc) => {
			let oscObj = { "waveform": osc.waveform };
			oscObj = {...oscObj, ...osc.toObject()};
			oscList.push(oscObj);
		});
		jsonAttributes.osc = oscList;
		
		// BASIC INFORMATIONS
		const json = {
			"id": this.id,
			"display_name": this.name,
			"author": this.author,
			"description": this.description,
			"attributes": jsonAttributes
		};
		
		return json;
	}
}
