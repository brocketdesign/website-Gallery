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
    option.page = page
    let result = await searchInfo(page,option,db)
    console.log({
        site:extractor,
        length:result.length
    })

    //adding media to DB
    result = await insertToMediasDB(result, db)

    return result
}
async function insertToMediasDB(result, db) {
    // Array to hold the inserted items
    let insertedItems = [];

    for (let item of result) {
        if (item.type === undefined) {
            item.type = 'image';
        }
        item.isViewed = { statut: false };

        // Check if the item already exists
        let existingItem = await db.collection('allMedia').findOne({ 'url': item.url });

        if (!existingItem) {
            // Insert the new item
            let insertResult = await db.collection('allMedia').insertOne(item);
            if (insertResult.insertedId) {
                // Add the item with its _id to the array
                item._id = insertResult.insertedId;
                insertedItems.push(item);
            }
        }else{
            insertedItems.push(existingItem);
        }
    }

    return insertedItems;
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
        console.log('`Reddit scrap')
        try {
          let result = await db.collection('image').findOne({ 'site': option.site });
          if (result) {
            if(result.after){
                url_href = url_href + result.after;
                console.log(page,result.after)
            }else{
                console.log(`No after id founded`)
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
        const $ = cheerio.load(response.body);
        return asnyScrap($, option, new URL(url_href), db);
    })
    .then(result => {
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
