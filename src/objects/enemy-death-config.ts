import { GameObjects } from "phaser";

export class EnemyDeathConfig
{
    mainAssetKey: string;
    mainSprite: GameObjects.Sprite;
    deathAnimationAssetKey: string;
    currentFrame: number;
    explosionSprite: GameObjects.Sprite;
    frameToDisappearEnemy: number;
}