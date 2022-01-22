const {
  Client,
  Intents,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageSelectMenu,
} = require("discord.js");
const axios = require("axios");
const API = "https://api.genshin.dev/";

const callAPI = async (str = "") => {
  let respone = await axios.get(API + str);
  return respone.data;
};

const client = new Client({
  intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
});
require("dotenv/config");

const button = new MessageActionRow().addComponents(
  new MessageButton().setLabel("Exit").setCustomId("exit").setStyle("DANGER")
);

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// First call Command
client.on("messageCreate", async (msg) => {
  if (msg.content !== "$genshin") return;
  let types = await axios.get(API);
  types = types.data.types;
  const row = new MessageActionRow();
  row.addComponents(
    new MessageSelectMenu()
      .setCustomId("select")
      .setPlaceholder("Danh mục")
      .addOptions(
        types.map((el) => ({
          label: el[0].toUpperCase() + el.slice(1),
          description: el[0].toUpperCase() + el.slice(1),
          value: el,
        }))
      )
  );

  await msg.reply({
    content: "Fayaku Impact!\nLựa chọn danh mục bạn cần tìm hiểu",
    ephemeral: true,
    components: [row, button],
  });
});

// Exit button
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isButton()) return;
  interaction.update({
    content: "Bye, see you later",
    components: [],
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isSelectMenu()) return;
  let data, id,
    select = [];
  isNaN(interaction.customId[interaction.customId.length-1]) ? id = interaction.customId : id = interaction.customId.slice(0,-1)
  console.log(id)
  switch (id) {
    // First select
    case "select":
      data = await callAPI(interaction.values[0]);
      let bigChunk = [],
        chunk = 25;
      for (let i = 0, j = data.length; i < j; i += chunk) {
        bigChunk.push(data.slice(i, i + chunk));
      }
      bigChunk.forEach((smallChunk, index) => {
        select.push(
          new MessageActionRow().addComponents(
            new MessageSelectMenu()
              .setCustomId(interaction.values[0] + index)
              .setPlaceholder(interaction.values[0] + index)
              .addOptions(
                smallChunk.map((el) => ({
                  label: el[0].toUpperCase() + el.slice(1),
                  description: el[0].toUpperCase() + el.slice(1),
                  value: el,
                }))
              )
          )
        );
      });
      select.push(button);
      await interaction.update({
        content: "Select your " + interaction.values[0],
        components: select,
      });
      break;
    case "characters":
      data = await callAPI(
        "characters/" + interaction.values[0]
      );
      let characterID = interaction.values[0].replace("-","_")
      console.log(characterID)
      const exampleEmbed = new MessageEmbed()
        .setColor("#0099ff")
        .setTitle(
          interaction.values[0][0].toUpperCase() +
            interaction.values[0].slice(1) +
            " Infomation"
        )
        .setURL("https://discord.js.org/")
        .setAuthor({
          name: "Fayaku Impact",
          iconURL: `https://img.captain-droid.com/wp-content/uploads/com-mihoyo-genshinimpact-icon.png`,
          url: "https://www.facebook.com/groups/fayaku",
        })
        .setDescription("Some description here")
        .setThumbnail(`https://genshin.honeyhunterworld.com/img/char/${characterID}.png`)
        .addFields(
          { name: "Regular field title", value: "Some value here" },
          { name: "\u200B", value: "\u200B" },
          {
            name: "Inline field title",
            value: "Some value here",
            inline: true,
          },
          { name: "Inline field title", value: "Some value here", inline: true }
        )
        .addField("Inline field title", "Some value here", true)
        .setImage(`https://genshin.honeyhunterworld.com/img/char/${characterID}_gacha_splash.png`)
        .setTimestamp()
        .setFooter({
          text: "Fayaku Impact",
          iconURL: "https://img.captain-droid.com/wp-content/uploads/com-mihoyo-genshinimpact-icon.png",
        });

      await interaction.update({
        embeds: [exampleEmbed],
        components: [],
      });
      break;

    default:
      await interaction.update({
        content: "New feture not dev yet",
        components: [],
      });
      break
  }
});

client.login(process.env.TOKEN);
