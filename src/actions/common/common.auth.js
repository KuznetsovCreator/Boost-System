const { Scenes, Composer } = require("telegraf");
const { createUser } = require("../../controllers/user.controller");
const {
  getAllDepartments,
} = require("../../controllers/department.controller");
const reply = require("../../utils/text.util");
const { createBtn, createHeader } = require("../../utils/ui.util");
const { handlerCheckData } = require("../../utils/handlers.util");
const validation = require("../../utils/validation.util");

// Functions
async function showDepartments(ctx) {
  // Create text
  const title = "В каком отделе ты работаешь? 🏢";
  const description = "Выбери <i>отдел</i> из списка.";
  const answer = createHeader(title, description, false);

  // Create UI
  const departments = await getAllDepartments();
  const keyboard = departments.map((department) => {
    return [
      {
        text: department.name,
        callback_data: `select_department_${department.id}`,
      },
    ];
  });

  // Send
  const message = ctx.replyWithHTML(answer, {
    reply_markup: {
      inline_keyboard: keyboard,
    },
  });

  // Save message ID
  ctx.session.sceneMessages = message.message_id;
}

// Action init
const stepOne = new Composer();
const stepTwo = new Composer();
const startThree = new Composer();

// Action steps
stepOne.action("getName", async (ctx) => {
  // Delete old message
  await ctx.deleteMessage(ctx.session.sceneMessages);

  // Create text
  const title = reply.actionTitles.auth;
  const description = reply.actionDescriptions.auth;
  const answer = createHeader(title, description);

  // Create message
  const message = await ctx.replyWithHTML(answer);
  ctx.session.sceneMessages = message.message_id;
  return ctx.wizard.next();
});
stepTwo.on("text", async (ctx) => {
  const fullName = ctx.message.text;

  // Validate
  if (!validation.validateText(fullName)) {
    return ctx.replyWithHTML(
      "Нееее... 😅 Такая <i>фамилия</i> и <i>имя</i> не подходит."
    );
  }
  if (!validation.hasTwoWords(fullName)) {
    return ctx.replyWithHTML("Нужно написать <i>фамилию</i> и <i>имя</i>.");
  }
  if (validation.hasCensorship(fullName)) {
    return ctx.replyWithHTML(
      "Ну зачем так? 🫤 Нужно написать <i>фамилию</i> и <i>имя</i>."
    );
  }

  // Set data
  ctx.session.fullName = fullName;

  // Create message
  await showDepartments(ctx);
  return ctx.wizard.next();
});
startThree.action(/select_department_(.+)/, async (ctx) => {
  // Get & Set
  const departmentId = ctx.match[1];
  ctx.session.departmentId = departmentId.trim();

  // Check data
  const data = ["fullName", "departmentId"];
  if (handlerCheckData(ctx, data)) {
    // Get data
    const chatId = ctx.chat.id;
    const fullName = ctx.session.fullName;
    const departmentId = ctx.session.departmentId;

    // Clear session
    ctx.session = {};

    // Create new user
    await createUser(chatId, fullName, departmentId);

    // Go to next scene
    await ctx.deleteMessage(ctx.session.sceneMessages);
    await ctx.scene.leave();
    return ctx.scene.enter("COMMON_START_ACTION");
  }
});

// Create action
const authScene = new Scenes.WizardScene(
  "COMMON_AUTH_ACTION",
  stepOne,
  stepTwo,
  startThree
);
authScene.enter(async (ctx) => {
  // Create text & UI
  const answer = reply.welcome.newUser;
  const button = createBtn("Давай знакомиться 🔥", "getName");

  // Create message
  const message = await ctx.replyWithHTML(answer, button);
  ctx.session.sceneMessages = message.message_id;
});

module.exports = { authScene };
