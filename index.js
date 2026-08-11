const {
  Client, GatewayIntentBits, Partials, ChannelType, PermissionFlagsBits,
  EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle,
  StringSelectMenuBuilder, ModalBuilder, TextInputBuilder, TextInputStyle
} = require("discord.js");

const c = require("./config");
const db = require("./db");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const esc = s => String(s || "").slice(0, 1024);
const staff = m => !!m && (m.permissions?.has(PermissionFlagsBits.Administrator) || m.roles?.cache?.has(c.staffRoleId));

function embed(title, description, color=c.colors.primary) {
  return new EmbedBuilder()
    .setColor(color)
    .setTitle(title)
    .setDescription(description)
    .setFooter({text:"✦ Central • Atendimento e Gestão"})
    .setTimestamp();
}

function ticketInfo(channel) {
  const t = db.getTicket(channel.id);
  return t || null;
}

async function sendLog(guild, title, description, color=c.colors.dark) {
  const ch = guild.channels.cache.get(c.logChannelId);
  if (ch) await ch.send({embeds:[embed(title,description,color)]}).catch(()=>{});
}

function ticketControls(closed=false) {
  const row1 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket_claim").setLabel("Assumir").setEmoji("🎯").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("ticket_add").setLabel("Adicionar").setEmoji("👤").setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId("ticket_rename").setLabel("Renomear").setEmoji("🪪").setStyle(ButtonStyle.Secondary)
  );
  const row2 = new ActionRowBuilder().addComponents(
    closed
      ? new ButtonBuilder().setCustomId("ticket_reopen").setLabel("Reabrir").setEmoji("🔓").setStyle(ButtonStyle.Success)
      : new ButtonBuilder().setCustomId("ticket_close").setLabel("Fechar atendimento").setEmoji("🔐").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("ticket_delete").setLabel("Excluir").setEmoji("🗑️").setStyle(ButtonStyle.Danger)
  );
  return [row1,row2];
}

function ratingRow(ticketId) {
  return [new ActionRowBuilder().addComponents(
    ...[1,2,3,4,5].map(n =>
      new ButtonBuilder()
        .setCustomId(`rating:${ticketId}:${n}`)
        .setLabel(`${n}`)
        .setEmoji("⭐")
        .setStyle(n >= 4 ? ButtonStyle.Success : n === 3 ? ButtonStyle.Secondary : ButtonStyle.Danger)
    )
  )];
}

async function publishTicketPanel(guild) {
  const channel = guild.channels.cache.get(c.ticketPanelChannelId);
  if (!channel) return false;

  const messages = await channel.messages.fetch({limit:50}).catch(()=>null);
  if (messages?.some(m => m.author.id === client.user.id && m.embeds[0]?.title === "🎫 CENTRAL DE ATENDIMENTO")) return true;

  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket_category")
    .setPlaceholder("✦ Escolha o tipo de atendimento")
    .addOptions(Object.entries(c.categories).map(([value,x]) => ({
      value, label:x[1], description:x[2], emoji:x[0]
    })));

  await channel.send({
    embeds:[embed(
      "🎫 CENTRAL DE ATENDIMENTO",
      "**Bem-vindo ao atendimento oficial!** 👋\n\n" +
      "Antes de abrir um atendimento, escolha a categoria correta. Em seguida, o sistema vai solicitar informações para que a equipe entenda exatamente o que você precisa.\n\n" +
      "🧰 **Suporte** — dúvidas e problemas\n" +
      "🛒 **Compras** — pedidos e pagamentos\n" +
      "🚨 **Denúncia** — reporte uma situação\n" +
      "🤝 **Parceria** — propostas\n" +
      "💎 **VIP** — benefícios especiais\n\n" +
      "📌 **Importante:** explique o caso com detalhes, evite abrir vários tickets para o mesmo assunto e aguarde a equipe."
    )
    ],
    components:[new ActionRowBuilder().addComponents(menu)]
  });
  return true;
}

