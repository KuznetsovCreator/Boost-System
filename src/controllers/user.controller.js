const {
  User,
  TaskCompletion,
  PrizeRequest,
  Department,
} = require("../database/db.models");

// Функция для создания нового пользователя
async function createUser(chatId, fullName, departmentId, isAdmin = false) {
  try {
    const user = await User.create({
      chatId,
      fullName,
      departmentId,
      isAdmin,
    });
    return user;
  } catch (error) {
    throw new Error("Failed to create user.");
  }
}

// Функция для обновления информации о пользователе
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

// Функция для вывода всех пользователей
async function getAllUsers() {
  try {
    const users = await User.findAll();
    return users;
  } catch (error) {
    throw new Error("Failed to get all users.");
  }
}

// Функция для вывода всех пользователей в определенном отделе компании
async function getUsersByDepartment(departmentId) {
  try {
    const users = await User.findAll({
      where: { DepartmentId: departmentId },
    });
    return users;
  } catch (error) {
    throw new Error("Failed to get users by department.");
  }
}

// Функция для вывода одного пользователя по ID чата
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
    throw new Error("Failed to get user by chat ID.");
  }
}

// Функция для пополнения баланса пользователя
async function addBalance(userId, amount) {
  try {
    const user = await User.findOne(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    user.balance += amount;
    await user.save();
    return user;
  } catch (error) {
    throw new Error("Failed to increase user's balance.");
  }
}

// Функция для уменьшения баланса пользователя
async function removeBalance(chatId, amount) {
  try {
    const user = await User.findOne({ where: { chatId } });
    if (!user) {
      throw new Error("User not found.");
    }

    if (user.balance < amount) {
      return false;
    }

    user.balance -= amount;
    await user.save();
    return true;
  } catch (error) {
    throw new Error("Failed to decrease user's balance.");
  }
}

module.exports = {
  createUser,
  updateUser,
  getAllUsers,
  getUsersByDepartment,
  getUser,
  addBalance,
  removeBalance,
};
