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
      privacy: 'By continuing, you agree that the details you provide may be used to reply to your project inquiry.'
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
      privacy: 'Devam ederek paylaştığın bilgilerin proje talebine yanıt vermek için kullanılmasını kabul etmiş olursun.'
    }
  };

  const getLang = () => localStorage.getItem('buel-lang') === 'tr' ? 'tr' : 'en';

  const render = () => {
    const c = copy[getLang()];
    fresh.innerHTML = `
      <div class="lead-grid lead-grid-two">
        <label><span>${c.labels[0]}</span><input name="name" required autocomplete="name" placeholder="${c.placeholders[0]}" /></label>
        <label><span>${c.labels[1]}</span><input name="email" required type="email" autocomplete="email" inputmode="email" placeholder="${c.placeholders[1]}" /></label>
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
        <input name="budget" autocomplete="off" placeholder="${c.placeholders[2]}" />
        <small>${c.budgetHelp}</small>
      </label>

      <label><span>${c.labels[5]}</span>
        <textarea name="message" required rows="6" maxlength="1800" placeholder="${c.placeholders[3]}"></textarea>
        <small class="brief-count"><b>0</b> / 1800</small>
      </label>

      <input class="hp-field" name="company_website" tabindex="-1" autocomplete="off" aria-hidden="true" />

      <button class="submit-inquiry" type="submit">
        <span class="submit-copy">${c.submit}</span><span class="submit-arrow">↗</span>
      </button>
      <p class="form-note">${c.note}</p>
      <p class="form-privacy">${c.privacy}</p>
    `;

    const ta = fresh.querySelector('textarea');
    const count = fresh.querySelector('.brief-count b');
    const sync = () => count.textContent = String(ta.value.length);
    ta.addEventListener('input', sync);
    sync();
  };

  fresh.addEventListener('submit', (e) => {
    e.preventDefault();
    const trap = fresh.querySelector('[name="company_website"]');
    if (trap && trap.value) return;

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

    window.location.href = `mailto:hello@buel.studio?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  render();

  const langToggle = document.querySelector('.lang-toggle');
  if (langToggle) langToggle.addEventListener('click', () => setTimeout(render, 0));
})();