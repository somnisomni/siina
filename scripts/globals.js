/*
 * Global constants & variables
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/*** 사용자 설정 가능한 전역 상수 ─ User-adjustable global constants ***/
// ENABLE_DEBUG_LOGGING : 디버그 로깅 사용 여부
//     값 형식 : true / false
//     설정한 값에 따라 브라우저 콘솔에 디버그용 로그의 출력 여부가 결정됩니다.
const ENABLE_DEBUG_LOGGING = false;


// IGNORE_TAB_KEY : Tab 키 무시 여부
//     값 형식 : true / false
//     설정한 값에 따라 Tab 키의 키보드 이벤트를 무시할 지의 여부가 결정됩니다.
const IGNORE_TAB_KEY = true;


// MAX_VOICES : 동시에 출력 가능한 오디오 개수
//     값 형식 : 정수 숫자
//     설정한 값에 따라 다중 건반 연주 시 CPU 및 메모리 사용량의 차이가 발생할 수 있습니다.
const MAX_VOICES = 32;


// LOWEST_OCTAVE : 연주 가능한 최소 옥타브
// HIGHEST_OCTAVE : 연주 가능한 최대 옥타브
//     값 형식 : 정수 숫자 (HIGHEST_OCTAVE >= LOWEST_OCTAVE)
//     Siina에서 연주할 수 있는 옥타브 범위입니다. 범위를 줄이면 메모리 사용량이 줄어들 수 있지만, 연주할 수 있는 음계의 범위가 제한됩니다.
const LOWEST_OCTAVE = 2;
const HIGHEST_OCTAVE = 7;


// SAMPLING_RATE : 앱 전역에서 사용할 오디오 샘플링 레이트
//     값 형식 : 정수 숫자 (22050, 44100, 48000, 96000, 192000... 등 정규 샘플링 레이트 값)
//     기본값 : ((new (AudioContext || webkitAudioContext)()).sampleRate) || 44100  // 기본적으로 사용자 기기의 기본 샘플링 레이트를 가져오지만, 값을 가져오는데 실패할 경우 44100Hz 사용
//     설정한 값에 따라 소리의 품질, CPU 및 메모리 사용량의 차이가 발생할 수 있습니다. 권장 값은 44100 혹은 48000 입니다.
const SAMPLING_RATE = ((new (AudioContext || webkitAudioContext)()).sampleRate) || 44100;
/*** === ***/


/* Global constants & functions */
const VERSION = "0.0.4-preview";
window.addEventListener("load", () => { document.title += ` v${VERSION}`; });

const logDebug = (title, ...objs) => {
	if(ENABLE_DEBUG_LOGGING) {
		console.debug.apply(null, [`[${title.toUpperCase()}]`, objs].flat());
	}
};
logDebug("Global", "Debug logging enabled");
const logError = (title, ...objs) => {
	console.error.apply(null, [`[${title.toUpperCase()}]`, objs].flat());
};
/* === */

/* Global Regular Expressions */
const REGEXP_TONE_CODE = /^([A-G]\#?)(\d+)$/;
const REGEXP_TONE_CODE_FULL_TONE = /^([A-G])(\d+)$/;
const REGEXP_TONE_CODE_HALF_TONE = /^([A-G]\#)(\d+)$/;
/* === */

/* Globals validation */
(() => {
	if(LOWEST_OCTAVE > HIGHEST_OCTAVE) {
		alert("최소 옥타브(LOWEST_OCTAVE) 값이 최대 옥타브(HIGHEST_OCTAVE) 값보다 큽니다. scripts/globals.js 파일을 수정한 후 새로 고침을 해주시기 바랍니다.");
		window.close();
		window.history.back();
	}
})();
/* === */
