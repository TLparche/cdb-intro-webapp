// 1주차: 정적 데이터. 2주차부터 AppSync listProjects / listGuestbook / addGuestbook으로 교체.
const EMAIL = 'TODO@example.com';

const PROJECTS = [
  {
    project_id: 'p1', sort_order: 1,
    title: '자판기 포인트 적립 시스템', period: '2026.09', tags: ['PostgreSQL'],
    summary: 'PostgreSQL Function·Procedure로 구매 시 포인트를 적립·사용하는 자판기 DB',
    goal: '구매·적립·사용을 하나의 트랜잭션으로 묶어 포인트가 어긋나지 않게 처리',
    role: '테이블 설계, Function·Procedure 작성, 보고서 작성(개인)',
    result: '구매 프로시저 한 번 호출로 재고 차감·결제·포인트 적립이 함께 처리됨',
  },
  {
    project_id: 'p2', sort_order: 2,
    title: '유학원 상담 관리 DB 설계', period: '2026.11', tags: ['PostgreSQL', 'Python'],
    summary: '상담 카드 한 장을 개체 도출과 1~3NF 정규화로 테이블 7개로 분해',
    goal: '종이 상담 양식을 중복 없이 저장하고 다시 JOIN으로 복원',
    role: '개체·관계 도출, 정규화, N:M 연결표(consult_fields) 설계(개인)',
    result: '유학분야·진행 단계를 행으로 저장해 표 구조 변경 없이 항목 추가 가능',
  },
  {
    project_id: 'p3', sort_order: 3,
    title: '동네 도서관 대출 DB', period: '2026.11', tags: ['PostgreSQL'],
    summary: 'FK·CHECK·UNIQUE 제약과 미반납 부분 인덱스로 만든 대출 관리 DB',
    goal: '개념 → 논리 → 물리 모델링을 SQL 한 장으로 구현',
    role: '모델링 단계별 설계, 제약 조건 위반 테스트(개인)',
    result: '없는 회원 대출·잘못된 반납일·중복 전화번호를 DB 제약이 직접 차단',
  },
  {
    project_id: 'p4', sort_order: 4,
    title: '자기소개 웹앱 (이 사이트)', period: '2026.11 ~ 2026.12', tags: ['AWS'],
    summary: 'S3 + CloudFront 정적 호스팅, AppSync + DynamoDB 서버리스 방명록',
    goal: '서버 없이 AWS 관리형 서비스만으로 자기소개 사이트 운영',
    role: '기획, 프론트엔드, AWS 구성(개인)',
    result: 'S3 퍼블릭 차단 + CloudFront OAC로 배포',
    link: 'https://github.com/TLparche/cdb-intro-webapp',
  },
];

const $ = (s) => document.querySelector(s);

// ---------- S03 프로젝트 ----------
function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

function renderProjects(tag) {
  const list = $('#project-list');
  list.replaceChildren();
  PROJECTS
    .filter((p) => tag === '전체' || p.tags.includes(tag))
    .sort((a, b) => a.sort_order - b.sort_order)
    .slice(0, 6)
    .forEach((p) => {
      const card = el('article', 'card');
      const tags = el('div', 'tags');
      p.tags.forEach((t) => tags.append(el('span', 'tag', t)));
      const btn = el('button', 'btn small', '자세히 보기');
      btn.type = 'button';
      btn.addEventListener('click', () => openDetail(p));
      card.append(el('h3', null, p.title), el('span', 'period', p.period), tags, el('p', null, p.summary), btn);
      list.append(card);
    });
}

document.querySelectorAll('.filters button').forEach((b) => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.filters button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    renderProjects(b.dataset.tag);
  });
});

const dialog = $('#detail');
function openDetail(p) {
  const body = $('#detail-body');
  const dl = el('dl');
  [['목표', p.goal], ['담당 역할', p.role], ['사용 기술', p.tags.join(', ')], ['결과', p.result]]
    .forEach(([k, v]) => dl.append(el('dt', null, k), el('dd', null, v)));
  body.replaceChildren(el('h3', null, p.title), el('span', 'period', p.period), dl);
  if (p.link) {
    const a = el('a', null, 'GitHub 저장소');
    a.href = p.link; a.target = '_blank'; a.rel = 'noopener';
    body.append(el('p'), a);
  }
  dialog.showModal(); // ESC 닫기는 <dialog> 기본 동작, 스크롤 위치 유지
}
dialog.querySelector('.close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });

// ---------- S04 연락처 ----------
const emailLink = $('#email-link');
emailLink.textContent = EMAIL;
emailLink.href = `mailto:${EMAIL}`;
$('#copy-email').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(EMAIL); $('#copy-msg').textContent = '복사되었습니다'; }
  catch { $('#copy-msg').textContent = '복사하지 못했습니다'; }
});

// ---------- S05 방명록 (1주차: 검증 + 화면 표시만) ----------
const RULES = { name: [1, 20, '이름을', '이름은'], message: [1, 200, '메시지를', '메시지는'] };
const gbForm = $('#gb-form');
const gbList = $('#gb-list');
const entries = [];
let lastPost = 0;

function validate(data) {
  const errors = {};
  for (const [k, [min, max, obj, subj]] of Object.entries(RULES)) {
    const len = data[k].length;
    if (len < min) errors[k] = `${obj} 입력해 주세요.`;
    else if (len > max) errors[k] = `${subj} ${max}자 이하로 입력해 주세요.`;
  }
  return errors;
}

function fmt(d) {
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

function renderGuestbook() {
  gbList.replaceChildren();
  if (!entries.length) { gbList.append(el('li', 'meta', '첫 방명록을 남겨 주세요')); return; }
  entries.slice(0, 10).forEach((g) => {
    const li = el('li');
    li.append(el('div', 'meta', `${g.name} · ${fmt(g.created_at)}`), el('div', null, g.message)); // textContent: XSS 방지
    gbList.append(li);
  });
}

gbForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = gbForm.elements; // gbForm.name은 form의 name 속성이라 elements로 접근
  const data = { name: f.name.value.trim(), message: f.message.value.trim() };
  const errors = validate(data);
  gbForm.querySelectorAll('.err').forEach((s) => { s.textContent = errors[s.dataset.for] || ''; });
  if (Object.keys(errors).length) return;
  if (Date.now() - lastPost < 30_000) { $('#gb-msg').textContent = '30초 후에 다시 등록할 수 있습니다.'; return; }

  const btn = gbForm.querySelector('button');
  btn.disabled = true;
  entries.unshift({ ...data, created_at: new Date() }); // TODO 2주차: AppSync addGuestbook
  lastPost = Date.now();
  gbForm.reset();
  $('#gb-msg').textContent = '등록되었습니다 (미리보기, 새로고침하면 사라집니다)';
  renderGuestbook();
  btn.disabled = false;
});

renderProjects('전체');
renderGuestbook();
