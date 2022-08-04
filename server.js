var http = require("http");
var https = require("https");
var url = require("url");
var fs  = require("fs");
var cheerio = require('cheerio');
var events = require('events');
var iconv= require('iconv-lite');

var json={};

var rt=0;

const _Servername='localhost:3031';
let sharedBuf = new SharedArrayBuffer(4);
let sharedArr = new Int32Array(sharedBuf);
function sleep(u)
{
  
  Atomics.wait(sharedArr, 0, 0, u);
}

var name='';

var base='';

var cg=0;

var allres;

var eventEmitter=new events.EventEmitter();

function pj(){
  console.log(name,all);
  if(name=='') return;
  fs.copyFileSync('books/1.txt','books/'+name+'.txt');
  console.log('copy file succeed');
  fs.unlink('books/1.txt',(err)=>true)
  for(i=2;i<=all;i++){
    try{
   let content = fs.readFileSync('books/'+i+'.txt', 'utf-8')
    fs.appendFileSync('books/'+name+'.txt', content);
    fs.unlinkSync('books/'+i+'.txt');
    console.log(i)
    }catch(err)
    {
      download('books/'+i+'.txt',json.ret[i-1].link,json.ret[i-1].title)
      while(1)
      {
        try{
          accessSync('books/'+name+'.txt', constants.F_OK)
          let content = fs.readFileSync('books/'+i+'.txt', 'utf-8')
          fs.appendFileSync('books/'+name+'.txt', content);
          fs.unlinkSync('books/'+i+'.txt');
          console.log(i)
        }catch(err)
        {

        }
      }
    }
}
allres.write(`<a href="${_Servername}/${name}.txt" download="${name}.txt">${_Servername}/${name}.txt</a>`)
allres.end();
console.log('Done'+name+all+cg)
name='';
all=0;
cg=0;
i=0;
  

}

function Cset($)
{
  if($('meta[charset]').length>0)
    return $('meta[charset]').attr('charset')
  return 'gb18030'
}


