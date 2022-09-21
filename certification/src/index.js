import { Kafka } from 'kafkajs';
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const kafka = new Kafka({
  brokers: ['localhost:9092'],
  clientId: 'certificate',
});

const topic = 'issue-certificate';
const consumer = kafka.consumer({ groupId: 'certificate-group' });
const producer = kafka.producer();

async function run() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const dateMessage = await formatData();

      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`${prefix} ${message.key}#${message.value}`);

      const payload = JSON.parse(message.value);

      await insertOnDb(payload).then(async (user) => {
        const response = await formatData();
        await producer.send({
          topic: 'certification-response',
          messages: [
            {
              value: `Mensagem recebida às ${dateMessage} \n Certificado do usuário ${user.name} com id ${payload.user.id}, do curso ${user.course} gerado às ${user.createdAt} \n Resposta enviada às ${response} \n \n`,
            },
          ],
        });
      });
    },
  });
}

async function insertOnDb(payload) {
  const user = await prisma.user.create({
    data: {
      id: payload.user.id,
      name: payload.user.name,
      course: payload.course,
    },
  });

  delete user.id;
  user.createdAt = `${new Date(user.createdAt).getHours()}:${new Date(
    user.createdAt
  ).getMinutes()}:${new Date(user.createdAt).getSeconds()}:${new Date(
    user.createdAt
  ).getMilliseconds()}`;
  return user;
}

async function formatData() {
  return `${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}:${new Date().getMilliseconds()}`;
}

run().catch(console.error);
