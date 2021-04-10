exports.show = async (req, res, next) => {
  res.json({
    user: {
      name: req.headers.username,
      groups: req.headers.usergroups && req.headers.usergroups.split(","),
      displayName: req.headers.displayname
    }
  });
};
