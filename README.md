# cdb-intro-webapp

클라우드데이터베이스기초 자기소개 웹앱. 원페이지(S01 Home · S02 소개 · S03 프로젝트 · S04 연락처 · S05 방명록).

## 아키텍처

방문자 → CloudFront(HTTPS, OAC) → S3(퍼블릭 액세스 차단) · 페이지 JS → AppSync(GraphQL) → DynamoDB

- 1주차: 정적 사이트 + S3/CloudFront 배포 (프로젝트 데이터는 `app.js`의 정적 배열)
- 다음 주차: AppSync `listProjects` · `listGuestbook` · `addGuestbook` + DynamoDB 연동

## 로컬 실행

```bash
python3 -m http.server 8712
```

## 배포

```bash
./deploy.sh
```

`deploy.sh`는 S3에 파일을 동기화하고 CloudFront 캐시를 무효화합니다.
