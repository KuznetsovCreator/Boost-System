const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
} = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");

// Action init
const infoScene = new Scenes.BaseScene("USER_INFO_ACTION");
const infoTaskScene = new Scenes.BaseScene("INFO_TASK_ACTION");
const infoPrizeScene = new Scenes.BaseScene("INFO_PRIZE_ACTION");

// Actions
infoScene.enter(async (ctx) => {
  // Create text
  const title = reply.title.userInfo;
  const description = reply.info.user;
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🎯 Подробнее о задачах 🎯",
            callback_data: "INFO_TASK_ACTION",
          },
        ],
        [
          {
            text: "🎁 Подробнее о призах 🎁",
            callback_data: "INFO_PRIZE_ACTION",
          },
        ],
        ...button.reply_markup.inline_keyboard,
      ],
    },
  };

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});
infoTaskScene.enter(async (ctx) => {
  // Create text
  const title = reply.actionTitles.userInfoTasks;
  const description = reply.info.tasks;
  const answer = createHeader(title, description);

  // Create UI
  const keyboard = createKeyboard(
    reply.button.back,
    "USER_INFO_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});
infoPrizeScene.enter(async (ctx) => {
  // Create text
  const title = reply.actionTitles.userInfoPrizes;
  const description = reply.info.prizes;
  const answer = createHeader(title, description);

  // Create UI
  const keyboard = createKeyboard(
    reply.button.back,
    "USER_INFO_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});

// Action buttons handlers
infoScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
infoTaskScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
infoPrizeScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { infoScene, infoTaskScene, infoPrizeScene };
