
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
let win = $(window)
let ww = $(window).width()
let wh = $(window).height()
const YOUR_LARGE_SCREEN_BREAKPOINT = 992

document.ondblclick = function(evt) {
    if (window.getSelection)
        window.getSelection().removeAllRanges();
    else if (document.selection)
        document.selection.empty();
}
jQuery(function ($) {
  $.fn.hScroll = function (amount) {
      amount = amount || 120;
      $(this).bind("DOMMouseScroll mousewheel", function (event) {
          var oEvent = event.originalEvent,
              direction = oEvent.detail ? oEvent.detail * -amount : oEvent.wheelDelta,
              position = $(this).scrollLeft();
          position += direction > 0 ? -amount : amount;
          $(this).scrollLeft(position);
          $(this).find('.cardContainer').each(function(){
            let $this = $(this)
            let _ol = $this.offset().left
            let _eval = parseInt((win.width()*1.5))
            if((_ol<=_eval)&&(!$this.hasClass('viewed'))){
              //console.log(_ol,_eval)
              $this.addClass('viewed')
              //imageDownloader($this,{dest:false,do:false})
              addToViewed($this)
            }
          })
          if(edgeControl($(this).attr('data-id'))){
            //$(this).unbind("DOMMouseScroll mousewheel")
            let next_extractor = $(this).closest('.c_ct').next()
            //$(window).scrollTop(next_extractor.offset().top - 50);
            loadResultSearch({reset:false,triger:'true',extractor:$(this).closest('.c_ct').attr('data-id')})
          }
          event.preventDefault();
      })
  };
});

const handleGridRange = () => {
  if($('#range').data('mode')==1 && $(window).width() <= 768){
      $('#grid-range').val(1);
      updategridlayout(1)
      //$('#range').hide()
      //return
  }
  if($('#range').data('mode')== 1 && $(window).width() > 768){
      $('#grid-range').val(2);
      updategridlayout(2)
      //$('#range').hide()
      //return
  }
  // Check if the local variable exists
  var rangeState = localStorage.getItem('rangeState');

  // Initialize the range input based on the local variable
  if (rangeState !== null) {
    $('#grid-range').val(rangeState);
    updategridlayout(rangeState)
  }

  // Save the state of the range input to local storage when it's toggled
  $('#grid-range').change(function() {
    const value = $(this).val();
    localStorage.setItem('rangeState', value);
    console.log(`range : ${value}`)
    updategridlayout(value); // Call the function to update the grid layout with the new value
  });
};

$(document).ready(function() {

  // Call LazyLoad on scroll
  $(window).scroll(function() {
      LazyLoad();
  });

  // Call LazyLoad on window resize
  $(window).resize(function() {
      LazyLoad();
  });
});

$(document).ready(function(){ main() })
function main(){

  tools()
  vidzExtractor()
  displayItOnClick()
  favoriteEdit()
  searchMode()
  loadmoreTop()
  tabLink()
  updateSetting()
  randombg()
  handleGridRange();
  imageDownloaderButton({dest:false,do:false})

  if(!!document.querySelector('#favorites')){
    loadElementFrom({rd:false},'favorites')
  }
    if(!!document.querySelector('#history')){
    loadElementFrom({rd:false},'history')
  }
  if(!!document.querySelector('#safePage')){
    isPorn()
  }
  LazyLoad();
  afterAllisDone()
}
let msnry = null ;
const handleMasonry = () => {
    if(
        document.querySelector('.masonry-container')
        && window.innerWidth >= YOUR_LARGE_SCREEN_BREAKPOINT 
        ||
        document.querySelector('.masonry-container')
        && $('#grid-range').val() >= 2

    ){
        msnry = new Masonry('.masonry-container', {
            itemSelector: '.masonry-item:not([style*="display: none"])', 
            columnWidth: '.masonry-item',
            percentPosition: true
        });
    }
}
const updateMasonryLayout = () => {
    if (msnry) {
      msnry.reloadItems();
      msnry.layout();
      
    }
}
// Masonry setup
$(window).on('load', function() {
    handleMasonry()
});
$(document).on('click','.removeTag',function(){

  let tag = $(this).attr('data-value')
  let $this=$(this)
  console.log({
    event:'removeTag',
    tag:tag
  })

  $.post('/api/dataTags',{remove:tag},function(){
    $this.fadeOut()
  })

})
$(document).on('click','.addtag',function(){
  let tag = $(this).attr('data-value')
  let $this=$(this)
  $.post('/api/dataTags',{tags:tag},function(){
    $this.hide()
  })
})

$(document).on('click','.removeThisId',function(){
  let thisID = $(this).attr('data-id')
  let thisCollection = $(this).attr('data-collection')
  let $this = $(document).find('.list-group-item[data-id="'+thisID+'"][data-collection="'+thisCollection+'"]')
  console.log({
    event:'removeThisId',
    thisID:thisID,
    thisCollection:thisCollection,
  })
  $.post('/api/delete/'+thisCollection+'?elementTypeID='+thisID,function(){
    $this.fadeOut()
  })
});
$(document).on('click','#myvideo',function(){
  //$(this).get(0).play()
});
$(document).on('click','.extractor',function(){
  let extractor = $(this).attr('id')
  //$('.loading[data-id="'+extractor+'"]').attr('data-value',1)
  //$('.container-content[data-id="'+extractor+'"]').css('height','auto')
  //$('#thumbnail a').hide()
  //$('#thumbnail a[data-extractor="'+extractor+'"]').show()
  loadResultSearch({reset:true,extractor:extractor})
})
function favoriteEdit(){
  /*
  $(document).on({
    mouseenter: function () {
        $(this).find('.card-body').show()
    },
    mouseleave: function () {
      $(this).find('.card-body').hide()
    }
  },'#favorite .cardContainer')
  */
}
function displayGif($this){
  let itemId = $this.attr('id')
  $this.find('.loading').fadeIn().addClass('d-flex')
  $.get('/api/db/allMedia?so_b=_id&so_k='+itemId,function(result){
    let file = result.gif
    if(result.imgpath){
      file = result.imgpath
    }else{
      imageDownloader($this,{dest:false,do:false})
    }
    //$this.css({height:'150px'})
    $this.find('video').attr('data-src',result.url)
    $this.find('video').attr('src',file)
    let contentWidth = $this.find('.img-content img').css('width')
    if(!!document.querySelector('#favorite') || !!document.querySelector('#history')){
      contentWidth = '100%'
    }
    $this.find('video').css({
      'width':contentWidth,
      'position':'relative'
    })
    $this.attr('data-gif',result.gif)
    $this.find('.typeAnim-gif').addClass('done').wrap(`<a target='_blank' href="${file}"></a>`)
    $this.find('.loading').hide().removeClass('d-flex').addClass('d-none')
    $this.find('.poster').attr('src',result.thumbnail)
    $this.find('video').on('canplay', function() {
      hidePoster(this); 
      setContainerWidth(this);
      $this.addClass('displayEl')
      $this.removeClass('lazyload')
    });
    if(!!document.querySelector('#favorite') || !!document.querySelector('#history')){
      updateMasonryLayout()
    }
  })
}
function displayImage($this){
  let itemId = $this.attr('id')
         if($this.find('.img-content img.clone').length==0){
        $.get('/api/db/allMedia?so_b=_id&so_k='+itemId,function(result){
          let src
          if(result.imgpath){
            src = result.imgpath
          }else{
            imageDownloader($this,{dest:false,do:false})
          }
            let img_container_clone = $this.find('.img-content img').clone()
            let img_container = $this.find('.img-content img')
            let loader = $this.find('.loading')
            loader.addClass('d-flex')
            img_container_clone.addClass('clone').removeClass('setContainerWidth')
            img_container_clone.attr('src',src)
            img_container.before(img_container_clone)
            img_container_clone.css('position','absolute')
            img_container_clone.on('load',function(){
              img_container_clone.css('position','relative')
              img_container.remove()
              loader.removeClass('d-flex')
            })
            img_container_clone.on('error',function(){
              img_container.remove()
              loader.removeClass('d-flex')
              $this.find('.img-content img.clone').attr('src',result.thumb!='self'?result.thumb:'')
            })
            $this.find('.img-content img.clone').on('load',function(){
              //setContainerWidth($(this))
              $this.find('.img-content img.clone').addClass('displayEl')
              $this.find('.img-content img.clone').removeClass('lazyload')

            })
          
          if(!!document.querySelector('#favorite') || !!document.querySelector('#history')){

          }
        })


      }
}
function displayEl($this){
  if(!$this.hasClass('displayEl')){

    $this.css({"background-color":" #72727b !important"})
    console.log($this.attr('id'))
    if($this.attr('data-type')=='gif'){
      displayGif($this)
    }
    if($this.attr('data-type')=='image'){
      displayImage($this)
    }
  }
}
function hidePoster(el){
  //console.log(`hide poster ${$(el).attr('data-src')}`)
  $('img.poster[data-id="'+$(el).attr('data-id')+'"]').remove()
  $(document).find('.loading[data-id="'+$(el).attr('data-id')+'"]').remove()
  $(el).fadeIn()
  $(el).css('position','relative')
  $(el).closest('cardContainer').addClass('displayEl')
}
function activ_ext(){
  let ext = $.cookie('activ_ext')
  if(ext!=undefined){
    $('select.extractor').val(ext)
    searchExtractor(ext)
  }
}
function searchExtractor(op){
  ext=$(op.ex).val() || op
  window.location = `/history?extractor=${ext}`
  return
  reset_content()
  let nf = true
  $('.c_ct').each(function(){
    if($(this).attr('data-id')!=ext){
      $(this).hide()
    }else{
      nf = false
      $(this).show()
      loadResultSearch({reset:false,triger:'true',extractor:ext})
    }
  })
  if(nf){
    $('.c_ct').show()
  }
  if(ext=='false'){
    $('.c_ct').fadeIn()
  }
  $.cookie('activ_ext',ext,{expire:7})
}
function loadElementFrom(op,coll){
  const extractor = getUrlParam('extractor')
  const pageIndex = getPageIndex(); 
  if(!Number.isInteger(pageIndex)){return}
  let query = `/api/${coll}?extractor=${extractor}&page=${pageIndex}`

  if(!$('#related').hasClass('on')){

    console.log({extractor,pageIndex})
    $('.no-res').remove()
    $('#loading_page .loading').show()
    $('#related').addClass('on')

    $.get(query,function(results){
      displayItemsLoop(results)

      if(!!document.querySelector('#favorite') || !!document.querySelector('#history')){
        updateMasonryLayout()
      }
      $('#related').attr('data-value',pageIndex+1)
      $('#related').removeClass('on')
      $('#loading_page .loading').hide()
      //LazyLoad()
      console.log(`Load ${results.length} items`)
    })
  }
}
function displayItemsLoop(results){
  if(results.length>0){
    for (let [index, item] of results.entries()) {
      if((item!=undefined)){
        let content = $('.cardContainer.template').clone()
        content = resetTemplate(content,item)
        content.show()
        $('#related').append(content)
      }
    }    
  }else{
    $('#related').after('<h6 class="text-center p-5 no-res">Nothing founded</h6>')
    $('#related').attr('data-value',false)
    $('#loading_page .loading').hide()
  }
}

