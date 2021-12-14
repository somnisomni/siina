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
	toneInfo = null;
	assignedVoiceSlot = -1;
	playStack = 0;
	
	// Static Members
	static functionsWhenKeyPress = {};
	static functionsWhenKeyRelease = {};
	
	// Constructor
	constructor(domElement, toneInfo) {
		super();
		
		this.domElement = domElement;
		this.toneInfo = toneInfo;
	}
	
	// Functions
	isPressing() {
		this.domElement.classList.contains("pressed");
	}
	
	pressKey(ignoreAdditionalFunctions = false) {
		logDebug("Piano Key", "pressKey() called at", this.toneInfo.code);
		
		if(!this.isPressing() && this.playStack == 0) {
			if(this.assignedVoiceSlot == -1) {
				this.assignedVoiceSlot = engine.playOnAvailableSlot(this.toneInfo);
			}
			
			this.domElement.classList.add("pressed");
			super.dispatchEvent(new Event("press"));
		}
		
		this.playStack++;
		
		if(!ignoreAdditionalFunctions) Object.values(PianoKey.functionsWhenKeyPress).forEach((f) => f(this));
	}
	
	releaseKey(ignoreAdditionalFunctions = false) {
		logDebug("Piano Key", this.playStack, "releaseKey() called at", this.toneInfo.code);
		this.playStack--;

		if(this.playStack == 0) {
			if(this.assignedVoiceSlot >= 0) {
				engine.stopOnSlot(this.assignedVoiceSlot);
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
			const whiteKeyIndexes = [0, 2, 4, 5, 7, 9, 11];
			const container = $ce("div");
			container.id = "piano_roll_white_container";
			
			for(let octave = LOWEST_OCTAVE; octave <= HIGHEST_OCTAVE; octave++) {
				whiteKeyIndexes.forEach((value, index) => {
					const whiteKeyElement = $ce("div");
					const toneInfo = new ToneInfo(value, octave);

					whiteKeyElement.classList.add("piano_key");
					whiteKeyElement.classList.add("piano_key_white");
					whiteKeyElement.dataset["code"] = toneInfo.code;
					
					container.append(whiteKeyElement);
					pianoKeyObjects[toneInfo.code] = new PianoKey(whiteKeyElement, toneInfo);
				});
			}
			
			return container;
		};
		
		const buildBlackKeyArea = () => {
			const blackKeyIndexes = [1, 3, -1, 6, 8, 10, -2];
			const container = $ce("div");
			container.id = "piano_roll_black_container";
			
			for(let octave = LOWEST_OCTAVE; octave <= HIGHEST_OCTAVE; octave++) {
				blackKeyIndexes.forEach((value, index) => {
					const blackKeyElement = $ce("div");

					blackKeyElement.classList.add("piano_key");
					blackKeyElement.classList.add("piano_key_black");
					
					if(value <= -1) {
						if(value == -2 && octave == HIGHEST_OCTAVE) {
							return;
						} else {
							blackKeyElement.classList.add("piano_key_black_space");
						}
					} else {
						const toneInfo = new ToneInfo(value, octave);

						blackKeyElement.dataset["code"] = toneInfo.code;
						pianoKeyObjects[toneInfo.code] = new PianoKey(blackKeyElement, toneInfo);
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
	static registeredTools = {};

	// Functions
	static register = (toolName, callback) => {
		if(typeof(callback) == "function") {
			let newRegisteredTools = {};
			Object.assign(newRegisteredTools, this.registeredTools);
			
			newRegisteredTools[toolName] = callback;
			this.registeredTools = newRegisteredTools;

			Object.preventExtensions(this.registeredTools);
			
			logDebug("Piano Tools", `Callback registered for ${toolName}`);
		} else {
			throw new TypeError("Argument `callback` is not a function");
		}
	};
	
	static handle = (toolName, state) => {
		logDebug("Piano Tools", `Handling ${toolName}`);
		
		switch(toolName) {
			case "octave_1down":
			case "octave_1up": {
				if(typeof state == "boolean") {		// TODO: use addEventListener
					if(state == true) {
						PianoKey.functionsWhenKeyPress[toolName] = (pianoKey) => {
							let targetPianoKey = REGISTERED_PIANO_KEYS[(new ToneInfo(pianoKey.toneInfo.scale, pianoKey.toneInfo.octave + (toolName == "octave_1down" ? -1 : 1))).code];
							
							if(targetPianoKey) targetPianoKey.pressKey(true);
						};
						PianoKey.functionsWhenKeyRelease[toolName] = (pianoKey) => {
							let targetPianoKey = REGISTERED_PIANO_KEYS[(new ToneInfo(pianoKey.toneInfo.scale, pianoKey.toneInfo.octave + (toolName == "octave_1down" ? -1 : 1))).code];
							
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
