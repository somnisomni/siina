/*
 * JSON raw strings for Changelogs
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

const JSON_CHANGELOG = String.raw`
[
	{
		"version_string": "v0.0.4-preview",
		"release_date": "2021-05-03",
		"changelogs": [
			{
				"title": "피아노 롤",
				"content": [
					"피아노 롤 도구모음 추가<br><small>└ 높은/낮은 1옥타브 동시연주</small><br><small>└ 키패드로도 도구 토글 가능 (처음 도구부터 키패드 1~9)</small>",
					"흑건의 상단 마진 제거",
					"흑건 색상을 조금 밝게 수정",
					"마우스 클릭 버튼<small>(primary 버튼)</small>을 누를 때만 건반이 눌러지도록 수정"
				]
			},
			{
				"title": "사운드 컨트롤",
				"content": [
					"창 크기를 줄여 사운드 컨트롤 영역이 잘릴 때 스크롤이 불가했던 문제 수정"
				]
			},
			{
				"title": "설정",
				"content": [
					"피아노 롤 마우스 스크롤 임계 강도 값 조정<br><small>└ (5, 10, 15, 30 → 10, 25, 50, 75)</small>",
					"피아노 롤 마우스 연주 활성화 여부 설정 추가"
				]
			},
			{
				"title": "공통",
				"content": [
					"보이스 한도 기본값을 16 → 32로 늘림",
					"마우스 우클릭 메뉴 표시 방지"
				]
			},
			{
				"dev_changelog": true,
				"content": [
				    "피아노 건반 마우스 입력 이벤트를 포인터 입력 이벤트로 변경 (터치 대응)<br><small>└ <code>mousedown</code> → <code>pointerdown</code><br>└ <code>mouseup</code> → <code>pointerup/pointercancel</code></small>",
					"피아노 건반의 중복 입력을 <code>init.js</code>의 키보드 이벤트에서 감지하는 것이 아닌 <code>PianoKey.pressKey</code>에서 감지하는 것으로 변경",
					"피아노 건반의 최소 크기를 <code>min-height</code> 대신 <code>@media (max-height: 600px)</code>에서 지정 <small>(사운드 컨트롤 영역 스크롤 문제 수정을 위함)</small>",
					"<code>body.flyout_shown</code> 스타일을 <code>main.css</code>에서 <code>flyout.css</code>로 이동",
					"<code>pianoKeys</code> 변수명을 <code>REGISTERED_PIANO_KEYS</code>로 변경"
				]
			}
		]
	},
	{
		"version_string": "v0.0.3-preview",
		"release_date": "2021-02-01",
		"changelogs": [
			{
				"title": "피아노 롤",
				"content": [
					"마우스 클릭한 건반과 키보드로 누르는 건반이 겹치면 소리가 겹치는 문제 수정"
				]
			},
			{
				"title": "사운드폰트",
				"content": [
					"테스트용 야매 Attack, Release 구현 추가"
				]
			},
			{
				"title": "UI",
				"content": [
					"Flyout 배경에 블러 효과 추가",
					"사운드폰트 로딩 등의 작업 시 대화창이 정상적으로 표시되도록 수정",
					"Tab 키 이벤트 무시"
				]
			},
			{
				"title": "설정",
				"content": [
					"피아노 롤 마우스 스크롤 임계 강도 값 조정<br><small>└ (4, 8, 12, 20 → 5, 10, 15, 30)</small>",
					"설정 중 '키보드 연주 ─ 기준 옥타브 오프셋'의 값 선택 방식 변경 <small>(숫자 입력 → 드롭다운)</small>"
				]
			},
			{
				"title": "공통",
				"content": [
					"보이스 한도 기본값을 8 → 16으로 늘림"
				]
			},
			{
				"dev_changelog": true,
				"content": [
					"설정 UI에서 저장된 설정을 불러올 때 <code>&lt;select&gt;</code>의 옵션이 적용될 수 없는 경우 기본값으로 fallback",
					"이제 변경 사항 영역은 JSON 기반으로 작성되고 스크립트를 통해 DOM이 생성됨 <small><code>(json/changelog.js)</code></small>",
					"설정 Flyout의 설정 항목 JSON을 파일로 분리 <small><code>(json/flyout_settings.js)</code></small>",
					"<code>global.js</code>에 <code>IGNORE_TAB_KEY</code> 상수 추가",
					"<code>PianoKey</code> 클래스 추가, 모든 피아노 건반마다 <code>PianoKey</code> 오브젝트에 할당 <small>(오디오 재생 관련 중복 코드 최소화, 코드만으로 피아노 건반 누르기 가능)</small>",
					"<code>core/engine.js</code>에 있던 키보드 키 이벤트를 <code>init.js</code>로 이동, <code>PianoKey</code> 오브젝트 활용에 맞게 수정",
					"<code>VoiceManager</code> 클래스를 <code>EventTarget</code>으로부터 상속, 관련 이벤트 발생",
					"페이지 상단 Voices<small>(보이스 점유 개수)</small>의 업데이트 방식을 <code>Event</code>로 처리",
					"<code>Settings</code>로 설정을 가져올 때 맨 앞 문자가 0으로 시작하는 숫자만으로 이루어진 값은 <code>number</code>형으로 변환되지 않게 수정",
					"설정 Flyout 내의 설정 항목 값 업데이트 관련 코드를 <code>init.js</code>에서 <code>ui/flyout_settings.js</code>로 이동",
					"<code>subpages</code> 폴더 생성, <code>information.html</code>을 <code>subpages</code> 폴더 안으로 이동",
					"<code>FrequencyUtil.codeToFreqIndex</code> 함수에서 반음 체크를 전역 RegExp 상수를 활용하도록 수정",
					"<code>logError</code> 전역 함수 추가",
					"NotoSansKR Medium 두께 폰트 제거 <small>(앱 용량 감소 목적)</small>"
				]
			}
		]
	},
	{
		"version_string": "v0.0.2-preview",
		"release_date": "2021-01-11",
		"changelogs": [
			{
				"title": "피아노 롤",
				"content": [
					"마우스로 건반을 누른 후 피아노 롤을 벗어나 마우스 버튼을 떼면 건반이 계속 눌러져 있는 현상 제거"
				]
			},
			{
				"title": "UI",
				"content": [
					"Tab 키를 누르면 입력 요소에 포커스가 옮겨지지 않도록 설정<br><small>└ (Thanks to 19-700***** *** 전우님)</small>",
					"Flyout* 가로 크기 확장 (300px → 400px)",
					"정보 및 변경 사항 Flyout에 내용 추가"
				]
			},
			{
				"title": "설정",
				"content": [
					"설정 Flyout에 각종 설정 항목 추가"
				]
			},
			{
				"dev_changelog": true,
				"content": [
					"피아노 롤 UI 영역은 이제 스크립트를 통해 생성됨 <small><code>(ui/piano_roll.js)</code></small>",
					"<code>siina.html</code> 내 모든 스크립트를 파일로 분리 (init.js)",
					"<code>Settings.get()</code>을 할 때 <code>bool</code>이나 <code>number</code>형 값은 자동으로 컨버팅",
					"Flyout 관련 기능 <code>class</code>화",
					"Flyout 관련 콘솔 디버그 로그 추가",
					"<code>AsyncDialog</code> 구현을 <code>static class</code> 형태로 변경",
					"<code>FrequencyUtil</code> 구현을 <code>static class</code> 형태로 변경",
					"<code>PCMGenerator</code> 구현을 <code>static class</code> 형태로 변경",
					"전역 기본 샘플링 레이트 값을 <code>globals.js</code>에 추가",
					"Flyout 관련 스타일시트를 메인 스타일시트로부터 분리"
				]
			}
		]
	},
	{
		"version_string": "v0.0.1-preview",
		"release_date": "2020-12-29",
		"changelogs": [
			{
				"title": "최초 공개 버전"
			}
		]
	}
]`;
