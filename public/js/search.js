function getExtractor(option) {
  return option.extractor || $('#extractor').attr('data-value');
}

function getCurrentPage(extractor) {
  return $('.loading[data-id="' + extractor + '"]').attr('data-value');
}

function shouldContinue(currPage, option) {
  return currPage !== 'false' && ((currPage > 1 && option.triger === 'true') || currPage == 1);
}

function countActiveLoadings() {
  return $('.loading.on').length;
}

function getTags() {
  let tags = [];
  const tagSelector = document.querySelector('#video-tags span') ? '#video-tags span' : '.tag span';
  $(tagSelector).each(function() {
    tags.push($(this).text());
  });
  return tags;
}

function handleSearch(extractor, currPage, option) {
  console.log('search for ',extractor)
        $('.loading[data-id="'+extractor+'"]').addClass('on')
  
        let nextPage = parseInt(currPage)+1
        if((nextPage>1) &&(option.triger=='true')){
  
        }
        if(extractor==undefined){extractor=$('#extractor').attr('data-value')}
        if((extractor==undefined) && (!!document.querySelector('#nav-tab'))){return}
  
        $('.container-content[data-id="'+extractor+'"] .content').find('.nothing').remove()
        let tags = []
        if(!document.querySelector('#video-tags span')){
          $('.tag span').each(function(){
            tags.push($(this).text())
          })
        }else{
          $('#video-tags span').each(function(){
            tags.push($(this).text())
          })
        }
        let searchmode =  $('#navbar').attr('data-mode')
        if($('#extractor').attr('data-value') == 'youtube'){
          searchmode = 'safe'
        }
        var topPage = new URLSearchParams(window.location.search).get('topPage');
        let keyword = new URLSearchParams(window.location.search).get('keyword');
        if($('#query').attr('data-statut')!=undefined){
          keyword= $('#query').attr('data-value')
        }
        if((keyword=="false") || (keyword==undefined)){
          keyword='false'
          if((topPage=='true')||(topPage==undefined)){
            keyword='false'
            $('.addtag').hide()
            $('.removeTag').hide()
            $('#extractor').text(extractor.toUpperCase()).show()
          }else{
            keyword=tags[Math.floor(Math.random() * (tags.length + 1))]
            $('#query').attr('data-statut','on')
            $('#query').attr('data-value',keyword)
            $('#query').html('#'+keyword)
            $('#query').show()
            $('.addtag').attr('data-value',keyword)
            $('.removeTag').attr('data-value',keyword)
          }
        }else{
          $('#query').attr('data-value',keyword)
          $('#query').html('#'+keyword)
          $('#query').show()
          $('.addtag').attr('data-value',keyword)
          $('.removeTag').attr('data-value',keyword)
        }
        if($('#query').attr('data-statut')!=undefined){
            //Check if tag is added or not
            let $this = $(document)
            $.get('/api/db/settings',function(settings){
              let tags = settings[0].tags
              if(tags.includes(keyword)==true){
                $this.find('.handleTag').html('<span class="removeTag mx-2" data-feather="minus-circle" data-value="'+keyword+'"style="cursor:pointer;">Remove</span>')
              }else{
                $this.find('.handleTag').html('<span class="addtag mx-2" data-feather="plus-circle" data-value="'+keyword+'"style="cursor:pointer;">Add</span>')
              }
            })
        }
          if( $('.content[data-id="'+extractor+'"]').hasClass('slick-initialized')){
            $('.content[data-id="'+extractor+'"]').slick('unslick');
          }
          $('.container-content[data-id="'+extractor+'"] .content[data-id="'+extractor+'"]')
          //.removeClass('flexibleSlide-initialized')
        if(option.reset){
          $('.container-content[data-id="'+extractor+'"] .content[data-id="'+extractor+'"]').removeClass('abs-init')
          $('.container-content[data-id="'+extractor+'"] .content[data-id="'+extractor+'"]').html('')
          $('.result_length[data-extractor="'+extractor+'"]').html('')
          /*
          $.each($(document).find('#thumbnail a'),function(){
            if($(this).attr('data-extractor')==extractor){
              $(this).remove()
            }
          })
          */
          $('.loading[data-id="'+extractor+'"]').addClass('visibleExtractor-on')
        }
        //console.log({event:'loadResultSearch',keyword:keyword,searchmode:searchmode,extractor:extractor,page:currPage,topPage:topPage,option:option})
        if(keyword!=undefined){
          let isSingle = 'col-lg-6 col-sm-6 col-12'
          if(!! document.querySelector('#single')){
              isSingle = 'col-12'
          }
          const query = {keyword:keyword,extractor:extractor,searchmode:searchmode,page:currPage,topPage:topPage}
          $.post('/api/search',query,function(data){

            if(data.length==0){
              console.log('Nothing founded. ',query)
            }
              let res=[];
              data.forEach(video => {
                if (video!=null){
                  res.push(video)
                }
              })
              //console.log(res.length)
            if(res.length>1){
              $('.result_length[data-extractor="'+extractor+'"]').html(res.length)
              res.forEach((item,index) => {
                  if (item!=null){
                    let content = ''
  
                    content = $('.cardContainer.template').clone()
                    content.removeClass('template')
                    content.removeClass('on')
                    content.find('img').removeClass('on')
                    //content.find('.card.img-content').css('height',vh*0.7+'px')
                    //content.find('.card.img-content').css('background-image','url('+url+')')
                    content.attr('data-all',JSON.stringify(item))
                    content.attr('data-type',item.type)
                    content.addClass(`type-${item.type}`)
                    content.attr('data-collection','favoriteImage')
                    content.find('.card.img-content').css('background-size','cover')
                    content.find('.card-img-top').attr('src',item.thumbnail)
                    content.find('.card-img-top').attr('data-url',item.url)
                    content.find('.card-img-top').attr('data-src',item.url)
                    content.find('.card-img-top').attr('data-thumbnail',item.thumbnail)
                    content.find('.card-img-top').attr('onload','setContainerWidth(this)')
                    content.find('.card-img-top').attr('onerror','isCorrupted(this)')
                    content.attr('data-source',item.source)
                    content.attr('data-index',(index+1))
                    content.attr('data-id','uni-'+index)
                    content.attr('data-extractor',item.extractor)
                    content.attr('data-url',item.url)
                    content.attr('data-title',item.title)
                    content.find('video').remove()
  
                    content.find('.loading').attr('data-id','uni-'+index)
                    content.find('.loading').attr('data-value',item.url)
                    content.find('.loading').hide()
                    content.find('.favAnim').attr('data-id','uni-'+index)
                    content.find('.favAnim').hide()
                    //content.find('.t').html(title)
                    content.show()
  
                    //$('.slider-for[data-id="'+extractor+'"]').prepend(content)
                    $('.content[data-id="'+extractor+'"]').append(content)
                  }
              });
              //transformHastag()
              //transformSlider(extractor)
              $('.loading[data-id="'+extractor+'"]').removeClass('on')
              flexibleSlider($('.content[data-id="'+extractor+'"]'))
              //absoluteDesign($('.content[data-id="'+extractor+'"]'))
              //wichDesign($('.content[data-id="'+extractor+'"]'))
              addToViewThis($('.content[data-id="'+extractor+'"]'))
              $('.loading[data-id="'+extractor+'"]').attr('data-value',nextPage)
            }else{
              setTimeout(() => {
                $('.loading[data-id="'+extractor+'"]').removeClass('on')
                if(!!document.querySelector('#single')){
                  $('#query').html(tags[Math.floor(Math.random() * (tags.length + 1))])
                }else{
                  $('.container-content[data-id="'+extractor+'"] .content').prepend('<p class="text-center mt-5 w-100 nothing">Nothing Founded or an error occured</p>')
                  $('.image-container').prepend('<p class="text-center mt-5 w-100 nothing">Nothing Founded or an error occured</p>')
                }
              }, 0);
              $('.container-content[data-id="'+extractor+'"] .content').css('height','auto')
              $('.loading[data-id="'+extractor+'"]').attr('data-value',nextPage)
              $('.count_page[data-id="'+extractor+'"] .c').html(nextPage)
            }
          })
          if(!$('.extractor.active').hasClass('done')){
            $('.extractor.active').addClass('done')
          }
        }
    
}

function loadResultSearch(option) {
  let extractor = getExtractor(option);
  let currPage = getCurrentPage(extractor);
  let isContinue = shouldContinue(currPage, option);
  let activeLoadings = countActiveLoadings();

  handleSearch(extractor, currPage, option);
}
