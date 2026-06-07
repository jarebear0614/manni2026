import { Events } from "phaser";

export class HealthComponent extends Events.EventEmitter
{
    public static Events = Object.freeze({
        HIT: 'HIT'
    });

    protected max: number;
    protected current: number;
    protected dead: boolean;

    constructor(life:number)
    {
        super();

        this.max = life;
        this.current = life;
        this.dead = false;
    }

    public getMax() { return this.max; }
    public getCurrent() { return this.current; }
    public isDead() { return this.dead; }

    public reset()
    {
        this.current = this.max;
        this.dead = false;
    }

    public hit()
    {
        if(this.dead)
        {
            return;
        }

        this.current--;
        if(this.current <= 0)
        {
            this.dead = true;
        }
        else
        {
            this.emit(HealthComponent.Events.HIT);
        }
    }

    public die()
    {
        this.current = 0;
        this.dead = true;
    }
}