function visibleExtractor(){
  let extractor = []
  $('.container-content').each(function(){
    if(($(this).is(':visible'))&&(_getDistanceFromTop($(this))<=vh)&&(_getDistanceFromTop($(this))>=0)){
      extractor.push($(this).attr('data-id'))
    }
  })
  return extractor
}

function arrayToSlideshow(arr,option){
  let extractor = option.extractor
  let ctr = $('.isnp-container[data-value="1"][data-extractor="'+extractor+'"]').clone()
  ctr.find('.content').html('')
  let slid = parseInt($('.isnp-container[data-extractor="'+extractor+'"]').length+1)
  ctr.attr('data-value',slid)
  slid = 'isnp-'+extractor+'-'+slid
  ctr.attr('id',slid)
  ctr.attr('data-id',slid)
  ctr.find('.relay').attr('data-relay',slid)
  ctr.find('.arrayToSlideshow').attr('data-relay',slid)
  ctr.find('.arrayToSlideshow').attr('abs-ext',slid)
  ctr.find('.content').attr('data-id',slid)
  ctr.find('button.btn').each(function(){$(this).attr('data-id',slid)})
  ctr.find('.slick-backtop').attr('data-id',slid)
  ctr.find('.slick-control.slick-play').attr('data-id',slid)
  ctr.find('.slick-control.slick-view').attr('data-id',slid)
  ctr.find('.length').html('<span>'+arr.length+'</span>')
  for(let i=0;i<arr.length;i++){
    let url = arr[i].url
    let source = arr[i].source
    let type = arr[i].type
    let favorite_type = 'favoriteImage'
    if(type=='video'){
      favorite_type = 'favorites'
    }
    if($('#navbar').attr('data-mode')=='gif'){
      type='gif'
      favorite_type = 'favoriteGif'
    }
    if((url!=undefined) &&(url!=null) && (url.indexOf('data:')==-1)){
      let content = $('.cardContainer.template').clone()
      content.find('.card.img-content').removeClass('gif')
      content.removeClass('template')
      content.removeClass('on')
      //content.addClass('isnewpage')
      //content.find('.card.img-content').css('height',vh*0.7+'px')
      //content.find('.img-content').css('background-image','url('+url+')')
      //content.find('.img-content').css('height','auto')
      //content.find('.img-content').css('width','auto')
      //content.find('.poster').css('opacity',1)
      content.find('img.card-img-top').attr('src',url)
      content.attr('data-type',type)
      content.attr('data-collection',favorite_type)
      content.attr('data-id','uni-'+i)
      content.attr('data-url',url)
      content.attr('data-source',source)
      content.attr('data-index',(i+1))
      content.attr('data-extractor',extractor)
      content.attr('data-id','isnp-'+i)
      content.find('.favAnim').attr('data-id','isnp-'+i)
      content.show()
      ctr.find('.arrayToSlideshow').append(content)
    }
  }
  ctr.show()
  $('.isnp-container[data-value="1"][data-id="'+extractor+'"]').before(ctr)
  //transformSlider(slid)
  wichDesign(ctr.find('.content'))
  $(window).scrollTop($('.isnp-container[data-id="'+slid+'"]').offset().top - 50);
}

