/* ============================================================
   FOCUS TEA - app.js v2.1 (IA real + acessibilidade)
   ============================================================ */

// -- CONSTANTES ------------------------------------------------
// Em producao, mova a chamada de IA para um backend/proxy.
// No prototipo estatico, informe a chave em Configuracoes > IA Gemini.
const DEFAULT_API_KEY = '';
const API_URL  = 'https://openrouter.ai/api/v1/chat/completions';
const AI_MODEL = 'google/gemini-2.5-flash';

const SYSTEM_PROMPT = `Você é o assistente educacional do Focus Tea, uma plataforma para estudantes com Transtorno do Espectro Autista (TEA).
Ao responder:
• Use linguagem simples e direta (frases curtas)
• Divida em etapas numeradas quando necessário
• Use emojis para ilustrar conceitos
• Limite a 120 palavras por resposta
• Use exemplos do dia a dia
• Termine com uma frase encorajadora
• Evite metáforas ambíguas ou expressões figuradas complexas
• Seja sempre positivo e paciente`;

// -- GEMINI AI -------------------------------------------------
function getAIConfig() {
  return {
    apiKey: localStorage.getItem('focusTeaApiKey') || window.FOCUS_TEA_API_KEY || DEFAULT_API_KEY,
    model: localStorage.getItem('focusTeaAIModel') || window.FOCUS_TEA_AI_MODEL || AI_MODEL
  };
}

function setAIStatus(message, type = 'info') {
  document.querySelectorAll('[data-ai-status]').forEach(el => {
    el.textContent = message;
    el.className = 'ai-status ' + type;
  });
}

async function askGemini(userMessage, context = '') {
  const systemContent = SYSTEM_PROMPT + (context ? `\n\nContexto atual: ${context}` : '');
  const { apiKey, model } = getAIConfig();

  if (!apiKey) {
    setAIStatus('IA sem chave configurada. Cole sua chave em Configuracoes > IA Gemini.', 'warning');
    return fallbackResponse(userMessage);
  }

  try {
    setAIStatus('IA conectada via OpenRouter/Gemini.', 'success');
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin && window.location.origin !== 'null' ? window.location.origin : 'https://focustea.app',
        'X-Title': 'Focus Tea'
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemContent },
          { role: 'user',   content: userMessage   }
        ],
        max_tokens: 350,
        temperature: 0.7
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('AI API error:', res.status, err);
      throw new Error('API ' + res.status);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content?.trim();
    if (text) return text;
    setAIStatus('IA respondeu vazio. Usando apoio offline.', 'warning');
    return fallbackResponse(userMessage);
  } catch (e) {
    console.warn('Gemini offline, usando fallback:', e.message);
    setAIStatus('IA indisponivel agora. Usando modo offline.', 'warning');
    return fallbackResponse(userMessage);
  }
}

function fallbackResponse(msg = '') {
  const lower = String(msg).toLowerCase();
  if (lower.includes('rotina') || lower.includes('array json')) {
    return JSON.stringify(criarRotinaFallback());
  }
  const respostas = lower.includes('matem') ? [
    '🤖 Modo offline: em matemática, escreva o problema em partes. Primeiro identifique os números. Depois escolha a operação. Por fim, confira o resultado. Você consegue! 💪',
    '🤖 Modo offline: teste um exemplo menor antes do exercício maior. Isso ajuda o cérebro a enxergar o padrão. ✨'
  ] : lower.includes('hist') ? [
    '🤖 Modo offline: organize a história em linha do tempo. Quem participou? Quando aconteceu? O que mudou depois? Um passo por vez. 📜',
    '🤖 Modo offline: transforme o tema em 3 cartões: causa, acontecimento e consequência. Isso facilita lembrar. ✅'
  ] : [
    '🤖 Modo offline: divida o conteúdo em partes pequenas e estude uma de cada vez. Você consegue! 💪',
    '🤖 Modo offline: releia o trecho devagar, palavra por palavra, e anote uma dúvida por vez. ✨',
    '🤖 Modo offline: faça pausas a cada 25 minutos. Um descanso curto ajuda a concentração. ☕'
  ];
  return respostas[Math.floor(Math.random() * respostas.length)];
}

// ── USUÁRIO ──────────────────────────────────────────────────
function getUser() {
  return JSON.parse(localStorage.getItem('focusTeaUser') || '{}') || { nome: 'Estudante' };
}

function saveUser(user) {
  localStorage.setItem('focusTeaUser', JSON.stringify(user));
}

function getUsers() {
  return JSON.parse(localStorage.getItem('focusTeaUsers') || '[]');
}

function saveUsers(users) {
  localStorage.setItem('focusTeaUsers', JSON.stringify(users));
}

function handleCadastro(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const nome = form.nome?.value.trim();
  const email = form.email?.value.trim().toLowerCase();
  const senha = form.senha?.value;
  const error = document.getElementById('authError');

  if (!nome || !email || !senha || senha.length < 6) {
    if (error) {
      error.textContent = 'Preencha nome, email e uma senha com pelo menos 6 caracteres.';
      error.classList.add('show');
    }
    return;
  }

  const users = getUsers();
  if (users.some(u => u.email === email)) {
    if (error) {
      error.textContent = 'Este email ja esta cadastrado. Tente entrar.';
      error.classList.add('show');
    }
    return;
  }

  const user = { nome, email, senha, createdAt: new Date().toISOString() };
  users.push(user);
  saveUsers(users);
  saveUser({ nome, email, loggedIn: true });
  location.href = 'dashboard.html';
}

