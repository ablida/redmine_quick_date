(function () {
  'use strict';

  var iconId = 'quick-date-icon';
  var menuId = 'quick-date-menu';

  var fields = [
    { fieldId: 'issue_due_date', iconId: 'quick-due-date-icon', menuId: 'quick-due-date-menu' },
    { fieldId: 'issue_start_date', iconId: 'quick-start-date-icon', menuId: 'quick-start-date-menu' }
  ];

  var startOfWeek = startOfWeek ?? 1;

  function labels() {
    return quickDateLabels || {
      today: 'Today',
      tomorrow: 'Tomorrow',
      in2days: 'In 2 days',
      nextWeek: 'Next week',
      in7days: 'In 7 days',
      in14days: 'In 14 days',
      in30days: 'In 30 days',
      none: 'none',
      iconTitle: 'Quick set due date'
    };
  }

  function isTouchDevice() {
    return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  }

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function formatDate(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function computeDate(days, special) {
    var d = new Date();
    d.setHours(0, 0, 0, 0);

    if (special === 'next_week') {
      d.setDate(d.getDate() + 7 - (d.getDay() - startOfWeek + 7) % 7);
    } else {
      d.setDate(d.getDate() + (parseInt(days, 10) || 0));
    }
    return d;
  }

  function optionList() {
    var l = labels();
    return [
      { label: l.today, days: 0 },
      { label: l.tomorrow, days: 1 },
      { label: l.in2days, days: 2 },
      { label: l.nextWeek, special: 'next_week' },
      { label: l.in7days, days: 7 },
      { label: l.in14days, days: 14 },
      { label: l.in30days, days: 30 },
      { label: l.none, special: 'none' }
    ];
  }

  function getMenu(cfg) {
    var menu = document.getElementById(cfg.menuId);
    if (menu) {
      return menu;
    }

    menu = document.createElement('div');
    menu.id = cfg.menuId;
    menu.className = 'quick-date-menu';

    var ul = document.createElement('ul');
    optionList().forEach(function (opt) {
      var li = document.createElement('li');
      li.textContent = opt.label;
      if (opt.special) {
        li.setAttribute('data-special', opt.special);
      } else {
        li.setAttribute('data-days', opt.days);
      }
      ul.appendChild(li);
    });
    menu.appendChild(ul);
    document.body.appendChild(menu);

    menu.addEventListener('mouseenter', function () {
      clearTimeout(hideTimers[cfg.menuId]);
    });

    menu.addEventListener('mouseleave', function () {
      scheduleHideMenu(cfg);
    });

    document.addEventListener('click', function (e) {
      var icon = document.getElementById(cfg.iconId);
      if (menu.style.display !== 'none' && !menu.contains(e.target) && e.target !== icon) {
        menu.style.display = 'none';
      }
    });

    menu.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) {
        return;
      }
      var field = document.getElementById(cfg.fieldId);
      if (!field) {
        return;
      }

      if (li.getAttribute('data-special') === 'none') {
        field.value = '';
      } else {
        var date = computeDate(li.getAttribute('data-days'), li.getAttribute('data-special'));
        field.value = formatDate(date);
      }

      field.dispatchEvent(new Event('change', { bubbles: true }));
      menu.style.display = 'none';
    });

    return menu;
  }

  var hideTimers = {};

  function showMenu(cfg, icon) {
    clearTimeout(hideTimers[cfg.menuId]);
    var menu = getMenu(cfg);
    var rect = icon.getBoundingClientRect();
    menu.style.top = (window.scrollY + rect.bottom + 4) + 'px';
    menu.style.left = (window.scrollX + rect.left) + 'px';
    menu.style.display = 'block';
  }

  function scheduleHideMenu(cfg) {
    clearTimeout(hideTimers[cfg.menuId]);
    hideTimers[cfg.menuId] = setTimeout(function () {
      var menu = document.getElementById(cfg.menuId);
      if (menu) {
        menu.style.display = 'none';
      }
    }, 200);
  }

  function ensureIcon() {
    fields.forEach(function (cfg) {
      var field = document.getElementById(cfg.fieldId);
      if (!field) {
        return;
      }
      if (document.getElementById(cfg.iconId)) {
        return;
      }

      var icon = document.createElement('span');
      icon.id = cfg.iconId;
      icon.className = 'quick-date-icon';
      icon.title = labels().iconTitle;
      icon.innerHTML = quickDateIcon;
      icon.setAttribute('tabindex', '0');

      field.insertAdjacentElement('afterend', icon);

      if (isTouchDevice()) {
        icon.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var menu = document.getElementById(cfg.menuId);
          if (menu && menu.style.display === 'block') {
            menu.style.display = 'none';
          } else {
            showMenu(cfg, icon);
          }
        });
      } else {
        icon.addEventListener('mouseenter', function () {
          showMenu(cfg, icon);
        });
        icon.addEventListener('mouseleave', function () {
          scheduleHideMenu(cfg);
        });
        icon.addEventListener('focus', function () {
          showMenu(cfg, icon);
        });
        icon.addEventListener('blur', function () {
          scheduleHideMenu(cfg);
        });
      }
    });
  }

  function init() {
    ensureIcon();
    var watchTarget =
      document.getElementById('all_attributes') ||
      document.querySelector('#issue-form') ||
      document.body;

    var observer = new MutationObserver(function () {
      ensureIcon();
    });
    observer.observe(watchTarget, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
