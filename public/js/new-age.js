(function($) {
  "use strict"; // Start of use strict

  // Smooth scrolling using jQuery easing
  $('a.js-scroll-trigger[href*="#"]:not([href="#"])').click(function() {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html, body').animate({
          scrollTop: (target.offset().top - 48)
        }, 1000, "easeInOutExpo");
        return false;
      }
    }
  });

  // Closes responsive menu when a scroll trigger link is clicked
  $('.js-scroll-trigger').click(function() {
    $('.navbar-collapse').collapse('hide');
  });

  // Activate scrollspy to add active class to navbar items on scroll
  $('body').scrollspy({
    target: '#mainNav',
    offset: 54
  });

  // Collapse the navbar when page is scrolled
  $(window).scroll(function() {
    if ($("#mainNav").offset().top > 100) {
      $("#mainNav").addClass("navbar-shrink");
    } else {
      $("#mainNav").removeClass("navbar-shrink");
    }
  });

  var dictionary, set_lang;
  
  // Function for swapping dictionaries
  set_lang = function (dictionary) {
    
    $("[data-translate]").text(function () {
      var key = $(this).data("translate");
      if (dictionary.hasOwnProperty(key)) {
        return dictionary[key].replace(/_/g,String.fromCharCode(160));
      }
    });

    $("[data-img]").attr("src", function() {
      var key = $(this).data("img");
      if (dictionary.hasOwnProperty(key)) {
        return dictionary[key];
      }
    });

    $("[data-placeholder]").attr("placeholder", function() {
      var key = $(this).data("placeholder");
      if (dictionary.hasOwnProperty(key)) {
        return dictionary[key];
      }
    });
  };
    
  // Swap languages when menu changes
  $(".language-toggle").on("click", function () {
    var language = $(this).text().toLowerCase();
    if (dictionary.hasOwnProperty(language)) {
      set_lang(dictionary[language]);
    }
  });
    
  // Set initial language to French
  $.getJSON( "https://simply-city-website.firebaseio.com/dictionary.json", function( data ) {
    dictionary = data;
    set_lang(dictionary.fr);
  });
          
  $( "#contact-form" ).submit(function( event ) {
    event.preventDefault();
    send_email();
  });


})(jQuery); // End of use strict

function send_email(token) {
  var formElement = document.getElementById("contact-form");
  var formData = new FormData(formElement),
    convertedJSON = {},
    it = formData.entries(),
    n;

  while (n = it.next()) {
    if (!n || n.done) break;
    convertedJSON[n.value[0]] = n.value[1];
  }
  console.log(convertedJSON);

  $.ajax({
    url: '/email',
    type: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(convertedJSON),
    dataType: 'json',
    success: function (data)
    {
        // data = JSON object that contact.php returns

        // we recieve the type of the message: success x danger and apply it to the 
        var messageAlert = 'alert-' + data.type;
        var messageText = data.message;

        // let's compose Bootstrap alert box HTML
        var alertBox = '<div class="alert ' + messageAlert + ' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' + messageText + '</div>';
        
        // If we have messageAlert and messageText
        if (messageAlert && messageText) {
            // inject the alert to .messages div in our form
            $('#contact-form').find('.messages').html(alertBox);
            // empty the form
            $('#contact-form')[0].reset();
        }
    }
  });
};
