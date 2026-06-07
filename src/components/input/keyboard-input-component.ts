import { GameObjects, Types } from "phaser";
import { InputComponent } from "./input-component";
import { BaseScene } from "../../scenes/BaseScene";

export class KeyboardInputComponent extends InputComponent
{
    private cursorKeys: Types.Input.Keyboard.CursorKeys;
    private inputLocked: boolean = false;

    private upOnScreen: GameObjects.Image;
    private downOnScreen: GameObjects.Image;
    private shootOnScreen: GameObjects.Image;

    private onScreenUp: boolean = false;
    private onScreenDown: boolean = false;
    private onScreenShoot: boolean = false;

    constructor(scene: BaseScene, upOnScreen: GameObjects.Image, downOnScreen: GameObjects.Image, shootOnScreen: GameObjects.Image)
    {
        super();

        this.upOnScreen = upOnScreen;
        this.downOnScreen = downOnScreen;
        this.shootOnScreen = shootOnScreen;

        this.upOnScreen.on('pointerup', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            console.log('up is up');

            this.onScreenUp = false;
        });

        this.upOnScreen.on('pointerdown', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            console.log('up is down');

            this.onScreenUp = true;
        });

        this.downOnScreen.on('pointerup', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            this.onScreenDown = false;
        });

        this.downOnScreen.on('pointerdown', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            this.onScreenDown = true;
        });

        this.shootOnScreen.on('pointerup', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            this.onScreenShoot = false;
        });

        this.shootOnScreen.on('pointerdown', () => 
        {
            if(this.inputLocked)
            {
                return;
            }
            this.onScreenShoot = true;
        });
        
        this.cursorKeys = scene.input.keyboard?.createCursorKeys()!;
        this.inputLocked = false;
    }

    public lock()
    {
        this.inputLocked = true;

        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
        this.onScreenUp = false;
        this.onScreenDown = false;
        this.onScreenShoot = false;
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
        
        this.up = this.onScreenUp || this.cursorKeys.up.isDown;
        this.down = this.onScreenDown || this.cursorKeys.down.isDown;
        this.left = this.cursorKeys.left.isDown;
        this.right = this.cursorKeys.right.isDown;
        this.shoot = this.onScreenShoot || this.cursorKeys.space.isDown;
    }
}