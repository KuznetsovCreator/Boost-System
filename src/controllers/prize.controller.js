const { Prize, PrizeRequest } = require("../database/db.models");
const reply = require("../utils/text.util");

// PRIZES
// Create & Update
async function createPrize(name, description, cost, category) {
  try {
    const prize = await Prize.create({
      name,
      description,
      cost,
      category,
    });
    return prize;
  } catch (error) {
    throw new Error("Ошибка создания приза.");
  }
}
async function updatePrize(id, name, description, cost, category) {
  try {
    const updatedPrize = await Prize.update(
      {
        name,
        description,
        cost,
        category,
      },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedPrize;
  } catch (error) {
    throw new Error("Ошибка обновления приза.");
  }
}

// Read
async function getPrize(id) {
  try {
    const prize = await Prize.findOne({
      where: { id },
    });
    return prize;
  } catch (error) {
    throw new Error("Ошибка получения приза.");
  }
}
async function getAllPrizesByCategoryId(category) {
  try {
    const prizes = await Prize.findAll({
      where: { category },
    });
    return prizes;
  } catch (error) {
    throw new Error("Ошибка получения призов по ID категории.");
  }
}

// PRIZE REQUESTS
// Create & Update
async function createRequest(status, userId, prizeId) {
  try {
    const prizeRequest = await PrizeRequest.create({
      status,
      userId,
      prizeId,
    });
    return prizeRequest;
  } catch (error) {
    throw new Error("Ошибка создания заявки на приз.");
  }
}
async function updateRequestStatus(id, newStatus) {
  try {
    const updatedPrizeRequest = await PrizeRequest.update(
      { status: newStatus },
      {
        where: { id },
        returning: true,
      }
    );
    return updatedPrizeRequest;
  } catch (error) {
    throw new Error("Ошибка обновления заявки.");
  }
}

// Read
async function getRequest(id) {
  try {
    const prizeRequest = await PrizeRequest.findOne({ where: { id } });

    if (!prizeRequest) {
      throw new Error("Prize request with the specified ID not found.");
    }

    return prizeRequest;
  } catch (error) {
    throw new Error("Ошибка получения заявки.");
  }
}
async function getRequestsCount() {
  try {
    const [totalRequests, checkRequests, approvedRequests, deniedRequests] =
      await Promise.all([
        PrizeRequest.count(),
        PrizeRequest.count({ where: { status: reply.status.onCheck } }),
        PrizeRequest.count({ where: { status: reply.status.onApproved } }),
        PrizeRequest.count({ where: { status: reply.status.onDenied } }),
      ]);
    return {
      totalRequests,
      checkRequests,
      approvedRequests,
      deniedRequests,
    };
  } catch (error) {
    throw new Error("Ошибка получения количества отчетов с параметрами.");
  }
}
async function getRequestsByUserID(userId) {
  try {
    const prizeRequests = await PrizeRequest.findAll({
      where: { userId },
      include: { model: Prize },
    });
    return prizeRequests;
  } catch (error) {
    throw new Error("Ошибка получения заявок пользователя.");
  }
}
async function getRequestByUserPrizeID(userId, prizeId) {
  try {
    const request = await PrizeRequest.findOne({
      where: { userId, prizeId },
      include: { model: Prize },
    });
    return request;
  } catch (error) {
    throw new Error(
      "Ошибка получения заявки пользователя по выбранному призу."
    );
  }
}

module.exports = {
  getPrize,
  createPrize,
  updatePrize,
  getAllPrizesByCategoryId,
  getRequest,
  getRequestByUserPrizeID,
  getRequestsByUserID,
  createRequest,
  getRequestsCount,
  updateRequestStatus,
};
