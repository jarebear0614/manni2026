import { BaseScene } from './BaseScene';

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
        if(this.scale.fullscreen.available)
        {
            this.scale.startFullscreen();
            if(screen.orientation && screen.orientation.lock)
            {
                screen.orientation.lock('landscape').catch(err => {
                    this.add.text(0, 0, 'Orientation lock failed: ' + err.toString(), {fontFamily: 'Arial', fontSize: 36, color: '#ffffff'})
                        .setStroke("#000000", 4)
                        .setScrollFactor(0)
                        .setAlpha(0.0)
                        .setWordWrapWidth(this.getGameWidth() * 0.7)
                        .setAlign('center');
                });
            }
        }
        this.scene.start('Preloader');
    }
}
