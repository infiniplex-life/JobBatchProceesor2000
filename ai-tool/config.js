const path = require('path');
module.exports = {
    DEFAULT_DIR: path.join(__dirname, './data'),
    RABBITMQ_URL:"amqp://localhost:5672",
    DATABASE_PATH: path.join(__dirname, "./data.db"),
    BACKEND_URL: "http://localhost:3001"

}

