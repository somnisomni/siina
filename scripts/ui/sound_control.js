/*
 * Sound control UI builder
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

class RadialKnob extends EventTarget {
	/**
		Events fire:
			`valueChange` ─ Fired when the value has changed
	**/

	_name = "Unnamed";
	_helpMessage = "Help message";
	_disabled = false;
	_adjustable = true;
	_min = 0;
	_max = 1;
	_step = 0.05;
	_value = 0.5;
	_valueUnit = "";
	_decimal = true;
	_small = false;

	knobParentElement = null;
	knobElement = null;

	constructor(options = null) {
		super();

		/* options = {
		 *   name: string = "Unnamed",
		 *   helpMessage: string = "Help message",
		 *   disabled: boolean = false,
		 *   adjustable: boolean = true,
		 *   min: number = 0,
		 *   max: number = 1,
		 *   step: number = 0.05,
		 *   value: number = 0.5,
		 *   valueUnit: string = "",
		 *   decimal: boolean = true,
		 *   small: boolean = false
		 * }
		 */

		this._name = options.name || "Unnamed";
		this._helpMessage = options.helpMessage || "Help message";
		this._disabled = options.disabled ?? false;
		this._adjustable = options.adjustable ?? true;
		this._min = isFinite(options.min) ? options.min : 0;
		this._max = isFinite(options.max) ? options.max : 1;
		this._step = isFinite(options.step) ? options.step : 0.05;
		this._value = isFinite(options.value) ? options.value : 0.5;
		this._valueUnit = options.valueUnit || "";
		this._decimal = options.decimal ?? true;
		this._small = options.small ?? false;
	}
	
	get desiredRotateDegree() {
		// mapping to -150deg ~ 150deg
		if(this.value >= this.max) {
			return 150;
		} else if(this.value <= this.min) {
			return -150;
		} else {
			return (300 * ((this.value - this.min) / (this.max - this.min))) - 150;
		}
	}
	
	get name() { return this._name; }
	get disabled() { return this._disabled; }
	get adjustable()  { return this._adjustable; }
	get min() { return this._min; }
	get max() { return this._max; }
	get step() { return this._step; }
	get value() { return this._value; }
	get valueString() {
		if(this._decimal) {
			return `${this.value.toFixed(2)} ${this._valueUnit}`;
		} else {
			return `${this.value.toFixed(0)} ${this._valueUnit}`;
		}
	}
	
	set name(value) {
		this._name = value;
		
		this,updateKnobUI();
	}
	
	set disabled(value) {
		this._disabled = value;
		
		this.updateKnobUI();
	}

	set min(value) {
		if(!isFinite(value)) throw new TypeError("Valid number must be given");
		
		if(value > this.max) {
			logWarn("Sound Control - Radial Knob", "Given minimum value is greater than maximum value. No changes will be made.");
		} else {
			this._min = value;

			this.updateKnobUI();
		}
	}
	
	set max(value) {
		if(!isFinite(value)) throw new TypeError("Valid number must be given");

		if(value < this.min) {
			logWarn("Sound Control - Radial Knob", "Given maximum value is lesser than minimum value. No changes will be made.");
		} else {
			this._max = value;

			this.updateKnobUI();
		}
	}
	
	set step(value) {
		if(!isFinite(value)) throw new TypeError("Valid number must be given");
		
		this._step = step;
	}
	
	set value(value) {
		if(!isFinite(value)) throw new TypeError("Valid number must be given");

		if(value > this.max) {
			logWarn("Sound Control - Radial Knob", "Given value is greater than maximum value. Will be ramped to maximum value.");
			this._value = this.max;
		} else if(value < this.min) {
			logWarn("Sound Control - Radial Knob", "Given value is lesser than minimum value. Will be ramped to minimum value.");
			this._value = this.min;
		} else {
			this._value = value;
		}

		const event = new CustomEvent("valueChange");
		event.initCustomEvent("valueChange", false, false, { newValue: this._value });
		super.dispatchEvent(event);
		this.updateKnobUI();
	}
	
	updateKnobUI() {
		if(this.knobElement) {
			this.knobElement.style.transform = `rotateZ(${this.desiredRotateDegree}deg)`;
		}
		
		if(this.knobParentElement) {
			if(this.disabled) {
				this.knobParentElement.classList.add("disabled");
			} else {
				this.knobParentElement.classList.remove("disabled");
			}

			const nameElement = this.knobParentElement.querySelector(".name");
			if(nameElement.innerText != this.name) nameElement.innerText = this.name;
			
			const valueElement = this.knobParentElement.querySelector(".value");
			if(valueElement.innerText != this.valueString) valueElement.innerText = this.valueString;
		}
	}

	buildElement() {
		if(!this.knobElement) {
			this.knobParentElement = $ce("div");
			this.knobParentElement.classList.add("radial_knob_container");
			if(this._small) this.knobParentElement.classList.add("small");
			this.knobParentElement.title = this._helpMessage;

			/* 노브 영역 */
			this.knobElement = $ce("div");
			this.knobElement.classList.add("radial_knob");
			
			const knobPointElement = $ce("div");
			knobPointElement.classList.add("point");
			this.knobElement.append(knobPointElement);
			
			{ // Listener part
				let mousePressing = false;

				this.knobElement.addEventListener("pointerdown", () => { mousePressing = true; });
				this.knobElement.addEventListener("pointerup", () => { mousePressing = false; });
				this.knobElement.addEventListener("pointerleave", () => { mousePressing = false; });

				this.knobElement.addEventListener("pointermove", (event) => {
					if(mousePressing) {
						// TODO
					}
				});
				
				this.knobElement.addEventListener("mousewheel", (event) => {
					if(this.adjustable) {
						event.preventDefault();
						event.stopPropagation();
						
						const direction = event.deltaY < 0 ? true : false; // false: down, true: up
						
						if(direction) {
							if(this.value + this.step < this.max + this.step) {
								this.value = parseFloat((this.value + this.step).toPrecision(4))
							}
						} else {
							if(this.value - this.step > this.min - this.step) {
								this.value = parseFloat((this.value - this.step).toPrecision(4));
							}
						}
					}
				}, { passive: false });
			}
			
			this.knobParentElement.append(this.knobElement);
			/* */
			
			/* 노브 설명 영역 */
			const detailsContainer = $ce("div");
			detailsContainer.classList.add("details");
			
			const nameElement = $ce("div");
			nameElement.classList.add("name");
			nameElement.innerText = this._name;
			detailsContainer.append(nameElement);
			
			const valueElement = $ce("div");
			valueElement.classList.add("value");
			valueElement.innerText = this._value;
			valueElement.addEventListener("click", async () => {
				if(this.adjustable) {
					try {
						const newVal = await AsyncDialog.showInputDialog(this._name, this._helpMessage, this._value.toString(), true);
						
						if(!isFinite(newVal)) {
							alert("숫자 값을 입력하세요.");
							throw new TypeError("Valid number must be given");
						}

						// Don't set value through RadialKnob.value; allowing values over the limit
						this._value = parseFloat(newVal);
						const event = new CustomEvent("valueChange");
						event.initCustomEvent("valueChange", false, false, { newValue: this._value });
						super.dispatchEvent(event);
						this.updateKnobUI();
					} catch {
						// NO ACTION
					}
				}
			});
			detailsContainer.append(valueElement);
			
			this.knobParentElement.append(detailsContainer);
			/* */

			this.updateKnobUI();
			return this.knobParentElement;
		} else {
			throw new Error("Knob element built already!");
		}
	}
}

