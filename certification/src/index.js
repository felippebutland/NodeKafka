import { Kafka } from 'kafkajs';
import User from '../models/user';

const kafka = new Kafka({
  brokers: ['localhost:9092'],
  clientId: 'certificate',
})

const topic = 'issue-certificate'
const consumer = kafka.consumer({ groupId: 'certificate-group' })
const producer = kafka.producer();

async function run() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      console.log(`- ${prefix} ${message.key}#${message.value}`)

      const payload = JSON.parse(message.value);

      await insertOnDb();
      console.log("hehehre")
      // setTimeout(() => {
      await producer.send({
        topic: 'certification-response',
        messages: [
          {value: `Certificado do usuário ${payload.user.name} do curso ${payload.course} gerado!, ${new Date()}`}
        ]
      })
      // }, 3000);
    },
  })
}

async function insertOnDb(){
  console.log("entrei aqui")
  await User.create({firstName: "John Doe", course: "Computer Science"});
}

run().catch(console.error)