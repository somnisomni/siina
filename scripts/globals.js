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
const MAX_VOICES = 64;


// LOWEST_OCTAVE : 연주 가능한 최소 옥타브
// HIGHEST_OCTAVE : 연주 가능한 최대 옥타브
//     값 형식 : 정수 숫자 (HIGHEST_OCTAVE >= LOWEST_OCTAVE)
//     Siina에서 연주할 수 있는 옥타브 범위입니다. 범위를 줄이면 메모리 사용량이 줄어들 수 있지만, 연주할 수 있는 음계의 범위가 제한됩니다.
const LOWEST_OCTAVE = 2;
const HIGHEST_OCTAVE = 7;
/*** === ***/


/* Global constants & functions */
const VERSION = "1.0.0";
window.addEventListener("load", () => {
	logDebug("Global", "Debug logging enabled");
	document.title += ` v${VERSION}`;
});
/* === */

/* Globals validation */
(() => {
	if(LOWEST_OCTAVE > HIGHEST_OCTAVE) {
		alert("최소 옥타브(LOWEST_OCTAVE) 값이 최대 옥타브(HIGHEST_OCTAVE) 값보다 큽니다. scripts/globals.js 파일을 수정한 후 새로 고침을 해주시기 바랍니다.");
		window.stop();
		window.close();
		window.history.back();
		
		throw new Error("LOWEST_OCTAVE > HIGHEST_OCTAVE");
	}
})();
/* === */
