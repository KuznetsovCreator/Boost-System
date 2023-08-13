const { Department } = require("../database/db.models");

// Create & Update
async function createDepartment(name) {
  try {
    const department = await Department.create({ name });
    return department;
  } catch (error) {
    throw new Error("Ошибка создания отдела.");
  }
}
async function updateDepartment(id, newName) {
  try {
    const department = await Department.findByPk(id);
    if (!department) {
      throw new Error("Ошибка изменения отдела. Отдел не найден.");
    }
    department.name = newName;
    await department.save();
    return department;
  } catch (error) {
    throw new Error("Ошибка обновления данных отдела.");
  }
}

// Read
async function getDepartment(id) {
  try {
    const department = await Department.findOne({ where: { id } });
    return department;
  } catch (error) {
    throw new Error("Ошибка получения отдела компании.");
  }
}
async function getAllDepartments() {
  try {
    const departments = await Department.findAll();
    return departments;
  } catch (error) {
    throw new Error("Ошибка получения всех отделов.");
  }
}
async function getDepartmentsCount() {
  try {
    return await Department.count();
  } catch (error) {
    throw new Error("Ошибка получения кол-ва отделов компании.");
  }
}

module.exports = {
  createDepartment,
  getDepartment,
  getAllDepartments,
  getDepartmentsCount,
  updateDepartment,
};
