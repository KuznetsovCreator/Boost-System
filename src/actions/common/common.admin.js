const { Scenes } = require("telegraf");
const { createHeader } = require("../../utils/ui.util");
const reply = require("../../utils/text.util");

// Functions
function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: reply.menu.adminAnalytics,
            callback_data: "ADMIN_ANALYTIC_ACTION",
          },
          {
            text: reply.menu.adminRequests,
            callback_data: "ADMIN_REQUESTS_ACTION",
          },
        ],
        [
          { text: reply.menu.adminTasks, callback_data: "ADMIN_TASKS_ACTION" },
          {
            text: reply.menu.adminPrizes,
            callback_data: "ADMIN_PRIZES_ACTION",
          },
        ],
        [
          {
            text: reply.menu.adminDepartments,
            callback_data: "ADMIN_DEPARTMENTS_ACTION",
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
  const user = ctx.session.user;

  if (user) {
    // Create text
    const title = `Приветствую, ${user.fullName} 👋🏻`;
    const description = reply.welcome.admin;
    const answer = createHeader(title, description);

    // Send
    const message = await ctx.replyWithHTML(answer, mainMenu());

    // Save messages ID + save scene step
    ctx.session.sceneMessages = message.message_id;
    ctx.scene.state.step = "step-1";
  } else {
    await ctx.scene.leave();
    await ctx.scene.enter("COMMON_START_ACTION");
  }
});
adminScene.action(/(.+)/, async (ctx) => {
  if (ctx.scene.state.step === "step-1") {
    const sceneName = ctx.match[1];

    try {
      // Delete old messages
      await ctx.deleteMessage(ctx.session.sceneMessages);

      // Go to next scene
      await ctx.scene.leave();
      await ctx.scene.enter(sceneName);
    } catch (error) {
      const answer = createHeader(
        "Раздел в разработке ⚙️",
        reply.error.scene404
      );
      return ctx.replyWithHTML(answer);
    }
  }
});

module.exports = { adminScene };
