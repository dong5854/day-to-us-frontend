# KIS 연금계좌 연결 (검증용)

연금 화면에서 기존 본인 명의 연금저축(22) 또는 IRP(29)에 KIS 실전투자 API 키를 연결한다. DC(55)는 지원하지 않는다. 커플 공간에는 동의 후 마스킹 계좌번호, 조회 잔고, 조회 시각만 공유된다. 키는 서버의 기존 AES-GCM 암호화 모듈로 저장한다. 프런트엔드 저장소에는 남기지 않으며 폼을 닫으면 입력을 지운다.

## 현재 범위

- 연결, 최초 조회, 마지막 정상 잔고, 수동 갱신(1분 간격), 일일 자동 갱신, 연결 해제.
- 명의자만 연결·수동 갱신·해제 가능. 연결된 계좌의 종류/명의자 변경은 해제 후 가능. 계좌 종료 시 연결정보도 삭제한다.
- 연결 해제는 저장한 키·토큰·조회 잔고를 삭제한다. KIS에서 발급한 API 키 자체는 폐기하지 않는다.
- 납입 기록과 자산 잔고는 별개다. API 잔고를 세액공제 납입액으로 변환하거나 가계부에 기록하지 않는다.
- 잔고 요약만 조회한다. 개별 보유 상품 목록은 이번 범위에 포함하지 않는다.

## 배포·활성화 순서

1. DB 백업 후 서버 저장소의 `scripts/add-kis-connection.sql` 적용.
2. 백엔드부터 배포하고 프런트엔드를 배포.
3. 서버 환경변수 `KIS_ALLOWED_EMAILS`에 테스트 사용자의 로그인 이메일을 쉼표로 구분해 설정. 기본 빈 값이면 신규 연결/동기화가 꺼져 있다. 기존 연결의 조회·해제는 가능하다.
4. 사용자는 연금 화면에서 본인 계좌를 등록한 뒤 연결 폼에 키를 직접 입력. 키를 채팅·소스코드·빌드 환경변수에 넣지 않는다.
5. 실계좌 앱의 금액과 API 결과를 대조한 뒤 확대 여부 결정.

## 아직 필요한 검증

- 연금저축 22는 국내주식 잔고 `TTTC8434R`, IRP 29는 퇴직연금 잔고 `TTTC2208R` 요청을 구현했다. 실제 계좌별 신청·조회 가능 여부는 실계좌 검증 전이다.
- IRP 샘플에는 주식/ETF/ETN만 조회 가능하고 펀드 및 DC55는 조회 불가라고 명시되어 있다. 전체 연금자산과 일치한다고 보장하지 않는다.
- 올해 개인 납입액/이전금/퇴직금 구분 데이터는 확보하지 않았다. 절세 집계는 기존 수동 확인 방식 유지.
- 개인 API 키 방식의 다중 사용자 서비스 이용 조건 및 제휴 필요 여부는 KIS에 확인해야 한다. 확인 전 공개 서비스 전체 사용자에게 활성화하지 않는다.
- 브라우저/PWA 실기기 시각 검증과 실계좌 호출은 미실시.

## 공식 참고

- https://github.com/koreainvestment/open-trading-api/blob/main/kis_devlp.yaml
- https://github.com/koreainvestment/open-trading-api/blob/main/examples_llm/domestic_stock/pension_inquire_balance/pension_inquire_balance.py
- https://github.com/koreainvestment/open-trading-api/blob/main/examples_llm/domestic_stock/inquire_balance/inquire_balance.py
- https://apiportal.koreainvestment.com/intro

## 금융기관 UI 추가

연금 계좌의 공통 연결 진입점은 `PensionConnections.tsx`이다. 기관 목록에 `id`, `name`, `description`, `Connection`을 등록하면 금융기관 선택 화면에 표시된다. 각 `Connection` 컴포넌트는 `PensionProviderProps`를 받아 연결된 계좌 요약과 해당 기관의 인증 폼을 제공한다. API 통신은 기관별 hook/API 파일에 둔다.

현재 실제 연결 가능한 기관은 한국투자증권뿐이다. 다른 기관은 실제 API와 인증이 구현된 뒤 목록에 추가한다. 계좌 직접 추가는 금융기관 연동 여부와 무관하게 제공한다.
