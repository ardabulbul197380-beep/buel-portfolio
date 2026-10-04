(() => {
  'use strict';
  // Keep social metadata consistent with the existing EN/TR switch.
  const syncMeta = () => {
    const description = document.querySelector('meta[name="description"]')?.content || '';
    for (const selector of ['meta[property="og:title"]', 'meta[name="twitter:title"]']) {
      document.querySelector(selector)?.setAttribute('content', document.title);
    }
    for (const selector of ['meta[property="og:description"]', 'meta[name="twitter:description"]']) {
      document.querySelector(selector)?.setAttribute('content', description);
    }
    const tr = document.documentElement.lang === 'tr';
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', tr ? 'tr_TR' : 'en_US');
    document.querySelector('meta[property="og:locale:alternate"]')?.setAttribute('content', tr ? 'en_US' : 'tr_TR');
  };
  syncMeta();
  new MutationObserver(syncMeta).observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });

  // No account configuration means no tracker script, requests, cookies or event queue.
  const scriptUrl = window.BUEL_CONFIG?.analytics?.plausibleScriptUrl;
  const allowedEvents = new Set(['Inquiry opened', 'Inquiry email prepared', 'Inquiry accepted', 'WhatsApp clicked', 'Instagram clicked', 'Email clicked', 'Case study clicked']);
  window.buelTrack = () => {};
  if (!scriptUrl || !/^https:\/\/plausible\.io\/js\/pa-[A-Za-z0-9_-]+\.js$/.test(scriptUrl) ||
      !['www.buelstudio.com', 'buelstudio.com'].includes(location.hostname) ||
      navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;

  const plausible = window.plausible = function () { (plausible.q = plausible.q || []).push(arguments); };
  plausible.init = options => { plausible.o = options; };
  plausible.init({ autoCapturePageviews: false, outboundLinks: false, formSubmissions: false,
    transformRequest: payload => ({ ...payload, u: location.origin + location.pathname, r: '' }) });
  const script = document.createElement('script');
  script.async = true;
  script.src = scriptUrl;
  let ready = false;
  script.onload = () => { ready = true; window.plausible('pageview', { url: location.origin + location.pathname }); };
  script.onerror = () => { ready = false; plausible.q = []; };
  document.head.append(script);
  window.buelTrack = name => {
    if (ready && allowedEvents.has(name)) window.plausible(name, { url: location.origin + location.pathname });
  };
  document.addEventListener('click', event => {
    const el = event.target.closest('a, button');
    if (!el) return;
    if (el.matches('[data-open-inquiry], [data-command-inquiry]')) return window.buelTrack('Inquiry opened');
    const href = el.getAttribute('href') || '';
    const name = href.startsWith('https://wa.me/') ? 'WhatsApp clicked' :
      href.startsWith('https://www.instagram.com/') ? 'Instagram clicked' :
      href.startsWith('mailto:') ? 'Email clicked' :
      el.matches('.feature-link[href]') ? 'Case study clicked' : null;
    if (name) window.buelTrack(name);
  });
})();
