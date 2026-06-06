import { GameObjects, Physics, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { SpawnConfig } from "../../objects/spawn-config";
import { EventBusComponent } from "../events/event-bus-component";

export class EnemySpawnerComponent
{
    private scene: BaseScene;
    private spawnInterval: number;
    private spawnAt: number;
    private maxCount: number;
    private group: GameObjects.Group;
    private currentSpawned: number = 0;
    
    constructor(scene: BaseScene, enemyClass: Function | null, spawnConfiguration: SpawnConfig, eventBusComponent: EventBusComponent)
    {
        this.scene = scene;

        this.group = this.scene.add.group({
            name: `${this.constructor.name}-${Phaser.Math.RND.uuid()}`,
            classType: enemyClass,
            runChildUpdate: true,
            createCallback: (enemy: any) =>
            {
                if(enemy.init && typeof(enemy.init) === 'function')
                {
                    enemy.init(eventBusComponent);
                }
            }
        });

        this.spawnInterval = spawnConfiguration.interval;
        this.spawnAt = spawnConfiguration.initialSpawnTime;
        this.maxCount = spawnConfiguration.maxCount;
        
        this.scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.scene.events.once(
            Scenes.Events.DESTROY, 
            () => 
            { 
                this.scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this, false);
            }, 
            this);
    }

    public getGroup()
    {
        return this.group;
    }

    public getMaxCount(): number
    {
        return this.maxCount;
    }

    update(timestamp: number, deltaTime: number)
    {
        if(this.maxCount >= 1 && this.currentSpawned >= this.maxCount)
        {
            return;
        }

        this.spawnAt -= deltaTime;
        if(this.spawnAt > 0)
        {
            return;
        }

        this.currentSpawned++;

        const y = Phaser.Math.RND.between(30, this.scene.getGameHeight() - 30);
        const enemy: any = this.group.get(this.scene.getGameWidth() + 30, y);

        if(enemy.reset && typeof(enemy.reset) === 'function')
        {
            enemy.reset();
        }

        this.spawnAt = this.spawnInterval;
    }

    private worldStep(deltaTime: number)
    {
        this.group.getChildren().forEach((enemy) =>
        {
            if(!enemy.active)
            {
                return;
            }

            const transform = (<Types.Physics.Arcade.SpriteWithDynamicBody>(enemy));

            if(transform.x <= -50)
            {
                (<any>enemy).healthComponent.die();
            }
        });
    }
}