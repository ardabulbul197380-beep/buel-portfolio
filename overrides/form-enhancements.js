(() => {
  const form = document.querySelector('#inquiryForm');
  if (!form) return;

  const fresh = form.cloneNode(false);
  form.replaceWith(fresh);
  fresh.id = 'inquiryForm';
  fresh.className = 'buel-lead-form';

  const copy = {
    en: {
      labels: ['Your name / brand','Email','Project type','Approx. budget','Target timing','What do you need?'],
      placeholders: ['Name / Brand','you@brand.com','e.g. ₺25K, €1K, not sure yet','A short brief is enough. Tell us the goal, scope and anything useful.'],
      types: ['Website','Brand Identity','Social / Digital','Product / Prototype','Other'],
      timing: ['As soon as possible','1–2 months','2–4 months','Flexible'],
      budgetHelp: 'A rough range is enough — it helps us shape the right scope.',
      submit: 'Prepare project inquiry',
      note: 'For now, this prepares a structured email in your mail app. Direct form delivery will be enabled once the receiving inbox is connected.',
      subject: 'BUEL project inquiry',
      mail: ['Name / Brand','Email','Project type','Approx. budget','Target timing','Brief'],
      privacy: 'Your details are used only to reply to your project inquiry.'
    },
    tr: {
      labels: ['Adın / Markan','E-posta','Proje türü','Yaklaşık bütçe','Hedef zaman','Neye ihtiyacın var?'],
      placeholders: ['Ad / Marka','sen@marka.com','örn. ₺25K, €1K, henüz net değil','Kısa bir brief yeterli. Hedefi, kapsamı ve faydalı olabilecek detayları anlat.'],
      types: ['Web Sitesi','Marka Kimliği','Sosyal / Dijital','Ürün / Prototip','Diğer'],
      timing: ['Mümkün olan en kısa sürede','1–2 ay','2–4 ay','Esnek'],
      budgetHelp: 'Yaklaşık bir aralık yeterli — doğru kapsamı oluşturmamıza yardımcı olur.',
      submit: 'Proje talebini hazırla',
      note: 'Şimdilik form, e-posta uygulamanda düzenli bir proje talebi hazırlar. Doğrudan form gönderimini, alıcı e-posta hesabını bağladığımızda açacağız.',
      subject: 'BUEL proje talebi',
      mail: ['Ad / Marka','E-posta','Proje türü','Yaklaşık bütçe','Hedef zaman','Brief'],
      privacy: 'Paylaştığın bilgiler yalnızca proje talebine yanıt vermek için kullanılır.'
    }
  };

  const getLang = () => document.documentElement.lang === 'tr' ? 'tr' : 'en';
  const config = window.BUEL_CONFIG?.contact || {};
  const direct = config.inboxVerified === true && /^https:\/\//.test(config.endpoint || '');
  const email = config.email || 'hello@buelstudio.com';
  let sending = false;
  let statusKey = '';
  let requestId = null;
  const messages = {
    en: { sending: 'Sending…', submit: 'Send project inquiry', directNote: 'Your brief will be sent securely to BUEL. Your details are used only to respond to this inquiry.', unverified: 'This opens your mail app; it does not send a message. This inbox is not yet confirmed active. Please use WhatsApp for now.', prepared: 'Email draft requested. Nothing has been sent by this site. Complete sending in your mail app, or contact us on WhatsApp.', success: 'Your inquiry has been accepted. Thank you — we’ll be in touch.', error: 'We could not confirm receipt. Your details are still here. Retry or contact us using the links below.', fallback: 'Open email draft instead ↗', whatsapp: 'Contact on WhatsApp ↗' },
    tr: { sending: 'Gönderiliyor…', submit: 'Proje talebini gönder', directNote: 'Briefin güvenli biçimde BUEL’e gönderilir. Bilgilerin yalnızca bu talebi yanıtlamak için kullanılır.', unverified: 'Bu işlem e-posta uygulamanı açar; mesaj göndermez. Bu adresin aktif olduğu henüz doğrulanmadı. Şimdilik WhatsApp üzerinden iletişime geçebilirsin.', prepared: 'E-posta taslağı açılması istendi. Bu site mesaj göndermedi. Gönderimi e-posta uygulamanda tamamla veya WhatsApp üzerinden ulaş.', success: 'Proje talebin alındı. Teşekkürler — seninle iletişime geçeceğiz.', error: 'Talebinin alındığını doğrulayamadık. Bilgilerin burada duruyor. Tekrar dene veya aşağıdaki bağlantıları kullan.', fallback: 'E-posta taslağını aç ↗', whatsapp: 'WhatsApp üzerinden ulaş ↗' }
  };
  const showStatus = key => {
    statusKey = key;
    const el = fresh.querySelector('.form-status');
    if (el) { el.textContent = messages[getLang()][key] || ''; el.dataset.state = key; }
  };


  const render = () => {
    const c = copy[getLang()];
    const m = messages[getLang()];
    const previous = new FormData(fresh);
    const indices = [...fresh.querySelectorAll('select')].map(el => el.selectedIndex);
    fresh.innerHTML = `
      <div class="lead-grid lead-grid-two">
        <label><span>${c.labels[0]}</span><input name="name" required maxlength="120" autocomplete="name" placeholder="${c.placeholders[0]}" /></label>
        <label><span>${c.labels[1]}</span><input name="email" required maxlength="254" type="email" autocomplete="email" inputmode="email" placeholder="${c.placeholders[1]}" /></label>
      </div>

      <div class="lead-grid lead-grid-two">
        <label><span>${c.labels[2]}</span>
          <select name="type" required>
            ${c.types.map(v => `<option value="${v}">${v}</option>`).join('')}
          </select>
        </label>
        <label><span>${c.labels[4]}</span>
          <select name="timing" required>
            ${c.timing.map(v => `<option value="${v}">${v}</option>`).join('')}
          </select>
        </label>
      </div>

      <label class="lead-budget"><span>${c.labels[3]}</span>
        <input name="budget" maxlength="120" autocomplete="off" placeholder="${c.placeholders[2]}" />
        <small>${c.budgetHelp}</small>
      </label>

      <label><span>${c.labels[5]}</span>
        <textarea name="message" required rows="6" maxlength="1800" placeholder="${c.placeholders[3]}"></textarea>
        <small class="brief-count"><b>0</b> / 1800</small>
      </label>

      <input class="hp-field" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" />

      <button class="submit-inquiry" type="submit">
        <span class="submit-copy">${direct ? m.submit : c.submit}</span><span class="submit-arrow">↗</span>
      </button>
      <p class="form-note" id="deliveryNote">${direct ? m.directNote : config.inboxVerified ? c.note : m.unverified}</p>
      <p class="form-status" role="status" aria-live="polite" aria-atomic="true"></p>
      <div class="form-alternatives"><button type="button" class="email-fallback">${m.fallback}</button><a href="https://wa.me/905462149022" target="_blank" rel="noopener noreferrer">${m.whatsapp}</a></div>
      <p class="form-privacy">${c.privacy}</p>
    `;

    fresh.setAttribute('aria-describedby', 'deliveryNote');
    for (const name of ['name', 'email', 'budget', 'message']) {
      if (previous.has(name)) fresh.elements[name].value = previous.get(name);
    }
    fresh.querySelectorAll('select').forEach((el, i) => { if (indices[i] >= 0) el.selectedIndex = indices[i]; });
    fresh.querySelector('.email-fallback').hidden = !direct;
    fresh.querySelector('.email-fallback').addEventListener('click', () => prepareEmail());
    showStatus(statusKey);
    const ta = fresh.querySelector('textarea');
    const count = fresh.querySelector('.brief-count b');
    const sync = () => count.textContent = String(ta.value.length);
    ta.addEventListener('input', sync);
    sync();
  };

  const prepareEmail = () => {
    if (!fresh.reportValidity()) return;
    const f = new FormData(fresh);
    const c = copy[getLang()];
    const name = String(f.get('name') || '').trim();
    const subject = `${c.subject} — ${name || (getLang() === 'tr' ? 'Yeni proje' : 'New project')}`;
    const body = [
      `${c.mail[0]}: ${name}`,
      `${c.mail[1]}: ${String(f.get('email') || '').trim()}`,
      `${c.mail[2]}: ${String(f.get('type') || '')}`,
      `${c.mail[3]}: ${String(f.get('budget') || '').trim() || '—'}`,
      `${c.mail[4]}: ${String(f.get('timing') || '')}`,
      '',
      `${c.mail[5]}:`,
      String(f.get('message') || '').trim()
    ].join('\n');

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    showStatus('prepared');
    window.buelTrack?.('Inquiry email prepared');
  };

  fresh.addEventListener('input', () => { if (!sending) { statusKey = ''; showStatus(''); requestId = null; } });
  fresh.addEventListener('change', () => { requestId = null; });
  fresh.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending || fresh.elements.company_website.value || !fresh.reportValidity()) return;
    if (!direct) return prepareEmail();
    sending = true;
    showStatus('sending');
    const button = fresh.querySelector('[type="submit"]');
    const toggles = [...document.querySelectorAll('.lang-toggle')];
    const controls = [...fresh.querySelectorAll('input,select,textarea,button')];
    const data = Object.fromEntries(new FormData(fresh));
    requestId ||= crypto.randomUUID();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    controls.forEach(el => el.disabled = true);
    toggles.forEach(el => el.disabled = true);
    fresh.setAttribute('aria-busy', 'true');
    button.querySelector('.submit-copy').textContent = messages[getLang()].sending;
    try {
      const response = await fetch(config.endpoint, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, language: getLang(), requestId }),
        signal: controller.signal, credentials: 'omit', referrerPolicy: 'no-referrer'
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error('Receipt not confirmed');
      fresh.reset();
      requestId = null;
      fresh.querySelector('.brief-count b').textContent = '0';
      showStatus('success');
      window.buelTrack?.('Inquiry accepted');
    } catch {
      showStatus('error');
    } finally {
      clearTimeout(timeout);
      sending = false;
      controls.forEach(el => el.disabled = false);
      toggles.forEach(el => el.disabled = false);
      fresh.removeAttribute('aria-busy');
      button.querySelector('.submit-copy').textContent = messages[getLang()].submit;
    }
  });

  render();

  new MutationObserver(() => { if (!sending) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // Keep keyboard focus inside the inquiry and return it to the opening CTA.
  const modal = document.querySelector('#inquiryModal');
  const panel = modal.querySelector('[role="dialog"]');
  let returnFocus = null;
  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-inquiry], [data-command-inquiry]')) returnFocus = document.activeElement;
  }, true);
  const background = [...document.body.children].filter(el => !['SCRIPT', 'STYLE'].includes(el.tagName) && el !== modal);
  new MutationObserver(() => {
    const open = modal.classList.contains('is-open');
    background.forEach(el => { el.inert = open; });
    if (!open && returnFocus?.isConnected) returnFocus.focus();
  }).observe(modal, { attributes: true, attributeFilter: ['class'] });
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const items = [...panel.querySelectorAll('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled)')].filter(el => el.tabIndex >= 0 && !el.hidden && el.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
})();