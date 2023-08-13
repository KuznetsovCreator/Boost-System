const { Scenes } = require("telegraf");
const reply = require("../../utils/text.util");
const { createHeader } = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");

// Functions
function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: reply.menu.adminAnalytics,
            callback_data: "ADMIN_ANALYTICS_ACTION",
          },
        ],
        [
          {
            text: reply.menu.adminCompletions,
            callback_data: "ADMIN_COMPLETIONS_ACTION",
          },
        ],
        [
          {
            text: reply.menu.adminRequests,
            callback_data: "ADMIN_REQUESTS_ACTION",
          },
        ],
      ],
    },
  };
}

// Create action
const adminScene = new Scenes.BaseScene("COMMON_ADMIN_ACTION");
adminScene.enter(async (ctx) => {
  // Get user from session
  const user = ctx.session.admin;

  if (!user) {
    await ctx.scene.leave();
    await ctx.scene.enter("COMMON_START_ACTION");
  }

  // Create text
  const title = `Приветствую, ${user.fullName} 👋🏻`;
  const description = reply.welcome.admin;
  const answer = createHeader(title, description);

  // Create message
  const message = await ctx.replyWithHTML(answer, mainMenu());
  ctx.session.sceneMessages = message.message_id;
});
adminScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { adminScene };
