const amqp = require('amqplib');
require('dotenv').config();

exports.consumeMessages = async (preference) => {
  const connection = await amqp.connect(global.rabbitmqUri);
  const channel = await connection.createChannel();

  // Mobile queue
  await channel.assertQueue('mobile', { durable: true });
//channel.prefetch(1);
  channel.consume('mobile', async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString());
//await delay(Math.floor(Math.random() * 70)); // Some random delay, up to 70 milisecond
        channel.ack(msg);
    }
  }, {noAck: false});
};
