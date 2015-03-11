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
  Physics.behavior("driving", function(parent) {

  var _car = {},
      drive = 0, // velocity
      turn = 0,
      accelerate = 0,
      velocity = 0,
      minTurnSpeed = 1,
      maxTurnSpeed = 1.8,
      forwardsAcc = 0.04,
      backwardsAcc = 0.03,
      deceleration = 0.008,
      startTime;

  return {
    init: function(options) {
      var self = this;
      parent.init.call(this, options);

      startTime = new Date();

      document.addEventListener("keydown", function(e) {
        switch (e.keyCode) {
          case 38: // up
            accelerate = 1;
          break;
          case 40: // down
            accelerate = -1;
          break;
          case 37: // left
            turn = -maxTurnSpeed + (velocity > -minTurnSpeed || velocity < 0.3) ? 
                -minTurnSpeed : velocity ;
          break;
          case 39: // right
            turn = maxTurnSpeed - (velocity > -minTurnSpeed || velocity < 0.3) ? 
                minTurnSpeed : velocity ;
          break;
        }
        return false;
      });
      document.addEventListener("keyup", function(e) {
        switch (e.keyCode) {
          case 38: // up
            accelerate = 0;
          break;
          case 40: // down
            accelerate = 0;
          break;
          case 37: // left
            turn = 0;
          break;
          case 39: // right
            turn = 0;
          break;
        }
        return false;
      });
    },
    behave: function(data) {
      if(accelerate === 0 && velocity > 0) velocity -= deceleration;
      if(accelerate === 0 && velocity < 0) velocity += deceleration;
      if(accelerate === 1 && velocity < 1) velocity += forwardsAcc;
      if(accelerate === -1 && velocity > -0.6) velocity -= backwardsAcc;
      _car = this.getTargets()[0];
      _car.drive(velocity);
      _car.turn(turn);
    },
    connect: function(world) {
      var query = Physics.query({
        $or: [
          {bodyA: {label: "finish" }}, 
          {bodyB: {label: "finish" }}
        ]
      });
      // called when the car has a collision
      // (collision listener)
      world.on("collisions:detected", function(data) {
        var finish = Physics.util.find(data.collisions, query);
        // car hits the finish
        if(finish) {
          var currentTime = new Date();
          var time = currentTime.getTime() - startTime.getTime();
          console.log(time);
          world.pause();
        }else {
          velocity = -velocity * 0.6;
        }
      }, this);
      world.on('integrate:positions', this.behave, this);
    }
  };

  });
});