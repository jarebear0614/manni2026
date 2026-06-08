import { GameObjects, Scene, Types } from 'phaser';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { Player } from '../objects/player';
import { ChickenPink } from '../objects/enemies/chicken-pink';
import { BOSS_DESTROYED_SCORE, DEFAULT_SPRITE_SCALE, ENEMY_DESTROYED_SCORE, ENEMY_EVIL_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_EVIL_CHICKEN_GROUP_SPAWN_START, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_START, ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_PINK_CHICKEN_GROUP_SPAWN_START, LIVES_LOST_SCORE } from '../config';
import { ChickenGreen } from '../objects/enemies/chicken-green';
import { BabyChickenEvil } from '../objects/enemies/baby-chicken-evil';
import { ChickenEvil } from '../objects/enemies/chicken-evil';
import { ColliderComponent } from '../components/collider/collider-component';
import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component';
import { GroupEnemyOrchestrator } from '../components/spawners/group-enemy-orchestrator';
import { ChickenEvilBoss } from '../objects/enemies/chicken-evil-boss';
import { HealthComponent } from '../components/health/health-component';
import WebFont from 'webfontloader';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    spawners: EnemySpawnerComponent[] = [];
    enemyDestroyedComponent: EnemyDestroyedComponent;
    orchestrator: GroupEnemyOrchestrator;
    overlaps: Phaser.Physics.Arcade.Collider[] = [];

    player: Player;
    eventBusComponent: EventBusComponent;
    boss?: ChickenEvilBoss;

    bg1: GameObjects.TileSprite;
    bg2: GameObjects.TileSprite;
    bg3: GameObjects.TileSprite;
    bg4: GameObjects.TileSprite;
    bg5: GameObjects.TileSprite;

    private upOnScreen: GameObjects.Image;
    private downOnScreen: GameObjects.Image;
    private shootOnScreen: GameObjects.Image;

    private enemiesDestroyed: number = 0;
    private livesLost: number = 0;

    private hearts: GameObjects.Sprite[] = [];

    private slowScrollTime: number = 2000;
    private currentSlow: number = this.slowScrollTime;
    private endTriggered: boolean = false;

    private fadeOutRect: GameObjects.Rectangle;
    
    private endTextEnemiesDestroyedCategory: GameObjects.Text;
    private endTextEnemiesDestroyedScore: GameObjects.Text;

    private endTextBossDestroyedCategory: GameObjects.Text;
    private endTextBossDestroyedScore: GameObjects.Text;
    
    private endTextLivesLostCategory: GameObjects.Text;
    private endTextLivesLostScore: GameObjects.Text;

    private endTextTotalCategory: GameObjects.Text;
    private endTextTotalScore: GameObjects.Text;

    private myLoveForYouCategory: GameObjects.Text;
    private myLoveForYouScore: GameObjects.Text;

    private underline: GameObjects.Line;

    constructor ()
    {
        super('Game');
    }

    init(data: any)
    {
        this.injectFont();
    }

    preload()
    {
        this.load.script('webfont', 'https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js');
    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;        

        const eventBusComponent: EventBusComponent = this.eventBusComponent = new EventBusComponent();

        this.configureBackgrounds();
        this.configureOnscreenControls();
        this.configureHUD();
        this.createFont();

        const player = this.player = new Player(this, eventBusComponent, 
            {
                upOnScreen: this.upOnScreen,
                downOnScreen: this.downOnScreen,
                shootOnScreen: this.shootOnScreen
            }
        );
        this.wireEvents(eventBusComponent, player);

        this.fadeOutRect = this.add.rectangle(0, 0, this.getGameWidth() * 1.02, this.getGameHeight() * 1.02, 0x000)
            .setScrollFactor(0, 0)
            .setOrigin(0, 0)
            .setAlpha(0)
            .setDepth(3);    
            
        
        console.log(this.sound.get('theme'));


        let theme = this.sound.add('theme');
        theme.addMarker(
            {
                name: 'theme_first',
                start: 0,
                duration: 78,
                config: {
                    loop: true
                }
            });

        theme.addMarker(
            {
                name: 'theme_loop',
                start: 2.4,
                duration: 78,
                config: {
                    loop: true
                }
            });

        theme.play('theme_first',
            {
                loop: false,
                volume: 0.5
            }
        );

        theme.on('complete', () => {
            theme.play('theme_loop', { loop: true, volume: 0.5 });
        })
    }

    private configureOnscreenControls() 
    {
        let directionsTopLeft = {x: this.getGameWidth() * .08, y: this.getGameHeight() * .75};
        this.upOnScreen = this.add.image(0, 0, 'up').setInteractive({useHandCursor: true}).setScrollFactor(0);
        this.downOnScreen = this.add.image(0, 0, 'down').setInteractive({useHandCursor: true}).setScrollFactor(0);
        this.shootOnScreen = this.add.image(this.getGameWidth() * 0.92, this.getGameHeight() * 0.88, 'abutton').setInteractive({useHandCursor: true}).setScrollFactor(0);

        Align.scaleToGameWidth(this.upOnScreen, 0.06, this);
        Align.scaleToGameWidth(this.downOnScreen, 0.06, this);
        Align.scaleToGameWidth(this.shootOnScreen, 0.06, this);

        this.upOnScreen.setPosition(directionsTopLeft.x, directionsTopLeft.y);
        this.downOnScreen.setPosition(directionsTopLeft.x, directionsTopLeft.y + this.upOnScreen.displayHeight + 10);
    }

    private wireEvents(eventBusComponent: EventBusComponent, player: Player) 
    {
        this.orchestrator = new GroupEnemyOrchestrator(this, eventBusComponent, [
            [
                new EnemySpawnerComponent(this, ChickenPink, {
                    interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
                    initialSpawnTime: 2000,
                    maxCount: 1
                }, eventBusComponent)
            ]
            // [
            //     new EnemySpawnerComponent(this, ChickenPink, {
            //         interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
            //         initialSpawnTime: ENEMY_PINK_CHICKEN_GROUP_SPAWN_START,
            //         maxCount: 2
            //     }, eventBusComponent),
            //     new EnemySpawnerComponent(this, ChickenGreen, {
            //         interval: ENEMY_GREEN_CHICKEN_GROUP_SPAWN_INTERVAL,
            //         initialSpawnTime: ENEMY_GREEN_CHICKEN_GROUP_SPAWN_START,
            //         maxCount: 1
            //     }, eventBusComponent)
            // ],
            // [
            //     new EnemySpawnerComponent(this, ChickenPink, {
            //         interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
            //         initialSpawnTime: ENEMY_PINK_CHICKEN_GROUP_SPAWN_START,
            //         maxCount: 1
            //     }, eventBusComponent),
            //     new EnemySpawnerComponent(this, ChickenPink, {
            //         interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
            //         initialSpawnTime: ENEMY_PINK_CHICKEN_GROUP_SPAWN_START,
            //         maxCount: 1
            //     }, eventBusComponent),
            //     new EnemySpawnerComponent(this, ChickenEvil, {
            //         interval: ENEMY_EVIL_CHICKEN_GROUP_SPAWN_INTERVAL,
            //         initialSpawnTime: ENEMY_EVIL_CHICKEN_GROUP_SPAWN_START,
            //         maxCount: 2
            //     }, eventBusComponent)
            // ],
        ]);

        this.enemyDestroyedComponent = new EnemyDestroyedComponent(this, eventBusComponent);

        eventBusComponent.on(CUSTOM_EVENTS.ENEMY_INIT, (enemy: any) => 
        {
            if (enemy.getWeaponGameObjectGroup && typeof (enemy.getWeaponGameObjectGroup) === 'function') {
                this.physics.add.overlap(player, enemy.getWeaponGameObjectGroup(), (playerGeneric: any, enemyBullet: any) => {
                    if (!playerGeneric.active || !enemyBullet.active) {
                        return;
                    }

                    player.getColliderComponent().collideWithEnemyEgg();

                    if (enemy.getWeaponComponent && typeof (enemy.getWeaponComponent) === 'function') {
                        enemy.getWeaponComponent().destroyBullet(enemyBullet);
                    }
                });
            }
        });

        eventBusComponent.on(CUSTOM_EVENTS.GROUP_INIT, (group: GameObjects.Group) => 
        {
            this.overlaps.push(this.physics.add.overlap(player, group, (playerGeneric: any, enemyGeneric: any) => {
                if (!playerGeneric.active || !enemyGeneric.active) {
                    return;
                }

                const player = playerGeneric as Player;
                if (player) {
                    player.getColliderComponent().collideWithEnemyChicken();
                }

                if (enemyGeneric.getColliderComponent && typeof (enemyGeneric.getColliderComponent) === 'function') {
                    const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                    colliderComponent.collideWithEnemyChicken();
                }
            }));

            this.overlaps.push(this.physics.add.overlap(group, player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) => {
                if (!enemyGeneric.active || !playerBullet.active) {
                    return;
                }

                if (enemyGeneric.getColliderComponent && typeof (enemyGeneric.getColliderComponent) === 'function') {
                    const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                    colliderComponent.collideWithEnemyEgg();
                }

                player.getWeaponComponent().destroyBullet(playerBullet);

                this.enemiesDestroyed++;
            }));
        });

        this.orchestrator.on(GroupEnemyOrchestrator.Events.WAVE_CHANGE, (next: EnemySpawnerComponent[] | null, previous: EnemySpawnerComponent[] | null) => 
        {
            this.overlaps.forEach((overlap) => {
                overlap.destroy();
            });

            this.overlaps = [];

            if (next !== null) {
                next.forEach((spawner) => {
                    this.overlaps.push(this.physics.add.overlap(player, spawner.getGroup(), (playerGeneric: any, enemyGeneric: any) => {
                        if (!playerGeneric.active || !enemyGeneric.active) {
                            return;
                        }

                        const player = playerGeneric as Player;
                        if (player) {
                            player.getColliderComponent().collideWithEnemyChicken();
                        }

                        if (enemyGeneric.getColliderComponent && typeof (enemyGeneric.getColliderComponent) === 'function') {
                            const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                            colliderComponent.collideWithEnemyChicken();
                        }
                    }));

                    this.overlaps.push(this.physics.add.overlap(spawner.getGroup(), player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) => {
                        if (!enemyGeneric.active || !playerBullet.active) {
                            return;
                        }

                        if (enemyGeneric.getColliderComponent && typeof (enemyGeneric.getColliderComponent) === 'function') {
                            const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                            colliderComponent.collideWithEnemyEgg();
                        }

                        player.getWeaponComponent().destroyBullet(playerBullet);

                        this.enemiesDestroyed++;
                    }));
                });
            }
            else {
                this.spawnBoss();
            }
        });

        this.eventBusComponent.on(CUSTOM_EVENTS.PLAYER_DEAD, () =>
        {
            this.livesLost++;
            this.orchestrator.pause();
        });

        this.eventBusComponent.on(CUSTOM_EVENTS.PLAYER_RESPAWNED, () =>
        {
            this.orchestrator.unpause();
        });

        this.orchestrator.start();
    }

    update(timestamp: number, deltaTime: number)
    {
        if(this.endTriggered)
        {
            this.currentSlow -= deltaTime;
            if(this.currentSlow <= 0)
            {
                this.currentSlow = 0;
            }
        }

        this.bg2.tilePositionX += (deltaTime * 0.010) * (this.currentSlow / this.slowScrollTime);
        this.bg3.tilePositionX += (deltaTime * 0.020) * (this.currentSlow / this.slowScrollTime);
        this.bg4.tilePositionX += (deltaTime * 0.030) * (this.currentSlow / this.slowScrollTime);
        this.bg5.tilePositionX += (deltaTime * 0.040) * (this.currentSlow / this.slowScrollTime);

        let healthComponent: HealthComponent = this.player.getHealthComponent();

        for(let i = 0; i < healthComponent.getCurrent(); ++i)
        {
            this.hearts[i].setFrame('hud_heartFull.png');
        }

        for(let i = healthComponent.getCurrent(); i < healthComponent.getMax(); ++i)
        {
            this.hearts[i].setFrame('hud_heartEmpty.png');
        }
    }

    private configureBackgrounds()
    {
        this.bg1 = this.add.tileSprite(0, -100, 0, 0, 'bg1').setOrigin(0, 0).setScrollFactor(0, 0);
        this.bg2 = this.add.tileSprite(0, 0, 0, 0, 'bg2').setOrigin(0, 0).setScrollFactor(0, 0);
        this.bg3 = this.add.tileSprite(0, 0, 0, 0, 'bg3').setOrigin(0, 0).setScrollFactor(0, 0);
        this.bg4 = this.add.tileSprite(0, 0, 0, 0, 'bg4').setOrigin(0, 0).setScrollFactor(0, 0);
        this.bg5 = this.add.tileSprite(0, 0, 0, 0, 'bg5').setOrigin(0, 0).setScrollFactor(0, 0);
        this.bg1.setScale(this.getGameWidth() / this.bg1.displayWidth, this.getGameHeight() / this.bg1.displayHeight);
        this.bg2.setScale(this.getGameWidth() / this.bg2.displayWidth, this.getGameHeight() / this.bg2.displayHeight);
        this.bg3.setScale(this.getGameWidth() / this.bg3.displayWidth, this.getGameHeight() / this.bg3.displayHeight);
        this.bg4.setScale(this.getGameWidth() / this.bg4.displayWidth, this.getGameHeight() / this.bg4.displayHeight);
        this.bg5.setScale(this.getGameWidth() / this.bg5.displayWidth, this.getGameHeight() / this.bg5.displayHeight);
    }

    private configureHUD()
    {
        let x = this.getGameWidth() * 0.05;
        let y = this.getGameHeight() * 0.05;
        let heartOne = this.add.sprite(x, y, 'hud', 'hud_heartFull.png').setScrollFactor(0);
        let heartTwo = this.add.sprite(x, y, 'hud', 'hud_heartFull.png').setScrollFactor(0);
        let heartThree = this.add.sprite(x, y, 'hud', 'hud_heartFull.png').setScrollFactor(0);
        let heartFour = this.add.sprite(x, y, 'hud', 'hud_heartFull.png').setScrollFactor(0);

        Align.scaleObjectsToGameWidth([heartOne, heartTwo, heartThree, heartFour], 0.02, this);

        heartTwo.setPosition(heartOne.x + heartOne.displayWidth, heartOne.y);
        heartThree.setPosition(heartOne.x + heartOne.displayWidth * 2, heartOne.y);
        heartFour.setPosition(heartOne.x + heartOne.displayWidth * 3, heartOne.y);

        this.hearts.push(heartOne, heartTwo, heartThree, heartFour);
    }

    private spawnBoss()
    {
        this.boss = new ChickenEvilBoss(this, this.getGameWidth() + 300, this.getGameHeight() / 2);
        this.boss.init(this.eventBusComponent);

        this.player.pause();

        this.orchestrator.removeAllListeners();
        this.eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: GameObjects.GameObject) => 
        {
            if(enemy.name === "ChickenEvilBoss")
            {
                this.triggerEndScreen();
            }
        }, this);

        let t = this.tweens.add({
            targets: this.boss,
            x: { from: this.boss.x, to: this.getGameWidth() * 0.70 },
            ease: 'Linear',
            duration: 10000,
            repeat: 0,
            yoyo: false
        });

        this.cameras.main.shake(12000, 0.005, true);
        t.onCompleteHandler = () =>
        {
            this.tweens.killTweensOf(this.boss!);
            this.time.delayedCall(2000, () =>
            {
                this.player.unpause();
                this.boss!.startVerticalMovement();                

                this.physics.add.overlap(this.player, this.boss!, (playerGeneric: any, enemyGeneric: any) =>
                {
                    if(!playerGeneric.active || !enemyGeneric.active)
                    {
                        return;
                    }
                    
                    const player = playerGeneric as Player;
                    if(player)
                    {
                        player.getColliderComponent().collideWithEnemyChicken();
                    }

                    if(enemyGeneric.getColliderComponent && typeof(enemyGeneric.getColliderComponent) === 'function')
                    {
                        const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                        colliderComponent.collideWithEnemyChicken();
                    }
                });

                this.overlaps.push(this.physics.add.overlap(this.boss!, this.player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
                {
                    if(!enemyGeneric.active || !playerBullet.active)
                    {
                        return;
                    }

                    if(enemyGeneric.getColliderComponent && typeof(enemyGeneric.getColliderComponent) === 'function')
                    {
                        const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                        colliderComponent.collideWithEnemyEgg();
                    }

                    this.player.getWeaponComponent().destroyBullet(playerBullet);
                }));
            });
        }
    }

    private triggerEndScreen()
    {
        this.player.pause();

        this.endTriggered = true;        

        this.sound.stopAll();
        this.sound.play('ending', 
        {
            volume: 0.5,
            loop: true
        });

        const enemiesDestroyedScore = this.enemiesDestroyed * ENEMY_DESTROYED_SCORE;
        const livesLostScore = this.livesLost * LIVES_LOST_SCORE;
        const totalScore = enemiesDestroyedScore + BOSS_DESTROYED_SCORE - livesLostScore;

        this.endTextEnemiesDestroyedScore.text = enemiesDestroyedScore.toString().padStart(8, '0');
        this.endTextLivesLostScore.text = livesLostScore.toString().padStart(8, '0');
        this.endTextTotalScore.text = totalScore.toString().padStart(8, '0');

        let t = this.tweens.add({
            targets: this.fadeOutRect,
            alpha: { from: 0, to: 0.50 },
            ease: 'Linear',
            duration: 2000,
            repeat: 0,
            yoyo: false
        });

        t.onCompleteHandler = () =>
        {
            this.tweens.killTweensOf(this.fadeOutRect);

            this.tweens.add({
                targets: this.endTextEnemiesDestroyedCategory,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 300
            });

            this.tweens.add({
                targets: this.endTextEnemiesDestroyedScore,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 300
            });

            this.tweens.add({
                targets: this.endTextBossDestroyedCategory,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 1300
            });

            this.tweens.add({
                targets: this.endTextBossDestroyedScore,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 1300,
            });

            this.tweens.add({
                targets: this.endTextLivesLostCategory,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 2300
            });

            this.tweens.add({
                targets: this.endTextLivesLostScore,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 2300
            });

            this.tweens.add({
                targets: this.underline,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1000,
                repeat: 0,
                yoyo: false,
                delay: 2300
            });

            this.tweens.add({
                targets: this.endTextTotalCategory,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 200,
                repeat: 0,
                yoyo: false,
                delay: 3500,
                startDelay: 3500,
                onStart: () =>
                {
                    this.camera.shake(100, 0.001);
                }
            });

            this.tweens.add({
                targets: this.endTextTotalScore,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 200,
                repeat: 0,
                yoyo: false,
                delay: 3500
            });

            this.tweens.add({
                targets: this.myLoveForYouCategory,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1200,
                repeat: 0,
                yoyo: false,
                delay: 4000
            });

            this.tweens.add({
                targets: this.myLoveForYouScore,
                alpha: { from: 0, to: 1 },
                ease: 'Linear',
                duration: 1200,
                repeat: 0,
                yoyo: false,
                delay: 4000
            });
        }
    }

    private injectFont() {
        const element = document.createElement('style');
        document.head.appendChild(element);
        const sheet = element.sheet;

        if (sheet) {
            let styles = '@font-face { font-family: "quartz"; src: url("assets/font/QuartzMSRegular.TTF") format("TrueType"); }\n';
            sheet.insertRule(styles, 0);
        }
    }

    private createFont()
    {
        WebFont.load({
            custom: {
                families: [ 'quartz' ]
            },
            active: () =>
            {                
                this.createEndTextObjects();
            }
        });
    }

    private createEndTextObjects()
    {
        this.endTextEnemiesDestroyedCategory = this.add.text(this.getGameWidth() * 0.27, this.getGameHeight() * 0.20, 'ENEMIES DESTROYED', {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}).setAlpha(0.0).setDepth(4);
        this.endTextEnemiesDestroyedScore = this.add.text(
                                            this.getGameWidth() * 0.60, 
                                            this.getGameHeight() * 0.20, 
                                            this.enemiesDestroyed.toString().padStart(8, '0'), 
                                            {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}
                                        ).setAlign('right').setAlpha(0.0).setDepth(4);

        this.endTextBossDestroyedCategory = this.add.text(this.getGameWidth() * 0.27, this.getGameHeight() * 0.30, 'BOSS DESTROYED', {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}).setAlpha(0.0).setDepth(4);
        this.endTextBossDestroyedScore = this.add.text(
                                            this.getGameWidth() * 0.60, 
                                            this.getGameHeight() * 0.30, 
                                            BOSS_DESTROYED_SCORE.toString().padStart(8, '0'), 
                                            {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}
                                        ).setAlign('right').setAlpha(0.0).setDepth(4);

        this.endTextLivesLostCategory = this.add.text(this.getGameWidth() * 0.27, this.getGameHeight() * 0.40, 'LIVES LOST', {fontFamily: 'Quartz', fontSize: 36, color: '#ff0000'}).setAlpha(0.0).setDepth(4);
        this.endTextLivesLostScore = this.add.text(
                                            this.getGameWidth() * 0.60, 
                                            this.getGameHeight() * 0.40, 
                                            this.enemiesDestroyed.toString().padStart(8, '0'), 
                                            {fontFamily: 'Quartz', fontSize: 36, color: '#ff0000'}
                                        ).setAlign('right').setAlpha(0.0).setDepth(4);

        this.underline = this.add.line(0, 0, this.getGameWidth() * 0.60, this.getGameHeight() * 0.41 + this.endTextLivesLostScore.displayHeight, this.getGameWidth() * 0.60 + this.endTextLivesLostScore.displayWidth, this.getGameHeight() * 0.41 + this.endTextLivesLostScore.displayHeight, 0xFFFFFF).setOrigin(0, 0).setAlpha(0.0).setDepth(4);

        this.endTextTotalCategory = this.add.text(this.getGameWidth() * 0.27, this.getGameHeight() * 0.50, 'TOTAL', {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}).setAlpha(0.0).setDepth(4);
        this.endTextTotalScore = this.add.text(
                                            this.getGameWidth() * 0.60, 
                                            this.getGameHeight() * 0.50, 
                                            this.enemiesDestroyed.toString().padStart(8, '0'), 
                                            {fontFamily: 'Quartz', fontSize: 36, color: '#fff'}
                                        ).setAlign('right').setAlpha(0.0).setDepth(4);
        
        this.myLoveForYouCategory = this.add.text(this.getGameWidth() * 0.27, this.getGameHeight() * 0.60, 'MY LOVE FOR YOU', {fontFamily: 'Quartz', fontSize: 36, color: '#00FF00'}).setAlpha(0.0).setDepth(4);
        this.myLoveForYouScore = this.add.text(
                                            this.getGameWidth() * 0.60, 
                                            this.getGameHeight() * 0.60, 
                                            '(∞π)²', 
                                            {fontFamily: 'Quartz', fontSize: 36, color: '#00ff00'}
                                        ).setAlign('right').setAlpha(0.0).setDepth(4);
    }
}
