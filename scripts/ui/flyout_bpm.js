/*
 * Script for BPM measuring flyout
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

window.addEventListener("load", () => {
	const flyoutContainer = $q("#right_flyout_container #bpm_flyout_container");
	const bpmButton = flyoutContainer.querySelector("#bpm_click_button");
	const bpmButtonClickText = bpmButton.querySelector("#bpm_click_text");
	const bpmButtonInteger = bpmButton.querySelector("#bpm_int");
	const bpmButtonDecimal = bpmButton.querySelector("#bpm_decimal");
	
	const resetThresholdMiliseconds = 3000;
	let resetTimeout = -1;
	let previous = -10000;
	let timeDiffSum = 0;
	let clickCount = 0;
	

	function bpmButtonClick() {
		bpmButton.classList.add("pressing");

		const targetPianoKey = REGISTERED_PIANO_KEYS[clickCount % 4 == 0 ? "C5" : "G4"];
		if(!targetPianoKey.isPressing()) {
			targetPianoKey.pressKey();
			setTimeout(() => { targetPianoKey.releaseKey(); }, 100);
		}

		const now = window.performance.now();
		
		if(now - previous < resetThresholdMiliseconds) {
			timeDiffSum += now - previous;
			
			const bpm = 60 / ((timeDiffSum / clickCount) / 1000);
			
			if(bpmButtonClickText.style.display != "none") bpmButtonClickText.style.display = "none";
			
			bpmButtonInteger.innerText = Math.floor(bpm);
			bpmButtonDecimal.innerText = (bpm - Math.floor(bpm)).toFixed(2).replace("0.", ".").replace("1.", ".");
		} else {
			if(bpmButtonClickText.style.display == "none") bpmButtonClickText.style.display = "";
			bpmButtonInteger.innerText = "";
			bpmButtonDecimal.innerText = "";

			timeDiffSum = 0;
			clickCount = 0;
		}
		
		if(resetTimeout != -1) clearTimeout(resetTimeout);
		resetTimeout = setTimeout(() => {
			if(bpmButtonClickText.style.display == "none") bpmButtonClickText.style.display = "";
			bpmButtonInteger.innerText = "";
			bpmButtonDecimal.innerText = "";
			resetTimeout = -1;
		}, resetThresholdMiliseconds);
		
		clickCount += 1;
		previous = now;
	}
	
	bpmButton.addEventListener("pointerdown", bpmButtonClick);
	bpmButton.addEventListener("pointerup", () => { bpmButton.classList.remove("pressing"); });
	bpmButton.addEventListener("pointercancel", () => { bpmButton.classList.remove("pressing"); });

	window.addEventListener("keydown", (event) => {
		if(event.keyCode == 32) {		// SPACEBAR
			if(Flyout.isAnyFlyoutShown() && $q("#right_flyout_container .flyout_content.current").dataset["name"] == "bpm") {
				bpmButtonClick();
			}
		}
	});
	
	window.addEventListener("keyup", (event) => {
		if(event.keyCode == 32) {
			if(Flyout.isAnyFlyoutShown() && $q("#right_flyout_container .flyout_content.current").dataset["name"] == "bpm") {
				bpmButton.classList.remove("pressing");
			}
		}
	});
});
