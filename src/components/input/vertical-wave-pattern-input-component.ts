import { InputComponent } from "./input-component";

export class VerticalWavePatternInputComponent extends InputComponent
{
    private waveFactor: number;
    constructor(waveFactor: number = 0.02)
    {
        super();

        this.waveFactor = waveFactor;
    }

    update(timestamp: number, deltaTime: number)
    {
        const wave = Math.sin(timestamp * this.waveFactor);
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