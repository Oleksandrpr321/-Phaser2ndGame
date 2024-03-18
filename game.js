////Конфігуруємо гру 1
var config = {
    type: Phaser.AUTO,
    width: 1920,
    height: 1080,
    parent: game,
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
var resetButton;
var lifeLine = ''
var life = 3;
var player;
var stars;
var bombs;
var platforms;
var cursors;
var score = 0;
var gameOver = false;
var scoreText;
var lifeText;
var game = new Phaser.Game(config);
var worldWidth = 9600;
var playerSpeed = 1000
var collectStarSound; // Оголошуємо змінну для збереження звуку
function preload() {
    //Завантажили асетси 2
    this.load.image('bush', 'assets/bush.png');
    this.load.image('fon+', 'assets/fon+.png');
    this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    this.load.image('bomb', 'assets/bomb.png');
    this.load.spritesheet('dude',
        'assets/dude.png',
        { frameWidth: 32, frameHeight: 48 }
    );
    this.load.image('skyGroundStart', 'assets/skyGroundStart.png');
    this.load.image('skyGround', 'assets/skyGround.png');
    this.load.image('skyGroundEnd', 'assets/skyGroundEnd.png');
    this.load.image('Skeleton', 'assets/Skeleton.png');
    this.load.image('Tree', 'assets/Tree.png');
    // this.load.audio('collectStarSound',   'assets/collectStarSound.mp3');
    this.load.image('resetButton', 'assets/resetButton.png');
    this.load.image('heart', 'assets/life.png');
}

function create() {
    //Створюємо небо 3
    this.add.tileSprite(0, 0, worldWidth, 1080, "fon+")
        .setOrigin(0, 0);

    //Додаємо платформи 4
    platforms = this.physics.add.staticGroup();
    //Земля на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + 340) {
        console.log(x)
        platforms.create(x, 1080 - 83, 'ground')
            .setOrigin(0, 0)
            .refreshBody();
    }
    //додаємо кущі
    bush = this.physics.add.staticGroup();
    createWorldObjects(bush, 'bush')
    

    //Додавання скелетів на землю
    Skeleton = this.physics.add.staticGroup();
    createWorldObjects(Skeleton, 'Skeleton')
   
    // Додавання дерева 
    Tree = this.physics.add.staticGroup();
    createWorldObjects(Tree, 'Tree')
  
  
    resetButton = this.add.image(900, 500, 'resetButton')
    resetButton.setOrigin(0,0)
    .setDepth(10)
    .setScrollFactor(0)
    .setInteractive()
    .on('pointerdown', function() {
        // Перезавантаження гри
        location.reload();
    });

    resetButton.setVisible(false); // Початково ховаємо кнопку


   


    player = this.physics.add.sprite(1500, 900, 'dude');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    //Налаштування камери
    this.cameras.main.setBounds(0, 0, worldWidth, 1080);
    this.physics.world.setBounds(0, 0, worldWidth, 1080);
    //Слідкування камери за гравцем
    this.cameras.main.startFollow(player);

//Рандом платформи в повітрі
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.Between(800, 1000)) {
        var y = Phaser.Math.Between(550, 810)

        platforms.create(x, y, 'skyGroundStart')
        var i
        for (i = 1; i <= Phaser.Math.Between(1, 5); i++) {
            platforms.create(x + 128 * i, y, 'skyGround')
        }

        platforms.create(x + 128 * i, y, 'skyGroundEnd')
    }


    //Анімація персонажа
    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [{ key: 'dude', frame: 4 }],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    //Додали курсор 6
    cursors = this.input.keyboard.createCursorKeys();
    //Додали зірочки 8
    stars = this.physics.add.group({
        key: 'star',
        repeat: worldWidth / 100,
        setXY: { x: 12, y: 0, stepX: 100 }
    });

    stars.children.iterate(function (child) {

        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));

    });
    bombs = this.physics.add.group();
    scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(0, 0)
        .setScrollFactor(0);

    //Додавання життів
    lifeText = this.add.text(1700, 16, showLife(), { fontSize: '32px', fill: '#ffffff' })
        .setOrigin(1, 0)
        .setScrollFactor(0);
        heart = this.physics.add.group({
            key: 'heart',
            repeat: 10,
            setXY: { x: 12, y: 0, stepX: Phaser.Math.FloatBetween(1000, 2500) }
        }); 
        heart.children.iterate(function(child) {
            child.setScale(0.07);
        });
    
        heart.children.iterate(function (child) {
    
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    
        });
    
        // коллайдер життів та платформ
        this.physics.add.collider(heart, platforms);
    
        //  стикання колайдера гравця з колайдером життів
        this.physics.add.overlap(player, heart, collectHeart, null, this);
    //Додали зіткнення зірок з платформами 9
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);
    this.physics.add.collider(bombs, platforms);

    //Перевіримо чи перекривається персонаж зіркою 10
    this.physics.add.overlap(player, stars, collectStar, null, this);
    this.physics.add.collider(player, bombs, hitBomb, null, this);
}

function update() {
    if (gameOver) {
        return;
    }
    //Управління персонажем 7
    if (cursors.left.isDown) {
        player.setVelocityX(-160);

        player.anims.play('left', true);
    }
    else if (cursors.right.isDown) {
        player.setVelocityX(160);

        player.anims.play('right', true);
    }
    else {
        player.setVelocityX(0);

        player.anims.play('turn');
    }
    {
        if (gameOver) {
            return;
        }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-480);
    }

    

}
}
//Додали збирання зірок персонажем 11
function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText('Score: ' + score);

    // Створення бомби
    var x = Phaser.Math.Between(0, worldWidth);
    var y = Phaser.Math.Between(0, config.height);
    var bomb = bombs.create(x, 0, 'bomb');
    bomb.setScale(0.25);
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

    if (stars.countActive(true) === 0) // Перевірка, чи всі зірки зібрані
    {
        // Створення нових зірок
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }
}

function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    isHitByBomb = true;

    life -= 1
    lifeText.setText(showLife())

    if (life === 0) {
        resetButton.setVisible(true);
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        player.anims.play('turn');
    }
}

function showLife() {
    var lifeLine = ''

    for (var i = 0; i < life; i++) {
        lifeLine = lifeLine + '💖'
    }
    return lifeLine
}
function collectHeart(player, heart) {
    heart.disableBody(true, true);

    life += 1;

    lifeText.setText(showLife());

    console.log(life)
}

function createWorldObjects(object, asset){
    // Додавання кущів випадковим чином на всю ширину екрану
    for (var x = 0; x < worldWidth; x = x + Phaser.Math.FloatBetween(200, 500)) {
        var y = 1000;
        console.log(x, y);
        bush.create(x, y, asset)
            .setScale(Phaser.Math.FloatBetween(0.3, 0.7))
            .setOrigin(0, 1)
            .setDepth(Phaser.Math.FloatBetween(1, 10))
            .refreshBody();
}
}