const playlistActions = require('../logic/createPlaylist.js');

module.exports = app => {
  app.post('/api/create_playlist', async (req, res) => {
    try{
      await playlistActions.createPlaylist(req.session.passport.accessToken, req.body.info.mood, req.body.info.name, req.body.info.userId);
    }
    catch(err) {
      // if user is logged in and something went wrong, then that means mood is not found
      if(req.user) {
        res.status(400);
        res.end()
      }
      else{
        res.status(403);
        res.end();
      }
    }
    res.end();
  })
}

