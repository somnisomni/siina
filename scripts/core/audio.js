/*
 * Script for processing audio
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* Tone Utility */
class ToneUtil extends StaticClass {
	// Static members
	static SCALE_MAP = {
		"C": 0,
		"C#": 1,
		"D": 2,
		"D#": 3,
		"E": 4,
		"F": 5,
		"F#": 6,
		"G": 7,
		"G#": 8,
		"A": 9,
		"A#": 10,
		"B": 11
	};
	
	static REGEXP_TONE_CODE = /^([A-G]\#?)(\d+)$/;
	static REGEXP_TONE_CODE_FULL_TONE = /^([A-G])(\d+)$/;
	static REGEXP_TONE_CODE_HALF_TONE = /^([A-G]\#)(\d+)$/;
}
/* === */

class ToneInfo {
	// Members
	_scale = null;
	_octave = null;

	// Constructor
	constructor(scale, octave) {
		this.scale = scale;
		this.octave = octave;
	}
	
	// Getters
	get scale() {
		return this._scale;
	}
	
	get octave() {
		return this._octave;
	}

	get frequency() {
		return 440.0 * Math.pow(2, (this.scale - 9 + (this.octave - 4) * 12) / 12.0)
	}
	
	get index() {
		return `${this.scale}${this.octave}`;
	}
	
	get code() {
		return `${Object.keys(ToneUtil.SCALE_MAP)[this.scale]}${this.octave}`;
	}
	
	// Setters
	set scale(value) {
		if(!isFinite(value)) {
			throw new TypeError("Not a valid number.");
		}
		
		if(value < 0 || value > 11) {
			throw new RangeError("New scale value must within 0 ~ 11.");
		}
		
		this._scale = value;
	}
	
	set octave(value) {
		if(!isFinite(value)) {
			throw new TypeError("Not a valid number.");
		}
		
		this._octave = value;
	}
}

/* Oscillator wrapper (for co-op between OscillatorNode and AudioBufferSourceNode) */
class OscillatorWrapper {
	parentAudioContext = null;
	oscGainNode = null;

	oscillator = null;
	oscType = "sine";
	noiseBuffer = null;
	noiseBufferSource = null;

	constructor(audioContext, gain, type, frequency = 440) {
		this.parentAudioContext = audioContext;
		this.oscType = type;

		this.oscGainNode = audioContext.createGain();
		this.oscGainNode.gain.value = gain;
		
		if(type !== "noise") {
			this.oscillator = audioContext.createOscillator();
			this.oscillator.type = type;
			this.oscillator.frequency.value = frequency;
			
			this.oscillator.connect(this.oscGainNode);
		} else {
			this.noiseBuffer = audioContext.createBuffer(1, 1 * audioContext.sampleRate, audioContext.sampleRate);

			const data = this.noiseBuffer.getChannelData(0);
			
			for(let i = 0; i < data.length; i++) {
				data[i] = Math.random() * 2 - 1;
			}
			
			this.noiseBufferSource = audioContext.createBufferSource();
			this.noiseBufferSource.buffer = this.noiseBuffer;
			this.noiseBufferSource.loop = true;
			this.noiseBufferSource.connect(this.oscGainNode);
		}
	}
	
	connect(node) {
		this.oscGainNode.connect(node);
	}

	start(beginTime) {
		if(this.oscType !== "noise") {
			this.oscillator.start(beginTime);
		} else {
			this.noiseBufferSource.start(beginTime);
		}
	}
	
	stop() {
		if(this.oscType !== "noise") {
			this.oscillator.stop();
		} else {
			this.noiseBufferSource.stop();
		}
	}
}

/* Audio Unit */
class AudioUnit extends EventTarget {
	/**
	 * Events fire:
	 *   - "playstart" : Dispatched when audio play started successfully
	 *   - "playstop" : Dispatched when audio play stopped successfully
	 **/

	// Members
	audioContext = null;
	unitGainNode = null;
	oscillators = new Array();
	
	unitToneInfo = null;
	
	_isPlaying = false;
	
	_stopReleaseCheckInterval = -1;
	
	// Constructor
	constructor(toneInfo = null) {
		if(toneInfo && !(toneInfo instanceof ToneInfo)) {
			throw new TypeError("ToneInfo instance must be given.");
		}
		
		super();

		this.audioContext = new (AudioContext || webkitAudioContext)();
		this.unitGainNode = this.audioContext.createGain();
		this.unitGainNode.connect(this.audioContext.destination);
		this.unitToneInfo = toneInfo;
		
		this.audioContext.resume();
	}
	
	// Getters
	get isPlaying() {
		return this._isPlaying;
	}
	
	get isReady() {
		return this.unitToneInfo && true;
	}
	
	// Functions
	play() {
		if(this.isReady) {
			if(this.isPlaying) {
				const timePreStart = this.audioContext.currentTime;
				this.unitGainNode.gain.cancelScheduledValues(timePreStart);
				this.unitGainNode.gain.setValueAtTime(this.unitGainNode.gain.value, timePreStart);
				this.oscillators.forEach((e) => { e.stop(); });
				this.oscillators = new Array();
				this._isPlaying = false;
			}
			
			// OSCILLATOR SETUP
			for(const oscInfo of engine.soundfont.oscillators) {
				const osc = new OscillatorWrapper(this.audioContext, oscInfo.amp, oscInfo.waveform, (new ToneInfo(this.unitToneInfo.scale, this.unitToneInfo.octave + oscInfo.octaveRelative)).frequency + oscInfo.freqOffset);
				osc.connect(this.unitGainNode);
				
				this.oscillators.push(osc);
			}
			
			// START
			const timeBegin = this.audioContext.currentTime;
			this.oscillators.forEach((e) => { e.start(timeBegin); });
			this.unitGainNode.gain.setValueAtTime(0, timeBegin);
			
			// ATTACK
			const timeAttack = timeBegin + engine.soundfont.masterAmpAdsr.attack;
			
			if(engine.soundfont.masterAmpAdsr.attack > 0) {
				this.unitGainNode.gain.linearRampToValueAtTime(engine.soundfont.masterAmp, timeAttack);
			} else {
				this.unitGainNode.gain.setValueAtTime(engine.soundfont.masterAmp, timeAttack);
			}
			
			// DECAY & SUSTAIN
			this.unitGainNode.gain.setTargetAtTime(
				engine.soundfont.masterAmpAdsr.sustain * engine.soundfont.masterAmp,
				timeAttack,
				engine.soundfont.masterAmpAdsr.decay);

			// EVENT DISPATCH
			this._isPlaying = true;
			clearInterval(this._stopReleaseCheckInterval);
			super.dispatchEvent(new Event("playstart"));
		}
	}
	
	async stop() {
		return new Promise((resolve) => {
			if(this.isPlaying) {
				// RELEASE
				const timeRelease = this.audioContext.currentTime;
				this.unitGainNode.gain.cancelScheduledValues(timeRelease);
				this.unitGainNode.gain.setValueAtTime(this.unitGainNode.gain.value, timeRelease);
				this.unitGainNode.gain.setTargetAtTime(0, timeRelease, engine.soundfont.masterAmpAdsr.release);
				
				this._stopReleaseCheckInterval = setInterval(() => {
					if(this.unitGainNode.gain.value < 0.001) {
						this.oscillators.forEach((e) => { e.stop(); });
						this.oscillators = new Array();

						this.unitGainNode.gain.cancelScheduledValues(this.audioContext.currentTime);
						this.unitGainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

						// EVENT DISPATCH
						this._isPlaying = false;
						resolve();
						super.dispatchEvent(new Event("playstop"));

						clearInterval(this._stopReleaseCheckInterval);
						this._stopReleaseCheckInterval = -1;
					}
				}, 100);
			}
		});
	}
}
