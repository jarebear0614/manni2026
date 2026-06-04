import { Types } from "phaser";
import { InputComponent } from "../input-component";
import { COMPONENT_MOVEMENT_VERTICAL_DRAG, COMPONENT_MOVEMENT_VERTICAL_MAX_VELOCITY } from "../../../config";

export class VerticalMovementComponent
{
    private gameObject: Types.Physics.Arcade.GameObjectWithDynamicBody;
    private inputComponent: InputComponent;
    private velocity: number;

    constructor(gameObject: Types.Physics.Arcade.GameObjectWithDynamicBody, inputComponent: InputComponent, velocity: number)
    {
        this.gameObject = gameObject;
        this.inputComponent = inputComponent;
        this.velocity = velocity;

        this.gameObject.body.setDamping(true);
        this.gameObject.body.setDrag(COMPONENT_MOVEMENT_VERTICAL_DRAG);
        this.gameObject.body.setMaxVelocity(COMPONENT_MOVEMENT_VERTICAL_MAX_VELOCITY);
    }

    update()
    {
        if(this.inputComponent.upIsDown)
        {
            this.gameObject.body.velocity.y -= this.velocity;
        }
        else if(this.inputComponent.downIsDown)
        {
            this.gameObject.body.velocity.y += this.velocity;
        }
        else
        {
            this.gameObject.body.setAngularAcceleration(0);
        }
    }

    public reset()
    {
        this.gameObject.body.velocity.y = 0;
        this.gameObject.body.setAngularAcceleration(0);
    }
}