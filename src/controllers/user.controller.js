const {
  User,
  TaskCompletion,
  PrizeRequest,
  Department,
} = require("../database/db.models");
const { error } = require("../utils/text.util");

// Create & Update
async function createUser(chatId, fullName, departmentId) {
  try {
    const user = await User.create({
      chatId,
      fullName,
      isAdmin: false,
      departmentId,
    });
    return user;
  } catch (error) {
    throw new Error("Ошибка создания нового пользователя.");
  }
}
async function updateUser(userId, updateData) {
  try {
    const [rowsUpdated, [updatedUser]] = await User.update(updateData, {
      where: { id: userId },
      returning: true,
    });

    if (rowsUpdated !== 1) {
      throw new Error("User not found or update failed.");
    }

    return updatedUser;
  } catch (error) {
    throw new Error("Failed to update user.");
  }
}

// Read
async function getUser(chatId) {
  try {
    const user = await User.findOne({
      where: { chatId },
      include: [
        { model: TaskCompletion, as: "taskCompletions" },
        { model: PrizeRequest, as: "prizeRequests" },
        { model: Department },
      ],
    });
    return user;
  } catch (error) {
    throw new Error("Ошибка получения пользователя.");
  }
}
async function getUsersCount() {
  try {
    return await User.count();
  } catch (error) {
    throw new Error("Ошибка получения кол-ва пользователей.");
  }
}

// User balance operations
async function addBalance(id, amount) {
  try {
    const user = await User.findOne({ where: { id } });
    if (!user) {
      throw new Error("Не найден пользователь для пополнения баланса.");
    }

    user.balance += amount;
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Ошибка пополнения баланса.");
  }
}
async function removeBalance(chatId, amount) {
  try {
    const user = await User.findOne({ where: { chatId } });
    if (!user) {
      throw new Error("Не найден пользователь для списания баланса.");
    }

    if (user.balance < amount) {
      return false;
    }

    user.balance -= amount;
    await user.save();
    return true;
  } catch (error) {
    throw new Error("Ошибка списания баланса.");
  }
}

module.exports = {
  createUser,
  updateUser,
  getUsersCount,
  getUser,
  addBalance,
  removeBalance,
};
