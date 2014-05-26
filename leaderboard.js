// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Meteor.Collection("players");

if (Meteor.isClient) {

  Template.leaderboard.players = function () {
    var order = Session.get("is_name_order") ?
    {name: 1, score: -1} :
    {score: -1, name: 1};
    return Players.find({}, {sort: order});
  };

  Template.leaderboard.selected_name = function () {
    var player = Players.findOne(Session.get("selected_player"));
    return player && player.name;
  };

  Template.player.selected = function () {
    return Session.equals("selected_player", this._id) ? "selected" : '';
  };

  Template.leaderboard.sort_order = function () {
    var order = "Score";
    if (Session.get("is_name_order")) {
      order = "Name";
    }
    return order;
  };

  Template.leaderboard.events({
    'click input.inc': function () {
      Players.update(Session.get("selected_player"), {$inc: {score: 5}});
    },
 
    'click #sort': function () { 
      Session.set("is_name_order", !Session.get("is_name_order"));
    },

    'click #reset': function () {
      
      Players.find().forEach( function(player) {
        //console.log(player.name);
        //console.log(player.score);
        var score = Math.floor(Random.fraction()*10)*5;
        Players.update(player._id, {$set: {score: score}});
      });
    },

    'click #add': function (event, template) {
      var player = template.find('input.new-player');
      var name = $.trim(player.value)
      if (name.length) {
        Players.insert({name: name, score: Math.floor(Random.fraction()*10)*5});
        player.value = '';
      }
    }
  });
  
  Template.player.events({
    'click': function () {
      Session.set("selected_player", this._id);
    },
    'click #remove': function () {
      Players.remove(this._id);
    }
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {

    if (Players.find().count() === 0) {
      var names = ["Ada Lovelace",
                   "Grace Hopper",
                   "Marie Curie",
                   "Carl Friedrich Gauss",
                   "Nikola Tesla",
                   "Claude Shannon"];
      for (var i = 0; i < names.length; i++)
        Players.insert({name: names[i], score: Math.floor(Random.fraction()*10)*5});
    }
  });
}
