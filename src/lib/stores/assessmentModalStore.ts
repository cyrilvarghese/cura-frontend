import { writable } from 'svelte/store';

type ModalType = 'case' | 'osce' | 'written' | 'viva';

interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    competencyCode: string | null;
}

export const assessmentModalStore = writable<ModalState>({
    isOpen: false,
    type: null,
    competencyCode: null
});

export const openModal = (type: ModalType, competencyCode: string) => {
    assessmentModalStore.set({
        isOpen: true,
        type,
        competencyCode
    });
};

export const closeModal = () => {
    assessmentModalStore.set({
        isOpen: false,
        type: null,
        competencyCode: null
    });
}; 