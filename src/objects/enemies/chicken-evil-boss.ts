import { GameObjects, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { ENEMY_EVIL_CHICKEN_BOSS_GROUP_SPAWN_INTERVAL, ENEMY_EVIL_CHICKEN_BOSS_GROUP_SPAWN_START, ENEMY_EVIL_CHICKEN_BOSS_HEALTH, ENEMY_EVIL_CHICKEN_BOSS_VERTICAL_VELOCITY, ENEMY_EVIL_CHICKEN_BOSS_VERTICAL_WAVE_FACTOR } from "../../config";
import { HealthComponent } from "../../components/health/health-component";
import { ColliderComponent } from "../../components/collider/collider-component";
import { Align } from "../../util/align";
import { CUSTOM_EVENTS, EventBusComponent } from "../../components/events/event-bus-component";
import { EnemyDeathConfig } from "../enemy-death-config";
import { BabyChickenEvil } from "./baby-chicken-evil";
import { EnemySpawnerComponent } from "../../components/spawners/enemy-spawner-component";
import { VerticalWavePatternInputComponent } from "../../components/input/vertical-wave-pattern-input-component";
import { VerticalMovementComponent } from "../../components/input/movement/vertical-movement-component";

export class ChickenEvilBoss extends GameObjects.Container
{
    private physicsGameObject: Types.Physics.Arcade.GameObjectWithDynamicBody;

    private mainSprite: GameObjects.Sprite;
    private explosionSprite: GameObjects.Sprite;

    private healthComponent: HealthComponent;
    private colliderComponent: ColliderComponent;

    private verticalWavePatternInputComponent: VerticalWavePatternInputComponent;
    private verticalMovementComponent: VerticalMovementComponent;

    private eventBusComponent: EventBusComponent;

    private babyEvilChickenSpawner: EnemySpawnerComponent;

    private initialized: boolean = false;
    private isMovementRunning: boolean = false;
    private tinting: boolean = false;

    private explosions = 50;
    private explosionsSpawned = 0;
    private timeBetweenExplosions = 50;
    private currentExplosionTime = this.timeBetweenExplosions;
    private dying: boolean = false;
    private explosionGroup: GameObjects.Group;
    
    private numberOfSounds = 5;
    private soundsSpawned = 0;
    private timeBetweenSounds = 440;
    private currentExplosionSoundTime = 0;

    constructor(scene: BaseScene, x: number, y: number)
    {
        super(scene, x, y, []);

        this.name = "ChickenEvilBoss";
        this.setSize(95, 89);

        scene.add.existing(this);
        this.physicsGameObject = scene.physics.add.existing(this) as Types.Physics.Arcade.GameObjectWithDynamicBody;

        this.mainSprite = scene.add.sprite(0, 0, 'chicken_boss');
        this.mainSprite.setFlipX(true);
        this.add(this.mainSprite);

        this.explosionSprite = scene.add.sprite(0, 0, 'explosion_enemy', 0).setVisible(false);
        this.add(this.explosionSprite);

        this.explosionGroup = this.scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`
        });

        Align.scaleContainerToGameWidth(this, 0.30, scene);

        this.mainSprite.play('chicken_boss');

        scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.once(GameObjects.Events.DESTROY, () => { scene.events.off(Scenes.Events.UPDATE, this.update, this, false); }, this);
    }

    public init(eventBusComponent: EventBusComponent)
    {
        this.eventBusComponent = eventBusComponent;

        if(this.healthComponent)
        {
            this.healthComponent.removeAllListeners();
        }

        this.healthComponent = new HealthComponent(ENEMY_EVIL_CHICKEN_BOSS_HEALTH);
        this.healthComponent.on(HealthComponent.Events.HIT, () =>
        {
            if(this.tinting)
            {
                return;
            }

            this.tinting = true;
            this.mainSprite.setTint(0xFF00000);
            this.scene.time.delayedCall(50, () => 
            {
                this.mainSprite.setTint(0xFFFFFF);
                this.tinting = false;
            });
        });

        this.colliderComponent = new ColliderComponent(this.healthComponent);

        this.verticalWavePatternInputComponent = new VerticalWavePatternInputComponent(ENEMY_EVIL_CHICKEN_BOSS_VERTICAL_WAVE_FACTOR);
        this.verticalMovementComponent = new VerticalMovementComponent(this as Types.Physics.Arcade.GameObjectWithDynamicBody, this.verticalWavePatternInputComponent, ENEMY_EVIL_CHICKEN_BOSS_VERTICAL_VELOCITY)

        this.eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_INIT, this);

        this.babyEvilChickenSpawner = new EnemySpawnerComponent(
            this.scene as BaseScene, 
            BabyChickenEvil, 
            {
                interval: ENEMY_EVIL_CHICKEN_BOSS_GROUP_SPAWN_INTERVAL,
                initialSpawnTime: ENEMY_EVIL_CHICKEN_BOSS_GROUP_SPAWN_START,
                maxCount: -1
            }, eventBusComponent);

        eventBusComponent.emit(CUSTOM_EVENTS.GROUP_INIT, this.babyEvilChickenSpawner.getGroup());

        this.initialized = true;
    }

    update(timestamp: any, deltaTime: number)
    {
        if(!this.active || !this.initialized)
        {
            return;
        }

        if(this.dying)
        {
            if(this.soundsSpawned < this.numberOfSounds)
            {
                this.currentExplosionSoundTime -= deltaTime;
                if(this.currentExplosionSoundTime <= 0)
                {
                    this.soundsSpawned++;

                    this.currentExplosionSoundTime = this.timeBetweenSounds;
                    this.scene.sound.play('small-explosion', { volume: 0.1, loop: false });
                }
            }

                    
            if(this.explosionsSpawned < this.explosions)
            {
                this.currentExplosionTime -= deltaTime;
                if(this.currentExplosionTime <= 0)
                {
                    this.explosionsSpawned++;
                    this.currentExplosionTime = this.timeBetweenExplosions;

                    let x = Phaser.Math.RND.between(this.x - this.displayWidth / 2, this.x + this.displayWidth / 2);
                    let y = Phaser.Math.RND.between(this.y - this.displayHeight / 2, this.y + this.displayWidth / 2);
                    let sprite = this.explosionGroup.get(x, y);
                    
                    sprite.play('explosion_enemy');
                }
            }
            else
            {
                this.eventBusComponent.emit(CUSTOM_EVENTS.ENEMY_DESTROYED, this);
                this.hide();
            }

            return;
        }
        
        if(this.healthComponent.isDead())
        {
            this.setVisible(true);

            this.dying = true;

            this.scene.tweens.add({
                    targets: this.mainSprite,
                    alpha: { from: 1.0, to: 0 },
                    ease: 'Linear',
                    duration: this.explosions * this.timeBetweenExplosions,
                    repeat: 0,
                    yoyo: false
            });

            this.scene.tweens.add({
                    targets: this.mainSprite,
                    y: { from: this.y, to: this.y + 300 },
                    ease: 'Linear',
                    duration: this.explosions * this.timeBetweenExplosions,
                    repeat: 0,
                    yoyo: false
            });
            return;
        }
        
        this.babyEvilChickenSpawner.update(timestamp, deltaTime);

        if(this.isMovementRunning)
        {
            this.verticalWavePatternInputComponent.update(timestamp, deltaTime);
            this.verticalMovementComponent.update();
        }
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
        this.explosionSprite.setVisible(false);
        this.mainSprite.setVisible(true);
    }

    public startVerticalMovement()
    {
        this.isMovementRunning = true;
    }
    
    public getEnemyDeathConfig(): EnemyDeathConfig
    {
        return {
            mainAssetKey: 'chicken_evil',
            mainSprite: this.mainSprite,
            deathAnimationAssetKey: 'explosion_enemy',
            currentFrame: this.mainSprite.anims.currentFrame?.index ?? 0,
            explosionSprite: this.explosionSprite,
            frameToDisappearEnemy: 2
        };
    }
}