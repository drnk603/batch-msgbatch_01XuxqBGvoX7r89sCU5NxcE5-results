(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('.dr-nav-panel');
  if (!toggle || !panel) return;

  toggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('dr-header-nav-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
  });
})();