function handleLogin(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const email = form.email?.value.trim().toLowerCase();
  const senha = form.senha?.value;
  const error = document.getElementById('authError');
  const user = getUsers().find(u => u.email === email && u.senha === senha);

  if (!user) {
    if (error) {
      error.textContent = 'Email ou senha incorretos. Se for demo, crie uma conta em segundos.';
      error.classList.add('show');
    }
    return;
  }

  saveUser({ nome: user.nome, email: user.email, loggedIn: true });
  location.href = 'dashboard.html';
}

// ── TAREFAS / ROTINA ─────────────────────────────────────────
const DEFAULT_TASKS = [
  { texto: 'Organizar material de estudo', feito: false, horario: '08:00', categoria: 'estudo' },
  { texto: 'Estudar Matemática por 25 minutos', feito: false, horario: '08:15', categoria: 'estudo' },
  { texto: 'Pausa sensorial de 10 minutos', feito: false, horario: '08:45', categoria: 'pausa' },
  { texto: 'Revisar matéria com exemplo visual', feito: false, horario: '09:00', categoria: 'estudo' }
];

function getTarefas() {
  return JSON.parse(localStorage.getItem('focusTeaTarefas') || 'null') || DEFAULT_TASKS;
}

function saveTarefas(lista) {
  localStorage.setItem('focusTeaTarefas', JSON.stringify(lista));
  atualizarTudo();
}

function getCatEmoji(cat) {
  return { estudo: '📚', pausa: '☕', lazer: '🎮', saude: '💚', outro: '📌' }[cat] || '📌';
}

function renderTarefas() {
  const el = document.getElementById('listaTarefas');
  if (!el) return;

  const lista = getTarefas();
  if (lista.length === 0) {
    el.innerHTML = '<p class="muted" style="text-align:center;padding:24px">Nenhuma tarefa ainda. Adicione uma acima! 👆</p>';
    return;
  }

  el.innerHTML = '';
  el.setAttribute('role', 'list');

  lista.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = `task ${t.feito ? 'done' : ''} cat-${t.categoria || 'estudo'}`;
    div.setAttribute('role', 'listitem');

    div.innerHTML = `
      <label>
        <input type="checkbox" ${t.feito ? 'checked' : ''} onchange="alternarTarefa(${i})"
          aria-label="${t.feito ? 'Desmarcar' : 'Concluir'}: ${escapeHTML(t.texto)}">
        <span class="task-text">${escapeHTML(t.texto)}</span>
      </label>
      <div class="task-meta">
        ${t.horario ? `<span class="task-time">🕐 ${t.horario}</span>` : ''}
        <span class="task-cat-badge" title="${t.categoria || 'estudo'}">${getCatEmoji(t.categoria)}</span>
        <button class="btn btn-icon" onclick="removerTarefa(${i})" aria-label="Remover tarefa: ${escapeHTML(t.texto)}">🗑️</button>
      </div>
    `;
    el.appendChild(div);
  });
  renderTimeline(lista);
}

function renderTimeline(lista = getTarefas()) {
  const el = document.getElementById('timelineRotina');
  if (!el) return;

  const ordenada = [...lista].sort((a, b) => String(a.horario || '99:99').localeCompare(String(b.horario || '99:99')));
  el.innerHTML = ordenada.map((t, index) => `
    <div class="timeline-item ${t.feito ? 'done' : ''}">
      <span class="timeline-dot" aria-hidden="true"></span>
      <div>
        <strong>${escapeHTML(t.horario || '--:--')}</strong>
        <p>${getCatEmoji(t.categoria)} ${escapeHTML(t.texto)}</p>
      </div>
    </div>
  `).join('') || '<p class="muted">Adicione tarefas para montar a linha do tempo.</p>';
}

function renderResumo() {
  const el = document.getElementById('listaResumo');
  if (!el) return;

  const lista = getTarefas();
  el.innerHTML = '';
  lista.slice(0, 4).forEach(t => {
    const div = document.createElement('div');
    div.className = `task ${t.feito ? 'done' : ''}`;
    div.innerHTML = `<span>${t.feito ? '✅' : '⬜'} ${escapeHTML(t.texto)}</span>`;
    el.appendChild(div);
  });
}

function atualizarProgresso() {
  const lista  = getTarefas();
  const total  = lista.length || 1;
  const feitos = lista.filter(t => t.feito).length;
  const pct    = Math.round((feitos / total) * 100);

  document.querySelectorAll('#progressoNumero,#progressoCard').forEach(el => {
    if (el) el.textContent = pct + '%';
  });

  const barra = document.getElementById('barraProgresso');
  if (barra) barra.style.width = pct + '%';
}

function atualizarTudo() {
  renderTarefas();
  renderResumo();
  atualizarProgresso();
}

function adicionarTarefa() {
  const input    = document.getElementById('novaTarefa');
  const horario  = document.getElementById('horarioTarefa');
  const categoria = document.getElementById('categoriaTarefa');

  if (!input?.value.trim()) {
    showToast('Digite o nome da tarefa primeiro! 📝', 'warning');
    input?.focus();
    return;
  }

  const lista = getTarefas();
  lista.push({
    texto: input.value.trim(),
    feito: false,
    horario: horario?.value || '',
    categoria: categoria?.value || 'estudo'
  });

  input.value = '';
  if (horario) horario.value = '';
  saveTarefas(lista);
  showToast('Tarefa adicionada! ✅', 'success');
  input.focus();
}

