var express = require('express');
const axios = require('axios');
let router = express.Router();
const fs = require('fs');
const imageDownloader = require('../modules/imageDownloader');
const searchSubreddits = require('../modules/search.subreddits')
const pornPics = require('../modules/image')
const getFavicons = require('get-website-favicon')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config({ path: './.env' });

const bodyParser = require("body-parser");
var urlencodedParser = bodyParser.urlencoded({ extended: true })

router.get('/', function(req, res) {
  const db = req.app.locals.db;

  res.send('API V1.00')
});
router.get('/favorites', async function(req, res) {
  const db = req.app.locals.db;
  let _ext = req.query.extractor || false
  console.log({
    event:'API favorites',
    _ext:_ext
  })
  let result = await new Promise((resolve,reject)=>{
    //db.collection('allMedia').find({'isFavorite':{$exists: true} , 'gif':{ $exists: true } }).sort({'_id':1}).toArray(function(err, results) {
    db.collection('allMedia').find({'isFavorite':{$exists: true} }).sort({'_id':-1}).toArray(function(err, results) {
      if(_ext){
        results.forEach((item, i) => {
          if(item.extractor!=_ext){
            delete results[i]
          }
        });
      }
      resolve(results)
    })
  })
  res.send(result)
});
router.get('/history', async function(req, res) {
  const db = req.app.locals.db;
  let _ext = req.query.extractor || false
  console.log({
    event:'API history',
    _ext:_ext
  })
  let result = await new Promise((resolve,reject)=>{
    //db.collection('allMedia').find({'isFavorite':{$exists: true} , 'gif':{ $exists: true } }).sort({'_id':1}).toArray(function(err, results) {
    db.collection('allMedia').find({}).sort({'_id':-1}).toArray(function(err, results) {
      if(_ext){
        results.forEach((item, i) => {
          if(item.extractor!=_ext){
            delete results[i]
          }
        });
      }
      resolve(results)
    })
  })
  res.send(result)
});
router.get('/dlimg', async function(req, res) {
  const db = req.app.locals.db;
  let extractor
  try{
    let searchmode = req.query.searchmode
    extractor = req.query.extractor
  }catch(e){console.log(e)}

  console.log({
    event:'dlimg',
    do:req.query.do,
    imgurl:req.query.imgurl,
    searchmode:req.query.searchmode,
    extractor:extractor,
    dest:req.query.dest
  })
if((req.query.do=='true')){
  let path = './public/img/dl/'+req.query.imgurl.substring(req.query.imgurl.lastIndexOf('/')+1)
  let isExist = await new Promise((resolve,reject)=>{
    fs.stat(path, function(err, stat) {
      if(err == null) {
          console.log('File exists');
          resolve(true)
          res.send(path)
      } else if(err.code === 'ENOENT') {
          // file does not exist
          //fs.writeFile('log.txt', 'Some log\n');
          resolve(false)
      } else {
        resolve(false)
        console.log('Some other error: ', err.code);
      }
    });
  })
  if(!isExist){
    let dest = './public/img/dl/'
    if((req.query.dest!='false')&&(req.query.dest!=undefined)){
      dest = req.query.dest
    }
    imageDownloader({
      url: req.query.imgurl,
      dest: dest,
    })
    .then((path) => {
      console.log('all done', path)
      res.send(path)
    })
    .catch((error) => {
      console.log('something goes bad!')
      //console.log(error)
      res.send(false)
    })
  }
}else{
  res.send(false)
}

});
router.get('/searchSubreddits', async (req, res)=> {
  const db = req.app.locals.db;
  let query=req.query.query;
  res.send(await searchSubreddits(query,db))
})


