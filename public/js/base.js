$(document).ready(function() {
  Chips.Admin.clickImportUsers('#import-users');
  Chips.Admin.clickGiveChip('.give-chip');
  Chips.Admin.clickToggleActivation('.activate, .deactivate');
  Chips.Admin.clickChipsClear('#clear-chips');
  Chips.Admin.submitChipCommand('#chip-command');
});

$.fn.serializeObject = function()
{
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
};