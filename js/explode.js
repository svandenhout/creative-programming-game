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
          {bodyA: {label: "laser" }, bodyB: {label: "target"}},
          {bodyB: {label: "laser" }, bodyA: {label: "target"}}
        ]
      });
      // called when a collision happens
      world.on("collisions:detected", function(data) {
        var found = Physics.util.find(data.collisions, query);
        // the target is removed 
        if(found) {
          world.removeBody(this.getTargets()[0])
        }else {

        }
      }, this);
      world.on("integrate:positions", this.behave, this);
      return self;
    }
  };

  });
});