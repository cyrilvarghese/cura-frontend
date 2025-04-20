<script lang="ts">
    import { fade } from "svelte/transition";

    const { isOpen = false, onClose = () => {}, caseData } = $props();

    let currentQuestionIndex = $state(0);
    let showExplanation = $state(false);
    let selectedAnswer = $state<string | null>(null);
    let writtenAnswer = $state("");

    $effect(() => {
        // Reset state when question changes
        showExplanation = false;
        selectedAnswer = null;
        writtenAnswer = "";
    });

    function nextQuestion() {
        if (currentQuestionIndex < caseData.osce_questions.length - 1) {
            currentQuestionIndex = currentQuestionIndex + 1;
        }
    }

    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex = currentQuestionIndex - 1;
        }
    }

    function submitAnswer() {
        showExplanation = true;
    }

    function getCurrentQuestion() {
        return caseData.osce_questions[currentQuestionIndex];
    }

    function closePopup() {
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
                            <div class="space-y-3 mb-6">
                                {#each Object.entries(getCurrentQuestion().options) as [key, value]}
                                    <button
                                        type="button"
                                        class="p-3 border rounded-lg cursor-pointer transition-colors w-full text-left {selectedAnswer ===
                                        key
                                            ? 'bg-blue-100 border-blue-500'
                                            : 'hover:bg-gray-50'}"
                                        onclick={() => (selectedAnswer = key)}
                                    >
                                        <label
                                            class="flex items-start cursor-pointer"
                                        >
                                            <input
                                                type="radio"
                                                name="mcq-answer"
                                                value={key}
                                                checked={selectedAnswer === key}
                                                class="mt-1 mr-3"
                                            />
                                            <span
                                                ><span class="font-bold"
                                                    >{key}:</span
                                                >
                                                {value}</span
                                            >
                                        </label>
                                    </button>
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
                                ></textarea>
                            </div>
                        {/if}

                        <!-- Submit button -->
                        <button
                            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            onclick={submitAnswer}
                            disabled={showExplanation ||
                                (getCurrentQuestion().question_format ===
                                    "MCQ" &&
                                    !selectedAnswer) ||
                                (getCurrentQuestion().question_format ===
                                    "written" &&
                                    !writtenAnswer)}
                        >
                            Submit Answer
                        </button>

                        <!-- Explanation section -->
                        {#if showExplanation}
                            <div
                                class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
                            >
                                <h3 class="text-lg font-bold mb-2">
                                    Explanation
                                </h3>
                                <p class="text-gray-800">
                                    {getCurrentQuestion().explanation}
                                </p>

                                {#if getCurrentQuestion().expected_answer}
                                    <div class="mt-4">
                                        <h4 class="font-bold">
                                            Expected Answer:
                                        </h4>
                                        <p class="text-gray-800">
                                            {getCurrentQuestion()
                                                .expected_answer}
                                        </p>
                                    </div>
                                {/if}

                                <!-- Concept modal -->
                                {#if getCurrentQuestion().concept_modal}
                                    <div
                                        class="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                                    >
                                        <h4 class="font-bold mb-2">
                                            Key Concepts
                                        </h4>
                                        <div class="space-y-2">
                                            <p>
                                                <span class="font-semibold"
                                                    >Specific:</span
                                                >
                                                {getCurrentQuestion()
                                                    .concept_modal.specific}
                                            </p>
                                            <p>
                                                <span class="font-semibold"
                                                    >General:</span
                                                >
                                                {getCurrentQuestion()
                                                    .concept_modal.general}
                                            </p>
                                            <p>
                                                <span class="font-semibold"
                                                    >Lateral:</span
                                                >
                                                {getCurrentQuestion()
                                                    .concept_modal.lateral}
                                            </p>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        {/if}
                    </div>
                {/if}
            </div>

            <!-- Footer with progress indicator -->
            <div class="bg-gray-100 p-3 border-t">
                <div class="flex justify-center">
                    {#each Array(caseData.osce_questions.length) as _, i}
                        <button
                            type="button"
                            class="w-3 h-3 mx-1 rounded-full cursor-pointer {i ===
                            currentQuestionIndex
                                ? 'bg-blue-600'
                                : 'bg-gray-300 hover:bg-gray-400'}"
                            onclick={() => (currentQuestionIndex = i)}
                            aria-label={`Go to question ${i + 1}`}
                        ></button>
                    {/each}
                </div>
            </div>
        </div>
    </div>
{/if}
