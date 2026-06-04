import { HealthComponent } from "../health/health-component";

export class ColliderComponent 
{
    healthComponent: HealthComponent;

    constructor(healthComponent: HealthComponent)
    {
        this.healthComponent = healthComponent;
    }

    collideWithEnemyChicken()
    {
        if(this.healthComponent.isDead())
        {
            return;
        }

        this.healthComponent.die();
    }

    collideWithEnemyEgg()
    {
        if(this.healthComponent.isDead())
        {
            return;
        }

        this.healthComponent.hit();
    }
}