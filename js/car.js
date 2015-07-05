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
        bulletImg = new Image(),
        scratch = Physics.scratchpad(),
        v = scratch.vector(),
        angle = 0,
        gun, laser;

    carImg.src = require.toUrl("images/car.png");
    // bulletImg.src = require.toUrl("images/bullet.png");

    return {
      init: function(options) {
        gun = options.gun;
        // laser = options.laser;

        // make the gun rotate
        gun.state.angular.vel = 0.005;
        parent.init.call(this, options);
        this.view = carImg;
      },
      turn: function(amount) {
        this.state.angular.vel = amount * 0.25 * (Math.PI / 180);
        return this;
      },
      shoot: function() {
        var self = this;
        var world = this._world;
        if(!world) {
          return self;
        }

        var cos = Math.cos(gun.state.angular.pos);
        var sin = Math.sin(gun.state.angular.pos);
        var r = 150;
        var laser = Physics.body("circle", {
          radius: 5,
          treatment: "dynamic",
          label: "laser",
          x: this.state.pos.get(0) + r * cos,
          y: this.state.pos.get(1) + r * sin,
          vx: (0.8 * cos),
          vy: (0.8 * sin)
        });

        // add laser to world
        world.addBodyAndCollisions(laser);

        setTimeout(function() {
          // remove collision when object is removed
          world.removeBodyAndCollisions(laser);
        }, 1000);

        return self;
      },
      mount: function(gun, laser) {
        gun = gun;
        gun.state.angular.vel = 0.001;
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

        // make th gun stick to the car
        gun.state.pos.x = this.state.pos.get(0);
        gun.state.pos.y = this.state.pos.get(1);

        return self;
      },
      crash: function() {
        v.set(
          -0.2 * Math.cos(this.state.angular.pos),
          -0.2 * Math.sin(this.state.angular.pos)
        );
        return this;
      }
    };
  });

});
