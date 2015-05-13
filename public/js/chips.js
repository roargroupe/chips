(function(Chips, $) {}(window.Chips = window.Chips || {}, jQuery));

(function(Admin, $) {
  Admin.init = function() {};

  Admin.clickImportUsers = function(elements) {
    $(elements).click(function() {
      $.post($(this).attr('href'), function(data) {
        console.log(data);
      });

      return false;
    });
  };

  Admin.clickGiveChip = function(elements) {
    $(elements).click(function() {
      $.post($(this).attr('href'), function(data) {
        console.log(data);        
      });

      return false;
    });
  };

  Admin.clickToggleActivation = function(elements) {
    $(elements).click(function() {
      $.post($(this).attr('href'), function(data) {
        console.log(data);
      });

      return false;
    });
  };

  Admin.clickChipsClear = function(elements) {
    $(elements).click(function() {
      $.post($(this).attr('href'), function(data) {
        console.log(data);
      });

      return false;
    });
  };

  Admin.submitChipCommand = function(elements) {
    $(elements).submit(function() {
      var form = $(this).serializeObject();

      $.post($(this).data('post-url'), form, function(data) {
        console.log(data);
      });

      return false;
    });
  };
}(window.Chips.Admin = window.Chips.Admin || {}, jQuery));

(function(Users, $) {
  Users.init = function() {};
}(window.Chips.Users = window.Chips.Users || {}, jQuery));