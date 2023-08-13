const { Scenes } = require("telegraf");
const {
  createHeader,
  createBtn,
  createKeyboard,
} = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");
const { getUsersCount } = require("../../controllers/user.controller");
const {
  getDepartmentsCount,
} = require("../../controllers/department.controller");
const { getCompletionsCount } = require("../../controllers/task.controller");
const { getRequestsCount } = require("../../controllers/prize.controller");

// Actions init
const analyticScene = new Scenes.BaseScene("ADMIN_ANALYTICS_ACTION");

// Actions
analyticScene.enter(async (ctx) => {
  // Get data
  const departmentsCount = await getDepartmentsCount();
  const usersCount = await getUsersCount();
  const completionsCount = await getCompletionsCount();
  const {
    totalCompletions,
    checkCompletions,
    approvedCompletions,
    deniedCompletions,
  } = completionsCount;
  const requestsCount = await getRequestsCount();
  const { totalRequests, checkRequests, approvedRequests, deniedRequests } =
    requestsCount;

  // Create text
  const title = reply.title.adminAnalytics;
  let description = `<b>👦🏻 Сотрудники и отделы:</b>\n`;
  description += `Всего отделов: ${departmentsCount}\n`;
  description += `Всего сотрудников: ${usersCount}\n`;

  description += `\n<b>📝 Отчеты сотрудников:</b>\n`;
  description += `Всего отчетов: ${totalCompletions}\n`;
  description += `На рассмотрении: ${checkCompletions}\n`;
  description += `Засчитанных: ${approvedCompletions}\n`;
  description += `Отклоненных: ${deniedCompletions}\n`;

  description += `\n<b>🎁 Заявки на призы:</b>\n`;
  description += `Всего заявок: ${totalRequests}\n`;
  description += `На рассмотрении: ${checkRequests}\n`;
  description += `Засчитанных: ${approvedRequests}\n`;
  description += `Отклоненных: ${deniedRequests}\n`;
  const answer = createHeader(title, description);

  // Create UI
  const keyboard = createBtn(reply.button.back, "COMMON_ADMIN_ACTION");

  // Create message
  const message = await ctx.replyWithHTML(answer, keyboard);
  ctx.session.sceneMessages = message.message_id;
});

// Action buttons handlers
analyticScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { analyticScene };
