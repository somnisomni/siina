/*
 * Script for processing audio
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/* Frequency Utility */
class FrequencyUtil extends StaticClass {
	// Static members
	static SCALE_MAP = {
		C: 0,
		C_SHARP: 1,
		D: 2,
		D_SHARP: 3,
		E: 4,
		F: 5,
		F_SHARP: 6,
		G: 7,
		G_SHARP: 8,
		A: 9,
		A_SHARP: 10,
		B: 11
	};

	static SCALE_CHAR_MAP = {
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

	// Static functions
	static scaleToFreq = (scale, octave) => (440.0 * Math.pow(2, (scale - 9 + (octave - 4) * 12) / 12.0));

	static codeToFreqIndex = (codeString) => {
		if(codeString && REGEXP_TONE_CODE.test(codeString)) {  /* octave range: 0 ~ 9 */
			try {
				const regExpExec = REGEXP_TONE_CODE.exec(codeString);
				const scaleChar = regExpExec[1];
				const octaveChar = parseInt(regExpExec[2]) || -1;

				if(this.SCALE_CHAR_MAP[scaleChar] == undefined) return null;
				if(octaveChar < 0) return null;

				return `${this.SCALE_CHAR_MAP[scaleChar]}${octaveChar}`;
			} catch {
				return null;
			}
		} else return null;
	};

	static freqIndexToCode = (freqIndex) => {
		if(freqIndex) {
			freqIndex = freqIndex.toString();

			const scaleIndex = freqIndex.length === 3 ? freqIndex[0] + '' + freqIndex[1] : freqIndex[0];
			const octaveIndex = parseInt(freqIndex[freqIndex.length == 3 ? 2 : 1]);

			return `${Object.keys(this.SCALE_CHAR_MAP)[scaleIndex]}${octaveIndex}`;
		}
	};

	static shiftCodeOctave = (codeString, shiftScale) => {
		if(codeString && REGEXP_TONE_CODE.test(codeString)) {
			try {
				const regExpExec = REGEXP_TONE_CODE.exec(codeString);
				const scaleChar = regExpExec[1];
				const octaveChar = parseInt(regExpExec[2]) || -1;

				if(this.SCALE_CHAR_MAP[scaleChar] == undefined) return null;
				if(octaveChar < 0) return null;

				return `${scaleChar}${parseInt(octaveChar) + shiftScale}`;
			} catch {
				return null;
			}
		} else return null;
	};
}
/* === */

/* PCM Generator */
class PCMGenerator extends StaticClass {
	// Static functions
	static generatePcm = (freq, dur, func) => {
		if(freq < 1) {
			// Frequency less than 1 can cause Out of Memory.
			// This will prevent it.
			throw new Error("Too low frequency specified; must be equal or more than 1");
		}

		let pcmData = new Array(Math.ceil(dur * SAMPLING_RATE));

		let degree = 0;
		let degreeStep = 360.0 / (SAMPLING_RATE / freq);

		for(let t = 0; t < pcmData.length; ++t) {
			pcmData[t] = func(degree);

			degree += degreeStep;
			if(degree >= 360) degree -= 360;
		}

		// Pulse finishing
		while(degree < 360) {
			const pcm = func(degree);
			pcmData.push(pcm);

			degree += degreeStep;
		}

		return pcmData;
	};

