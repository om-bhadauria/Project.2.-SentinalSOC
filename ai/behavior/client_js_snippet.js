// SentinelSOC Keystroke Dynamics Snippet
// Include this snippet in your web application's login form to gather keystroke dynamics

(function() {
  const keystrokes = [];
  const usernameInputId = 'username'; // ID of your username field
  const passwordInputId = 'password'; // ID of your password field
  
  function recordKey(e) {
      if (['Shift', 'CapsLock', 'Tab'].includes(e.key)) return;
      keystrokes.push({
          key: e.key,
          time: Date.now(),
          type: e.type // 'keydown' or 'keyup'
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
      const el = document.getElementById(passwordInputId);
      if (el) {
          el.addEventListener('keydown', recordKey);
          el.addEventListener('keyup', recordKey);
      }
      
      const form = el ? el.closest('form') : null;
      if (form) {
          form.addEventListener('submit', (e) => {
              // In a real implementation:
              // 1. You could attach the `keystrokes` array as a hidden field
              // 2. OR you could send it via AJAX before/during login.
              
              console.log("Captured Keystrokes for SentinelSOC:");
              console.log(JSON.stringify(keystrokes));
              
              // Example backend sync:
              /*
              const username = document.getElementById(usernameInputId).value;
              fetch('/api/behavior/verify', {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json'},
                  body: JSON.stringify({ username, keystrokes })
              });
              */
          });
      }
  });
})();