function checboxmanager(el){
  let elID=$(el).attr('data-id')
  let collection = $(el).attr('data-collection')
  let statut = $(el).prop('checked')
  console.log({
    event:'checboxmanager',
    elID:elID,
    collection:collection,
    statut:statut,
  })
  $.post('/api/update/'+collection+'?elementTypeID='+elID,{statut:statut})
}
function updateSetting(){
  $(document).on('click','button.list-group-item',function(){
    let thisID = $(this).attr('data-id')
    let thisCollection = $(this).attr('data-collection')
    $.get('/api/db/'+thisCollection+'?elID='+thisID,function(res){
      $('form[data-value="'+thisCollection+'"]').attr('action','/api/update/'+thisCollection+'?elementTypeID='+thisID)
      $('form[data-value="'+thisCollection+'"]').find('button[type="submit"]').text('Update')
      $('form[data-value="'+thisCollection+'"]').find('input').each(function(){
        if(($(this).attr('type')=="checkbox")){
          if(res[$(this).attr('name')]=='on'){
            $(this).prop('checked',true)
          }else{
            $(this).prop('checked',false)
          }
        }else{
          $(this).val(res[$(this).attr('name')])
        }
      })
      console.log({
        event:'updateSetting',
        thisID:thisID,
        thisCollection:thisCollection,
        res:res,
      })
    })

  })

  $(document).on('click','.switchMode',function(){
    let sMode = $(this).attr('data-value')
    $.cookie('searchmode',sMode,{expire:7})
    $('footer .mode').hide()
    $('footer .mode[data-value="'+sMode+'"]').show()
  })

  if($.cookie('searchmode')==undefined){
    $.cookie('searchmode',$('#navbar').attr('data-mode'),{expire:7})
  }
  if($.cookie('searchmode')!=undefined){
    $('a.mode[data-value="'+$.cookie('searchmode')+'"]').show()
    if($.cookie('searchmode')!='safe'){
      $('#safeSearch').hide()
    }else{
      $('#sendForm').hide()
    }
    if(!!document.querySelector('#topPage')){
      let ld = $('#index-'+$.cookie('searchmode')).clone()
      $('#index-'+$.cookie('searchmode')).remove()
      $('.fullscreen.selectors').prepend(ld)
    }
  }
}
function tabLink(){
  if(!!document.querySelector('#nav-tab')){
    $('#nav-tab .domain').each(function(){
      let domain = new URL($(this).attr('data-value')).origin
      let $this = $(this).parent()
      $.get('/api/favicon?domain='+domain,function(data){
        if(data.icons.length>0){
          $this.find('.domainlogo').prepend('<img class="favico" src="'+data.icons[0].src+'" width="15">')
          //$this.prepend('<a class="m-2" target="_blank" href="'+data.url+'" ><img class="favico" src="'+data.icons[0].src+'" width="15"></a>')
        }
      })
    })
  }
}
function vidzExtractor(){
  let extractor = []
  let container = $('#container-extractor')
  $(document).find('.vidz .extractor').each(function(){
    let ext = $(this).text()
    if(extractor.includes(ext)==false){
      extractor.push(ext)
      container.append('<span class="extractorID badge bg-transparent mx-2" style="cursor:pointer">'+ext+'</span>')
    }
  })
  $(document).on('click','.extractorID',function(){
    let ext = $(this).text()
    let el =  $(document).find('.vidz .extractor[data-value="'+ext+'"]').first()
    $(window).scrollTop(el.offset().top);
  })

}
function loadmoreTop(){
  $('#resContainer').on('click',function(){
    $(this).fadeOut()
    $('.resContainer').each(function(){
      if($(this).hasClass('d-none')){
        $(this).hide()
        $(this).removeClass('d-none')
        $(this).fadeIn()
      }
    })
  })
}
function navLink(){
  $('.nav-link').each(function(){
    if(window.location.pathname.indexOf($(this).attr('href'))>=0){
      $(this).addClass('text-success')
    }
  })
}
function tagsToSlideSHow(){
  if( !! document.querySelector('#topPage')){
    $.each($('.tag'),function(){
      let tag = $(this).attr('data-value')
      let $this = $(this)
      $.get('/api/images?keyword='+tag,function(images){
          let content = ''
          content += '<div id="tCarousel-'+tag+'" class="carousel slide" data-ride="carousel">'
          content += '<div class="carousel-inner">'
        images.forEach((image,index) => {
          if(index == 0){
            content += '<div class="carousel-item active">'
          }else{
            content += '<div class="carousel-item">'
          }
          content += '<img class="img-fluid" src="'+image.url+'" alt="'+image.title+'"/>'
          content += '</div>'
        });
          content += '</div>'
          content += '</div>'
        $this.after(content)
      })
    })
  }
}
//DISPLAY GIF CARD INFO
$(document).on('dblclick','.cardContainer',function(){
  addToFav($(this))
})
/*
$(document).on('click','.card',function(){

  if(!$(this).find('.overlayIt').is(':visible')){
    $(this).find('.overlayIt').fadeIn();
    setTimeout(() => {
      $(this).find('.overlayIt').fadeOut();
    }, 60000);
  }

    //MANAGE DOUBLE TAP
    let doubletap = $(this).attr('data-doubletap')
      $(this).attr('data-doubletap',new Date())
      let diff = ((new Date().getTime()  - new Date(doubletap).getTime() ) / 1000).toFixed(2)
      if(diff <= 2){
        onDoubleTap($(this))
      }
      $(this).attr('data-doubletap',new Date())

    function onDoubleTap(el){
      var container = el.closest('.cardContainer')
      let searchMode = $('#navbar').attr('data-mode')
      if(searchMode){
        addToFav(container)
      }
    }

  })
*/
//CALENDAR COLORED
function customCalendar(date,isDone){
  let cDate = new Date(date).toLocaleDateString('ja-JP')
  /*
  console.log({
    event:'customCalendar',
    cDate:cDate,
    //isDone:isDone,
    c:isDone.includes(cDate)
  })
  */
  if(isDone.includes(cDate) == true){
      return {classes: 'highlight'};
  }else{
      return {classes: 'neutral'};
  }
}
function tools(){
  $(document).on('click','.cardContainer',function(){
    displayEl($(this))
  })
  toggleBreakerInit()
  controlSwitch()
  /*
  if(!!document.querySelector('#loading_page')){
    $('#footer_mode').after($('.row.mode').html())
  }
  */
  var lastScrollLeft = 0;
  $('#thumbnail').scroll(function() {
    $(this).find('.thumb').each(function(){
      let _img = $(this).attr('data-url')
      let _ol = $(this).offset().left
      if((_ol<=win.width())&&(!$(this).hasClass('visible'))){
        $(this).find('canvas').css('background-image','url('+_img+')')
        $(this).addClass('visible')
      }
    })
  });
  var divList = $(".c_ct");
  divList.sort(function(a, b) {
      return parseInt($(b).data('ct')) - parseInt($(a).data('ct'));
  });
  $("#nav-tab").html(divList);

  $(document).find('.if-cookie').each(function(){
    if($.cookie($(this).attr('data-cookie'))){
      $(this).show()
    }
  })
  let searchMode = $('#navbar').attr('data-mode')
  $('#WPO').popup({
    autoopen: false
  });
  var topPage = new URLSearchParams(window.location.search).get('topPage');
  if(topPage=='false'){
    $('.loading.search').attr('data-value',1)
  }

  //DSave latest setting option
  if($.cookie('settingssPage')!=undefined){
    $('#settingssPage .nav-link[id="'+$.cookie('settingssPage')+'"]').click()
  }
  $('#settingssPage .nav-link').on('click',function(){
    $.cookie('settingssPage',$(this).attr('id'),{expire:7})
  })
  //Display last search in form
  if($.cookie('latestSearch')!=undefined){
    $('#formInput').val($.cookie('latestSearch'))
    $('#formInput').attr('placeholder',$.cookie('latestSearch'))
  }
  $('.loadmore').on('click',function(){
    //loadResultSearch({reset:false,triger:'true',extractor:$(this).attr('data-id')})
    window.location=`/history?extractor=${$(this).attr('data-id')}`
  })
  $('.reset_page').on('click',function(){
    let extractor = $(this).attr('data-extractor')
    $('.loading[data-id="'+extractor+'"]').attr('data-value',0)
    loadResultSearch({reset:true,triger:'true',extractor:extractor})
  })
  let thumbDiv=$('#thumbnail').clone()
  $('#thumbnail').remove()
  $('section').first().before(thumbDiv)
  /*
  $(document).on({
    mouseenter: function () {
        $(this).fadeIn().css('opacity','0.8')
    },
    mouseleave: function () {
      $(this).css('opacity','0')
    }
},'.onHover')
*/
if(!!document.querySelector('#single')){
  let navheight = $('#navbar').prop('scrollHeight')
  $('.container-main').css({
    'height':'calc(100vh - '+navheight+'px)',
    'overflow':'hidden'
  })
}
  //DEFINE ENTER TO SEND FORM
  $('#formInput').keypress(function(e) {
    if(e.which == 10 || e.which == 13) {
       $('#sendForm').click()
    }
  });

  //DELETE ELEMENT
      $(document).on('click','.deleteThis',function(e){
        e.preventDefault()
        let $this = $(this)
        let data = $(this).closest('.cardContainer').attr('data-id')
        let collection = $(this).closest('.cardContainer').attr('data-collection')
        console.log({
          event:'deleteThis',
          data:data,
          collection:collection
        })
        $.ajax({
          url: '/api/delete/'+collection+'?elementTypeID='+data,
          type: 'POST',
          beforeSend: function() {
            $this.addClass('text-danger')
            //$this.closest('.card').fadeOut().remove()
          },
          success: function(res) {
            $this.hide()
          }
      });
      })
      $(document).on('click','.addToFav',function(e){
        var container = $(this).closest('.cardContainer')
        if(!!document.querySelector('#single')){
          const queryString = window.location.search;
          const urlParams = new URLSearchParams(queryString);
          url = urlParams.get('url');
        }
        addToFav(container)
      })
    //HIDE & SHOW PLAYER
    let video = document.querySelector('#myvideo')
    if(!!video){
      //$(video)[0].play();
      if( video.src.indexOf('undefined')>=0){
        $('div.video').remove()
        $('h3').after('<p>Error : video  not founded</p><p>Link : <a href="'+$('#url').text()+'">'+$('#url').text()+'</a></p>')
      }else{
        $('div.video').show()
      }
    }
    transformHastag()
    ratingPopup()

}
//ZOOM FESTURE
$(document).on('click','.controler .zoom',function(){
  let stats = ['contain','cover']
  if($('.preview-content ').hasClass('slick-initialized')){
    let stat = $('.preview-content .slick-current').css('background-size')
    if(stats.includes(stat)){
      stats.splice(stats.indexOf(stat),1)
      $('.preview-content .slick-current').css('background-size',stats[0])
    }
  }
})
$(document).on('click','.cardContainer .zoom',function(){
  let stats = ['contain','cover']
    let stat = $(this).closest('.cardContainer').find('.img-content').css('background-size')
    if(stats.includes(stat)){
      stats.splice(stats.indexOf(stat),1)
      $(this).closest('.cardContainer').find('.img-content').css('background-size',stats[0])
    }
    if($(this).closest('.cardContainer').find('.img-content').hasClass('bg-cover')){
      $(this).closest('.cardContainer').find('.img-content').removeClass('bg-cover')
    }
})
$(document).on('click','.controler .next',function(){
  $('.preview-content').slick('slickNext')
})
$(document).on('click','.controler .prev',function(){
  $('.preview-content').slick('slickPrev')
})
$(document).on('click','.close',function(){
  $('.preview-container').hide()
  $('.preview-container').css('z-index','-1')
  $('#thumbnail').css('opacity',1)
})
/*
$(document).on('click','.preview-container',function(){
  $('.preview-container').hide()
  $('.preview-container').css('z-index','-1')
})
*/
function previewGo(el){
  let index = $(el).attr('data-index')
  if($('.preview-content').hasClass('slick-slider')){
    $('.preview-content').slick('unslick');
  }
  $('.preview-content').html('')
  $('.preview-content').show()
  $('.preview-container').show()
  $('.preview-container').css('z-index','90')
  $('.preview-container .controler').css('z-index','90')
  $('#thumbnail').css('opacity',0.5)
  $('#thumbnail a').each(function(){
    let img_url = $(this).attr('data-url')
    if(($(this).attr('data-url').indexOf('.gif')>0)||($(this).attr('data-url') .indexOf('.mp4')>0)){
      img_url = $(this).attr('data-url')
    }
    var img=new Image();
    img.src=img_url
    let img_width = img.width+'px'
    if((img.width<10)||(img.width>img.height)){
      img_width = '100vw'
    }
    let img_size = 'cover'
    //Smartphone
    if($(window).width()<$(window).height()){
      //portrait
      if(img.width>img.height){
        img_size = 'contain'
      }
    }
    $('.preview-content').append('<div style="width:'+img_width+';max-width:100vw;background-repeat:no-repeat;background-position:center;background-size:'+img_size+';background-image:url('+img_url+');height:100vh" ></div>')
  })

  slickControl($('.preview-content'))
  let NumSlide = [1,1,1]
  $('.preview-content').slick({
    dots: false,
    arrows: true,
    infinite: false,
    fade: true,
    slidesToShow: NumSlide[0],
    //slidesToScroll: NumSlide[0],
    //centerMode: true,
    //variableWidth:true,
    speed: 1000,
    autoplay: false,
    autoplaySpeed: 3000,
    cssEase: 'linear',
    responsive: [
      {
        breakpoint: 1080,
        settings: {
          slidesToShow: NumSlide[1],
          slidesToScroll: NumSlide[1],
          infinite: false,
          dots: false
        }
      },
      {
        breakpoint: 780,
        settings: {
          slidesToShow: NumSlide[2],
          slidesToScroll: NumSlide[2],
          infinite: false,
          dots: false
        }
      },
    ]
  });
  $('.preview-content').slick('slickGoTo',index,true)
}
function old_previewGo(el){
  let imgUrl = $(el).closest('.cardContainer').find('.card.img-content').attr('data-value');
  if(imgUrl==undefined){
    imgUrl = $(el).attr('data-value');
  }
  console.log({
    event:'previewGo',
    imgUrl:imgUrl
  })
  var img=new Image();
  img.src=imgUrl
  let imgh = wh - 20
  let imgw=(imgh/img.height*img.width)
  if(wh>ww){
    imgw = ww - 20
    imgh = (imgw/img.width*img.height)
  }
  $('#preview').html('')
  $('#preview').show()
  $('#preview').append('<img style="opacity:0" src="'+imgUrl+'" width="'+imgw+'" height="'+imgh+'">')
  $('#preview').css('background-image','url('+imgUrl+')')
  $('.preview-container').show()
  $('.preview-container').css('z-index','90')
  $('.controler').css('z-index','100')
}
function addToFav(container){
  if(container){
    container.addClass('isfav')
    imageDownloader(container,{dest:'./public/img/fav/',do:true})
    let addtofavbutton = container.find('.addToFav')
    let title = container.attr('data-title')
    let url = container.attr('data-url')
    let gif = container.attr('data-gif') || false
    if(title==''){
      title = Math.random().toString().substr(2, 8);
    }
    if(!addtofavbutton.hasClass('text-danger')){
      let uniqueID = container.attr('data-id')
      addtofavbutton.addClass('text-danger')

      $('.favAnim[data-id="'+uniqueID+'"]').fadeIn()
      setTimeout(() => {
        $('.favAnim[data-id="'+uniqueID+'"]')
      }, 1000);
      let extractor = container.attr('data-extractor')
      let collection = container.attr('data-collection')
      url = url || value
      /*
      console.log({
        event:'addToFav',
        extractor:extractor,title:title,url:url
      })
      */
      let today = new Date().toLocaleString('en-US',{month:'numeric',year:'numeric',day:'numeric'});
      /*
      $.ajax({
        url: '/api/addone/'+collection,
        type: 'POST',
        data: {extractor:extractor,title:title,url:url,favDate:new Date(),favDateToday:today},
        success: function(res) {
        }
      });
      */
      let obj = {extractor:extractor,title:title,url:url,favDate:new Date(),favDateToday:today,isFavorite:true}
      if(gif){
        obj.gif=gif
      }
      //console.log(obj)
      $.get('/api/db/allMedia?so_b=url&so_k='+url,function(result){
        if(result){
          let s_id=result._id
          $.post('/api/update/allMedia?elementTypeID='+s_id,obj)
          //console.log('added to fav')
        }
      })
      let option = {
        url:container.attr('data-url'),
        id:container.attr('data-id'),
      }
      if(container.hasClass('slick-slide')){
        option.slick_index=container.attr('data-slick-index')
        option.slick_name=container.attr('data-extractor')
      }
      let searchmode = $('#navbar').attr('data-mode')
      if(searchmode){
        //thumbNav(option)
      }
    }
  }
}
function addToViewThis(el){
  el.find('.cardContainer').each(function(){
    el.addClass('visible')
    addToViewed(el,el.attr('data-title'),$(this).attr('data-url'))
  })
}
function addToViewed($this){
  $this.find('.isviewed').fadeIn()
  let data = $this.attr('data-all')
  if(data){data=JSON.parse(data)}
  if(data){
    //console.log('addToViewed')
    //console.log(data)
    $.ajax({
      url: '/api/isviewed',
      type: 'POST',
      data: data,
      success: function(res) {}
    });
  }

}
function _addToViewed($this){
  $this.find('.isviewed').fadeIn()
  let data = $this.find('.cardContainer').attr('data-all')
  if(data){data=JSON.parse(data)}
  console.log('addToViewed')
  console.log(data)
  $.ajax({
    url: '/api/isviewed',
    type: 'POST',
    data: data,
    success: function(res) {
      $this.addClass('viewed')
     }
  });
}

var _getDistanceFromTop = function (selector) {
    var scrollTop = $(window).scrollTop(),
      elementOffset = selector.offset().top,
      distance = (elementOffset - scrollTop);
    return distance;
}

