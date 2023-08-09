const { Scenes } = require("telegraf");

// COMMON
const { startScene } = require("./common/common.start");
const { authScene } = require("./common/common.auth");
const { userScene } = require("./common/common.user");
const { adminScene } = require("./common/common.admin");

// USER
const {
  infoScene,
  infoTaskScene,
  infoPrizeScene,
} = require("./user/user.info");
const {
  prizeScene,
  prizeCategoryScene,
  prizeDetailScene,
  prizeRequestScene,
  prizeRequestCreateScene,
} = require("./user/user.prizes");
const {
  taskScene,
  taskCategoryScene,
  taskDetailScene,
  taskCompletionScene,
  taskCompletionCreateScene,
} = require("./user/user.tasks");
const {
  profileScene,
  profileCompletionScene,
  profileRequestScene,
} = require("./user/user.profile");
const { helpScene } = require("./user/user.help");

// ADMIN

// REGISTRATE
const stage = new Scenes.Stage();
// Common
stage.register(startScene);
stage.register(authScene);
stage.register(userScene);
stage.register(adminScene);
// User
stage.register(infoScene);
stage.register(infoTaskScene);
stage.register(infoPrizeScene);

stage.register(profileScene);
stage.register(profileCompletionScene);
stage.register(profileRequestScene);

stage.register(helpScene);

stage.register(prizeScene);
stage.register(prizeCategoryScene);
stage.register(prizeDetailScene);
stage.register(prizeRequestScene);
stage.register(prizeRequestCreateScene);

stage.register(taskScene);
stage.register(taskCategoryScene);
stage.register(taskDetailScene);
stage.register(taskCompletionScene);
stage.register(taskCompletionCreateScene);
// Admin

module.exports = stage;
