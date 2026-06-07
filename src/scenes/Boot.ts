import { TextUtility } from '../util/text';
import { BaseScene } from './BaseScene';
import { GameObjects, Scale } from 'phaser'

export class Boot extends BaseScene
{
    constructor ()
    {
        super('Boot');
    }

    preload ()
    {
        this.load.json('animations_json', 'assets/data/animations.json');
    }

    create ()
    {
        super.create();

        this.scale.setParentSize(window.innerWidth, window.innerHeight);

        if(!this.checkOrientation(this.scale.orientation))
        {
            this.scale.on('orientationchange', (orientation: Scale.Orientation) =>
            {
                this.checkOrientation(orientation);
            });
        }
    }

    private checkOrientation(orientation: Scale.Orientation): boolean 
    {
        if (orientation !== Scale.Orientation.LANDSCAPE) {
            TextUtility.addAndCenterTextWithOutline(this, 'Please rotate your phone to landscape.', {
                fontSize: 72,
                fontFamily: 'Arial',
                textColor: '#ffffff',
                outlineColor: '#000000',
                outlineSize: 12,
                wordWrapWidth: this.getGameWidth() * 0.70,
                useAdvancedWrap: false,
                textAlign: 'center'
            });

            return false;
            
        } else if (orientation === Scale.Orientation.LANDSCAPE) {
            this.scene.start('Preloader');

            return true;
        }

        return false;
    }
}
