const { v4: uuid } = require("uuid");
module.exports = class MessageStore {
  constructor() {
    this.messages = {};
  }

  addMessages(body) {
    const id = uuid();
    this.messages[id] = { ...body, delivered: null, seen: null, id: id };
    return this.messages[id];
  }

  notify(id, seen = false) {
    const time = Date.now();
    if (seen) {
      this.messages[id] = {
        ...this.messages[id],
        delivered: time,
        seen: time,
      };
    } else {
      this.messages[id] = { ...this.messages[id], delivered: time };
    }
    return this.messages[id];
  }

  getMessages(from, to) {
    const time = Date.now();
    const messages = [];
    Object.entries(this.messages).forEach(([key, value]) => {
      if (value["from"] === to && value["to"] === from) {
        value.seen = value.seen || time;
        value.delivered = value.delivered || time;
        this.messages[key] = {
          ...value,
        };
        messages.push(this.messages[key]);
      }
      if (value["from"] === from && value["to"] === to) {
        messages.push(this.messages[key]);
      }
    });
    return messages;
  }
};
