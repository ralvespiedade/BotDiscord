const { Client, Message } = require('discord.js');
const { OpenAI } = require('openai');

const IGNORE_PREFIX = "!";

const CHANNELS = [
  '1180816513184313398',
  '1194998462975070259',
  '1195013065356349500',
];

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY,
})

/**
 * 
 * @param {Client} client 
 * @param {Message} message 
 * @returns 
 */
module.exports = async (client, message) => {
  //Se o autor da mensagem for um bot, encerre.
  if (message.author.bot) return;
  //Se a mensagem começa com o prefixo ignorado, encerre.
  if (message.content.startsWith(IGNORE_PREFIX)) return;
  //Se o id do canal não estiver dentro da lista autorizada
  if (!CHANNELS.includes(message.channelId)) return;

  if (message.mentions.users.has(client.user.id)) {
    //messagem que o bot está digitando
    await message.channel.sendTyping();

    //criando um loop para executar .sendTyping de 5 em 5 segundos.
    const sendTypingInterval = setInterval(() => {
      message.channel.sendTyping();
    }, 5000);

    let conversation = [];

    conversation.push({
      role: 'system',
      content: 'Chat GPT é um chatbot amigável.'
    });

    //pegando as 10 últimas mensagens do canal. "Sensacional"
    let prevMessages = await message.channel.messages.fetch({ limit: 10 })

    
    // A última mensagem do canal será a última da lista.
    prevMessages.reverse();
    
    //iterando pelas 10 últimas mensagens do canal
    prevMessages.forEach((msg) => {
      console.log(msg.content)
      //Só vamos armazenar mensagens do C3Po, não de outros bots
      if (msg.author.bot && msg.author.id !== client.user.id) return;
      //Verificando se a mensagem contem o prefixo ignorado
      if (msg.content.startsWith(IGNORE_PREFIX)) return;

      //tirando caracteres especiais do username  
      const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

      //armazenando se a mensagem do nosso bot
      //tratando elas como mensagens de um assistente
      if (msg.author.id === client.user.id) {
        conversation.push({
          role: 'assistant',
          name: username,
          content: msg.content,
        });

        return;
      }

      //armazenando a mensagem do usuário
      conversation.push({
        
        role: 'user',
        name: username,
        content: msg.content,
      
      });


    });

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: conversation,
    }).catch((error) => console.error(`OpenAI error: \n`, error));
    
    //após ter retorno da API, encerra o serInterval
    clearInterval(sendTypingInterval);

    //messagem caso o retorno da API seja nulo
    if (!response) {
      message.reply('Estou tendo problemas com a OpenAI. Tente novamente em alguns segundos.');
      return;
    };


    const responseMessage = response.choices[0].message.content;
    const chunkSizeLimit = 2000;

    for (let i = 0; i < responseMessage.length; i += chunkSizeLimit) {
      const chunk = responseMessage.substring(i, i + chunkSizeLimit)
      

      await message.reply(chunk);
    }
    
  };

};
