const cronJob = require('cron').CronJob;
async function cronJobs(db){

    var cronjob = new cronJob({
        cronTime: "59 23 * * *",
        start:true,
        timeZone: "Asia/Tokyo",
        onTick: function() {
            ranking(db)
        }
    });
}

async function ranking(db){
  let ex_c = await new Promise((resolve,reject)=>{
      db.collection('allMedia').find({'isViewed.statut':true,"type":"image"}).sort().toArray(function(err, result) {
          let r = {}
          result.forEach(e => {
              if(r[e.extractor]!=undefined){
                  r[e.extractor] += 1
              }else{
                  r[e.extractor] = 0
              }
          });
          let rr = {extractor:[],value:[]}
          Object.keys(r).forEach((key,index) => {
              rr.extractor[index] = key
              rr.value[index] = r[key]
          });
          resolve(rr)
      })
  })
  await db.collection('ranking').deleteMany({})
  await db.collection('ranking').insertOne(ex_c, (err, result) => {});
}
module.exports = cronJobs
