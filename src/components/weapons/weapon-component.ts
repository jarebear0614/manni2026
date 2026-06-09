import { GameObjects, Physics, Types } from "phaser";
import { InputComponent } from "../input/input-component";
import { BulletConfig } from "../../objects/bullet-config";
import { Align } from "../../util/align";
import { BaseScene } from "../../scenes/BaseScene";

export class WeaponComponent
{
    private gameObject: GameObjects.Components.Transform & GameObjects.GameObject;
    private inputComponent: InputComponent;
    private bulletGroup: Physics.Arcade.Group;
    private bulletConfig: BulletConfig;

    private fireBulletInterval: number;

    constructor(gameObject: GameObjects.Components.Transform & GameObjects.GameObject, inputComponent: InputComponent, bulletConfig: BulletConfig)
    {
        this.gameObject = gameObject;
        this.inputComponent = inputComponent;
        this.bulletConfig = bulletConfig;
        this.fireBulletInterval = 0;

        this.bulletGroup = this.gameObject.scene.physics.add.group({
            name: `bullets-${Phaser.Math.RND.uuid()}`,
            enable: false
        });

        this.bulletGroup.createMultiple({
            key: 'bullet',
            frame: 1,
            quantity: this.bulletConfig.max,
            active: false,
            visible: false
        });

        this.gameObject.scene.physics.world.on(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this);
        this.gameObject.once(GameObjects.Events.DESTROY, () => { this.gameObject.scene.physics.world.off(Physics.Arcade.Events.WORLD_STEP, this.worldStep, this, false); }, this);
    }

    update(deltaTime: number)
    {
        this.fireBulletInterval -= deltaTime;

        if(this.fireBulletInterval > 0)
        {
            return;
        }

        if (this.inputComponent.shootIsDown)
        {
            const bullet: Types.Physics.Arcade.SpriteWithDynamicBody | null = this.bulletGroup.getFirstDead();

            if(bullet === undefined || bullet === null)
            {
                return;
            }

            const x = this.gameObject.x + this.bulletConfig.xOffset;
            const y = this.gameObject.y + this.bulletConfig.yOffset;

            this.gameObject.scene.sound.play('shoot', { volume: 0.7 });

            bullet.enableBody(true, x, y, true, true);
            bullet.play('bullet');
            bullet.body.velocity.x = this.bulletConfig.speed;
            bullet.setState(this.bulletConfig.lifespan);
            Align.scaleToGameWidth(bullet, this.bulletConfig.scale, this.gameObject.scene as BaseScene);
            bullet.setFlipX(this.bulletConfig.flipX);

            this.fireBulletInterval = this.bulletConfig.interval;
        }
    }

    public getBulletGroup()
    {
        return this.bulletGroup;
    }

    private worldStep(deltaTime: number)
    {
        this.bulletGroup.getChildren().forEach( (bullet: GameObjects.GameObject) =>
        {
            if(!bullet.active)
            {
                return;
            }

            (<number>bullet.state) -= deltaTime;
            if((<number>bullet.state) <= 0)
            {
                const bulletBody = bullet as Types.Physics.Arcade.SpriteWithDynamicBody;
                bulletBody.disableBody(true, true);
            }
        });
    }

    destroyBullet(bullet: Types.Physics.Arcade.SpriteWithDynamicBody)
    {
        bullet.setState(0);
    }
}