async function publishServerPanel(guild) {
  const channel = guild.channels.cache.get(c.serverPanelChannelId);
  if (!channel) return false;

  const messages = await channel.messages.fetch({limit:50}).catch(()=>null);
  if (messages?.some(m => m.author.id === client.user.id && m.embeds[0]?.title === "🌐 CENTRAL DO SERVIDOR")) return true;

  const buttons = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("server_status").setLabel("Status").setEmoji("🟢").setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId("server_announcement").setLabel("Anúncio").setEmoji("📢").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("server_event").setLabel("Evento").setEmoji("🎉").setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId("server_report").setLabel("Denúncia").setEmoji("🚨").setStyle(ButtonStyle.Danger),
    new ButtonBuilder().setCustomId("server_info").setLabel("Informações").setEmoji("📊").setStyle(ButtonStyle.Secondary)
  );

  await channel.send({
    embeds:[embed(
      "🌐 CENTRAL DO SERVIDOR",
      "**Tudo do servidor em um único painel.**\n\n" +
      "🟢 **Status** — veja a situação atual do servidor.\n" +
      "📢 **Anúncios** — acompanhe comunicados oficiais.\n" +
      "🎉 **Eventos** — veja novidades e eventos.\n" +
      "🚨 **Denúncias** — envie uma denúncia de forma organizada.\n" +
      "📊 **Informações** — veja dados da comunidade.\n\n" +
      "✨ **Não é necessário usar comandos para essas funções.** Basta clicar no botão correspondente."
    )],
    components:[buttons]
  });
  return true;
}

function simpleModal(id,title,fields) {
  const modal = new ModalBuilder().setCustomId(id).setTitle(title);
  modal.addComponents(...fields.map(f => new ActionRowBuilder().addComponents(
    new TextInputBuilder()
      .setCustomId(f.id).setLabel(f.label).setStyle(f.style || TextInputStyle.Short)
      .setPlaceholder(f.placeholder || "").setRequired(f.required !== false)
      .setMaxLength(f.max || 1000)
  )));
  return modal;
}

const commands = [
  {
    name:"paineis",
    description:"Publica os painéis profissionais do servidor.",
    default_member_permissions:String(PermissionFlagsBits.Administrator)
  }
];

client.once("ready", async () => {
  console.log(`✅ ${client.user.tag} online!`);
  const guild = client.guilds.cache.get(c.guildId);
  if (!guild) return console.log("⚠️ GUILD_ID não encontrado.");
  await guild.commands.set(commands);
  await publishTicketPanel(guild);
  await publishServerPanel(guild);
  console.log("🎫 Painel de tickets pronto.");
  console.log("🌐 Painel do servidor pronto.");
});

client.on("guildMemberAdd", async member => {
  if (c.autoRoleId) await member.roles.add(c.autoRoleId).catch(()=>{});
  const ch=member.guild.channels.cache.get(c.welcomeChannelId);
  if(ch) await ch.send({embeds:[embed("✨ NOVO MEMBRO",`Seja muito bem-vindo(a), ${member}! 👋\n\nEsperamos que você aproveite a comunidade. Leia as regras e participe dos eventos!`)]}).catch(()=>{});
});

