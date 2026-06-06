import { InputComponent } from "./input-component";

export class VerticalWavePatternInputComponent extends InputComponent
{
    private waveFactor: number;
    private time: number = 0;
    private first: boolean = true;
    constructor(waveFactor: number = 0.02)
    {
        super();

        this.waveFactor = waveFactor;
    }

    update(timestamp: number, deltaTime: number)
    {
        this.time += deltaTime;

        const wave = Math.sin(this.time * this.waveFactor) + (this.first ? 0.5 : 0);
        if(wave < 0)
        {
            this.down = true;
            this.up = false;
        }
        else if(wave >= 0)
        {
            this.down = false;
            this.up = true;
        }

        if( Math.abs(1 - wave) <= Phaser.Math.EPSILON)
        {
            console.log('first nulled');
            this.first = false;
        }

        console.log(this.down, this.up, wave, Math.abs(1 - wave));
    }
}