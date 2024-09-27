// Wrap our routes and captures any errors and passes into next()
const wrapAsync = (fn) => {
  return function (req, res, next) {
    fn(req, res, next).catch((e) => next(e));
  };
};

module.exports = wrapAsync