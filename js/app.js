require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

require([
  "physicsjs",
  "physicsjs/bodies/convex-polygon",
  "physicsjs/renderers/canvas",
  "physicsjs/bodies/rectangle",
  "physicsjs/bodies/circle",
  "physicsjs/behaviors/sweep-prune",
  "physicsjs/behaviors/body-collision-detection",
  "physicsjs/behaviors/body-impulse-response",
  "physicsjs/behaviors/edge-collision-detection",
  "js/driving",
  "js/explode",
  "js/car"
], function(Physics) {
  "use strict";

  var scratch = Physics.scratchpad(),
      carV = scratch.vector(),
      gunImg = new Image(),
      targets;

  gunImg.src = require.toUrl("images/gun.png");

  var world = Physics({
    timestep: 1000 / 60
  });

  var bounds = Physics.aabb(0, 0, 1280, 768);

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

  // the enemy will split in two and continue bouncing
  // around the level, it also kills the player
  var enemy = Physics.body("circle", {

  });

  var gun = Physics.body("rectangle", {
    label: "gun",
    restitution: 0,
    treatment: "kinematic",
    x: 150,
    y: 100,
    height: 23,
    width: 100,
    view: gunImg,
    offset: Physics.vector(50, 0)
  });

  // TODO: remove wall in first level
  var wall = Physics.body("rectangle", {
    treatment: "static",
    x: 350,
    y: 100,
    mass: 1000,
    width: 50,
    height: 500
  });

  // spawn laser on upper right of the screen
  var laser = Physics.body("circle", {
    radius: 5,
    treatment: "kinematic",
    label: "laser",
    hidden: true,
    x: 1280,
    y: 768,
    vx: 0.4,
    vy: 0.4
  });

  var car = Physics.body("car", {
    label: "car",
    treatment: "dynamic",
    x: 150,
    y: 100,
    width: 128,
    height: 64,
    laser: laser,
    gun: gun
  });

  var driving = Physics.behavior("driving").applyTo([car]);
  var explode = Physics.behavior("explode").applyTo([targets]);

  setInterval(function() {
    // targets = getTargets(3);
    world.add(targets);
  }, 4000);

  world.collisionDetection = Physics.behavior("body-collision-detection");
  // physics are applied to all objects
  var objects = [car, wall, laser];
  objects = objects.concat(targets);

  world.add(objects);

  world.add([
    renderer, driving, gun, explode,
    Physics.behavior("sweep-prune"),
    world.collisionDetection.applyTo(objects),
    Physics.behavior("body-impulse-response"),
    Physics.behavior("edge-collision-detection", {
      aabb: bounds
    })
  ]);

});
