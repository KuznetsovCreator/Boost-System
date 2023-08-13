const { Scenes } = require("telegraf");
const { createHeader, createBtn } = require("../../utils/ui.util");
const { handlerGoToScene } = require("../../utils/handlers.util");
const reply = require("../../utils/text.util");

// Action init
const helpScene = new Scenes.BaseScene("USER_HELP_ACTION");

// Actions
helpScene.enter(async (ctx) => {
  // Create text
  const title = reply.title.userSupport;
  const description = reply.support.user;
  const answer = createHeader(title, description);

  // Create UI
  const button = createBtn(reply.button.back, "COMMON_START_ACTION");

  // Create message
  const message = await ctx.replyWithHTML(answer, button);
  ctx.session.sceneMessages = message.message_id;
});

// Action buttons handlers
helpScene.action(/(.+)/, async (ctx) => {
  const sceneName = ctx.match[1];

  handlerGoToScene(
    ctx,
    sceneName,
    reply.error.scene404title,
    reply.error.scene404
  );
});

module.exports = { helpScene };
