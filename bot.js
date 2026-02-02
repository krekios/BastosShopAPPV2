const { Telegraf, Markup } = require('telegraf');

const bot = new Telegraf('TON_TOKEN_BOT');
const MON_ID_PERSONNEL = 123456789; // METS TON ID ICI

bot.start((ctx) => {
    return ctx.reply(
        `Bienvenue sur Bastos Shop ! 🌴`,
        Markup.keyboard([[Markup.button.webApp('🚀 Boutique', 'https://ton-lien-vercel.app/')]]).resize()
    );
});

bot.on('web_app_data', (ctx) => {
    try {
        const data = JSON.parse(ctx.webAppData.data.json_string);
        const message = `
🛍️ **NOUVELLE COMMANDE**
━━━━━━━━━━━━━━━━━━
👤 **Client :** @${ctx.from.username || 'Inconnu'}
🚀 **Mode :** ${data.mode}
📍 **Lieu :** ${data.lieu}

📋 **DÉTAILS :**
${data.recapitulatif}

💰 **TOTAL : ${data.total}**
━━━━━━━━━━━━━━━━━━`;

        bot.telegram.sendMessage(MON_ID_PERSONNEL, message, { parse_mode: 'Markdown' });
        ctx.reply("✅ Ta commande a été envoyée !");
    } catch (err) {
        ctx.reply("❌ Erreur de transmission.");
    }
});

bot.launch();