function getCatalog(str)
{
  var ret=[];
  var timeEvent;
  console.log(str+"wqsqwd")
  //发送请求并接受数据
  var req=https.get(str,(res)=>{
    
    if(res.statusCode!=200)
    {
      console.log("err"+res.statusCode);
      res.resume();
      return;
    }

    var data=[];
    res.on('data', function(dat) {
      data .push(dat) ;
      console.log("2323424234234af")
    });
  //解析数据
    res.on('end', function() {

      html=iconv.decode(Buffer.concat(data), 'gb18030');
      var $=cheerio.load(html);
      html=iconv.decode(Buffer.concat(data), Cset($));
      var $=cheerio.load(html);
      var obj={base:{base:str,name:$('#info h1').text().replace(/\s+/g,'')},ret:[]};
      var {ret}=obj;

      $('dl').find("a").each((i,ele)=>{
        var link=$(ele).attr('href');
        var title=$(ele).text().replace(/\s+/g,' ')
        ret.push({link,title});
        console.log(ret[i]);
      });
      console.log(obj.base);
      clearTimeout(timeEvent)
      sendT2(JSON.stringify(obj).replace(/"/g,'\''));
      console.log(JSON.stringify(obj))
    });

    
  })

  req.on("error",(err)=>{
    clearTimeout(timeEvent)
    req.abort();
  })
  timeEvent = setTimeout(function(){
    clearTimeout(timeEvent)
    req.abort();
  }, 10000);
  
}

eventEmitter.on('/parse', function(request, response){
    allres=response;
    response.writeHead(200, {"Content-Type": "text/html;charset=utf-8"});
    var pathname = '/parse';
    console.log("Request for " + pathname + " received.");

    var query=url.parse(request.url,true).query;
    if(query["url"]){
      console.log("1");
      var str=query["url"];
      getCatalog(str);
      console.log("233333333333333333333333333333");
      // send(200,str,response);
    }
    else
    {
      sendTemplate(response);
    }
    console.log("end");
  });


function write(file,str)
{
  fs.writeFile(file, str,{
    flag:'wx'
  } ,
  function(err) {
    cg++;
    if(cg>=all)
    {
      pj()
    }
    if (err) {
        return console.error(err);
    }
    console.log("数据写入成功！"+file+' '+cg+'/'+all);
    // allres.write("数据写入成功！"+file+' '+cg+'/'+all);
    
  })
}

cnt=0;
function download(file,str,title,times=0)
{
  if(times>=1&&(rt%500==1)) {
    // allres.write('died'+title)
    console.log('died'+title)
    sleep(3000);
    
  }
  console.log("Ding>>"+title)
  var ret=[];
  var timeEvent;

  var req=https.get(str,(res)=>{
    
    if(res.statusCode!=200)
    {
      clearTimeout(timeEvent)
      console.log("err"+res.statusCode);
      setTimeout(()=>{
        rt=1;console.log('=1,186')
        download(file,str,title,times+1)
      },1000)
      res.resume();
      return;
    }

    var data=[];
    res.on('data', function(dat) {
      data .push(dat);
      console.log("reading!"+title)
    });
  //解析数据
    res.on('end', function() {
      clearTimeout(timeEvent)
      html=iconv.decode(Buffer.concat(data), 'gb18030');
      var $=cheerio.load(html);
      html=iconv.decode(Buffer.concat(data), Cset($));
      var $=cheerio.load(html);

      write(file,'\n '+title+' \n'+$('#content').text().replace(/<br>/g,'\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,'').replace(/[ \n]+/g,'\n').replace(/[ ]+/g,''))

      
    });
  console.log(title);
    
  })
  

  req.on("error",(err)=>{
    clearTimeout(timeEvent)
    if(err.code==-4075)
      return;
    console.log("err"+err+title);
    req.abort();
    console.log("retry..."+title);
      setTimeout(()=>{
        rt+=1
        console.log('=1,224')
        download(file,str,title,times+1)
      },1000)
  })
  timeEvent = setTimeout(function(){
    clearTimeout(timeEvent)
    console.log("errTimeOut"+title);
    req.emit('err');
    req.abort();
      setTimeout(()=>{
        rt+=1;console.log('=1,234')
        download(file,str,title,times+1)
      },1000)
  }, 20000);
}

eventEmitter.on('/down', function(req, response){
  allres=response;
  response.writeHead(200, {'Content-Type': 'text/html;charset=utf-8'});
  var dat='';
  // 接收到数据消息
  req.on('data',(chunk)=>{
    dat+=chunk;
  })
  req.on('jump',()=>{
    req.abort();
  })
  
  req.on('end', function(){  
    // var file=fs.openSync(name,'a');
    console.log(dat); 
    dat= dat.slice(5)
    dat=dat.replace(/%3D/gi,'=')
  // 在end事件触发后，通过querystring.parse将post解析为真正的POST请求格式，然后向客户端返回。
    console.log('Done!!!!!!!!!!'); 
    console.log(dat); 
    console.log('Done!!!!!!!!!!1'); 
    dat=atob(dat);
    console.log(dat); 
    dat=decodeURI(dat);
    console.log(dat); 
    
    console.log(dat); 
    // console.log(dat);  
      // post = querystring.parse(post);
      json=JSON.parse(dat);
      name=json.base.base.name;
      name=name.replace(/\s/g,'')
      console.log('CSS!')
      all=json.ret.length;
      try {
        accessSync('books/'+name+'.txt', constants.F_OK);
        allres.end(`已有！<a href="${_Servername}/${name}.txt" download="${name}.txt">${_Servername}/${name}.txt</a>`);
        req.emit('jump')
        return;
      } catch (err) {
        console.log('no access!');
      }
      console.log(name,all); 
      // var u=url.parse(req.url);
      base=json.base.base.base;
      for(var i=0,l=json.ret.length;i<l;i++){
            console.log(json.ret[i])
            var link=url.resolve(base,json.ret[i].link);
            console.log(link)
            console.log()
            var file='books/'+(i+1)+'.txt';
            var title=json.ret[i].title;
            download(file,link,title);  
        }
        // console.log(json); 
      // fs.closeSync(file);
  });
  

});


eventEmitter.on('404', function(method, response){
  response.writeHead(404, {'Content-Type': 'text/html;charset=utf-8'});
  response.end('404\n');
});
function start() {
  function onRequest(request, response) {//分发
    console.log(':'+name+(name!=''))
    if(name!='')
    {
      response.end(`h::${name}`)
      return;
    }


    var pathname=url.parse(request.url).pathname;
    if (eventEmitter.listenerCount(pathname) > 0){
      console.log("GO")
      eventEmitter.emit(pathname, request, response);
    }
    else {
      // eventEmitter.emit('404', request, response);
    }
  }
  http.createServer(onRequest).listen(8888);
  console.log("Server has started.");
}
function sendTemplate(response)
{
  return fs.readFile('./template.html',(err,data)=>{
    if(err) return "ERR: 0x000000b7 Unkowned Err";
    return send(200,data.toString(),response);
  });
}

function sendT2(str)
{
  return fs.readFile('./t2.html',(err,data)=>{
    if(err) return "ERR: 0x000000b7 Unkowned Err";
    return send(200,data.toString().replace(/<CATALOG\/>/,str),allres);
  });
}

function send(code,str,response)
{
  response.write(str);
  response.end();
}
exports.start = start;