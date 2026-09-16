(() => {
  "use strict";
  try {
    if (window.top !== window.self) {
      document.documentElement.style.display = "none";
      try { window.top.location = window.self.location.href; } catch (_) {}
      return;
    }
    Object.defineProperty(window, "__SMACHIM_TOP_LEVEL__", {
      value: true,
      configurable: false,
      enumerable: false,
      writable: false
    });
  } catch (_) {
    document.documentElement.style.display = "none";
  }
})();