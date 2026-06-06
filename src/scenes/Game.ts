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
        const player = this.player = new Player(this);
        Align.scaleContainerToGameWidth(player, DEFAULT_SPRITE_SCALE, this);
        
        this.orchestrator = new GroupEnemyOrchestrator(this, eventBusComponent, [
            [
                new EnemySpawnerComponent(this, ChickenPink, {
                    interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
                    initialSpawnTime: ENEMY_PINK_CHICKEN_GROUP_SPAWN_START,
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
            if(enemy.getWeaponGameObjectGroup && typeof(enemy.getWeaponGameObjectGroup) === 'function')
            {
                this.physics.add.overlap(player, enemy.getWeaponGameObjectGroup(), (playerGeneric: any, enemyBullet: any) =>
                {
                    if(!playerGeneric.active || !enemyBullet.active)
                    {
                        return;
                    }

                    player.getColliderComponent().collideWithEnemyEgg();
                    
                    if(enemy.getWeaponComponent && typeof(enemy.getWeaponComponent) === 'function')
                    {
                        enemy.getWeaponComponent().destroyBullet(enemyBullet);
                    }
                });   
            }
        });

        eventBusComponent.on(CUSTOM_EVENTS.GROUP_INIT, (group: GameObjects.Group) =>
        {
            this.overlaps.push(this.physics.add.overlap(player, group, (playerGeneric: any, enemyGeneric: any) =>
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
            }));

            this.overlaps.push(this.physics.add.overlap(group, player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
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

                player.getWeaponComponent().destroyBullet(playerBullet);
            }));
        });

        this.orchestrator.on(GroupEnemyOrchestrator.Events.WAVE_CHANGE, (next: EnemySpawnerComponent[] | null, previous: EnemySpawnerComponent[] | null) =>
        {
            this.overlaps.forEach((overlap) =>
            {
                overlap.destroy();
            });

            this.overlaps = [];

            if(next !== null)
            {
                next.forEach( (spawner) =>
                {
                    this.overlaps.push(this.physics.add.overlap(player, spawner.getGroup(), (playerGeneric: any, enemyGeneric: any) =>
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
                    }));

                    this.overlaps.push(this.physics.add.overlap(spawner.getGroup(), player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
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

                        player.getWeaponComponent().destroyBullet(playerBullet);
                    }));
                });
            }
            else
            {
                this.spawnBoss();
            }            
        });

        this.orchestrator.start();        
    }

    update()
    {
    }

    private spawnBoss()
    {
        this.boss = new ChickenEvilBoss(this, this.getGameWidth() * 0.70, this.getGameHeight() / 2);
        this.boss.init(this.eventBusComponent);

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
    }
}
