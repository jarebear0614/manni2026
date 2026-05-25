export class GameState 
{
    tilemap?: string = "meganshouse";

    spawnX?: number = 21;

    spawnY?: number = 36;

    completedConstellations: boolean = false;

    fromScene?: string = '';

    birdwingSpawn: {x: number, y: number} | undefined = undefined; 
    hairStreakSpawn: {x: number, y: number} | undefined = undefined;
    lunaMothSpawn: {x: number, y: number} | undefined = undefined;
    perianderSpawn: {x: number, y: number} | undefined = undefined;

    birdwingButterflyObtained: boolean = false;

    hairStreakButterflyObtained: boolean = false;

    lunaMothButterflyObtained: boolean = false;

    perianderButterflyObtained: boolean = false;
}