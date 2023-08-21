const fs = require('fs');
const cheerio = require('cheerio');
const got = require('got');
const axios = require('axios');
const ObjectId = require('mongodb').ObjectId;

async function isnewpage(option,db){
    let extractor_option
    if(option.searchmode=='image'){
        extractor_option = await db.collection('dataImage').findOne({'site':option.extractor})
    }
    if(option.searchmode=='gif'){
        extractor_option = await db.collection('dataGif').findOne({'site':option.extractor})
    }
    console.log({
        event:'isnewpage',
        option:option,
        //extractor_option:extractor_option
    })
    try{
        if(extractor_option.isNewPage == 'on'){
            let result = []
            await got(new URL(option.source).href).then(response => {
                const $ = cheerio.load(response.body);
                    try{
                        $('noscript').each((index, element) => {
                            let $$ = cheerio.load($(element).html());
                            let img = $$('img')
                            let img_src = img.attr('src')
                            if(!isValidHttpUrl(img_src)){
                                if(img_src!=undefined){
                                    if(img_src.indexOf('//')==-1){
                                        if(img_src.substring(0, 1)=='/'){
                                            img_src=new URL(option.source).origin+img_src
                                        }else{
                                            img_src=new URL(option.source).origin+'/'+img_src
                                        }
                                    }
                                }
                            }
                            let link= img.closest('a').attr('href')
                            if(link==undefined){
                                link= img.find('a').attr('href')
                            }
                            if(link==undefined){
                                link= img.parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= img.parent().parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= img.parent().parent().parent().find('a').attr('href')
                            }
                            if(img_src.indexOf('placeholder')==-1){
                                result.push({
                                    type:'image',
                                    url:img_src,
                                    source:link,
                                    extractor:option.extractor
                                })
                            }
                        });
                    }catch(e){
                        console.log(e)
                    }
                    try{
                        $('img').each((index, element) => {
                            let img_src =  $(element).attr('data-src') || $(element).attr('data-origin') || $(element).attr('data-echo') || $(element).attr('src') || $(element).attr('srcset')
                            img_src=img_src.replace('thum_','')
                            if(!isValidHttpUrl(img_src)){
                                if(img_src!=undefined){
                                    if(img_src.indexOf('//')==-1){
                                        if(img_src.substring(0, 1)=='/'){
                                            img_src=new URL(option.source).origin+img_src
                                        }else{
                                            img_src=new URL(option.source).origin+'/'+img_src
                                        }
                                    }
                                }
                            }
                            let link= $(element).closest('a').attr('href')
                            if(link==undefined){
                                link= $(element).find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().parent().parent().find('a').attr('href')
                            }
                            if(img_src.indexOf('placeholder')==-1){
                                result.push({
                                    type:'image',
                                    url:img_src,
                                    source:link,
                                    extractor:option.extractor
                                })
                            }
                        });
                    }catch(e){
                        console.log(e)
                    }
                    try{
                        $('video').each((index, element) => {
                            let img_src = $(element).attr('src')
                            if(img_src.indexOf('http')==-1){
                                img_src = new URL(option.source).origin + img_src
                            }
                            let link= $(element).closest('a').attr('href')
                            if(link==undefined){
                                link= $(element).find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().parent().find('a').attr('href')
                            }
                            if(link==undefined){
                                link= $(element).parent().parent().parent().find('a').attr('href')
                            }
                            result.push({
                                type:'video',
                                url:img_src,
                                source:link,
                                extractor:option.extractor
                            })
                        });
                    }catch(e){
                        console.log(e)
                    }
                }).catch(err => {
                    console.log(err);
                    return false
                });
                console.log({
                    site:option.extractor.toUpperCase(),
                    length:result.length
                })
                console.log(result[0])
                //addin media to DB
                for(let i=0;i<result.length;i++){
                    let item = result[i]
                    item.isViewed={statut:false}
                    item.isNewPage=true
                    db.collection('allMedia').findOne({'url':item.url}, (err, res) => {
                        if(!res){
                            db.collection('allMedia').insertOne(item, (err, result) => {});
                        }
                    })
                }
            return result.slice(0, 30)
        }
    }catch{}


    return false
}
function isValidHttpUrl(string) {
    let url;

    try {
      url = new URL(string);
    } catch (_) {
      return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
  }
module.exports=isnewpage
