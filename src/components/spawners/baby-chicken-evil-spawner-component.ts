import { GameObjects, Physics, Scenes, Types } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { CUSTOM_EVENTS, EventBusComponent } from "../events/event-bus-component";

export class BabyChickenEvilSpawnerComponent
{
    private scene: BaseScene;
    private group: GameObjects.Group;
    
    constructor(scene: BaseScene, enemyClass: Function | null, eventBusComponent: EventBusComponent)
    {
        this.scene = scene;
        this.group = this.scene.add.group({
            name: `${this.constructor.name}-baby-evil-${Phaser.Math.RND.uuid()}`,
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

        eventBusComponent.emit(CUSTOM_EVENTS.GROUP_INIT, this.group);

        this.scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.scene.events.once(
            Scenes.Events.DESTROY, 
            () => 
            { 
                this.scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this, false);
            }, 
            this);
    }

    update(timestamp: number, deltaTime: number)
    {
    }

    spawn(x: number, y: number)
    {
        const enemy1: any = this.group.get(x, y - 24);
        const enemy2: any = this.group.get(x, y + 24);

        if(enemy1.reset && typeof(enemy1.reset) === 'function')
        {
            enemy1.reset();
        }

        if(enemy2.reset && typeof(enemy2.reset) === 'function')
        {
            enemy2.reset();
        }
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

            if(transform.x <= -20)
            {
                (<any>enemy).healthComponent.die();
            }
        });
    }
}