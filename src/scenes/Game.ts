import { Scene, Types } from 'phaser';
import { BaseScene } from './BaseScene';
import { Align } from '../util/align';
import { Player } from '../objects/player';
import { ChickenPink } from '../objects/enemies/chicken-pink';
import { DEFAULT_SPRITE_SCALE } from '../config';
import { ChickenGreen } from '../objects/enemies/chicken-green';
import { BabyChickenEvil } from '../objects/enemies/baby_chicken_evil';
import { ChickenEvil } from '../objects/enemies/chicken-evil';
import { ColliderComponent } from '../components/collider/collider-component';

export class Game extends BaseScene
{
    camera: Phaser.Cameras.Scene2D.Camera;

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

        const player = new Player(this);
        Align.scaleContainerToGameWidth(player, DEFAULT_SPRITE_SCALE, this);

        const pinkChicken = new ChickenPink(this, this.getGameWidth() * 0.85, this.getGameHeight() / 2 - 8);
        Align.scaleContainerToGameWidth(pinkChicken, DEFAULT_SPRITE_SCALE, this);

        const greenChicken = new ChickenGreen(this, this.getGameWidth() * 0.85, this.getGameHeight() * 0.10 - 8);
        Align.scaleContainerToGameWidth(greenChicken, DEFAULT_SPRITE_SCALE, this);

        const evilChicken = new ChickenEvil(this, this.getGameWidth() * 0.85, this.getGameHeight() * 0.30 - 8);
        Align.scaleContainerToGameWidth(evilChicken, DEFAULT_SPRITE_SCALE, this);

        const evilChickenBaby = new BabyChickenEvil(this, this.getGameWidth() * 0.85, this.getGameHeight() * 0.70- 8);
        Align.scaleContainerToGameWidth(evilChickenBaby, DEFAULT_SPRITE_SCALE, this);

        this.physics.add.overlap(player, [pinkChicken, greenChicken, evilChicken, evilChickenBaby], (playerGeneric: any, enemyGeneric: any) =>
        {
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

        this.physics.add.overlap(player, pinkChicken.getWeaponGameObjectGroup(), (playerGeneric: any, bulletGeneric: any) =>
        {
            const player = playerGeneric as Player;
            if(player)
            {
                player.getColliderComponent().collideWithEnemyEgg();
            }

            pinkChicken.getWeaponComponent().destroyBullet(bulletGeneric);
        });

        this.physics.add.overlap(pinkChicken, player.getWeaponGameObjectGroup(), (enemyGeneric: any, playerBullet: any) =>
        {
            if(enemyGeneric.getColliderComponent && typeof(enemyGeneric.getColliderComponent) === 'function')
            {
                const colliderComponent: ColliderComponent = enemyGeneric.getColliderComponent();
                colliderComponent.collideWithEnemyEgg();
            }

            player.getWeaponComponent().destroyBullet(playerBullet);
        });
    }

    update()
    {
    }
}
