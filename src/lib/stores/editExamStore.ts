import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { editExamService, type AddTextExamRequest, type AddMixedExamRequest, type DeleteExamRequest, type ExamResponse, type DeleteExamResponse } from '$lib/services/editExamService';

interface EditExamState {
    isLoading: boolean;
    error: string | null;
    lastAddedExam: ExamResponse | null;
    lastDeletedExam: DeleteExamResponse | null;
    isDialogOpen: boolean;
}

function createEditExamStore() {
    const { subscribe, set, update } = writable<EditExamState>({
        isLoading: false,
        error: null,
        lastAddedExam: null,
        lastDeletedExam: null,
        isDialogOpen: false
    });

    return {
        subscribe,

        addTextExam: async (request: AddTextExamRequest) => {
            const toastId = toast.loading('Adding examination...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.addTextExam(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Examination added successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been added`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to add text examination';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to add examination', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        addMixedExam: async (request: AddMixedExamRequest) => {
            const toastId = toast.loading('Adding examination with images...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.addMixedExam(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Examination added successfully', {
                    id: toastId,
                    description: `"${request.test_name}" with ${request.url.length} image(s) has been added`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to add mixed examination';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to add examination', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        deletePhysicalExam: async (request: DeleteExamRequest) => {
            const toastId = toast.loading('Deleting examination...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.deletePhysicalExam(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastDeletedExam: response
                }));

                toast.success('Examination deleted successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been removed`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete examination';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to delete examination', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        setDialogOpen: (isOpen: boolean) => {
            update(state => ({ ...state, isDialogOpen: isOpen }));
        },

        clearError: () => {
            update(state => ({ ...state, error: null }));
        },

        reset: () => {
            set({
                isLoading: false,
                error: null,
                lastAddedExam: null,
                lastDeletedExam: null,
                isDialogOpen: false
            });
        }
    };
}

export const editExamStore = createEditExamStore(); 