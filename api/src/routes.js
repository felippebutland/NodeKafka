import express from 'express';
import { CompressionTypes } from 'kafkajs';
import { randomUUID } from 'crypto';

const routes = express.Router();

routes.post('/certifications', async (req, res) => {
  const message = {
    user: { id: randomUUID(), name: req.body.name },
    course: req.body.course,
  };

  // Chamar micro serviço
  await req.producer.send({
    topic: 'issue-certificate',
    compression: CompressionTypes.GZIP,
    messages: [{ value: JSON.stringify(message) }],
  });

  return res.json({ ok: true });
});

export default routes;
