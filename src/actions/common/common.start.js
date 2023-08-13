const { Scenes } = require("telegraf");
const { getUser } = require("../../controllers/user.controller");

const startScene = new Scenes.BaseScene("COMMON_START_ACTION");
startScene.enter(async (ctx) => {
  // Get user data
  const chatId = ctx.chat.id;
  const user = await getUser(chatId);

  // Check user auth
  if (!user) {
    return ctx.scene.enter("COMMON_AUTH_ACTION");
  }

  // Create user object in session
  ctx.session.user = user;

  // Check user role
  return user.isAdmin
    ? ctx.scene.enter("COMMON_ADMIN_ACTION")
    : ctx.scene.enter("COMMON_USER_ACTION");
});

module.exports = { startScene };
