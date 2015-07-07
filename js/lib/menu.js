// returns a function that triggers the menu to work
define(function() {
  "use strict";

  var menu = document.getElementById("menu");
  var next = document.getElementById("next");
  var retry = document.getElementById("retry");

  return (function() {
    menu.style.display = "block";

    next.addEventListener("click", function() {
      window.location = this.getAttribute("href");
    });

    retry.addEventListener("click", function() {
      location.reload();
    });
  });
});