function displayVideo(el){
  if(!$(el).hasClass('video-on')){
    let _dts = $(el).find('video').attr('data-src')
    let poster = JSON.parse($(el).attr('data-all')).url
    //console.log(`displayVideo ${_dts}`)
    if(_dts){
      $(el).find('.card-img-top.poster').remove()
      $(el).find('video').attr('poster',poster);
      $(el).find('.typeAnim-gif').addClass('done')
      $(el).find('video').attr('src',_dts).show()
    }
    $(el).addClass('video-on')
  }
}

function _displayGif(selector){
  selector.find('.loading').show()
  let url = selector.attr('data-link')
  let extractor= selector.attr('data-extractor')
  let source= selector.attr('data-source')

  console.log({
    event:'displayGif',
    extractor:extractor,
    url:url,
    source:source,
  })
  let checker = 0
  if((url!=undefined)){
    let content = ''
    let videoID =  Math.random().toString().substr(2, 8);
    if(url.indexOf('.gif')>=0){
      selector.attr('data-value',url)
      selector.find('.img-content').css('background-image','url('+url+')')
      selector.find('.img-content').css('background-size','contain')
      selector.find('.loading').hide()
      selector.find('.poster').css('opacity',0)
      checker+=1
    }
    if(url.indexOf('.mp4')>=0){
      content += '<video id="'+videoID+'"  src="'+url+'" class="gifVid" oncanplay="hidePoster(this);setContainerWidth(this)" type="video/mp4" style="width: 100%;height: 100%;display:none"  autoplay loop playsinline muted></video>'
      selector.find('.card').append(content)
      checker+=1
    }
    if(checker>0){
      selector.find('.img-content').attr('data-value',url)
      selector.find('.loading').hide()
      selector.addClass('on')
    }
  }
  if(checker==0){
    $.post('/api/getgif',{url:source,extractor:extractor},function(result){
      let url = result
      selector.find('.img-content').attr('data-value',url)
      selector.attr('data-value',url)
      selector.attr('data-url',url)
      selector.find('.img-content').css('background-image','url('+url+')')
      selector.find('.img-content').css('background-size','contain')
      selector.addClass('on')
      selector.find('.loading').hide()
      selector.find('.poster').hide()
    })
  }


  $(document).find('.gifVid').click(function(){
    var video = $(this).get(0)
    if ( video.paused ) {
      video.play();
    } else {
        video.pause();
    }
  });
}
/*
$(document).on('click','#thumbnail canvas',function(){
  $(this).removeClass('border-warning')
  $(this).addClass('border-success')
})
*/

function displayItOnClick(){
  $(document).on('click','.cardContainer[data-type="video"], .randombg-item',function(){
      let option = {
        url:$(this).attr('data-url'),
        source:$(this).attr('data-source'),
        id:$(this).attr('data-id'),
      }
      if($(this).hasClass('slick-slide')){
        option.slick_index=$(this).attr('data-slick-index')
        option.slick_name=$(this).attr('data-extractor')
      }
      let searchmode = $('#navbar').attr('data-mode')
      if( (!$(this).hasClass('thumbNav')) && (searchmode=='video') && (!$(this).hasClass('displayItOnClick'))  ){
        $(this).addClass('displayItOnClick')
        if((!!document.querySelector('#thumbnail'))&& (!document.querySelector('#topPage')) ){
          thumbNav(option)
          $(this).addClass('thumbNav')
        }
        console.log({
          event:'displayItOnClick',
          option:option,
        })
        let id = option.id
        let source = option.source
        let $this = $(this)
        if($(this).find('video').attr('src')==undefined){
          $(this).find('.loading').fadeIn()
          $.post('/videoURL',{url:source},function(videoURL){
            let content = '<video onload="setContainerWidth(this)" src="'+videoURL+'" id="'+id+'" type="video/mp4" width="100%" height="100%" autoplay controls loop playsinline muted ></video>'
            $this.find('img').hide()
            if(!!document.querySelector('.poster')){
              $this.find('.poster').after(content)
            }else{
              $this.find('.content').append(content)
            }
            $this.find('.loading').fadeOut()
            $this.addClass('on')
            $('canvas[data-id="'+id+'"]').removeClass('border-danger')
            $('canvas[data-id="'+id+'"]').addClass('border-dark')
          })
        }
      }
  })
  $(document).on('click','.cardContainer[data-type="gif"]',function(){
    if(!$(this).hasClass('on')){
      //displayGif($(this))
    }
  })

}
function transformHastag(){

  let searchmode = $('#navbar').attr('data-mode')
      $.each($(document).find('.t'),function(){
        let title = $(this).text().replace(/\#/g, '');
        let content = ''
        title.split(' ').forEach(element => {
          if(element!=' '){
            content += '<a target="_blank" href="/search/'+searchmode+'?keyword='+element+'"  class="hash_tag badge text-dark">'+element+' </a>'
          }
        });
       $(this).html(content)
      })
}
function videoFrames(){
  if ( !! document.querySelector('#myvideo') ){
    $('#thumbnail').html('')
    $('#thumbnail').hide()
    $('.loading.thumbs').show()
    let vidSrc = $('#myvideo').attr('src')
    vidSrc = vidSrc.substring(0,vidSrc.indexOf('#'))
    let duration = $('#duration').text()

    let frame = []
    let scale = (duration/5).toFixed(0)
    for(let i = 1 ;i<5;i++){
        frame.push( i*scale )
    }
    let tt=0
    for(let j=0 ; j< frame.length;j++){
      let cur = frame[j]
      setTimeout(function(){
        skipTime('myvideo',cur)
          screenshots(cur)
          if($('canvas').length>=4){
            $('.loading.thumbs').hide()
            $('#thumbnail').show().css({'display':'flex','z-index:':'91'})
          }
      },tt)
      tt+=2000
    }
  }
}
$(document).on('click','.autoVideo',function(){autoVideo($(this))})
function autoVideo(el){
  let videoId = $(el).attr('data-value')
  let duration = document.getElementById(videoId).duration;
  let frame = []
  let scale = (duration/10).toFixed(0)
  for(let i = 1 ;i<10;i++){
      frame.push( i*scale )
  }
  /*
  console.log({
    event:'autoVideo',
    duration:duration,
    videoID:videoId,
    frame:frame,
  })
  */
  let tt=0
  for(let j=0 ; j< frame.length;j++){
    let cur = frame[j]
    setTimeout(function(){
      skipTime(videoId,cur)
    },tt)
    tt+=10000
  }
}
function skipTime(myid,time) {
  /*
  console.log({
    event:'skiptime',
    time:time
  })
  */
  var vid = $("#"+myid)[0];
  vid.play();
  vid.pause();
  vid.currentTime = time;
  vid.play();
};
function sortHistoryMostViewTime(){
  var elems = $.makeArray($('.history-item'));
  elems.sort(function(a, b) {
      return new Date( $(a).find('.count').attr('data-value') ) < new Date( $(b).find('.count').attr('data-value')  );
  });
  let temp = []
  $.each(elems,function(){
    let title = $(this).find('.title').text()
    if( temp.includes(title) == true ){
      $(this).hide()
    }
    temp.push(title)
  })
  $("#sorted").html(elems);
}
function sortHistory(){
  var elems = $.makeArray($('.history-item'));
  elems.sort(function(a, b) {
      return new Date( $(a).find('.date').text() ) < new Date( $(b).find('.date').text() );
  });
  $.each(elems,function(){
    $(this).show()
  })
  $("#sorted").html(elems);
}
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}
function analyzeTags(){
  $.get('/api/db/favorites',function(result){
    let tags=[];
    result.forEach(element => {
      if(element.tags != undefined){
        element.tags.forEach(tag => {
        $.post('api/dataTags',{tags:tag})
        });
      }
    });

  })
}
function goToLink(el){
  let searchmode = $(el).attr('data-searchmode')
  let tag = $(el).attr('data-tag')
  if($('#extractor').attr('data-value') == 'youtube'){
    searchmode = 'safe'
  }
  let usc = '/search/'+searchmode+'?keyword='+tag
  window.open(usc)
}
function preferencies(callback){
    let searchmode = $('#navbar').attr('data-mode')
    if( !! document.querySelector('#index-tags')){
      $.get('/api/db/settings',function(data){
        if(data.length>0){
          data[0].tags.forEach(tag => {
            $('#index-tags').append('<div class="tag btn btn-outline-primary rounded-pill font-weight-light m-1 px-3" data-value="'+tag+'"><span onclick="makeSearchTag(this)" data-searchmode="'+searchmode+'" data-tag="'+tag+'">'+tag+'</span></div>')
          });
        }
        if(callback){
          callback()
        }
      })
    }
}
Object.defineProperties(Array.prototype, {
  count: {
      value: function(value) {
          return this.filter(x => x==value).length;
      }
  }
});
function searchMode(){

  let searchmode = $('#navbar').attr('data-mode')
  if($('#extractor').attr('data-value') == 'youtube'){
    searchmode = 'safe'
  }
  $('.nav-link[data-mode="'+searchmode+'"]').addClass('text-success')
  $('#formInput').attr('placeholder','Search for '+searchmode+' ...')
    $('button#sendForm').on('click',function(e){
      e.preventDefault()
      let query = $('input#formInput').val()
      $.cookie('latestSearch',query, { expires: 7 })
      if( (query.indexOf('http') == -1) && (query.indexOf('https') == -1) ){
        window.location.href = window.location.origin+'/search/'+searchmode+'?keyword='+query;
      }else{
        window.location.href = window.location.origin+'/video/?url='+query;
      }
    })
  //SAFE MODE
  $('button#safeSearch').on('click',function(e){
      e.preventDefault()
      let query = $('input#formInput').val()
      $.cookie('latestSearch',query, { expires: 7 })
      if( (query.indexOf('http') == -1) && (query.indexOf('https') == -1) ){
        window.location.href = window.location.origin+'/search/safe?keyword='+query;
      }else{
        window.location.href = window.location.origin+'/video/?url='+query;
      }
  })
}
function initSearchImage(){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let keyword = urlParams.get('keyword');
  let pathname = window.location.pathname
  let isDo = false
  if(keyword == null){
    let nEl = $(document).find('#index-tags .tag').length
    var num = Math.floor(Math.random() * nEl + 1);
    keyword = $(document).find('#index-tags .tag:eq('+num+')').text()
    if(pathname.indexOf('/search')>=0){
      if(keyword!=''){
        isDo = true
        if(pathname=="/search/image"){
          console.log({
          event:'initSearchImage',
          keyword:keyword,
          pathname:pathname,
          isDo:isDo
         })
         getImage(keyword,1)
        }else{
          let searchmode = $('#navbar').attr('data-mode')
          window.location.href = window.location.origin+'/search/'+searchmode+'?keyword='+keyword;
        }
      }
    }
  }
}
function searchImageForm(){

  $(document).on('click','#more-images',function(){
    let keyword = $(this).attr('data-keyword')
    let page = $(this).attr('data-page')
    console.log({
      keyword:keyword,
      page:page
    })
    getImage(keyword,page)
    $(this).attr('data-page',parseInt(page)+1)
  })

}
function getImage(keyword,page){
  console.log({
    event:'getImage',
    keyword:keyword,
    page:page
  })
  if(page == undefined){page=1}
  $('.search-img input').val(keyword)
  $('#query').html(keyword)
  if(page==1){
    $('.image-container').fadeOut()
  }
  $('.loading').fadeIn()
  $.get('/api/images?keyword='+keyword+'&page='+page,function(data){
    $('.loading').fadeOut()
    if(data){
      data.forEach((image,index) => {
        let dataContent = $('.cardContainer').last().clone()
        dataContent.show()
        dataContent.attr('data-value',image.url)
        dataContent.find('img.card-img-top').attr('data-value',image.url)
        dataContent.find('img.card-img-top').attr('src',image.url)
        dataContent.find('img.card-img-top').attr('alt',image.title)
        dataContent.find('.favAnim').attr('data-id','gi-'+index)
        dataContent.find('.addToFav').attr('data-id','gi-'+index)
        dataContent.find('.addToFav').attr('data-value',image.url)
        dataContent.find('.addToFav').attr('src',image.url)
        dataContent.find('.addToFav').attr('alt',image.title)
        dataContent.find('.zoom_in').attr('data-value',image.url)
        dataContent.find('.download').attr('href',image.url)
        dataContent.find('.t').html(image.title)

        $('.image-container').append(dataContent)
      });
      $('#more-images').attr('data-keyword',keyword)
      $('#more-images').attr('data-page',parseInt(page)+1)
      if(page>=1){
      $('#more-images').fadeIn()
      $('.image-container').fadeIn()
      }
    }
    transformHastag()
  })
}
function initdesign(){
}
function afterAllisDone(){
  $('select').niceSelect()
  feather.replace({'stroke-width': 1 })
  $(window).on('resize',function() {
    ww = $(window).width()
    $(document).find('.thumb canvas').each(function(){
      if(ww>=760){
        $(this).removeClass('rounded-circle')
        $(this).addClass('rounded')
        $(this).css('width','20vw')
        $(this).css('height','10vw')
      }else{
        $(this).removeClass('rounded')
        $(this).addClass('rounded-circle')
        $(this).css('width','45px')
        $(this).css('height','45px')
      }
    })
    $('.content').each(function(){
      let $slick =  $(this)
      $slick.find('.cardContainer').each(function(){
        //setContainerWidth($(this).find('img'))
        //setContainerWidth($(this).find('video'))
      })
    })

  })

    let extractors = visibleExtractor()
    extractors.forEach(extractor => {
      if(!$('.loading.search[data-id="'+extractor+'"]').hasClass('visibleExtractor-on')){
        $('.loading.search[data-id="'+extractor+'"]').addClass('visibleExtractor-on')
        loadResultSearch({reset:false,triger:'true',extractor:extractor})
        //extractorBanner({extractor:extractor})
      }
    });

  var timeoutId
  let cScroll=0
  $(window).on('scroll', function () {
    if ($(window).scrollTop() == 0){
      $('footer').fadeIn();
    }else{
        if ($(window).scrollTop() > cScroll){
          $('footer').fadeOut()
        }else{
          $('footer').fadeIn();
        }
    }
    cScroll = $(window).scrollTop()
    let extractors = visibleExtractor()
    extractors.forEach(extractor => {
      if(!$('.loading.search[data-id="'+extractor+'"]').hasClass('visibleExtractor-on')){
        loadResultSearch({reset:false,triger:'true',extractor:extractor})
        //extractorBanner({extractor:extractor})
        $('.loading.search[data-id="'+extractor+'"]').addClass('visibleExtractor-on')
      }
    });

    if( !! document.querySelector('#loading_page')){
      cScroll = $(window).scrollTop() + vh
      var $el = $('#related');
      var bottom = parseInt($el.position().top + $el.outerHeight(true) - (vh));
      if((bottom+$('#loading_page').outerHeight(true)) <= (cScroll)){
          $('#loading_page').find('.loading').show()
          if(!$('#loading_page').hasClass('ready')){
            $('#loading_page').addClass('ready')
            if(!!document.querySelector('#favorites')){
              loadElementFrom({rd:false},'favorites')
            }
              if(!!document.querySelector('#history')){
              loadElementFrom({rd:false},'history')
            }
            setTimeout(() => {
              $('#loading_page').removeClass('ready')
            }, 3000);
          }
      }else{
        $('#loading_page').find('.loading').hide()
        $('#loading_page').removeClass('ready')
      }
    }
  });
}
//RESPONSIVE VIEW
$(window).on('load resize',function() {
  var viewportWidth = $(window).width();
  if(viewportWidth <= 500){
    $('#single #related').css('height','auto !important')
    $('#single').css({
      'height':'90vh',
      'overflow-y':'scroll',
      'overflow-x':'hidden'
    })
    //Display navbar
    $('.mcollapse').each(function(){
      $(this).addClass('collapse')
    })
  }else{
    if(!$('#single #related').hasClass('position-fixed')){
      //$('#single #related').addClass('position-fixed')
    }
    $('#single #related').css('height','100vh !important')
    $('#single').css({
      'overflow':'hidden',
    })
  }
});
function thumbNav(option){
  /*
  console.log({
    event:'thumbNav',
    option:option
  })
  */
  let searchmode = $('#navbar').attr('data-mode')
  $('#thumbnail').show()
  $('#thumbnail').css('z-index','99')
  let extractor = option.slick_name || $('.extractor.active').attr('id')
  let scrollID = '#scrollto-'+extractor
  if(!!document.querySelector('#favorite')){
    scrollID = '#'+option.id
  }
    let index = $('canvas').length + 1
    if(ww>=760){
      $('#thumbnail').prepend('<a class="thumb" data-extractor="'+extractor+'"" data-index="'+option.slick_index+'"  data-url="'+option.url+'" onclick="previewGo(this)" style="cursor:pointer;"><canvas id="canvas'+index+'" class="shadow rounded border border-3 border-white m-2" style="height: 10vw;width: 20vw;"></canvas></a>')
    }else{
      $('#thumbnail').prepend('<a class="thumb" data-extractor="'+extractor+'"" data-index="'+option.slick_index+'"  data-url="'+option.url+'" onclick="previewGo(this)" style="cursor:pointer;"><canvas id="canvas'+index+'" class="shadow rounded-circle border border-3 border-white m-2" style="height: 45px;width: 45px;"></canvas></a>')
    }
    $('#canvas'+index+'').css('background-size','cover')
    $('#canvas'+index+'').css('background-position','center')
    thumbNavIndex()
    lazyLoad_favthumb()
}
function slickslidgo(el){
  let index = $(el).attr('data-index')
  let extractor = $(el).attr('data-extractor')
  console.log({
    event:'slickslidgo',
    index:index,
    extractor:extractor,
  })
  $('.content[data-id="'+extractor+'"]').slick('slickGoTo', parseInt(index))
}
function screenshots(cur){
  console.log({
    event:'screenshots',
    cur:cur
  })
  if(!!document.querySelector('#myvideo')){
    let index = $('canvas').length + 1
    $('#thumbnail').append('<canvas id="canvas'+index+'" style=" height: 45px;width: 75px;" data-time="'+cur+'"></canvas>')
    var v = document.getElementById("myvideo");
    var c = document.getElementById('canvas'+index+'');
    var ctx = c.getContext('2d');
    ctx.drawImage(v,0,0)
    /*
    v.addEventListener('play',function() {i=window.setInterval(function() {ctx.drawImage(v,5,5,260,125)},20);},false);
    v.addEventListener('pause',function() {window.clearInterval(i);},false);
    v.addEventListener('ended',function() {clearInterval(i);},false);
    */
  }
}
$(document).on('click','#capture',function(){videoFrames()})


