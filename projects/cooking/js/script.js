$(window).scroll(function(){
    var scroll = $(window).scrollTop();
    if(scroll < 800 ){
      $('.fixed-top').css('background', 'transparent');
      $('.fixed-top').removeClass('scroll-top');
      $('.fixed-top').removeClass('shadow');
    } else {
      $('.fixed-top').css('background', '#fff');
      $('.fixed-top').addClass('scroll-top shadow');
    }
  });
  
  $('#recipeCarousel').carousel({
    interval: 5000
  })
  
  $('.carousel .carousel-item').each(function(){
      var minPerSlide = 3;
      var next = $(this).next();
      if (!next.length) {
      next = $(this).siblings(':first');
      }
      next.children(':first-child').clone().appendTo($(this));
      
      for (var i=0;i<minPerSlide;i++) {
          next=next.next();
          if (!next.length) {
              next = $(this).siblings(':first');
            }
          
          next.children(':first-child').clone().appendTo($(this));
        }
  });
  