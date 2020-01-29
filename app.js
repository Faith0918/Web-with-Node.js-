var createError = require('http-errors');
var express = require('express');

var redis = require('redis')
var redisClient = redis.createClient({
  host:"127.0.0.1",
  port:6379
  
});
redisClient.on('error', function(err){
  console.log('Error '+err);
});

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var bodyParser = require('body-parser')


var app = express();
app.locals.pretty=true;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('views','./views');
app.engine('html',require('ejs').renderFile);
app.get('/template', function(req, res){
  res.render('temp', {time:Date(), _title:'Jade'});
});
app.get('/form', function(req, res){
  res.render('form');
});
app.post('/form_receiver',function(req, res){
  var id = req.body.value;
  var pw = req.body.value;
  res.send(id+','+pw);
});
app.get('/form_receiver', function(req,res){
  res.send('form_reciever');
});


app.use(express.static('public'));

app.post('/login', function(req, res){
  console.log("id :", req.body.ID);
  console.log("pw :", req.body.InputPassword);
  var id = req.body.ID;
  var pw = req.body.InputPassword;
  redisClient.GET(id, function(err, value){
    
    if(value==pw){
      res.send({result:"login success!"});
      return;
    }else{
      res.send({result:"login failed!"});
      return;
    }
  })
  // res.send("<h1>Login<h1>"+"id:"+id+" pw:"+pw);
})
app.post('/signin', function(req, res){

  var id = req.body.id;
  var pw = req.body.pw;
  var user = {ID:id, PW:pw};
  console.log("id :", id);
  console.log("pw :", pw);
  redisClient.EXISTS(id, function(err, value) {
    if(value==0){
      // redisClient.hmset(id, JSON.stringify(user), err=>{});
      // console.log(JSON.parse(user));
      redisClient.set(id, pw, function(err, value){
        if(value=="OK"){
          
          console.log("OK"+redisClient.get(id));
          res.send("<h1>Sign in<h1>"+"Welcome, "+id+"!");
          return;
        }
      })
      
    }else{
      res.send("<h1>Sign in<h1>"+"Failed!");
      return;
    }
    console.log(value)
    console.log(err);
    var result = id+value+err;
    console.log(result);
    
  }); 
});

app.post('/checkId', function(req, res){
  
  var id = req.body.data;
  console.log(req.body.data);
  redisClient.EXISTS(id, function(err, value) {
    if(value){
      res.send({result:"Can't use this id"});
      return;
    }else{
      res.send({result:"Can use this id"});
      return;
    }
    console.log(value)
    console.log(err);
    var result = id+value+err;
    console.log(result);
    
  });
  
});
app.get('/form', function(req,res){
  res.render('form');
});
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/users', usersRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
