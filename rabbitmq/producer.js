const amqp = require('amqplib');
require('dotenv').config();

const notificationTypes = ['check', 'checkmate', 'captured', 'ko', 'punch', 'other'];
const queues = ['mobile','web','email'];

exports.produceMessages = async function(io) {
  const connection = await amqp.connect(global.rabbitmqUri);
  const channel = await connection.createChannel();
  await channel.assertQueue('mobile', { durable: true});
  await channel.assertQueue('web', { durable: true });
  await channel.assertQueue('email', { durable: true });
// Probably must be wrapped into Promise.all() call

  setInterval(async() => {
    for (let i = 0; i<global.messageFrequency;i++) {
      const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]; // Random type of notification
      // Assumption. 1 user has only 1 notification enabled.
      const queue = queues[Math.floor(Math.random() * queues.length)]; // Random channel. At the moment, it's unclear which channel would be the busiest one.
      const message = {i: i, queue: queue, type: type, content: `Message goes here. Type: ${type}`, timestamp: new Date()};
      const messageBuffer = Buffer.from(JSON.stringify(message));
      channel.sendToQueue(queue, messageBuffer, {persistent: true});
      io.emit('chessNotification', message);
    }
  }, 1000);
};
