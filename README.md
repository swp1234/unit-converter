# 단위 변환기 Pro (Unit Converter Pro)

## 개요

**단위 변환기 Pro**는 일상에서 필요한 다양한 단위를 실시간으로 변환하는 PWA(Progressive Web App)입니다.

### 주요 기능

✅ **실시간 단위 변환** - 입력하면서 바로 변환 결과 표시
✅ **한국 전통 단위 지원** - 평, 돈, 냥, 되, 홉 등 전통 단위 변환
✅ **6가지 카테고리** - 길이, 무게, 온도, 부피, 넓이, 속도
✅ **즐겨찾기 기능** - 자주 사용하는 변환 저장
✅ **변환 기록** - 최근 변환 50개 자동 저장
✅ **고급 단위 변환** - 프리미엄 콘텐츠로 추가 단위 제공
✅ **오프라인 지원** - PWA로 인터넷 없이도 사용 가능
✅ **반응형 디자인** - 모든 디바이스 지원

## 기술 스택

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **PWA:** Service Worker, Web Manifest
- **Storage:** LocalStorage (즐겨찾기, 기록)
- **Design:** 2026 UI/UX 트렌드 (Glassmorphism, Microinteractions, Dark Mode First)

## 변환 카테고리

### 1. 길이 (Length)
- 평 (pyeong) ↔ 제곱미터 (㎡)
- 킬로미터 (km) ↔ 미터 (m)

### 2. 무게 (Weight)
- 킬로그램 (kg) ↔ 파운드 (lb)
- 돈 (don) ↔ 냥 (nyang) - 한국 전통 단위

### 3. 온도 (Temperature)
- 섭씨 (℃) ↔ 화씨 (℉)
- 켈빈 (K) 변환

### 4. 부피 (Volume)
- 리터 (L) ↔ 갤런 (gal)
- 되 (doe) ↔ 홉 (hop) - 한국 전통 단위

### 5. 넓이 (Area)
- 제곱미터 (㎡) ↔ 평 (pyeong)
- 에이커 (acre) 변환

### 6. 속도 (Speed)
- 시간당 킬로미터 (km/h) ↔ 시간당 마일 (mph)
- 초당 미터 (m/s) 변환

## 설정 및 실행

### 로컬 테스트

```bash
# 프로젝트 디렉토리로 이동
cd unit-converter

# Python 내장 서버로 실행
python -m http.server 8000

# 브라우저에서 열기
http://localhost:8000
```

### 직접 열기

`index.html` 파일을 브라우저에서 직접 열기

## 파일 구조

```
unit-converter/
├── index.html              # 메인 HTML
├── manifest.json           # PWA 설정
├── sw.js                   # Service Worker
├── css/
│   └── style.css          # 스타일 (Glassmorphism, 다크모드)
├── js/
│   ├── app.js             # 메인 애플리케이션 로직
│   └── conversion-data.js  # 변환 공식 및 프리미엄 콘텐츠
└── README.md
```

## 2026 UI/UX 트렌드 적용

✨ **Glassmorphism 2.0** - `backdrop-filter: blur(10px)` 효과
✨ **Microinteractions** - 탭 전환, 스왑 버튼, 터치 피드백
✨ **Dark Mode First** - 어두운 배경이 기본 (라이트 모드는 선택 옵션)
✨ **Minimalist Flow** - 한 번에 한 카테고리만 표시
✨ **Progress & Statistics** - 최근 변환, 즐겨찾기 시각화
✨ **Personalization** - LocalStorage로 사용자 데이터 저장
✨ **Accessibility** - 44px+ 터치 타겟, 충분한 색상 대비

## 프리미엄 콘텐츠

**"고급 단위 변환 보기"** 버튼을 클릭하면:
1. 5초 광고 표시 (AdSense 준비)
2. 기본 변환에 없는 고급 단위 제공
   - 길이: 나노미터, 밀리미터, 인치, 야드, 마일
   - 무게: 그램, 온스, 밀리그램, 톤, 스톤
   - 온도: 켈빈 추가 변환
   - 부피: 밀리리터, 컵, 파인트, 배럴
   - 넓이: 제곱센티미터, 제곱피트, 헥타르
   - 속도: 노트, 초당 피트

## 광고 영역

- **상단 배너** - 페이지 상단에 고정
- **하단 배너** - 페이지 하단에 고정
- **전면 광고** - 10번 변환마다 자동 표시 (5초 카운트다운)

## LocalStorage 데이터

```javascript
{
    "favorites": [
        {
            "id": 1707...,
            "category": "length",
            "inputs": [
                { "value": "10", "unit": "pyeong", "label": "평" },
                { "value": "33.06", "unit": "sqm", "label": "제곱미터" }
            ]
        }
    ],
    "history": [
        {
            "id": 1707...,
            "fromValue": "10",
            "fromUnit": "pyeong",
            "toValue": "33.06",
            "toUnit": "sqm",
            "category": "length",
            "timestamp": "14:30:45"
        }
    ]
}
```

## 변환 정확도

모든 변환 공식은 국제 표준 단위 변환을 따릅니다.

- **1평 (pyeong)** = 3.305785 ㎡
- **1kg** = 2.20462 lb
- **1°C → °F** = (°C × 9/5) + 32
- **1L** = 0.264172 gal
- **1km/h** = 0.621371 mph

## 호환성

- ✅ Chrome/Edge 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ 모바일 브라우저 (iOS Safari, Chrome Mobile)

## PWA 설치

### 데스크톱 (Chrome)
1. 주소창의 "설치" 버튼 클릭
2. "앱 설치" 확인

### 모바일 (Android)
1. 메뉴 → "홈 화면에 추가"
2. 앱 설치 완료

### iOS
1. Safari 공유 버튼
2. "홈 화면에 추가"
3. 앱 설치 완료

## 성능

- **초기 로딩:** < 1초 (캐시됨)
- **오프라인:** 완전 지원
- **번들 크기:** ~ 45KB (압축)

## 라이센스

MIT License

## 지원

문제가 발생하면 다음을 확인하세요:
1. 브라우저 개발자 도구 (F12) → Console 확인
2. 캐시 지우기 및 새로고침
3. Service Worker 상태 확인 (DevTools → Application → Service Workers)

## 업데이트 이력

### v1.0.0 (2026-02-07)
- 초기 버전 출시
- 6가지 카테고리 지원
- 한국 전통 단위 지원
- 즐겨찾기 & 기록 기능
- PWA & 오프라인 지원
- 프리미엄 콘텐츠
