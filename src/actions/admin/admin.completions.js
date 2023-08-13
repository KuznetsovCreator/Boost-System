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
  getCompletionsByStatus,
  getCompletion,
  updateCompletionStatus,
} = require("../../controllers/task.controller");
const { addBalance } = require("../../controllers/user.controller");
const { getDepartment } = require("../../controllers/department.controller");

// Actions init
const adminCompletionScene = new Scenes.BaseScene("ADMIN_COMPLETIONS_ACTION");
const adminCategoryCompletionScene = new Scenes.BaseScene(
  "COMPLETION_CATEGORY_ACTION"
);
const adminCompletionDetailScene = new Scenes.BaseScene(
  "COMPLETION_DETAIL_ACTION"
);

// Actions
adminCompletionScene.enter(async (ctx) => {
  // Create text
  const title = "Какие отчеты тебя интересуют? 🎯";
  const description = "Выберите категорию отчетов из списка доступных.";
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Новые отчеты",
            callback_data: "COMPLETIONS_CATEGORY_1",
          },
        ],
        [
          {
            text: "Засчитанные",
            callback_data: "COMPLETIONS_CATEGORY_2",
          },
          {
            text: "Отклоненные",
            callback_data: "COMPLETIONS_CATEGORY_3",
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
adminCompletionScene.action(/COMPLETIONS_CATEGORY_(.+)/, (ctx) => {
  const callback = ctx.match[1];
  const categoryID = callback.trim();

  if (categoryID == 1) {
    ctx.session.completionStatus = reply.status.onCheck;
  } else if (categoryID == 2) {
    ctx.session.completionStatus = reply.status.onApproved;
  } else {
    ctx.session.completionStatus = reply.status.onDenied;
  }

  handlerGoToScene(
    ctx,
    "COMPLETION_CATEGORY_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

adminCategoryCompletionScene.enter(async (ctx) => {
  const data = ["completionStatus"];
  if (handlerCheckData(ctx, data)) {
    const status = ctx.session.completionStatus;
    const completions = await getCompletionsByStatus(status);

    // Create text
    const title = reply.title.adminCompletions;
    let description;
    if (completions.length === 0) {
      description =
        "В данной категории нет доступных отчетов. Загляни попозже!";
    } else {
      description = "Выбери отчет, который хочешь проверить.";
    }
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "ADMIN_COMPLETIONS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = completions.map((completion) => {
      return [
        {
          text: `${completion.user.fullName}: ${completion.task.name}`,
          callback_data: `COMPLETION_ID_${completion.id}`,
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
adminCategoryCompletionScene.action(/COMPLETION_ID_(.+)/, (ctx) => {
  const completionID = ctx.match[1];
  ctx.session.completionID = completionID.trim();

  handlerGoToScene(
    ctx,
    "COMPLETION_DETAIL_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

adminCompletionDetailScene.enter(async (ctx) => {
  const data = ["completionID"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const completionID = ctx.session.completionID;
    const completion = await getCompletion(completionID);
    const department = await getDepartment(completion.user.departmentId);
    ctx.session.completion = completion;

    // Create text
    const title = `Отчет №: ${completion.id}`;
    let description = `Сотрудник: ${completion.user.fullName}\n`;
    description += `Отдел: ${department.name}\n\n`;
    description += `Задача: ${completion.task.name}\n`;
    description += `Стоимость: ${completion.task.cost} 💸\n\n`;
    description += `Статус: ${completion.status}\n\n`;
    if (!completion.reportText) {
      description += `Текстовый отчет: Не прикреплен`;
    } else {
      description += `Текстовый отчет: "${completion.reportText}"`;
    }
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "COMPLETION_CATEGORY_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const lookPhotoButton = createBtn("Смотреть фото", "COMPLETION_PHOTO");
    const eventButtons = createKeyboard(
      "Засчитать",
      "COMPLETION_APPROVED",
      "Отклонить",
      "COMPLETION_DENIED"
    );
    let keyboard;
    if (!completion.reportPhoto) {
      keyboard = {
        reply_markup: {
          inline_keyboard: [
            ...eventButtons.reply_markup.inline_keyboard,
            ...backMenuButtons.reply_markup.inline_keyboard,
          ],
        },
      };
    } else {
      ctx.session.completionPhotoPath = completion.reportPhoto;
      keyboard = {
        reply_markup: {
          inline_keyboard: [
            ...lookPhotoButton.reply_markup.inline_keyboard,
            ...eventButtons.reply_markup.inline_keyboard,
            ...backMenuButtons.reply_markup.inline_keyboard,
          ],
        },
      };
    }

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    ctx.session.sceneMessages = message.message_id;
  }
});
adminCompletionDetailScene.action("COMPLETION_PHOTO", async (ctx) => {
  await ctx.deleteMessage(ctx.session.sceneMessage);
  const data = ["completionPhotoPath"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const photoPath = ctx.session.completionPhotoPath;

    // Create UI
    const keyboard = createKeyboard(
      reply.button.back,
      "COMPLETION_DETAIL_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );

    const message = await ctx.replyWithPhoto(
      { source: photoPath },
      {
        reply_markup: {
          inline_keyboard: [...keyboard.reply_markup.inline_keyboard],
        },
      }
    );
    ctx.session.sceneMessages = message.message_id;
  }
});
adminCompletionDetailScene.action("COMPLETION_APPROVED", async (ctx) => {
  const data = ["completion"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const completion = ctx.session.completion;

    await updateCompletionStatus(completion.id, reply.status.onApproved);
    await addBalance(completion.userId, completion.task.cost);

    handlerGoToScene(
      ctx,
      "COMPLETION_DETAIL_ACTION",
      reply.error.scene404title,
      reply.error.scene404
    );
  }
});
adminCompletionDetailScene.action("COMPLETION_DENIED", async (ctx) => {
  const data = ["completion"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const completion = ctx.session.completion.id;
    await updateCompletionStatus(completion.id, reply.status.onDenied);
    handlerGoToScene(
      ctx,
      "COMPLETION_DETAIL_ACTION",
      reply.error.scene404title,
      reply.error.scene404
    );
  }
});

// Action buttons handlers
adminCompletionScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
adminCategoryCompletionScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
adminCompletionDetailScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = {
  adminCompletionScene,
  adminCategoryCompletionScene,
  adminCompletionDetailScene,
};
