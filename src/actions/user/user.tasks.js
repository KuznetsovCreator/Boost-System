const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
} = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");
const {
  getCompletion,
  getAllTasksByDepartmentId,
  getCompletionByUserTaskID,
  createCompletion,
  getTask,
} = require("../../controllers/task.controller");

// Actions init
const taskScene = new Scenes.BaseScene("USER_TASKS_ACTION");
const taskCategoryScene = new Scenes.BaseScene("TASK_CATEGORY_ACTION");
const taskDetailScene = new Scenes.BaseScene("TASK_DETAIL_ACTION");
const taskCompletionScene = new Scenes.BaseScene("TASK_COMPLETION_ACTION");
const taskCompletionCreateScene = new Scenes.BaseScene(
  "TASK_COMPLETION_CREATE_ACTION"
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
  const categoryID = ctx.match[1];

  if (categoryID === "DEPARTMENT") {
    ctx.session.taskCategoryID = ctx.session.user.departmentId;
  } else {
    ctx.session.taskCategoryID = null;
  }

  handlerGoToScene(
    ctx,
    "TASK_CATEGORY_ACTION",
    reply.error.scene404title,
    reply.error.scene404
  );
});

// Output tasks from category
taskCategoryScene.enter(async (ctx) => {
  // Get prize category ID
  const categoryID = ctx.session.taskCategoryID;
  const tasks = await getAllTasksByDepartmentId(categoryID);

  // Check prizes is empty
  if (tasks.length === 0) {
    // Create text
    const title = reply.title.userTasks;
    const description =
      "В данной категории нет доступных задач. Загляни попозже.";
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
});

// Output completion detail
taskCompletionScene.enter(async (ctx) => {
  // Get data
  const userID = ctx.session.user.id;
  const taskID = ctx.session.taskID;
  const completion = await getCompletionByUserTaskID(userID, taskID);

  // Check is completion is already created
  if (!completion) {
    ctx.scene.leave();
    return ctx.scene.enter("TASK_COMPLETION_CREATE_ACTION");
  }

  // Create text
  const title = reply.title.userTaskCompletion;
  const taskName = completion.task ? completion.task.name : null;
  const taskCost = completion.task ? completion.task.cost : null;
  const completionText = completion.reportText ? "Прикреплен" : "Не прикреплен";
  const completionPic = completion.reportPhoto ? "Прикреплен" : "Не прикреплен";
  let description = `Задача: ${taskName}\n\n`;
  description += `Текстовый отчет: ${completionText}\n`;
  description += `Фото-отчет: ${completionPic}\n\n`;
  description += `Начислено: ${taskCost} 💸\n`;
  description += `Статус: ${completion.status}`;
  const answer = createHeader(title, description);

  // Create UI
  const buttons = createKeyboard(
    "Мои отчеты",
    "PROFILE_COMPLETIONS_ACTION",
    reply.button.mainMenu,
    "COMMON_START_ACTION"
  );

  // Create message
  const message = await ctx.replyWithHTML(answer, buttons);
  ctx.session.sceneMessages = message.message_id;
});

// Create task completion
taskCompletionCreateScene.enter(async (ctx) => {
  ctx.reply("Раздел в разработке!");
});

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

module.exports = {
  taskScene,
  taskCategoryScene,
  taskDetailScene,
  taskCompletionScene,
  taskCompletionCreateScene,
};