function alternarTarefa(i) {
  const lista = getTarefas();
  lista[i].feito = !lista[i].feito;
  saveTarefas(lista);
  if (lista[i].feito) showToast('Ótimo trabalho! 🎉', 'success');
}

function removerTarefa(i) {
  const lista = getTarefas();
  lista.splice(i, 1);
  saveTarefas(lista);
}

async function gerarRotinaIA() {
  const btn = document.getElementById('btnGerarRotina');
  if (btn) { btn.disabled = true; btn.textContent = '⏳ Gerando...'; }

  const prompt = `Crie uma rotina de estudos para hoje para um estudante do ensino médio com TEA.
Retorne APENAS um array JSON válido no formato:
[{"texto":"nome da tarefa","horario":"HH:MM","categoria":"estudo"},...]
Categorias possíveis: estudo, pausa, lazer, saude.
Inclua 6 itens com horários começando às 08:00, intercalando estudo (25 min) com pausa (10 min).
Retorne SOMENTE o JSON, sem texto adicional.`;

  try {
    const resposta = await askGemini(prompt);
    const jsonMatch = resposta.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) throw new Error('JSON não encontrado');

    const novaLista = JSON.parse(jsonMatch[0]);
    novaLista.forEach(t => { t.feito = false; });
    saveTarefas(novaLista);
    showToast('Rotina gerada com IA! 🤖✨', 'success');
  } catch (e) {
    // Fallback offline
    saveTarefas(criarRotinaFallback());
    showToast('Rotina criada! (modo offline) 📋', 'info');
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = '🤖 Gerar rotina com IA'; }
  }
}

function criarRotinaFallback() {
  const temas = ['Matematica', 'Portugues', 'Ciencias', 'Historia'];
  const tema = temas[Math.floor(Math.random() * temas.length)];
  return [
    { texto: 'Organizar material e escolher um lugar calmo', feito: false, horario: '08:00', categoria: 'estudo' },
    { texto: `Estudar ${tema} por 25 minutos`, feito: false, horario: '08:10', categoria: 'estudo' },
    { texto: 'Pausa sensorial com agua e respiracao', feito: false, horario: '08:35', categoria: 'pausa' },
    { texto: `Resolver 4 exercicios de ${tema}`, feito: false, horario: '08:50', categoria: 'estudo' },
    { texto: 'Revisar erros com exemplos visuais', feito: false, horario: '09:20', categoria: 'estudo' },
    { texto: 'Registrar uma conquista do estudo', feito: false, horario: '09:45', categoria: 'lazer' }
  ];
}

// ── ESTUDOS COM IA ────────────────────────────────────────────
const MATERIAS = {
  fotossintese: 'Fotossíntese',
  matematica:   'Matemática',
  historia:     'História',
  geografia:    'Geografia',
  ciencias:     'Ciências',
  portugues:    'Português',
  fisica:       'Física',
  quimica:      'Química'
};

function renderMateriaOptions(select) {
  if (!select) return;
  const current = select.value || 'fotossintese';
  select.innerHTML = Object.entries(MATERIAS)
    .map(([key, nome]) => `<option value="${key}">${nome}</option>`)
    .join('');
  select.value = MATERIAS[current] ? current : 'fotossintese';
}

async function trocarMateria() {
  const select    = document.getElementById('materia');
  const key       = select?.value || 'fotossintese';
  const nome      = MATERIAS[key] || key;
  const el        = document.getElementById('conteudoEstudo');
  if (!el) return;

  el.innerHTML = `<div class="loading-ai"><div class="spinner"></div> Preparando explicação sobre ${nome}...</div>`;

  const prompt = `Explique "${nome}" de forma simples para um estudante do ensino médio com TEA.
Estruture assim:
1. O que é (1 frase simples)
2. Como funciona (3 passos numerados)
3. Exemplo do dia a dia (1 analogia concreta)
Seja breve e use emojis.`;

  const resposta = await askGemini(prompt, `Matéria: ${nome}`);

  el.innerHTML = `
    <div class="ai-content">
      <div class="ai-header">🤖 <strong>Focus IA</strong> <span class="badge-ai">Gemini</span></div>
      <div class="ai-text">${formatAIText(resposta)}</div>
    </div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:8px">
      <button class="btn btn-soft" onclick="explicarOutroJeito('${key}')">🔄 Outro jeito</button>
      <button class="btn btn-ghost" onclick="resumirTopico('${key}')">📝 Resumo rápido</button>
    </div>
  `;
}

async function explicarOutroJeito(key) {
  const nome = MATERIAS[key] || key;
  const el   = document.getElementById('conteudoEstudo');
  if (!el) return;

  const loadDiv = document.createElement('div');
  loadDiv.className = 'loading-ai';
  loadDiv.innerHTML = '<div class="spinner"></div> Pensando em uma nova analogia...';
  el.appendChild(loadDiv);

  const prompt = `Explique "${nome}" usando uma analogia completamente diferente e criativa que uma criança de 12 anos entenderia. Use uma comparação inesperada e divertida do cotidiano. Máximo 80 palavras.`;
  const resposta = await askGemini(prompt);

  loadDiv.remove();
  const newEl = document.createElement('div');
  newEl.className = 'ai-answer';
  newEl.innerHTML = `🤖 <strong>Outra forma de ver:</strong><br><br>${formatAIText(resposta)}`;
  el.appendChild(newEl);
}

