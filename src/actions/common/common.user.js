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
          { text: reply.menu.userInfo, callback_data: "USER_INFO_ACTION" },
          {
            text: reply.menu.userProfile,
            callback_data: "USER_PROFILE_ACTION",
          },
        ],
        [
          { text: reply.menu.userTasks, callback_data: "USER_TASKS_ACTION" },
          { text: reply.menu.userPrizes, callback_data: "USER_PRIZES_ACTION" },
        ],
        [{ text: reply.menu.userSupport, callback_data: "USER_HELP_ACTION" }],
      ],
    },
  };
}

// Create action
const userScene = new Scenes.BaseScene("COMMON_USER_ACTION");
userScene.enter(async (ctx) => {
  // Get user from session
  const user = ctx.session.user;

  // If user is undefined
  if (!user) {
    await ctx.scene.leave();
    return await ctx.scene.enter("COMMON_START_ACTION");
  }

  // Create text
  const title = `Привет, ${user.fullName} 👋🏻`;
  const description = reply.welcome.user;
  const answer = createHeader(title, description);

  // Create message
  const message = await ctx.replyWithHTML(answer, mainMenu());
  ctx.session.sceneMessages = message.message_id;
});
userScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { userScene };
