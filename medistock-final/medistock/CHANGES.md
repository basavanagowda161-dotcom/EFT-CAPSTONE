# MediStock - final version: file status

Run:  npm install  ->  npm start   (Node 22.5+ ; demo data is created automatically)
Demo logins (password pass123): admin@, pharmacist@, cashier@, patient@ medistock.com

NEW
- config/db.js                       (was missing; opens the database)
- public/css/style.css               new "Aurora" design, pop-up and order styles

MODIFIED
- package.json, server.js
- Database/schema.sql, Database/seed.js        (12 extra medicines, demo schedule)
- routes/auth.routes.js                        (fixed wrong content)
- routes/order.routes.js                       (GET /mine, PATCH /:id/status)
- controllers/order.controller.js              (mine, setStatus, item lines with prices)
- public/js/api.js                             (popup, showSuccess/Error/Warn, askConfirm, toast)
- public/index.html                            (new home page, cart drawer)
- public/login.html                            (pop-ups, demo buttons)
- public/pages/patient-dashboard.html          (mark taken, reminders, My orders + tracker)
- public/pages/staff.html                      (tabs, unlimited tablets, order cards + status update)

UNCHANGED
- .env, middleware/*, services/*,
  controllers/auth|billing|dashboard|medicine, routes/billing|dashboard|medicine
