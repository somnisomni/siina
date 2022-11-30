/*
 * JSON raw strings for Settings flyout
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

const JSON_FLYOUT_SETTINGS_APPEARANCE = String.raw`
{
	"category_domain": "appearance",
	"category_title": "모양",
	
	"settings": {
		"enable_filter_effect": {
			"default": "1",
			"type": "binary",
			"title": "필터 효과 활성화",
			"description": "블러 등의 꾸밈 효과를 활성화합니다. 비활성화 시 UI 성능이 향상됩니다. 이 설정은 페이지를 새로고침해야 적용됩니다."
		},
		"enable_transition": {
			"default": "1",
			"type": "binary",
			"title": "화면 전환 효과 활성화",
			"description": "각종 전환 효과 및 애니메이션을 활성화합니다. 이 설정은 페이지를 새로고침해야 적용됩니다."
		}
	}
}`;

const JSON_FLYOUT_SETTINGS_MOUSE = String.raw`
{
	"category_domain": "mouse",
	"category_title": "마우스 연주",
	
	"settings": {
		"enable_mouse_play": {
			"default": "1",
			"type": "binary",
			"title": "마우스로 연주 활성화"
		}
	}
}`;

const JSON_FLYOUT_SETTINGS_KEYBOARD = String.raw`
{
	"category_domain": "keyboard",
	"category_title": "키보드 연주",
	
	"settings": {
		"enable_keyboard_play": {
			"default": "1",
			"type": "binary",
			"title": "키보드로 연주 활성화"
		},
		"default_octave_offset": {
			"default": "0",
			"type": "enum",
			"title": "기준 옥타브 오프셋",
			"description": "값이 0일 때 4옥타브가 기준입니다.",
			"enum": {
				"1": "+1 (1옥타브 증가)",
				"0": "0 (기본 옥타브)",
				"-1": "-1 (1옥타브 감소)"
			}
		}
	}
}`;
	
const JSON_FLYOUT_SETTINGS_PIANO_ROLL = String.raw`
{
	"category_domain": "piano_roll",
	"category_title": "피아노 롤",
	
	"settings": {
		"enable_mouse_drag_scroll": {
			"default": "1",
			"type": "binary",
			"title": "마우스 드래그로 피아노 롤 스크롤 활성화"
		},
		"mouse_drag_scroll_threshold": {
			"default": "25",
			"type": "enum",
			"title": "마우스 드래그 스크롤 임계 강도",
			"description": "스크롤이 활성화되기 위한 드래그 속도의 정도입니다.",
			"enum": {
				"10": "약하게",
				"25": "보통",
				"50": "강하게",
				"75": "매우 강하게"
			}
		}
	}
}`;

const JSON_FLYOUT_SETTINGS_SOUNDFONT = String.raw`
{
	"category_domain": "soundfont",
	"category_title": "사운드폰트",

	"settings": {
		"enable_save_last_selection": {
			"default": "1",
			"type": "binary",
			"title": "마지막으로 선택한 사운드폰트 기억",
			"description": "다음에 Siina 실행 시 마지막으로 선택한 사운드폰트를 자동으로 선택하고 불러옵니다."
		}
	}
}`;
