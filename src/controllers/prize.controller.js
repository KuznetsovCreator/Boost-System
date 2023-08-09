const { Prize, PrizeRequest } = require("../database/db.models");

// Prizes
async function getPrize(id) {
  try {
    const prize = await Prize.findOne({
      where: { id },
    });

    if (!prize) {
      throw new Error("Prize with the specified ID not found.");
    }

    return prize;
  } catch (error) {
    throw new Error("Failed to get prize by the specified ID.");
  }
}
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
    throw new Error("Failed to create prize.");
  }
}
async function updatePrize(id, name, description, cost, category) {
  try {
    const [rowsUpdated, [updatedPrize]] = await Prize.update(
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

    if (rowsUpdated !== 1) {
      throw new Error("Prize not found or update failed.");
    }

    return updatedPrize;
  } catch (error) {
    throw new Error("Failed to update prize.");
  }
}
async function deletePrize(id) {
  try {
    const prize = await Prize.findOne(id);
    if (!prize) {
      throw new Error("Prize not found");
    }
    await prize.destroy();
    return prize;
  } catch (error) {
    throw new Error("Failed to delete prize.");
  }
}
async function getAllPrizesByCategoryId(category) {
  try {
    const prizes = await Prize.findAll({
      where: { category },
    });
    return prizes;
  } catch (error) {
    throw new Error("Failed to get prizes by category.");
  }
}

// PrizeRequests
async function getRequest(id) {
  try {
    const prizeRequest = await PrizeRequest.findOne({ where: { id } });

    if (!prizeRequest) {
      throw new Error("Prize request with the specified ID not found.");
    }

    return prizeRequest;
  } catch (error) {
    throw new Error("Failed to get prize request by ID.");
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
    throw new Error("Failed to get prize requests by user ID.");
  }
}
async function getRequestsByPrizeID(prizeId) {
  try {
    const prizeRequests = await PrizeRequest.findAll({ where: { prizeId } });
    return prizeRequests;
  } catch (error) {
    throw new Error("Failed to get prize requests by prize ID.");
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
    throw new Error("Failed to get prize request by user ID and prize ID.");
  }
}
async function createRequest(status, userId, prizeId) {
  try {
    const prizeRequest = await PrizeRequest.create({
      status,
      userId,
      prizeId,
    });
    return prizeRequest;
  } catch (error) {
    throw new Error("Failed to create prize request.");
  }
}
async function updateRequestStatus(id, newStatus) {
  try {
    const [rowsUpdated, [updatedPrizeRequest]] = await PrizeRequest.update(
      { status: newStatus },
      {
        where: { id },
        returning: true,
      }
    );

    if (rowsUpdated !== 1) {
      throw new Error("Prize request not found or update failed.");
    }

    return updatedPrizeRequest;
  } catch (error) {
    throw new Error("Failed to update prize request status.");
  }
}
async function deletePrizeRequest(id) {
  try {
    const deletedPrizeRequestCount = await PrizeRequest.destroy({
      where: { id },
    });

    if (deletedPrizeRequestCount === 0) {
      throw new Error("Prize request not found or deletion failed.");
    }
  } catch (error) {
    throw new Error("Failed to delete prize request.");
  }
}
async function getAllPrizeRequests() {
  try {
    const prizeRequests = await PrizeRequest.findAll();
    return prizeRequests;
  } catch (error) {
    throw new Error("Failed to get all prize requests.");
  }
}

module.exports = {
  // Prize
  getPrize,
  createPrize,
  updatePrize,
  deletePrize,
  getAllPrizesByCategoryId,
  // Requests
  getRequest,
  getRequestByUserPrizeID,
  getRequestsByUserID,
  getRequestsByPrizeID,
  createRequest,
  updateRequestStatus,
  deletePrizeRequest,
  getAllPrizeRequests,
};
