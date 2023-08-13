const {
  Task,
  TaskCompletion,
  User,
  Department,
} = require("../database/db.models");
const reply = require("../utils/text.util");

// TASKS
// Create & Update
async function createTask(name, description, cost, departmentId) {
  try {
    const task = await Task.create({
      name,
      description,
      cost,
      departmentId,
    });
    return task;
  } catch (error) {
    throw new Error("Ошибка создания задачи.");
  }
}
async function updateTaskById(id, name, description, cost, departmentId) {
  try {
    const updatedTask = await Task.update(
      {
        name,
        description,
        cost,
        DepartmentId: departmentId,
      },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedTask;
  } catch (error) {
    throw new Error("Ошибка обновления задачи.");
  }
}

// Read
async function getTask(id) {
  try {
    const task = await Task.findOne({ where: { id } });
    return task;
  } catch (error) {
    throw new Error("Ошибка получения задачи.");
  }
}
async function getAllTasksByDepartmentId(departmentId) {
  try {
    const tasks = await Task.findAll({
      where: { departmentId },
    });
    return tasks;
  } catch (error) {
    throw new Error("Ошибка получения задач по ID отдела компании.");
  }
}

// TASK COMPLETIONS
// Create & Update
async function createCompletion(
  userId,
  taskId,
  status,
  reportText,
  reportPhoto
) {
  try {
    const taskCompletion = await TaskCompletion.create({
      userId,
      taskId,
      status,
      reportText,
      reportPhoto,
    });
    return taskCompletion;
  } catch (error) {
    throw new Error("Ошибка создания отчета.");
  }
}
async function updateCompletionStatus(id, status) {
  try {
    const updatedTaskCompletion = await TaskCompletion.update(
      { status },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Ошибка обновления отчета.");
  }
}

// Read
async function getCompletion(id) {
  try {
    const taskCompletion = await TaskCompletion.findOne({
      where: { id },
      include: [{ model: Task }, { model: User }],
    });
    return taskCompletion;
  } catch (error) {
    throw new Error("Ошибка получения отчета.");
  }
}
async function getCompletionsCount() {
  try {
    const [
      totalCompletions,
      checkCompletions,
      approvedCompletions,
      deniedCompletions,
    ] = await Promise.all([
      TaskCompletion.count(),
      TaskCompletion.count({ where: { status: reply.status.onCheck } }),
      TaskCompletion.count({ where: { status: reply.status.onApproved } }),
      TaskCompletion.count({ where: { status: reply.status.onDenied } }),
    ]);
    return {
      totalCompletions,
      checkCompletions,
      approvedCompletions,
      deniedCompletions,
    };
  } catch (error) {
    throw new Error("Ошибка получения количества отчетов с параметрами.");
  }
}
async function getCompletionsByStatus(status) {
  try {
    const completion = await TaskCompletion.findAll({
      where: { status },
      include: [{ model: Task }, { model: User }],
    });
    return completion;
  } catch (error) {
    throw new Error("Ошибка получения отчетов по статусу.");
  }
}
async function getCompletionsByUserID(userId) {
  try {
    const taskCompletions = await TaskCompletion.findAll({
      where: { userId },
      include: { model: Task },
    });
    return taskCompletions;
  } catch (error) {
    throw new Error("Ошибка получения отчетов пользователя.");
  }
}
async function getCompletionByUserTaskID(userId, taskId) {
  try {
    const completion = await TaskCompletion.findOne({
      where: { userId, taskId },
      include: { model: Task },
    });
    return completion;
  } catch (error) {
    throw new Error(
      "Ошибка получения отчета пользователя по выбранной задаче."
    );
  }
}

// Content completion operations
async function addTextReport(id, reportText) {
  try {
    const updatedTaskCompletion = await TaskCompletion.update(
      { reportText },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Ошибка добавления текстового контента к отчету.");
  }
}
async function addPhotoReport(id, reportPhoto) {
  try {
    const updatedTaskCompletion = await TaskCompletion.update(
      { reportPhoto },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Ошибка добавления фото-контента к отчету.");
  }
}

module.exports = {
  getTask,
  createTask,
  updateTaskById,
  getAllTasksByDepartmentId,
  getCompletion,
  getCompletionsByUserID,
  getCompletionByUserTaskID,
  getCompletionsByStatus,
  createCompletion,
  updateCompletionStatus,
  addTextReport,
  addPhotoReport,
  getCompletionsCount,
};
