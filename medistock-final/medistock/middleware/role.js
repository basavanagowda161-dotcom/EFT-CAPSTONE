module.exports = function (...roles) {
  return function (req, res, next) {
    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'You are not allowed to do this.' });
    }
  };
};