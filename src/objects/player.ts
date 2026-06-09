import { Animations, GameObjects, Scenes, Types } from "phaser";
import { BaseScene } from "../scenes/BaseScene";
import { KeyboardInputComponent } from "../components/input/keyboard-input-component";
import { DEFAULT_SPRITE_SCALE, PLAYER_BULLET_INTERVAL, PLAYER_BULLET_LIFESPAN, PLAYER_BULLET_MAX, PLAYER_BULLET_SCALE, PLAYER_BULLET_SPEED, PLAYER_HEALTH, PLAYER_MOVEMENT_HORIZONTAL_VELOCITY, PLAYER_MOVEMENT_VERTICAL_VELOCITY } from "../config";
import { VerticalMovementComponent } from "../components/input/movement/vertical-movement-component";
import { WeaponComponent } from "../components/weapons/weapon-component";
import { HealthComponent } from "../components/health/health-component";
import { ColliderComponent } from "../components/collider/collider-component";
import { Align } from "../util/align";
import { CUSTOM_EVENTS, EventBusComponent } from "../components/events/event-bus-component";
import { OnScreenControlsConfig } from "./on-screen-controls-config";

export class Player extends GameObjects.Container
{
    private verticalMovementComponent: VerticalMovementComponent;

    private physicsGameObject: Types.Physics.Arcade.GameObjectWithDynamicBody;

    private mainSprite: GameObjects.Sprite;
    private explosionSprite: GameObjects.Sprite;
    private keyboardInput: KeyboardInputComponent;

    private weaponComponent: WeaponComponent;

    private healthComponent: HealthComponent;
    private colliderComponent: ColliderComponent;

    private eventBusComponent: EventBusComponent;

    constructor(scene: BaseScene, eventBusComponent: EventBusComponent, onScreenControlsConfig?: OnScreenControlsConfig)
    {
        super(scene, scene.getGameWidth() * 0.25, scene.getGameHeight() / 2 - 8, []);

        this.setSize(16, 16);

        this.eventBusComponent = eventBusComponent;

        scene.add.existing(this);
        this.physicsGameObject = scene.physics.add.existing(this) as Types.Physics.Arcade.GameObjectWithDynamicBody;
        this.physicsGameObject.body.setCollideWorldBounds(true);
        this.setDepth(2);

        this.mainSprite = scene.add.sprite(0, 0, 'player').setFlipX(true);
        this.add(this.mainSprite);

        this.explosionSprite = scene.add.sprite(0, 0, 'explosion', 0).setVisible(false);
        this.explosionSprite.scale = 1/4;
        this.add(this.explosionSprite);

        Align.scaleContainerToGameWidth(this, DEFAULT_SPRITE_SCALE, scene);

        this.keyboardInput = new KeyboardInputComponent(scene, onScreenControlsConfig);

        this.verticalMovementComponent = new VerticalMovementComponent(this as Types.Physics.Arcade.GameObjectWithDynamicBody, this.keyboardInput, PLAYER_MOVEMENT_VERTICAL_VELOCITY);

        this.weaponComponent = new WeaponComponent(
            this, 
            this.keyboardInput, 
            {
                speed: PLAYER_BULLET_SPEED,
                lifespan: PLAYER_BULLET_LIFESPAN,
                max: PLAYER_BULLET_MAX, 
                xOffset: 20, 
                yOffset: 0, 
                scale: PLAYER_BULLET_SCALE,
                interval: PLAYER_BULLET_INTERVAL,
                flipX: false
            });

        this.healthComponent = new HealthComponent(PLAYER_HEALTH);
        this.colliderComponent = new ColliderComponent(this.healthComponent);

        this.explosionSprite.on(Animations.Events.ANIMATION_UPDATE, (animation: Animations.Animation, frame: Animations.AnimationFrame) =>
        {
            if(frame.index == 4)
            {
                this.mainSprite.setVisible(false);
            }
        });

        this.explosionSprite.on(Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.explosionSprite.setVisible(false);
            this.spawn();
        });

        scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(GameObjects.Events.DESTROY, () => { scene.events.off(Scenes.Events.UPDATE, this.update, this, false); }, this);

        this.spawn();
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
            this.explosionSprite.play('explosion_player');
            this.scene.sound.play('large-explosion', { loop: false, volume: 0.5 });

            this.eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_DEAD, this);
            return;
        }

        this.keyboardInput.update();
        this.verticalMovementComponent.update();
        this.weaponComponent.update(deltaTime);        
    }

    private spawn()
    {
        this.setVisible(true);
        this.explosionSprite.setVisible(false);
        this.mainSprite.setVisible(true);

        this.healthComponent.reset();

        this.mainSprite.play('player_hatch');
        this.pause();
        this.mainSprite.once(Animations.Events.ANIMATION_COMPLETE, () =>
        {
            this.unpause();
            this.mainSprite.play('player_normal');
        });

        this.eventBusComponent.emit(CUSTOM_EVENTS.PLAYER_RESPAWNED, this);
    }

    public getWeaponComponent() 
    {
        return this.weaponComponent;
    }

    public getWeaponGameObjectGroup() 
    {
        return this.weaponComponent.getBulletGroup();
    }

    public getColliderComponent() 
    {
        return this.colliderComponent;
    }

    public getHealthComponent()
    {
        return this.healthComponent;
    }

    public pause()
    {
        this.setActive(false);
        this.keyboardInput.lock();
    }

    public unpause()
    {
        this.setActive(true);
        this.keyboardInput.unlock();
    }

    private hide()
    {
        this.setActive(false);
        this.setVisible(false);
        
        this.keyboardInput.lock();
    }
}