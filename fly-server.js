const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");

const app = express();
const port = process.env.PORT || 8080;
const host = '0.0.0.0';

// Credenciais Clicksend
const clicksendUsername = process.env.CLICKSEND_USERNAME || "diartbr@gmail.com";
const clicksendApiKey = process.env.CLICKSEND_API_KEY || "F7B9B287-F05D-16A9-F9CB-9FBDCAC5B505";
const senderId = process.env.CLICKSEND_SENDER_ID || "Panito";

app.use(cors());
app.use(bodyParser.json());

// Rota de saúde
app.get('/health', (req, res) => {
  res.json({ status: '✅ API Fly.io Online', timestamp: new Date() });
});

// Rota de alertas (SÓ ESSA FUNCIONALIDADE)
app.post("/enviar-alerta", async (req, res) => {
  const { telefones, produtorNome, messageBody } = req.body;

  if (!telefones || telefones.length === 0) {
    return res.status(400).send({ success: false, message: "Nenhum telefone fornecido." });
  }

  const mensagemFinal = messageBody || `Olá! A ${produtorNome || "seu produtor local"} está com uma fornada de pães quentinhos! Corre!`;

  const messages = telefones.map((telefone) => ({
    source: "sdk",
    from: senderId,
    body: mensagemFinal,
    to: `+${telefone}`,
  }));

  try {
    const response = await axios.post("https://rest.clicksend.com/v3/sms/send", {
      messages: messages
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clicksendUsername}:${clicksendApiKey}`).toString("base64")}`,
      },
      timeout: 10000
    });

    res.status(200).send({ success: true, message: "SMS enviados com sucesso!" });
  } catch (error) {
    res.status(500).send({ 
      success: false, 
      message: "Erro ao enviar SMS",
      details: error.response?.data || error.message 
    });
  }
});

app.listen(port, host, () => {
  console.log(`🚀 API SMS rodando na porta ${port}`);
});
