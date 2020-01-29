var express = require('express');
var router = express.Router();
var redis = require('redis')
var redisClient = redis.createClient({
  host:"127.0.0.1",
  port:6379
  
});
redisClient.on('error', function(err){
  console.log('Error '+err);
});

/* GET home page. */
router.get('/', function(req, res, next) {
  // redisClient.get("LOGIN", (err, result)=>{
  //   console.log(result)
  // });
  res.render('index.html');
});

module.exports = router;
