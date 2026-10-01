/* Scroll-to-play for the YouTube embeds.
   A video starts once it settles in the middle of the screen and pauses when it's scrolled
   mostly out of view, so only one ever plays at a time. Browsers only allow autoplay while
   muted; once a visitor turns the sound on, later videos try to start with sound and fall back
   to muted if the browser refuses. Visitors with reduced-motion or data-saver turned on get
   click-to-play only (one-at-a-time and pause-on-scroll-away still apply). */
(function () {
  var frames = [].slice.call(document.querySelectorAll('iframe[src*="youtube.com/embed/"]'));
  if (!frames.length) return;

  var ENDED = 0, PLAYING = 1, PAUSED = 2, BUFFERING = 3;
  var DWELL = 400; // ms a video must stay centered, so smooth-scrolling past one doesn't start it
  var autoOK = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) &&
               !(navigator.connection && navigator.connection.saveData);
  var soundOn = false;
  try { soundOn = sessionStorage.getItem('lyc-sound') === '1'; } catch (e) {}

  var current = null, target = null, timer = 0;
  var vids = frames.map(function (el) {
    return { el: el, p: null, ready: false, state: -1, want: false, stopped: false, pausedAt: 0, cmdAt: 0, soundAt: 0 };
  });

  function isPlaying(v) { return v.state === PLAYING || v.state === BUFFERING; }

  // `want` covers a play we've requested that the player hasn't reported back yet.
  function pause(v) {
    if (!v.ready || !(v.want || isPlaying(v))) return;
    v.want = false; v.pausedAt = Date.now();
    v.p.pauseVideo();
  }

  function mutedPlay(v) {
    v.want = true; v.soundAt = 0; v.cmdAt = Date.now();
    v.p.mute(); v.p.playVideo();
  }

  function play(v) {
    if (!v.ready || v.stopped || isPlaying(v)) return;
    if (!soundOn) return mutedPlay(v);
    v.want = true; v.soundAt = v.cmdAt = Date.now();
    v.p.unMute(); v.p.playVideo();
    setTimeout(function () {
      if (v === current && v.want && !isPlaying(v)) mutedPlay(v);
    }, 1500);
  }

  function onState(v, s) {
    v.state = s;
    var pausedByUs = Date.now() - v.pausedAt < 1500;
    if (s === PLAYING || s === BUFFERING) {
      if (!v.want && pausedByUs) return;               // late report from a play we already cancelled
      v.want = true; v.stopped = false;
      if (s === PLAYING) v.soundAt = 0;                // it started, so any later pause is the visitor's
      vids.forEach(function (o) { if (o !== v) pause(o); });
    } else if (s === PAUSED) {
      if (pausedByUs) return;
      v.want = false;
      if (Date.now() - v.soundAt < 2500) mutedPlay(v); // browser refused to start with sound
      else v.stopped = true;                           // visitor paused it: don't auto-resume
    } else if (s === ENDED) {
      v.want = false; v.stopped = true;
    }
  }

  function check() {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    var h = window.innerHeight, mid = h / 2, best = null, bestD = Infinity;
    var atBottom = h + window.scrollY >= document.documentElement.scrollHeight - 10;
    vids.forEach(function (v) {
      var r = v.el.getBoundingClientRect();
      if (!r.height) return;
      // Share of the video on screen (relative to what fits, for videos taller than a landscape phone).
      var seen = (Math.min(r.bottom, h) - Math.max(r.top, 0)) / Math.min(r.height, h);
      if (seen < 0.5) {
        pause(v);
        if (v === current) current = null;
        return;
      }
      var c = r.top + r.height / 2, d = Math.abs(c - mid);
      // Fully on screen and risen to about the middle (or above it, e.g. after jumping to #about),
      // or as high as the page can scroll it.
      var centered = seen > 0.9 && (c < h * 0.65 || (atBottom && c > mid));
      if (centered && d < bestD) { best = v; bestD = d; }
    });
    if (best === target) return;
    target = best;
    clearTimeout(timer);
    if (!best || best === current) return;
    timer = setTimeout(function () {
      current = best;
      if (!autoOK) return;
      vids.forEach(function (o) { if (o !== best) pause(o); });
      play(best);
    }, DWELL);
  }

  // Remember whether the visitor is listening with sound, from whichever video is playing.
  setInterval(function () {
    vids.forEach(function (v) {
      if (!v.ready || v.state !== PLAYING || Date.now() - v.cmdAt < 2500) return;
      var on = !v.p.isMuted();
      if (on === soundOn) return;
      soundOn = on;
      try { sessionStorage.setItem('lyc-sound', on ? '1' : '0'); } catch (e) {}
    });
  }, 1000);

  var prevReady = window.onYouTubeIframeAPIReady;
  window.onYouTubeIframeAPIReady = function () {
    if (prevReady) prevReady();
    vids.forEach(function (v) {
      v.p = new YT.Player(v.el, { events: {
        onReady: function () { v.ready = true; if (v === current && autoOK) play(v); },
        onStateChange: function (e) { onState(v, e.data); }
      } });
    });
  };
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);

  var queued = false;
  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { queued = false; check(); });
  }
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule);
  check();
})();
