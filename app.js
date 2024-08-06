const express = require('express');
global.express = express;
const http = require('http');
const socketIo = require('socket.io');

// Produrer
const producer = require('./rabbitmq/producer');
// Consumer(s)
const emailConsumer = require('./rabbitmq/emailConsumer.js');
const webConsumer = require('./rabbitmq/webConsumer.js');
const mobileConsumer = require('./rabbitmq/mobileConsumer.js');

require('dotenv').config();
let messageFrequency = 300; // How many messages per second a producer should generate
global.messageFrequency = messageFrequency;

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const PORT = 7077;
app.use(express.json());
app.use(express.static('public'));

const delay = function delay(m) {
    return new Promise(resolve=>setTimeout(resolve,m));
}
global.delay = delay;

const rabbitmqUser = process.env.RABBITMQ_USER;
const rabbitmqPass = process.env.RABBITMQ_PASS;
const rabbitmqHost = process.env.RABBITMQ_HOST;
const rabbitmqUri = `amqp://${rabbitmqUser}:${rabbitmqPass}@${rabbitmqHost}:5672`;
global.rabbitmqUri = rabbitmqUri;

const getQl = async () => {
	const amqp = require('amqplib');
	const connection = await amqp.connect(rabbitmqUri);
	const channel = await connection.createChannel();
	const queues = ['mobile', 'web', 'email'];
  	const ql = {};

  	for (const queue of queues) {
    		const queueInfo = await channel.assertQueue(queue, {durable:true});
   		ql[queue] = queueInfo.messageCount;
 	}
  	await channel.close();
  	await connection.close();
	return ql;
};

global.io = io;
io.on('connection',(socket)=>{
    console.info('client connected');
    socket.on('setRate', (rate) => {
	if (parseInt(rate) > 2000) {
		rate = 2000; //
	}
        global.messageFrequency = parseInt(rate);
        console.log(`Message rate set to ${global.messageFrequency} messages per second`);
	//clearInterval(qLIntervalId);
    });
    const emitQl = async () => {
        const l = await getQl();
	console.info(l);
        socket.emit('Ql', l);
    };
    const qLIntervalId = setInterval(emitQl, 1000);
    socket.on('disconnect', () => {
clearInterval(qLIntervalId);
        console.log('Client disconnected');
    });
});

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/public/main.html');
});

// Generate messages (300/sec)
producer.produceMessages(io);
// Consume messages via 3 different channels: email, popup in a browser and mobile app
emailConsumer.consumeMessages(io);
webConsumer.consumeMessages(io);
mobileConsumer.consumeMessages(io);

server.listen(PORT,() => {
  console.info(`Server is running. Port: ${PORT}`);
});
