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
  "js/car"
], function(Physics) {
  "use strict";

  var scratch = Physics.scratchpad(),
      carV = scratch.vector(),
      gunImg = new Image();

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

  world.on("step", function(){
    world.render();
  });

  var car = Physics.body("car", {
    label: "car",
    treatment: "kinematic",
    x: 150,
    y: 100,
    width: 128,
    height: 64
  });

  var gun = Physics.body("rectangle", {
    treatment: "static",
    x: 150,
    y: 100,
    height: 23,
    width: 100,
    view: gunImg,
    offset: Physics.vector(50, 0)
  });

  var wall = Physics.body("rectangle", {
    treatment: "static",
    x: 350,
    y: 100,
    mass: 1000,
    width: 50,
    height: 500
  });

  var driving = Physics.behavior("driving").applyTo([car]);

  world.add([
    renderer, car, wall, driving, gun,
    Physics.behavior("sweep-prune"),
    Physics.behavior("body-collision-detection"),
    Physics.behavior("body-impulse-response"),
    Physics.behavior("edge-collision-detection", {
      aabb: bounds
    })
  ]);

  car.mount(gun);

  // world.add(environment);
});