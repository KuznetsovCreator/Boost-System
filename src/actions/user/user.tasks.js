require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
  createVerticalKeyboard,
} = require("../../utils/ui.util");
const {
  handlerGoToScene,
  handlerCheckData,
} = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");
const {
  getAllTasksByDepartmentId,
  getCompletionByUserTaskID,
  createCompletion,
  getTask,
  addTextReport,
  addPhotoReport,
} = require("../../controllers/task.controller");
const { getAdmins } = require("../../controllers/user.controller");
const validation = require("../../utils/validation.util");

// Actions init
const taskScene = new Scenes.BaseScene("USER_TASKS_ACTION");
const taskCategoryScene = new Scenes.BaseScene("TASK_CATEGORY_ACTION");
const taskDetailScene = new Scenes.BaseScene("TASK_DETAIL_ACTION");
const taskCompletionScene = new Scenes.BaseScene("TASK_COMPLETION_ACTION");
const taskCompletionCreateScene = new Scenes.BaseScene(
  "TASK_COMPLETION_CREATE_ACTION"
);
const taskCompletionAddTextScene = new Scenes.BaseScene(
  "TASK_COMPLETION_ADD_TEXT_ACTION"
);
const taskCompletionAddPhotoScene = new Scenes.BaseScene(
  "TASK_COMPLETION_ADD_PHOTO_ACTION"
);