class OscillatorControl extends EventTarget {
	/**
		Events fire:
			`waveChange` ─ Fired when the wave shape selection has changed
			`requireUIUpdate` ─ Fired when manual UI update is required
	**/
	
	buildControlUI(soundfont, type) {
		const parentElement = $ce("div");

		for(let index = 1; index <= soundfont.oscillators.length; index++) {
			const oscInfo = soundfont.oscillators[index - 1];

			const controlContainerElement = $ce("div");
			controlContainerElement.classList.add("subsubcontainer");

			/* 개별 발진기 아이템 타이틀 영역 */
			const oscItemTitleArea = $ce("div");
			oscItemTitleArea.classList.add("subsubcontainer_title_area");
			
			// 타이틀
			const oscItemTitle = $ce("span");
			oscItemTitle.classList.add("subsubcontainer_title");
			oscItemTitle.innerText = `발진기 #${index}`;
			oscItemTitleArea.append(oscItemTitle);
			
			if(type === "custom") {
				// 기능
				const oscItemTitleFunctions = $ce("div");
				oscItemTitleFunctions.classList.add("subsubcontainer_title_functions");
				
				// └ 발진기 제거 아이콘
				const oscItemTitleFunctionsRemove = $ce("div");
				oscItemTitleFunctionsRemove.classList.add("function_icon_button");
				oscItemTitleFunctionsRemove.title = "발진기 제거";

				oscItemTitleFunctionsRemove.addEventListener("click", () => {
					if(soundfont.oscillators.length > 1) {
						soundfont.removeOscillatorByIndex(index - 1);
						
						super.dispatchEvent(new Event("requireUIUpdate"));
					} else {
						alert("발진기는 최소 한 개 이상 있어야 합니다.");
					}
				});
			
				const oscItemTitleFunctionsRemoveIcon = $ce("i");
				oscItemTitleFunctionsRemoveIcon.classList.add("fa", "fa-trash");
				oscItemTitleFunctionsRemove.append(oscItemTitleFunctionsRemoveIcon);
				
				oscItemTitleFunctions.append(oscItemTitleFunctionsRemove);
				oscItemTitleArea.append(oscItemTitleFunctions);
			}
			controlContainerElement.append(oscItemTitleArea);
			/* */
			
			const contentContainer = $ce("div");
			contentContainer.classList.add("subsubcontainer_content");

			/* 노브 영역 */
			const knobParentElement = $ce("div");
			knobParentElement.classList.add("knobs", "contextual_item_container");
			
			const ampKnob = new RadialKnob({
				name: "앰프",
				helpMessage: "해당 발진기의 볼륨",
				adjustable: type === "custom",
				min: 0,
				max: 1,
				step: 0.05,
				value: oscInfo.amp
			});
			const relativeOctaveKnob = new RadialKnob({
				name: "상대 옥타브",
				helpMessage: "연주 건반의 옥타브에 대해 상대적인 옥타브 오프셋 값",
				adjustable: type === "custom",
				min: -5,
				max: 5,
				step: 1,
				value: oscInfo.octaveRelative,
				valueUnit: "옥타브",
				decimal: false,
				small: true
			});
			const frequencyOffsetKnob = new RadialKnob({
				name: "주파수 절대 오프셋",
				helpMessage: "연주하는 음의 주파수에 가해지는 절대적인 오프셋 값",
				adjustable: type === "custom",
				min: -100,
				max: 100,
				step: 1,
				value: oscInfo.freqOffset,
				valueUnit: "Hz",
				decimal: false,
				small: true
			});

			ampKnob.addEventListener("valueChange", (event) => { oscInfo.amp = event.detail.newValue; });
			relativeOctaveKnob.addEventListener("valueChange", (event) => { oscInfo.octaveRelative = event.detail.newValue; } );
			frequencyOffsetKnob.addEventListener("valueChange", (event) => { oscInfo.freqOffset = event.detail.newValue; } );

			knobParentElement.append(ampKnob.buildElement());
			knobParentElement.append(relativeOctaveKnob.buildElement());
			knobParentElement.append(frequencyOffsetKnob.buildElement());
			/* */
			
			/* 파형 선택 영역 */
			const waveSelectGroupElement = $ce("div");
			waveSelectGroupElement.classList.add("select_group", "contextual_item_container");
			
			for(const wave of [["sine", "사인파"], ["sawtooth", "톱니파"], ["square", "사각파"], ["triangle", "삼각파"], ["noise", "노이즈"]]) {
				const waveSelectItem = $ce("span");
				waveSelectItem.classList.add("select_item");
				if(wave[0] === oscInfo.waveform) waveSelectItem.classList.add("selected");
				waveSelectItem.dataset["value"] = wave[0];
				waveSelectItem.innerText = wave[1];
				
				const disableKnobForNoise = () => {
					if(waveSelectItem.dataset["value"] === "noise" && waveSelectItem.classList.contains("selected")) {
						if(relativeOctaveKnob && frequencyOffsetKnob) {
							relativeOctaveKnob.disabled = true;
							frequencyOffsetKnob.disabled = true;
						}
					} else {
						if(relativeOctaveKnob && frequencyOffsetKnob) {
							relativeOctaveKnob.disabled = false;
							frequencyOffsetKnob.disabled = false;
						}
					}
				};
				
				disableKnobForNoise();
				
				waveSelectItem.addEventListener("click", () => {
					if(type === "custom") {
						waveSelectGroupElement.querySelectorAll(".select_item.selected").forEach((e) => {
							e.classList.remove("selected");
						});
						
						waveSelectItem.classList.add("selected");
						
						disableKnobForNoise();
						
						const event = new CustomEvent("waveChange");
						event.initCustomEvent("waveChange", false, false, { index: index, waveform: waveSelectItem.dataset["value"] });
						super.dispatchEvent(event);
					}
				});
				
				waveSelectGroupElement.append(waveSelectItem);
			}
			
			contentContainer.append(waveSelectGroupElement);
			/* */
			
			/* 노브 영역은 파형 선택 영역 이후에 추가되어야 함 */
			contentContainer.append(knobParentElement);
			/* */

			controlContainerElement.append(contentContainer);
			parentElement.append(controlContainerElement);
		}
		
		return parentElement;
	}
}

