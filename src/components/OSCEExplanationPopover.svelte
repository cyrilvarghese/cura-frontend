<script lang="ts">
    import * as Popover from "$lib/components/ui/popover";
    import { Button } from "$lib/components/ui/button";
    import Info from "lucide-svelte/icons/info";

    // Props for the component
    const { currentQuestion } = $props();

    // Determine if we should show the expected answer in the popover
    // Only show for MCQ questions, not for written questions
    let showExpectedAnswer = $derived(
        currentQuestion.question_format === "MCQ" &&
            currentQuestion.expected_answer,
    );
</script>

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
                <div class="bg-amber-100 px-4 py-3 border-b border-amber-200">
                    <h4 class="font-bold text-amber-800 flex items-center">
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
                    <p class="text-gray-800">
                        {currentQuestion.explanation ||
                            "No explanation available"}
                    </p>
                </div>
            </div>

            <!-- Key Concepts section -->
            {#if currentQuestion.concept_modal}
                <div class="mb-2">
                    <h4 class="font-bold text-gray-700 flex items-center">
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

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                            <p class="text-gray-800">
                                {currentQuestion.concept_modal.specific}
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
                            <p class="text-gray-800">
                                {currentQuestion.concept_modal.general}
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
                            <p class="text-gray-800">
                                {currentQuestion.concept_modal.lateral}
                            </p>
                        </div>
                    </div>
                </div>
            {/if}

            <!-- Expected answer card (only for MCQ questions) -->
            {#if showExpectedAnswer}
                <div
                    class="mt-4 bg-green-50 rounded-lg shadow-sm border border-green-200 overflow-hidden"
                >
                    <div
                        class="bg-green-100 px-4 py-3 border-b border-green-200"
                    >
                        <h4 class="font-bold text-green-800 flex items-center">
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
                        <p class="text-gray-800">
                            {currentQuestion.expected_answer}
                        </p>
                    </div>
                </div>
            {/if}
        </div>
    </Popover.Content>
</Popover.Root>
