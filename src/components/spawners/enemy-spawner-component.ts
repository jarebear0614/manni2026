import { GameObjects, Physics, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { SpawnConfig } from "../../objects/spawn-config";
import { EventBusComponent } from "../events/event-bus-component";

export class EnemySpawnerComponent
{
    scene: BaseScene;
    spawnInterval: number;
    spawnAt: number;
    group: GameObjects.Group;
    
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

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.scene.events.once(
            Scenes.Events.DESTROY, 
            () => 
            { 
                scene.events.off(Scenes.Events.UPDATE, this.update, this, false); 
                this.scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this, false);
            }, 
            this);
    }

    public getGroup()
    {
        return this.group;
    }

    update(timestamp: number, deltaTime: number)
    {
        this.spawnAt -= deltaTime;
        if(this.spawnAt > 0)
        {
            return;
        }

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
                transform.setActive(false);
                transform.setVisible(false);
            }
        });
    }
}