$(document).on('click','canvas',function(){
  if(!!document.querySelector('#myvideo')){
    let curTime=$(this).attr('data-time')
    skipTime('myvideo',curTime)
  }
})


function loadedVideo(){

  var v = document.getElementById("myvideo");
  v.addEventListener('progress', function() {
    var range = 0;
    var bf = this.buffered;
    var time = this.currentTime;

    while(!(bf.start(range) <= time && time <= bf.end(range))) {
        range += 1;
    }
    var loadStartPercentage = bf.start(range) / this.duration;
    var loadEndPercentage = bf.end(range) / this.duration;
    var loadPercentage = loadEndPercentage - loadStartPercentage;
  });
}



function sumDivColumn(index,ratio){
  let result = 0
  let upward=0
  let topdiv = index-ratio
  if(index<ratio){
    upward += parseFloat($(document).find('#related').find('.cardContainer').eq(index).height())
    $(document).find('#related').find('.cardContainer').eq(index).attr('data-upward',upward)
  }else{
    upward += parseFloat($(document).find('#related').find('.cardContainer').eq(topdiv).attr('data-upward'))
    result = upward
    upward += parseFloat($(document).find('#related').find('.cardContainer').eq(index).height())
    $(document).find('#related').find('.cardContainer').eq(index).attr('data-upward',upward)
  }
  return result
}

