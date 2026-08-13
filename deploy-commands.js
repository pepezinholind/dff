const { REST, Routes, SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const config = require("./config");

const commands = [
  new SlashCommandBuilder()
    .setName("painel")
    .setDescription("Envia o painel profissional de tickets.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("loja")
    .setDescription("Envia o painel profissional de vendas.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON(),

  new SlashCommandBuilder()
    .setName("seguranca")
    .setDescription("Mostra o estado da proteção V4.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .toJSON()
];

(async () => {
  const rest = new REST({ version: "10" }).setToken(config.token);
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
  console.log("✅ Comandos publicados no servidor.");
})().catch(err => {
  console.error("❌ Falha ao publicar comandos:", err.message);
  process.exit(1);
});
