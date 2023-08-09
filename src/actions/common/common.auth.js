const { Scenes, Composer } = require("telegraf");
const { createUser } = require("../../controllers/user.controller");
const {
  getAllDepartments,
} = require("../../controllers/department.controller");
const reply = require("../../utils/text.util");
const { createBtn, createHeader } = require("../../utils/ui.util");
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
  await ctx.deleteMessage(ctx.session.sceneMessages);

  const title = "Как тебя зовут? 😁";
  const description =
    "Напиши <i>фамилию</i> и <i>имя</i> через пробел. Например: <i>Кузнецов Илья</i>.";
  const answer = createHeader(title, description, false);

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

  // Send
  await showDepartments(ctx);
  ctx.session.fullName = fullName;

  return ctx.wizard.next();
});
startThree.action(/select_department_(.+)/, async (ctx) => {
  const departmentId = ctx.match[1];

  // Create new user
  await createUser(ctx.chat.id, ctx.session.fullName, departmentId);

  // Delete old message
  await ctx.deleteMessage(ctx.session.sceneMessages);

  // Go to next scene
  await ctx.scene.leave();
  return ctx.scene.enter("COMMON_START_ACTION");
});

// Create action
const authScene = new Scenes.WizardScene(
  "COMMON_AUTH_ACTION",
  stepOne,
  stepTwo,
  startThree
);
authScene.enter(async (ctx) => {
  const answer = reply.welcome.newUser;
  const keyboard = createBtn("Давай знакомиться 🔥", "getName");

  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});

module.exports = { authScene };
