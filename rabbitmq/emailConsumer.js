const amqp = require('amqplib');
require('dotenv').config();

exports.consumeMessages = async (preference) => {
  const connection = await amqp.connect(global.rabbitmqUri);
  const channel = await connection.createChannel();

await channel.assertQueue('email', { durable: true });
//channel.prefetch(1);
  channel.consume('email', async (msg) => {
    if (msg !== null) {
      const message = JSON.parse(msg.content.toString());
      await delay(Math.floor(Math.random() * 100)); // Some random delay, up to 100 millisecond
      channel.ack(msg);
    }
  }, {noAck: false});
};
