(function () {
  const API_URL = "http://localhost:3000/api/collector";

  let sessionId = localStorage.getItem("cf_session_id");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("cf_session_id", sessionId);
  }

  function scout(eventType, extra = {}) {
    const payload = {
      session_id: sessionId,
      event_type: eventType,
      page_url: window.location.href,
      timestamp: new Date().toISOString(),
      ...extra,
    };

    navigator.sendBeacon(API_URL, JSON.stringify(payload));
  }

  // Page view
  scout("page_view");

  // Click scouting
  document.addEventListener("click", function (e) {
    scout("click", {
      x: e.clientX,
      y: e.clientY,
    });
  });
})();
