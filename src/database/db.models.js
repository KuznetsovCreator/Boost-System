const sequelize = require("./db.connect");
const { DataTypes } = require("sequelize");

// Users & Departments
const User = sequelize.define("user", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  chatId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  balance: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: true },
  contactPhone: { type: DataTypes.STRING, allowNull: true },
  isAdmin: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
});
const Department = sequelize.define("department", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

// Tasks
const Task = sequelize.define("task", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  cost: { type: DataTypes.INTEGER, allowNull: false },
  instruction: { type: DataTypes.TEXT, allowNull: true },
});
const TaskCompletion = sequelize.define("taskCompletion", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.STRING, allowNull: false },
  reportText: { type: DataTypes.TEXT, allowNull: true },
  reportPhoto: { type: DataTypes.STRING, allowNull: true },
});

// Prizes
const Prize = sequelize.define("prize", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  duration: { type: DataTypes.STRING, allowNull: true },
  cost: { type: DataTypes.INTEGER, allowNull: false },
  courseLink: { type: DataTypes.STRING, allowNull: true },
  category: { type: DataTypes.INTEGER, allowNull: true },
});
const PrizeRequest = sequelize.define("prizeRequest", {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  status: { type: DataTypes.STRING, allowNull: true },
});

User.hasMany(TaskCompletion);
User.hasMany(PrizeRequest);
User.belongsTo(Department);

Task.hasMany(TaskCompletion);
Task.belongsTo(Department);
TaskCompletion.belongsTo(User);
TaskCompletion.belongsTo(Task);

Prize.hasMany(PrizeRequest);
PrizeRequest.belongsTo(User);
PrizeRequest.belongsTo(Prize);

module.exports = {
  User,
  Department,
  Task,
  TaskCompletion,
  Prize,
  PrizeRequest,
};
