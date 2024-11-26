declare module 'svelte-dnd-action' {
    export interface DndEvent<T = any> {
        items: T[];
        info: {
            id: string;
            index: number;
        };
    }

    export interface DndOptions<T = any> {
        items: T[];
        flipDurationMs?: number;
        dragDisabled?: boolean;
        morphDisabled?: boolean;
        dropFromOthersDisabled?: boolean;
        dragHandle?: string;
        applyScale?: boolean;
        layout?: boolean;
        dropTargetStyle?: Record<string, string>;
        activeDropTargetStyle?: Record<string, string>;
        consideredDropTargetStyle?: Record<string, string>;
    }

    export function dndzone(
        node: HTMLElement,
        options: DndOptions
    ): {
        update(options: DndOptions): void;
        destroy(): void;
    };

    export const TRIGGERS: {
        DRAG_STARTED: string;
        DRAG_ENDED: string;
        DROPPED_INTO_ZONE: string;
        DROPPED_INTO_ANOTHER: string;
        CONSIDER_ZONE: string;
    };
} 