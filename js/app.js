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

  var buildEnvironment = function() {
    var objectTypes = ["circle", "rectangle"],
        margin = 150,
        topMargin = 0,
        environment = [];

    // elements required for level
    for(var i = 0; i < 40; i++) {
      if(i > 0 && i % 5 == 0) topMargin += margin;
      environment.push(
        Physics.body(objectTypes[1], {
          // place the center of the square at (0, 0)
          x: i *150,
          y: 15,
          width: 75,
          height: 75
        })
      );
    }
  };

  var scratch = Physics.scratchpad(),
      carV = scratch.vector(),
      finishImg = new Image();

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
    x: 150,
    y: 100,
    width: 128,
    height: 64
  });

  finishImg.src = require.toUrl("images/finish.jpg");
  var finish = Physics.body("rectangle", {
    treatment: "kinematic",
    label: "finish",
    x: 1100,
    y: 0,
    width: 100,
    height: 50
  });

  finish.view = finishImg;

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
    renderer, car, wall, finish, driving,
    Physics.behavior("sweep-prune"),
    Physics.behavior("body-collision-detection"),
    Physics.behavior("body-impulse-response"),
    Physics.behavior('edge-collision-detection', {
      aabb: bounds
    })
  ]);

  world.add(environment);
});