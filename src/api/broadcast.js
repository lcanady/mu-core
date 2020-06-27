module.exports = (mu) => {
  return {
    to: (ids, message) => mu.ipc.of.ursamu.emit("send", { ids, message }),
    acct: (id, message) => mu.ipc.of.ursamu.emit("socket", { id, message }),
    broadcast: (message) => mu.ipc.of.ursamu.emit("broadcast", message),
  };
};
