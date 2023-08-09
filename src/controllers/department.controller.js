const { Department } = require("../database/db.models");

// Функция для создания нового отдела
async function createDepartment(name) {
  try {
    const department = await Department.create({ name });
    return department;
  } catch (error) {
    throw new Error("Failed to create department");
  }
}

// Функция для получения всех отделов
async function getAllDepartments() {
  try {
    const departments = await Department.findAll();
    return departments;
  } catch (error) {
    throw new Error("Failed to fetch departments");
  }
}

// Функция для получения отдела по его ID
async function getDepartment(id) {
  try {
    const department = await Department.findByPk(id);
    return department;
  } catch (error) {
    throw new Error("Failed to fetch department");
  }
}

// Функция для обновления отдела
async function updateDepartment(id, newName) {
  try {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new Error("Department not found");
    }
    department.name = newName;
    await department.save();
    return department;
  } catch (error) {
    throw new Error("Failed to update department");
  }
}

// Функция для удаления отдела
async function deleteDepartment(id) {
  try {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new Error("Department not found");
    }
    await department.destroy();
    return department;
  } catch (error) {
    throw new Error("Failed to delete department");
  }
}

module.exports = {
  createDepartment,
  getAllDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};
