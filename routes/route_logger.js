const Status = Object.freeze({
  SUCCESS: "УСПІХ",
  ERROR: "ПОМИЛКА",
});

function log(res, status, message) {
  if (status == Status.ERROR) {
    res = res.status(500);
  }

  res.send("[" + status + "] " + message);
}

module.exports = {
  log: log,
  Status: Status,
};
