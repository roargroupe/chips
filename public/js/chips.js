(function(Chips, $) {}(window.Chips = window.Chips || {}, jQuery));

// TODO clean this up with actual namespacing
(function(Users, $) {
  Users.init = function() {
    $('#import-users').click(function() {
      $.post("/users/import", function(data) {
        if(data.result == 'success') {
          alert(data.result);
        } else {
          alert(data.result);
        }
        
      });

      return false;
    });

    $('.give-chip').click(function() {
      $.post($(this).attr('href'), function(data) {
        if(data.result == 'success') {
          location.reload(true);
        } else {
          alert(data.result);
        }
      });

      return false;
    });

    $('#transfer-chips').submit(function() {
      var form = $(this).serializeObject();

      $.post('/chips/transfer/' + form.from + '/' + form.to + '/' + form.amount, function(data) {
        if(data.result == 'success') {
          alert(data.result);
        } else {
          alert(data.result);
        }
      });

      return false;
    });

    $('#chip-command').submit(function() {
      var form = $(this).serializeObject();

      $.post('/chip/command', form, function(data) {
        if(data.result == 'success') {
          alert(data);
        } else {
          alert(data);
        }
      });

      return false;
    });

    $('#clear-chips').click(function() {
      $.post($(this).attr('href'), function(data) {
        if(data.result == 'success') {
          alert(data.result);
        } else {
          alert(data.result);
        }
      });

      return false;
    });

    $('#start-week').click(function() {
      $.post($(this).attr('href'), function(data) {
        if(data.result == 'success') {
          alert(data.result);
        } else {
          alert(data.result);
        }
      });

      return false;
    });

    $('.activate, .deactivate').click(function() {
      $.post($(this).attr('href'), function(data) {
        if(data.result == 'success') {
          location.reload(true);
        } else {
          alert(data.result);
        }
      });

      return false;
    });
  };
}(window.Chips.Users = window.Chips.Users || {}, jQuery));