import { InputComponent } from "./input-component";

export class BotGenericLeftInputComponent extends InputComponent
{
    constructor()
    {
        super();

        this.left = true;
        this.shoot = true;
    }
}