router.get('/_favorites/', async (req, res)=> {
  const db = req.app.locals.db;
  let collection = 'favorites'
  let results = await db.collection(collection).find({}).sort({"_id":1}).toArray()
    let endRes=[]
    for(let i=0;i<results.length;i++){
      let item=results[i]
      if(item.preview==undefined){
        let preview = await new Promise((resolve,reject)=>{
          db.collection('viewed').findOne({'url':item.url}, (err, video) => {
            if(video){
              resolve(video.preview)
            }else{
              resolve(undefined)
            }
          })
        })
        if(item.preview!=undefined){
          db.collection(collection).updateOne({ _id:item._id }, { $set: { preview:preview } }, (err, result) => {  });
        }
        item.preview=preview
      }
      if((item.preview!='undefined')&&(item.preview!=undefined)){
        endRes.push(item)
      }
    }
  res.send(endRes)

});
router.post('/isnewpage', urlencodedParser, async function (req, res) {
  const db = req.app.locals.db;
  let searchmode = req.body.searchmode
  let isnewpage = require('../modules/isnewpage')
  let result = await isnewpage(req.body,db)
  res.send(result)
})
router.post('/search', urlencodedParser, async function (req, res) {
  const db = req.app.locals.db;
  let { searchmode = 'video', keyword, page, extractor, topPage } = req.body;
  let settings = await db.collection('settings').find({}).toArray();

  keyword = modifyKeyword(settings, keyword);

  logSearchEvent(searchmode, keyword, page, extractor, topPage);

  await db.collection('history-search').insertOne(createHistorySearch(searchmode, keyword, page, extractor, topPage));

  if (topPage != "false") {
    await saveLatestPage(db, searchmode, extractor, page);
  }

  let result = await getResult(db, searchmode, extractor, page);
  if(!result){
    res.send([])
    return 
  }
  res.send(result.reverse());
});

function modifyKeyword(settings, keyword) {
  try {
    if (settings[0].searchParmStart != '') {
      keyword = settings[0].searchParmStart + ' ' + keyword;
    }
    if (settings[0].searchParmStart != '') {
      keyword = keyword + ' ' + settings[0].searchParmEnd;
    }
  } catch {}
  return keyword;
}

function logSearchEvent(searchmode, keyword, page, extractor, topPage) {
  console.log({
    event: 'search/',
    searchmode,
    keyword,
    page,
    extractor,
    topPage,
    viewDate: new Date(),
  });
  console.log(extractor);
}

function createHistorySearch(searchmode, keyword, page, extractor, topPage) {
  return {
    event: 'search/',
    searchmode,
    keyword,
    page,
    extractor,
    topPage,
    viewDate: new Date().toLocaleString(),
  };
}

async function saveLatestPage(db, searchmode, extractor, page) {
  try {
      await db.collection(searchmode).updateOne({ _id: new ObjectId(extractor) }, { $set: { latestPage: page } });
  } catch (error) {
    console.error(error)
    console.log('Could not save the latest page for mode: ',searchmode)
  }
}

async function getResult(db, searchmode, extractor, page) {
  try {
    let result = [];
    if (searchmode != undefined) {
      let c_inDbRes = await db.collection('allMedia').find({ type: searchmode, _id: new ObjectId(extractor), isViewed: { statut: false } }).limit(30).toArray();
      console.log({
        event: 'in DB',
        extractor,
        type: searchmode,
        r: c_inDbRes.length
      });
      if (c_inDbRes.length > 1) {
        result = result.concat(c_inDbRes);
      } else {
        let options = await db.collection('image').findOne({ _id: new ObjectId(extractor) });
        console.log({
          event: 'Scrapping ...',
          extractor,
          page,
          options
        });
        let cRes = await pornPics(options, page, extractor, db);
        result = result.concat(cRes);
      }
    }
    return result;
  } catch (error) {
    console.error(error)
  }
  return
}

