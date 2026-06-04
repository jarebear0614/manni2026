import { Scene } from 'phaser';
import { AnimationOptions } from '../types/animation';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
    }

    preload ()
    {
        this.load.pack('asset_pack', 'assets/data/assets.json');
        // this.load.spritesheet({
        //     frameConfig: {frameWidth: 16, frameHeight: 1}
        // })
    }

    create ()
    {
        this.createAnimations();
        this.scene.start('Game');
    }

    private createAnimations()
    {
        const data = this.cache.json.get('animations_json');
        data.forEach((animation: AnimationOptions) =>
        {
            const frames = animation.frames 
                ? this.anims.generateFrameNumbers(animation.assetKey, { frames: animation.frames })
                : this.anims.generateFrameNumbers(animation.assetKey);

            this.anims.create({
                key: animation.key,
                frames: frames,
                frameRate: animation.frameRate,
                repeat: animation.repeat
            });
        });
    }
}
