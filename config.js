const path = require('path');
module.exports = {
    DEFAULT_DIR: path.join(__dirname, './data'),
    RABBITMQ_URL:"amqp://guest:guest@rabbitmq:5672",
    DATABASE_PATH: path.join(__dirname, "data/data.db"),
}

