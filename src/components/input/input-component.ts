export class InputComponent
{
    protected up: boolean;
    protected down: boolean;
    protected left: boolean;
    protected right: boolean;
    protected shoot: boolean;

    constructor()
    {
        this.reset();
    }

    public reset()
    {
        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.shoot = false;
    }
    
    public get upIsDown(): boolean {
        return this.up;
    }

    public get downIsDown(): boolean {
        return this.down;
    }

    public get leftIsDown(): boolean {
        return this.left;
    }

    public get rightIsDown(): boolean {
        return this.right;
    }

    public get shootIsDown(): boolean {
        return this.shoot;
    }
}