function randombg(){
  if(!!document.querySelector('.randombg')){
    $('.randombg').each(function(){
      let col = $(this).attr('data-value')
      let NumSlide = [3,2,1]
      callback(col,NumSlide)
    })
    $(document).on('click','.resetRand',function(){
      let col = $(this).attr('data-value')
      let index = '#'+$(this).attr('data-id')
      let NumSlide = [3,2,1]
      callback(col,NumSlide)
      $("html").animate( { scrollTop: $(index).offset().top }, 500 );
    })
    //var intervalID = setInterval(callback, 3000);
    function callback(collection,NumSlide){
      let coll=collection
      let $this = $('.randombg[data-value="'+coll+'"')
      let divHeight = parseInt(vh*0.9)
      if($this.hasClass('slick-slider')){
        $this.slick('unslick');
      }
      $.get('/api/db/'+coll,function(res){
        $this.html('')
        let result=[];isDone=[]
        if($.cookie('randombg')!=undefined){
          isDone = $.cookie('randombg')
        }
        while(result.length<10){
          let rand=Math.floor(Math.random() * res.length + 1);
          try{
            if((result.includes(res[rand].preview)==false)&&(isDone.includes(res[rand].preview)==false)){
              result.push(res[rand].preview)
              isDone = isDone.concat(result)
              $.post('/api/addone/randombg',res[rand])
              $.cookie('randombg', isDone, { expires: 7 });
              if(coll=='favorites'){
                let loaderContent = '<div class="loading text-center text-dark" data-id="unique-'+rand+'"  style="display:none;position: absolute;top: 0;left: 0z-index: 99;margin: 5%;"><div class="spinner-grow" role="status"></div></div>'
                $this.append('<div class="randombg-item text-center fa_vid_item position-relative" data-extractor="'+res[rand].extractor+'" data-id="unique-'+rand+'" data-url="'+res[rand].url+' "data-source="'+res[rand].source+'"  style="height:'+divHeight+'px;background-image:url('+res[rand].url+');background-size:contain;background-position:center;cursor:pointer">'+loaderContent+'<img class="poster mx-auto" data-url="'+res[rand].url+'" src="'+res[rand].url+'" style="height:100%;opacity:0"></div>')
              }
              if(coll=='favoriteImage'){
                $this.append('<div class="randombg-item text-center" data-extractor="'+res[rand].extractor+'" data-id="unique-'+rand+'" data-url="'+res[rand].url+'" style="height:'+divHeight+'px;background-image:url('+res[rand].preview+');background-size:contain;background-position:center;"></div>')

              }
              if(coll=='favoriteGif'){
                if(res[rand].url.indexOf('.mp4')>=0){
                  $this.append('<div class="randombg-item text-center" style="height:'+divHeight+'px;background-image:url('+res[rand].preview+');background-size:contain;background-position:center;"><img class="poster mx-auto" data-url="'+res[rand].url+'" data-id="unique-'+rand+'" src="'+res[rand].preview+'" style="opacity:0"><video  oncanplay="hidePoster(this);setContainerWidth(this)" src="'+res[rand].url+'" class="gifVid" type="video/mp4" style="width: 100%;height: 100%;display:none" autoplay loop playsinline controls muted></video></div>')
                }else{
                  $this.append('<div class="randombg-item text-center" data-id="unique-'+rand+'" data-url="'+res[rand].url+'"style="height:'+divHeight+'px;background-image:url('+res[rand].url+');background-size:contain;background-position:center;"></div>')
                }
              }
              //imageDownloader($('.randombg-item[data-id="unique-'+rand+'"]'))
            }
          }catch{}
        }

      $this.slick({
        dots: false,
        arrows: false,
        infinite: false,
        fade: false,
        slidesToShow: NumSlide[0],
        slidesToScroll: NumSlide[0],
        speed: 1000,
        autoplay: false,
        autoplaySpeed: 4000,
        cssEase: 'linear',
        responsive: [
          {
            breakpoint: 1080,
            settings: {
              slidesToShow: NumSlide[1],
              slidesToScroll: NumSlide[1],
              infinite: false,
              dots: false
            }
          },
          {
            breakpoint: 780,
            settings: {
              slidesToShow: NumSlide[2],
              slidesToScroll: NumSlide[2],
              infinite: false,
              dots: false
            }
          },
        ]
      });
      })
    }
  }
}
function flexibleSlider($slick){
  if(!$slick.hasClass('flexibleSlide-initialized')){
    //$('.slick-view.slick-control').hide()
    //$('.slick-view.slick-control.grid').show()
      $slick.attr('data-design','slider')
      $slick.hScroll(100);
      $slick.addClass('flexibleSlide-initialized')
      $slick.addClass('d-flex flex-row')
      $slick.removeClass('row')
      $slick.css({
        'overflow-y': 'hidden',
        'overflow-x': 'auto',
        'width':'100vw',
        'height':'50vh'
      })
      $.get('/api/db/settings',function(result){
        //console.log(`slick height setting ${result[0].slick_height}`)
        if(result && result[0]){
          if(result[0].slick_height){
          $slick.css('height',`${result[0].slick_height/100*wh}px`)
        }
      }
        
      })

    $slick.find('.cardContainer').each(function(){
      let ccl = $(this)
      let img = ccl.find('img')
      let vid = ccl.find('video')
      let img_w = img.width() || vid.width()
      let img_h = img.height() || vid.height()
      img.on('error',function(){
        imageDownloader(ccl,{dest:'./public/img/fav/',do:true})
      })
      let g_w = parseFloat($slick.height()) * parseFloat(img_w) / parseFloat(img_h)
      if($slick.hasClass('flexibleSlide-initialized')){
        img.css('width',`${g_w}px`)
        //console.log(g_w)
        vid.css('width',`${g_w}px`)
      }
      ccl.css('flex','none')
      ccl.attr("class").split(/\s+/).forEach(el => {
        if(el.indexOf('col')>=0){
          ccl.removeClass(el)
        }
      });
    })
    //flexibleSlide_addto()
  }else{
      $slick.find('.cardContainer').each(function(){
        //setContainerWidth($(this).find('img'))
        //setContainerWidth($(this).find('video'))
      })
  }
}
function slickControler(el){
  let s_id = $(el).attr('data-id')
  let $this = $(el).find('.i')
  let $slick = $(`.content[data-id="${s_id}"]`)
      $this.closest('.slick-control').toggleClass('init')
      if($this.closest('.slick-control').hasClass('slick-play')){
        if($this.hasClass('on')){
          $slick.slick('slickPlay')
        }
        if($this.hasClass('off')){
          $slick.slick('slickPause')
        }
      }
      if($this.closest('.slick-control').hasClass('slick-view')){
        if($this.hasClass('on')){
          setColum($slick)
        }
        if($this.hasClass('off')){
          destroyAbs($slick)
          flexibleSlider($slick)
        }
      }
      if($this.closest('.slick-control').hasClass('slick-backtop')){
        $(window).scrollTop($('.c_ct[id="'+s_id+'"]').offset().top - 100);
      }

}



