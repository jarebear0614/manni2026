import { GameObjects, Scene, Types } from 'phaser';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { Player } from '../objects/player';
import { ChickenPink } from '../objects/enemies/chicken-pink';
import { DEFAULT_SPRITE_SCALE, ENEMY_EVIL_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_EVIL_CHICKEN_GROUP_SPAWN_START, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_START, ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_PINK_CHICKEN_GROUP_SPAWN_START } from '../config';
import { ChickenGreen } from '../objects/enemies/chicken-green';
import { BabyChickenEvil } from '../objects/enemies/baby_chicken_evil';
import { ChickenEvil } from '../objects/enemies/chicken-evil';
import { ColliderComponent } from '../components/collider/collider-component';
import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component';
import { GroupEnemyOrchestrator } from '../components/spawners/group-enemy-orchestrator';
import { ChickenEvilBoss } from '../objects/enemies/chicken-evil-boss';

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

    constructor ()
    {
        super('Game');
    }

    preload()
    {

    }

    create ()
    {
        super.create();

        this.camera = this.cameras.main;        

        const eventBusComponent: EventBusComponent = this.eventBusComponent = new EventBusComponent();

        this.configureBackgrounds();
        this.configureOnscreenControls();

        const player = this.player = new Player(this, this.upOnScreen, this.downOnScreen, this.shootOnScreen);
        this.wireEvents(eventBusComponent, player);        
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
                    }));
                });
            }

            else {
                this.spawnBoss();
            }
        });

        this.orchestrator.start();
    }

    update(timestamp: number, deltaTime: number)
    {
        this.bg2.tilePositionX += deltaTime * 0.010;
        this.bg3.tilePositionX += deltaTime * 0.020;
        this.bg4.tilePositionX += deltaTime * 0.030;
        this.bg5.tilePositionX += deltaTime * 0.040;
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
                console.log('boss destroyed');
            }
        }, this);

        this.physics.add.overlap(this.player, this.boss, (playerGeneric: any, enemyGeneric: any) =>
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

        this.overlaps.push(this.physics.add.overlap(this.boss, this.player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
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
            });
        }
    }
}
