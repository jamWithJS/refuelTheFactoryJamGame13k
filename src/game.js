kontra.init();

//use a variable to store the location of the factory
let factoryPositionX = 600;
let factoryPositionY = 450;

//text for the instructions
let instructionsFirstLine = "Dodge The Asteroids and Collect Green Orbs"  
let instructionsSecondLine = "Collide with Satellite To Score Points"
let instructionsThirdLine = "Reach 20 To Win"
let timeoutInstructions = 0;
let score = 0;

//variable needed for collision code
let collectedPickup = 0;

let stars = [];

//variable needed for collision code
let halfFactory = 0;


//I couldn't use an .ogg or .mp3 file so I used https://xem.github.io/MiniSoundEditor/ to generate sounds. I placed the code in a function and I called the function in the appropriate place in the code
function playSound() {
    f = function (i) {
        var n = 4e4;
        if (i > n) return null;
        return Math.sin(i / 2000 - Math.sin(i / 331) * Math.sin(i / 61)) * t(i, n);
    }

    // Sound player
    t = (i, n) => (n - i) / n;
    A = new AudioContext()
    m = A.createBuffer(1, 96e3, 48e3)
    b = m.getChannelData(0)
    for (i = 96e3; i--;) b[i] = f(i)
    s = A.createBufferSource()
    s.buffer = m
    s.connect(A.destination)
    s.start()
}

//created an array for the asteroids (the enemies), to make it easier to manage
let asteroids = [];
kontra.assetPaths.images = 'assets/';

