const { Task, TaskCompletion } = require("../database/db.models");

// Tasks
async function getTask(id) {
  try {
    const task = await Task.findOne({ where: { id } });

    if (!task) {
      throw new Error("Task with the specified ID not found.");
    }

    return task;
  } catch (error) {
    throw new Error("Failed to get the task by the specified ID.");
  }
}
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
    throw new Error("Failed to create a task.");
  }
}
async function updateTaskById(id, name, description, cost, departmentId) {
  try {
    const [rowsUpdated, [updatedTask]] = await Task.update(
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

    if (rowsUpdated !== 1) {
      throw new Error("Task not found or update failed.");
    }

    return updatedTask;
  } catch (error) {
    throw new Error("Failed to update the task.");
  }
}
async function deleteTaskById(id) {
  try {
    const deletedTaskCount = await Task.destroy({ where: { id } });

    if (deletedTaskCount === 0) {
      throw new Error("Task not found or deletion failed.");
    }
  } catch (error) {
    throw new Error("Failed to delete the task.");
  }
}
async function getAllTasksByDepartmentId(departmentId) {
  try {
    const tasks = await Task.findAll({
      where: { departmentId },
    });
    return tasks;
  } catch (error) {
    throw new Error(
      "Failed to get the list of tasks for the specified department."
    );
  }
}

// TaskCompletions
async function getCompletion(id) {
  try {
    const taskCompletion = await taskCompletion.findOne({ where: { id } });

    if (!taskCompletion) {
      throw new Error("Task completion with the specified ID not found.");
    }

    return taskCompletion;
  } catch (error) {
    throw new Error("Failed to get task completion by ID.");
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
    throw new Error("Failed to get task completions for the specified user.");
  }
}
async function getCompletionsByTaskID(taskId) {
  try {
    const taskCompletions = await TaskCompletion.findAll({ where: { taskId } });
    return taskCompletions;
  } catch (error) {
    throw new Error("Failed to get task completions for the specified task.");
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
    throw new Error("Failed to get completion by user and task ID.");
  }
}
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
    throw new Error("Failed to create task completion.");
  }
}
async function updateCompletion(id, status) {
  try {
    const [rowsUpdated, [updatedTaskCompletion]] = await TaskCompletion.update(
      { status },
      {
        where: { id },
        returning: true,
      }
    );

    if (rowsUpdated !== 1) {
      throw new Error("Task completion not found or update failed.");
    }

    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Failed to update task completion status.");
  }
}
async function addTextReport(id, reportText) {
  try {
    const [rowsUpdated, [updatedTaskCompletion]] = await TaskCompletion.update(
      { reportText },
      {
        where: { id },
        returning: true,
      }
    );

    if (rowsUpdated !== 1) {
      throw new Error("Task completion not found or update failed.");
    }

    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Failed to update task completion status.");
  }
}
async function addPhotoReport(id, reportPhoto) {
  try {
    const [rowsUpdated, [updatedTaskCompletion]] = await TaskCompletion.update(
      { reportPhoto },
      {
        where: { id },
        returning: true,
      }
    );

    if (rowsUpdated !== 1) {
      throw new Error("Task completion not found or update failed.");
    }

    return updatedTaskCompletion;
  } catch (error) {
    throw new Error("Failed to update task completion status.");
  }
}
async function deleteCompletion(id) {
  try {
    const deletedTaskCompletionCount = await TaskCompletion.destroy({
      where: { id },
    });

    if (deletedTaskCompletionCount === 0) {
      throw new Error("Task completion not found or deletion failed.");
    }
  } catch (error) {
    throw new Error("Failed to delete task completion.");
  }
}

module.exports = {
  getTask,
  createTask,
  updateTaskById,
  deleteTaskById,
  getAllTasksByDepartmentId,
  getCompletion,
  getCompletionsByUserID,
  getCompletionsByTaskID,
  getCompletionByUserTaskID,
  createCompletion,
  updateCompletion,
  addTextReport,
  addPhotoReport,
  deleteCompletion,
};
