import { writable } from 'svelte/store';
import { toast } from 'svelte-sonner';
import { editExamService, type AddTextExamRequest, type AddMixedExamRequest, type AddTextLabTestRequest, type AddMixedLabTestRequest, type DeleteExamRequest, type ExamResponse, type DeleteExamResponse, type EditTextExamRequest, type EditMixedExamRequest, type EditTextLabTestRequest, type EditMixedLabTestRequest } from '$lib/services/editExamService';

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

        deleteLabTest: async (request: DeleteExamRequest) => {
            const toastId = toast.loading('Deleting lab test...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.deleteLabTest(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastDeletedExam: response
                }));

                toast.success('Lab test deleted successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been removed`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to delete lab test';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to delete lab test', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        addTextLabTest: async (request: AddTextLabTestRequest) => {
            const toastId = toast.loading('Adding lab test...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.addTextLabTest(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Lab test added successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been added`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to add text lab test';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to add lab test', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        addMixedLabTest: async (request: AddMixedLabTestRequest) => {
            const toastId = toast.loading('Adding lab test with images...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.addMixedLabTest(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Lab test added successfully', {
                    id: toastId,
                    description: `"${request.test_name}" with ${request.url.length} image(s) has been added`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to add mixed lab test';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to add lab test', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        editTextExam: async (request: EditTextExamRequest) => {
            const toastId = toast.loading('Updating examination...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.editTextExam(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Examination updated successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been updated`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update text examination';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to update examination', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        editMixedExam: async (request: EditMixedExamRequest) => {
            const toastId = toast.loading('Updating examination with images...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.editMixedExam(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Examination updated successfully', {
                    id: toastId,
                    description: `"${request.test_name}" with ${request.url.length} image(s) has been updated`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update mixed examination';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to update examination', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        editTextLabTest: async (request: EditTextLabTestRequest) => {
            const toastId = toast.loading('Updating lab test...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.editTextLabTest(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Lab test updated successfully', {
                    id: toastId,
                    description: `"${request.test_name}" has been updated`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update text lab test';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to update lab test', {
                    id: toastId,
                    description: errorMessage
                });
                throw error;
            }
        },

        editMixedLabTest: async (request: EditMixedLabTestRequest) => {
            const toastId = toast.loading('Updating lab test with images...');
            update(state => ({ ...state, isLoading: true, error: null }));

            try {
                const response = await editExamService.editMixedLabTest(request);

                update(state => ({
                    ...state,
                    isLoading: false,
                    lastAddedExam: response,
                    isDialogOpen: false
                }));

                toast.success('Lab test updated successfully', {
                    id: toastId,
                    description: `"${request.test_name}" with ${request.url.length} image(s) has been updated`
                });

                return response;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Failed to update mixed lab test';
                update(state => ({
                    ...state,
                    isLoading: false,
                    error: errorMessage
                }));

                toast.error('Failed to update lab test', {
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