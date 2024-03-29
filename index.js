require("dotenv").config();
const { name, version } = require("./package.json");
const { Telegraf, session } = require("telegraf");
const sequelize = require("./src/database/db.connect");
const stage = require("./src/actions/actions.register");

// Create
let bot = new Telegraf(process.env.BOT_TOKEN);
bot.use(
  session({
    ttl: 60 * 60 * 24, // 24 hours
  })
);

// Functions
async function start() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    bot.launch();
    bot.use(stage.middleware());
    bot.command("start", (ctx) => ctx.scene.enter("COMMON_START_ACTION"));
    bot.command("restart", (ctx) => restart(ctx));
    bot.action("/restart", (ctx) => restart(ctx));
    console.log(`Бот "${name}" запущен. Версия: ${version}`);
  } catch (error) {
    console.error("Ошибка команды /start", error);
  }
}
async function restart(ctx) {
  try {
    ctx.session = {};
    await ctx.scene.enter("COMMON_START_ACTION");
    console.log(
      `Бот перезапущен для пользователя ${ctx.from.id}. Версия: ${version}`
    );
  } catch (error) {
    console.error("Ошибка команды /restart", error);
  }
}

// Start
start();

module.exports = { bot };
