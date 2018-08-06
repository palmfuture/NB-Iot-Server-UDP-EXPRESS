const app = require('./app');
const config = require('./config');

app.listen(config.expressPort, () => { console.log(`Running API Server on port ${config.expressPort}`) });