async function resumirTopico(key) {
  const nome = MATERIAS[key] || key;
  const el   = document.getElementById('conteudoEstudo');
  if (!el) return;

  const loadDiv = document.createElement('div');
  loadDiv.className = 'loading-ai';
  loadDiv.innerHTML = '<div class="spinner"></div> Criando resumo...';
  el.appendChild(loadDiv);

  const prompt = `Faça um resumo de "${nome}" em 5 tópicos curtos para revisar rápido antes de uma prova. Use emojis e linguagem simples. Máximo 100 palavras.`;
  const resposta = await askGemini(prompt);

  loadDiv.remove();
  const newEl = document.createElement('div');
  newEl.className = 'ai-answer';
  newEl.innerHTML = `📝 <strong>Resumo rápido:</strong><br><br>${formatAIText(resposta)}`;
  el.appendChild(newEl);
}

let chatHistory = [];

async function responderIA() {
  const input  = document.getElementById('perguntaIA');
  const chatEl = document.getElementById('chatArea') || document.getElementById('respostaIA');
  if (!input || !chatEl) return;

  const pergunta = input.value.trim();
  if (!pergunta) {
    showToast('Digite sua dúvida primeiro! 📝', 'warning');
    input.focus();
    return;
  }

  if (chatEl.id === 'respostaIA') chatEl.innerHTML = '';
  addChatMessage(chatEl, pergunta, 'user');
  input.value = '';
  input.style.height = 'auto';

  // Typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg assistant';
  typingEl.innerHTML = `<span class="chat-avatar">🤖</span>
    <div class="loading-typing"><span></span><span></span><span></span></div>`;
  chatEl.appendChild(typingEl);
  chatEl.scrollTop = chatEl.scrollHeight;

  const materia = document.getElementById('materia')?.value || '';
  const context = materia ? `O estudante está estudando ${MATERIAS[materia] || materia}` : '';

  const resposta = await askGemini(pergunta, context);

  typingEl.remove();
  addChatMessage(chatEl, resposta, 'assistant');
  chatEl.scrollTop = chatEl.scrollHeight;
}

function addChatMessage(container, text, role) {
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.setAttribute('aria-label', role === 'user' ? 'Você: ' + text : 'IA: ' + text);

  if (role === 'assistant') {
    div.innerHTML = `<span class="chat-avatar" aria-hidden="true">🤖</span>
      <div class="chat-bubble">${formatAIText(text)}</div>`;
  } else {
    div.innerHTML = `<div class="chat-bubble">${escapeHTML(text)}</div>
      <span class="chat-avatar" aria-hidden="true">👤</span>`;
  }

  container.appendChild(div);
}

