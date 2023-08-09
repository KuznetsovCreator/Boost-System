const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
} = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");
const { getUser } = require("../../controllers/user.controller");
const { getRequestsByUserID } = require("../../controllers/prize.controller");

// Actions init
const profileScene = new Scenes.BaseScene("USER_PROFILE_ACTION");
const profileCompletionScene = new Scenes.BaseScene(
  "PROFILE_COMPLETIONS_ACTION"
);
const profileRequestScene = new Scenes.BaseScene("PROFILE_REQUESTS_ACTION");

// Output user data
profileScene.enter(async (ctx) => {
  // Get user from session
  const user = await getUser(ctx.session.user.chatId);

  // If user is undefined
  if (!user) {
    await ctx.scene.leave();
    return await ctx.scene.enter("COMMON_START_ACTION");
  }

  // Create text
  const title = reply.title.userProfile;
  const departmentName = user.department ? user.department.name : "Не указан";

  // Tasks and prizes
  const taskCompletions = user.taskCompletions.filter(
    (completion) => completion.status === reply.status.onApproved
  );
  const prizeRequests = user.prizeRequests.filter(
    (request) => request.status === reply.status.onApproved
  );

  let description = `Сотрудник: ${user.fullName}\n`;
  description += `Отдел: ${departmentName}\n\n`;
  description += `Баланс бустов: ${user.balance} 💸\n\n`;
  description += `Выполнено задач: ${taskCompletions.length} 🎯\n`;
  description += `Получено призов: ${prizeRequests.length} 🎁`;
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const eventButtons = createKeyboard(
    reply.userButton.completions,
    "PROFILE_COMPLETIONS_ACTION",
    reply.userButton.requests,
    "PROFILE_REQUESTS_ACTION"
  );
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        ...eventButtons.reply_markup.inline_keyboard,
        ...button.reply_markup.inline_keyboard,
      ],
    },
  };

  // Send
  const message = await ctx.replyWithHTML(answer, keyboard);

  // Save messages ID
  ctx.session.sceneMessages = message.message_id;
});

// Output user task completions
profileCompletionScene.enter(async (ctx) => {
  return ctx.reply("Скоро! Допиливаем :)");
});

// Output user prize requests
profileRequestScene.enter(async (ctx) => {
  // Get data
  const userID = ctx.session.user.id;
  const requests = await getRequestsByUserID(userID);

  // Check requests is empty
  if (requests.length === 0) {
    // Create text
    const title = reply.title.userProfilePrizes;
    const description =
      "Пока что тут пусто. Выполняй задачи, чтобы получать классные призы!";
    const answer = createHeader(title, description);

    // Create UI
    const keyboard = createKeyboard(
      reply.button.back,
      "USER_PROFILE_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    return (ctx.session.sceneMessages = message.message_id);
  }

  // Create text
  const title = reply.title.userProfilePrizes;
  const description = "Выбери приз или заявку, чтобы узнать о ней подробнее.";
  const answer = createHeader(title, description);

  // Create UI
  const backMenuButtons = createBtn(
    reply.button.back,
    "USER_PROFILE_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );
  const keyboard = requests.map((request) => {
    return [
      {
        text: request.prize.name,
        callback_data: `REQUEST_PRIZE_ID_${request.prize.id}`,
      },
    ];
  });
  keyboard.push(backMenuButtons.reply_markup.inline_keyboard[0]);

  // Create message
  const message = await ctx.replyWithHTML(answer, {
    reply_markup: { inline_keyboard: keyboard },
  });
  ctx.session.sceneMessages = message.message_id;
});
profileRequestScene.action(/REQUEST_PRIZE_ID_(.+)/, async (ctx) => {
  const prizeID = ctx.match[1];
  ctx.session.prizeID = prizeID.trim();
  handlerGoToScene(
    ctx,
    "PRIZE_REQUEST_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Action buttons handlers
profileScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
profileCompletionScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
profileRequestScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { profileScene, profileCompletionScene, profileRequestScene };
