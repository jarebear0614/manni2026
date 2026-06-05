import { Scene, Types } from 'phaser';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { Player } from '../objects/player';
import { ChickenPink } from '../objects/enemies/chicken-pink';
import { DEFAULT_SPRITE_SCALE, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_GREEN_CHICKEN_GROUP_SPAWN_START, ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL, ENEMY_PINK_CHICKEN_GROUP_SPAWN_START } from '../config';
import { ChickenGreen } from '../objects/enemies/chicken-green';
import { BabyChickenEvil } from '../objects/enemies/baby_chicken_evil';
import { ChickenEvil } from '../objects/enemies/chicken-evil';
import { ColliderComponent } from '../components/collider/collider-component';
import { EnemySpawnerComponent } from '../components/spawners/enemy-spawner-component';
import { CUSTOM_EVENTS, EventBusComponent } from '../components/events/event-bus-component';
import { EnemyDestroyedComponent } from '../components/spawners/enemy-destroyed-component';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    spawners: EnemySpawnerComponent[] = [];
    enemyDestroyedComponent: EnemyDestroyedComponent;

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

        const eventBusComponent: EventBusComponent = new EventBusComponent();
        const player = new Player(this);
        Align.scaleContainerToGameWidth(player, DEFAULT_SPRITE_SCALE, this);

        this.spawners.push(new EnemySpawnerComponent(this, ChickenPink, {
            interval: ENEMY_PINK_CHICKEN_GROUP_SPAWN_INTERVAL,
            initialSpawnTime: ENEMY_PINK_CHICKEN_GROUP_SPAWN_START
        }, eventBusComponent));

        this.spawners.push(new EnemySpawnerComponent(this, ChickenGreen, {
            interval: ENEMY_GREEN_CHICKEN_GROUP_SPAWN_INTERVAL,
            initialSpawnTime: ENEMY_GREEN_CHICKEN_GROUP_SPAWN_START
        }, eventBusComponent));

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

        this.spawners.forEach( (spawner) =>
        {
            this.physics.add.overlap(player, spawner.getGroup(), (playerGeneric: any, enemyGeneric: any) =>
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

            this.physics.add.overlap(spawner.getGroup(), player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
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
            });
        });
    }

    update()
    {
    }
}