//here I used this bit of code from the great Zenva tutorial found here, https://gamedevacademy.org/js13kgames-tutorial-video-series/, to load the assets
//used multiple images for the different states of the ship and the factory, because I couldn't use a spritesheet animation
kontra.loadAssets('star.png', 'shipEmpty.png', "asteroid.png", "pickup.png", "shipHalf.png", "shipFull.png", "factoryEmpty.png", "factoryHalf.png").then(
    function () {

 
        let player = kontra.sprite({
            x: 100,
            y: 400,
            image: kontra.images.shipEmpty
        })

        let factory = kontra.sprite({
            x: factoryPositionX,
            y: factoryPositionY,
            image: kontra.images.factoryEmpty
        })

        let pickup = kontra.sprite({
            x: 200,
            y: 200,
            image: kontra.images.pickup
        })

        //instead of drawing a background I just used a star image and then randomly placed the star on a black background, to simulate space
        function createStars() {
            star = kontra.sprite({
                x: Math.random() * 800,
                y: Math.random() * 600,
                image: kontra.images.star
            });
            stars.push(star)
        }
        //randomly place stars on background
        for (let i = 0; i < 200; i++) {
            createStars();
        }

        let asteroid;
        //I use this function to create multiple asteroids. if the asteroids hit the player then it's game over
        function createAsteroids() {
            asteroid = kontra.sprite({
                x: Math.floor(Math.random() * 800),
                y: -20,
                image: kontra.images.asteroid
            });
            asteroids.push(asteroid);
        //create asteroids
        }
        for (let i = 0; i < 7; i++) {
            createAsteroids();
        }


        let loop = kontra.gameLoop({

            update: function () {
                
                //create a "timer" to make the instructions disappear
                timeoutInstructions += 1;
                
                //when timeoutInstructions reaches 400 the instruction text will disappear
                if (timeoutInstructions > 400) {
                    instructionsFirstLine = ""
                    instructionsSecondLine = ""
                    instructionsThirdLine = ""
                }
                
                //here I setup the controls for the ship
                if (kontra.keys.pressed('up')) {
                    player.dy -= 0.05;
                }
                if (kontra.keys.pressed('down')) {
                    player.dy += 0.05;
                }

                if (kontra.keys.pressed('left')) {
                    player.dx -= 0.05;
                }
                if (kontra.keys.pressed('right')) {
                    player.dx += 0.05;
                }
                //if the player hits the edges of the screen it will bounce back
                if (player.x >= game.width - 30) {
                    player.dx = -1;
                }
                if (player.y >= game.height - 30) {
                    player.dy = -1;
                }
                if (player.y <= 15) {
                    player.dy = 1;
                }
                if (player.x <= 0) {
                    player.dx = 1;
                }

                //move the asteroid from the asteroids array diagonally
                asteroids.forEach(function (asteroid) {
                    asteroid.dx = -0.6;
                    asteroid.dy = 1.8;
                    // if they go over the game.height or too much to the left their position will reset to the following coordinates
                    if (asteroid.y > game.height || asteroid.x < 0) {
                        asteroid.x = Math.floor(Math.random() * 800);
                        asteroid.y = -20;
                    }

                    asteroid.update();
                    
                    //if asteroid hits player, then it is Game Over and the game will restart
                    if (asteroid.collidesWith(player)) {
                        loop.stop();

                        alert('GAME OVER');

                        window.location = '';
                    }

                });
                
                //if you collect a pickup the pickup's location will reset to a random spot, and the player's sprite image will change to show that it is half full.
                if (collectedPickup === 0) {
                    if (player.collidesWith(pickup)) {
                        pickup.x = Math.random() * 600;
                         pickup.y = Math.random() * 400;
                        
                        player = kontra.sprite({
                            x: player.x,
                            y: player.y,
                            image: kontra.images.shipHalf
                        });
                        //we need this variable to check if the ship is half full or full
                        collectedPickup = 1;
                        //here we call the function that will play the sound
                        playSound();
                    }


                }

                if (collectedPickup === 1) {
                    if (player.collidesWith(pickup)) {
                         pickup.x = Math.random() * 600;
                         pickup.y = Math.random() * 400;

                        player = kontra.sprite({
                            x: player.x,
                            y: player.y,
                            image: kontra.images.shipFull
                        });
                        //if collectedPickup == 2, then you receive more points (2) if you collide with the factory
                        collectedPickup = 2;
                        playSound();
                    }
                }


                //here you score points if you have collected a pickup and you collide with the factory
                if (collectedPickup === 1 && halfFactory === 1) {
                    if (player.collidesWith(factory)) {

                        player = kontra.sprite({
                            x: player.x,
                            y: player.y,
                            image: kontra.images.shipEmpty
                        });

                        factory = kontra.sprite({
                            x: factoryPositionX,
                            y: factoryPositionY,
                            image: kontra.images.factoryEmpty
                        })
                        collectedPickup = 0;
                        halfFactory = 0;
                        score += 1;

                    }
                }
                
                if (collectedPickup === 1) {
                    if (player.collidesWith(factory)) {

                        player = kontra.sprite({
                            x: player.x,
                            y: player.y,
                            image: kontra.images.shipEmpty
                        });

                        factory = kontra.sprite({
                            x: factoryPositionX,
                            y: factoryPositionY,
                            image: kontra.images.factoryHalf
                        })
                        collectedPickup = 0;
                        halfFactory = 1;
                        score += 1;
                    }
                }

                if (collectedPickup === 2) {
                    if (player.collidesWith(factory)) {

                        player = kontra.sprite({
                            x: player.x,
                            y: player.y,
                            image: kontra.images.shipEmpty
                        });

                        factory = kontra.sprite({
                            x: factoryPositionX,
                            y: factoryPositionY,
                            image: kontra.images.factoryEmpty
                        })
                        collectedPickup = 0;
                        score += 2;
                    }
                }
                //if you get to 20 you win and the game restarts
                if (score === 20) {
                    loop.stop();

                    alert('YOU WON!');

                    window.location = '';
                }
                //here you have all the updates for the sprite
                pickup.update();

                star.update();

                asteroid.update();

                player.update();

                factory.update();


            },

            render: function () {

                //render methods for the sprites
                stars.map(star => star.render());
                asteroids.map(asteroid => asteroid.render());

                player.render();

                pickup.render();

                factory.render();
                
                //very important to place the canvas text in kontra's render function. if not, the text disappears almost immediately
                var canvas = document.getElementById('game');
                var context = game.getContext('2d');

                context.font = '25pt Calibri';
                context.fillStyle = 'blue';
                context.fillText(score, game.width / 2, 50);
                
                context.font = '15pt Calibri';
                context.fillStyle = 'blue';
                context.fillText(instructionsFirstLine, 10, 150);
                
                context.font = '15pt Calibri';
                context.fillStyle = 'blue';
                context.fillText(instructionsSecondLine, 10, 170);
                
                context.font = '15pt Calibri';
                context.fillStyle = 'blue';
                context.fillText(instructionsThirdLine, 10, 190);
            }

        });

        loop.start();
    }
);
