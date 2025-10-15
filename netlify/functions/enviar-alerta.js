const axios = require("axios");

exports.handler = async function(event, context) {
  console.log("=== 🚀 FUNÇÃO INICIADA ===");
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ message: "Método não permitido" }) };
  }

  let telefones, produtorNome, messageBody;
  
  try {
    const body = JSON.parse(event.body);
    telefones = body.telefones;
    produtorNome = body.produtorNome;
    messageBody = body.messageBody;
    console.log("✅ Telefones recebidos:", telefones?.length);
  } catch (parseError) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Erro ao processar JSON" })
    };
  }

  if (!telefones || telefones.length === 0) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: "Nenhum telefone fornecido." })
    };
  }

  // ✅ CREDENCIAIS CLICKSEND
  const clicksendUsername = "diartbr@gmail.com";
  const clicksendApiKey = "F7B9B287-F05D-16A9-F9CB-9FBDCAC5B505";
  const senderId = "Panito";

  const mensagemFinal = messageBody || `Olá! ${produtorNome || "Seu produtor"} tem pães quentinhos!`;

  const messages = telefones.map((telefone) => {
    const telefoneLimpo = telefone.replace(/\D/g, '');
    const telefoneFormatado = telefoneLimpo.startsWith('55') ? telefoneLimpo : `55${telefoneLimpo}`;
    
    return {
      source: "sdk",
      from: senderId,
      body: mensagemFinal,
      to: `+${telefoneFormatado}`
    };
  });

  try {
    const response = await axios.post("https://rest.clicksend.com/v3/sms/send", {
      messages: messages,
    }, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${clicksendUsername}:${clicksendApiKey}`).toString("base64")}`,
      },
      timeout: 15000,
    });

    console.log("✅ SMS enviados com sucesso!");
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ 
        success: true, 
        message: `✅ SMS enviados para ${telefones.length} cliente(s)!`,
        quantidade: telefones.length
      })
    };

  } catch (error) {
    console.error("❌ ERRO:", error.response?.data || error.message);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false, 
        message: "Erro ao enviar SMS",
        error: error.response?.data || error.message
      })
    };
  }
};
