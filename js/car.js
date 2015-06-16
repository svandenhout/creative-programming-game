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
        a = 0,
        gun;

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
      shoot: function() {
        var self = this;
        var world = this._world;
        if(!world) {
          return self;
        }
        a = a + 0.3
        var cos = Math.cos(a);
        var sin = Math.sin(a);
        var r = 150;
        // create a little circle at the nose of the ship
        // that is traveling at a velocity of 0.5 in the nose direction
        // relative to the ship"s current velocity
        var laser = Physics.body("circle", {
          x: this.state.pos.get(0) + r * cos,
          y: this.state.pos.get(1) + r * sin,
          vx: (0.4 + this.state.vel.get(0)) * cos,
          vy: (0.4 + this.state.vel.get(1)) * sin,
          radius: 5
        });

        laser.treatment = "kinematic";
        laser.label = "laser";
        
        // remove the laser pulse in 600ms
        setTimeout(function(){
            world.removeBody(laser);
            laser = undefined;
        }, 2000);
        world.add(laser);
        return self;
      },
      drawGun: function() {
        var cos = Math.cos(a);
        var sin = Math.sin(a);
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
        world.removeBody(gun);

        gun = Physics.body("rectangle", {
          width: 5,
          height: 150,
          label: "gun",
          offset: Physics.vector(0, -75),
          x: this.state.pos.get(0),
          y: this.state.pos.get(1)
        });

        gun.state.angular.pos = a;
        world.add(gun)
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