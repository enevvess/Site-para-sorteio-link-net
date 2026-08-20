const state = {
  participants: [],
  spinning: false,
  settings: {
    prize: 'PS5 Slim + GTA VI',
    description: 'Participe do sorteio da Link Net Fibra e concorra a esse prêmio incrível!',
    title: 'Link Net Fibra | Sorteio'
  }
};

const $ = (id) => document.getElementById(id);
const els = {
  fileInput: $('fileInput'), dropzone: $('dropzone'), fileStatus: $('fileStatus'),
  nameInput: $('nameInput'), addNameBtn: $('addNameBtn'), clearBtn: $('clearBtn'),
  participantCount: $('participantCount'), visibleCount: $('visibleCount'),
  participantsList: $('participantsList'), emptyState: $('emptyState'), searchInput: $('searchInput'),
  drawBtnTop: $('drawBtnTop'), drawModal: $('drawModal'), closeModalBtn: $('closeModalBtn'),
  startDrawBtn: $('startDrawBtn'), drawAgainBtn: $('drawAgainBtn'), slotName: $('slotName'),
  winnerReveal: $('winnerReveal'), winnerName: $('winnerName'),
  settingsBtn: $('settingsBtn'), settingsModal: $('settingsModal'), closeSettingsBtn: $('closeSettingsBtn'),
  prizeInput: $('prizeInput'), descriptionInput: $('descriptionInput'), pageTitleInput: $('pageTitleInput'),
  saveSettingsBtn: $('saveSettingsBtn'), prizeDisplay: $('prizeDisplay'), descriptionDisplay: $('descriptionDisplay')
};

function cleanNames(values) {
  return values
    .map(v => String(v ?? '').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function addNames(names) {
  const clean = cleanNames(names);
  state.participants.push(...clean);
  renderParticipants();
  return clean.length;
}

function renderParticipants() {
  const term = els.searchInput.value.trim().toLocaleLowerCase('pt-BR');
  const filtered = state.participants
    .map((name, index) => ({name, index}))
    .filter(item => item.name.toLocaleLowerCase('pt-BR').includes(term));

  els.participantCount.textContent = state.participants.length;
  els.visibleCount.textContent = `${filtered.length} exibido${filtered.length === 1 ? '' : 's'}`;
  els.participantsList.innerHTML = '';
  els.emptyState.hidden = state.participants.length > 0;

  filtered.forEach(({name, index}) => {
    const li = document.createElement('li');
    li.innerHTML = `<span class="number">${index + 1}</span><span class="name"></span><button class="remove-one" type="button" title="Remover">×</button>`;
    li.querySelector('.name').textContent = name;
    li.querySelector('.remove-one').addEventListener('click', () => {
      state.participants.splice(index, 1);
      renderParticipants();
    });
    els.participantsList.appendChild(li);
  });
}

async function importFile(file) {
  if (!file) return;
  const ext = file.name.split('.').pop().toLowerCase();
  try {
    let names = [];
    if (ext === 'txt') {
      const text = await file.text();
      names = text.split(/\r?\n/);
    } else if (ext === 'xlsx' || ext === 'xls') {
      if (!window.XLSX) throw new Error('A biblioteca de Excel não carregou. Verifique sua conexão e tente novamente.');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, {type:'array'});
      workbook.SheetNames.forEach(sheetName => {
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {header:1, raw:false});
        rows.forEach(row => {
          row.forEach(cell => {
            if (String(cell ?? '').trim()) names.push(cell);
          });
        });
      });
    } else {
      throw new Error('Formato não suportado.');
    }
    const added = addNames(names);
    els.fileStatus.textContent = `✓ ${added} participante(s) importado(s) de ${file.name}.`;
  } catch (error) {
    els.fileStatus.textContent = `⚠️ ${error.message}`;
  }
  els.fileInput.value = '';
}

function openModal(modal) {
  modal.classList.add('show');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
}
function closeModal(modal) {
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden', 'true');
  if (![els.drawModal, els.settingsModal].some(m => m.classList.contains('show'))) document.body.classList.remove('modal-open');
}

