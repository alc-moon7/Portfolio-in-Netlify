(function() {
  var fill = document.getElementById('progress-fill');
  var text = document.getElementById('progress-text');
  if (!fill || !text) return;

  var imgs = Array.prototype.slice.call(document.images || []);
  var extra = []; // add extra URLs if you want to track more assets
  var total = Math.max(1, imgs.length + extra.length);
  var done = 0;
  var hid = false;

  function update() {
    var pct = Math.min(100, Math.round((done / total) * 100));
    fill.style.width = pct + '%';
    text.textContent = pct + '%';
    if (pct >= 100 && !hid) {
      hid = true;
      if (window.jQuery) {
        $("#loading,#curtain,#splash").fadeOut(300, function() {
          $("#loading,#curtain,#splash").css("display", "none");
        });
      } else {
        var els = document.querySelectorAll('#loading,#curtain,#splash');
        els.forEach(function(el) { el.style.display = 'none'; });
      }
    }
  }

  function inc() { done++; update(); }

  imgs.forEach(function(img) {
    if (img.complete) {
      inc();
    } else {
      img.addEventListener('load', inc, { once: true });
      img.addEventListener('error', inc, { once: true });
    }
  });

  extra.forEach(function(src) {
    var im = new Image();
    im.onload = inc; im.onerror = inc;
    im.src = src;
  });

  // Safety fallback if something hangs
  setTimeout(function() {
    done = total;
    update();
  }, 10000);

  update();
})();
