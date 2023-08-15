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
  taskCompletionAddTextScene,
  taskCompletionAddPhotoScene,
} = require("./user/user.tasks");
const {
  profileScene,
  profileCompletionScene,
  profileRequestScene,
} = require("./user/user.profile");
const { helpScene } = require("./user/user.help");

// ADMIN
const { analyticScene } = require("./admin/admin.analytics");
const {
  adminCompletionScene,
  adminCategoryCompletionScene,
  adminCompletionDetailScene,
} = require("./admin/admin.completions");
const {
  adminRequestScene,
  adminCategoryRequestScene,
  adminRequestDetailScene,
} = require("./admin/admin.requests");

// REG ACTIONS
const stage = new Scenes.Stage();

// Common
stage.register(startScene);
stage.register(authScene);
stage.register(userScene);
stage.register(adminScene);

// User
// Common actions
stage.register(infoScene);
stage.register(helpScene);
stage.register(infoTaskScene);
stage.register(infoPrizeScene);
// Profile actions
stage.register(profileScene);
stage.register(profileCompletionScene);
stage.register(profileRequestScene);
// Prizes actions
stage.register(prizeScene);
stage.register(prizeCategoryScene);
stage.register(prizeDetailScene);
stage.register(prizeRequestScene);
stage.register(prizeRequestCreateScene);
// Tasks actions
stage.register(taskScene);
stage.register(taskCategoryScene);
stage.register(taskDetailScene);
stage.register(taskCompletionScene);
stage.register(taskCompletionCreateScene);
stage.register(taskCompletionAddTextScene);
stage.register(taskCompletionAddPhotoScene);

// Admin
// Common actions
stage.register(analyticScene);
// Completions actions
stage.register(adminCompletionScene);
stage.register(adminCategoryCompletionScene);
stage.register(adminCompletionDetailScene);
// Requests actions
stage.register(adminRequestScene);
stage.register(adminCategoryRequestScene);
stage.register(adminRequestDetailScene);

module.exports = stage;
