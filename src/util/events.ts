import { EndAction, NPCEventEndAction, NPCEvent, OverlapAction, EventEndAction } from "../events/dialog";

export class NPCEndConfig
{
    fadeDuration: number;
}

export class EventEndConfig
{
    eventEndKey: number;
    spawnLocationNPCInstance?: string;


    tilesToRemove?: {layerName: string, coordinates: {x: number, y: number}[] }[];
}

export class NPCEventData
{
    npcOnEndConfig?: NPCEndConfig;
    npcOnEnd: NPCEventEndAction = NPCEventEndAction.nop;
    eventOnEnd: EventEndAction = EventEndAction.nop;
    eventEndConfig?: EventEndConfig;
    npc: NPCEvent[];
}

export const npcEvents: { [key: string]: NPCEventData; } =
{
    "whatsreal":
    {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnBirdwingButterfly,
        eventEndConfig: 
        {
            eventEndKey: 1,
            spawnLocationNPCInstance: 'jared0'
        },
        npc: [
                {
                    instance: 'jared0',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Hiya Love",
                                "I knew you'd know the real me."
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop
                        }
                    ]
                },
                {
                    instance: 'jaredfake0',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                },
                {
                    instance: 'jaredfake1',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                },
                {
                    instance: 'jaredfake2',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "Tee hee"
                            ],
                            onEnd: EndAction.nop,
                            overlapAction: OverlapAction.nop
                        },
                    ]
                }
            ]
    },
    "maze": 
    {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnLunaMothButterfly | EventEndAction.removeTiles,
        eventEndConfig: 
        {
            eventEndKey: 1,
            spawnLocationNPCInstance: 'jaredmaze',
            tilesToRemove: [{layerName: 'colliders', coordinates: [{x: 42, y: 2}, {x: 43, y: 2}, {x: 44, y: 2}, {x: 42, y: 3}, {x: 43, y: 3}, {x: 44, y: 3}]}]
        },
        npc: [
            {
                    instance: 'jaredmaze',
                    events: [
                        {
                            eventKey: 0,
                            dialog: [
                                "You made it through the maze! Now let's just go behind this bush..."
                            ],
                            onEnd: EndAction.incrementEvent,
                            overlapAction: OverlapAction.nop
                        }
                    ]
            },
        ]
    },
    "constellations":
    {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnHairstreakButterfly,
        eventEndConfig: 
        {
            eventEndKey: 2,
            spawnLocationNPCInstance: 'jaredconstellations'
        },
        npc: [
            {
                instance: 'jaredconstellations',
                events: [
                    {
                        eventKey: 0,
                        dialog: [
                            "Look at at the night sky, love, and see our future~"
                        ],
                        onEnd: EndAction.startScene,
                        scene: "Constellations",
                        fromX: 18,
                        fromY: 12,
                        overlapAction: OverlapAction.nop
                    },
                    {
                        eventKey: 1,
                        dialog: [
                            "Never forget that my love for you is written in the stars~"
                        ],
                        onEnd: EndAction.incrementEvent,
                        overlapAction: OverlapAction.nop
                    },
                ]
            },
        ]
    },
    "cats": {
        npcOnEnd: NPCEventEndAction.fadeOut,
        npcOnEndConfig: 
        {
            fadeDuration: 2000,
        },
        eventOnEnd: EventEndAction.spawnPerianderButterfly,
        eventEndConfig: 
        {
            eventEndKey: 2,
            spawnLocationNPCInstance: 'jaredcats'
        },
        npc: 
        [
            {
                instance: 'onyx0',
                idleFrameSpacing: 4,
                walkFrameSpacing: 4,
                events: [
                    {
                        eventKey: 0,
                        dialog: [
                            "MEOW"
                        ],
                        onEnd: EndAction.nop,
                        overlapAction: OverlapAction.nop
                    },
                    {
                        eventKey: 1,
                        dialog: [
                            "MEOW"
                        ],
                        onEnd: EndAction.triggerEvent,
                        overlapAction: OverlapAction.nop,
                        triggerEventData: 
                        {
                            name: 'cats',
                            data: {
                                catSelection: 'Onyx'
                            }
                        }
                    },
                ]
            },
            {
                instance: 'reese0',
                idleFrameSpacing: 4,
                walkFrameSpacing: 4,
                events: [
                    {
                        eventKey: 0,
                        dialog: [
                            "meow~"
                        ],
                        onEnd: EndAction.nop,
                        overlapAction: OverlapAction.nop,
                    },
                    {
                        eventKey: 1,
                        dialog: [
                            "meow~"
                        ],
                        onEnd: EndAction.triggerEvent,
                        overlapAction: OverlapAction.nop,
                        triggerEventData: 
                        {
                            name: 'cats',
                            data: {
                                catSelection: 'Reese'
                            }
                        }
                    },
                ]
            },
            {
                instance: 'jaredcats',
                events: [
                    {
                        eventKey: 0,
                        dialog: [
                            "Welcome to the cat races~",
                            "Talk to a cat and select the one you think will win!"
                        ],
                        onEnd: EndAction.incrementEvent,
                        overlapAction: OverlapAction.nop
                    },
                    {
                        eventKey: 1,
                        dialog: [
                            "Go on, talk to a kitty!",
                            "If you guessed incorrectly, wait for them to move back to the starting line and pick again!"
                        ],
                        onEnd: EndAction.nop,
                        overlapAction: OverlapAction.nop
                    },
                    {
                        eventKey: 2,
                        dialog: [
                            "You won, I'll have to reward you later",
                            "But for now, this butterfly is yours."
                        ],
                        onEnd: EndAction.incrementEvent,
                        overlapAction: OverlapAction.nop
                    },
                ]
            }
        ]
    },
    "end": 
    {
        npcOnEnd: NPCEventEndAction.nop,
        eventOnEnd: EventEndAction.nop,
        npc: [
            {
                instance: 'jaredend',
                events: [
                    {
                        eventKey: 1,
                        dialog: [
                            "Would you like to watch with me?"
                        ],
                        onEnd: EndAction.triggerEvent,
                        triggerEventData:
                        {
                            name: "endscene",
                            data: {}
                        },
                        overlapAction: OverlapAction.nop
                    }
                ]
            },
        ]
    }
};