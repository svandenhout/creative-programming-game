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
  "js/lib/init",
  "physicsjs/bodies/convex-polygon",
  "physicsjs/renderers/canvas",
  "physicsjs/bodies/rectangle",
  "physicsjs/bodies/circle",
  "js/lib/driving",
  "js/lib/split",
  "js/lib/bullethell",
  "js/lib/car"
], function(Physics, world) {
  "use strict";

  world.enemyStyles = {
    strokeStyle: "#37495C",
    lineWidth: 10,
    fillStyle: "#99CCFF",
    angleIndicator: "#99CCFF"
  };

  // the enemy will split in two and continue bouncing
  // around the level, it also kills the player
  var enemy = Physics.body("circle", {
    radius: 100,
    treatment: "dynamic",
    label: "enemy",
    x: 590,
    y: 250,
    styles: world.enemyStyles
  });

  var gunImg = new Image();
  gunImg.src = require.toUrl("images/gun.png");
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

  var car = Physics.body("car", {
    label: "car",
    treatment: "dynamic",
    x: 150,
    y: 100,
    width: 128,
    height: 64,
    gun: gun
  });

  var driving = Physics.behavior("driving").applyTo([car]);
  var split = Physics.behavior("split", {
    splits: 2, enemies: 2
  }).applyTo([enemy]);

  world.collidingBodies = [car, enemy, wall];

  // physics are applied to all objects
  world.add([
    driving, split, bullethell, car, gun, enemy, wall,
    world.collisionDetection.applyTo(world.collidingBodies),
  ]);

});
