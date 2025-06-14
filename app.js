const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const os = require('os');
require('dotenv').config();

const db = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

// ========== Middlewares ==========
app.use(cors()); // Optional: allow cross-origin requests
app.use(bodyParser.json());
app.use(morgan('dev')); // Optional: log HTTP requests

// ========== Routes ==========
require('./routes/user.routes')(app);
require('./routes/todo.routes')(app);
require('./routes/note.routes')(app);
require('./routes/timetable.routes')(app);
require('./routes/socialmedia.routes')(app);
require('./routes/auth.routes')(app);

// ========== Get Local Network IP ==========
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

// ========== Database & Server Startup ==========
db.sequelize.sync({ alter: true }) // use { force: true } to drop & recreate all tables
  .then(() => {
    const localIP = getLocalIP();
    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server running at:`);
      console.log(`→ Local:   http://localhost:${PORT}`);
      console.log(`→ Network: http://${localIP}:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to database:', err.message);
  });
