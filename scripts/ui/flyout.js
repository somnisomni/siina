/*
 * Script for flyouts
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

class Flyout {
	// Members
	flyoutElement = null;
	flyoutOutsideMouseDownCallback = (mouseEvent) => {
		if(!(mouseEvent.path.find((x) => ((x.classList != undefined && x.classList.contains("flyout_initiator")) || (x.id == this.flyoutElement.id))))) {
			this.close();
		}
	};
	
	// Constructor
	constructor(flyoutElement) {
		if(flyoutElement) {
			this.flyoutElement = flyoutElement;
			logDebug("Flyout", `Flyout registered. (element ID : #${flyoutElement.id})`);
		} else {
			throw new Error("Argument `flyoutElement` is undefined or null, while constructing Flyout class.");
		}
	}
	
	// Static functions
	static registerClickEventForInitiator = (initiatorElement, flyoutObject) => {
		initiatorElement.addEventListener("click", () => flyoutObject.show(initiatorElement.dataset["flyoutContentName"]));
	};
	
	static isAnyFlyoutShown() {
		return document.body.classList.contains("flyout_shown") || false;
	}
	
	// Functions
	isShown = () => Flyout.isAnyFlyoutShown() && (this.flyoutElement.classList.contains("flyout_shown") || false);
	
	show = (contentName) => {
		if(!this.isShown()) {
			if(this.flyoutElement.querySelector(".flyout_content.current")) {
				this.flyoutElement.querySelectorAll(".flyout_content.current").forEach((v) => v.classList.remove("current"));
			}
			this.flyoutElement.querySelector(`.flyout_content[data-name='${contentName}']`).classList.add("current");
			
			logDebug("Flyout", `Flyout ${this.flyoutElement.id} is being shown`);
			document.body.classList.add("flyout_shown");
			this.flyoutElement.classList.add("flyout_shown");
			
			document.addEventListener("mousedown", this.flyoutOutsideMouseDownCallback);
		}
	};
	
	close = () => {
		if(this.isShown()) {
			logDebug("Flyout", `Flyout ${this.flyoutElement.id} is being closed`);
			document.body.classList.remove("flyout_shown");
			this.flyoutElement.classList.remove("flyout_shown");
			
			document.removeEventListener("mousedown", this.flyoutOutsideMouseDownCallback);
		}
	};
}
