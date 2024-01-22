require('dotenv').config();
const { Client } = require('discord.js');

const eventHandler = require('./handlers/eventHandler');


const client = new Client({
  intents: ['Guilds', 'GuildMembers', 'GuildMessages', 'MessageContent']
})



eventHandler(client)

client.login(process.env.TOKEN);

