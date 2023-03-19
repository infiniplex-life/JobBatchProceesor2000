var cproc = require("child_process");
const path = require('path')
const { DEFAULT_DIR, RABBITMQ_URL} = require('../config')
const fs = require('fs')
const { performance } = require('perf_hooks');

const amqp = require("amqplib");
var channel, connection;

const { DATABASE_PATH} = require("../config")

const db = require('better-sqlite3')(DATABASE_PATH);

connectQueue() // call connectQueue function
async function connectQueue() {
    try {

        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel()
        console.log("Listening RabbitMQ");
        // connect to 'test-queue', create one if doesnot exist already
        await channel.assertQueue("task-queue")
        
        channel.consume("task-queue", data => {
            // console.log(data)
            console.log("Data received : ", `${Buffer.from(data.content)}` );
            processQueueData(Buffer.from(data.content))
            channel.ack(data)
        })
    } catch (error) {
        console.log(error)
    }
}

async function processQueueData(id) {
    db.prepare("UPDATE Task Set status = 1 WHERE id = @id").run({ id: id.toString()})
    const dirId = path.join(DEFAULT_DIR,id.toString())
    var log_file = fs.createWriteStream(path.join(dirId, 'logs.txt'), {flags : 'w'});
    const startTime = performance.now()
    let proc = cproc.spawn(`py mockup.py --config-file ${path.join(dirId, 'config.ini')} --output-dir  ${path.join(dirId)}`, [] , {shell: true} );
    proc.stdout.on('data',data => log_file.write(data.toString()));
    proc.stderr.on('data', data =>  log_file.write(data.toString()));
    proc.on('exit', async function (code) {
        const endTime = performance.now()
        db.prepare("UPDATE Task Set status = 2 , executeTime = @executeTime, isSuccess = @code WHERE id = @id").run({ id: id.toString(), executeTime: Math.round(endTime - startTime), code: code})

    });
}