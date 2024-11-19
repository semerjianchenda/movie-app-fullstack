module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function (req, res) {
      db.collection('movies').find().toArray((err, result) => {
        if (err) return console.error(err);
        res.render('profile.ejs', {
          user: req.user,
          movies: result, // Correctly pass `movies` here
        });
      });
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout(() => {
          console.log('User has logged out!')
        });
        res.redirect('/');
    });

// message board routes ===============================================================

//api
app.get('/search', async (req, res) => {
  const query = req.query.title;
  const apiKey = 'be0a9e445bfb15156b0003a0505817ed'; 
  
  console.log(`Received search query: ${query}`); 


  if (!query) {
      return res.status(400).json({ error: 'No query provided' });
  }

  try {
      const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(query)}`);
      const data = await response.json();
      res.json(data.results);
  } catch (error) {
      console.error('Error fetching data from API:', error);
      res.status(500).json({ error: 'Failed to fetch data' });
  }
});


// Add a movie
app.post('/movies', (req, res) => {
  const { movie, rating } = req.body;
  db.collection('movies').insertOne({ movie: movie, rating: rating }, (err, result) => {
    if (err) return console.error(err);
    console.log("Movie added!");
    res.redirect('/profile');
  });
});

// Edit a movie
app.put('/movies', (req, res) => {
  const { oldItem, newItem } = req.body;
  // Update the movie in the database
  db.collection('movies').updateOne(
    { movie: oldItem },  // Find the movie by its old name
    { $set: { movie: newItem } }, // Set the new movie name
    (err, result) => {
      if (err) return res.status(500).send('Failed to update movie');
      res.status(200).send('Movie updated successfully');
    }
  );
});

// Delete a movie
app.delete('/movies', (req, res) => {
  const { movie } = req.body;
  db.collection('movies').findOneAndDelete({ movie: movie }, (err, result) => {
    if (err) return res.status(500).send(err);
    console.log("Movie deleted!");
    res.send("Movie deleted successfully!");
  });
});

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