// ── EXERCÍCIOS ────────────────────────────────────────────────
const BANCO_QUESTOES = {
  fotossintese: [
    {
      pergunta: 'O que é fotossíntese?',
      opcoes: ['Processo das plantas produzirem alimento usando luz solar', 'Tipo de animal que vive no mar', 'Movimento de rotação da Terra', 'Um tipo de doença das plantas'],
      correta: 0,
      explicacao: '🌱 Fotossíntese é o processo pelo qual as plantas usam luz solar, água e CO₂ para produzir glicose (energia).'
    },
    {
      pergunta: 'Qual a principal fonte de energia da fotossíntese?',
      opcoes: ['Água', 'Luz solar', 'Solo', 'Ar'],
      correta: 1,
      explicacao: '☀️ A luz solar é a energia que "liga" o processo de fotossíntese nas plantas.'
    },
    {
      pergunta: 'Qual gás é liberado pela fotossíntese?',
      opcoes: ['Dióxido de carbono (CO₂)', 'Nitrogênio (N₂)', 'Oxigênio (O₂)', 'Hidrogênio (H₂)'],
      correta: 2,
      explicacao: '💨 As plantas liberam oxigênio (O₂) — é por isso que são essenciais para nossa respiração!'
    },
    {
      pergunta: 'Onde ocorre a fotossíntese na célula?',
      opcoes: ['Raiz', 'Mitocôndria', 'Cloroplasto', 'Núcleo'],
      correta: 2,
      explicacao: '🌿 A fotossíntese ocorre nos cloroplastos, organelas que contêm clorofila e dão a cor verde às folhas.'
    }
  ],
  matematica: [
    {
      pergunta: 'Quanto é 7 × 8?',
      opcoes: ['54', '56', '58', '64'],
      correta: 1,
      explicacao: '📐 7 × 8 = 56. Dica: 7 × 8 = 7 × (4+4) = 28 + 28 = 56!'
    },
    {
      pergunta: 'Qual é a raiz quadrada de 144?',
      opcoes: ['11', '12', '13', '14'],
      correta: 1,
      explicacao: '√144 = 12, pois 12 × 12 = 144.'
    },
    {
      pergunta: 'Qual é 25% de 200?',
      opcoes: ['25', '40', '50', '75'],
      correta: 2,
      explicacao: '25% = 1/4. Então 200 ÷ 4 = 50! ✅'
    },
    {
      pergunta: 'Qual é o resultado de 2³ (dois ao cubo)?',
      opcoes: ['6', '8', '9', '12'],
      correta: 1,
      explicacao: '2³ = 2 × 2 × 2 = 8. Potência significa multiplicar o número por ele mesmo!'
    }
  ],
  historia: [
    {
      pergunta: 'Em que ano o Brasil se tornou independente?',
      opcoes: ['1789', '1808', '1822', '1889'],
      correta: 2,
      explicacao: '🏛️ O Brasil proclamou a Independência em 7 de setembro de 1822, com D. Pedro I.'
    },
    {
      pergunta: 'Quem foi o primeiro presidente do Brasil?',
      opcoes: ['D. Pedro I', 'Getúlio Vargas', 'Deodoro da Fonseca', 'Rui Barbosa'],
      correta: 2,
      explicacao: '🇧🇷 Deodoro da Fonseca foi o primeiro presidente, após a Proclamação da República em 1889.'
    },
    {
      pergunta: 'O que foi a Revolução Industrial?',
      opcoes: ['Uma guerra mundial', 'A transição para produção mecanizada em fábricas', 'A independência dos EUA', 'Uma revolução no Brasil'],
      correta: 1,
      explicacao: '⚙️ A Revolução Industrial (séc. XVIII) transformou o trabalho artesanal em produção industrial automatizada.'
    },
    {
      pergunta: 'Qual foi o principal documento da Revolução Francesa?',
      opcoes: ['Carta Magna', 'Declaração dos Direitos do Homem e do Cidadão', 'Constituição Americana', 'Tratado de Westfália'],
      correta: 1,
      explicacao: '🗽 A Declaração dos Direitos do Homem e do Cidadão (1789) proclamou liberdade, igualdade e fraternidade.'
    }
  ],
  geografia: [
    {
      pergunta: 'Qual é o maior país do mundo em área?',
      opcoes: ['EUA', 'China', 'Brasil', 'Rússia'],
      correta: 3,
      explicacao: '🌍 A Rússia é o maior país do mundo, com cerca de 17 milhões de km².'
    },
    {
      pergunta: 'Qual é a capital do Brasil?',
      opcoes: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador'],
      correta: 2,
      explicacao: '🏛️ Brasília é a capital federal do Brasil desde 1960.'
    },
    {
      pergunta: 'Qual é o maior oceano do mundo?',
      opcoes: ['Atlântico', 'Índico', 'Ártico', 'Pacífico'],
      correta: 3,
      explicacao: '🌊 O Oceano Pacífico é o maior e mais profundo oceano do planeta.'
    },
    {
      pergunta: 'Qual rio é o mais extenso do mundo?',
      opcoes: ['Rio Nilo', 'Rio Amazonas', 'Rio Yangtzé', 'Rio Mississippi'],
      correta: 0,
      explicacao: '🌊 O Rio Nilo, na África, é o mais extenso com cerca de 6.650 km.'
    }
  ],
  ciencias: [
    {
      pergunta: 'Qual é a fórmula química da água?',
      opcoes: ['H₂O₂', 'HO', 'H₂O', 'OH'],
      correta: 2,
      explicacao: '💧 H₂O = 2 átomos de Hidrogênio + 1 átomo de Oxigênio.'
    },
    {
      pergunta: 'Quantos ossos tem o corpo humano adulto?',
      opcoes: ['106', '206', '306', '406'],
      correta: 1,
      explicacao: '🦴 O corpo humano adulto tem 206 ossos.'
    },
    {
      pergunta: 'Qual órgão bombeia o sangue no corpo?',
      opcoes: ['Pulmão', 'Fígado', 'Rim', 'Coração'],
      correta: 3,
      explicacao: '❤️ O coração bombeia sangue para todo o corpo — em média 100.000 vezes por dia!'
    },
    {
      pergunta: 'O que é DNA?',
      opcoes: ['Um tipo de proteína', 'O material genético das células', 'Um órgão do corpo', 'Um tipo de vitamina'],
      correta: 1,
      explicacao: '🧬 DNA é o material genético que contém as instruções para o funcionamento de todos os seres vivos.'
    }
  ],
  portugues: [
    {
      pergunta: 'O que é um substantivo?',
      opcoes: ['Uma ação ou estado', 'Um nome de pessoa, lugar ou coisa', 'Uma característica do substantivo', 'Uma ligação entre palavras'],
      correta: 1,
      explicacao: '📖 Substantivo é a palavra que nomeia seres, lugares, objetos, sentimentos. Ex: "escola", "alegria", "João".'
    },
    {
      pergunta: 'Qual das frases está na voz passiva?',
      opcoes: ['O estudante leu o livro', 'O livro foi lido pelo estudante', 'O estudante lia o livro', 'O estudante vai ler o livro'],
      correta: 1,
      explicacao: '📝 Na voz passiva, o sujeito sofre a ação. "O livro foi lido" — o livro recebe a ação de ser lido.'
    },
    {
      pergunta: 'O que são sinônimos?',
      opcoes: ['Palavras de significado oposto', 'Palavras com o mesmo significado', 'Palavras do mesmo campo semântico', 'Palavras que rimam'],
      correta: 1,
      explicacao: '💬 Sinônimos são palavras com significado igual ou parecido. Ex: "feliz" e "alegre".'
    },
    {
      pergunta: 'Em qual alternativa há um erro de concordância?',
      opcoes: ['Os alunos chegaram cedo', 'As crianças brincaram muito', 'Os meninos estudou bastante', 'As professoras foram elogiadas'],
      correta: 2,
      explicacao: '✏️ "Os meninos estudou" está errado. O correto é "Os meninos estudaram" — sujeito plural, verbo plural.'
    }
  ]
};

