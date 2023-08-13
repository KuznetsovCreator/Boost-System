function createBtn(name, callback) {
  return {
    reply_markup: {
      inline_keyboard: [[{ text: name, callback_data: callback }]],
    },
  };
}
function createKeyboard(name, callback, name2, callback2) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: name, callback_data: callback },
          { text: name2, callback_data: callback2 },
        ],
      ],
    },
  };
}
function createVerticalKeyboard(name, callback, name2, callback2) {
  return {
    reply_markup: {
      inline_keyboard: [
        [{ text: name, callback_data: callback }],
        [{ text: name2, callback_data: callback2 }],
      ],
    },
  };
}
function createHeader(title, description, spaceMode = true) {
  if (spaceMode) {
    return `<b>${title}</b>\n\n${description || ""}`;
  } else {
    return `<b>${title}</b>\n${description || ""}`;
  }
}

module.exports = {
  createBtn,
  createKeyboard,
  createVerticalKeyboard,
  createHeader,
};
