<script lang="ts">
    import type { OSCEFeedbackResponse } from "$lib/services/osceFeedbackService";

    const {
        currentQuestionIndex,
        totalQuestions,
        questionScores,
        totalScore,
        questionsAnswered,
        isQuestionAttempted,
        onQuestionSelect,
        prevQuestion,
        nextQuestion,
    } = $props();
</script>

<div class="bg-gray-100 p-3 py-4 border-t">
    <div class="flex justify-between items-center">
        <!-- Previous/Next buttons (moved from OSCEPopup) -->
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
                disabled={currentQuestionIndex === totalQuestions - 1}
                onclick={nextQuestion}
            >
                Next
            </button>
        </div>

        <!-- Progress indicators (centered) -->
        <div class="flex-1 flex justify-center">
            {#each Array(totalQuestions) as _, i}
                <button
                    type="button"
                    class="w-3 h-3 mx-1 rounded-full cursor-pointer {i ===
                    currentQuestionIndex
                        ? 'bg-blue-600'
                        : questionScores.some(
                                (q: {
                                    questionIndex: number;
                                    isCorrect: boolean;
                                }) => q.questionIndex === i && q.isCorrect,
                            )
                          ? 'bg-green-500'
                          : questionScores.some(
                                  (q: {
                                      questionIndex: number;
                                      isCorrect: boolean;
                                  }) => q.questionIndex === i && !q.isCorrect,
                              )
                            ? 'bg-red-500'
                            : isQuestionAttempted(i)
                              ? 'bg-yellow-500'
                              : 'bg-gray-300 hover:bg-gray-400'}"
                    onclick={() => onQuestionSelect(i)}
                    aria-label={`Go to question ${i + 1}`}
                ></button>
            {/each}
        </div>

        <!-- Score summary -->
        <div class="flex items-center">
            <div class="text-sm font-medium mr-2">
                Score: {totalScore.toFixed(1)} / {totalQuestions}
            </div>
            <div
                class="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded"
            >
                {questionsAnswered} of {totalQuestions} answered
            </div>
        </div>
    </div>
</div>
