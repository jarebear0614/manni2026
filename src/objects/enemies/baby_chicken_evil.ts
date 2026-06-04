import { Animations, GameObjects, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { BotGenericLeftInputComponent } from "../../components/input/bot-generic-input-component";
import { HorizontalMovementComponent } from "../../components/input/movement/horizontal-movement-component";
import { ENEMY_BABY_EVIL_CHICKEN_HEALTH, ENEMY_BABY_EVIL_CHICKEN_HORIZONTAL_VELOCITY } from "../../config";
import { HealthComponent } from "../../components/health/health-component";
import { ColliderComponent } from "../../components/collider/collider-component";

export class BabyChickenEvil extends GameObjects.Container
{
    private physicsGameObject: Types.Physics.Arcade.GameObjectWithDynamicBody;

    private mainSprite: GameObjects.Sprite;
    private explosionSprite: GameObjects.Sprite;

    private genericInputLeftComponent: BotGenericLeftInputComponent;
    private horizontalMovementComponent: HorizontalMovementComponent;

    private healthComponent: HealthComponent;
    private colliderComponent: ColliderComponent;

    constructor(scene: BaseScene, x: number, y: number)
    {
        super(scene, x, y, []);

        this.setSize(16, 16);

        scene.add.existing(this);
        this.physicsGameObject = scene.physics.add.existing(this) as Types.Physics.Arcade.GameObjectWithDynamicBody;

        this.mainSprite = scene.add.sprite(0, 0, 'baby_chicken_evil');
        this.add(this.mainSprite);

        this.explosionSprite = scene.add.sprite(0, 0, 'explosion_enemy', 0).setVisible(false);
        this.explosionSprite.scale = 2/3;
        this.add(this.explosionSprite);

        this.mainSprite.play('baby_chicken_evil');

        this.genericInputLeftComponent = new BotGenericLeftInputComponent();
        this.horizontalMovementComponent = new HorizontalMovementComponent(this as Types.Physics.Arcade.GameObjectWithDynamicBody, this.genericInputLeftComponent, ENEMY_BABY_EVIL_CHICKEN_HORIZONTAL_VELOCITY);

        this.healthComponent = new HealthComponent(ENEMY_BABY_EVIL_CHICKEN_HEALTH);
        this.colliderComponent = new ColliderComponent(this.healthComponent);

        this.explosionSprite.on(Animations.Events.ANIMATION_UPDATE, (animation: Animations.Animation, frame: Animations.AnimationFrame) =>
        {
            if(frame.index == 2)
            {
                this.mainSprite.setVisible(false);
            }
        });

        this.explosionSprite.on(Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.explosionSprite.setVisible(false);
        });

        scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(GameObjects.Events.DESTROY, () => { scene.events.off(Scenes.Events.UPDATE, this.update, this, false); }, this);
    }

    update(timestamp: any, deltaTime: number)
    {
        if(!this.active)
        {
            return false;
        }
        
        if(this.healthComponent.isDead())
        {
            this.hide();
            this.setVisible(true);
            this.explosionSprite.setVisible(true);
            this.explosionSprite.play('explosion_enemy');
            return;
        }

        this.horizontalMovementComponent.update();
    }

    public getColliderComponent() 
    {
        return this.colliderComponent;
    }

    public getHealthComponent()
    {
        return this.healthComponent;
    }

    private hide()
    {
        this.setActive(false);
        this.setVisible(false);
    }
}