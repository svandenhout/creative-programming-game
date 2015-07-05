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
    // amount of bullets fired when hit
    var bullets = 15;
    // amount of times enemy can get hit
    var health = 6;

    var rainBullets = function(world) {
      if(splits < 1 && enemies < 1) {
        return false;
      }else if(splits < 1) {
        world.removeBody(enemy);
        return true;
      }

      var bodies = [];
      for(var i = 0; i < enemies + 1; i++) {
        var vx = (i < 1) ? 0.4 : -0.4;
        bodies.push(Physics.body("circle", {
          radius: enemy.radius / 2,
          treatment: "dynamic",
          label: "enemy",
          // the last enemy in the loop will not do
          // collisions so i just hide it
          hidden: (i < enemies) ? false : true,
          vx: vx,
          vy: 0.4,
          x: enemy.state.pos.get(0),
          y: enemy.state.pos.get(1)
        }));
      }

      world.addBodyAndCollisions(bodies);

      return true;
    };

    return {
      init: function(options) {
        if(options.bullets) bullets = options.bullets;
        var self = this;
        parent.init.call(this, options);
      },
      behave: function() {

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
          if(found && found.bodyA.label === "enemy") {
            if(!splitEnemy(world, found.bodyA)) {
                world.removeBodyAndCollisions(found.bodyA);
            }
          }else if(found && found.bodyB.label === "enemy") {
            if(!splitEnemy(world, found.bodyB)) {}
                world.removeBodyAndCollisions(found.bodyB);
          }
        }, this);
        world.on("integrate:positions", this.behave, this);
        return self;
      }
    };

  });
});
