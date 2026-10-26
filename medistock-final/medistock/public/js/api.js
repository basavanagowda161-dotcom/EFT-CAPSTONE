// Makes text safe to show on the page
function esc(text) {
  return String(text).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function currentUser() {
  return JSON.parse(localStorage.getItem('user'));
}

// Talk to the server. Example: api('medicines')
async function api(path, method, body) {
  const response = await fetch('/api/' + path, {
    method: method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + localStorage.getItem('token')
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
}

function logout() {
  localStorage.clear();
  location.href = '/index.html';
}

// Send the user to the login page if their role is not allowed here
function requireRole(roles) {
  const user = currentUser();
  if (!user || !roles.includes(user.role)) {
    location.href = '/login.html';
  }
  return user;
}

// ---------- Pop-up message (modal) ----------
// popup({ title, message, type: 'success' | 'error' | 'warn' | 'info', confirm: true/false, okText, cancelText })
// Returns a promise: true when OK is pressed, false when cancelled or closed.
function popup(opts) {
  const type = opts.type || 'info';
  const icons = { success: '\u2713', error: '\u2715', warn: '!', info: 'i' };
  return new Promise(function (resolve) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML =
      '<div class="modal ' + type + '" role="dialog" aria-modal="true">' +
      '<div class="modal-icon">' + icons[type] + '</div>' +
      '<h3>' + esc(opts.title || '') + '</h3>' +
      '<p>' + esc(opts.message || '') + '</p>' +
      '<div class="modal-actions">' +
      (opts.confirm ? '<button class="light" data-r="0">' + esc(opts.cancelText || 'Cancel') + '</button>' : '') +
      '<button data-r="1">' + esc(opts.okText || 'OK') + '</button></div></div>';

    function close(result) {
      document.removeEventListener('keydown', onKey);
      overlay.remove();
      resolve(result);
    }
    function onKey(e) {
      if (e.key === 'Escape') close(false);
      if (e.key === 'Enter') close(true);
    }
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay && !opts.confirm) close(false);
      const r = e.target.getAttribute && e.target.getAttribute('data-r');
      if (r !== null && r !== undefined) close(r === '1');
    });
    document.addEventListener('keydown', onKey);
    document.body.appendChild(overlay);
    overlay.querySelector('button[data-r="1"]').focus();
  });
}
function showSuccess(message, title) { return popup({ type: 'success', title: title || 'Success', message: message }); }
function showError(message, title) { return popup({ type: 'error', title: title || 'Oops!', message: message }); }
function showWarn(message, title) { return popup({ type: 'warn', title: title || 'Attention', message: message }); }
function askConfirm(message, title) { return popup({ type: 'warn', title: title || 'Are you sure?', message: message, confirm: true, okText: 'Yes' }); }

// Small message that slides up at the bottom of the screen
function toast(text, isError) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const box = document.createElement('div');
  box.className = 'toast' + (isError ? ' error' : '');
  box.textContent = text;
  document.body.appendChild(box);
  setTimeout(function () { box.remove(); }, 3500);
}
