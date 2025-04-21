<script lang="ts">
    import { fade } from "svelte/transition";
    import { osceFeedbackStore } from "$lib/stores/osceFeedbackStore";
    import type {
        StudentResponse,
        OSCEFeedbackResponse,
    } from "$lib/services/osceFeedbackService";
    import { Button } from "$lib/components/ui/button";
    import * as Popover from "$lib/components/ui/popover";
    import CheckCircle from "lucide-svelte/icons/check-circle";
    import XCircle from "lucide-svelte/icons/x-circle";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import Info from "lucide-svelte/icons/info";

    const { isOpen = false, onClose = () => {}, caseData } = $props();

    // Current question being displayed to the user
    let currentQuestionIndex = $state(0);
    // Controls whether to show the explanation for the current question
    let showExplanation = $state(false);
    // Stores the selected MCQ answer key for the current question
    let selectedAnswer = $state<string | null>(null);
    // Stores the written answer for the current question
    let writtenAnswer = $state("");
    // Stores the feedback response from the API for the current question
    let feedbackResponse = $state<OSCEFeedbackResponse | null>(null);
    // Indicates whether an answer is currently being submitted to the API
    let isSubmitting = $state(false);
    // Controls whether the explanation section is expanded or collapsed
    let explanationExpanded = $state(false);
    // Tracks the cumulative score across all answered questions
    let totalScore = $state(0);
    // Tracks how many questions have been answered so far
    let questionsAnswered = $state(0);
    // Stores score information for each answered question
    let questionScores = $state<
        Array<{ questionIndex: number; score: number; isCorrect: boolean }>
    >([]);

    // Tracks student responses for all questions in the OSCE case
    let studentResponses = $state<
        Array<{
            student_mcq_choice_key: string | null;
            student_written_answer: string | null;
        }>
    >([]);

    // Initialize student responses array based on number of questions
    $effect(() => {
        if (caseData?.osce_questions) {
            studentResponses = caseData.osce_questions.map(() => ({
                student_mcq_choice_key: null,
                student_written_answer: null,
            }));
        }
    });

    $effect(() => {
        // Reset state when question changes
        showExplanation = false;
        selectedAnswer = null;
        writtenAnswer = "";
        feedbackResponse = null;
        explanationExpanded = false;
    });

    function nextQuestion() {
        if (currentQuestionIndex < caseData.osce_questions.length - 1) {
            // Save current response before moving to next question
            saveCurrentResponse();

            // Move to next question
            currentQuestionIndex = currentQuestionIndex + 1;

            // Reset UI state for the new question
            resetQuestionState();
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            // Save current response before moving to previous question
            saveCurrentResponse();

            // Move to previous question
            currentQuestionIndex = currentQuestionIndex - 1;

            // Reset UI state for the new question
            resetQuestionState();
        }
    }

    // Helper function to reset question state when navigating
    function resetQuestionState() {
        showExplanation = false;
        selectedAnswer = null;
        writtenAnswer = "";
        feedbackResponse = null;
        explanationExpanded = false;

        // Load any previously saved responses for this question
        const currentResponse = studentResponses[currentQuestionIndex];
        if (currentResponse) {
            if (currentResponse.student_mcq_choice_key) {
                selectedAnswer = currentResponse.student_mcq_choice_key;
            }
            if (currentResponse.student_written_answer) {
                writtenAnswer = currentResponse.student_written_answer;
            }
        }
    }

    function saveCurrentResponse() {
        const currentQuestion = getCurrentQuestion();
        if (currentQuestion.question_format === "MCQ") {
            studentResponses[currentQuestionIndex].student_mcq_choice_key =
                selectedAnswer;
            studentResponses[currentQuestionIndex].student_written_answer =
                null;
        } else if (currentQuestion.question_format === "written") {
            studentResponses[currentQuestionIndex].student_written_answer =
                writtenAnswer;
            studentResponses[currentQuestionIndex].student_mcq_choice_key =
                null;
        }
    }

    async function submitAnswer() {
        // Get the current question
        const currentQuestion = getCurrentQuestion();
        let studentResponse: StudentResponse;

        // Save the appropriate response based on question type
        if (currentQuestion.question_format === "MCQ") {
            // For MCQ questions
            if (!selectedAnswer) {
                // Handle case where user hasn't selected an answer
                alert("Please select an answer before submitting.");
                return;
            }

            studentResponse = {
                student_mcq_choice_key: selectedAnswer,
                student_written_answer: null,
            };
        } else if (currentQuestion.question_format === "written") {
            // For written questions
            if (!writtenAnswer.trim()) {
                // Handle case where user hasn't written an answer
                alert("Please provide an answer before submitting.");
                return;
            }

            studentResponse = {
                student_mcq_choice_key: null,
                student_written_answer: writtenAnswer,
            };
        } else {
            // Handle other question types if needed
            console.error(
                "Unsupported question format:",
                currentQuestion.question_format,
            );
            return;
        }

        // Log the response data
        console.log("Question details:", currentQuestion);
        console.log("Student response:", studentResponse);

        // Submit the response to the API
        isSubmitting = true;
        try {
            const feedback = await osceFeedbackStore.submitOSCEResponse(
                currentQuestion,
                studentResponse,
            );
            console.log("OSCE feedback received:", feedback);
            feedbackResponse = feedback;
            showExplanation = true;

            // Track the score for this question
            const score = feedback.feedback.score || 0;
            const isCorrect = feedback.feedback.evaluation_result === "Correct";

            // Update the question scores array
            const existingScoreIndex = questionScores.findIndex(
                (q) => q.questionIndex === currentQuestionIndex,
            );
            if (existingScoreIndex >= 0) {
                // Update existing score
                questionScores[existingScoreIndex] = {
                    questionIndex: currentQuestionIndex,
                    score,
                    isCorrect,
                };
            } else {
                // Add new score
                questionScores = [
                    ...questionScores,
                    {
                        questionIndex: currentQuestionIndex,
                        score,
                        isCorrect,
                    },
                ];
                questionsAnswered++;
            }

            // Recalculate total score
            totalScore = questionScores.reduce((sum, q) => sum + q.score, 0);
        } catch (error) {
            console.error("Error submitting OSCE response:", error);
            // Show error to the user
        } finally {
            isSubmitting = false;
        }
    }

    function toggleExplanation() {
        explanationExpanded = !explanationExpanded;
    }

    function getScoreColor(score: number) {
        if (score >= 1.0) return "text-green-600";
        if (score >= 0.5) return "text-yellow-600";
        return "text-red-600";
    }

    function getScoreIcon(isCorrect: boolean) {
        return isCorrect ? CheckCircle : XCircle;
    }

    function getCurrentQuestion() {
        return caseData.osce_questions[currentQuestionIndex];
    }

    function closePopup() {
        // You might want to save all responses before closing
        console.log("All student responses:", studentResponses);
        onClose();
    }
