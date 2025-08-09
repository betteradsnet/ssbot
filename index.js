// Load environment variables from .env
require('dotenv').config();

// Import Discord.js and Supabase client
const { Client, GatewayIntentBits } = require('discord.js');
const { createClient } = require('@supabase/supabase-js');

// Create a new Discord client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,            // For slash commands
        GatewayIntentBits.GuildMessages,     // For reading messages
        GatewayIntentBits.MessageContent     // For accessing message text
    ]
});

// Create Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Event: Bot is ready
client.once('ready', () => {
    console.log(`✅ Logged in as ${client.user.tag}`);
});

// Event: Message received
client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    // Simple test command: !save Hello World
    if (message.content.startsWith('!save')) {
        const content = message.content.replace('!save', '').trim();

        if (!content) {
            return message.reply('⚠ Please provide some text to save.');
        }

        // Save to Supabase
        const { data, error } = await supabase
            .from('messages')    // Your Supabase table name
            .insert([{ user_id: message.author.id, content }]);

        if (error) {
            console.error(error);
            return message.reply('❌ Failed to save message.');
        }

        message.reply('✅ Message saved to the database!');
    }

    // Retrieve messages with !list
    if (message.content === '!list') {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('user_id', message.author.id);

        if (error) {
            console.error(error);
            return message.reply('❌ Failed to retrieve messages.');
        }

        if (data.length === 0) {
            return message.reply('📭 No saved messages found.');
        }

        // Display saved messages
        const formatted = data.map((row, i) => `${i + 1}. ${row.content}`).join('\n');
        message.reply(`📝 Your saved messages:\n${formatted}`);
    }
});

// Log in to Discord
client.login(process.env.DISCORD_TOKEN);