function transformSlider(extractor){
  let $slick = $(document).find('.content[data-id="'+extractor+'"]')
  if( $slick.hasClass('slick-initialized')){
    $slick.slick('unslick');
  }
  slickControl($slick)
  $slick.slick(slick_option);

  
}
function isPorn(){

}
function _isPorn(){

  $.get('/api/db/JPO',function(result){
    let tt =[]; let isJpoData = []
    result.forEach(element => {
      element.JPOtoday = new Date(element.JPOtoday).toLocaleDateString('ja-JP')
      if((tt.includes(element.JPOtoday)==false)&&(isJpoData.length<=7)){
        tt.push(element.JPOtoday)
        isJpoData.push({x:element.JPOtoday,y:element.note})
      }
    })

    const ctx = $('#isJpo');
    const myChart = new Chart(ctx, {
      type: 'line',
      data: {
          datasets: [{
            label: 'Mood',
            data: isJpoData.reverse(),
            backgroundColor: '#34C3AB',
            borderColor: '#34C3AB',
          }]
      },
      options: {
          scales: {
              y: {
                  beginAtZero: true
              }
          }
      }
    });
  })
  //hideporn DB
  var d = new Date();
  var options = {
      year: "numeric",
      month: "2-digit",
      day: "numeric"
  };
  let today = d.toLocaleString("ja-JP",options);
  let isPorn = {
    'viewed':true,
    'lastViewed':today,
    'currentSpan':0,
    'longestSpan':0,
    'visible':false,
    'today':today,
    '_date':d,
  }
  $.get('/api/db/isPorn',function(result){
     if(result.length>0){
       if(result[0].today == isPorn.today){
         isPorn = result[0]
         delete isPorn._id
         isPorn.visible = false
        $.post('/api/addone/isPorn',isPorn,function(){
        })
       }
      }else{
        $.post('/api/addone/isPorn',isPorn,function(){
        })
      }
  })
  //Calendar
  if($.cookie('datePorn')!=undefined){
    $('button[data-id="input-date"]').hide()
    $('#input-date').datepicker({
      language: "ja",
      format: 'yyyy年mm月dd日',
      autoclose: false,
      startDate: new Date(new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/1'),
      endDate: new Date(),
      beforeShowDay: function(date) {
          return customCalendar(date,$.cookie('datePorn'))
        }
    })
    $('#input-date').datepicker('show')
    $('#input-date .loading').hide()
  }else{
    $('button[data-id="input-date"]').on('click',function(){
      $('#input-date .loading').show()
      $.get('/api/db/isPorn',function(result){
        $('#input-date .loading').hide()
        $('button[data-id="input-date"]').hide()
        if(result.length>0){
          let isPorn=result
          //SPAN CHART
          let spanChartData = []
          let tt = []
          let isPornData = {}
          var options = { hour: '2-digit', minute: '2-digit' };
          isPorn.forEach(element => {
            element.today = new Date(element.today).toLocaleDateString('ja-JP')
            if((tt.includes(element.today)==false)&&(element.viewed=="true")){
              tt.push(element.today)
            }
            if(isPornData[element.today]==undefined){
              isPornData[element.today] = []
            }else{
              if(element.visible){
                isPornData[element.today].push({stat:element.visible,date:new Date(element._date),hour: new Date(element._date).toLocaleString("ja-JP",options)})
              }
            }
            if((element.today==new Date().toLocaleDateString('ja-JP'))&&(spanChartData.length<1)){
              spanChartData.push(element)
            }
          });
          $.cookie('datePorn',tt,{expire:7})
          $('#input-date').datepicker({
            language: "ja",
            format: 'yyyy年mm月dd日',
            autoclose: false,
            startDate: new Date(new Date().getFullYear()+'/'+(new Date().getMonth()+1)+'/1'),
            endDate: new Date(),
            beforeShowDay: function(date) {
                return customCalendar(date,tt)
              }
          })
          $('#input-date').datepicker('show')
          /*
          //console.log(spanChartData)
          //console.log(isPornData)
          let isPornDataResult = {}
          Object.keys(isPornData).forEach(function(day,index){
            let date = isPornData[day]
            isPornData[day].forEach((el,i) => {
              let hour = moment(el.date)
              let stat = el.stat
              if(isPornDataResult[day]==undefined){
                isPornDataResult[day]=0
              }
              if(i>0){
                let lastHour = moment(isPornData[day][i-1].date)
                let lastStat = isPornData[day][i-1].stat
                isPornDataResult[day] += hour.diff(lastHour, 'second')
              }
            });
          })
          let isPornDataResultFinal = []
          Object.keys(isPornDataResult).forEach(element => {
            if(isPornDataResultFinal.length<=7){
              isPornDataResultFinal.push({
                x:element,
                y:parseFloat(isPornDataResult[element]*(-1)/3600).toFixed(1)
              })
            }
          });
          //console.log(isPornDataResultFinal)

          const ctx = $('#isPorn');
          const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [{
                  label: 'Hours/Day',
                  data: isPornDataResultFinal.reverse(),
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
          });
          spanChartData
          spanChartDataRes = [{y:'Current',x:spanChartData[0].currentSpan},{y:'Longest',x:spanChartData[0].longestSpan}]
          const ctx2 = $('#isSpan');
          const myChart2 = new Chart(ctx2, {
            type: 'bar',
            data: {
                datasets: [{
                  label: 'Current/Longest',
                  data: spanChartDataRes,
                  backgroundColor: 'rgb(255, 99, 132)',
                  borderColor: 'rgb(255, 99, 132)',
                }]
            },
            options: {
              indexAxis: 'y',
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                elements: {
                  bar: {
                    borderWidth: 2,
                  }
                }
            }
          });
          */
        }
      })
    })
  }

}
function watchPorn(){
  $.cookie('isPorn',true,{expire:7})
  $.cookie('isPorn_d',true,{expire:1})
  location.reload()
}
function hidePorn(){
  $.cookie('isPorn',false,{expire:7})
  location.reload()
}
$(document).on('click','.watchPorn',function(){
  $('#WPO').popup('show');
  //watchPorn()
})
$(document).on('click','#WPO .confirm',function(){
  watchPorn()
})
$(document).on('click','.hidePorn',function(){
  hidePorn()
})

function ratingPopup(){
  $('.ratings').on('click',function(){
    $('.ratings').each(function(){
        $(this).addClass('off')
    })
    $(this).toggleClass('off')
    if(!$(this).hasClass('off')){
      let feelings = ['very bad','bad','normal','good','very good']
      $('.submit_JPO').html('I feel '+feelings[$(this).parent().next().attr('value')])
    }
  })
  $(document).on('click','.JPO_open',function(){
    $(document).find('.JPO_open').each(function(){
        $(this).removeClass('on')
    })
    $(this).addClass('on')
  })
  $('#JPO').popup({
    autoopen: false
  });
  $('.submit_JPO').on('click',function(){
    let result = {}
    const d = new Date();
    var options = {
        year: "numeric",
        month: "2-digit",
        day: "numeric"
    };
    let today = d.toLocaleString("ja-JP",options);
    result.JPOtoday=today
    result.JPOdate=d
    $('#JPO form input').each(function(){
      if($(this).prop("checked")){
      result[$(this).attr('name')] = $(this).val()
      }
    })

    result.JPOtitle = $('.JPO_open.on').closest('.cardContainer').attr('data-title') || $(this).attr('data-title')
    result.JPOurl =  $('.JPO_open.on').closest('.cardContainer').attr('data-link') || $(this).attr('data-url')

    $.post("/api/addone/JPO",result,function(){
      $('#JPO').popup('hide');
      $('.JPO_open').hide()
    })

  })
}
function favoriteThumbNav(el){
  if(!$(el).hasClass('on')){
    $(el).addClass('on btn-light')
    $(el).removeClass('btn-dark')
    //$(el).hide()
    let today = new Date().toLocaleString('en-US',{month:'numeric',year:'numeric',day:'numeric'});
    $.get('/api/db/favoriteImage?favDateToday='+today,function(results){
      let st = []
      results.forEach(element => {
        if(st.includes(element.url)==false){
          st.push(element.url)
          thumbNav(element)
        }
      });
    })
  }
}
function LazyLoad(){
  $(document).find('.lazyload').not('.template').slice(0, 3).each(function(index) {    
    let $this = $(this)
    if(
      ($this.hasClass('lazyload'))&&
      (_getDistanceFromTop($this)<=(vh))&&(_getDistanceFromTop($this)>(vh*(-0.5)))
      ){
        displayEl($this)
        //addToViewed($this)
    }
  })
}

function lazyLoad_favthumb(){
  $('#thumbnail').find('.thumb').each(function(){
    let _img = $(this).attr('data-url')
    let _ol = $(this).offset().left
    if((_ol<=win.width())&&(!$(this).hasClass('visible'))){
      $(this).find('canvas').css('background-image','url('+_img+')')
      $(this).addClass('visible')
    }
  })
}
function flexibleSlide_addto(){
  /*
  $('.content').scroll(function() {
    $(this).find('.cardContainer').each(function(){
      let _ol = $(this).offset().left
      if((_ol<=win.width())&&(!$(this).hasClass('visible'))){
        $(this).addClass('visible')
        addToViewed($(this),$(this).attr('data-title'),$(this).attr('data-url'))
      }
      //setContainerWidth($(this).find('img'))
      //setContainerWidth($(this).find('video'))
    })
  })
  */
  $(document).find('.content').each(function(){
    //console.log('design 2-2')
    let _ol = $(this).offset().left
    if((_ol<=win.width())&&(!$(this).is(':visible'))){
      $(this).addClass('visible')
      //addToViewed($(this))
    }
  })
}
function thumbNavIndex(){
  $('.thumb').each(function(index){
    $(this).attr('data-index',index)
  })
}
function imageDownloaderButton(option){
  let dest = option.dest || false
  let do_ = option.do || false
  $(document).on('click','.dlimg',function(){
    $(this).removeClass('dlimg text-dark')
    $(this).addClass('text-danger')
    $(this).hide()
    let $this=$(this)
    let container = $(this).closest('.cardContainer')
    container.find('.is-dlimg-loader').show()
    if(!container.hasClass('is-dlimg')){
      container.addClass('is-dlimg')
      let imgurl= container.attr('data-url')
      $.get('/api/dlimg?imgurl='+imgurl+'&do='+true,function(img_path){
        if(img_path){
          let imgpath = window.location.origin+img_path.replace('./public','')
          if(container.find('.img-content').length>0){
            container.find('.img-content').css('background-image','url('+imgpath+')')
          }else{
            container.css('background-image','url('+imgpath+')')
          }
          container.attr('data-path',imgpath)
        }else{
          container.find('.content').prepend('<span>Error retrieving image</spam><a href="'+imgurl+'" target="_blank"> See original</a>')
        }
        container.find('.is-dlimg-loader').hide()
        $this.show()
      })
    }
  })
}
function todlimg(el){
  let container = $(el).closest('.cardContainer')
  container.addClass('to-dlimg')
}
function isCorrupted(el){
  //console.log('img error')
  let $this = $(el).closest('.cardContainer');
  //console.log($this)
  imageDownloader($this,{dest:false,do:false})
}
function imageDownloader(container,option){ 
  //console.log('imageDownloader')
  let dest = option.dest || false
  let do_ = option.do || false
  let searchmode = $('#navbar').attr('data-mode')
  let imgurl = container.attr('data-url')
  let extractor = container.data('extractor')
  if(!container.hasClass('is-dlimg')){
      container.addClass('is-dlimg')
      $.get('/api/dlimg?imgurl='+imgurl+'&searchmode='+searchmode+'&do='+true+'&extractor='+extractor+'&dest='+dest,function(img_path){
        if(img_path){
          let imgpath = window.location.origin+img_path.replace('./public','')
          $.get('/api/db/allMedia?so_b=url&so_k='+imgurl,function(result){
            if(result){
              $.post('/api/update/allMedia?elementTypeID='+result._id,{imgpath:imgpath})
            }
          })
        }
        displayEl(container)
      })
  }

}
function _imageDownloader(container,option){
  //console.log('imageDownloader')
  let dest = option.dest || false
  let do_ = option.do || false
  let searchmode = $('#navbar').attr('data-mode')
  let imgurl = container.attr('data-url')
  if(!container.hasClass('is-dlimg')){
      let loader = container.find('.loading')
      loader.addClass('d-flex')
      let extractor = container.data('extractor')
      container.addClass('is-dlimg')
      container.find('.dlimg').hide()
      container.find('.dlimg').removeClass('text-dark')
      container.find('.dlimg').addClass('text-danger')
      container.find('.is-dlimg-loader').show()
      $.get('/api/dlimg?imgurl='+imgurl+'&searchmode='+searchmode+'&do='+true+'&extractor='+extractor+'&dest='+dest,function(img_path){
        if(img_path){
          let imgpath = window.location.origin+img_path.replace('./public','')
          /*
          if(img.width<10){
            if(container.find('.img-content').length>0){
              container.find('.img-content').css('background-image','url('+imgpath+')')
            }else{
              container.css('background-image','url('+imgpath+')')
            }
          }
          */
          container.attr('data-path',imgpath)
          container.find('.card-img-top').attr('src',imgpath)
          loader.removeClass('d-flex')
          container.find('.setContainerWidth').removeClass('setContainerWidth')
          container.find('.card-img-top').on('error',function(){
            container.find('.card-img-top').attr('src',imgurl)
          })
        }else{
          container.find('.content').prepend('<span>Error retrieving image</spam><a href="'+imgurl+'" target="_blank"> See original</a>')
        }
        container.find('.is-dlimg-loader').hide()
        container.find('.dlimg').show()
        container.find('.dlimg').removeClass('dlimg')
        //container.removeClass('is-dlimg')
      })
  }

}
function isimagefile(imgurl){
  if(imgurl!=undefined){
    return(imgurl.match(/\.(jpeg|jpg|gif|png)$/) != null);
  }else{
    return false
  }
}
function extractorBanner(option){
  let ex = option.extractor
  $.get('/api/db/allMedia?so_b=extractor&so_k='+ex,function(res){
    let u_ = res.url
    $('#scrollto-'+ex).css('background-image','url('+u_+')')
    $('#scrollto-'+ex).css('height','50vh')
  })
}
function autoInputSite(el){
  let _u = new URL($(el).val())
  if(_u){
    $(el).closest('form').find('[name="site"]').val(_u.hostname)
  }
}
function slickControl($slick){
  let s_id = $slick.attr('data-id')
  $slick.on('init swipe afterChange',function(slick){
    $('.slick-control[data-id="'+s_id+'"]').show().removeClass('destroy').removeClass('init')
    $.each($slick.find('.cardContainer.slick-active'),function(){
      $this = $(this)
      $(this).find('.card').attr('data-doubletap',moment().subtract('seconds', 3).format())
      if(!$this.hasClass('template')){
        let title = $this.attr('data-title')
        let url = $this.attr('data-url')
        let video = $this.find('video').get(0)
        let gif = $this.find('img')

        if($this.hasClass('slick-active') ){
          if(video!=undefined){
            if ( video.paused ) {
              video.play()
            }
          }
        }
        if(!$this.hasClass('slick-active') ){
          if(video!=undefined){
            if ( !video.paused ) {
              video.pause()
            }
          }
        }
      }
    })
  })
  $slick.on('destroy',function(event,slick){
    allisviewed(s_id)
  })
  $slick.on('edge',function(event, slick, direction){
    if(direction=='left'){
      loadResultSearch({reset:true,triger:'true',extractor:s_id})
    }
  })
  $(document).on('click','.slick-control[data-id="'+s_id+'"] .i',function(){
    $(this).closest('.slick-control').toggleClass('init')
    if($(this).closest('.slick-control').hasClass('slick-play')){
      if($(this).hasClass('on')){
        $slick.slick('slickPlay')
      }
      if($(this).hasClass('off')){
        $slick.slick('slickPause')
      }
    }
    if($(this).closest('.slick-control').hasClass('slick-view')){
      if($(this).hasClass('on')){
        setColum($slick)
      }
      if($(this).hasClass('off')){
        destroyAbs($slick)
        $slick.slick(slick_option)
        $slick.find('.img-content').removeClass('bg-cover')
      }
    }
    if($(this).closest('.slick-control').hasClass('slick-backtop')){
      $(window).scrollTop($('.extractor[id="'+s_id+'"]').offset().top - 100);
    }
  })
}
function allisviewed(extractor){
  $.each($(document).find('.cardContainer[data-extractor="'+extractor+'"]'),function(){
    let $this=$(this)
    if(!$this.hasClass('template')){
      let title = $this.attr('data-title')
      let url = $this.attr('data-url')
      addToViewed($this,title,url)
    }
  })
}

function destroyAbs($slick){
  console.log('destroyAbs')
  $slick.find('.abs-active').each(function(){
    $(this).removeClass('abs-active')
    $(this).find('.card.img-content').css('height','auto')
    $(this).find('.cardContainer').css('height','auto')
    $(this).find('video').css('height','100%')
  })
  $slick.find('.abs-col').each(function(){
    let st = $(this).html()
    $(this).remove()
    $slick.append(st)
  })
  $.cookie('abs-col','false',{expire:1})
  $('[abs-col]').each(function(){
    $(this).attr('abs-col','false')
  })
}
function c_toggleClass(el,c){
  $(el).toggleClass(c)
  $(el).find('span').toggle()
  $(el).find('svg').toggle()
}
function searchSubreddits(el){
  if(!$(el).hasClass('wait')){
      $(el).addClass('wait')
      setTimeout(() => {
        $('#searchRes').html('')
        $('#searchRes').append('<li class="list-group-item loading text-center p-3"><div class="loader spinner-border"><span class="visually-hidden">Loading ...</span></div></li>')
        let key = $(el).val()
        let api_url = `/api/searchSubreddits?query=${key}`
        if((key!='')&&(key.length>0)){
          $.get(api_url,function(res){
            let content = ''
            res.forEach(element => {
              let a_u = encodeURIComponent('https://www.reddit.com'+element['url']+'new/.json?count=25&after=')

              content +=`<li class="list-group-item btn btn-outline-light text-start"><span data-title="${element['title']}" data-url="${a_u}" onclick="addSite(this)">${element['title']}</span><span class="bg-danger badge float-end r18 ${element.r18}">R18</span></li>`
            });
            $('#searchRes').find('.loading').remove()
            $('#searchRes').append(content)
            $(el).removeClass('wait')
          })
        }else{
          $('#searchRes').html('')
          $(el).removeClass('wait')
        }
      }, 1000);

  }
}
function addSite(s){
  let obj = {
    site:`REDDIT (${$(s).attr('data-title')})`,
    siteurl:decodeURIComponent($(s).attr('data-url')),
    isNewPage:'off',
    statut:'true'
  }
  $.post('/api/addone/image',obj,function(result){
    console.log(result)
    $.cookie('activ_ext',result,{expire:7})
    window.location = '/search';
  })
}
function makeSearchTag(el){
  let tag = $(el).attr('data-tag')
  $('#searchSubreddits').val(tag).change()
  $('#index-tags').collapse('hide')
}
function setContainerWidth(el){

  if(!!document.querySelector('#favorite') || !!document.querySelector('#history')){
    return
  }
  let ccl = $(el)
  let $slick = ccl.closest('.content')
  if(!$slick.hasClass('setContainerWidth')){
    $(el).addClass('setContainerWidth')
    let img_w = ccl.width()
    let img_h = ccl.height()
    let g_w = parseFloat($slick.height()) * parseFloat(img_w) / parseFloat(img_h)
    ccl.css('width',`${g_w}px`)
    ccl.closest('.cardContainer').css('width','fit-content')
    //console.log(`setContainerWidth ${g_w}`)
  }
}
function reset_content(el){
  let extractor = $(el).attr('data-id')
  if((extractor!=undefined)&&(extractor!='')){
    $('.content[data-id="'+extractor+'"]').html('').removeAttr('style').removeClass('flexibleSlide-initialized')
  }else{
    $('.content').html('').removeAttr('style').removeClass('flexibleSlide-initialized')
  }
}
function controlSwitch(){
  $(document).find('[data-switch]').each(function(){
    let s_id = $(this).attr('data-switch').substring(0,$(this).attr('data-switch').lastIndexOf('-'))
    let s_stat = parseInt($(this).attr('data-switch').replace(s_id,'').replace('-',''))
    if(s_stat==1){
      $(this).hide()
    }
  })
  $(document).on('click','[data-switch]',function(){
    let s_id = $(this).attr('data-switch').substring(0,$(this).attr('data-switch').lastIndexOf('-'))
    let s_stat = parseInt($(this).attr('data-switch').replace(s_id,'').replace('-',''))
    $(document).find('[data-switch]').show()
    $(this).hide()
    $(this).closest('.isnp-container').hide()
  })
}
function updateIsNewPage(el){
  let s_inp = $(el).attr('data-value')
  let obj = {'isNewPage':s_inp}
  $.get('/api/db/image?so_b=site&so_k='+$(el).attr('data-extractor'),function(result){
    let s_id=result._id
    $.post('/api/update/image?elementTypeID='+s_id,obj)
  })

}
function updateStatut(el){
  let s_extractor = $(el).attr('data-extractor')
  //console.log(s_extractor)
  $.post('/api/delete/image?elementTypeID='+s_extractor)
  $(el).hide()
  $(el).closest('.c_ct').hide()
}
function takeabreak(option){
  let interval_sec = option.interval
  let interval_min = option.interval*60
  let duration_sec = option.duration
  let next_break = $.cookie('break-1')
  if(!$.cookie('break-1') || moment(next_break).isBefore()){
    next_break = moment().add('seconds', interval_min).format();
    $.cookie('break-1',next_break,{expire:1})
  }
  let diff_sec = diff_second(new Date(next_break),new Date())
  console.log({ next_break:next_break,diff_sec:diff_sec })
  let myVar = setInterval(function(){
    if(diff_sec<=0){
      clearInterval(myVar);
      doBreakTime($('#break-1'),duration_sec)
    }
    $('.breaker').html(diff_sec)
    //console.log(diff_sec)
    diff_sec --
  }, 1000);
  $('#break-1 .ct').html(duration_sec);

}
function doBreakTime(el,diff_sec){
  el.popup('show');
  el.find('.ct').html(diff_sec);
  let myVar = setInterval(function(){
    if(diff_sec<=0){
      clearInterval(myVar);
      el.popup('hide');
      toggleBreakerInit()
    }
    el.find('.ct').html(diff_sec);
    //console.log(diff_sec)
    diff_sec --
  }, 1000);
}

function _takeabreak(option){
  let tb = $.cookie('toggleBreaker')
  $('#break-1 .ct').html(20);
  if(tb!=undefined){
    tb=converttruefalse(tb)
    let c_bk1 = new Date($.cookie('break-1'))
    if(tb){
      //console.log({ c_bk1:c_bk1, t:!!isNaN(c_bk1) })
      if(!!isNaN(c_bk1)){
        $.cookie('break-1',new Date(),{expire:1})
        setTimeout(() => {
          takeabreak(option)
        }, parseInt(option.interval*60000));
      }else{
        if(c_bk1!=undefined){
          //console.log(`Time from last break ${diff_second(c_bk1, new Date())}s` )
          if(diff_second(c_bk1, new Date())>=parseInt(option.interval*60)){
            $.cookie('break-1',new Date(),{expire:1})
            $('#break-1').popup('show');
            let i=parseInt(option.duration)
            let myTimer=setInterval(function() {
              $('#break-1 .ct').html(i);
              if(i==0){
                clearInterval(myTimer);
                $('#break-1').popup('hide');
                setTimeout(() => {
                  takeabreak(option)
                }, parseInt(option.interval*60000));
              }
              i--
            }, 1000);
          }else{
            setTimeout(() => {
              takeabreak(option)
            }, 10000);
          }
        }else{
          $.cookie('break-1',new Date(),{expire:1})
          setTimeout(() => {
            takeabreak(option)
          }, parseInt(option.interval*60000));
        }
      }
    }
  }else{
    $.cookie('toggleBreaker',true,{expire:1})
  }
}
function diff_second(dt2, dt1){
  var diff =(dt2.getTime() - dt1.getTime()) / 1000;
  return Math.abs(Math.round(diff));

 }
function toggleBreakerInit(){
  $.get('/api/db/settings',function(result){
    let option = {}
    option.interval = 1
    option.duration = 20
    //console.log(result)
    if(result && result[0]){
      option.interval = result[0].interval || 1
      $('#interval').val(parseInt(result[0].interval))
      option.duration = result[0].duration || 20
      $('#duration').val(parseInt(result[0].duration))
      option.toggle = result[0].toggle
    }
    console.log(option)
    if(option.toggle == 'true'){takeabreak(option)}
  })
 }
 function toggleBreaker(el){
   $(el).toggleClass('btn-dark')
   toggleBreakerInit()
 }
 function converttruefalse(tb){
   if(tb=='true'){
     return true
   }else{
     return false
   }
 }
 function edgeControl(extractorID){
   //console.log(`edgeControl ${extractorID}`)
   let $this = $(`.container-content[data-id="${extractorID}"] .cardContainer:last-child`)
   _ol = parseInt($this.offset().left+$this.width())
   if(_ol<(ww)){
     return true
   }
   return false
}
function resetTemplate(content,item){
  const itemId = item._id
  const isGif = !!item.gif ? 'gif' : 'image'
  content.removeClass('template')
  content.removeClass('on')
  content.find('img').removeClass('on')
  content.attr('data-type',isGif)
  if(isGif){$('.typeAnim-gif').show()}
  content.attr('id',itemId)
  content.find('video').attr('data-id',itemId)
  content.find('.favAnim').attr('data-id',itemId)
  content.find('.poster').attr('data-id',itemId)
  content.find('.poster').attr('src',item.thumbnail)
  content.find('.loading').attr('data-id',itemId)
  content.find('.loading').hide()
  return content
}
function getUrlParam(paramter){
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get(paramter);
}
function getPageIndex(){
  if($('#related').attr('data-value')!='false'){
    let pageIndex = parseInt($('#related').attr('data-value'))
    if(isNaN(pageIndex)){
      pageIndex = 0
    }
    return pageIndex
  }else{
    $('#loading_page').hide()
    return false
  }
}
function updategridlayout(value) {
  // Function implementation goes here
  // This function will be called when the range input is changed
  // You can update the grid layout or perform any other actions based on the 'value'

  // Remove any existing col- classes from grid items
  $('.grid-item').removeClass(function (index, className) {
    return (className.match(/(^|\s)col-\S+/g) || []).join(' ');
  });

  // Calculate the column width class based on the range value
  const colClass = `col-${12 / value}`;

  // Add the new col- class to each grid item
  $('.grid-item').addClass(colClass);
  updateMasonryLayout()
}
