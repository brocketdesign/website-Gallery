const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
var Scraper = require('images-scraper');
const google = new Scraper();
const converter = require('json-2-csv');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;
const asnyScrap = require('./anyScrap')
async function pornPic(option,page,extractor,db){
    if(page == undefined){page=1}
    option.extractor = extractor
    let result = await searchInfo(page,option,db)
    console.log({
        site:extractor,
        length:result.length
    })
    //addin media to DB
    for(let i=0;i<result.length;i++){
        let item = result[i]
        if(item.type==undefined){
            item.type = 'image'
        }
        item.isViewed={statut:false}
        db.collection('allMedia').findOne({'url':item.url}, (err, res) => {
            if(!res){
                db.collection('allMedia').insertOne(item, (err, result) => { });
            }
        })
    }
    //console.log(result)
    return result.slice(0, 10)
}

async function searchInfo(page,option,db){
    let url_origin = new URL(option.siteurl).origin;
    let url_href = option.siteurl
    if(option.siteurl.indexOf('myP')>=0){
        url_href = new URL(option.siteurl.replace('myP',page)).href
    }else{
        //url_href = await deepSearchLoop(url_origin,page,db)
    }

    if (url_href.indexOf('reddit.com') >= 0) {
        console.log('Looking for the latest after ID');
        
        try {
          let result = await db.collection('image').findOne({ 'site': option.site });
          
          if (result) {
            console.log('Found a result:', result);
            console.log({ afterID: result.after });
            if(result.after){
            url_href = url_href + result.after;
            }
          } else {
            console.log('No result found for the site:', option.site);
          }
        } catch (err) {
          console.log('An error occurred while searching for the latest after ID:', err);
        }
      }
      

    return got(url_href)
    .then(response => {
        console.log(`Start search for ${url_href}`);
        const $ = cheerio.load(response.body);
        return asnyScrap($, option, new URL(url_href), db);
    })
    .then(result => {
        console.log(`anyscrap result length: ${result.length}`);
        return result;
    })
    .catch(err => {
        console.log(err);
        return false;
    });

}
async function deepSearchLoop(url_origin,page,db){
    let url_href = await new Promise((resolve,reject)=>{
        got(url_origin).then(response => {
            const $ = cheerio.load(response.body);
            let rt = {}
            $('a').each((index, element) => {
                let c_link_pathname = isValidHttpUrl($(element).attr('href'))
                if(hasNumber(c_link_pathname)){
                    c_link_pathname=c_link_pathname.replace(/\d+/g, "myP")
                    if(rt[c_link_pathname]==undefined){
                        rt[c_link_pathname]=0
                    }
                    rt[c_link_pathname]+=1
                }
            })
            let rs = (url_origin+findMax(rt)).replace('myP',page)
            resolve(rs)
        });
    })
    console.log(`deepSearchLoop url  : ${url_href}`)
    return url_href
}
function hasNumber(myString) {
    return /\d/.test(myString);
  }
  function isValidHttpUrl(string) {
    let url;
    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    if(!(url.protocol === "http:" || url.protocol === "https:")){
        if(string.substring(0, 1)=='/'){
            return new URL(url_origin+string).pathname
        }else{
            return new URL(url_origin+'/'+string).pathname
        }
    }else{
        return url.pathname
    }
  }
  function findMax(divClass){
      let max={key:0,val:0}
      Object.keys(divClass).forEach(key => {
          if(divClass[key]>=max.val){
            max.val=divClass[key]
            max.key=key
          }
      });
      return max.key
  }
module.exports = pornPic
