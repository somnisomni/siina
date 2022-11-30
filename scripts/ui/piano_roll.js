/*
 * Piano roll UI builder
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

class PianoKey extends EventTarget {
	/**
		Events fire:
			`press` ─ Fired when PianoKey has pressed
			`release` ─ Fired when PianoKey has released
	**/
	
	// Members
	domElement = null;
	code = null;
	assignedVoiceSlot = -1;
	playStack = 0;
	
	// Static Members
	static functionsWhenKeyPress = {};
	static functionsWhenKeyRelease = {};
	
	// Constructor
	constructor(domElement, codeString) {
		super();
		
		this.domElement = domElement;
		this.code = codeString;
	}
	
	// Functions
	getFrequencyIndex = () => FrequencyUtil.codeToFreqIndex(this.code);
	
	isPressing = () => this.domElement.classList.contains("pressed");
	
	pressKey = (ignoreAdditionalFunctions = false) => {
		logDebug("Piano Key", "pressKey() called at", this.code);
		
		if(!this.isPressing() && this.playStack == 0) {
			if(engine.loadedSoundfont.pcmCache[this.getFrequencyIndex()] && this.assignedVoiceSlot == -1) {
				this.assignedVoiceSlot = engine.playPcmOnAvailableVoiceSlot(engine.loadedSoundfont.pcmCache[FrequencyUtil.codeToFreqIndex(this.code)]);
			}
			
			this.domElement.classList.add("pressed");
			super.dispatchEvent(new Event("press"));
		}
		
		this.playStack++;
		
		if(!ignoreAdditionalFunctions) Object.values(PianoKey.functionsWhenKeyPress).forEach((f) => f(this));
	}
	
	releaseKey = (ignoreAdditionalFunctions = false) => {
		logDebug("Piano Key", "releaseKey() called at", this.code);
		this.playStack--;

		if(this.playStack == 0) {
			if(this.assignedVoiceSlot >= 0) {
				engine.stopPlayOnVoiceSlot(this.assignedVoiceSlot);
				this.assignedVoiceSlot = -1;
			}
			
			this.domElement.classList.remove("pressed");
			super.dispatchEvent(new Event("release"));
		}
		
		if(!ignoreAdditionalFunctions) Object.values(PianoKey.functionsWhenKeyRelease).forEach((f) => f(this));
	}
}

class PianoRollBuilder extends StaticClass {
	static buildInto = (containerElement) => {
		let pianoKeyObjects = {};
		
		const buildWhiteKeyArea = () => {
			const whiteKeyIndexes = [0, 2, 4, 5, 7, 9, 11];  // FrequencyUtil.SCALE_MAP
			const container = $ce("div");
			container.id = "piano_roll_white_container";
			
			for(let octave = LOWEST_OCTAVE; octave <= HIGHEST_OCTAVE; octave++) {
				whiteKeyIndexes.forEach((value, index) => {
					let whiteKeyElement = $ce("div");
					let code = `${Object.keys(FrequencyUtil.SCALE_CHAR_MAP)[value]}${octave}`;
					whiteKeyElement.classList.add("piano_key");
					whiteKeyElement.classList.add("piano_key_white");
					whiteKeyElement.dataset["code"] = code;
					
					container.append(whiteKeyElement);
					pianoKeyObjects[code] = new PianoKey(whiteKeyElement, code);
				});
			}
			
			return container;
		};
		
		const buildBlackKeyArea = () => {
			const blackKeyIndexes = [1, 3, -1, 6, 8, 10, -2];  // FrequencyUtil.SCALE_MAP, -1 is space
			const container = $ce("div");
			container.id = "piano_roll_black_container";
			
			for(let octave = LOWEST_OCTAVE; octave <= HIGHEST_OCTAVE; octave++) {
				blackKeyIndexes.forEach((value, index) => {
					let blackKeyElement = $ce("div");
					let code = `${Object.keys(FrequencyUtil.SCALE_CHAR_MAP)[value]}${octave}`; 
					blackKeyElement.classList.add("piano_key");
					blackKeyElement.classList.add("piano_key_black");
					
					if(value <= -1) {
						if(value == -2 && octave == HIGHEST_OCTAVE) {
							return;
						} else {
							blackKeyElement.classList.add("piano_key_black_space");
						}
					} else {
						blackKeyElement.dataset["code"] = code;
						pianoKeyObjects[code] = new PianoKey(blackKeyElement, code);
					}
					
					container.append(blackKeyElement);
				});
			}
			
			return container;
		};
	
		containerElement.prepend(buildBlackKeyArea());
		containerElement.prepend(buildWhiteKeyArea());
		
		return pianoKeyObjects;
	};
}

class PianoToolsHandler extends StaticClass {
	// Functions
	static handle = (toolName, state) => {
		logDebug("Piano Tools", `Handling ${toolName}`);
		
		switch(toolName) {
			case "octave_1down":
			case "octave_1up": {
				if(typeof state == "boolean") {		// TODO: use addEventListener
					if(state == true) {
						PianoKey.functionsWhenKeyPress[toolName] = (pianoKey) => {
							let targetPianoKey = REGISTERED_PIANO_KEYS[FrequencyUtil.shiftCodeOctave(pianoKey.code, (toolName === "octave_1down" ? -1 : 1))];
							
							if(targetPianoKey) targetPianoKey.pressKey(true);
						};
						PianoKey.functionsWhenKeyRelease[toolName] = (pianoKey) => {
							let targetPianoKey = REGISTERED_PIANO_KEYS[FrequencyUtil.shiftCodeOctave(pianoKey.code, (toolName === "octave_1down" ? -1 : 1))];
							
							if(targetPianoKey) targetPianoKey.releaseKey(true);
						};
					} else {
						delete PianoKey.functionsWhenKeyPress[toolName];
						delete PianoKey.functionsWhenKeyRelease[toolName];
					}
				}
				break;
			}
		}
	};
}
