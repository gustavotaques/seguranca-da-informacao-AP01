const USERS = [
  {
    id: 1,
    name: "Ana Souza",
    email: "aluno@faculdade.local",
    password: "123456",
    role: "ALUNO",
    studentId: "202400001"
  },
  {
    id: 2,
    name: "Prof. Carlos Lima",
    email: "professor@faculdade.local",
    password: "123456",
    role: "PROFESSOR",
    classes: ["5A", "5B"]
  },
  {
    id: 3,
    name: "Administrador Geral",
    email: "admin@faculdade.local",
    password: "admin",
    role: "ADMIN"
  }
];

const FAKE_API_TOKEN = "TOKEN_SECRETO_DEMO_ABC123_PUBLICO_NO_FRONTEND";

const STORAGE_KEYS = {
  session: "ocorrencias_sessao",
  occurrences: "ocorrencias_registros",
  audit: "ocorrencias_logs"
};

const INITIAL_OCCURRENCES = [
  {
    id: "OC-1001",
    studentName: "Marina Alves",
    studentId: "202300145",
    studentCpf: "123.456.789-10",
    studentEmail: "marina.alves@email.local",
    studentPhone: "(47) 99999-1010",
    category: "Nota",
    priority: "Média",
    description: "Solicitação de revisão de nota da avaliação bimestral.",
    internalNote: "Verificar com a coordenação antes de responder.",
    status: "Aberta",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:40:00.000Z"
  },
  {
    id: "OC-1002",
    studentName: "Rafael Martins",
    studentId: "202200771",
    studentCpf: "987.654.321-00",
    studentEmail: "rafael.martins@email.local",
    studentPhone: "(47) 98888-2020",
    category: "Frequência",
    priority: "Alta",
    description: "Aluno contesta lançamento de falta em aula prática.",
    internalNote: "Conferir chamada manual.",
    status: "Em análise",
    createdBy: "professor@faculdade.local",
    createdAt: "2026-05-05T18:50:00.000Z"
  },
  {
    id: "OC-1003",
    studentName: "Beatriz Costa",
    studentId: "202100441",
    studentCpf: "111.222.333-44",
    studentEmail: "beatriz.costa@email.local",
    studentPhone: "(47) 97777-3030",
    category: "Solicitação administrativa",
    priority: "Crítica",
    description: "Solicitação envolvendo documentação acadêmica e prazo de matrícula.",
    internalNote: "Priorizar atendimento.",
    status: "Aberta",
    createdBy: "admin@faculdade.local",
    createdAt: "2026-05-05T19:00:00.000Z"
  }
];

const loginView = document.querySelector("#loginView");
const appView = document.querySelector("#appView");
const loginForm = document.querySelector("#loginForm");
const occurrenceForm = document.querySelector("#occurrenceForm");
const logoutBtn = document.querySelector("#logoutBtn");
const exportBtn = document.querySelector("#exportBtn");
const clearLogsBtn = document.querySelector("#clearLogsBtn");
const resetBtn = document.querySelector("#resetBtn");
const searchInput = document.querySelector("#search");

const sessionBadge = document.querySelector("#sessionBadge");
const currentUserName = document.querySelector("#currentUserName");
const currentUserDetails = document.querySelector("#currentUserDetails");
const occurrencesTable = document.querySelector("#occurrencesTable");
const auditLog = document.querySelector("#auditLog");
const totalOccurrences = document.querySelector("#totalOccurrences");
const criticalOccurrences = document.querySelector("#criticalOccurrences");
const lastUpdate = document.querySelector("#lastUpdate");

function boot() {
  if (!localStorage.getItem(STORAGE_KEYS.occurrences)) {
    localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(INITIAL_OCCURRENCES));
  }

  if (!localStorage.getItem(STORAGE_KEYS.audit)) {
    writeLog("BASE_INICIAL_CRIADA", "Dados fictícios carregados no localStorage.");
  }

  const session = getSession();

  if (session) {
    showApp(session);
  } else {
    showLogin();
  }
}

function getOccurrences() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.occurrences) || "[]");
}

function saveOccurrences(occurrences) {
  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(occurrences));
}

function getAuditLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.audit) || "[]");
}

function saveAuditLogs(logs) {
  localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify(logs));
}

function getSession() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.session) || "null");
}

function saveSession(user) {
  localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(user));
}

function writeLog(action, detail, level = "INFO") {
  const session = getSession();
  const logs = getAuditLogs();

  logs.unshift({
    timestamp: new Date().toISOString(),
    userId: session ? (session.email) : "anonimo",
    userRole: session ? session.role : "SEM_SESSAO",
    ipSimulado: "127.0.0.1",
    level: level,
    action,
    detail
  });

  // Mantém apenas os últimos 100 logs para não estourar o localStorage
  if (logs.length > 100) {
    logs.splice(100);
  }

  saveAuditLogs(logs);
}

/**
 * Sanitiza strings para evitar ataques XSS
 * @param {string} str 
 * @returns {string}
 */
