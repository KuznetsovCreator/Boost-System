const { Scenes } = require("telegraf");
const { getUser } = require("../../controllers/user.controller");

const startScene = new Scenes.BaseScene("COMMON_START_ACTION");
startScene.enter(async (ctx) => {
  const chatId = ctx.chat.id;
  const user = await getUser(chatId);

  if (!user) {
    return ctx.scene.enter("COMMON_AUTH_ACTION");
  }

  ctx.session.user = user;

  return user.isAdmin
    ? ctx.scene.enter("COMMON_ADMIN_ACTION")
    : ctx.scene.enter("COMMON_USER_ACTION");
});

module.exports = { startScene };
