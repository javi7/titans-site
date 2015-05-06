$(document).ready(function() {
  $("#registrationForm").submit(function(event) {
    console.log($('input[name="password"]', this).val() + ' -- ' +  $('input[name="password2"]', this).val());
    return $('input[name="password"]', this).val() == $('input[name="password2"]', this).val();
  });
});