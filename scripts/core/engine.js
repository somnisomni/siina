/*
 * Script for overall piano core functions
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

 /* Voice Manager class */
class VoiceManager extends EventTarget {
	/**
		Events fire:
			`lengthupdate` ─ Fired when 'voiceLength' has been updated
			`playstart` ─ Fired when starting play AudioChunk on voice slot and it's successful
			`playstop` ─ Fired when stopping play AudioChunk on voice slot and it's successful
	**/
	
	// Members
	voiceSlot = {};
	voiceLength = 0;
	
	// Constructor
	constructor() {
		super();
		
		for(let i = 0; i < MAX_VOICES; i++) {
			this.voiceSlot[i] = new AudioUnit();
			
			this.voiceSlot[i].addEventListener("playstart", () => {
				this.voiceLength++;
				super.dispatchEvent(new Event("playstart"));
				super.dispatchEvent(new Event("lengthupdate"));
			});
			
			this.voiceSlot[i].addEventListener("playstop", () => {
				this.voiceSlot[i].unitToneInfo = null;

				this.voiceLength--;
				super.dispatchEvent(new Event("playstop"));
				super.dispatchEvent(new Event("lengthupdate"));
			});
		}
	}
	
	// Functions
	getFirstAvailableSlot() {
		let firstAvailableSlot = -1;
		
		for(let index in this.voiceSlot) {
			index = parseInt(index);
			
			if(!this.voiceSlot[index].isReady && !this.voiceSlot[index].isPlaying) {
				firstAvailableSlot = index;
				break;
			} else continue;
		}
		
		return firstAvailableSlot;
	};
	
	playOnSlot = (slot, toneInfo) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");
		
		this.voiceSlot[slot].unitToneInfo = toneInfo;
		this.voiceSlot[slot].play();
	};

	stopOnSlot = async (slot) => {
		if(this.voiceSlot[slot] == undefined) throw new Error("Voice slot out of range.");
		if(!this.voiceSlot[slot].isReady) throw new Error("AudioUnit on this voice slot is not ready yet.");
		
		await this.voiceSlot[slot].stop();
	};
}
/* === */

/* Engine */
class Engine {
	// Members
	voiceManager = new VoiceManager();

	_soundfont = null;
	_availableSoundfonts = {};

	// Constructor
	constructor() {
		// Load builtin soundfonts
		this._availableSoundfonts["builtin"] = {};
		JSON.parse(JSON_BUILTIN_SOUNDFONTS).forEach((e) => {
			e.items.forEach((soundfont) => {
				this._availableSoundfonts.builtin[soundfont["id"]] = Soundfont.createSoundfontFromJson(soundfont);
			});
		});
		
		// Load custom soundfonts
		this._availableSoundfonts["custom"] = {};
		let soundfontIds = settings.get("soundfont.custom_soundfonts.ids") ? settings.get("soundfont.custom_soundfonts.ids").toString() : null;
		if(soundfontIds) {
			soundfontIds = soundfontIds.split(",");
		} else {
			soundfontIds = [];
		}
		
		soundfontIds.forEach((id) => {
			const soundfont = Soundfont.createSoundfontFromJson(settings.get(`soundfont.custom_soundfonts.${id}`));
			soundfont._custom = true;

			this._availableSoundfonts.custom[soundfont.id] = soundfont;
		});
		
		// Freeze available soundfonts object
		Object.freeze(this._availableSoundfonts);
	}
	
	// Getters
	get soundfont() { return this._soundfont; }
	get availableSoundfonts() { return this._availableSoundfonts; }
	
	// Setters
	set soundfont(value) {
		if(!(value instanceof Soundfont)) {
			throw new TypeError("Soundfont instance must be given.");
		}
		
		this._soundfont = value;
	}
	
	// Functions
	addAvailableCustomSoundfont(soundfont) {
		// Returns `true` if soundfont is newly added, `false` if overrided existing soundfont (with matching ID)

		if(!(soundfont instanceof Soundfont)) {
			throw new TypeError("Soundfont instance must be given.");
		}
		
		// Add custom soundfont item in `availableSoundfonts`
		soundfont._custom = true;
		this._availableSoundfonts = {...this._availableSoundfonts};
		this._availableSoundfonts.custom[soundfont.id] = soundfont;
		Object.freeze(this._availableSoundfonts);
		
		// Add to settings
		let soundfontIds = settings.get("soundfont.custom_soundfonts.ids") ? settings.get("soundfont.custom_soundfonts.ids").toString() : null;
		if(soundfontIds) {
			soundfontIds = soundfontIds.split(",");
		} else {
			soundfontIds = [];
		}

		let newlyAdded = false;
		if(!soundfontIds.includes(soundfont.id)) {
			soundfontIds.push(soundfont.id);
			settings.set("soundfont.custom_soundfonts.ids", soundfontIds.toString());
			newlyAdded = true;
		}
		
		settings.set(`soundfont.custom_soundfonts.${soundfont.id}`, JSON.stringify(soundfont.toJSONObject()));
		
		return newlyAdded;
	}
	
	removeCustomSoundfontById(id) {
		// Remove soundfont from `availableSoundfonts`
		this._availableSoundfonts = {...this._availableSoundfonts};
		delete this._availableSoundfonts.custom[id];
		Object.freeze(this._availableSoundfonts);
		
		// Remove soundfont in settings
		let soundfontIds = settings.get("soundfont.custom_soundfonts.ids").toString();
		if(soundfontIds) {
			soundfontIds = soundfontIds.split(",");
		} else {
			soundfontIds = [];
		}
		
		if(soundfontIds.includes(id)) {
			soundfontIds.splice(soundfontIds.indexOf(id), 1);
			settings.set("soundfont.custom_soundfonts.ids", soundfontIds);
			settings.remove(`soundfont.custom_soundfonts.${id}`);
		}
	}

	playOnAvailableSlot(toneInfo) {
		const assignedSlot = this.voiceManager.getFirstAvailableSlot();
		
		this.voiceManager.playOnSlot(assignedSlot, toneInfo);
		
		return assignedSlot;
	}
	
	stopOnSlot = this.voiceManager.stopOnSlot;

	stopAll() {
		for(let i = 0; i < MAX_VOICES; i++) {
			try {
				this.voiceManager.stopOnSlot(i);
			} catch { }
		}
	}
}
/* === */
