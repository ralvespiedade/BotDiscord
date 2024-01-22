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
  //Se o id do canal não estiver dentro da lista autorizada e tiver alguma mensão do C3PO, encerre.
  if (!CHANNELS.includes(message.channelId) && message.mentions.users.has(client.user.id)) return;

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        //name:
        role: 'system',
        content: 'Chat GPT é um chatbot amigável.'
      },
      {
        //name:
        role: 'user',
        content: message.content,
      }
    ]
  }).catch((error) => console.error(`OpenAI error: \n`, error));

  //console.log(response)
  message.reply(response.choices[0].message.content)

}