const ObjectId = require('mongodb').ObjectId;
const cheerio = require('cheerio');
const got = require('got');
const axios = require('axios');
const fetch = require('node-fetch')
async function redgif(item,db){
      try{
        const response = await fetch(`https://api.redgifs.com/v2/gifs/${item.name}`)
        const data = await response.json();
        //console.log(data)
        let gif = data.gif.urls.vthumbnail;
        let urls = data.gif.urls
        item.gif = gif
        item.urls = urls
        db.collection('allMedia').findOne({'url':item.url}, (err, res) => {
            if(res){
              let elID = res._id
              db.collection('allMedia').updateOne({ _id: new ObjectId(elID) }, { $set: { gif: gif,urls:urls} }, (err, result) => { });
            }else{
              db.collection('allMedia').insertOne(item, (err, result) => { });
            }
        })
      }catch(e){
        console.log(item)
        console.log(e)
      }
}
module.exports=redgif
