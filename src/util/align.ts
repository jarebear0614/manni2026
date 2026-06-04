import { BaseScene } from "../scenes/BaseScene";

export class Align {
    
    public static scaleContainerToGameWidth(container: Phaser.GameObjects.Container, percentage: number, scene: BaseScene)
    {
        let width = scene.getGameWidth();
        container.displayWidth = width * percentage;
        container.scaleY = container.scaleX;

        console.log(container.scaleX, container.scaleY, width, percentage, container.displayWidth, width * percentage);
    }

    public static scaleToGameWidth(object: Phaser.GameObjects.Components.Size & Phaser.GameObjects.Components.Transform, percentage: number, scene: BaseScene) 
    {
        let width = scene.getGameWidth();
        object.displayWidth = width * percentage;
        object.scaleY = object.scaleX;
    }

    public static scaleObjectsToGameWidth(objects: (Phaser.GameObjects.Components.Size & Phaser.GameObjects.Components.Transform)[], percentage: number, scene: BaseScene) 
    {
        for(const o of objects)
        {
            this.scaleToGameWidth(o, percentage, scene);
        }
    }

    public static scaleToGameHeight(object: Phaser.GameObjects.Components.Size & Phaser.GameObjects.Components.Transform, percentage: number, scene: BaseScene) 
    {
        let height = scene.getGameHeight();
        object.displayHeight = height * percentage;
        object.scaleX = object.scaleY;
    }
}