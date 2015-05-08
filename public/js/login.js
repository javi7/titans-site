$(document).ready(function() {
  $("#registrationForm").submit(function(event) {
    event.preventDefault();
    var registrationForm = {};
    $(this).serializeArray().map(function(x){registrationForm[x.name] = x.value;});;
    if (registrationForm.password !== registrationForm.password2) {
      alert("passwords don't match");
    } else if (registrationForm.password.length < 8) {
      alert('password must be at least 8 characs');
    } else {
      $.ajax({
        url: '/register', 
        type: 'POST',
        data: JSON.stringify(registrationForm), 
        success: function(data) {
          alert('successfully registered!');      
        },
        error: function() {
          alert('gd it');
        },
        contentType: 'application/json; charset=utf-8'
      });
    }
  });
});