BANCO_QUESTOES.fisica = [
  {
    pergunta: 'O que e velocidade media?',
    opcoes: ['Distancia dividida pelo tempo', 'Forca vezes massa', 'Energia do calor', 'Tamanho de um objeto'],
    correta: 0,
    explicacao: 'Velocidade media = distancia percorrida / tempo gasto. Exemplo: 100 km em 2 h = 50 km/h.'
  },
  {
    pergunta: 'Qual unidade mede forca no Sistema Internacional?',
    opcoes: ['Joule', 'Newton', 'Watt', 'Metro'],
    correta: 1,
    explicacao: 'A forca e medida em Newton (N), em homenagem a Isaac Newton.'
  },
  {
    pergunta: 'O que acontece com a luz em um espelho plano?',
    opcoes: ['Ela e absorvida totalmente', 'Ela reflete', 'Ela vira som', 'Ela desaparece'],
    correta: 1,
    explicacao: 'No espelho plano, a luz reflete e forma uma imagem.'
  },
  {
    pergunta: 'Qual grandeza e medida em graus Celsius?',
    opcoes: ['Temperatura', 'Massa', 'Volume', 'Tempo'],
    correta: 0,
    explicacao: 'Graus Celsius medem temperatura, como 25 graus em um dia quente.'
  }
];

BANCO_QUESTOES.quimica = [
  {
    pergunta: 'O que e um atomo?',
    opcoes: ['Uma celula viva', 'A menor unidade basica da materia', 'Um planeta', 'Uma forma de energia'],
    correta: 1,
    explicacao: 'Atomos formam a materia. Eles se juntam para formar moleculas.'
  },
  {
    pergunta: 'Qual simbolo quimico representa oxigenio?',
    opcoes: ['O', 'Ox', 'Og', 'X'],
    correta: 0,
    explicacao: 'O simbolo do oxigenio na tabela periodica e O.'
  },
  {
    pergunta: 'Misturar agua e sal forma o que?',
    opcoes: ['Uma solucao', 'Um metal', 'Um gas nobre', 'Um animal'],
    correta: 0,
    explicacao: 'Quando o sal se dissolve na agua, temos uma solucao.'
  },
  {
    pergunta: 'Qual escala indica acidez ou basicidade?',
    opcoes: ['pH', 'km/h', 'Celsius', 'Decibel'],
    correta: 0,
    explicacao: 'A escala de pH indica se uma substancia e acida, neutra ou basica.'
  }
];

let quizState = {
  materia: 'fotossintese',
  questaoAtual: 0,
  questoes: [],
  acertos: 0
};

function iniciarQuiz(materia) {
  const banco = BANCO_QUESTOES[materia] || BANCO_QUESTOES.fotossintese;
  quizState = {
    materia,
    questaoAtual: 0,
    questoes: embaralhar([...banco]),
    acertos: 0
  };
  renderQuestao();
}

function embaralhar(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

function renderQuestao() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  const q     = quizState.questoes[quizState.questaoAtual];
  const total = quizState.questoes.length;
  const atual = quizState.questaoAtual + 1;
  const pct   = Math.round((atual / total) * 100);

  container.innerHTML = `
    <div class="quiz-header" aria-label="Progresso: questão ${atual} de ${total}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span class="quiz-progress-text">Questão ${atual} de ${total}</span>
        <span class="quiz-score">✅ ${quizState.acertos} acerto${quizState.acertos !== 1 ? 's' : ''}</span>
      </div>
      <div class="quiz-progress-bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100">
        <span style="width:${pct}%"></span>
      </div>
    </div>
    <div class="quiz-card">
      <h3>${escapeHTML(q.pergunta)}</h3>
      <div class="quiz-opcoes" role="radiogroup" aria-label="Opções de resposta">
        ${q.opcoes.map((op, i) => `
          <label class="quiz-opcao">
            <input type="radio" name="resposta" value="${i}" aria-label="${escapeHTML(op)}">
            <span>${escapeHTML(op)}</span>
          </label>
        `).join('')}
      </div>
      <button class="btn btn-primary" id="btnResponder" onclick="responderQuestao()">Responder</button>
      <div id="feedbackQuestao" class="feedback-area" aria-live="polite"></div>
    </div>
  `;
}

function responderQuestao() {
  const marcada  = document.querySelector('input[name="resposta"]:checked');
  const feedback = document.getElementById('feedbackQuestao');
  const btn      = document.getElementById('btnResponder');

  if (!marcada) {
    showToast('Selecione uma resposta! 👆', 'warning');
    return;
  }

  const q       = quizState.questoes[quizState.questaoAtual];
  const resposta = parseInt(marcada.value);
  const correta  = resposta === q.correta;

  if (correta) quizState.acertos++;

  // Desabilitar opções e marcar certa/errada
  document.querySelectorAll('input[name="resposta"]').forEach(inp => inp.disabled = true);
  document.querySelectorAll('.quiz-opcao').forEach((op, i) => {
    if (i === q.correta) op.classList.add('correta');
    else if (i === resposta && !correta) op.classList.add('errada');
  });

  feedback.innerHTML = `
    <div class="feedback-msg ${correta ? 'success' : 'error'}">
      ${correta ? '✅ Correto! Muito bem!' : '❌ Não foi dessa vez!'}
      <p>${escapeHTML(q.explicacao)}</p>
    </div>
  `;

  const isUltima = quizState.questaoAtual >= quizState.questoes.length - 1;
  btn.textContent = isUltima ? 'Ver resultado 🏆' : 'Próxima questão →';
  btn.onclick = proximaQuestao;
}

function proximaQuestao() {
  quizState.questaoAtual++;
  if (quizState.questaoAtual >= quizState.questoes.length) {
    mostrarResultado();
  } else {
    renderQuestao();
  }
}