function resetDrawScreen() {
  els.slotName.textContent = 'Preparando...';
  els.slotName.classList.remove('spinning');
  els.winnerReveal.hidden = true;
  els.startDrawBtn.hidden = false;
  els.drawAgainBtn.hidden = true;
}

function openDraw() {
  if (!state.participants.length) {
    els.fileStatus.textContent = '⚠️ Adicione pelo menos um participante antes de realizar o sorteio.';
    window.scrollTo({top: document.querySelector('.workspace').offsetTop - 80, behavior:'smooth'});
    return;
  }
  resetDrawScreen();
  openModal(els.drawModal);
}

function runDraw() {
  if (state.spinning || !state.participants.length) return;
  state.spinning = true;
  els.startDrawBtn.hidden = true;
  els.drawAgainBtn.hidden = true;
  els.winnerReveal.hidden = true;
  els.slotName.classList.add('spinning');

  let ticks = 0;
  const totalTicks = 42 + Math.floor(Math.random() * 12);
  let delay = 55;

  function tick() {
    const randomName = state.participants[Math.floor(Math.random() * state.participants.length)];
    els.slotName.textContent = randomName;
    ticks++;
    if (ticks < totalTicks) {
      if (ticks > totalTicks * .62) delay += 16;
      setTimeout(tick, delay);
    } else {
      const winner = state.participants[Math.floor(Math.random() * state.participants.length)];
      els.slotName.textContent = winner;
      els.slotName.classList.remove('spinning');
      els.winnerName.textContent = winner;
      els.winnerReveal.hidden = false;
      els.drawAgainBtn.hidden = false;
      state.spinning = false;
    }
  }
  tick();
}

function saveSettings() {
  state.settings.prize = els.prizeInput.value.trim() || 'Prêmio do sorteio';
  state.settings.description = els.descriptionInput.value.trim() || 'Participe do nosso sorteio!';
  state.settings.title = els.pageTitleInput.value.trim() || 'Link Net Fibra | Sorteio';
  els.prizeDisplay.textContent = state.settings.prize;
  els.descriptionDisplay.textContent = state.settings.description;
  document.title = state.settings.title;
  closeModal(els.settingsModal);
}

els.fileInput.addEventListener('change', e => importFile(e.target.files[0]));
['dragenter','dragover'].forEach(type => els.dropzone.addEventListener(type, e => {
  e.preventDefault(); els.dropzone.classList.add('dragover');
}));
['dragleave','drop'].forEach(type => els.dropzone.addEventListener(type, e => {
  e.preventDefault(); els.dropzone.classList.remove('dragover');
}));
els.dropzone.addEventListener('drop', e => importFile(e.dataTransfer.files[0]));
els.addNameBtn.addEventListener('click', () => {
  const added = addNames([els.nameInput.value]);
  if (added) { els.fileStatus.textContent = '✓ Participante adicionado.'; els.nameInput.value = ''; }
});
els.nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') els.addNameBtn.click(); });
els.searchInput.addEventListener('input', renderParticipants);
els.clearBtn.addEventListener('click', () => {
  if (state.participants.length && confirm('Deseja remover todos os participantes?')) {
    state.participants = []; renderParticipants(); els.fileStatus.textContent = 'Lista limpa.';
  }
});
els.drawBtnTop.addEventListener('click', openDraw);
els.closeModalBtn.addEventListener('click', () => closeModal(els.drawModal));
els.startDrawBtn.addEventListener('click', runDraw);
els.drawAgainBtn.addEventListener('click', runDraw);
els.settingsBtn.addEventListener('click', () => openModal(els.settingsModal));
els.closeSettingsBtn.addEventListener('click', () => closeModal(els.settingsModal));
els.saveSettingsBtn.addEventListener('click', saveSettings);
document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.addEventListener('click', e => closeModal(e.target.closest('.modal'))));
document.addEventListener('keydown', e => { if (e.key === 'Escape') [els.drawModal, els.settingsModal].forEach(closeModal); });
$('year').textContent = new Date().getFullYear();
renderParticipants();
