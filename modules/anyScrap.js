 const ObjectId = require('mongodb').ObjectId;
 const redgifs = require('./redgif')
async  function asnyScrap($,option,vUrl,db){
    let result = []
    try{
        let articles
        let gonext = false
        let isJSON = false
        try{
          isJSON = JSON.parse($('body').html().replace(/&quot;/g,'"'))
        }catch(e){
            //console.log(e)
        }
        if(!isJSON){
            let divClass={}
            $('div').each((index, element) => {
                if( ($(element).find('a').length>0) && (($(element).find('img').length>0))){
                    if(divClass[$(element).attr('class')]==undefined){
                        divClass[$(element).attr('class')]=0
                    }
                    divClass[$(element).attr('class')]+=1
                }
            })
            let articles_array = objToArray(divClass)
            articles_array=articles_array.sort(SortByValue);
            console.log(articles_array)
            for(let i=0;i<articles_array.length;i++){
                if(articles_array[i]!=undefined){
                    let _class = Object.keys(articles_array[i])[0];_class=_class.trim()
                    _class = _class.slice(_class.lastIndexOf(" ")).replace(' ','.')
                    console.log(_class)
                    //articles=$('.'+_class.toString().replace(/\s/g,'.'))
                    articles=$(_class)
                    try{
                      articles.each((index, element) => {
                          //console.log($(element).html())
                          let obj = {title: '',  url: '',source:'', preview: '', duration: '', site:option.site, extractor: option.site }
                          obj.title = $(element).text()

                          obj.source = $(element).find('a:last-child').attr('href')
                          if(obj.source==undefined){ obj.source=$(element).find('img').closest('a').attr('href') }
                          if(obj.source==undefined){ obj.source=$(element).find('h2').find('a').attr('href') }
                          if(obj.source==undefined){ obj.source=$(element).find('a').last().attr('href') }
                          if(obj.source==undefined){ obj.source=$(element).find('a').first().attr('href') }
                          if(obj.source==undefined){ obj.source=$(element).find('a').attr('href') }
                          try{
                              if(!isValidHttpUrl(obj.source)){
                                  if(obj.source.substring(0, 1)=='/'){
                                      obj.source=vUrl.origin+obj.source
                                  }else{
                                      obj.source=vUrl.origin+'/'+obj.source
                                  }
                              }
                          }catch(e){console.log('-1')}

                          obj.url = $(element).find('img').attr('data-src') || $(element).find('img').attr('data-origin') || $(element).find('img').attr('data-echo') || $(element).find('img').attr('src') || $(element).find('img').attr('srcset')
                          obj.url = obj.url.replace('thum_','')
                          if(obj.url==undefined){
                              $(element).find('div').each((index, el) => {
                                  if($(el).css('background-image')!=undefined){
                                       obj.url = $(el).css('background-image')
                                  }
                                  if(obj.url==undefined){
                                      let objKeys = Object.keys($(el).data())
                                      objKeys.forEach(key => {
                                          if( $(el).data(key).indexOf('.jpg') >=0 || $(el).data(key).indexOf('.jpeg') >=0 || $(el).data(key).indexOf('.png')>=0 || $(el).data(key).indexOf('.gif') >=0  || $(el).data(key).indexOf('redgif') >=0 ){
                                              obj.url = $(el).data(key)
                                          }
                                      });
                                  }

                              })
                          }
                          if(!isValidHttpUrl(obj.url)){
                              if(obj.url!=undefined){
                                  if(obj.url.substring(0, 1)=='/'){
                                      obj.url=vUrl.origin+obj.url
                                  }else{
                                      obj.url=vUrl.origin+'/'+obj.url
                                  }
                              }
                          }
                          //console.log(obj)
                          result.push(obj)
                      })
                    }catch(e){console.log('-2')}

                }
            }
            /*
            if(($('li').length>5)&&(Object.keys(divClass).length==0)){
              let k = 0
              $('li').each((index, element) => {
                  if( ($(element).find('a').length>0) && (($(element).find('img').length>0))){
                      let this_class=$(element)
                      let i = 0
                      while((this_class.attr('class')==undefined)&&(i<=10)){
                          this_class=$(element).parent()
                          i+=1
                          k+=1
                      }
                      this_class = this_class.attr('class')
                      if(divClass[this_class]==undefined){
                          divClass[this_class]=0
                      }
                      divClass[this_class]+=1
                  }
              })
              let select = '.'+findMax(divClass).split(' ').join('.')
              if(k>0){
                  select = select+' li'
              }
              articles=$(select)
          }
          if($('article').length>5){
              articles = $('article')
          }
            */
        }else{
          //REDDIT
          db.collection('dataImage').findOne({'site':option.site}, (err, result) => {
            if(result){
              let elID = result._id
              db.collection('dataImage').updateOne({ _id: new ObjectId(elID) }, { $set: { after: isJSON.data.after } }, (err, result) => {  });
            }
          })
        for(let i=0;i<isJSON.data.children.length;i++){
            let item = isJSON.data.children[i]
            //console.log(item.data)
            let obj = {title: '',  url: '',source:'', site:option.site, extractor: option.site }
            obj.title = item.data.title
            obj.thumbnail = item.data.thumbnail
            try{
                obj.url = item.data.preview.reddit_video_preview.fallback_url
            }catch{
              obj.url = item.data.url_overridden_by_dest || item.data.url
            }
            if(obj.url.indexOf('.mp4')>=0){
                obj.gif = obj.url
                obj.type='gif'
            }
            if(obj.url.indexOf('redgifs')>=0){
                obj.name = obj.url.split('/').pop()
                obj.type='gif'
                redgifs(obj,db)
            }
            if(obj.url.indexOf('.gifv')>=0){
              let obj_url = obj.url
                obj.name = obj.url.split('/').pop()
                obj.url=obj_url.replace('.gifv','.jpg')
                obj.gif=obj_url.replace('.gifv','.mp4')
                obj.type='gif'
                redgifs(obj,db)
            }

            if(item.data.is_video==true){
              obj.url = item.data.media.reddit_video.fallback_url
              obj.gif = item.data.media.reddit_video.fallback_url
              obj.type='gif'
            }
            try{
                if(!isImage(obj.url)){
                    obj.url=item.data.secure_media.oembed.thumbnail_url
                }
            }catch(e){}
            //console.log(obj)
            result.push(obj)
          }
        }

    }catch(e){
        console.log(e)
    }
    //console.log(result[0])
    return result
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
  function isImage(_u){
      let _i=['.jpg','.jpeg','.gif','.png','.mp4']
      for(let i=0;i<_i.length;i++){
        if(_u.indexOf(_i[i])>=0){
            return true
        }
      }
      return false
  }
  function SortByValue(a, b){
    var aValue = parseInt(a[Object.keys(a)[0]]);
    var bValue = parseInt(b[Object.keys(b)[0]]);
    return ((aValue > bValue) ? -1 : ((aValue < bValue) ? 1 : 0));
  }
  function objToArray(obj){
    let array = []
    Object.keys(obj).forEach((e,i)=>{
        let ob = {}
        ob[e]=obj[e]
        array.push(ob)
    })
    return array
}
module.exports=asnyScrap
