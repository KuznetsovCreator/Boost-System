const reply = require("./text.util");
const { createHeader, createBtn } = require("./ui.util");

// Button handlers
async function handlerGoToScene(
  ctx,
  sceneName,
  errorTitle = reply.error.defaultTitle,
  errorDescription = reply.error.default
) {
  try {
    await ctx.deleteMessage(ctx.session.sceneMessage);
    await ctx.scene.leave();
    await ctx.scene.enter(sceneName);
  } catch (error) {
    console.log("Ошибка работы UI-элемента: ", error);
    const answer = createHeader(errorTitle, errorDescription);
    const button = createBtn(reply.button.restart, "/restart");
    ctx.replyWithHTML(answer, button);
  }
}

module.exports = {
  handlerGoToScene,
};
