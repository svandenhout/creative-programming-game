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
  Physics.behavior("explode", function(parent) {
    var splits = 1;
    var splitEnemy = function(world, enemy) {
      if(splits < 1) return false;
      splits -= 1;

      for(var i = 0; i < 2; i++) {
        var vx = (i < 1) ? -0.4 : 0.4;
        var newEnemy = Physics.body("circle", {
          radius: enemy.radius / 2,
          treatment: "dynamic",
          label: "enemy",
          vx: vx,
          vy: 0.4,
          x: enemy.state.pos.get(0),
          y: enemy.state.pos.get(1)
        });
        world.addBodyAndCollisions(newEnemy);
      }
      world.removeBodyAndCollisions(enemy);
      return splits;
    };

    return {
      init: function(options) {
        var self = this;
        parent.init.call(this, options);
      },
      behave: function() {

      },
      connect: function(world) {
        // query for collisions between laser and target
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
            console.log(splitEnemy(world, found.bodyA) > 0);
            if(!splitEnemy(world, found.bodyA))
                world.removeBodyAndCollisions(found.bodyA);
          }else if(found && found.bodyB.label === "enemy") {
            if(!splitEnemy(world, found.bodyB))
                world.removeBodyAndCollisions(found.bodyB);
          }
        }, this);
        world.on("integrate:positions", this.behave, this);
        return self;
      }
    };

  });
});
