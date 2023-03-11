const express = require('express')
const { MongoClient, ObjectId } = require('mongodb')
const {
  Worker,
  isMainThread,
  parentPort,
  workerData
} = require('worker_threads')
const { DEFAULT_DIR, RABBITMQ_URL } = require('./config.js')
console.log(DEFAULT_DIR)
const path = require('path')
const fs = require('fs')
let db = null
const prettyBytes = require('pretty-bytes')

const cors = require('cors')
const app = express()
app.use(cors())
app.use(express.json())
const port = 3001
const amqp = require('amqplib')
var channel, connection

connectQueue() // call connectQueue function
async function connectQueue () {
  try {
    connection = await amqp.connect(RABBITMQ_URL)
    console.log('Connecting RabbitMQ')

    channel = await connection.createChannel()

    await channel.assertQueue('task-queue')
  } catch (error) {
    console.log(error)
  }
}
app.post('/add', async (req, res) => {
  console.log(req.body)
  const add = await db.insertOne({
    ...req.body,
    status: 0,
    createdAt: new Date().getTime()
  })
  const id = add.insertedId.toString()
  fs.mkdirSync(path.join(DEFAULT_DIR, id))
  fs.writeFileSync(`${DEFAULT_DIR}/${id}/config.ini`, req.body.config)
  await channel.sendToQueue('task-queue', Buffer.from(id))
  return res.send('ok')
})

app.get('/tasks', async (req, res) => {
  const result = await db.find().sort({ $natural: -1 }).toArray()
  return res.send(result)
})

app.delete('/delete/:id', async (req, res) => {
  if (!req.params.id) {
    return 'not receive id'
  }
  try {
    await db.deleteOne({ _id: new ObjectId(req.params.id) })
    if (fs.existsSync( path.join(DEFAULT_DIR, req.params.id))) {
      const directory = path.join(DEFAULT_DIR, req.params.id)
      deleteFolder(directory)
    }
  }catch(e) {
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

app.listen(port, async () => {
  new Worker('./processQueue.js')
  if (!fs.existsSync('./data')) {
    fs.mkdirSync(DEFAULT_DIR)
  }
  const client = await MongoClient.connect(
    `mongodb+srv://hienvuong:lcuBGX3GrqeTWo11@hienvuong.oumbl.gcp.mongodb.net/?retryWrites=true&w=majority`,
    { useNewUrlParser: true }
  )
  database = client.db('gui')
  db = database.collection('task')
  console.log(`App listening on port ${port}`)
})

const getFileInfoFromFolder = route => {
  const files = fs.readdirSync(route, 'utf8')
  const response = []
  for (let file of files) {
    const size = prettyBytes(fs.statSync(path.join(route, file)).size)
    response.push({ name: file, size })
  }
  return response
}

const deleteFolder =  (directory) => {
  fs.rmSync(path.join(directory), {recursive: true})

}