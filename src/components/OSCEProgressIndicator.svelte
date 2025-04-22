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
    } = $props();
</script>

<div class="bg-gray-100 p-3 py-4 border-t">
    <div class="flex justify-between items-center">
        <!-- Progress indicators -->
        <div class="flex justify-center">
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