client.on("interactionCreate", async i => {
  try {
    if (i.isChatInputCommand() && i.commandName === "paineis") {
      if (!staff(i.member)) return i.reply({content:"⛔ Apenas a administração pode fazer isso.",ephemeral:true});
      await publishTicketPanel(i.guild);
      await publishServerPanel(i.guild);
      return i.reply({content:"✅ Os dois painéis foram publicados/verificados.",ephemeral:true});
    }

    if (i.isStringSelectMenu() && i.customId === "ticket_category") {
      const category = i.values[0];
      const x = c.categories[category];

      const modal = simpleModal(`ticket_form:${category}`, `${x[0]} ${x[1]}`, [
        {id:"reason",label:"Motivo do atendimento",placeholder:"Ex.: Preciso de ajuda com uma compra...",max:300},
        {id:"talk",label:"Com quem deseja falar?",placeholder:"Ex.: Financeiro, suporte, administração...",max:200},
        {id:"details",label:"Explique o que aconteceu",placeholder:"Conte tudo com detalhes para a equipe entender o caso.",style:TextInputStyle.Paragraph,max:1500}
      ]);
      return i.showModal(modal);
    }

    if (i.isModalSubmit() && i.customId.startsWith("ticket_form:")) {
      const category=i.customId.split(":")[1], x=c.categories[category];
      const reason=i.fields.getTextInputValue("reason");
      const talk=i.fields.getTextInputValue("talk");
      const details=i.fields.getTextInputValue("details");

      const open=i.guild.channels.cache.filter(ch => {
        const t=db.getTicket(ch.id);
        return t && t.owner===i.user.id && t.state==="open";
      }).size;

      if(open >= c.maxOpenTickets) return i.reply({content:`⚠️ Você já possui ${c.maxOpenTickets} ticket(s) aberto(s).`,ephemeral:true});

      const safe=i.user.username.toLowerCase().replace(/[^a-z0-9-]/g,"-").slice(0,24);
      const channel=await i.guild.channels.create({
        name:`atendimento-${safe}`,
        type:ChannelType.GuildText,
        parent:c.ticketCategoryId || null,
        topic:`ticket:${i.user.id}:${category}:open`,
        permissionOverwrites:[
          {id:i.guild.roles.everyone.id,deny:[PermissionFlagsBits.ViewChannel]},
          {id:i.user.id,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles]},
          {id:c.staffRoleId,allow:[PermissionFlagsBits.ViewChannel,PermissionFlagsBits.SendMessages,PermissionFlagsBits.ReadMessageHistory,PermissionFlagsBits.AttachFiles,PermissionFlagsBits.ManageMessages]}
        ]
      });

      db.setTicket(channel.id,{owner:i.user.id,category,state:"open",reason,talk,details,claimedBy:null,created:Date.now()});

      await channel.send({
        content:`${i.user} <@&${c.staffRoleId}>`,
        embeds:[embed(
          `${x[0]} ATENDIMENTO ABERTO`,
          `Olá, **${i.user.username}**! 👋\n\n`+
          `Seu atendimento foi criado e a equipe já foi notificada. **Não é necessário abrir outro ticket.**\n\n`+
          `### 📋 RESUMO DO ATENDIMENTO\n`+
          `**👤 Cliente:** ${i.user}\n`+
          `**🗂️ Categoria:** ${x[1]}\n`+
          `**📝 Motivo:** ${esc(reason)}\n`+
          `**💬 Deseja falar com:** ${esc(talk)}\n\n`+
          `### 📄 DETALHES\n${esc(details)}\n\n`+
          `### 📌 ORIENTAÇÕES\n`+
          `• Aguarde a equipe responder.\n`+
          `• Envie prints, vídeos, IDs ou provas quando forem relevantes.\n`+
          `• Seja claro e respeitoso.\n`+
          `• Ao finalizar, a equipe poderá fechar o atendimento e você poderá avaliar o suporte.\n\n`+
          `🔒 **Privacidade:** este canal está visível apenas para você e a equipe autorizada.`
        )],
        components:ticketControls(false)
      });

      await sendLog(i.guild,"🎫 NOVO TICKET",`**Cliente:** ${i.user}\n**Categoria:** ${x[1]}\n**Motivo:** ${reason}\n**Com quem:** ${talk}\n**Canal:** ${channel}`,c.colors.primary);
      return i.reply({content:`✅ Seu atendimento foi criado com sucesso: ${channel}`,ephemeral:true});
    }

    if (i.isButton()) {
      const id=i.customId;

      if (id==="server_status") {
        const s=db.getStatus();
        return i.reply({embeds:[embed("🟢 STATUS DO SERVIDOR",`**Estado:** ${s.state}\n**Jogadores:** ${s.players}\n**Informação:** ${s.info}\n\n⏱️ Atualizado automaticamente pelo sistema.`,c.colors.success)],ephemeral:true});
      }

      if (id==="server_info") {
        const g=i.guild;
        return i.reply({embeds:[embed("📊 INFORMAÇÕES DA COMUNIDADE",`👥 **Membros:** ${g.memberCount}\n💬 **Canais:** ${g.channels.cache.size}\n🎭 **Cargos:** ${g.roles.cache.size}\n🚀 **Boosts:** ${g.premiumSubscriptionCount || 0}\n🎫 **Sistema:** Online\n🌐 **Status:** ${db.getStatus().state}`)],ephemeral:true});
      }

      if (["server_announcement","server_event","server_report"].includes(id)) {
        if (id==="server_report") {
          const modal=simpleModal("server_form:report","🚨 Enviar denúncia",[
            {id:"reported",label:"Quem está sendo denunciado?",placeholder:"Nome ou ID do usuário",max:200},
            {id:"reason",label:"Motivo da denúncia",placeholder:"Explique o que aconteceu.",style:TextInputStyle.Paragraph,max:1200},
            {id:"proof",label:"Provas / links",placeholder:"Links de prints, vídeos ou outras provas.",max:700,required:false}
          ]);
          return i.showModal(modal);
        }
        const isEvent=id==="server_event";
        const modal=simpleModal(`server_form:${isEvent?"event":"announcement"}`,isEvent?"🎉 Criar evento":"📢 Criar anúncio",[
          {id:"title",label:isEvent?"Nome do evento":"Título do anúncio",placeholder:isEvent?"Ex.: Evento especial":"Ex.: Aviso importante",max:150},
          {id:"text",label:"Mensagem",placeholder:"Escreva a mensagem que será publicada.",style:TextInputStyle.Paragraph,max:1500},
          {id:"date",label:isEvent?"Data / horário":"Informação adicional",placeholder:isEvent?"Ex.: 20/08 às 21:00":"Opcional",max:250,required:false}
        ]);
        return i.showModal(modal);
      }

      if (id.startsWith("rating:")) {
        const [,ticketId,stars]=id.split(":");
        const modal=simpleModal(`rating_form:${ticketId}:${stars}`,`⭐ Avaliação ${stars}/5`,[
          {id:"comment",label:"Comentário sobre o atendimento",placeholder:"O que achou? O que podemos melhorar?",style:TextInputStyle.Paragraph,max:900,required:false}
        ]);
        return i.showModal(modal);
      }

      const t=ticketInfo(i.channel);
      if (!t) return i.reply({content:"❌ Este botão não pertence a um ticket válido.",ephemeral:true});

      if(id==="ticket_claim") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode assumir tickets.",ephemeral:true});
        if(t.claimedBy && t.claimedBy!==i.user.id) return i.reply({content:`⚠️ Este ticket já foi assumido por <@${t.claimedBy}>.`,ephemeral:true});
        db.setTicket(i.channel.id,{claimedBy:i.user.id});
        await i.channel.send({embeds:[embed("🎯 ATENDIMENTO ASSUMIDO",`Este ticket foi assumido por **${i.user}**.\n\nA partir de agora, este atendente ficará responsável pelo acompanhamento. 💬`,c.colors.success)]});
        return i.reply({content:"✅ Você assumiu o ticket.",ephemeral:true});
      }

      if(id==="ticket_add") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode adicionar membros.",ephemeral:true});
        return i.showModal(simpleModal("ticket_add_form","👤 Adicionar membro",[
          {id:"user","label":"ID do usuário","placeholder":"Cole o ID do Discord",max:30}
        ]));
      }

      if(id==="ticket_rename") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode renomear.",ephemeral:true});
        return i.showModal(simpleModal("ticket_rename_form","🪪 Renomear atendimento",[
          {id:"name","label":"Novo nome do canal","placeholder":"Ex.: atendimento-compra-joao",max:70}
        ]));
      }

      if(id==="ticket_close") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode fechar o atendimento.",ephemeral:true});
        if(t.state==="closed") return i.reply({content:"⚠️ Este ticket já está fechado.",ephemeral:true});

        db.setTicket(i.channel.id,{state:"closed",closedBy:i.user.id,closedAt:Date.now()});
        await i.channel.permissionOverwrites.edit(t.owner,{SendMessages:false,AddReactions:false}).catch(()=>{});
        await i.channel.send({
          embeds:[embed(
            "🔐 ATENDIMENTO ENCERRADO",
            `Este atendimento foi encerrado por **${i.user}**.\n\n`+
            `📌 **Motivo original:** ${esc(t.reason)}\n`+
            `💬 **Você queria falar com:** ${esc(t.talk)}\n\n`+
            `⭐ **Sua opinião é importante!** Clique em uma nota abaixo e, em seguida, escreva um comentário se desejar.\n\n`+
            `Se ainda precisar de ajuda, a equipe pode **reabrir** o atendimento.`,
            c.colors.warning
          )],
          components:[
            ...ratingRow(i.channel.id),
            new ActionRowBuilder().addComponents(
              new ButtonBuilder().setCustomId("ticket_reopen").setLabel("Reabrir").setEmoji("🔓").setStyle(ButtonStyle.Success),
              new ButtonBuilder().setCustomId("ticket_delete").setLabel("Excluir ticket").setEmoji("🗑️").setStyle(ButtonStyle.Danger)
            )
          ]
        });
        await sendLog(i.guild,"🔐 TICKET FECHADO",`**Canal:** ${i.channel}\n**Cliente:** <@${t.owner}>\n**Fechado por:** ${i.user}`,c.colors.warning);
        return i.reply({content:"🔐 Ticket fechado com sucesso. O painel de avaliação foi enviado.",ephemeral:true});
      }

      if(id==="ticket_reopen") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode reabrir.",ephemeral:true});
        if(t.state!=="closed") return i.reply({content:"⚠️ Este ticket já está aberto.",ephemeral:true});
        db.setTicket(i.channel.id,{state:"open",reopenedBy:i.user.id});
        await i.channel.permissionOverwrites.edit(t.owner,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,AttachFiles:true}).catch(()=>{});
        await i.channel.send({embeds:[embed("🔓 ATENDIMENTO REABERTO",`O atendimento foi reaberto por **${i.user}**.\n\nA conversa pode continuar normalmente. 💬`,c.colors.success)],components:[ticketControls(false)[0],ticketControls(false)[1]]});
        return i.reply({content:"🔓 Ticket reaberto.",ephemeral:true});
      }

      if(id==="ticket_delete") {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode excluir.",ephemeral:true});
        await i.reply({content:"🗑️ Excluindo este atendimento em 5 segundos...",ephemeral:true});
        await sendLog(i.guild,"🗑️ TICKET EXCLUÍDO",`**Cliente:** <@${t.owner}>\n**Canal:** #${i.channel.name}\n**Excluído por:** ${i.user}`,c.colors.danger);
        setTimeout(()=>i.channel.delete("Ticket encerrado pelo sistema").catch(()=>{}),5000);
        return;
      }
    }

    if (i.isModalSubmit()) {
      if (i.customId.startsWith("rating_form:")) {
        const [,ticketId,stars]=i.customId.split(":");
        const comment=i.fields.getTextInputValue("comment") || "Sem comentário.";
        const t=db.getTicket(ticketId);
        db.addRating({guild:i.guild.id,ticket:ticketId,user:i.user.id,staff:t?.claimedBy||"Não identificado",stars:Number(stars),comment});
        const stats=db.ratingStats(i.guild.id);
        const ch=i.guild.channels.cache.get(c.ratingChannelId);
        if(ch) await ch.send({embeds:[embed(`⭐ NOVA AVALIAÇÃO — ${stars}/5`,`👤 **Cliente:** ${i.user}\n🎫 **Ticket:** <#${ticketId}>\n🎯 **Atendente:** ${t?.claimedBy ? `<@${t.claimedBy}>` : "Não identificado"}\n⭐ **Nota:** ${"⭐".repeat(Number(stars))}\n💬 **Comentário:** ${comment}\n\n📊 **Média atual:** ${stats.avg}/5 • ${stats.count} avaliação(ões)`,Number(stars)>=4?c.colors.success:Number(stars)===3?c.colors.warning:c.colors.danger)]}).catch(()=>{});
        return i.reply({content:"💙 Obrigado! Sua avaliação foi registrada com sucesso.",ephemeral:true});
      }

      if (i.customId==="ticket_add_form") {
        const t=ticketInfo(i.channel);
        if(!t || !staff(i.member)) return i.reply({content:"⛔ Sem permissão.",ephemeral:true});
        const id=i.fields.getTextInputValue("user").trim();
        const member=await i.guild.members.fetch(id).catch(()=>null);
        if(!member) return i.reply({content:"❌ Não encontrei esse usuário. Confira o ID.",ephemeral:true});
        await i.channel.permissionOverwrites.edit(member.id,{ViewChannel:true,SendMessages:true,ReadMessageHistory:true,AttachFiles:true});
        await i.channel.send({embeds:[embed("👤 MEMBRO ADICIONADO",`${member} foi adicionado ao atendimento por **${i.user}**.`,c.colors.info)]});
        return i.reply({content:"✅ Membro adicionado.",ephemeral:true});
      }

      if (i.customId==="ticket_rename_form") {
        const t=ticketInfo(i.channel);
        if(!t || !staff(i.member)) return i.reply({content:"⛔ Sem permissão.",ephemeral:true});
        const name=i.fields.getTextInputValue("name").toLowerCase().replace(/[^a-z0-9-]/g,"-").slice(0,90);
        await i.channel.setName(name);
        return i.reply({content:`🪪 Canal renomeado para \`${name}\`.`,ephemeral:true});
      }

      if (i.customId.startsWith("server_form:")) {
        if(!staff(i.member)) return i.reply({content:"⛔ Apenas a equipe pode publicar/receber este formulário.",ephemeral:true});
        const kind=i.customId.split(":")[1];

        if(kind==="report") {
          const reported=i.fields.getTextInputValue("reported");
          const reason=i.fields.getTextInputValue("reason");
          const proof=i.fields.getTextInputValue("proof") || "Nenhuma prova informada.";
          const ch=i.guild.channels.cache.get(c.reportChannelId);
          if(ch) await ch.send({embeds:[embed("🚨 NOVA DENÚNCIA",`👤 **Denunciante:** ${i.user}\n🎯 **Denunciado:** ${reported}\n\n📝 **Relato:**\n${reason}\n\n📎 **Provas:**\n${proof}`,c.colors.danger)]}).catch(()=>{});
          await sendLog(i.guild,"🚨 DENÚNCIA RECEBIDA",`**Enviada por:** ${i.user}\n**Denunciado:** ${reported}`,c.colors.danger);
          return i.reply({content:"🚨 Denúncia enviada para a equipe responsável.",ephemeral:true});
        }

        const title=i.fields.getTextInputValue("title");
        const text=i.fields.getTextInputValue("text");
        const extra=i.fields.getTextInputValue("date") || "Não informado";
        const isEvent=kind==="event";
        const ch=i.guild.channels.cache.get(isEvent?c.eventChannelId:c.announcementChannelId);
        if(!ch) return i.reply({content:"⚠️ O canal de destino não foi configurado no `.env`.",ephemeral:true});

        await ch.send({embeds:[embed(
          isEvent ? `🎉 ${title}` : `📢 ${title}`,
          `${text}\n\n${isEvent ? `🗓️ **Data / horário:** ${extra}` : `ℹ️ **Informação adicional:** ${extra}`}\n\n— **Publicado pela equipe**`,
          isEvent?c.colors.purple:c.colors.info
        )]});
        return i.reply({content:isEvent?"🎉 Evento publicado!":"📢 Anúncio publicado!",ephemeral:true});
      }
    }
  } catch(err) {
    console.error(err);
    if(!i.replied && !i.deferred) await i.reply({content:"❌ Ocorreu um erro. Veja o CMD para detalhes.",ephemeral:true}).catch(()=>{});
  }
});

client.login(c.token);