// Output task categories
taskScene.enter(async (ctx) => {
  // Create text
  const title = "Какие задачи тебя интересуют? 🎯";
  const description = "Выберите категорию задач из списка доступных.";
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");
  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Задачи отдела",
            callback_data: "TASK_CATEGORY_DEPARTMENT",
          },
          {
            text: "Общие задачи",
            callback_data: "TASK_CATEGORY_ALL",
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
taskScene.action(/TASK_CATEGORY_(.+)/, (ctx) => {
  const callback = ctx.match[1];

  const data = ["user.departmentId"];
  if (handlerCheckData(ctx, data)) {
    const categoryID = callback.trim();
    if (categoryID === "DEPARTMENT") {
      ctx.session.taskCategoryID = ctx.session.user.departmentId;
    } else {
      ctx.session.taskCategoryID = "common";
    }

    handlerGoToScene(
      ctx,
      "TASK_CATEGORY_ACTION",
      reply.error.scene404title,
      reply.error.scene404
    );
  }
});

// Output tasks from category
taskCategoryScene.enter(async (ctx) => {
  const data = ["taskCategoryID"];
  if (handlerCheckData(ctx, data)) {
    // Get prize category ID
    let categoryID = ctx.session.taskCategoryID;
    if (categoryID === "common") {
      categoryID = null;
    }
    const tasks = await getAllTasksByDepartmentId(categoryID);

    // Check prizes is empty
    if (tasks.length === 0) {
      // Create text
      const title = reply.title.userTasks;
      const description =
        "В данной категории нет доступных задач. Загляни попозже!";
      const answer = createHeader(title, description);

      // Create UI
      const keyboard = createKeyboard(
        reply.button.back,
        "USER_TASK_ACTION",
        reply.button.mainMenu,
        "COMMON_START_ACTION"
      );

      // Create message
      const message = await ctx.replyWithHTML(answer, keyboard);
      return (ctx.session.sceneMessages = message.message_id);
    }

    // Create text
    const title = reply.title.userTasks;
    const description = "Выбери задачу, которую хочешь выполнить.";
    const answer = createHeader(title, description);

    // Create UI
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "USER_TASKS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const keyboard = tasks.map((task) => {
      return [
        {
          text: task.name,
          callback_data: `TASK_${task.id}`,
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
taskCategoryScene.action(/TASK_(.+)/, (ctx) => {
  const taskID = ctx.match[1];
  ctx.session.taskID = taskID.trim();

  handlerGoToScene(
    ctx,
    "TASK_DETAIL_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Output task detail
taskDetailScene.enter(async (ctx) => {
  const data = ["taskID"];
  if (handlerCheckData(ctx, data)) {
    // Get task ID
    const taskID = ctx.session.taskID;
    const task = await getTask(taskID);

    // Check task is empty
    if (!task) {
      const title = "Упсс... Ошибка открытия задачи 😥";
      const description = reply.error.default;
      const answer = createHeader(title, description);

      // Create UI
      const keyboard = createKeyboard(
        reply.button.back,
        "TASK_CATEGORY_ACTION",
        reply.button.mainMenu,
        "COMMON_START_ACTION"
      );

      // Create message
      const message = await ctx.replyWithHTML(answer, keyboard);
      return (ctx.session.sceneMessages = message.message_id);
    }

    // Create text
    let description = "";
    const taskDescription = task.description;
    if (taskDescription !== null) {
      description = `${task.description}\n\n`;
    }
    description += `Ты заработаешь: ${task.cost} 💸`;
    const answer = createHeader(task.name, description);

    // Create UI
    const eventButton = createBtn(
      reply.userButton.getTask,
      "TASK_COMPLETION_ACTION"
    );
    const backMenuButtons = createKeyboard(
      reply.button.back,
      "TASK_CATEGORY_ACTION",
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

// Output completion detail
taskCompletionScene.enter(async (ctx) => {
  const data = ["user.id", "taskID"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const userID = ctx.session.user.id;
    const taskID = ctx.session.taskID;
    const completion = await getCompletionByUserTaskID(userID, taskID);

    // Check is completion is already created
    if (!completion) {
      ctx.scene.leave();
      return ctx.scene.enter("TASK_COMPLETION_CREATE_ACTION");
    }

    // Reports
    const textReportStatus = completion.reportText ? true : false;
    const photoReportStatus = completion.reportPhoto ? true : false;

    // Create text
    const title = reply.actionTitles.userTaskCompletion;
    const taskName = completion.task ? completion.task.name : null;
    const taskCost = completion.task ? completion.task.cost : null;
    const completionText = completion.reportText
      ? "Прикреплен"
      : "Не прикреплен";
    const completionPic = completion.reportPhoto
      ? "Прикреплен"
      : "Не прикреплен";
    let description = `Задача: ${taskName}\n\n`;
    description += `Текстовый отчет: ${completionText}\n`;
    description += `Фото-отчет: ${completionPic}\n\n`;
    description += `Заработаешь: ${taskCost} 💸\n`;
    description += `Статус: ${completion.status}`;
    const answer = createHeader(title, description);

    // Create UI
    const buttons = createKeyboard(
      reply.userButton.completions,
      "PROFILE_COMPLETIONS_ACTION",
      reply.button.mainMenu,
      "COMMON_START_ACTION"
    );
    const eventButtons =
      !textReportStatus && !photoReportStatus
        ? createVerticalKeyboard(
            "Добавить текстовый отчет 📝",
            "TASK_COMPLETION_ADD_TEXT_ACTION",
            "Добавить фото-отчет 📸",
            "TASK_COMPLETION_ADD_PHOTO_ACTION"
          )
        : !textReportStatus
        ? createBtn(
            "Добавить текстовый отчет",
            "TASK_COMPLETION_ADD_TEXT_ACTION"
          )
        : !photoReportStatus
        ? createBtn("Добавить фото-отчет", "TASK_COMPLETION_ADD_PHOTO_ACTION")
        : null;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          ...(eventButtons ? eventButtons.reply_markup.inline_keyboard : []),
          ...buttons.reply_markup.inline_keyboard,
        ],
      },
    };

    // Create message
    const message = await ctx.replyWithHTML(answer, keyboard);
    ctx.session.sceneMessages = message.message_id;
    ctx.session.completion = completion;
  }
});

// Create task completion
taskCompletionCreateScene.enter(async (ctx) => {
  const data = ["user.id", "taskID"];
  if (handlerCheckData(ctx, data)) {
    const userID = ctx.session.user.id;
    const taskID = ctx.session.taskID;

    const completionStatus = reply.status.onCheck;
    const completion = await createCompletion(userID, taskID, completionStatus);

    if (completion) {
      const admins = await getAdmins();
      if (admins.length > 0) {
        for (const admin of admins) {
          try {
            const title = "Создан новый отчет 📝";
            const description = `Сотрудник ${ctx.session.user.fullName} начал выполнение задачи.`;
            const answer = createHeader(title, description);
            await ctx.telegram.sendMessage(admin.chatId, answer, {
              parse_mode: "HTML",
            });
          } catch (error) {
            console.error(
              `Ошибка при отправке сообщения администратору с chat_id ${admin.chatId}`,
              error
            );
          }
        }
      }
    }

    ctx.session.taskID = completion.taskId;
    return ctx.scene.enter("TASK_COMPLETION_ACTION");
  }
});

// Update task completion
taskCompletionAddTextScene.enter(async (ctx) => {
  // Create text
  const title = reply.actionTitles.completionTextReport;
  const description =
    "Прикрепите краткий и понятный текстовый отчет о выполнении задачи. Изменить текст будет нельзя.";
  const answer = createHeader(title, description);

  // Create UI
  const backMenuButtons = createKeyboard(
    reply.button.back,
    "TASK_COMPLETION_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );

  // Create message
  const message = await ctx.replyWithHTML(answer, backMenuButtons);
  ctx.session.sceneMessages = message.message_id;
});
taskCompletionAddTextScene.on("text", async (ctx) => {
  const data = ["completion.id"];
  if (handlerCheckData(ctx, data)) {
    const report = ctx.message.text;
    const completionID = ctx.session.completion.id;

    // Validate
    if (!validation.isMinLengthValid(report, 30)) {
      return ctx.replyWithHTML(
        "Текст слишком короткий 😅 Пришли текстовый отчет немного объемнее."
      );
    }
    if (!validation.isMaxLengthValid(report, 300)) {
      return ctx.replyWithHTML(
        "Текст слишком длинный 😅 Пришли текстовый отчет немного короче."
      );
    }

    const completionReport = await addTextReport(completionID, report);
    if (completionReport) {
      ctx.scene.leave();
      return ctx.scene.enter("TASK_COMPLETION_ACTION");
    }
  }
});

taskCompletionAddPhotoScene.enter(async (ctx) => {
  // Create text
  const title = reply.actionTitles.completionPhotoReport;
  const description =
    "Прикрепите скриншот или фото в качестве отчета о выполнении задачи. Поддерживаются все современные форматы.";
  const answer = createHeader(title, description);

  // Create UI
  const backMenuButtons = createKeyboard(
    reply.button.back,
    "TASK_COMPLETION_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );

  // Create message
  const message = await ctx.replyWithHTML(answer, backMenuButtons);
  ctx.session.sceneMessages = message.message_id;
});
taskCompletionAddPhotoScene.on("photo", async (ctx) => {
  const data = ["completion.id", "user.id"];
  if (handlerCheckData(ctx, data)) {
    const photo = ctx.message.photo[ctx.message.photo.length - 1];
    const fileID = photo.file_id;
    const completionID = ctx.session.completion.id;

    // Generate file
    const fileName = `${Date.now()}_${Math.floor(Math.random() * 10000)}.jpg`;
    const userPath = path.join("./files", String(ctx.session.user.id));
    const taskPath = path.join(userPath, String(ctx.session.completion.id));
    const savePath = path.join(taskPath, fileName);

    // Check is folder not found
    if (!fs.existsSync(userPath)) {
      fs.mkdirSync(userPath, { recursive: true });
    }
    if (!fs.existsSync(taskPath)) {
      fs.mkdirSync(taskPath, { recursive: true });
    }

    // Download picture
    const fileLink = await ctx.telegram.getFileLink(fileID);
    await downloadFile(fileLink, savePath);

    const completionReport = await addPhotoReport(completionID, savePath);
    if (completionReport) {
      ctx.scene.leave();
      return ctx.scene.enter("TASK_COMPLETION_ACTION");
    }
  }
});

// Functions
async function downloadFile(fileLink, savePath) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(savePath);
    fileStream.on("error", reject);
    fileStream.on("finish", resolve);
    fileStream.on("end", resolve);

    request = require("https").get(fileLink, (response) => {
      response.pipe(fileStream);
    });
  });
}

// Action buttons handlers
taskScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskCategoryScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskDetailScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskCompletionScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskCompletionCreateScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskCompletionAddTextScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});
taskCompletionAddPhotoScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = {
  taskScene,
  taskCategoryScene,
  taskDetailScene,
  taskCompletionScene,
  taskCompletionCreateScene,
  taskCompletionAddTextScene,
  taskCompletionAddPhotoScene,
};
