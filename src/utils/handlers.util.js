const reply = require("./text.util");
const { createHeader, createBtn } = require("./ui.util");

// Buttons action
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

// Session data check
function handlerCheckData(ctx, requiredData) {
  const missingData = requiredData.filter((key) => {
    const value = getValueByKeyPath(ctx.session, key);
    return value === undefined || value === null;
  });
  if (missingData.length > 0) {
    // Create text
    const title = reply.error.data404title;
    const description = reply.error.data404;
    const answer = createHeader(title, description);
    ctx.replyWithHTML(answer);
    // Restart bot
    ctx.scene.enter("COMMON_START_ACTION");
    return false;
  }
  return true;
}
function getValueByKeyPath(obj, keyPath) {
  const keys = keyPath.split(".");
  let currentObj = obj;
  for (const key of keys) {
    if (currentObj && typeof currentObj === "object" && key in currentObj) {
      currentObj = currentObj[key];
    } else {
      return undefined;
    }
  }
  return currentObj;
}

module.exports = {
  handlerGoToScene,
  handlerCheckData,
};
