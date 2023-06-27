const passport = require('passport');
const bcrypt = require('bcrypt');

module.exports = function(app, myDataBase) {

  app.route('/').get((req, res) => {
    res.render('index', {
      title: "Connected to Database",
      message: "Please log in",
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true,
    });
  });

  app.post('/register', async (req, res, next) => {
    try {
      const user = await myDataBase.findOne({ username: req.body.username });
      if (user) res.redirect('/');
      else {
        try {
          const hash = bcrypt.hashSync(req.body.password, 12);

          const doc = await myDataBase.insertOne({
            username: req.body.username,
            password: hash,
          });
          return next(null, doc.ops[0]);
        } catch (err) {
          return res.redirect('/');
        }
      }
    } catch (err) {
      next(err);
    }
  },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile');
  });

  app.get('/auth/github', passport.authenticate('github'));

  app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
    req.session.user_id = req.user.id;
    res.redirect('/chat');
  });

  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render('profile', { username: req.user.username });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.get('/chat', ensureAuthenticated, (req, res) => {
    res.render('chat', { user: req.user });
  });

  app.use((req, res, next) => {
    res.status(404).type('text').send('Not found');
  });
}

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
};
