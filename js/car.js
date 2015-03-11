require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

define(["physicsjs", "physicsjs/bodies/rectangle"], function(Physics) {
"use strict";

  Physics.body("car", "rectangle", function(parent) {
    var carImg = new Image(),
        scratch = Physics.scratchpad(),
        v = scratch.vector(),
        a = 0;

    carImg.src = require.toUrl("images/car.png");

    return {
      init: function(options) {
        parent.init.call(this, options);
        this.view = carImg;
      },
      turn: function(amount) {
        this.state.angular.vel = amount * 0.25 * (Math.PI / 180);

        return this;
      },
      drive: function(speed) {
        var self = this,
            world = this._world;
        if(!world) return self;

        v.set(
          speed * Math.cos(this.state.angular.pos),
          speed * Math.sin(this.state.angular.pos)
        );

        this.state.vel = v;

        return self;
      },
      crash: function() {
        v.set(
          -0.2 * Math.cos(this.state.angular.pos),
          -0.2 * Math.sin(this.state.angular.pos)
        )
        return self;
      }
    };
  });

});