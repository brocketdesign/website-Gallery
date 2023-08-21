var express = require('express');
const axios = require('axios');
let router = express.Router();
const http = require('http');
const https = require('https');
const pornPics = require('../modules/image')
const initData = require('../modules/initData')
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config({ path: './.env' });
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: true })


router.get('/',async (req,res) => {
  const db = req.app.locals.db;
  const initDataVal = await initData(db)
  res.redirect('/search/')
})
router.get('/setting',async (req,res) => {
  res.redirect('/settings/')
})
router.get('/settings',urlencodedParser, async (req,res) => {
  const db = req.app.locals.db;
  const initDataVal = await initData(db)
  let settings = await db.collection('settings').find({}).toArray()
  let dataImage = await db.collection('dataImage').find({}).toArray()
  res.render('settings',{title:'Settings',initDataVal:initDataVal,settings:settings,dataImage:dataImage,searchmode:'image'})

 })
router.get('/category', async (req,res) => {
  const db = req.app.locals.db;
  const initDataVal = await initData(db)
  var c_ = false; try{ c_ = req.cookies.isPorn;  if((c_==undefined)||(c_=='false')){ c_ = false } }catch(e){console.log(e)}
  if(true){
    let myCollection = db.collection('categories')
    myCollection.find().toArray((err, results) => {
      results = results[0]
      res.status(200).render('category',{
        jav : results.jav,
        channel: results.channel,
        babes : results.babes,
        pornstars : results.pornstars,
        categories : results.categories,
        isPorn:c_,initDataVal:initDataVal
      });
    });
  }else{
    res.render('safe',{title:'All the porn in one',searchmode:'video',isPorn:c_,initDataVal:initDataVal})
  }

})
router.get('/favorite',async (req,res) => {
  res.redirect('/favorites/')
})
router.get('/favorites/', async function(req, res) {
  const db = req.app.locals.db;
  let extractors = await db.collection('ranking').find({}).toArray();
  try{
    extractors = extractors[0].extractor
  }catch{}
  res.render('history',{title:'favorites',extractors:extractors,collection:'favoriteImage',searchmode:'image'})
});
router.get('/history/', async function(req, res) {
  const db = req.app.locals.db;
  let extractors = await db.collection('ranking').find({}).toArray();
  try{
    extractors = extractors[0].extractor
  }catch{}
  res.render('history',{title:'history',extractors:extractors,collection:'favoriteImage',searchmode:'image'})
});
router.get('/search', urlencodedParser, async function (req, res) {
  const db = req.app.locals.db;
  let extractors = await db.collection('ranking').find({}).toArray();
  try{
    extractors = extractors[0].extractor
  }catch{}
  let values = await db.collection('ranking').find({}).toArray();
  try{
    values = values[0].value
  }catch{}
  let ranking = {}
  let searchmode = req.query.searchmode || 'image'
  let keyword = req.query.keyword
  let data = await db.collection('dataImage').find({}).sort({_id:-1}).toArray();
  let settings = await db.collection('settings').find({}).toArray();
  extractors.forEach((element,index) => {
    ranking[element] = values[index]
  });


    if(keyword==undefined){keyword='false'}
    info={viewDate:new Date().toLocaleString(),keyword:keyword,searchmode:searchmode}
    db.collection('history-search').insertOne(info)
    res.render('search', {title:searchmode.toUpperCase()+' - Search for '+keyword,query:keyword,ranking:ranking,settings:settings,searchmode:searchmode,data:data});

});
router.get('/_history',async function(req, res) {
  const db = req.app.locals.db;
  const initDataVal = await initData(db)
  var c_ = false; try{ c_ = req.cookies.isPorn;  if((c_==undefined)||(c_=='false')){ c_ = false } }catch(e){console.log(e)}
  if(c_){
    db.collection('history').find({}).sort({"_id":-1}).toArray(function(err, videos) {
      if(err) { console.error(err) }
      let videosH = []
      videos.forEach(element => {
        if( (element.thumbnails != undefined)   ){
          videosH.push(element)
        }
      });
      db.collection('history-search').find({}).sort({"_id":-1}).toArray(function(err, search) {
        if(err) { console.error(err) }
        res.render('history',{title:'Search and view history',isPorn:c_,initDataVal:initDataVal,videos :videosH,searchs :search,searchmode:'video'})
      })
    })
  }else{
    res.render('safe',{title:'All the porn in one',searchmode:'video',isPorn:c_,initDataVal:initDataVal})
  }

});


module.exports = router;