function sanitize(str) {
  if (typeof str !== 'string') return str;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function showLogin() {
  loginView.classList.remove("hidden");
  appView.classList.add("hidden");
  logoutBtn.classList.add("hidden");
  sessionBadge.textContent = "Sessão não iniciada";
  sessionBadge.classList.add("muted");
}

function showApp(user) {
  loginView.classList.add("hidden");
  appView.classList.remove("hidden");
  logoutBtn.classList.remove("hidden");

  sessionBadge.textContent = `${user.name} — ${user.role}`;
  sessionBadge.classList.remove("muted");

  currentUserName.textContent = user.name;
  currentUserDetails.textContent = `${user.email} | Perfil: ${user.role}`;

  render();
}

function login(email, password) {
  const user = USERS.find((item) => item.email === email && item.password === password);

  if (!user) {
    alert("Usuário ou senha inválidos.");
    writeLog("LOGIN_FALHOU", `Tentativa para ${email}`, "WARNING");
    return;
  }

  saveSession(user);
  writeLog("LOGIN_OK", `Usuário ${user.email} entrou no sistema.`);
  showApp(user);
}

function logout() {
  const session = getSession();
  writeLog("LOGOUT", session ? `${session.email} saiu do sistema.` : "Sessão encerrada.");
  localStorage.removeItem(STORAGE_KEYS.session);
  showLogin();
}

function checkPermission(requiredRole) {
  const session = getSession();

  if (!session) {
    writeLog("ACESSO_NEGADO", `Tentativa de realizar ação que requer ${requiredRole} sem sessão.`, "DENIED");
    alert("Você precisa estar logado para realizar esta ação.");
    return false;
  }

  const roleHierarchy = {
    'ALUNO': 1,
    'PROFESSOR': 2,
    'ADMIN': 3
  };

  const userRoleLevel = roleHierarchy[session.role] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  if (userRoleLevel < requiredRoleLevel) {
    writeLog("ACESSO_NEGADO", `Usuário ${session.email} tentou ação que requer ${requiredRole}.`, "DENIED");
    alert("Acesso negado. Você não tem permissão para realizar esta ação.");
    return false;
  }

  return true;
}

function createOccurrence(event) {
  event.preventDefault();

  const session = getSession();

  const occurrence = {
    id: `OC-${Math.floor(Math.random() * 9000) + 1000}`,
    studentName: sanitize(document.querySelector("#studentName").value),
    studentId: sanitize(document.querySelector("#studentId").value),
    studentCpf: sanitize(document.querySelector("#studentCpf").value),
    studentEmail: sanitize(document.querySelector("#studentEmail").value),
    studentPhone: sanitize(document.querySelector("#studentPhone").value),
    category: sanitize(document.querySelector("#category").value),
    priority: sanitize(document.querySelector("#priority").value),
    description: sanitize(document.querySelector("#description").value),
    internalNote: sanitize(document.querySelector("#internalNote").value),
    privacyAck: document.querySelector("#privacyAck").checked,
    status: "Aberta",
    createdBy: session ? session.email : "desconhecido",
    createdAt: new Date().toISOString()
  };

  const occurrences = getOccurrences();
  occurrences.unshift(occurrence);
  saveOccurrences(occurrences);

  writeLog(
    "OCORRENCIA_CRIADA",
    `Criada ocorrência ${occurrence.id} para ${occurrence.studentName} / ${occurrence.studentCpf}. Descrição: ${occurrence.description}`
  );

  occurrenceForm.reset();
  render();
}

function deleteOccurrence(id) {
  if (!checkPermission('ADMIN')) return;

  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === id);
  const updated = occurrences.filter((item) => item.id !== id);

  saveOccurrences(updated);
  writeLog("OCORRENCIA_EXCLUIDA", `Ocorrência ${id} excluída. Registro: ${JSON.stringify(occurrence)}`);
  render();
}

function changeStatus(id, status) {
  if (!checkPermission('PROFESSOR')) return;

  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === id);

  if (!occurrence) {
    return;
  }

  occurrence.status = status;
  occurrence.updatedAt = new Date().toISOString();

  saveOccurrences(occurrences);
  writeLog("STATUS_ALTERADO", `Ocorrência ${id} alterada para ${status}.`);
  render();
}

function exportEverything() {
  if (!checkPermission('ADMIN')) return;

  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: getSession(),
    token: FAKE_API_TOKEN,
    users: USERS,
    occurrences: getOccurrences(),
    audit: getAuditLogs(),
    localStorageCopy: { ...localStorage }
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json"
  });

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = "backup-completo-ocorrencias.json";
  anchor.click();

  URL.revokeObjectURL(url);

  writeLog("EXPORTACAO_TOTAL", "Usuário exportou todos os dados do sistema.");
}

function clearLogs() {
  if (!checkPermission('ADMIN')) return;

  saveAuditLogs([]);
  render();
}

