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
const {
  getPrize,
  getAllPrizesByCategoryId,
  getRequestByUserPrizeID,
  createRequest,
} = require("../../controllers/prize.controller");
const { removeBalance } = require("../../controllers/user.controller");

// Actions init
const prizeScene = new Scenes.BaseScene("USER_PRIZES_ACTION");
const prizeCategoryScene = new Scenes.BaseScene("PRIZE_CATEGORY_ACTION");
const prizeDetailScene = new Scenes.BaseScene("PRIZE_DETAIL_ACTION");
const prizeRequestScene = new Scenes.BaseScene("PRIZE_REQUEST_ACTION");
const prizeRequestCreateScene = new Scenes.BaseScene(
  "PRIZE_REQUEST_CREATE_ACTION"
);

// Output prize categories
prizeScene.enter(async (ctx) => {
  // Create text
  const title = "Какие призы тебя интересуют? 🏆";
  const description = "Выберите категорию призов из списка доступных.";
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🥇 Boost-лотерея",
            callback_data: "PRIZE_CATEGORY_1",
          },
        ],
        [
          { text: "🥈 Standard", callback_data: "PRIZE_CATEGORY_2" },
          { text: "🥉 Lite", callback_data: "PRIZE_CATEGORY_3" },
        ],
        ...button.reply_markup.inline_keyboard,
      ],
    },
  };

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});
prizeScene.action(/PRIZE_CATEGORY_(.+)/, (ctx) => {
  const callback = ctx.match[1];
  ctx.session.prizeCategoryID = callback.trim();

  handlerGoToScene(
    ctx,
    "PRIZE_CATEGORY_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Output prizes from category
prizeCategoryScene.enter(async (ctx) => {
  const data = ["prizeCategoryID"];
  if (handlerCheckData(ctx, data)) {
    // Get prize category ID
    const categoryID = ctx.session.prizeCategoryID;
    const prizes = await getAllPrizesByCategoryId(categoryID);

    // Check prizes is empty
    if (prizes.length === 0) {
      // Create text
      const title = reply.title.userPrizes;
      const description =
        "В данной категории нет доступных призов. Загляни попозже.";
      const answer = createHeader(title, description);

      // Create UI
      const keyboard = createKeyboard(
        reply.button.back,
        "USER_PRIZES_ACTION",
        reply.button.mainMenu,
        "COMMON_START_ACTION"
      );

      // Create message
      const message = await ctx.replyWithHTML(answer, keyboard);
      return (ctx.session.sceneMessages = message.message_id);
    }

    // Create text
    const title = reply.title.userPrizes;
    const description = "Выбери приз, который хочешь получить.";
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "USER_PRIZES_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = prizes.map((prize) => {
      return [
        {
          text: prize.name,
          callback_data: `PRIZE_${prize.id}`,
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
prizeCategoryScene.action(/PRIZE_(.+)/, (ctx) => {
  const prizeID = ctx.match[1];
  ctx.session.prizeID = prizeID.trim();

  handlerGoToScene(
    ctx,
    "PRIZE_DETAIL_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Output prize detail
prizeDetailScene.enter(async (ctx) => {
  const data = ["prizeID"];
  if (handlerCheckData(ctx, data)) {
    // Get prize ID
    const prizeID = ctx.session.prizeID;
    const prize = await getPrize(prizeID);

    // Create text
    let description = `${prize.description}\n\n`;
    description += `Продолжительность: ${prize.duration}\n\n`;
    description += `Стоимость: ${prize.cost} 💸`;
    const answer = createHeader(prize.name, description);

    // Create UI
    const eventButton = createBtn(
      reply.userButton.getPrize,
      "PRIZE_REQUEST_ACTION"
    );
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "PRIZE_CATEGORY_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...eventButton.reply_markup.inline_keyboard,
          ...backMenuButtons.reply_markup.inline_keyboard,
        ],
      },
    };

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    ctx.session.sceneMessages = message.message_id;
  }
});

// Output request detail
prizeRequestScene.enter(async (ctx) => {
  const data = ["user.id", "prizeID"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const userID = ctx.session.user.id;
    const prizeID = ctx.session.prizeID;
    const request = await getRequestByUserPrizeID(userID, prizeID);

    // Check is request is already created
    if (!request) {
      ctx.scene.leave();
      return ctx.scene.enter("PRIZE_REQUEST_CREATE_ACTION");
    }

    // Create text
    const title = reply.actionTitles.userPrizeRequest;
    const prizeName = request.prize ? request.prize.name : null;
    const prizeLink = request.prize ? request.prize.courseLink : null;
    const prizeCost = request.prize ? request.prize.cost : null;
    const prizeCategory = request.prize ? request.prize.category : null;
    let description = `Приз: ${prizeName}\n\n`;
    description += `Списано: ${prizeCost} 💸\n`;
    description += `Статус: ${request.status}`;
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.userButton.requests,
      "PROFILE_REQUESTS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );

    let keyboard;
    if (prizeCategory === 3 && request.status === reply.status.onApproved) {
      keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Перейти к курсу 🔥",
                url: prizeLink,
              },
            ],
            ...backMenuButtons.reply_markup.inline_keyboard,
          ],
        },
      };
    } else {
      keyboard = backMenuButtons;
    }

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    ctx.session.sceneMessages = message.message_id;
  }
});

// Create prize request
prizeRequestCreateScene.enter(async (ctx) => {
  const data = ["prizeID"];
  if (handlerCheckData(ctx, data)) {
    // Get prize data
    const prizeID = ctx.session.prizeID;
    const prize = await getPrize(prizeID);
    const prizeCategory = prize.category;

    const chatID = ctx.chat.id;
    const removeFunc = await removeBalance(chatID, prize.cost);

    // Chek user balance
    if (!removeFunc) {
      // Create text
      const title = "К сожалению... 😥";
      const description =
        "На твоем балансе недостаточно бустов. Не расстраивайся! Возвращайся как накопишь достаточное количество, приз никуда не убежит.";
      const answer = createHeader(title, description);

      // Create UI
      const keyboard = createKeyboard(
        reply.button.back,
        "PRIZE_DETAIL_ACTION",
        reply.button.mainMenu,
        "COMMON_START_ACTION"
      );

      // Create message
      const message = await ctx.replyWithHTML(answer, keyboard);
      return (ctx.session.sceneMessages = message.message_id);
    }

    // Check prize category
    let requestStatus;
    if (prizeCategory === 3) {
      requestStatus = reply.status.onApproved;
    } else {
      requestStatus = reply.status.onCheck;
    }

    // Create request
    const newRequest = await createRequest(
      requestStatus,
      ctx.session.user.id,
      prizeID
    );
    ctx.session.prizeID = newRequest.prizeId;
    return ctx.scene.enter("PRIZE_REQUEST_ACTION");
  }
});

// Action buttons handlers
prizeScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
prizeCategoryScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
prizeDetailScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
prizeRequestScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
prizeRequestCreateScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = {
  prizeScene,
  prizeCategoryScene,
  prizeDetailScene,
  prizeRequestScene,
  prizeRequestCreateScene,
};