class MasterControl extends EventTarget {
	buildControlUI(soundfont, type) {
		const parentElement = $ce("div");
		
		const controlContainerElement = $ce("div");
		controlContainerElement.classList.add("subsubcontainer");

		/* 마스터 앰프 아이템 타이틀 영역 */
		const masterAmpItemTitleArea = $ce("div");
		masterAmpItemTitleArea.classList.add("subsubcontainer_title_area");
		
		// 타이틀
		const masterAmpItemTitle = $ce("span");
		masterAmpItemTitle.classList.add("subsubcontainer_title");
		masterAmpItemTitle.innerText = "마스터 앰프";
		masterAmpItemTitleArea.append(masterAmpItemTitle);
		
		controlContainerElement.append(masterAmpItemTitleArea);
		/* */

		const contentContainer = $ce("div");
		contentContainer.classList.add("subsubcontainer_content");
		
		/* 마스터 앰프 영역 */
		// 노브 영역
		const knobParentElement = $ce("div");
		knobParentElement.classList.add("knobs", "contextual_item_container");

		const masterAmpKnob = new RadialKnob({
			name: "마스터 앰프",
			helpMessage: "사운드폰트의 최종 출력 볼륨",
			adjustable: type === "custom",
			min: 0,
			max: 1,
			step: 0.05,
			value: soundfont.masterAmp
		});
		const adsrAttackKnob = new RadialKnob({
			name: "Attack",
			helpMessage: "음 시작 시부터 볼륨이 100%까지 도달하는 데에 걸리는 시간",
			adjustable: type === "custom",
			min: 0,
			max: 10,
			step: 0.1,
			value: soundfont.masterAmpAdsr.attack,
			valueUnit: "s",
			small: true
		});
		const adsrDecayKnob = new RadialKnob({
			name: "Decay",
			helpMessage: "Attack 종료 후 지속 볼륨(Sustain)에 도달하는 데에 걸리는 시간",
			adjustable: type === "custom",
			min: 0,
			max: 10,
			step: 0.1,
			value: soundfont.masterAmpAdsr.decay,
			valueUnit: "s",
			small: true
		});
		const adsrSustainKnob = new RadialKnob({
			name: "Sustain",
			helpMessage: "Decay 종료 후 음이 재생되는 동안 유지되는 볼륨 비율",
			adjustable: type === "custom",
			min: 0,
			max: 100,
			step: 5,
			value: soundfont.masterAmpAdsr.sustain * 100,
			valueUnit: "%",
			decimal: false,
			small: true
		});
		const adsrReleaseKnob = new RadialKnob({
			name: "Release",
			helpMessage: "음 재생 종료 시 볼륨이 0%까지 도달하는 데에 걸리는 시간",
			adjustable: type === "custom",
			min: 0,
			max: 10,
			step: 0.1,
			value: soundfont.masterAmpAdsr.release,
			valueUnit: "s",
			small: true
		});

		masterAmpKnob.addEventListener("valueChange", (event) => { soundfont.masterAmp = event.detail.newValue; });
		adsrAttackKnob.addEventListener("valueChange", (event) => { soundfont.masterAmpAdsr.attack = event.detail.newValue; });
		adsrDecayKnob.addEventListener("valueChange", (event) => { soundfont.masterAmpAdsr.decay = event.detail.newValue; });
		adsrSustainKnob.addEventListener("valueChange", (event) => { soundfont.masterAmpAdsr.sustain = event.detail.newValue / 100; });
		adsrReleaseKnob.addEventListener("valueChange", (event) => { soundfont.masterAmpAdsr.release = event.detail.newValue; });

		knobParentElement.append(masterAmpKnob.buildElement());
		knobParentElement.append(adsrAttackKnob.buildElement());
		knobParentElement.append(adsrDecayKnob.buildElement());
		knobParentElement.append(adsrSustainKnob.buildElement());
		knobParentElement.append(adsrReleaseKnob.buildElement());

		contentContainer.append(knobParentElement);
		controlContainerElement.append(contentContainer);
		parentElement.append(controlContainerElement);
		
		return parentElement;
	}
}

