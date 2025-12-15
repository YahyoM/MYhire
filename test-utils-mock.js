const act = (callback) => {
  const result = callback();
  if (result && typeof result.then === "function") {
    return result;
  }
  return result;
};

module.exports = { act };
