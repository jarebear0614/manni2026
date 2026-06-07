import { InputComponent } from "./input-component";

export class VerticalWavePatternInputComponent extends InputComponent
{
    private waveFactor: number;
    private time: number = Math.PI;

    constructor(waveFactor: number = 0.02)
    {
        super();

        this.waveFactor = waveFactor;
        this.time = (Math.PI / 2) / waveFactor;
    }

    update(timestamp: number, deltaTime: number)
    {
        this.time += deltaTime;

        const wave = Math.sin(this.time * this.waveFactor);
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
    }
}