function mostrarResultado() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  const total  = quizState.questoes.length;
  const acertos = quizState.acertos;
  const pct    = Math.round((acertos / total) * 100);

  let emoji, mensagem;
  if (pct >= 80) { emoji = '🏆'; mensagem = 'Excelente! Você dominou o tema! Continue assim! 🌟'; }
  else if (pct >= 60) { emoji = '⭐'; mensagem = 'Muito bom! Continue praticando e vai chegar lá! 💪'; }
  else { emoji = '📚'; mensagem = 'Bom esforço! Revise o conteúdo e tente de novo. Você vai melhorar! 🌱'; }

  container.innerHTML = `
    <div class="resultado-card">
      <div class="resultado-emoji">${emoji}</div>
      <h2>Resultado Final</h2>
      <div class="resultado-score">${acertos}/${total}</div>
      <div class="resultado-pct">${pct}% de acertos</div>
      <p style="color:var(--muted);max-width:320px;margin:0 auto">${mensagem}</p>
      <div class="resultado-actions">
        <button class="btn btn-primary" onclick="iniciarQuiz('${quizState.materia}')">🔄 Tentar de novo</button>
        <a class="btn btn-soft" href="estudos.html">📚 Revisar conteúdo</a>
      </div>
    </div>
  `;
}

// ── POMODORO TIMER ────────────────────────────────────────────
let timerInterval = null;
let timerSeconds  = 25 * 60;
let timerRunning  = false;
let timerMode     = 'trabalho';

const CIRCUMFERENCE = 2 * Math.PI * 65; // para r=65

function updateTimerDisplay() {
  const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
  const s = (timerSeconds % 60).toString().padStart(2, '0');

  const display = document.getElementById('timerDisplay');
  if (display) display.textContent = `${m}:${s}`;

  const circle = document.getElementById('timerCircleProgress');
  if (circle) {
    const total    = timerMode === 'trabalho' ? 25 * 60 : 5 * 60;
    const elapsed = total - timerSeconds;
    circle.style.strokeDashoffset = CIRCUMFERENCE * (elapsed / total);
  }
}

function toggleTimer() {
  const btn = document.getElementById('btnTimer');
  if (timerRunning) {
    clearInterval(timerInterval);
    timerRunning = false;
    if (btn) btn.textContent = '▶ Iniciar';
  } else {
    timerRunning = true;
    if (btn) btn.textContent = '⏸ Pausar';
    timerInterval = setInterval(() => {
      if (timerSeconds <= 0) {
        clearInterval(timerInterval);
        timerRunning = false;
        alternarModoTimer();
        return;
      }
      timerSeconds--;
      updateTimerDisplay();
    }, 1000);
  }
}

function resetTimer() {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = timerMode === 'trabalho' ? 25 * 60 : 5 * 60;
  updateTimerDisplay();
  const btn = document.getElementById('btnTimer');
  if (btn) btn.textContent = '▶ Iniciar';
}

function alternarModoTimer() {
  if (timerMode === 'trabalho') {
    timerMode    = 'pausa';
    timerSeconds = 5 * 60;
    showToast('Hora da pausa! ☕ 5 minutos de descanso.', 'success');
  } else {
    timerMode    = 'trabalho';
    timerSeconds = 25 * 60;
    showToast('Vamos estudar! 📚 25 minutos de foco.', 'info');
  }
  updateTimerDisplay();
  const label = document.getElementById('timerModoLabel');
  if (label) label.textContent = timerMode === 'trabalho' ? '🎯 Foco' : '☕ Pausa';
}

function setTimer(minutos) {
  clearInterval(timerInterval);
  timerRunning = false;
  timerSeconds = minutos * 60;
  updateTimerDisplay();
  const btn = document.getElementById('btnTimer');
  if (btn) btn.textContent = '▶ Iniciar';
}

// ── CONFIGURAÇÕES ─────────────────────────────────────────────
function getConfig() {
  return JSON.parse(localStorage.getItem('focusTeaConfig') || '{}');
}

function salvarConfiguracoes() {
  const config = {
    tema:          document.getElementById('tema')?.value           || 'padrao',
    fonte:         document.getElementById('fonte')?.value          || 'normal',
    semDistracoes: document.getElementById('semDistracoes')?.checked || false,
    reducao:       document.getElementById('reducao')?.checked       || false,
    espacamento:   document.getElementById('espacamento')?.checked   || false
  };

  localStorage.setItem('focusTeaConfig', JSON.stringify(config));
  const apiKey = document.getElementById('apiKeyIA')?.value?.trim();
  const model = document.getElementById('modeloIA')?.value?.trim();
  if (apiKey) localStorage.setItem('focusTeaApiKey', apiKey);
  if (model) localStorage.setItem('focusTeaAIModel', model);
  aplicarConfiguracoes();

  const s = document.getElementById('statusConfig');
  if (s) {
    s.textContent = '✅ Configurações salvas!';
    setTimeout(() => { if (s) s.textContent = ''; }, 3000);
  }

  showToast('Configurações salvas! ✅', 'success');
}

