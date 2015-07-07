require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

/*
 * contains boilerplate stuff that i want to initialise every level
 */
define([
  "physicsjs",
  "physicsjs/behaviors/sweep-prune",
  "physicsjs/behaviors/body-collision-detection",
  "physicsjs/behaviors/body-impulse-response",
  "physicsjs/behaviors/edge-collision-detection"
], function(Physics) {
  "use strict";

  var world = new Physics({
    timestep: 1000 / 60
  });
  // subscribe to the ticker
  Physics.util.ticker.on(function(time) {
    world.step(time);
  }).start();

  var renderer = Physics.renderer("canvas", {
    el: "canvas",
    autoResize: false,
    width: 1280,
    height: 768
  });

  world.on("step", function() {
    world.render();
  });

  // removes body with collision behaviour
  world.removeBodyAndCollisions = function(body) {
    this.collidingBodies.splice(world.collidingBodies.indexOf(body), 1);
    this.collisionDetection.applyTo(world.collidingBodies);
    this.removeBody(body);
  };

  // adds body with collision behaviour
  world.addBodyAndCollisions = function(body) {
    // add to the collision collection
    if(Array.isArray(body)) {
      this.collidingBodies = this.collidingBodies.concat(body);
    }else {
      this.collidingBodies.push(body);
    }
    // apply collision to the collision collection
    this.collisionDetection.applyTo(this.collidingBodies);
    this.add(body);
  };

  var bounds = Physics.aabb(0, 0, 1280, 768);
  world.collisionDetection = Physics.behavior("body-collision-detection");

  world.add([renderer, Physics.behavior("sweep-prune"),
    Physics.behavior("body-impulse-response"),
    Physics.behavior("edge-collision-detection", {
      aabb: bounds
    })
  ]);

  return world;
});
