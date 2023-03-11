var cproc = require("child_process");
const path = require('path')
const { DEFAULT_DIR, RABBITMQ_URL} = require('./config')
const fs = require('fs')
const { performance } = require('perf_hooks');
const { MongoClient, ObjectId }  = require('mongodb')

const amqp = require("amqplib");
var channel, connection;

let db = null

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
        const client = await MongoClient.connect(`mongodb+srv://hienvuong:lcuBGX3GrqeTWo11@hienvuong.oumbl.gcp.mongodb.net/?retryWrites=true&w=majority`, { useNewUrlParser: true })
        database = client.db('gui')
        db = database.collection('task')
    } catch (error) {
        console.log(error)
    }
}

async function processQueueData(id) {
    await db.updateOne({_id: new ObjectId(id.toString())}, {$set: {status: 1}})
    const dirId = path.join(DEFAULT_DIR,id.toString())
    var log_file = fs.createWriteStream(path.join(dirId, 'logs.txt'), {flags : 'w'});
    const startTime = performance.now()
    let proc = cproc.spawn(`py mockup.py --config-file ${path.join(dirId, 'config.ini')} --output-dir  ${path.join(dirId)}`, [] , {shell: true} );
    proc.stdout.on('data',data => log_file.write(data.toString()));
    proc.stderr.on('data', data =>  log_file.write(data.toString()));
    proc.on('exit', async function (code) {
        const endTime = performance.now()
        await db.updateOne({_id: new ObjectId(id.toString())}, {$set: {status: 2, executeTime: Math.round(endTime - startTime)}})
        
    });
}