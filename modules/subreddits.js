const ObjectId = require('mongodb').ObjectId;
const cheerio = require('cheerio');
const got = require('got');
const axios = require('axios');

async function subreddits(db){
  let i=1
  while(i<=10){
    console.log(`${i}/10`)
    let url_href = 'https://www.reddit.com/subreddits.json?after='
    let url_after = await new Promise((resolve,reject)=>{
      db.collection('subreddits').findOne({'scraping_info':true}, (err, result) => {
        if(result){
            resolve(result.after)
        }else{
          db.collection('subreddits').insertOne({'scraping_info':true,'after':null}, (err, result) => { });
          resolve('')
        }
      })
    })
    url_href = url_href+url_after
    await got(url_href).then(response => {
      console.log(`Start search for ${url_href}`)
      const $ = cheerio.load(response.body);
      let result = []
      let isJSON = JSON.parse($('body').html().replace(/&quot;/g,'"'))
      db.collection('subreddits').findOne({'scraping_info':true}, (err, result) => {
        if(result){
          let elID = result._id
          db.collection('subreddits').updateOne({ _id: new ObjectId(elID) }, { $set: { after: isJSON.data.after } }, (err, result) => {  });
        }
      })
      isJSON.data.children.forEach((item, i) => {
        if((item.data.over18==true)){
          let obj = {}
          obj.title = item.data.title
          obj.url = item.data.url 
          db.collection('subreddits').insertOne(obj, (err, result) => { });
          console.log(obj)
          result.push(obj)
        }
      });
    }).catch(err => {
      console.log(err);
    });


    await new Promise((resolve,reject)=>{
      setTimeout(() => {
        console.log('Next')
        resolve()
      }, 5000);
    })
    i++
  }
}
module.exports=subreddits