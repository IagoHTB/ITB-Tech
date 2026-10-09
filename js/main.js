const WHATSAPP_URL = 'https://wa.me/5514991375042';

const openingHours = [
  { label: 'Segunda', open: 9 * 60, close: 18 * 60 },
  { label: 'Terça', open: 9 * 60, close: 18 * 60 },
  { label: 'Quarta', open: 9 * 60, close: 17 * 60 },
  { label: 'Quinta', open: 9 * 60, close: 18 * 60 },
  { label: 'Sexta', open: 9 * 60, close: 18 * 60 },
  { label: 'Sábado', open: 9 * 60, close: 13 * 60 + 30 },
  { label: 'Domingo', open: null, close: null }
];

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

function openWhatsApp(message) {
  const url = `${WHATSAPP_URL}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function updateOpeningStatus() {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7;
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const today = openingHours[dayIndex];
  const isOpen = today.open !== null && minutesNow >= today.open && minutesNow < today.close;
  const hoursText = today.open === null
    ? 'Atendimento hoje: fechado'
    : `Atendimento hoje: ${formatTime(today.open)}–${formatTime(today.close)}`;

  const statusMessage = isOpen ? 'Estamos abertos agora' : 'Fechado no momento';
  const status = document.querySelector('[data-store-status]');
  const statusIndicator = document.querySelector('[data-status-indicator]');
  const hoursStatus = document.querySelector('[data-hours-status]');
  const hoursToday = document.querySelector('[data-hours-today]');

  if (status) status.textContent = statusMessage;
  if (hoursStatus) {
    hoursStatus.textContent = isOpen ? 'Aberto agora' : 'Fechado no momento';
    hoursStatus.classList.toggle('is-open', isOpen);
  }
  if (hoursToday) hoursToday.textContent = hoursText;
  if (statusIndicator) statusIndicator.classList.toggle('is-open', isOpen);

  document.querySelectorAll('.schedule-item').forEach((item, index) => {
    item.classList.toggle('today', index === dayIndex);
  });
}

function bindWhatsAppActions() {
  document.querySelectorAll('[data-whatsapp-message]').forEach((button) => {
    button.addEventListener('click', () => {
      const message = button.dataset.whatsappMessage;
      if (message) openWhatsApp(message);
    });
  });
}

function bindForms() {
  const budgetForm = document.querySelector('#budget-form');
  if (budgetForm) {
    const modelInput = document.querySelector('#budget-model');
    const repairSelect = document.querySelector('#budget-repair');
    const detailsInput = document.querySelector('#budget-details');
    const result = document.querySelector('#estimate-result');
    const estimateLabel = document.querySelector('#estimate-label');
    const estimateValue = document.querySelector('#estimate-value');
    const requestQuoteButton = document.querySelector('#request-quote');
    const repairRanges = {
      'Tela': { min: 250, max: 900 },
      'Bateria': { min: 150, max: 450 },
      'Conector de carga': { min: 150, max: 400 },
      'Câmera': { min: 180, max: 500 },
      'Outro problema': { min: 80, max: 350 }
    };
    let currentEstimate = null;
    const formatCurrency = (amount) => new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(amount);

    budgetForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const model = modelInput.value.trim();
      const repair = repairSelect.value;
      const range = repairRanges[repair];
      if (!model || !range) return;

      currentEstimate = { model, repair, range };
      estimateLabel.textContent = `Referência geral para ${model} • ${repair}`;
      estimateValue.textContent = `${formatCurrency(range.min)} a ${formatCurrency(range.max)}`;
      result.hidden = false;
    });

    [modelInput, repairSelect, detailsInput].forEach((field) => {
      field.addEventListener('input', () => {
        currentEstimate = null;
        result.hidden = true;
      });
      field.addEventListener('change', () => {
        currentEstimate = null;
        result.hidden = true;
      });
    });

    requestQuoteButton.addEventListener('click', () => {
      if (!currentEstimate) return;

      const details = detailsInput.value.trim();
      const message = [
        'Olá, ITB Tech! Gostaria de confirmar um orçamento para meu celular.',
        '',
        `Modelo: ${currentEstimate.model}`,
        `Reparo: ${currentEstimate.repair}`,
        `Faixa de referência exibida: ${formatCurrency(currentEstimate.range.min)} a ${formatCurrency(currentEstimate.range.max)}`,
        details ? `Observação: ${details}` : ''
      ].filter(Boolean).join('\n');

      openWhatsApp(message);
    });
  }

  const productForm = document.querySelector('#product-form');
  if (productForm) {
    productForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const product = document.querySelector('#product-name').value.trim();
      if (!product) return;

      openWhatsApp(`Olá, ITB Tech! Gostaria de consultar a disponibilidade de: ${product}.`);
    });
  }
}

function bindMobileMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.querySelector('#nav-menu');
  if (!toggle || !menu) return;

  const closeMenu = () => {
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
    menu.classList.remove('is-open');
  };

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Abrir menu' : 'Fechar menu');
    menu.classList.toggle('is-open', !isOpen);
  });

  menu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
  });
}

updateOpeningStatus();
bindWhatsAppActions();
bindForms();
bindMobileMenu();
window.setInterval(updateOpeningStatus, 60_000);
