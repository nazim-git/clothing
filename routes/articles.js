const express = require('express');
const fs = require('fs');
const path = require('path');

const crypto = require('crypto') 
const router = express.Router();
const dirPath = path.join(__dirname, '/../files/article.json');
var Validator = require('jsonschema').Validator;
var v = new Validator();

var articleSchema = { "type": "object",
  "properties": {
    "title": {
      "type": "string"
    },
    "author": {
      "type": "string",
    },
    "body": {
      "type": "string"
    }
  },
  "required": ["title", "author"]
}


function readAllAritcles(){
  let rawdata = fs.readFileSync(dirPath);
  return JSON.parse(rawdata);
}

function GetArticleByID(id){
  /// console.log(id);

  let rawdata = fs.readFileSync(dirPath);
  var articles = JSON.parse(rawdata);
  // console.log(articles)

  let selectedArticle = null;
  for (let key in articles) {
      if (articles[key].id == id) 
      {
          selectedArticle = articles[key];
          break;
      }
  }

  return selectedArticle;
}

function saveArticleJson(updatedJson)
{
    fs.writeFile(dirPath, updatedJson, (err) => { 
      if (err){ 
          console.log(err); 
          return res.status(500).send(err);
      }
      else { 
          console.log("File written successfully\n"); 
          console.log("The written has the following contents:"); 
          /// console.log(fs.readFileSync(dirPath, "utf8")); 
      } 
  }); 
}

// new article form
router.get('/add', function(req, res){
  res.render('add_article', {
    title: 'Add Article'
  });
});

// submit new article 
router.post('/add', function(req, res){
  // Express validator
  req.checkBody('title', 'Title is required').notEmpty();
  req.checkBody('author', 'Author is required').notEmpty();
  req.checkBody('body', 'Body is required').notEmpty();
  
  // Get errors
  let errors = req.validationErrors();

  if(errors){
    res.render('add_article', {
      title: 'Add Article',
      errors: errors
    });
  } else {
    let article = {};
    article.id = crypto.randomBytes(8).toString('hex');
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    var response = v.validate(article, articleSchema);
    //console.log(res.errors)
    if(response.valid){
      console.log("valid schema")
      var articlesData = readAllAritcles();
      articlesData.push(article);                
      var updatedJson = JSON.stringify(articlesData);
      saveArticleJson(updatedJson);
    }
    else {
      console.log(response.errors)
      return res.status(400).send("Json is not valid as per schema"+response.errors);
    }
    res.redirect('/');
  }
});

// load edit form
router.get('/edit/:id', function(req, res){
  res.render('edit_article', {
    title: 'Edit Article',
    article:   GetArticleByID(req.params.id)
  });  
});

// update submit new article 
router.post('/edit/:id', function(req, res){
  let article = {};
  article.id = req.params.id;
  article.title = req.body.title;
  article.author = req.body.author;
  article.body = req.body.body;
   
  var response = v.validate(article, articleSchema);
  //console.log(res.errors)
  if(response.valid){
    console.log("valid schema")
    var articles = readAllAritcles();
    for (var i=0; i<articles.length; i++) {          
      if (articles[i].id == article.id) { 
        articles[i].title = article.title;
        articles[i].author = article.author;
        articles[i].body = article.body;
  
        var updatedJson = JSON.stringify(articles);
        saveArticleJson(updatedJson);
        break;
      }
    }
  } else {
    console.log(response.errors)
    return res.status(400).send("Json is not valid as per schema"+response.errors);  
  }

  res.redirect('/');
});

// Delete post
router.get('/delete/:id', function(req, res){
  var articles = readAllAritcles();
  let articleId = req.params.id;       

  for (let key in articles) {
    if (articles[key].id == articleId) {
        articles.splice(key,1);
        var updatedJson = JSON.stringify(articles);
        saveArticleJson(updatedJson);
        break;
    }
  }

  res.redirect('/');

});

// get single article
router.get('/:id', function(req, res){
  // console.log(req.params.id)
  var articleId = req.params.id;
  console.log("sfdsf");
  var selectedArticle = GetArticleByID(articleId);

  console.log(selectedArticle)
  res.render('article', {
        article: selectedArticle
  });
});

module.exports = router;