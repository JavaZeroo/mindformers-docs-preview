/* preview-init.js — make the standalone build look like mindspore.cn:
   - add the portal body classes (theme-docs / page-load) so common.css activates
   - inject a static top header bar (no portal backend needed)
   - build a right-side "On this page" TOC from the content headings, with scroll-spy
*/
(function () {
  document.documentElement.setAttribute('data-o-theme', 'light');

  function ready(fn) {
    if (document.body) { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  ready(function () {
    document.body.classList.add('theme-docs', 'page-load');
    buildHeader();
    buildOnThisPage();
  });

  function buildHeader() {
    if (document.querySelector('.mf-preview-header')) return;
    var path = location.pathname;
    var lang = path.indexOf('/en/') > -1 ? 'en' : 'zh';
    var m = path.match(/^(.*\/(?:zh|en)\/)/);
    var root = m ? m[1] : './';
    var other = lang === 'zh' ? path.replace('/zh/', '/en/') : path.replace('/en/', '/zh/');

    var hdr = document.createElement('header');
    hdr.className = 'mf-preview-header';
    hdr.innerHTML =
      '<a class="mf-ph-brand" href="' + root + 'index.html">MindSpore Transformers</a>' +
      '<span class="mf-ph-tag">文档预览 · r2.0.0 动态图</span>' +
      '<span class="mf-ph-spacer"></span>' +
      '<a class="mf-ph-link" href="' + other + '">' + (lang === 'zh' ? 'EN' : '中文') + '</a>' +
      '<a class="mf-ph-link" href="https://atomgit.com/mindspore/mindformers" target="_blank" rel="noopener">AtomGit 源码</a>';
    document.body.insertBefore(hdr, document.body.firstChild);
    document.body.classList.add('mf-has-header');
  }

  function buildOnThisPage() {
    var main = document.querySelector('.rst-content [itemprop="articleBody"]') ||
               document.querySelector('.rst-content .document') ||
               document.querySelector('.rst-content');
    if (!main) return;
    var heads = main.querySelectorAll('h2, h3');
    if (heads.length < 2) return;

    var items = [];
    heads.forEach(function (h) {
      var link = h.querySelector('a.headerlink');
      var anchor = link ? link.getAttribute('href').slice(1) :
                   (h.id || (h.closest('section') && h.closest('section').id));
      if (!anchor) return;
      var text = (h.textContent || '').replace('¶', '').trim();
      if (!text) return;
      items.push({ anchor: anchor, text: text, l3: h.tagName === 'H3' });
    });
    if (items.length < 2) return;

    var nav = document.createElement('nav');
    nav.className = 'mf-onthispage';
    var html = '<div class="mf-otp-title">本页目录</div><ul>';
    items.forEach(function (it) {
      html += '<li class="' + (it.l3 ? 'mf-otp-l3' : '') + '">' +
              '<a href="#' + it.anchor + '" data-anchor="' + it.anchor + '">' + it.text + '</a></li>';
    });
    html += '</ul>';
    nav.innerHTML = html;
    document.body.appendChild(nav);
    document.body.classList.add('mf-has-otp');

    // scroll-spy: highlight the section currently in view
    var links = {};
    nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('data-anchor')] = a; });
    var sections = items.map(function (it) {
      var el = document.getElementById(it.anchor);
      return { anchor: it.anchor, sec: (el && (el.closest('section') || el)) || null };
    }).filter(function (s) { return s.sec; });

    function spy() {
      var top = window.scrollY + 120;
      var cur = null;
      sections.forEach(function (s) { if (s.sec.offsetTop <= top) cur = s.anchor; });
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('active', k === cur); });
    }
    window.addEventListener('scroll', spy, { passive: true });
    spy();
  }
})();
