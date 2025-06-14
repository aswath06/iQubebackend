// routes/auth.routes.js
const authController = require('../controllers/auth');

module.exports = (app) => {
  app.post('/auth/register', authController.register);
  app.post('/auth/login', authController.login);
};