	static createNoise = (amp, dur) => this.generatePcm(SAMPLING_RATE, dur, (deg) => Math.random() * amp);
	static createSinWave = (freq, amp, dur) => this.generatePcm(freq, dur, (deg) => Math.sin(degToRad(deg)) * amp);
	static createSqrWave = (freq, amp, dur) => this.generatePcm(freq, dur, (deg) => deg < 180 ? amp : -amp);
	static createSawWave = (freq, amp, dur) => this.generatePcm(freq, dur, (deg) => ((deg - 180.0) / 180.0 * amp));
	static createTriWave = (freq, amp, dur) => this.generatePcm(freq, dur, (deg) => {
		let degTemp = deg;

		if(degTemp >= 180) degTemp -= 180;
		if(degTemp > 90) degTemp = 180 - degTemp;
		degTemp = degTemp / 90.0 * amp;

		if(deg < 180) return degTemp;
		else return -degTemp;
	});
}
/* === */

/* Audio Chunk Generator */
let AudioChunkGenerator;
(() => {
	AudioChunkGenerator = {
		createUsingPcmData: (pcmData) => {
			const audioChunk = new AudioChunk();
			audioChunk.buffer = audioChunk.audioContext.createBuffer(1, pcmData.length, audioChunk.samplingRate);

			let channelObj = audioChunk.getLoadedBuffer();
			for(let i = 0; i < pcmData.length; ++i) channelObj[i] = pcmData[i];

			return audioChunk;
		},
		createEmpty: () => new AudioChunk()
	};
	Object.freeze(AudioChunkGenerator);
})();
/* === */

/* Audio Chunk class */
class AudioChunk {
	// Members
	buffer = null;
	node = null;
	audioContext = new (AudioContext || webkitAudioContext)();
	samplingRate = this.audioContext.sampleRate;
	gainNode = this.audioContext.createGain();
	beginTime = 0;
	/* == test */
	attackInterval = -1;
	/* == */

	// Functions
	isLoaded = () => this.buffer != null;
	isPlaying = () => (this.node != null && (this.audioContext.currentTime < this.beginTime + this.getDuration() || this.node.loop));
	loadBuffer = (pcmData) => {
		this.stop();

		this.buffer = this.audioContext.createBuffer(1, pcmData.length, this.samplingRate);

		let channelObj = this.getLoadedBuffer();
		for(let i = 0; i < pcmData.length; ++i) channelObj[i] = pcmData[i];
	};
	unloadBuffer = async () => {
		await this.stop();

		this.buffer = null;
	};
	setVolume = (volume) => this.gainNode.gain.value = volume;
	getDuration = () => this.isLoaded() ? this.buffer.sampleRate : 0;
	getCurrentTime = () => this.node != null ? Math.min(this.audioContext.currentTime - this.beginTime, this.getDuration()) : 0;
	getLoadedBuffer = () => this.isLoaded() ? this.buffer.getChannelData(0) : null;
	getVolume = () => this.gainNode.gain.value;
	play = async (loop) => {
		if(this.isLoaded()) {
			/* == test */
			let attack = TEST_ATTACK || -1;
			if(attack > 0) {
				this.setVolume(0);
			} else {
				this.setVolume(1);
			}
			/* == */

			this.node = this.audioContext.createBufferSource();
			this.node.buffer = this.buffer;
			this.node.loop = loop || false;

			this.node.connect(this.gainNode);
			this.gainNode.connect(this.audioContext.destination);

			this.node.start(0);

			this.beginTime = this.audioContext.currentTime;

			/* == test */
			if(attack > 0) {
				await new Promise((resolve) => {
					let attackStep = 1 / (attack / 10);

					this.attackInterval = setInterval(() => {
						this.setVolume(this.getVolume() + attackStep);

						if(this.getVolume() >= 1) {
							resolve();
							clearInterval(this.attackInterval);
						}
					}, 10);
				});
			}
			/* == */
		} else {
			throw new Error("This AudioChunk has not been loaded.");
		}
	};
	stop = async () => {
		if(this.node != null) {
			/* == test */
			let release = TEST_RELEASE || 200;
			if(release > 0) {
				await new Promise((resolve) => {
					let releaseStep = this.getVolume() / (release / 10);
					clearInterval(this.attackInterval);

					let interval = setInterval(() => {
						this.setVolume(this.getVolume() - releaseStep);

						if(this.getVolume() <= 0) {
							resolve();
							clearInterval(interval);
						}
					}, 10);
				});
			}
			/* == */

			this.node.stop(0);

			this.gainNode.disconnect();
			this.node.disconnect();
			this.node = null;
		}
	};
}
/* === */
