import { Animations, GameObjects } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { CUSTOM_EVENTS, EventBusComponent } from "../events/event-bus-component";
import { EnemyDeathConfig } from "../../objects/enemy-death-config";

export class EnemyDestroyedComponent
{
    private scene: BaseScene;
    private group: GameObjects.Group;
    private eventBusComponent: EventBusComponent;

    constructor(scene: BaseScene, eventBusComponent: EventBusComponent, enemyDestroyedExplosionAnimationKey: string = 'explosion_enemy')
    {
        this.scene = scene;
        this.eventBusComponent = eventBusComponent;

        this.group = this.scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`
        });

        this.eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: any) =>
        {
            const getDeathConfigFn: () => (EnemyDeathConfig | null | undefined) = enemy.getEnemyDeathConfig && typeof(enemy.getEnemyDeathConfig) === 'function' ? enemy.getEnemyDeathConfig : () => { return null; };
            const deathConfig = getDeathConfigFn.bind(enemy)();

            if(deathConfig === null || deathConfig === undefined)
            {
                return;
            }

            deathConfig.explosionSprite.play(deathConfig.deathAnimationAssetKey);
            this.scene.sound.play('small-explosion', { loop: false, volume: 0.1 });

            deathConfig.explosionSprite.setVisible(true);

            deathConfig.explosionSprite.on(Animations.Events.ANIMATION_UPDATE, (animation: Animations.Animation, frame: Animations.AnimationFrame) =>
            {
                if(frame.index == deathConfig.frameToDisappearEnemy)
                {
                    deathConfig.mainSprite.setVisible(false);
                }
            });
    
            deathConfig.explosionSprite.on(Animations.Events.ANIMATION_COMPLETE, () =>
            {
                deathConfig.explosionSprite.setVisible(false);
                deathConfig.explosionSprite.off(Animations.Events.ANIMATION_UPDATE);
                deathConfig.explosionSprite.off(Animations.Events.ANIMATION_COMPLETE);
            });
        });
    }
}