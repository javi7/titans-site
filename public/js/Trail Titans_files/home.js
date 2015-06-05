$(document).ready(function(e) {
  $('img[usemap]').rwdImageMaps();
  var mouseX;
  var mouseY;
  $(document).mousemove( function(e) {
     mouseX = e.pageX; 
     mouseY = e.pageY;
  });  
  $("#climb area").mouseover(function(){
    var area = $(this);
    var mountain = area.attr('name');
    var imageJquery = $('#' + mountain + '-image');
    if (!imageJquery.length) {
      var imageId = mountain + '-image';
      $('#climb').append($('<img src="/images/arrow-' + mountain + '.png" style="position:absolute; display:none" id="' + imageId + '" />'));
      imageJquery = $('#' + imageId);
    }
    var coords = area.attr('coords').split(',');
    imageJquery.css({'top': (parseInt(coords[1]) + parseInt(coords[5])) / 2 - 35,'left': parseInt(coords[2]) + 5, 'z-index': 1000}).fadeIn();
  });
  $("area").mouseout(function(){
    var image = $   ('#' + $(this).attr('name') + '-image')
    image.fadeOut('slow');
  });
  $("#signup-button").click(function() {
    $(".lightbox").height($('body').height());  
    $(".lightbox-inner").css('top', $(window).scrollTop() + 0.1 * $(window).height());
    $("#signup-lightbox").css('visibility', 'visible');
  });
  $("#close-lightbox").click(function() {
    $("#signup-lightbox").css('visibility', 'hidden');
    var titanForm = $('#titan-form');
    titanForm.find('.form-group').removeClass('has-success has-error has-warning has-feedback');
    titanForm.find('label').hide();
    titanForm.find('.glyphicon').hide();
    titanForm.find('input').val('');
    titanForm.find('select').val('foamcorner');
  });
  var pageSections = $(".home-section");
  $(window).scroll(function() {
    var fromTop = $(this).scrollTop();
    var currentSectionId = $.map(pageSections, function(section) {
      if ($(section).offset().top - 110  < fromTop && !$(section).hasClass('no-scroll'))
        return $(section).attr('id');
    });
    if(fromTop + $(window).height() == $(document).height()) {
      currentSectionId.push('contact');
    }
    var newImageSrc = currentSectionId[currentSectionId.length - 1] ? '/images/nav-' + currentSectionId[currentSectionId.length - 1] +'.png' : '/images/nav-home.png'; 
    var image = $("#nav-image");
    if (image.attr('src') != newImageSrc) {
      image.attr('src', newImageSrc);
    }
  });
  $("#subscribe-form").submit(function(event) {
    event.preventDefault();
    var subscribeForm = $(this);
    var subscribeFormData = {};
    subscribeForm.serializeArray().map(function(x){subscribeFormData[x.name] = x.value;});
    if (!subscribeFormData['email']) { 
      subscribeForm.find('.form-group').removeClass('has-warning has-success').addClass('has-feedback has-error');
      subscribeForm.find('.glyphicon-remove').show();
      subscribeForm.find('label').show().text("this isn't gonna work");
      return false; 
    }
    $.ajax('/subscribe', {
      type: 'POST',
      data: subscribeFormData,
      statusCode: {
        201: function() { 
          subscribeForm.find('.form-group').removeClass('has-error has-warning').addClass('has-success has-feedback');
          subscribeForm.find('.glyphicon-ok').show();
          subscribeForm.find('label').show().text('Successfully subscribed');
        },
        409: function() {
          subscribeForm.find('.form-group').removeClass('has-error has-success').addClass('has-feedback has-warning');
          subscribeForm.find('.glyphicon-warning-sign').show();
          subscribeForm.find('label').show().text('Email already subscribed');
        },
        500: function() {
          subscribeForm.find('.form-group').removeClass('has-warning has-success').addClass('has-feedback has-error');
          subscribeForm.find('.glyphicon-remove').show();
          subscribeForm.find('label').show().text('Unknown error occurred');
        }
      }
    });
    return false;
  });
  $("#subscribe-form").change(function(event) {
    $(this).find('label').hide();
    $(this).find('.glyphicon').hide();
    $(this).children('.form-group').removeClass('has-success has-error has-warning has-feedback');
  });
  var clearFormFeedback = function() {
    var formGroup = $(this).parent();
  };

  $("#titan-form").find('.form-group').change(function(event) {
    var formGroup = $(this);
    formGroup.find('label').hide();
    formGroup.find('.glyphicon').hide();
    formGroup.removeClass('has-success has-error has-warning has-feedback');
    var inputFormGroup = $($('#titan-form').find('button[type="submit"]').parent());
    inputFormGroup.removeClass('has-feedback has-error has-warning has-success');
    inputFormGroup.find('label').hide();
  });
  $("#titan-form").submit(function(event) {
    event.preventDefault();
    var titanForm = $(this);
    var titanFormData = {};
    var errors = false;
    titanForm.serializeArray().map(function(x){titanFormData[x.name] = x.value;});
    ['firstName', 'lastName', 'email', 'city', 'country', 'favoriteMountain', 'climbingGuide'].map(function(field) {
      if (!titanFormData[field]) {
        var inputFormGroup = $(titanForm.find('input[name="' + field + '"]').parent());
        inputFormGroup.addClass('has-feedback has-error');
        inputFormGroup.find('.glyphicon-remove').show();
        errors = true;
      }
    });
    if (!titanFormData['climbingGuide']) {
      var inputFormGroup = $(titanForm.find('select[name="climbingGuide"]').parent());
      inputFormGroup.addClass('has-feedback has-error');
      inputFormGroup.find('label').show();
    }
    if (errors) {
      var inputFormGroup = $(titanForm.find('button[type="submit"]').parent());
      inputFormGroup.addClass('has-feedback has-error');
      inputFormGroup.find('label').text('Please fill out the fields marked in red above').show();
      return false;
    }
    $.ajax('/apply', {
      type: 'POST',
      data: titanFormData,
      statusCode: {
        201: function() { 
          var inputFormGroup = $(titanForm.find('button[type="submit"]').parent());
          inputFormGroup.removeClass('has-error has-warning').addClass('has-feedback has-success');
          inputFormGroup.find('label').text("Thank you for applying. We'll be in touch").show();  
        },
        409: function() { 
          var inputFormGroup = $(titanForm.find('button[type="submit"]').parent());
          inputFormGroup.removeClass('has-success has-error').addClass('has-feedback has-warning');
          inputFormGroup.find('label').text('Someone has already applied with this email address').show(); 
        },
        500: function() { 
          var inputFormGroup = $(titanForm.find('button[type="submit"]').parent());
          inputFormGroup.removeClass('has-success has-warning').addClass('has-feedback has-error');
          inputFormGroup.find('label').text('Our server barfed. Please try again or contact us if the issue persists').show();  }
        }
    });
    return false;
  });
  $('#feedback-form').submit(function(event) {
    event.preventDefault();
    var feedbackForm = $(this);
    var feedbackFormData = {};
    feedbackForm.serializeArray().map(function(x){feedbackFormData[x.name] = x.value;});
    if (!feedbackFormData['message']) {
      var inputFormGroup = $(feedbackForm.find('textarea').parent());
      inputFormGroup.removeClass('has-success has-warning').addClass('has-feedback has-error');
      inputFormGroup.find('label').text('Say something').show();
      return false;
    };
    $.ajax('/feedback', {
      type: 'POST',
      data: feedbackFormData,
      statusCode: {
        201: function() { 
          var inputFormGroup = $(feedbackForm.find('button[type="submit"]').parent());
          inputFormGroup.removeClass('has-error has-warning').addClass('has-feedback has-success');
          inputFormGroup.find('label').text("Thanks for the feedback").show();  
        },
        500: function() { 
          var inputFormGroup = $(feedbackForm.find('button[type="submit"]').parent());
          inputFormGroup.removeClass('has-success has-warning').addClass('has-feedback has-error');
          inputFormGroup.find('label').text('Our server barfed. Please try again or contact us if the issue persists').show();  }
        }
    });
    return false;
  });
  $("#feedback-form").change(function(event) {
    var inputFormGroup = $($(this).find('button[type="submit"]').parent());
    inputFormGroup.removeClass('has-error has-warning has-feedback has-success');
    inputFormGroup.find('label').hide();  
  });
  $("#feedback-form").find('textarea').change(function(event) {
    var inputFormGroup = $($(this).parent());
    inputFormGroup.removeClass('has-success has-warning has-feedback has-error');
    inputFormGroup.find('label').hide();
  });
});