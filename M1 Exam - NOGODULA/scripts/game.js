var config = {
    type: Phaser.AUTO,
    width: 1740,
    height: 910,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

// Sprites (Player,Collectables,Bomb)
var player;
var primogems;
var dodocos;

// Sprites (Ground Platform, Crate Box)
var platforms;
var crate;

// Cursor Controls
var cursors;

// The Text UI Variables and its settings
var primogemscollected = 0;
var gameOver = false;
var Primogemstext;
var gameOverText;
var score = 0;
var scoreText;

// Color in order: (Red, Orange, Yellow, Green, Blue, Indigo, Violet)
// Array Sets of colors (In order)
var colors = [0xff0000, 0xffa500, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0xee82ee];
var colorIndex = 0;

var game = new Phaser.Game(config);

function preload ()
{
    // The Images Set of preload file
    this.load.image('namek', 'assets/images/mek.png');
    this.load.image('land', 'assets/images/land.png');
    this.load.image('primogem', 'assets/images/primogem32.png');
    this.load.image('dodoco', 'assets/images/dodoco64.png');
    this.load.image('box', 'assets/images/box.png');
    this.load.spritesheet('cell', 'assets/images/cell.png', { frameWidth: 32, frameHeight: 48 });
    
    // The Background Music preload file
    this.load.audio('bgmusic', 'assets/sounds/faruzan.mp3');
}

function create ()
{
    //  Background Image of Whole Canvas
    this.add.image(800, 400, 'namek');

    // Background Music Function
    var ingameSND=this.sound.add('bgmusic');
    ingameSND.loop=true;
    ingameSND.play();

    //  Platform Physics Function
    platforms = this.physics.add.staticGroup();

    // Platform Sprites and its Positions (Ground)
    platforms.create(400, 890, 'land').setScale(2).refreshBody();
    platforms.create(1200, 890, 'land').setScale(2).refreshBody();
    platforms.create(2000, 890, 'land').setScale(2).refreshBody();

    //  Flying Platform Sprites and its Position (Sky)
    platforms.create(500, 720, 'land');
    platforms.create(100, 610, 'land');
    platforms.create(720, 500, 'land');
    platforms.create(1200, 600, 'land');
    platforms.create(1000, 720, 'land');
    platforms.create(1600, 460, 'land');
    platforms.create(1640, 680, 'land');
   
    //Box Physics Function
    crate = this.physics.add.staticGroup();

    // Box Sprites and its Position (Obstacles)
    crate.create(800, 450, 'box');
    crate.create(1200, 550, 'box');
    crate.create(30, 560, 'box');
    crate.create(1710, 410, 'box');
    crate.create(500, 670, 'box');

    // The player and its start position
    player = this.physics.add.sprite(100, 450, 'cell');

    //  Player Physics Properties
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);

    //   The player animations, turning, walking left and walking right.
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('cell', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'cell', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('cell', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //  keyboard Input Events
    cursors = this.input.keyboard.createCursorKeys();

    //  Primogems physics and its position to the scene
    primogems = this.physics.add.group({
        key: 'primogem',
        repeat: 0,
        setXY: { x: 300, y: 0, stepX: 70 }
    });

    primogems.children.iterate(function (child) {

        //  Gives the Primogems Bouncing settings
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    });

    dodocos = this.physics.add.group();

    // Primogems Collected Text UI (Display)
    Primogemstext = this.add.text(1150, 16, 'Primogems Collected: 0', { fontSize: '40px', fill: '#F7FF00' });

    // Score Text UI (Display)
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '40px', fill: '#F7FF00' });

    // Game Over Text UI (Display)
    gameOverText = this.add.text(540, 300, 'Game Over', { fontSize: '128px', fill: '#FE00B5' });
    gameOverText.visible = false
    
    // Platform Physics Collider
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(primogems, platforms);
    this.physics.add.collider(dodocos, platforms);
    
    // Box Physics Collider
    this.physics.add.collider(player, crate);
    this.physics.add.collider(primogems, crate);
    this.physics.add.collider(dodocos, crate);

    //  Checks to see if the player overlaps with any of the primogems, if the player does call the collectPrimogems function
    // Physics Collider of all sprite subjects
    this.physics.add.overlap(player, primogems, collectPrimogem, null, this);

    this.physics.add.collider(player, dodocos, hitDodoco, null, this);
}

function update ()
{
    if (gameOver)
    {
        return;
    }

    if (cursors.left.isDown)
    {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown)
    {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else
    {
        player.setVelocityX(0);

        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down)
    {
        player.setVelocityY(-330);
    }
}

function collectPrimogem (player, primogem)
{
    primogem.disableBody(true, true);

    //  Add and update the score everytime the player collects the primogems
    score += 10;
    scoreText.setText('Score: ' + score);

    primogemscollected++;
    if (primogemscollected % 2 === 0) {

        // Phaser Math Spawn of Dodoco's Bomb
        const x = Phaser.Math.Between(0, game.config.width);
        const dodoco = dodocos.create(x, 16, 'dodoco');

        // Dodoco's Bomb bounce & velocity settings
        dodoco.setBounce(1);
        dodoco.setCollideWorldBounds(true);
        dodoco.setVelocity(Phaser.Math.Between(-200, 200), 20);
    }
    primogems.remove(primogem);

    // Primogems spawner settings and bounce physics
    const x = Phaser.Math.Between(0, game.config.width);
    const y = Phaser.Math.Between(0, game.config.height - 100);
    const newStar = primogems.create(x, y, 'primogem');
    newStar.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    // Calling the update obtained scores to the assign 'primogemscollected'
    Primogemstext.setText('Primogems Collected: ' + primogemscollected);

    if (primogemscollected % 5 === 0) {
        player.setScale(player.scaleX * 1.1, player.scaleY * 1.1);
    }
    
    // Player Sprite Color changer settings using 'setTint'
    // Using the color variable of arrays list in order to change the color 
    // everytime the Player collide with the Primogems
    // With the iterate functions 
    player.setTint(colors[colorIndex]);
    colorIndex++;
    if(colorIndex >= colors.length) colorIndex = 0;
    
    if (primogems.countActive(true) === 0)
    {
        primogems.children.iterate(function (child) {

            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function hitDodoco (player, dodocos)
{
    this.physics.pause();

    // Turns 'Black Color' when it collide to the Bombs
    // To let know the user's the game is over
    player.setTint('#FFFFFF');

    player.anims.play('turn');
    
    gameOver = true;

    // Shows Game Over Text using 'True'
    // When the player collide with the Dodoco's Bomb
    gameOverText.visible = true
   
}





   
    
