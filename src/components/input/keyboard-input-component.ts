import { Types } from "phaser";
import { InputComponent } from "./input-component";
import { BaseScene } from "../../scenes/BaseScene";

export class KeyboardInputComponent extends InputComponent
{
    private cursorKeys: Types.Input.Keyboard.CursorKeys;
    private inputLocked: boolean = false;

    constructor(scene: BaseScene)
    {
        super();
        
        this.cursorKeys = scene.input.keyboard?.createCursorKeys()!;
        this.inputLocked = false;
    }

    public lock()
    {
        this.inputLocked = true;
    }

    public unlock() 
    {
        this.inputLocked = false;
    }

    update()
    {
        if(this.inputLocked)
        {
            this.reset();
            return;
        }
        
        this.up = this.cursorKeys.up.isDown;
        this.down = this.cursorKeys.down.isDown;
        this.left = this.cursorKeys.left.isDown;
        this.right = this.cursorKeys.right.isDown;
        this.shoot = this.cursorKeys.space.isDown;
    }
}