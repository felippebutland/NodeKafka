import { Kafka } from "kafkajs";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const kafka = new Kafka({
  brokers: ["localhost:9092"],
  clientId: "certificate",
});

const topic = "issue-certificate";
const consumer = kafka.consumer({ groupId: "certificate-group" });
const producer = kafka.producer();

async function run() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
      console.log(`${prefix} ${message.key}#${message.value}`);

      const payload = JSON.parse(message.value);

      await insertOnDb(payload).then(async (user) => {
        await producer.send({
          topic: "certification-response",
          messages: [
            {
              value: `Certificado do usuário ${user.name} do curso ${
                user.course
              } gerado às ${
                user.createdAt
              }!, resposta enviada às ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}:${new Date().getMilliseconds()}`,
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
      name: payload.user.name,
      course: payload.course,
      createdAt: new Date(),
    },
  });

  delete user.id;
  user.createdAt = `${new Date(user.createdAt).getHours()}:${new Date(
    user.createdAt
  ).getSeconds()}:${new Date(user.createdAt).getSeconds()}:${new Date(
    user.createdAt
  ).getMilliseconds()}`;
  return user;
}

run().catch(console.error);
