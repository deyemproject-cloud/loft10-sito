// Auth gate — runs before page renders
(function () {
  var KEY = 'loft10_auth';
  if (!sessionStorage.getItem(KEY)) {
    // Preserve intended destination so we could redirect back (future use)
    window.location.replace('password.html');
  }
})();
