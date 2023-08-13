const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
} = require("../../utils/ui.util");
const {
  handlerGoToScene,
  handlerCheckData,
} = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");
const { getUser } = require("../../controllers/user.controller");
const { getRequestsByUserID } = require("../../controllers/prize.controller");
const { getCompletionsByUserID } = require("../../controllers/task.controller");

// Actions init
const profileScene = new Scenes.BaseScene("USER_PROFILE_ACTION");
const profileCompletionScene = new Scenes.BaseScene(
  "PROFILE_COMPLETIONS_ACTION"
);
const profileRequestScene = new Scenes.BaseScene("PROFILE_REQUESTS_ACTION");

// Output user data
profileScene.enter(async (ctx) => {
  // Get user from session
  const chatID = ctx.chat.id;
  const user = await getUser(chatID);

  // If user is undefined
  if (!user) {
    await ctx.scene.leave();
    return await ctx.scene.enter("COMMON_START_ACTION");
  }

  // Tasks and prizes
  const taskCompletions = user.taskCompletions.filter(
    (completion) => completion.status === reply.status.onApproved
  );
  const prizeRequests = user.prizeRequests.filter(
    (request) => request.status === reply.status.onApproved
  );

  // Create text
  const title = reply.title.userProfile;
  let description = `Сотрудник: ${user.fullName}\n`;
  description += `Отдел: ${
    user.department ? user.department.name : "Не выбран"
  }\n\n`;
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

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});

// Output user task completions
profileCompletionScene.enter(async (ctx) => {
  const data = ["user.id"];
  if (handlerCheckData(ctx, data)) {
    const userID = ctx.session.user.id;
    const completions = await getCompletionsByUserID(userID);

    // Check requests is empty
    if (completions.length === 0) {
      // Create text
      const title = reply.actionTitles.userProfileTasks;
      const description = reply.actionDescriptions.profileCompletionsNull;
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
    const title = reply.actionTitles.userProfileTasks;
    const description = reply.actionDescriptions.profileCompletions;
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createBtn(
      reply.button.back,
      "USER_PROFILE_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = completions.map((completion) => {
      return [
        {
          text: completion.task.name,
          callback_data: `COMPLETION_TASK_ID_${completion.task.id}`,
        },
      ];
    });
    keyboard.push(backMenuButtons.reply_markup.inline_keyboard[0]);

    // Create message
    const message = await ctx.replyWithHTML(answer, {
      reply_markup: { inline_keyboard: keyboard },
    });
    ctx.session.sceneMessages = message.message_id;
  }
});
profileCompletionScene.action(/COMPLETION_TASK_ID_(.+)/, async (ctx) => {
  const taskID = ctx.match[1];
  ctx.session.taskID = taskID.trim();
  handlerGoToScene(
    ctx,
    "TASK_COMPLETION_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Output user prize requests
profileRequestScene.enter(async (ctx) => {
  const data = ["user.id"];
  if (handlerCheckData(ctx, data)) {
    const userID = ctx.session.user.id;
    const requests = await getRequestsByUserID(userID);

    // Check requests is empty
    if (requests.length === 0) {
      // Create text
      const title = reply.actionTitles.userProfilePrizes;
      const description = reply.actionDescriptions.profileRequestsNull;
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
    const title = reply.actionTitles.userProfilePrizes;
    const description = reply.actionDescriptions.profileRequests;
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
  }
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
