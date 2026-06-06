import { Events } from "phaser";

export const CUSTOM_EVENTS = Object.freeze({
    ENEMY_INIT: 'ENEMY_INIT',
    ENEMY_DESTROYED: 'ENEMY_DESTROYED',
    GROUP_INIT: 'GROUP_INIT',
    GROUP_DESTROYED: 'GROUP_DESTROYED'
});

export class EventBusComponent extends Events.EventEmitter
{
    constructor()
    {
        super();
    }
}