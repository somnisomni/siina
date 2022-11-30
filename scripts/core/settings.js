/*
 * Script for manage application settings
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

class Settings {
	domain = "sdsk.siina";
	
	constructor(domainName) {
		this.domain = domainName ? domainName : "sdsk.siina";
	}
	
	get = (propertyName, defaultValue /* optional */) => {
		if(window.localStorage[`${this.domain}.${propertyName}`] == undefined) {
			return defaultValue || null;
		} else {
			let value = window.localStorage.getItem(`${this.domain}.${propertyName}`);
			
			if(value == "true") value = true;
			else if(value == "false") value = false;
			else if(!isNaN(parseFloat(value)) && !value.startsWith("0")) value = parseFloat(value);
			
			return value;
		}
	};
	
	set = (propertyName, value) => {
		window.localStorage.setItem(`${this.domain}.${propertyName}`, value);
		
		return (window.localStorage[`${this.domain}.${propertyName}`] != undefined) &&
					 (window.localStorage.getItem(`${this.domain}.${propertyName}`) == value)
	};
	
	remove = (propertyName) => {
		window.localStorage.removeItem(`${this.domain}.${propertyName}`);
		
		return window.localStorage[`${this.domain}.${propertyName}`] == undefined;
	};
	
	clearDomainSettings = () => {
		const domainSettings = Object.keys(window.localStorage).filter((value) => value.toString().startsWith(this.domain));
		
		domainSettings.forEach((value) => window.localStorage.removeItem(value));
		
		return Object.keys(window.localStorage).filter((value) => value.toString().startsWith(this.domain)).length == 0;
	};
}
