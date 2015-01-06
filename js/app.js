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
  "physicsjs/bodies/rectangle",
  "physicsjs/bodies/convex-polygon",
  "physicsjs/renderers/canvas"
], function(Physics) {
  "use strict";

  var world = Physics({
    timestep: 1000 / 60
  });

  /* costum behaviours */
  Physics.behavior("driving", function(parent) {

    var drive = 0, // velocity
        turn = 0;

    return {
      init: function(options) {
        var self = this;

        parent.init.call(this, options);

        document.addEventListener("keydown", function(e){
          switch (e.keyCode){
            case 38: // up
              car.accelerate(1);
            break;
            case 40: // down
              car.accelerate(-1);
            break;
            case 37: // left
              car.turn(-1);
            break;
            case 39: // right
              car.turn(1);
            break;
          }
          return false;
        });
        document.addEventListener("keyup", function(e){
          switch (e.keyCode){
            case 38: // up
              // car.stop();
            break;
            case 40: // down
              // car.stop();
            break;
            case 37: // left
              car.turn(0);
              // car.stop();
            break;
            case 39: // right
              car.turn(0);
              // car.stop();
            break;
          }
          return false;
        });
      },
      behave: function(data) {
         car.drive();
      }
    };
  });
  /* costum behaviours */

  /* costum body */
  Physics.body("car", "rectangle", function(parent) {
    var carImg = new Image(),
        scratch = Physics.scratchpad(),
        v = scratch.vector(),
        a = 0;

    carImg.src = require.toUrl("images/car.png");

    return {
      init: function(options) {
        parent.init.call(this, options);
        this.view = carImg;
      },
      turn: function(amount) {
        //this.state.angular.pos += amount * deg;

        // this.state.angular.pos = amount * 0.2 * deg;
        // console.log(amount * 0.2 * deg);
        this.state.angular.vel = amount * 0.2 * (Math.PI / 180);

        return this;
      },
      accelerate: function(amount) {
        if(amount > 0 && a < 0.3) a += amount * 0.08;
        if(amount > 0 && a < 0.8) a += amount * 0.06;
        if(amount < 0 && a > -0.4) a += amount * 0.04;
        console.log(a);
      },
      drive: function() {
        var self = this,
            world = this._world;
        if(!world) return self;

        v.set(
          a * Math.cos(this.state.angular.pos),
          a * Math.sin(this.state.angular.pos)
        );
        // console.log(a * Math.sin(angle));

        this.state.vel = v;

        return self;
      },

    };

  });
  /* costum body */

  // subscribe to the ticker
  Physics.util.ticker.on(function(time) {
    world.step(time);
  }).start();

  var renderer = Physics.renderer("canvas", {
    el: "canvas",
    width: 800,
    height: 480
  });
  world.add(renderer);

  world.on('step', function(){
    world.render();
  });

  var car = Physics.body("car", {
    x: 150, // x-coordinate
    y: 100, // y-coordinate
    width: 128,
    height: 64
  });

  var driving = Physics.behavior("driving").applyTo(car);

  world.add([car, driving]);
});