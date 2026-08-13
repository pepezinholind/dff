const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  PermissionFlagsBits
} = require("discord.js");

const config = require("./config");
const tickets = require("./services/tickets");
const security = require("./services/security");
const { answerTicket } = require("./services/ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel, Partials.Message]
});

client.once(Events.ClientReady, c => {
  console.log("====================================");
  console.log("🤖 V4 DISCORD BOT");
  console.log(`✅ Online como ${c.user.tag}`);
  console.log(`🌐 Servidores: ${c.guilds.cache.size}`);
  console.log("⚡ Bot feito por V4");
  console.log("====================================");
});

client.on(Events.InteractionCreate, async interaction => {
  try {
    if (interaction.isChatInputCommand()) {
      return await tickets.handleCommand(interaction);
    }

    if (interaction.isStringSelectMenu() && interaction.customId === "v4_ticket_create") {
      return await tickets.createTicket(interaction, interaction.values[0]);
    }

    if (interaction.isButton()) {
      if (interaction.customId === "v4_ticket_claim") return await tickets.claimTicket(interaction);
      if (interaction.customId === "v4_ticket_close") return await tickets.closeTicket(interaction);
      if (interaction.customId === "v4_ticket_add") return await tickets.addPerson(interaction);
      if (interaction.customId === "v4_ticket_ai") return await tickets.toggleAI(interaction);
      if (interaction.customId.startsWith("v4_rate_")) {
        return await tickets.rate(interaction, Number(interaction.customId.split("_")[2]));
      }
    }
  } catch (err) {
    console.error("Interaction error:", err);
    const payload = { content: "❌ Ocorreu um erro interno.", ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(payload).catch(() => {});
    } else {
      await interaction.reply(payload).catch(() => {});
    }
  }
});

client.on(Events.GuildMemberAdd, async member => {
  try {
    const count = security.recordJoin(member.guild.id, member.id);
    if (count >= 8) {
      await security.enableRaidMode(member.guild);
      console.warn(`🛡️ Possível raid: ${member.guild.name} (${count} entradas/15s)`);
    }
  } catch (err) {
    console.error("Anti-raid error:", err);
  }
});

client.on(Events.MessageCreate, async message => {
  if (message.author.bot || !message.guild) return;

  try {
    const rate = security.recordMessage(message.guild.id, message.author.id);
    if (rate >= 8) {
      await message.delete().catch(() => {});
      return;
    }

    if (!message.channel.isTextBased()) return;
    if (!message.channel.topic?.startsWith("V4-TICKET:")) return;
    if (!message.content?.trim()) return;

    const state = tickets.getTicket(message.channel.id);
    if (!state || state.closed || !state.aiEnabled || state.claimedBy) return;
    if (!config.aiEnabled || !config.openaiKey) return;

    await message.channel.sendTyping().catch(() => {});
    const answer = await answerTicket(message.channel, message.content);
    if (answer) {
      await message.channel.send({
        content: answer.slice(0, 3900),
        allowedMentions: { parse: [] }
      });
    }
  } catch (err) {
    console.error("AI/message error:", err);
  }
});

process.on("unhandledRejection", err => console.error("Unhandled rejection:", err));
process.on("uncaughtException", err => console.error("Uncaught exception:", err));

(async () => {
  try {
    console.log("🚀 Iniciando V4 Bot...");
    console.log(`🔑 DISCORD_TOKEN encontrado: ${Boolean(process.env.DISCORD_TOKEN)}`);
    console.log(`📏 Tamanho do token: ${process.env.DISCORD_TOKEN?.length || 0}`);
    await client.login(config.token);
  } catch (err) {
    console.error("❌ Falha ao iniciar:", err.message);
    if (err.code === "TokenInvalid") {
      console.error("🔴 DISCORD_TOKEN inválido. Gere um token novo no Discord Developer Portal.");
    }
    process.exit(1);
  }
})();
