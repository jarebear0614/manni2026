import { Events, Scenes } from "phaser";
import { BaseScene } from "../../scenes/BaseScene";
import { EnemySpawnerComponent } from "./enemy-spawner-component";
import { CUSTOM_EVENTS, EventBusComponent } from "../events/event-bus-component";

export class GroupEnemyOrchestrator extends Events.EventEmitter
{
    public static Events = Object.freeze({
        WAVE_CHANGE: 'WAVE_CHANGE'
    });

    private scene: BaseScene;
    private index: number = 0;
    private enemySpawners: (EnemySpawnerComponent[])[];
    private eventBusComponent: EventBusComponent;

    private currentDestroyed: number = 0;

    constructor(scene: BaseScene, eventBusComponent: EventBusComponent, spawners: (EnemySpawnerComponent[])[])
    {
        super();

        this.scene = scene;
        this.enemySpawners = [];
        this.eventBusComponent = eventBusComponent;
        this.enemySpawners = spawners;

        this.scene.events.on(Scenes.Events.UPDATE, this.update, this);
        this.eventBusComponent.on(CUSTOM_EVENTS.ENEMY_DESTROYED, (enemy: any) =>
        {
            this.currentDestroyed++;
            if(this.currentDestroyed == this.getTotalEnemies())
            {
                const previous = this.enemySpawners[this.index];
                this.index++;
                const next = this.index >= this.enemySpawners.length ? null : this.enemySpawners[this.index];

                this.currentDestroyed = 0;

                this.emit(GroupEnemyOrchestrator.Events.WAVE_CHANGE, next, previous);
            }
        });
    }

    start()
    {
        this.emit(GroupEnemyOrchestrator.Events.WAVE_CHANGE, this.enemySpawners[0], null);
    }

    getTotalEnemies()
    {
        if(this.enemySpawners.length == 0 || this.index >= this.enemySpawners.length)
        {
            return 0;
        }

        const spawners = this.enemySpawners[this.index];

        let count: number = 0;

        spawners.forEach((spawner) =>
        {
            count += spawner.getMaxCount();
        });

        return count;
    }

    update(timestamp: number, deltaTime: number)
    {
        if(this.enemySpawners.length == 0 || this.index >= this.enemySpawners.length)
        {
            return;
        }

        const spawners = this.enemySpawners[this.index];
        spawners.forEach((spawner) =>
        {
            spawner.update(timestamp, deltaTime);
        });
    }
}