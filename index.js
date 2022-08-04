var server = require("./server");
// var cluster = require('cluster')
var express = require('express');
var iconv= require('iconv-lite');
var app = express();
app.use(express.static('books'))
app.listen(3031,()=>{
  console.log('服务器启动成功');
  });

server.start();

