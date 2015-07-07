require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

define(["physicsjs"], function(Physics) {
  "use strict";
  Physics.behavior("bullethell", function(parent) {
    var target;
    // amount of bullets fired when hit
    var bullets = 15;
    // amount of times enemy can get hit
    var health = 3;

    var rainBullets = function(world, enemy) {
      world.audio.splat.play();
      if(health < 1) return false;
      health -= 1;
      for(var i = 0; i < bullets; i++) {
        var cos = Math.cos(Math.PI * 2 / bullets * i);
        var sin = Math.sin(Math.PI * 2 / bullets * i);

        var r = 150;
        var laser = Physics.body("circle", {
          radius: 5,
          treatment: "kinematic",
          label: "enemyLaser",
          x: enemy.state.pos.get(0) + r * cos,
          y: enemy.state.pos.get(1) + r * sin,
          vx: (0.6 * cos),
          vy: (0.6 * sin),
          styles: {
            fillStyle: "black"
          }
        });

        // add laser to world
        world.addBodyAndCollisions(laser);

        setTimeout(function() {
          // remove collision when object is removed
          world.removeBodyAndCollisions(laser);
        }, 1000);
      }

      return true;
    };

    return {
      init: function(options) {
        if(options.bullets) bullets = options.bullets;
        var self = this;

        parent.init.call(this, options);
      },
      behave: function() {
        target = this.getTargets()[0];
      },
      connect: function(world) {
        // query for collisions between laser and enemy
        var query = Physics.query({
          $or: [
            {bodyA: {label: "laser" }, bodyB: {label: "enemy"}},
            {bodyB: {label: "laser" }, bodyA: {label: "enemy"}}
          ]
        });
        // called when a collision happens
        world.on("collisions:detected", function(data) {
          var found = Physics.util.find(data.collisions, query);
          // the target is removed
          if(found && found.bodyA.uid === target.uid) {
            if(!rainBullets(world, found.bodyA)) {
              world.removeBodyAndCollisions(found.bodyA);
              world.warp(0.2);
              menu();
            }
          }else if(found && found.bodyB.uid === target.uid) {
            if(!rainBullets(world, found.bodyB)) {
              world.removeBodyAndCollisions(found.bodyB);
              world.warp(0.2);
              menu();
            }
          }
        }, this);
        world.on("integrate:positions", this.behave, this);
        return self;
      }
    };

  });
});
