require.config({
  baseUrl: "./",
  packages: [{
    name: "physicsjs",
    location: "js/lib/dist",
    main: "physicsjs.min"
  }]
});

define(["physicsjs", "js/lib/menu"], function(Physics, menu) {
"use strict";
  Physics.behavior("driving", function(parent) {

    var target = {},
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
            case 32:
              target.shoot();
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
      behave: function() {
        if(accelerate === 0 && velocity > 0) velocity -= deceleration;
        if(accelerate === 0 && velocity < 0) velocity += deceleration;
        if(accelerate === 1 && velocity < 1) velocity += forwardsAcc;
        if(accelerate === -1 && velocity > -0.6) velocity -= backwardsAcc;
        target = this.getTargets()[0];
        target.drive(velocity);
        target.turn(turn);
      },
      connect: function(world) {
        // query for collisions between laser and target
        var crashQuery = Physics.query({
          $or: [
            {bodyA: {label: "car" }}, {bodyB: {label: "car"}}
          ]
        });

        var killQuery = Physics.query({
          $or: [
            {bodyA: {label: "car"}, bodyB: {label: "enemy"}},
            {bodyA: {label: "enemy"}, bodyB: {label: "car"}}
          ]
        });

        var bulletKillQuery = Physics.query({
          $or: [
            {bodyA: {label: "car"}, bodyB: {label: "enemyLaser"}},
            {bodyA: {label: "enemyLaser"}, bodyB: {label: "car"}}
          ]
        });

        // called when a collision happens
        world.on("collisions:detected", function(data) {
          var crash = Physics.util.find(data.collisions, crashQuery);
          var killed = Physics.util.find(data.collisions, killQuery);
          var bulletKilled =
              Physics.util.find(data.collisions, bulletKillQuery);

          // ways of getting yourself killed
          if(killed && killed.bodyA.label === "car") {
            world.removeBodyAndCollisions(killed.bodyA);
            world.audio.explosion.play();
            world.warp(0.2);
            menu();
          }

          if(killed && killed.bodyB.label === "car" ) {
            world.removeBodyAndCollisions(killed.bodyB);
            world.audio.explosion.play();
            world.warp(0.2);
            menu();
          }

          if(bulletKilled && bulletKilled.bodyA.label === "car") {
            world.removeBodyAndCollisions(bulletKilled.bodyA);
            world.audio.explosion.play();
            world.warp(0.2);
            menu();
          }

          if(bulletKilled && bulletKilled.bodyB.label === "car") {
            world.removeBodyAndCollisions(bulletKilled.bodyB);
            world.audio.explosion.play();
            world.warp(0.2);
            menu();
          }

          // bounce from objects like sides & walls
          if(crash) {
            velocity = - velocity * 0.6;
          }


        }, this);
        world.on("integrate:positions", this.behave, this);
        return self;
      }
    };

  });
});
