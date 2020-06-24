module.exports = (mu) => {
  return {
    to: (list, msg) => {
      mu.ipc.of.ursamu.emit(
        "broadcast",
        JSON.stringify({
          ids: list,
          message: msg,
        })
      );
    },
  };
};
