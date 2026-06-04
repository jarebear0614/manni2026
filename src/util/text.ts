import { BaseScene } from "../scenes/BaseScene";
import { GameObjects } from "phaser"

export class TextOptions
{
    public fontSize?: number = 24;
    public fontFamily?: string = 'Arial';
    public textColor?: string = '#ffffff';
    public textAlign?: string = 'center';
    public outlineColor?: string = '#000000';
    public outlineSize?: number = 4;
    public scrollFactor?: number = 1.0;
    public wordWrapWidth?: number | null = null;
    public useAdvancedWrap?: boolean = false;
}

export class TextUtility
{
    public static addAndCenterTextWithOutline(
        scene: BaseScene, 
        text: string, 
        options: TextOptions) : GameObjects.Text
    {
        let textObject = scene.add.text(0, 0, text, {fontFamily: options.fontFamily, fontSize: options.fontSize, color: options.textColor});

        if(options.outlineColor && options.outlineSize)
        {
            textObject.setStroke(options.outlineColor, options.outlineSize)
        }

        textObject.setAlign(options.textAlign);

        if(options.wordWrapWidth)
        {
            textObject.setWordWrapWidth(options.wordWrapWidth, options.useAdvancedWrap);
        }

        textObject.x = scene.getGameWidth() / 2 - textObject.displayWidth / 2;
        textObject.y = scene.getGameHeight() / 2 - textObject.displayHeight / 2;

        return textObject;
    }
}