function resetData() {
  localStorage.setItem(STORAGE_KEYS.occurrences, JSON.stringify(INITIAL_OCCURRENCES));
  localStorage.setItem(STORAGE_KEYS.audit, JSON.stringify([]));
  localStorage.removeItem(STORAGE_KEYS.session);
  boot();
}

function maskCPF(cpf) {
  if (!cpf) return "";
  // Formato esperado: 123.456.789-10 -> ***.***.***-10
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return cpf; // Retorna original se não for padrão

  return `***.***.***-${digits.slice(-2)}`;
}

function maskPhone(phone) {
  if (!phone) return "";
  // Formato esperado: (47) 99999-1010 -> (47) *****-1010
  // Ou qualquer formato, vamos tentar manter o DDD e os últimos 4 dígitos
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return phone;

  const ddd = digits.slice(0, 2);
  const last4 = digits.slice(-4);
  return `(${ddd}) *****-${last4}`;
}

function render() {
  const term = searchInput.value.toLowerCase();
  let occurrences = getOccurrences();
  const session = getSession();
  const userRole = session ? session.role : null;

  // 1. Row-Level Security: Filter occurrences based on user role
  if (userRole === 'ALUNO') {
    occurrences = occurrences.filter((item) => {
      const isOwnerByEmail = item.studentEmail === session.email;
      const isOwnerById = item.studentId === session.studentId;
      return isOwnerByEmail || isOwnerById;
    });
  }

  // 2. Text Search Filter
  const filtered = occurrences.filter((item) => {
    const content = JSON.stringify(item).toLowerCase();
    return content.includes(term);
  });

  // Dynamic button visibility for global actions
  exportBtn.style.display = (userRole === 'ADMIN') ? 'inline-block' : 'none';
  clearLogsBtn.style.display = (userRole === 'ADMIN') ? 'inline-block' : 'none';

  totalOccurrences.textContent = occurrences.length;
  criticalOccurrences.textContent = occurrences.filter((item) => item.priority === "Crítica").length;
  lastUpdate.textContent = `Atualizado em ${new Date().toLocaleTimeString("pt-BR")}`;

  occurrencesTable.innerHTML = filtered.map((item) => {
    const canManageStatus = (userRole === 'ADMIN' || userRole === 'PROFESSOR');
    const canDelete = (userRole === 'ADMIN');

    // 3. Data Masking based on LGPD / Need-to-know
    // Mask for everyone except the creator or ADMIN
    const isCreator = session && item.createdBy === session.email;
    const shouldMask = (userRole !== 'ADMIN' && !isCreator);

    const displayCpf = shouldMask ? maskCPF(item.studentCpf) : item.studentCpf;
    const displayPhone = shouldMask ? maskPhone(item.studentPhone) : item.studentPhone;

    return `
    <tr>
      <td>
        <strong>${item.studentName}</strong><br />
        <span class="muted-text">${item.studentId}</span>
      </td>
      <td>${displayCpf}</td>
      <td>
        ${item.studentEmail}<br />
        ${displayPhone}
      </td>
      <td>${item.category}</td>
      <td><span class="priority ${item.priority}">${item.priority}</span></td>
      <td>${item.status}</td>
      <td>
        <strong>Descrição:</strong> ${item.description}<br />
        <strong>Obs. interna:</strong> ${item.internalNote}
      </td>
      <td>
        <div class="row-actions">
          ${canManageStatus ? `
            <button class="btn secondary" onclick="changeStatus('${item.id}', 'Em análise')">Em análise</button>
            <button class="btn secondary" onclick="changeStatus('${item.id}', 'Resolvida')">Resolver</button>
          ` : ''}
          ${canDelete ? `
            <button class="btn danger" onclick="deleteOccurrence('${item.id}')">Excluir</button>
          ` : ''}
        </div>
      </td>
    </tr>
  `}).join("");

  const logs = getAuditLogs();

  if (logs.length === 0) {
    auditLog.innerHTML = `<div class="notice">Nenhum log registrado.</div>`;
  } else {
    auditLog.innerHTML = logs.map((log) => `
      <div class="log-item log-level-${log.level || 'INFO'}">
        <strong>${log.timestamp}</strong> [${log.level || 'INFO'}]<br />
        usuário=${log.userId || "—"} | perfil=${log.userRole || "—"} | ip=${log.ipSimulado || "—"}<br />
        ação=<strong>${log.action}</strong><br />
        detalhe=${sanitize(log.detail)}
      </div>
    `).join("");
  }
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  login(
    document.querySelector("#email").value,
    document.querySelector("#password").value
  );
});

occurrenceForm.addEventListener("submit", createOccurrence);
logoutBtn.addEventListener("click", logout);
exportBtn.addEventListener("click", exportEverything);
clearLogsBtn.addEventListener("click", clearLogs);
resetBtn.addEventListener("click", resetData);
searchInput.addEventListener("input", render);

window.deleteOccurrence = deleteOccurrence;
window.changeStatus = changeStatus;

boot();
