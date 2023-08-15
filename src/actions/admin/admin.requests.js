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
  getRequestsByStatus,
  getRequest,
  updateRequestStatus,
} = require("../../controllers/prize.controller");
const { getDepartment } = require("../../controllers/department.controller");

// Actions init
const adminRequestScene = new Scenes.BaseScene("ADMIN_REQUESTS_ACTION");
const adminCategoryRequestScene = new Scenes.BaseScene(
  "REQUEST_CATEGORY_ACTION"
);
const adminRequestDetailScene = new Scenes.BaseScene("REQUEST_DETAIL_ACTION");

// Actions
adminRequestScene.enter(async (ctx) => {
  // Create text
  const title = "Какие заявки тебя интересуют? 🎁";
  const description = "Выберите категорию заявок из списка доступных.";
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Новые заявки",
            callback_data: "REQUESTS_CATEGORY_1",
          },
        ],
        [
          {
            text: "Засчитанные",
            callback_data: "REQUESTS_CATEGORY_2",
          },
          {
            text: "Отклоненные",
            callback_data: "REQUESTS_CATEGORY_3",
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
adminRequestScene.action(/REQUESTS_CATEGORY_(.+)/, (ctx) => {
  const callback = ctx.match[1];
  const categoryID = callback.trim();

  if (categoryID == 1) {
    ctx.session.requestStatus = reply.status.onCheck;
  } else if (categoryID == 2) {
    ctx.session.requestStatus = reply.status.onApproved;
  } else {
    ctx.session.requestStatus = reply.status.onDenied;
  }

  handlerGoToScene(
    ctx,
    "REQUEST_CATEGORY_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

adminCategoryRequestScene.enter(async (ctx) => {
  const data = ["requestStatus"];
  if (handlerCheckData(ctx, data)) {
    const status = ctx.session.requestStatus;
    const requests = await getRequestsByStatus(status);

    // Create text
    const title = reply.title.adminRequests;
    let description;
    if (requests.length === 0) {
      description = "В данной категории нет доступных заявок. Загляни попозже!";
    } else {
      description = "Выбери заявку, которую хочешь проверить.";
    }
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "ADMIN_REQUESTS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = requests.map((request) => {
      return [
        {
          text: `${request.user.fullName}: ${request.prize.name}`,
          callback_data: `REQUEST_ID_${request.id}`,
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
adminCategoryRequestScene.action(/REQUEST_ID_(.+)/, (ctx) => {
  const requestID = ctx.match[1];
  ctx.session.requestID = requestID.trim();

  handlerGoToScene(
    ctx,
    "REQUEST_DETAIL_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

adminRequestDetailScene.enter(async (ctx) => {
  const data = ["requestID"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const requestID = ctx.session.requestID;
    const request = await getRequest(requestID);
    const department = await getDepartment(request.user.departmentId);
    ctx.session.request = request;

    // Create text
    const title = `Заявка №: ${request.id}`;
    let description = `<b>Сотрудник:</b>\n`;
    description += `${request.user.fullName} из отдела "${department.name}"\n\n`;
    description += `<b>Приз:</b>\n`;
    description += `Название: ${request.prize.name}`;
    description += `\nСтоимость: ${request.prize.cost} 💸\n`;
    description += `Статус: ${request.status}\n`;
    const answer = createHeader(title, description);

    // Create UI
    const eventButtons = createKeyboard(
      "Засчитать",
      "REQUEST_APPROVED",
      "Отклонить",
      "REQUEST_DENIED"
    );
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "ADMIN_REQUESTS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );

    let keyboardButtons = [
      ...eventButtons.reply_markup.inline_keyboard,
      ...backMenuButtons.reply_markup.inline_keyboard,
    ];
    if (
      request.status === reply.status.onApproved ||
      request.status === reply.status.onDenied
    ) {
      keyboardButtons = [...backMenuButtons.reply_markup.inline_keyboard];
    }
    const keyboard = {
      reply_markup: {
        inline_keyboard: keyboardButtons,
      },
    };

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    ctx.session.sceneMessages = message.message_id;
  }
});
adminRequestDetailScene.action("REQUEST_APPROVED", async (ctx) => {
  const data = ["request"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const request = ctx.session.request;
    const title = "Мы рассмотрели твою заявку 🎁";
    const description = `"${request.prize.name}" одобрена.\nДля получения свяжись с <b>@lubowchanell</b>`;
    const answer = createHeader(title, description);

    try {
      await ctx.telegram.sendMessage(request.user.chatId, answer, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(
        `Ошибка при отправке сообщения сотруднику об одобрении заявки на приз с chat_id ${request.userId}`,
        error
      );
      const title = reply.error.defaultTitle;
      const description = reply.error.default;
      const answer = createHeader(title, description);
      return ctx.replyWithHTML(answer);
    }

    await updateRequestStatus(request.id, reply.status.onApproved);
    handlerGoToScene(
      ctx,
      "REQUEST_DETAIL_ACTION",
      reply.error.scene404title,
      reply.error.scene404
    );
  }
});
adminRequestDetailScene.action("REQUEST_DENIED", async (ctx) => {
  const data = ["request"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const request = ctx.session.request;
    const title = "Мы рассмотрели твою заявку 🎁";
    const description = `"${request.prize.name}" отклонена.\nДля уточнения деталей и возврата бустов на баланс свяжись с <b>@lubowchanell</b>`;
    const answer = createHeader(title, description);

    try {
      await ctx.telegram.sendMessage(request.user.chatId, answer, {
        parse_mode: "HTML",
      });
    } catch (error) {
      console.error(
        `Ошибка при отправке сообщения сотруднику об отклонении заявки на приз с chat_id ${request.userId}`,
        error
      );
      const title = reply.error.defaultTitle;
      const description = reply.error.default;
      const answer = createHeader(title, description);
      return ctx.replyWithHTML(answer);
    }

    await updateRequestStatus(request.id, reply.status.onDenied);
    handlerGoToScene(
      ctx,
      "REQUEST_DETAIL_ACTION",
      reply.error.scene404title,
      reply.error.scene404
    );
  }
});

// Action buttons handlers
adminRequestScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
adminCategoryRequestScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
adminRequestDetailScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = {
  adminRequestScene,
  adminCategoryRequestScene,
  adminRequestDetailScene,
};
