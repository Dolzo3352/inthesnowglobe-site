# 하얀 눈이 내려올 때면 · 소개 사이트

빌드 과정이 없는 정적 사이트입니다. `index.html`, `styles.css`, `main.js`, `assets/`가 전부입니다.

## 로컬에서 보기
`index.html`을 브라우저로 열거나, 이 폴더에서 `npx serve` 실행.

## Vercel 배포
1. 이 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 New Project → 저장소 선택 → Framework Preset은 **Other**, 빌드 명령 없이 Deploy.
   (또는 이 폴더에서 `npx vercel --prod`)

## 글과 이미지 고치기
- 글: `index.html` 안의 문장을 바로 고치면 됩니다.
- 이야기 8장면 이미지: `assets/s1.webp` ~ `s8.webp` (정사각형, 원 안에 표시됨)
- 히어로 배경: `assets/village.webp`, 영상: `assets/playthrough.mp4`