function aplicarConfiguracoes() {
  const c = getConfig();
  const temas   = ['calmo', 'foco', 'escuro', 'alto', 'lavanda'];
  const fontes  = ['grande', 'muito'];
  const classes = ['sem-distracoes', 'reducao', 'espacamento-extra'];

  temas.forEach(t => document.body.classList.remove('theme-' + t));
  fontes.forEach(f => document.body.classList.remove('font-' + f));
  classes.forEach(c2 => document.body.classList.remove(c2));

  if (c.tema && c.tema !== 'padrao') document.body.classList.add('theme-' + c.tema);
  if (c.fonte && c.fonte !== 'normal') document.body.classList.add('font-' + c.fonte);
  if (c.semDistracoes) document.body.classList.add('sem-distracoes');
  if (c.reducao) document.body.classList.add('reducao');
  if (c.espacamento) document.body.classList.add('espacamento-extra');

  // Sincroniza controles
  ['tema', 'fonte'].forEach(id => {
    const el = document.getElementById(id);
    if (el && c[id]) el.value = c[id];
  });
  ['semDistracoes', 'reducao', 'espacamento'].forEach(id => {
    const el = document.getElementById(id);
    if (el && c[id] !== undefined) el.checked = c[id];
  });
  const apiKey = document.getElementById('apiKeyIA');
  if (apiKey) apiKey.value = localStorage.getItem('focusTeaApiKey') || DEFAULT_API_KEY;
  const model = document.getElementById('modeloIA');
  if (model) model.value = localStorage.getItem('focusTeaAIModel') || AI_MODEL;
}

function salvarPerfil() {
  const nome = document.getElementById('nomeUsuario')?.value?.trim();
  if (!nome) {
    showToast('Digite seu nome!', 'warning');
    return;
  }
  const user = getUser();
  user.nome = nome;
  saveUser(user);
  atualizarNomeUsuario();
  showToast('Perfil atualizado! 👤', 'success');
}

// ── DASHBOARD ─────────────────────────────────────────────────
function atualizarDataHora() {
  const el = document.getElementById('dataHoraAtual');
  if (!el) return;

  function update() {
    const agora  = new Date();
    const data   = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    const hora   = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    el.textContent = `${data.charAt(0).toUpperCase() + data.slice(1)} • ${hora}`;
  }

  update();
  setInterval(update, 30000);
}

function atualizarSaudacao() {
  const el = document.getElementById('saudacaoUsuario');
  if (!el) return;

  const user  = getUser();
  const hora  = new Date().getHours();
  const text  = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
  el.textContent = `${text}, ${user.nome || 'Estudante'}! 👋`;
}

async function carregarDicaIA() {
  const el = document.getElementById('sugestaoIA');
  if (!el) return;

  const lista     = getTarefas();
  const pendentes = lista.filter(t => !t.feito).length;
  const feitos    = lista.filter(t => t.feito).length;

  el.innerHTML = '<div class="spinner-small" style="display:inline-block"></div> Carregando dica...';

  const prompt = `Dê uma dica motivacional curta (2 frases) para um estudante com TEA que tem ${pendentes} tarefas pendentes e ${feitos} concluídas hoje. Seja específico e encorajador.`;
  const dica   = await askGemini(prompt);
  el.innerHTML = formatAIText(dica);
}

// ── NOME DO USUÁRIO ───────────────────────────────────────────
function atualizarNomeUsuario() {
  const user = getUser();
  document.querySelectorAll('.user-nome').forEach(el => {
    el.textContent = user.nome || 'Estudante';
  });
  const input = document.getElementById('nomeUsuario');
  if (input) input.value = user.nome || '';
}

// ── UTILITÁRIOS ───────────────────────────────────────────────
function formatAIText(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(mensagem, tipo = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'false');
    document.body.appendChild(container);
  }

  const icons  = { success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌' };
  const toast  = document.createElement('div');
  toast.className = `toast toast-${tipo}`;
  toast.setAttribute('role', 'alert');
  toast.innerHTML = `${icons[tipo] || ''} ${escapeHTML(mensagem)}`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

function toggleHamburguer() {
  const nav = document.getElementById('navLinks');
  const btn = document.getElementById('hamburguerBtn');
  if (!nav) return;
  nav.classList.toggle('open');
  btn?.setAttribute('aria-expanded', String(nav.classList.contains('open')));
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  aplicarConfiguracoes();
  atualizarTudo();
  atualizarNomeUsuario();
  atualizarDataHora();
  atualizarSaudacao();
  updateTimerDisplay();

  // Dashboard
  if (document.getElementById('sugestaoIA')) {
    carregarDicaIA();
  }

  // Estudos
  document.querySelectorAll('#materia,#materiaQuiz').forEach(renderMateriaOptions);
  if (document.getElementById('conteudoEstudo')) {
    trocarMateria();
  }

  // Exercícios
  const materiaQuiz = document.getElementById('materiaQuiz');
  if (materiaQuiz) {
    iniciarQuiz(materiaQuiz.value || 'fotossintese');
    materiaQuiz.addEventListener('change', () => iniciarQuiz(materiaQuiz.value));
  }

  // Chat: Enter para enviar (Shift+Enter = nova linha)
  const perguntaIA = document.getElementById('perguntaIA');
  if (perguntaIA) {
    perguntaIA.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        responderIA();
      }
    });
  }

  // Tarefa: Enter para adicionar
  const novaTarefa = document.getElementById('novaTarefa');
  if (novaTarefa) {
    novaTarefa.addEventListener('keydown', e => {
      if (e.key === 'Enter') adicionarTarefa();
    });
  }

  // Fechar menu ao clicar fora
  document.addEventListener('click', e => {
    const nav = document.getElementById('navLinks');
    const btn = document.getElementById('hamburguerBtn');
    if (nav?.classList.contains('open') && !nav.contains(e.target) && !btn?.contains(e.target)) {
      nav.classList.remove('open');
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
});
