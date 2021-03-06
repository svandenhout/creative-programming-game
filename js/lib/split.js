require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

/*
 * split defines the behavior of an anemy, once hit the enemy will split up
 * into multiple enemies.
 * once the enemy is defeated the level ends
 */

define(["physicsjs", "js/lib/menu"], function(Physics, menu) {
  "use strict";
  Physics.behavior("split", function(parent) {
    var self;
    var targets;
    // amount of times an enemy splits
    var splits = 1;
    // amount of enemies that spawn after split
    var enemies = 2;
    // total amount of kill the player needs to finish the level
    var totalKills = 3;

    var splitEnemy = function(world, enemy) {
      totalKills -= 1;
      if(splits < 1 && enemies < 1) {
        return false;
      }else if(splits < 1) {
        world.removeBody(enemy);
        return true;
      }

      world.audio.splat.play();

      var bodies = [];
      for(var i = 0; i < enemies + 1; i++) {
        var vx = (i % 2 === 0) ? 0.4 : -0.4;
        var vy = (splits % 2 === 0) ? 0.4 : -0.4;
        console.log(enemy);
        bodies.push(Physics.body("circle", {
          radius: enemy.radius / 2,
          treatment: "dynamic",
          label: "enemy",
          // the last enemy in the loop will not do
          // collisions so i just hide it
          hidden: (i < enemies) ? false : true,
          vx: vx,
          vy: vy,
          x: enemy.state.pos.get(0),
          y: enemy.state.pos.get(1),
          styles: world.enemyStyles
        }));
      }
      world.removeBodyAndCollisions(enemy);

      splits -= 1;

      world.addBodyAndCollisions(bodies);

      targets = bodies;
      return true;
    };

    return {
      init: function(options) {
        if(options.splits) splits = options.splits;
        if(options.enemies) enemies = options.enemies;
        totalKills = 1 + Math.pow(enemies, splits);
        self = this;
        parent.init.call(this, options);
      },
      behave: function() {

      },
      connect: function(world) {
        targets = [this.getTargets()[0]];

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
          // check multiple targets when split
          for(var i = 0; i < targets.length; i++) {
            // the target is removed
            if(found && targets[i].uid === found.bodyA.uid) {
              if(!splitEnemy(world, found.bodyA))
                  world.removeBodyAndCollisions(found.bodyA);
              if(totalKills === 0) {
                world.warp(0.2);
                menu();
              }
            }else if(found && targets[i].uid === found.bodyB.uid) {
              if(!splitEnemy(world, found.bodyB))
                  world.removeBodyAndCollisions(found.bodyB);
              if(totalKills === 0) {
                world.warp(0.2);
                menu();
              }
            }
          }
        }, this);
        world.on("integrate:positions", this.behave, this);
        return self;
      }
    };

  });
});
