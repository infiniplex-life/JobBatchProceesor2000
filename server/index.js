const express = require('express')
const { Worker } = require('worker_threads')
const { DEFAULT_DIR, RABBITMQ_URL, DATABASE_PATH } = require('../config')
const path = require('path')
const fs = require('fs')
const db = require('better-sqlite3')(DATABASE_PATH);
const prettyBytes = require('pretty-bytes')
const cors = require('cors')
const app = express()
const amqp = require('amqplib')

var rabbitmq_channel

async function connectQueue() {
    try {
        connection = await amqp.connect(RABBITMQ_URL)
        console.log('Connecting RabbitMQ')
        rabbitmq_channel = await connection.createChannel()
        await rabbitmq_channel.assertQueue('task-queue')

        new Worker('./server/processQueue.js')
        if (!fs.existsSync(DEFAULT_DIR)) {
            fs.mkdirSync(DEFAULT_DIR)
        }
        console.log('Connected RabbitMQ')
    } catch (error) {
        console.log(error)
    }
}

async function setupDB() {
    db.exec(`CREATE TABLE IF NOT EXISTS task (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
    config TEXT NOT NULL,
    createdAt INTEGER,
status INTEGER,
executeTime INTEGER,
    isSuccess INTEGER
);`)

}
const getFileInfoFromFolder = route => {
    const files = fs.readdirSync(route, 'utf8')
    const response = []
    for (let file of files) {
        const size = prettyBytes(fs.statSync(path.join(route, file)).size)
        response.push({ name: file, size })
    }
    return response
}

const deleteFolder = (directory) => {
    fs.rmSync(path.join(directory), { recursive: true })
}


connectQueue()
setupDB()
app.use(cors())
app.use(express.json())


app.post('/add', async (req, res) => {
    console.log(req.body)
    const add = db.prepare('INSERT INTO task (name, config, createdAt, status, executeTime, isSuccess) VALUES (@name, @config, @createdAt, 0, null, null)').run({
        name: req.body.name,
        config: req.body.config,
        createdAt: new Date().getTime()
    })
    const id = add.lastInsertRowid.toString()
    fs.mkdirSync(path.join(DEFAULT_DIR, id))
    fs.writeFileSync(`${DEFAULT_DIR}/${id}/config.ini`, req.body.config)
    await rabbitmq_channel.sendToQueue('task-queue', Buffer.from(id))
    return res.send('ok')
})

app.get('/tasks', async (req, res) => {
    const result = db.prepare('SELECT * FROM TASK ORDER BY id DESC').all()
    return res.send(result)
})

app.delete('/delete/:id', async (req, res) => {
    if (!req.params.id) {
        return 'not receive id'
    }
    try {
        db.prepare('DELETE FROM Task WHERE id = @id;').run({
            id: req.params.id
        })
        if (fs.existsSync(path.join(DEFAULT_DIR, req.params.id))) {
            const directory = path.join(DEFAULT_DIR, req.params.id)
            deleteFolder(directory)
        }
    } catch (e) {
        console.log(e);
    }
    return res.send('ok')
})

app.get('/detail/:id', async (req, res) => {
    if (!req.params.id) {
        return 'not receive id'
    }
    console.log(DEFAULT_DIR)
    console.log(req.params.id)
    const result = getFileInfoFromFolder(path.join(DEFAULT_DIR, req.params.id))
    console.log(result)
    return res.send(result)
})

app.get('/download/:path/:filename', async (req, res) => {
    if (!req.params.path || !req.params.filename) {
        return res.send('not receive filename/path')
    }
    console.log(req.params.path)
    console.log(req.params.filename)
    const url = path.join(DEFAULT_DIR, req.params.path, req.params.filename)
    res.download(url)
})

module.exports = app
