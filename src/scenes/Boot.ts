import { BaseScene } from './BaseScene';
import { Scale } from 'phaser'

export class Boot extends BaseScene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        //  The Boot Scene is typically used to load in any assets you require for your Preloader, such as a game logo or background.
        //  The smaller the file size of the assets, the better, as the Boot Scene itself has no preloader.

        this.load.image('background', 'assets/bg.png');
    }

    create ()
    {     
        if(!this.checkOrientation(this.scale.orientation))
        {
            this.scale.on('orientationchange', (orientation: Scale.Orientation) =>
            {
                console.log('here');
                this.checkOrientation(orientation);
            });
        }
    }

    private checkOrientation(orientation: Scale.Orientation): boolean {
        console.log(orientation);
        if (orientation === Scale.Orientation.PORTRAIT) {
            // Show your "Please rotate your device" DOM element or UI graphic here
            this.add.text(0, 0, 'Rotate your phone to landscape!', {fontFamily: 'Arial', fontSize: 36, color: '#ffffff'})
                .setStroke("#000000", 4)
                .setScrollFactor(0)
                .setAlpha(0.0)
                .setWordWrapWidth(this.getGameWidth() * 0.7)
                .setAlign('center');

            return false;
            
        } else if (orientation === Scale.Orientation.LANDSCAPE) {
            // Hide the warning and start/resume the game
            this.scene.start('Preloader');

            return true;
        }

        return false;
    }
}