class SoundfontInfoPanel extends EventTarget {
	/**
		Events fire:
			`requireUIUpdate` ─ Fired when manual UI update is required
	**/

	buildPanelUI(soundfont, type) {
		const parentElement = $ce("div");

		[["이름", "name"], ["제작자", "author"], ["설명", "description"]].forEach((title) => {
			const container = $ce("div");
			container.classList.add("subsubcontainer");

			const containerTitleArea = $ce("div");
			containerTitleArea.classList.add("subsubcontainer_title_area");
			const titleElement = $ce("span");
			titleElement.classList.add("subsubcontainer_title");
			titleElement.innerText = title[0];
			containerTitleArea.append(titleElement);

			if(type === "custom") {
				const titleFunctions = $ce("div");
				titleFunctions.classList.add("subsubcontainer_title_functions");
				const editButton = $ce("div");
				editButton.classList.add("function_icon_button");
				editButton.title = "수정";
				const editIcon = $ce("i");
				editIcon.classList.add("fa", "fa-edit");
				editButton.append(editIcon);
				titleFunctions.append(editButton);
				containerTitleArea.append(titleFunctions);
				
				editButton.addEventListener("click", async () => {
					const text = await AsyncDialog.showInputDialog(title[0], "HTML 문법을 사용할 수 있습니다.", soundfont[title[1]], false, title[1] === "description");
					
					soundfont[title[1]] = text;
					this.dispatchEvent(new Event("requireUIUpdate"));
				});
			}
			container.append(containerTitleArea);
			
			const textArea = $ce("div");
			textArea.classList.add("subsubcontainer_content");
			textArea.innerHTML = removeUnsafeHtmlMarkup(soundfont[title[1]]);
			container.append(textArea);
			
			parentElement.append(container);
		});
		
		return parentElement;
	}
}
