# 엔딩 배경 생성 기록

- 방식: 내장 ImageGen, 신규 이미지 1회 생성. API/CLI 폴백 사용 안 함.
- 최종 에셋: [cnu-evacuation-assembly.jpg](images/cnu-evacuation-assembly.jpg)
- 프로젝트 경로: `/Users/jaeminkim/FBIgame/FBIGame/assets/images/cnu-evacuation-assembly.jpg`
- 생성 원본: `/Users/jaeminkim/.codex/generated_images/01a074d8-f5b4-7420-8611-5cb75a1d7278/exec-da12016e-7a29-4d99-8aab-0f87f423bbb0.png`
- 용도: 건물 밖 구조 구역의 장면 배경, 탈출 성공·결과 화면.
- 최종 파일은 모바일 전송량을 줄이기 위해 긴 변 1600px JPEG(품질 82)로 변환. 장면 내용은 변경하지 않음.
- 검수: 성인 대학생과 구조대, 흐린 오후, 비유혈 장면 확인. 실제 충남대학교 건물 외관을 재현한 사진이 아닌 가상 이미지.

## 최종 생성 프롬프트

```text
Use case: photorealistic-natural
Asset type: Wide 16:9 final-scene background for a cinematic South Korean university zombie survival game, suitable for mobile contain display.
Primary request: A fictional South Korean university science building exterior evacuation assembly area after a zombie outbreak. A small group of adult university students seen from behind, wearing casual everyday clothes, gathered safely together with rescue workers at an exterior controlled perimeter.
Scene/backdrop: Realistic concrete academic building with a fictional generic facade, exterior campus paving, simple crowd-control barriers, a distant emergency vehicle with subtle emergency lights. Do not imply a real university or exact factual facade.
Style/medium: Photorealistic cinematic still, realistic human proportions, concrete and fabric textures, restrained dark science-fiction survival-game atmosphere.
Composition/framing: Landscape 16:9 wide establishing composition. The main group is centered and fully within frame, with comfortable space around heads and feet. Eye-level viewpoint from behind the students, allowing the science building and safe evacuation perimeter to be clearly visible.
Lighting/mood: Late-afternoon overcast daylight, enough natural light to clearly read people and architecture. Restrained relief mixed with exhaustion, grounded and quiet. The story takes place only sixty minutes after an afternoon field trip, so this must not look like dawn, sunrise, sunset, or night.
Constraints: All students are clearly adults. No nearby zombies, no blood, no visible wounds, no weapons, no text, no readable signage, no logos, no watermark. Generate exactly one image.
```
