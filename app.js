const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');

const dirPath = path.join(__dirname, '/files/article.json');
console.log(dirPath);

const readAllAritcles =  function(){
  let rawdata = fs.readFileSync(dirPath);
  return JSON.parse(rawdata);
}

const app = express();

// View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Body Parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

// Express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.get('/', function (req, res) {
  var articleArray = readAllAritcles();
 
  res.render('index', {
    title: 'Articles', 
    articles: articleArray
  });

});

// Route Files
let articles = require('./routes/articles');
// Any routes that goes to '/articles' will go to the 'articles.js' file in route
app.use('/articles', articles);

app.listen(3000, function(){
  console.log(`Server started on port 3000`);
})