router.post('/isviewed',urlencodedParser,async (req, res) => {
  const db = req.app.locals.db;
  db.collection('allMedia').updateMany({ url: req.body.url }, { $set: { isViewed: {statut:true,date:req.body.date}, } }, (err, result) => {
    /*
    console.log({
      event:'isviewed',
      c:req.body.url
    })
    */
    res.sendStatus(200)
  });
});
//CONTROL DB
router.post('/:myAction/:elementType', urlencodedParser, (req, res) => {
  const db = req.app.locals.db;
  let myAction = req.params.myAction;
  let elementType = req.params.elementType;
  let myCollection = db.collection(elementType);
  let resID = 'back';
  var date = new Date();
  var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' + date.getFullYear();

  console.log({
    myAction: myAction,
    elementType: elementType,
    elementTypeID: req.query.elementTypeID,
    req: req.body
  });

  const handleAction = () => {
    if (myAction == 'editAll') {
      return myCollection.remove({})
        .then(() => {
          let data = [];
          try {
            req.body.el.forEach(element => {
              data.push({ el: element });
            });
          } catch {
            data.push(req.body);
          }
          return myCollection.insertMany(data);
        });
    }

    if (myAction == 'addone') {
      return myCollection.insertOne(req.body)
        .then(result => { resID = result.insertedId; });
    }

    if (myAction == 'edit' && req.query.elementTypeID) {
      return myCollection.deleteOne({ '_id': new ObjectId(req.query.elementTypeID) })
        .then(() => myCollection.insertOne(req.body));
    }

    if (myAction == 'update' && req.query.elementTypeID) {
      return myCollection.updateOne({ '_id': new ObjectId(req.query.elementTypeID) }, { $set: req.body });
    }

    if (myAction == 'editField' && req.query.elementTypeID) {
      return myCollection.updateOne({ '_id': new ObjectId(req.query.elementTypeID) }, { $unset: { [req.body.field]: "" } }, { upsert: true });
    }

    if (myAction == 'delete' && req.query.elementTypeID) {
      return myCollection.deleteOne({ '_id': new ObjectId(req.query.elementTypeID) });
    }
  };

  handleAction()
    .then(() => {
      res.redirect(req.get('Referrer') || '_back');
    })
    .catch(err => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

router.get('/favicon',urlencodedParser,async (req, res) => {
  const db = req.app.locals.db;
  let domain = req.query.domain
  let result = await new Promise(async(resolve,reject)=>{
    db.collection('favicon').findOne({'url': domain}, (err, el) => {
      if(el){
        resolve(el)
      }else{
        getFavicons(domain).then(data=>{
          db.collection('favicon').insertOne(data, (err, result) => { });
          resolve(data)
        }).catch((e)=>{
          console.log(e)
          resolve(null)
        })
      }
    })
  })
  //console.log(result)
  res.send(result)
})
//GET DATA FROM DB
router.get('/db/:dbName',urlencodedParser, (req, res) => {
const db = req.app.locals.db;
let dbName = req.params.dbName
let so_b = req.query.so_b
let so_k = req.query.so_k
let search = req.query
let elID = req.query.elID
if(elID){
    db.collection(dbName).findOne({'_id':new ObjectId(elID)}, (err, result) => {res.send(result);})
}
if(so_b){
  let so_={[so_b]:so_k}
  console.log({
    event:'search',
    search:so_
  })
  if(req.query.so_c=='all'){
    db.collection(dbName).find(so_).toArray((err, results) => {
      res.send(results)
    });
  }else{
    db.collection(dbName).findOne(so_, (err, result) => {
      res.send(result);
    })
  }

}
if(Object.keys(search)[0]=='favDateToday'){
  console.log({
    event:'search',
    dbName:dbName,
    search:search
  })
  db.collection(dbName).find(search).toArray((err, results) => {res.send(results);});
}
if(!elID && !so_b && (Object.keys(search)[0]!='favDateToday')){
  console.log({
    event:'search',
    dbName:dbName,
  })
  db.collection(dbName).find().sort({'_id':-1}).toArray((err, results) => {
    res.send(results);
  });
}

});
router.get('/userid',urlencodedParser, (req, res) => {
  const db = req.app.locals.db;
var date = new Date();
var today = (date.getMonth() + 1) + '/' + date.getDate() + '/' +  date.getFullYear();
let isLogin = req.signedCookies.isLogin
if( isLogin != undefined){
    if( isLogin.statut == true ){
    let userID = isLogin.userID
    let myCollection = db.collection('users')
    myCollection.findOne({'_id':new ObjectId(userID)}, (err, user) => {
        res.send(user._id)
    })
    }
}
});

module.exports = router;
