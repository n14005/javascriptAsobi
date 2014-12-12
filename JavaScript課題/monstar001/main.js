Puppet.create("ナイト", {
    filename: "chara3.png",
    w: 32,
    h: 32,
    behavior: ["standAlone",
    {
        sceneStart: function() {
            this.interval = 30;
            this.initialNumber = 10;
        }
    }, {
        init: function() {
            this.frame = [18, 19, 18, 19];
        }
    }, "tapChaseX",
    {
        init: function() {
            this.x = 144;
        }
    }, {
        init: function() {
            this.y = 280;
        }
    }, {
        enterframe: function(event) {
            if (enchant.puppet.Theatre.instance.frame % 10 == 9) {
                var Constructor = enchant.puppet.Actor.constructors["アイコン"];
                if (Constructor) {
                    var x = this.x + this.width / 2 - Constructor.definition.w / 2;
                    var y = this.y + this.height / 2 - Constructor.definition.h / 2;
                    var puppet = new Constructor(x, y);
                    puppet.addBehavior();
                }
            }
        }
    }]
});
Puppet.create("アイコン", {
    filename: "icon0.png",
    w: 16,
    h: 16,
    behavior: [{
        init: function() {
            this.frame = [56, 56, 56, 56];
        }
    }, "moveUp",
    {
        init: function() {
            this.speed = 100;
        }
    }]
});
Puppet.create("モンスター", {
    filename: "chara6.png",
    w: 32,
    h: 32,
    behavior: ["randomAppearTop",
    {
        sceneStart: function() {
            this.interval = 1;
            this.initialNumber = 1000;
        }
    }, {
        init: function() {
            this.frame = [3, 9, 21, 15];
        }
    }, "hitAndDie",
    {
        init: function() {
            this.collision.push("アイコン");
        }
    }, {
        hit: function(event) {
            var other = event.other;
            if (window.アイコン && (other instanceof window.アイコン)) {
                enchant.puppet.Theatre.instance.score += parseFloat(10) || 0;
            }
        }
    }, {
        enterframe: function(event) {
            if ((this.y >= 320)) {
                (function() {
                    var theatre = enchant.puppet.Theatre.instance;
                    theatre.end(theatre.score, "score: " + theatre.score);
                }());
            }
        }
    }]
});
MutableSignBoard.create("ScoreBoard", {
    t: "SCORE:0",
    score: 0,
    behavior: [{
        sceneStart: function() {
            this.startPin = [
                [0, 0]
            ];
        }
    }, {
        init: function() {
            enchant.puppet.Theatre.instance.score = 0;
        }
    }, {
        enterframe: function() {
            this.text = "SCORE:" + enchant.puppet.Theatre.instance.score;
        }
    }, "standAlone", ]
});
enchant.puppet.Theatre.changeScreen("race.png");
