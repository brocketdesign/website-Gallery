
const download = require('video-downloader');
const fetch = require('node-fetch');
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs');
const puppeteer = require("puppeteer");
async function downloadImage(v_url,link,dir){
  return await new Promise((resolve,reject)=>{
    try{
      let name = link.split(' ').join('-').split(':').join('-').split('/').join('-').slice(0,20)
      var outputName = `${name}`;
      var outputDir = dir;
      let option = {url:v_url,name:outputName,path:outputDir+'scr-'+outputName+'.jpeg'}
      var reqHasFinished = false;
      v_url=v_url.replace('https','http')
      //console.log({1:v_url,2:outputName})
      fetch(v_url).then((response)=>{
        //console.log(`DL ${v_url}`)
        download(v_url, outputName, outputDir)
        .then(function(output) {
          //console.log(output)
          reqHasFinished = true;
          fileSize(output).then((_size)=>{
            if(_size<10000){
              console.log(`DL ERROR ${outputName} (${_size})`);
              fs.unlink(output, (err) => {
                  if (err) {
                      throw err;
                  }
                  console.log(`${outputName} (${_size}) was deleted. (Google)`)
              });
              //takeShot(option).then(()=>{resolve()}).catch((e)=>{reject(e)})
              resolve()
            }else{console.log(`DL SUCCESS ${outputName}`);resolve()}
          }).catch((err)=>{console.log(err);reject()})
        }).catch((e)=>{
          reqHasFinished = true;
          console.log(`DL ERROR ${outputName}`);
          reject()
          //takeShot(option).then(()=>{resolve()}).catch((e)=>{reject(e)})
        })
      }).catch((e)=>{
        reqHasFinished = true;
        console.log(`FETCH ERROR ${name}`);
        resolve()
      })
      // if after 10 seconds the request has not finished, the promise is rejected.

      setTimeout(() => {
        if (!reqHasFinished) {
          console.log(`Go ahead ${name}`);
          resolve();
        }
      }, 30000)

    }catch(e){
      console.log(e)
      resolve()
    }
  })
 }
 async function fileSize(file){
   return new Promise((resolve,reject)=>{
     fs.stat(file, (err, stats) => {
       if (err) {
           reject(`File doesn't exist. (Google)`);
       } else {
           resolve(parseInt(stats.size))
       }
       reject(false)
     });
   })
 }
async function takeShot(option){
   await puppeteer.launch({
     headless:false,
   })
   .then(async (browser) => {
     const page = await browser.newPage();
     await page.goto(new URL(option.url));
     await page.screenshot({ path: option.path });
     await browser.close();
   });
 }
module.exports=downloadImage
