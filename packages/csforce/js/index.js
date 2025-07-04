const TelegramBot = require('node-telegram-bot-api');
const { GameDig } = require('gamedig');

// Initialize the bot with the token from environment variables
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });

// Server details
const SERVER_ADDRESS = { host: process.env.SERVER_HOST, port: process.env.SERVER_PORT };
const WEBSITE_LINK = process.env.WEBSITE_LINK;

// Escape HTML special characters
function escapeHtml(text) {
  if (!text || typeof text !== 'string') return '';
  text = text.length > 100 ? text.slice(0, 100) : text; // Truncate to 100 chars
  console.log('Escaping text (length:', text.length, '):', JSON.stringify(text));
  const specialChars = { '&': '&', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return Object.keys(specialChars).reduce((str, char) => {
    const regex = new RegExp(char, 'g');
    return str.replace(regex, specialChars[char]);
  }, text);
}


// Main handler for DigitalOcean Functions
module.exports.main = async (req, res) => {

  // Use the message directly from req
  const telegramUpdate = req.message;
  if (!telegramUpdate) {
    console.log('No message in request, full request:', JSON.stringify(req, null, 2));
    return { statusCode: 200, body: JSON.stringify('No message to process') };
  }

  try {

    if (!telegramUpdate) {
      console.log('No message in update, skipping.');
      return { statusCode: 200, body: JSON.stringify(req, null, 2) };
    }

    if (telegramUpdate && (telegramUpdate.text === '/online' || telegramUpdate.text === '/online@csforce_bot')) {
      const chatId = telegramUpdate.chat.id;

      // Query server info using Gamedig
      const state = await GameDig.query({
        type: 'counterstrike16', // CS 1.6 protocol
        host: SERVER_ADDRESS.host,
        port: SERVER_ADDRESS.port,
        socketTimeout: 10000
      });
      //console.log('Server state:', JSON.stringify(state));

      // Extract server info and players
      const serverInfo = {
        map: state.map,
        players: state.players.length, // Use numplayers directly
        maxPlayers: state.maxplayers
      };
      const players = state.players;
      console.log('Server state:', JSON.stringify(players));

      // Sort players by score
      const sortedPlayers = players.sort((a, b) => b.raw.score - a.raw.score);

      // Build the message with HTML formatting
      const ipText = `${SERVER_ADDRESS.host}:${SERVER_ADDRESS.port}`;
      let message = `<b>IP:</b> <code>${escapeHtml(ipText)}</code>\n` +
                    `<b>Map:</b> <code>${escapeHtml(serverInfo.map)}</code>\n` +
                    `<b>Players:</b> <code>${serverInfo.players}/${serverInfo.maxPlayers}</code>\n\n`;

      // Add top 3 players
      if (sortedPlayers.length >= 1) {
        message += `🥇 <b>Top 1:</b> <code>${escapeHtml(sortedPlayers[0].name)} (${sortedPlayers[0].raw.score || 0} points)</code>\n`;
      }
      if (sortedPlayers.length >= 2) {
        message += `🥈 <b>Top 2:</b> <code>${escapeHtml(sortedPlayers[1].name)} (${sortedPlayers[1].raw.score || 0} points)</code>\n`;
      }
      if (sortedPlayers.length >= 3) {
        message += `🥉 <b>Top 3:</b> <code>${escapeHtml(sortedPlayers[2].name)} (${sortedPlayers[2].raw.score || 0} points)</code>\n`;
      }

      // Add remaining players
      if (sortedPlayers.length > 3) {
        message += '\n🎮 <b>Other Players:</b>\n';
        for (const player of sortedPlayers.slice(3)) {
          message += `- ${escapeHtml(player.name)} <code>(${player.raw.score || 0} points)</code>\n`;
        }
      }

      console.log('Message to send:', message);

      // Send the message with a button
      await bot.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [[{ text: 'csforce.com.ua', url: WEBSITE_LINK }]]
        }
      });
    } else {
      return { statusCode: 200, body: JSON.stringify('No command processed') };
    }

    return { statusCode: 200, body: JSON.stringify('Update processed') };
  } catch (error) {
    console.error('Error in handler:', error);
    return { statusCode: 500, body: JSON.stringify(`Error: ${error.message}`) };
  }
};