// ...existing code...
(function() {
  // safe DOM-ready wrapper
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    console.info('Hotspot helper: toggle helper loaded');

    // delegated toggle: use data-toggle or data-target on buttons
    document.addEventListener('click', function (ev) {
      var btn = ev.target.closest('[data-toggle], [data-target], .button, .small-button, .show-toggle');
      if (!btn) return;

      // explicit selector via attributes
      var selector = btn.getAttribute('data-toggle') || btn.getAttribute('data-target');
      if (selector) {
        try {
          var node = document.querySelector(selector);
          if (node) node.classList.toggle('hidden');
          else console.warn('Hotspot helper: no element for selector', selector);
        } catch (err) {
          console.error('Hotspot helper: invalid selector', selector, err);
        }
        return;
      }

      // fallback: toggle common hotspot UI pieces inside nearest container or whole doc
      var scope = btn.closest('.container') || document;
      var common = [
        '.login-form', '.voucher', '.username', '.password', '.qr-code',
        '.network-details', '.wifi-rates', '#voucher', '#username', '#password', '#qr'
      ];
      var toggled = false;
      common.forEach(function(s) {
        var el = scope.querySelector(s);
        if (el) { el.classList.toggle('hidden'); toggled = true; }
      });
      if (!toggled) console.info('Hotspot helper: click ignored (no known targets found)', btn);
    });
  });
})();

// Segmented login mode enhancements and keyboard navigation
(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function() {
    var segVoucher = document.getElementById('segmentVoucher');
    var segMember = document.getElementById('segmentMember');
    var segQR = document.getElementById('segmentQR');
    var segments = [segVoucher, segMember, segQR].filter(Boolean);
    if (!segments.length) return;

    function selectSegment(btn) {
      segments.forEach(function(b){
        var selected = (b === btn);
        b.classList.toggle('active', selected);
        b.setAttribute('aria-selected', selected ? 'true' : 'false');
        b.setAttribute('tabindex', selected ? '0' : '-1');
      });
    }

    segments.forEach(function(b, idx){
      b.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight') { e.preventDefault(); segments[(idx+1)%segments.length].focus(); }
        if (e.key === 'ArrowLeft')  { e.preventDefault(); segments[(idx+segments.length-1)%segments.length].focus(); }
        if (e.key === 'Home') { e.preventDefault(); segments[0].focus(); }
        if (e.key === 'End')  { e.preventDefault(); segments[segments.length-1].focus(); }
      });
    });
    selectSegment(segVoucher || segments[0]);
  });
})();

// Submit shimmer: add loading state to primary submit buttons
(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function() {
    var forms = Array.from(document.querySelectorAll('form'));
    forms.forEach(function(form) {
      var btn = form.querySelector('button[type="submit"].button');
      if (!btn) return;
      form.addEventListener('submit', function() {
        btn.classList.add('is-loading');
        btn.disabled = true;
        setTimeout(function(){ btn.classList.remove('is-loading'); btn.disabled = false; }, 4000);
      });
    });
  });
})();