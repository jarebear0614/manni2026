import { Animations, GameObjects, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { BotGenericLeftInputComponent } from "../../components/input/bot-generic-input-component";
import { HorizontalMovementComponent } from "../../components/input/movement/horizontal-movement-component";
import { DEFAULT_SPRITE_SCALE, ENEMY_BABY_EVIL_CHICKEN_HEALTH, ENEMY_BABY_EVIL_CHICKEN_HORIZONTAL_VELOCITY } from "../../config";
import { HealthComponent } from "../../components/health/health-component";
import { ColliderComponent } from "../../components/collider/collider-component";
import { Align } from "../../util/align";
import { CUSTOM_EVENTS, EventBusComponent } from "../../components/events/event-bus-component";
import { EnemyDeathConfig } from "../enemy-death-config";

export class BabyChickenEvil extends GameObjects.Container
{
    private physicsGameObject: Types.Physics.Arcade.GameObjectWithDynamicBody;

    private mainSprite: GameObjects.Sprite;
    private explosionSprite: GameObjects.Sprite;

    private genericInputLeftComponent: BotGenericLeftInputComponent;
    private horizontalMovementComponent: HorizontalMovementComponent;

    private healthComponent: HealthComponent;
    private colliderComponent: ColliderComponent;

    private eventBusComponent: EventBusComponent;

    private initialized: boolean = false;

    constructor(scene: BaseScene, x: number, y: number)
    {
        super(scene, x, y, []);

        this.name = this.constructor.name;

        this.setSize(16, 16);

        scene.add.existing(this);
        this.physicsGameObject = scene.physics.add.existing(this) as Types.Physics.Arcade.GameObjectWithDynamicBody;

        this.mainSprite = scene.add.sprite(0, 0, 'baby_chicken_evil');
        this.add(this.mainSprite);

        this.explosionSprite = scene.add.sprite(0, 0, 'explosion_enemy', 0).setVisible(false);
        this.explosionSprite.scale = 2/3;
        this.add(this.explosionSprite);

        Align.scaleContainerToGameWidth(this, DEFAULT_SPRITE_SCALE, scene);

        this.mainSprite.play('baby_chicken_evil');

        scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(GameObjects.Events.DESTROY, () => { scene.events.off(Scenes.Events.UPDATE, this.update, this, false); }, this);
    }

    public init(eventBusComponent: EventBusComponent)
    {
        this.eventBusComponent = eventBusComponent;

        this.genericInputLeftComponent = new BotGenericLeftInputComponent();
        this.horizontalMovementComponent = new HorizontalMovementComponent(this as Types.Physics.Arcade.GameObjectWithDynamicBody, this.genericInputLeftComponent, ENEMY_BABY_EVIL_CHICKEN_HORIZONTAL_VELOCITY);

        this.healthComponent = new HealthComponent(ENEMY_BABY_EVIL_CHICKEN_HEALTH);
        this.colliderComponent = new ColliderComponent(this.healthComponent);

        this.eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);

        this.initialized = true;
    }

    update(timestamp: any, deltaTime: number)
    {
        if(!this.active || !this.initialized)
        {
            return;
        }
        
        if(this.healthComponent.isDead())
        {
            this.hide();
            this.setVisible(true);
            this.eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
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

    public reset()
    {
        this.setActive(true);
        this.setVisible(true);
        this.healthComponent.reset();
        this.horizontalMovementComponent.reset();
        this.explosionSprite.setVisible(false);
        this.mainSprite.setVisible(true);
    }

    public getEnemyDeathConfig(): EnemyDeathConfig
    {
        return {
            mainAssetKey: 'baby_chicken_evil',
            mainSprite: this.mainSprite,
            deathAnimationAssetKey: 'explosion_enemy',
            currentFrame: this.mainSprite.anims.currentFrame?.index ?? 0,
            explosionSprite: this.explosionSprite,
            frameToDisappearEnemy: 2
        };
    }
}