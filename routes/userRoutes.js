module.exports = app => {
  app.get(
    '/api/token', (req, res) => {
      res.send(req.session.token);
    }
  );

  app.get(
      '/api/user', (req, res) => {
        res.json(req.user);
      }
  );

}