</script>

{#if isOpen}
    <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        transition:fade={{ duration: 200 }}
    >
        <div
            class="w-full max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden flex flex-col"
        >
            <!-- Header with student and case info -->
            <div class="bg-blue-600 text-white p-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-bold">
                            OSCE Case #{caseData.case_id}
                        </h1>
                        <p class="text-sm">Department: {caseData.department}</p>
                    </div>
                    <div class="text-right flex items-center">
                        <p class="text-sm mr-4">
                            Student ID: {caseData.student_id}
                        </p>
                        <button
                            class="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
                            onclick={closePopup}
                            aria-label="Close popup"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                class="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Question navigation -->
            <div class="bg-gray-200 p-2 flex items-center justify-between">
                <div class="text-sm font-medium">
                    Question {currentQuestionIndex + 1} of {caseData
                        .osce_questions.length}
                </div>
                <div class="flex space-x-2">
                    <button
                        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentQuestionIndex === 0}
                        onclick={prevQuestion}
                    >
                        Previous
                    </button>
                    <button
                        class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={currentQuestionIndex ===
                            caseData.osce_questions.length - 1}
                        onclick={nextQuestion}
                    >
                        Next
                    </button>
                </div>
            </div>

            <!-- Question content -->
            <div class="p-6 overflow-y-auto flex-grow">
                {#if getCurrentQuestion()}
                    <div class="mb-6">
                        <h2 class="text-xl font-bold mb-2">
                            {getCurrentQuestion().station_title}
                        </h2>
                        <p class="text-gray-700 mb-4">
                            {getCurrentQuestion().prompt}
                        </p>

                        <!-- Image-based question -->
                        {#if getCurrentQuestion().question_format === "image-based" && getCurrentQuestion().image_placeholder_url}
                            <div
                                class="mb-4 border border-gray-300 rounded-lg p-4 bg-gray-100"
                            >
                                <div
                                    class="aspect-w-16 aspect-h-9 bg-gray-200 flex items-center justify-center"
                                >
                                    <p class="text-gray-500">
                                        Image placeholder: {getCurrentQuestion()
                                            .image_placeholder_url}
                                    </p>
                                </div>
                            </div>
                        {/if}

                        <!-- MCQ question -->
                        {#if getCurrentQuestion().question_format === "MCQ" && getCurrentQuestion().options}
                            <div class="space-y-3 mt-4">
                                {#each Object.entries(getCurrentQuestion().options) as [key, text]}
                                    <div
                                        class="border rounded-lg p-4 transition-colors {showExplanation &&
                                        key ===
                                            getCurrentQuestion()
                                                .mcq_correct_answer_key
                                            ? 'border-green-500 bg-green-50'
                                            : showExplanation &&
                                                selectedAnswer === key &&
                                                key !==
                                                    getCurrentQuestion()
                                                        .mcq_correct_answer_key
                                              ? 'border-red-500 bg-red-50'
                                              : selectedAnswer === key
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200'}"
                                        onclick={() => {
                                            if (!showExplanation) {
                                                selectedAnswer = key;
                                            }
                                        }}
                                        onkeydown={(e) => {
                                            if (
                                                (e.key === "Enter" ||
                                                    e.key === " ") &&
                                                !showExplanation
                                            ) {
                                                selectedAnswer = key;
                                            }
                                        }}
                                        tabindex="0"
                                        role="radio"
                                        aria-checked={selectedAnswer === key}
                                    >
                                        <div class="flex items-start">
                                            <div class="mt-1 mr-3">
                                                <input
                                                    type="radio"
                                                    name="mcq-option"
                                                    id={`option-${key}`}
                                                    value={key}
                                                    checked={selectedAnswer ===
                                                        key}
                                                    disabled={showExplanation}
                                                    class="h-4 w-4 text-blue-600"
                                                />
                                            </div>
                                            <div class="flex-grow">
                                                <label
                                                    for={`option-${key}`}
                                                    class="flex items-center cursor-pointer"
                                                >
                                                    <span
                                                        class="font-medium mr-2"
                                                        >{key}:</span
                                                    >
                                                    <span>{text}</span>

                                                    {#if showExplanation && key === getCurrentQuestion().mcq_correct_answer_key}
                                                        <span
                                                            class="ml-2 text-green-600"
                                                            >✓</span
                                                        >
                                                    {/if}

                                                    {#if showExplanation && selectedAnswer === key && key !== getCurrentQuestion().mcq_correct_answer_key}
                                                        <span
                                                            class="ml-2 text-red-600"
                                                            >✗</span
                                                        >
                                                    {/if}
                                                </label>

                                                {#if showExplanation && key === getCurrentQuestion().mcq_correct_answer_key}
                                                    <div
                                                        class="mt-2 text-sm text-green-700"
                                                    >
                                                        {#if feedbackResponse?.feedback.feedback}
                                                            <p
                                                                class="mt-2 pl-6"
                                                            >
                                                                {feedbackResponse
                                                                    .feedback
                                                                    .feedback}
                                                            </p>
                                                        {/if}
                                                    </div>
                                                {/if}
                                            </div>
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}

                        <!-- Written question -->
                        {#if getCurrentQuestion().question_format === "written"}
                            <div class="mb-6">
                                <textarea
                                    class="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Type your answer here..."
                                    value={writtenAnswer}
                                    oninput={(e) => {
                                        const target =
                                            e.target as HTMLTextAreaElement;
                                        writtenAnswer = target.value;
                                    }}
                                    disabled={showExplanation}
                                ></textarea>

                                <!-- Show feedback first -->
                                {#if showExplanation && feedbackResponse?.feedback}
                                    <div
                                        class="mt-4 p-4 rounded-lg {feedbackResponse
                                            .feedback.evaluation_result ===
                                        'Correct'
                                            ? 'bg-green-50 border border-green-200'
                                            : 'bg-amber-50 border border-amber-200'}"
                                    >
                                        <div class="flex items-center">
                                            <span class="text-gray-700"
                                                >{feedbackResponse.feedback
                                                    .feedback}</span
                                            >
                                        </div>
                                    </div>
                                {/if}

                                <!-- Collapsible expected answer section -->
                                {#if showExplanation && getCurrentQuestion().expected_answer}
                                    <div
                                        class="mt-4 bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden"
                                    >
                                        <button
                                            class="w-full bg-green-100 px-4 py-3 border-b border-green-200 text-left flex items-center justify-between"
                                            onclick={() =>
                                                (explanationExpanded =
                                                    !explanationExpanded)}
                                        >
                                            <h4
                                                class="font-bold text-green-800 flex items-center"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    class="h-5 w-5 mr-2"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        stroke-linecap="round"
                                                        stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                    />
                                                </svg>
                                                Expected Answer
                                            </h4>
                                            {#if explanationExpanded}
                                                <ChevronUp
                                                    class="h-5 w-5 text-green-700"
                                                />
                                            {:else}
                                                <ChevronDown
                                                    class="h-5 w-5 text-green-700"
                                                />
                                            {/if}
                                        </button>

                                        {#if explanationExpanded}
                                            <div class="p-4">
                                                <p class="text-gray-800">
                                                    {getCurrentQuestion()
                                                        .expected_answer}
                                                </p>
                                            </div>
                                        {/if}
                                    </div>
                                {/if}
                            </div>
                        {/if}

                        <!-- Footer with action buttons -->
                        <div class="flex items-center justify-between mt-4">
                            <div class="flex items-center space-x-3">
                                <Button
                                    onclick={submitAnswer}
                                    disabled={showExplanation ||
                                        isSubmitting ||
                                        (getCurrentQuestion()
                                            .question_format === "MCQ" &&
                                            !selectedAnswer) ||
                                        (getCurrentQuestion()
                                            .question_format === "written" &&
                                            !writtenAnswer)}
                                >
                                    {#if isSubmitting}
                                        <Loader2
                                            class="mr-2 h-4 w-4 animate-spin"
                                        />
                                        Submitting...
                                    {:else}
                                        Submit Answer
                                    {/if}
                                </Button>

                                {#if showExplanation}
                                    <Popover.Root>
                                        <Popover.Trigger>
                                            <Button variant="link" size="sm">
                                                <Info class="h-4 w-4" />
                                                Explanation
                                            </Button>
                                        </Popover.Trigger>
                                        <Popover.Content
                                            class="w-[calc(100vw-4rem)] max-w-3xl max-h-[80vh] overflow-y-auto"
                                            sideOffset={5}
                                        >
                                            <div class="p-4 bg-white">
                                                <!-- Explanation card -->
                                                <div
                                                    class="bg-amber-50 rounded-lg shadow-sm border border-amber-200 overflow-hidden mb-4"
                                                >
                                                    <div
                                                        class="bg-amber-100 px-4 py-3 border-b border-amber-200"
                                                    >
                                                        <h4
                                                            class="font-bold text-amber-800 flex items-center"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                class="h-5 w-5 mr-2"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                />
                                                            </svg>
                                                            Explanation
                                                        </h4>
                                                    </div>
                                                    <div class="p-4">
                                                        <p
                                                            class="text-gray-800"
                                                        >
                                                            {getCurrentQuestion()
                                                                .explanation ||
                                                                "No explanation available"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <!-- Key Concepts section -->
                                                {#if getCurrentQuestion().concept_modal}
                                                    <div class="mb-2">
                                                        <h4
                                                            class="font-bold text-gray-700 flex items-center"
                                                        >
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                class="h-5 w-5 mr-2"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    stroke-linecap="round"
                                                                    stroke-linejoin="round"
                                                                    stroke-width="2"
                                                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                                />
                                                            </svg>
                                                            Key Concepts
                                                        </h4>
                                                    </div>

                                                    <div
                                                        class="grid grid-cols-1 md:grid-cols-3 gap-4"
                                                    >
                                                        <!-- Specific card -->
                                                        <div
                                                            class="bg-blue-50 rounded-lg shadow-sm border border-blue-200 overflow-hidden hover:shadow-md transition-shadow"
                                                        >
                                                            <div
                                                                class="bg-blue-100 px-4 py-2 border-b border-blue-200"
                                                            >
                                                                <h5
                                                                    class="font-semibold text-blue-800 flex items-center"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        class="h-4 w-4 mr-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            stroke-width="2"
                                                                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                        />
                                                                    </svg>
                                                                    Specific
                                                                </h5>
                                                            </div>
                                                            <div class="p-4">
                                                                <p
                                                                    class="text-gray-800"
                                                                >
                                                                    {getCurrentQuestion()
                                                                        .concept_modal
                                                                        .specific}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <!-- General card -->
                                                        <div
                                                            class="bg-purple-50 rounded-lg shadow-sm border border-purple-200 overflow-hidden hover:shadow-md transition-shadow"
                                                        >
                                                            <div
                                                                class="bg-purple-100 px-4 py-2 border-b border-purple-200"
                                                            >
                                                                <h5
                                                                    class="font-semibold text-purple-800 flex items-center"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        class="h-4 w-4 mr-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            stroke-width="2"
                                                                            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                        />
                                                                    </svg>
                                                                    General
                                                                </h5>
                                                            </div>
                                                            <div class="p-4">
                                                                <p
                                                                    class="text-gray-800"
                                                                >
                                                                    {getCurrentQuestion()
                                                                        .concept_modal
                                                                        .general}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <!-- Lateral card -->
                                                        <div
                                                            class="bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden hover:shadow-md transition-shadow"
                                                        >
                                                            <div
                                                                class="bg-green-100 px-4 py-2 border-b border-green-200"
                                                            >
                                                                <h5
                                                                    class="font-semibold text-green-800 flex items-center"
                                                                >
                                                                    <svg
                                                                        xmlns="http://www.w3.org/2000/svg"
                                                                        class="h-4 w-4 mr-1"
                                                                        fill="none"
                                                                        viewBox="0 0 24 24"
                                                                        stroke="currentColor"
                                                                    >
                                                                        <path
                                                                            stroke-linecap="round"
                                                                            stroke-linejoin="round"
                                                                            stroke-width="2"
                                                                            d="M7 16l-4-4m0 0l4-4m-4 4h18"
                                                                        />
                                                                    </svg>
                                                                    Lateral
                                                                </h5>
                                                            </div>
                                                            <div class="p-4">
                                                                <p
                                                                    class="text-gray-800"
                                                                >
                                                                    {getCurrentQuestion()
                                                                        .concept_modal
                                                                        .lateral}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                {/if}

                                                <!-- Expected answer card (if available) -->
                                                {#if getCurrentQuestion().expected_answer}
                                                    <div
                                                        class="mt-4 bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden"
                                                    >
                                                        <div
                                                            class="bg-green-100 px-4 py-3 border-b border-green-200"
                                                        >
                                                            <h4
                                                                class="font-bold text-green-800 flex items-center"
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    class="h-5 w-5 mr-2"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        stroke-linecap="round"
                                                                        stroke-linejoin="round"
                                                                        stroke-width="2"
                                                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                                                    />
                                                                </svg>
                                                                Expected Answer
                                                            </h4>
                                                        </div>
                                                        <div class="p-4">
                                                            <p
                                                                class="text-gray-800"
                                                            >
                                                                {getCurrentQuestion()
                                                                    .expected_answer}
                                                            </p>
                                                        </div>
                                                    </div>
                                                {/if}
                                            </div>
                                        </Popover.Content>
                                    </Popover.Root>
                                {/if}
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <!-- Footer with progress indicator -->
            <div class="bg-gray-100 p-3 border-t">
                <div class="flex justify-between items-center">
                    <!-- Progress indicators -->
                    <div class="flex justify-center">
                        {#each Array(caseData.osce_questions.length) as _, i}
                            <button
                                type="button"
                                class="w-3 h-3 mx-1 rounded-full cursor-pointer {i ===
                                currentQuestionIndex
                                    ? 'bg-blue-600'
                                    : questionScores.some(
                                            (q) =>
                                                q.questionIndex === i &&
                                                q.isCorrect,
                                        )
                                      ? 'bg-green-500'
                                      : questionScores.some(
                                              (q) =>
                                                  q.questionIndex === i &&
                                                  !q.isCorrect,
                                          )
                                        ? 'bg-red-500'
                                        : 'bg-gray-300 hover:bg-gray-400'}"
                                onclick={() => {
                                    saveCurrentResponse();
                                    currentQuestionIndex = i;
                                    resetQuestionState();
                                }}
                                aria-label={`Go to question ${i + 1}`}
                            ></button>
                        {/each}
                    </div>

                    <!-- Score summary -->
                    <div class="flex items-center">
                        <div class="text-sm font-medium mr-2">
                            Score: {totalScore.toFixed(1)} / {caseData
                                .osce_questions.length}
                        </div>
                        <div
                            class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
                        >
                            {questionsAnswered} of {caseData.osce_questions
                                .length} answered
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
{/if}
