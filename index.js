const {
  Client,
  GatewayIntentBits,
  Partials,
  Events
} = require("discord.js");

const config = require("./config");
const { initDb, pool } = require("./db");
const { handleCommand } = require("./commands");
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
  partials: [
    Partials.Channel,
    Partials.Message
  ]
});

/*
|--------------------------------------------------------------------------
| BOT ONLINE
|--------------------------------------------------------------------------
*/

client.once(Events.ClientReady, async (clientUser) => {
  console.log("====================================");
  console.log("🤖 BOT INICIADO");
  console.log(`👤 Login: ${clientUser.tag}`);
  console.log(`🆔 Bot ID: ${clientUser.id}`);
  console.log(`🌐 Servidores: ${clientUser.guilds.cache.size}`);
  console.log("====================================");
});

/*
|--------------------------------------------------------------------------
| INTERACTIONS
|--------------------------------------------------------------------------
*/

client.on(Events.InteractionCreate, async (interaction) => {
  try {

    /*
    |--------------------------------------------------------------------------
    | SLASH COMMANDS
    |--------------------------------------------------------------------------
    */

    if (interaction.isChatInputCommand()) {
      await handleCommand(interaction);
      return;
    }

    /*
    |--------------------------------------------------------------------------
    | SELECT MENU
    |--------------------------------------------------------------------------
    */

    if (
      interaction.isStringSelectMenu() &&
      interaction.customId === "ticket_create"
    ) {
      await tickets.createTicket(
        interaction,
        interaction.values[0]
      );

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | BUTTONS
    |--------------------------------------------------------------------------
    */

    if (interaction.isButton()) {

      if (interaction.customId === "ticket_claim") {
        await tickets.claimTicket(interaction);
        return;
      }

      if (interaction.customId === "ticket_ai") {
        await tickets.toggleAI(interaction);
        return;
      }

      if (interaction.customId === "ticket_close") {
        await tickets.closeTicket(interaction);
        return;
      }

      if (interaction.customId.startsWith("rate_")) {

        const stars = Number(
          interaction.customId.split("_")[1]
        );

        await tickets.rate(
          interaction,
          stars
        );

        return;
      }
    }

  } catch (error) {

    console.error("❌ ERRO NA INTERACTION:");
    console.error(error);

    try {

      if (
        !interaction.replied &&
        !interaction.deferred
      ) {

        await interaction.reply({
          content: "❌ Ocorreu um erro interno.",
          ephemeral: true
        });

      }

    } catch (_) {}
  }
});

/*
|--------------------------------------------------------------------------
| ANTI RAID
|--------------------------------------------------------------------------
*/

client.on(
  Events.GuildMemberAdd,
  async (member) => {

    try {

      const count = security.recordJoin(
        member.guild.id,
        member.id
      );

      console.log(
        `👤 Entrada: ${member.user.tag} | ${count}/15s`
      );

      /*
      |--------------------------------------------------------------------------
      | DETECÇÃO DE RAID
      |--------------------------------------------------------------------------
      */

      if (count >= 8) {

        await security.enableRaidMode(
          member.guild
        );

        console.warn(
          `🛡️ POSSÍVEL RAID DETECTADO: ${member.guild.name}`
        );

      }

    } catch (error) {

      console.error(
        "❌ Erro no Anti-Raid:",
        error
      );

    }
  }
);

/*
|--------------------------------------------------------------------------
| MENSAGENS
|--------------------------------------------------------------------------
*/

client.on(
  Events.MessageCreate,
  async (message) => {

    try {

      /*
      |--------------------------------------------------------------------------
      | IGNORAR BOTS
      |--------------------------------------------------------------------------
      */

      if (
        message.author.bot ||
        !message.guild
      ) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | ANTI SPAM
      |--------------------------------------------------------------------------
      */

      const messageRate =
        security.recordMessage(
          message.guild.id,
          message.author.id
        );

      if (messageRate >= 8) {

        await message.delete().catch(() => {});

        return;
      }

      /*
      |--------------------------------------------------------------------------
      | VERIFICAR SE É TICKET
      |--------------------------------------------------------------------------
      */

      const channelName =
        message.channel.name || "";

      const isTicket =
        channelName.startsWith("🛠️") ||
        channelName.startsWith("🛒") ||
        channelName.startsWith("💳") ||
        channelName.startsWith("🤝");

      if (!isTicket) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | IGNORAR MENSAGENS MUITO PEQUENAS
      |--------------------------------------------------------------------------
      */

      if (
        !message.content ||
        message.content.length < 2
      ) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | BUSCAR TICKET
      |--------------------------------------------------------------------------
      */

      const ticket =
        await pool.query(
          `
          SELECT *
          FROM tickets
          WHERE channel_id = $1
          AND closed_at IS NULL
          `,
          [message.channel.id]
        );

      if (!ticket.rowCount) {
        return;
      }

      const ticketData =
        ticket.rows[0];

      /*
      |--------------------------------------------------------------------------
      | SE STAFF ASSUMIU → IA PARA
      |--------------------------------------------------------------------------
      */

      if (
        ticketData.claimed_by ||
        !ticketData.ai_enabled
      ) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | IA
      |--------------------------------------------------------------------------
      */

      console.log(
        `🤖 IA respondendo no ticket ${message.channel.id}`
      );

      const answer =
        await answerTicket(
          message.channel,
          message.content
        ).catch((error) => {

          console.error(
            "❌ Erro na IA:",
            error.message
          );

          return null;
        });

      if (!answer) {
        return;
      }

      /*
      |--------------------------------------------------------------------------
      | ENVIAR RESPOSTA DA IA
      |--------------------------------------------------------------------------
      */

      await message.channel.send({
        content: answer.slice(0, 3900)
      });

    } catch (error) {

      console.error(
        "❌ Erro no MessageCreate:",
        error
      );

    }
  }
);

/*
|--------------------------------------------------------------------------
| VERIFICAÇÃO DO TOKEN
|--------------------------------------------------------------------------
*/

async function startBot() {

  console.log("====================================");
  console.log("🚀 INICIANDO PRO DISCORD BOT");
  console.log("====================================");

  /*
  |--------------------------------------------------------------------------
  | VERIFICAR ENV
  |--------------------------------------------------------------------------
  */

  console.log(
    "🔍 Verificando configuração..."
  );

  const token =
    process.env.DISCORD_TOKEN;

  /*
  |--------------------------------------------------------------------------
  | NÃO MOSTRAR TOKEN
  |--------------------------------------------------------------------------
  */

  console.log(
    "🔑 DISCORD_TOKEN existe:",
    Boolean(token)
  );

  console.log(
    "📏 Tamanho do token:",
    token ? token.length : 0
  );

  /*
  |--------------------------------------------------------------------------
  | VERIFICAR TOKEN
  |--------------------------------------------------------------------------
  */

  if (!token) {

    console.error(
      "❌ DISCORD_TOKEN não foi encontrado!"
    );

    console.error(
      "➡️ Railway → Variables → DISCORD_TOKEN"
    );

    process.exit(1);
  }

  /*
  |--------------------------------------------------------------------------
  | BANCO
  |--------------------------------------------------------------------------
  */

  try {

    console.log(
      "🗄️ Inicializando banco de dados..."
    );

    await initDb();

    console.log(
      "✅ Banco de dados conectado."
    );

  } catch (error) {

    console.error(
      "❌ Erro no banco de dados:"
    );

    console.error(error);

    process.exit(1);
  }

  /*
  |--------------------------------------------------------------------------
  | LOGIN DISCORD
  |--------------------------------------------------------------------------
  */

  try {

    console.log(
      "🔐 Tentando conectar ao Discord..."
    );

    await client.login(
      token.trim()
    );

  } catch (error) {

    console.error(
      "===================================="
    );

    console.error(
      "❌ NÃO FOI POSSÍVEL LOGIN NO DISCORD"
    );

    console.error(
      "===================================="
    );

    console.error(
      "Código:",
      error.code
    );

    console.error(
      "Mensagem:",
      error.message
    );

    if (
      error.code === "TokenInvalid"
    ) {

      console.error(
        "🔴 O DISCORD_TOKEN é inválido."
      );

      console.error(
        "➡️ Gere um novo token em:"
      );

      console.error(
        "Discord Developer Portal → Bot → Reset Token"
      );

      console.error(
        "➡️ Depois coloque o novo token em:"
      );

      console.error(
        "Railway → Variables → DISCORD_TOKEN"
      );
    }

    process.exit(1);
  }
}

/*
|--------------------------------------------------------------------------
| START
|--------------------------------------------------------------------------
*/

startBot();