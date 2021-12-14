/*
 * JSON raw strings for built-in Soundfonts
 *
 *   ⓒ 20-700***** *** a.k.a. SDSK
 */

/**/

const JSON_BUILTIN_SOUNDFONTS = String.raw`
[
	{
		"group_name": "기본 파형",
		"items": [
			{
				"id": "sin",
				"display_name": "Sine (사인파)",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "사인 함수를 사용한 단발진 사운드폰트입니다.<br><br><code>y = sin(x)</code>",
				"attributes": {
					"osc": [{ "waveform": "sine" }]
				}
			},
			{
				"id": "saw",
				"display_name": "Saw (톱니파)",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "톱니 모양 파형을 사용하는 단발진 사운드폰트입니다.<br><br><code>y = (x - 180) / 180</code>",
				"attributes": {
					"osc": [{ "waveform": "sawtooth" }]
				}
			},
			{
				"id": "sqr",
				"display_name": "Square (사각파)",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "사각형 모양 파형을 사용하는 단발진 사운드폰트입니다.<br><br><code>y = if x < 180 then 1 else 0</code>",
				"attributes": {
					"osc": [{ "waveform": "square" }]
				}
			},
			{
				"id": "tri",
				"display_name": "Triangle (삼각파)",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "삼각형 모양 파형을 사용하는 단발진 사운드폰트입니다.<br><br><code>y = {\n  x' = x\n\n  if x' >= 180 then x' -= 180\n  if x' > 90 then x' = 180 - x'\n  x' = x' / 90\n\n  if x < 180 then return x'\n  else return -x'\n}</code>",
				"attributes": {
					"osc": [{ "waveform": "triangle" }]
				}
			},
			{
				"id": "noise",
				"display_name": "White Noise (화이트 노이즈)",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "랜덤 PCM 데이터로 채워진 화이트 노이즈입니다.<br><br><code>y = random(-1, 1)</code>",
				"attributes": {
					"osc": [{ "waveform": "noise" }]
				}
			}
		]
	},
	{
		"group_name": "사운드폰트",
		"items": [
			{
				"id": "sin_tri",
				"display_name": "Sine + Triangle with frequency offset",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "주파수 오프셋 + 다중 발진기 테스트용이자 심심해서 만들어 본 간단한 칩튠풍 사운드폰트입니다.<br>대부분의 고전 오락실 게임 BGM을 연주하면 꽤 어울립니다.<br>5옥타브 이상에서 연주하는 것을 추천합니다.",
				"attributes": {
					"master_amp": {
						"value": 1,
						"adsr": {
							"attack": 0.01,
							"decay": 0.01,
							"sustain": 1.0,
							"release": 0.1
						}
					},
					"osc": [
						{
							"waveform": "sine",
							"freq_offset": 10
						},
						{
							"waveform": "triangle",
							"amp": 0.8,
							"freq_offset": 20
						}
					]
				}
			},
			{
				"id": "somni_harmony_of_mice",
				"display_name": "[somni] Harmony of Mice",
				"author": "병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "삼각파 + 사인파 화음에 스윕형 ADSR을 적용한 사운드폰트입니다.",
				"attributes": {
					"master_amp": {
						"value": 1,
						"adsr": {
							"attack": 0.2,
							"decay": 0.01,
							"sustain": 0.0,
							"release": 0.01
						}
					},
					"osc": [
						{
							"waveform": "triangle",
							"amp": 0.75
						},
						{
							"waveform": "sine",
							"amp": 0.2,
							"octave": 1,
							"freq_offset": 10
						},
						{
							"waveform": "sine",
							"amp": 0.15,
							"octave": -1,
							"freq_offset": 5
						},
						{
							"waveform": "sine",
							"amp": 0.1,
							"octave": -2,
							"freq_offset": -5
						},
						{
							"waveform": "sine",
							"amp": 0.025,
							"octave": 2,
							"freq_offset": -30
						}
					]
				}
			},
			{
				"id": "piano_ljs",
				"display_name": "예비역 ***님 피아노 파형",
				"author": "예비역 ***<br>병812기 *** <small>(a.k.a. somni / SDSK)</small>",
				"description": "지금은 예비역인 *** 님께서 댓글로 달아주신 음악코딩 파형을 포팅한 사운드폰트입니다.<br><br><code>sin1:1 +sin2:0.1 +sin3:0.32 +sin4:0.06 +sin5:0.05 +sin6:0.05 +sin8:0.02 +sin9:0.01 +sin10:0.01 +sin11:0.01 +sin12:0.01 !a10 !d3000 !s0 !r250</code><br><br><a target='_blank' href='http://***.**.***/*****'>댓글 보러가기</a>",
				"attributes": {
					"master_amp": {
						"value": 0.5,
						"adsr": {
							"attack": 0.1,
							"decay": 3.0,
							"sustain": 0.0,
							"release": 0.25
						}
					},
					"osc": [
						{
							"waveform": "sine"
						},
						{
							"waveform": "sine",
							"octave": 1,
							"amp": 0.1
						},
						{
							"waveform": "sine",
							"octave": 2,
							"amp": 0.32
						},
						{
							"waveform": "sine",
							"octave": 3,
							"amp": 0.06
						},
						{
							"waveform": "sine",
							"octave": 4,
							"amp": 0.05
						},
						{
							"waveform": "sine",
							"octave": 5,
							"amp": 0.05
						},
						{
							"waveform": "sine",
							"octave": 7,
							"amp": 0.02
						},
						{
							"waveform": "sine",
							"octave": 8,
							"amp": 0.01
						},
						{
							"waveform": "sine",
							"octave": 9,
							"amp": 0.01
						},
						{
							"waveform": "sine",
							"octave": 10,
							"amp": 0.01
						},
						{
							"waveform": "sine",
							"octave": 11,
							"amp": 0.01
						}
					]
				}
			}
		]
	}
]`;
