import express from "express";
import { CompressionTypes } from "kafkajs";

const routes = express.Router();

routes.post("/certifications", async (req, res) => {
  const message = {
    user: { id: 1, name: "Felippe Butland" },
    course: "Computer Science",
    grade: 10,
  };

  // Chamar micro serviço
  await req.producer.send({
    topic: "issue-certificate",
    compression: CompressionTypes.GZIP,
    messages: [
      { value: JSON.stringify(message) },
      {
        value: JSON.stringify({
          ...message,
          user: { ...message.user, name: "Alexandre Zanella" },
        }),
      },
    ],
  });

  return res.json({ ok: true });
});

export default routes;
