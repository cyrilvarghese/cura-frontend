<script lang="ts">
    import { fade } from "svelte/transition";
    import { osceFeedbackStore } from "$lib/stores/osceFeedbackStore";
    import { onMount } from "svelte";
    import type {
        StudentResponse,
        OSCEFeedbackResponse,
        PerformanceComparisonData,
    } from "$lib/services/osceFeedbackService";
    import { Button } from "$lib/components/ui/button";
    import * as Popover from "$lib/components/ui/popover";
    import CheckCircle from "lucide-svelte/icons/check-circle";
    import XCircle from "lucide-svelte/icons/x-circle";
    import ChevronDown from "lucide-svelte/icons/chevron-down";
    import ChevronUp from "lucide-svelte/icons/chevron-up";
    import Loader2 from "lucide-svelte/icons/loader-2";
    import Info from "lucide-svelte/icons/info";
    import OSCEExplanationPopover from "./OSCEExplanationPopover.svelte";
    import OSCEProgressIndicator from "./OSCEProgressIndicator.svelte";
    import CheckCheck from "lucide-svelte/icons/check-check";
    import { Progress } from "$lib/components/ui/progress";
    import {
        Eye,
        RefreshCw,
        Library,
        BarChart,
        ArrowLeft,
    } from "lucide-svelte";
    import { Link } from "svelte-routing";

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

    // Add this new state variable to track if all questions have been completed
    let showEndScreen = $state(false);

    // Add a new state variable to track which questions have been attempted
    let attemptedQuestions = $state<Set<number>>(new Set());

    // Add a derived value for sorted scores
    let sortedQuestionScores = $derived(
        [...questionScores].sort((a, b) => a.questionIndex - b.questionIndex),
    );

    // Add these derived values for score calculations
    let mcqQuestions = $derived(
        sortedQuestionScores.filter(
            (q) =>
                caseData.osce_questions[q.questionIndex].question_format ===
                "MCQ",
        ),
    );
    let writtenQuestions = $derived(
        sortedQuestionScores.filter(
            (q) =>
                caseData.osce_questions[q.questionIndex].question_format ===
                "written",
        ),
    );
    let imageQuestions = $derived(
        sortedQuestionScores.filter(
            (q) =>
                caseData.osce_questions[q.questionIndex].question_format ===
                "image-based",
        ),
    );

    let mcqScore = $derived(mcqQuestions.reduce((sum, q) => sum + q.score, 0));
    let writtenScore = $derived(
        writtenQuestions.reduce((sum, q) => sum + q.score, 0),
    );
    let imageScore = $derived(
        imageQuestions.reduce((sum, q) => sum + q.score, 0),
    );

    let mcqMaxScore = $derived(mcqQuestions.length);
    let writtenMaxScore = $derived(writtenQuestions.length);
    let imageMaxScore = $derived(imageQuestions.length);

    let mcqPercentage = $derived(
        mcqQuestions.length > 0 ? (mcqScore / mcqMaxScore) * 100 : 0,
    );
    let writtenPercentage = $derived(
        writtenQuestions.length > 0
            ? (writtenScore / writtenMaxScore) * 100
            : 0,
    );
    let imagePercentage = $derived(
        imageQuestions.length > 0 ? (imageScore / imageMaxScore) * 100 : 0,
    );
    let totalPercentage = $derived(
        (totalScore / caseData.osce_questions.length) * 100,
    );

    // Add this new state variable to track if we're showing the comparison view
    let showComparisonView = $state(false);
    let comparisonData = $state<PerformanceComparisonData | null>(null);
    let isLoadingComparison = $state(false);

    // Add effect to debug view state changes
    $effect(() => {
        console.log("State changed - current view states:");
        console.log("- showEndScreen:", showEndScreen);
        console.log("- showComparisonView:", showComparisonView);
        console.log("- comparisonData exists:", comparisonData !== null);
    });

    // Function to reset all state to initial values
    function resetState() {
        currentQuestionIndex = 0;
        showExplanation = false;
        selectedAnswer = null;
        writtenAnswer = "";
        feedbackResponse = null;
        isSubmitting = false;
        explanationExpanded = false;
        totalScore = 0;
        questionsAnswered = 0;
        questionScores = [];
        showEndScreen = false;
        attemptedQuestions = new Set();

        // Initialize student responses array based on number of questions
        if (caseData?.osce_questions) {
            studentResponses = caseData.osce_questions.map(() => ({
                student_mcq_choice_key: null,
                student_written_answer: null,
            }));
        }
    }

    // Reset state when component mounts
    onMount(() => {
        resetState();
    });

    // Also reset state when caseData changes
    $effect(() => {
        if (caseData) {
            resetState();
        }
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

    // Modify this function to not automatically show the end screen
    function checkAndUpdateEndScreen() {
        // Only prepare the score data but don't automatically show end screen
        if (questionsAnswered === caseData.osce_questions.length) {
            // Create score data object
            const scoreData = {
                case_id: caseData.case_id,
                overallPerformance: {
                    totalPointsEarned: totalScore,
                    totalPossiblePoints: caseData.osce_questions.length,
                    overallPercentage: totalPercentage,
                },
                performanceByQuestionType: {
                    multipleChoicePercentage: mcqPercentage,
                    writtenResponsePercentage: writtenPercentage,
                    imageBasedPercentage: imagePercentage,
                },
            };

            // Log to console
            console.log("OSCE Score Summary:", scoreData);

            // Send to server
            osceFeedbackStore
                .recordOsceFeedback(scoreData)
                .then((response) =>
                    console.log("Score recorded successfully:", response),
                )
                .catch((error) =>
                    console.error("Failed to record score:", error),
                );
        }
    }

    // Add new function to manually show end screen
    function showEndScreenManually() {
        showEndScreen = true;
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

            let newQuestionScores = [...questionScores];
            if (existingScoreIndex >= 0) {
                // Update existing score
                newQuestionScores[existingScoreIndex] = {
                    questionIndex: currentQuestionIndex,
                    score,
                    isCorrect,
                };
            } else {
                // Add new score
                newQuestionScores.push({
                    questionIndex: currentQuestionIndex,
                    score,
                    isCorrect,
                });

                // Increment questions answered counter
                questionsAnswered++;

                // Call the separate function to check and update end screen
                checkAndUpdateEndScreen();
            }

            questionScores = newQuestionScores;

            // Recalculate total score
            totalScore = questionScores.reduce((sum, q) => sum + q.score, 0);

            // Mark this question as attempted
            attemptedQuestions = new Set([
                ...attemptedQuestions,
                currentQuestionIndex,
            ]);
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

    // Modify this function to allow retaking the test
    function returnToQuestions() {
        // Hide end screen
        showEndScreen = false;

        // Reset state to allow retaking the test
        resetState();

        // Initialize student responses array based on number of questions
        if (caseData?.osce_questions) {
            studentResponses = caseData.osce_questions.map(() => ({
                student_mcq_choice_key: null,
                student_written_answer: null,
            }));
        }
    }

    function closePopup() {
        // You might want to save all responses before closing
        console.log("All student responses:", studentResponses);
        showEndScreen = false; // Reset end screen state when closing
        showComparisonView = false; // Reset comparison view state when closing
        comparisonData = null; // Clear comparison data
        onClose();
    }

    // Add a helper function to check if a question has been attempted
    function isQuestionAttempted(index: number) {
        return attemptedQuestions.has(index);
    }

    function handleQuestionSelect(index: number) {
        saveCurrentResponse();
        currentQuestionIndex = index;
        resetQuestionState();
    }

    // Add a new function to fetch and display the comparison data
    async function showComparisonData() {
        try {
            console.log("Starting to fetch comparison data...");
            isLoadingComparison = true;

            // Log the case ID to ensure it's correct
            console.log(
                "Fetching comparison data for case ID:",
                caseData.case_id,
            );

            const data = await osceFeedbackStore.getPerformanceComparison(
                caseData.case_id,
            );

            console.log("Successfully received comparison data:", data);

            // Update state variables in this specific order
            comparisonData = data;
            console.log("Updated comparisonData state:", comparisonData);

            // Force a small delay to ensure state updates are processed
            setTimeout(() => {
                showComparisonView = true;
                console.log("Set showComparisonView to:", showComparisonView);
            }, 50);
        } catch (error) {
            console.error("Failed to fetch comparison data:", error);
            alert("Failed to load comparison data. Please try again.");
        } finally {
            isLoadingComparison = false;
            console.log("Set isLoadingComparison to false");
        }
    }

    function returnToEndScreen() {
        console.log("Returning to end screen");
        showComparisonView = false;
        console.log("Set showComparisonView to:", showComparisonView);
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
            <div class="bg-gray-900 text-white p-4">
                <div class="flex justify-between items-center">
                    <div>
                        <h1 class="text-xl font-bold">
                            OSCE Case #{caseData.case_id}
                        </h1>
                        <p class="text-sm">Department: {caseData.department}</p>
                    </div>
                    <div class="text-right flex items-center">
                        <!-- <p class="text-sm mr-4">
                            Student ID: {caseData.student_id}
                        </p> -->
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

            <!-- Explicit View Control -->
            {#key showComparisonView}
                {#if showComparisonView}
                    <!-- Comparison View -->
                    <div class="flex-grow p-6 overflow-y-auto">
                        <div class="flex items-center mb-6">
                            <Button
                                variant="outline"
                                class="flex items-center"
                                onclick={returnToEndScreen}
                            >
                                <ArrowLeft class="mr-1 h-4 w-4" />
                                Back to Results
                            </Button>
                            <h2 class="text-2xl font-bold ml-4">
                                Performance Comparison
                            </h2>
                        </div>

                        {#if isLoadingComparison}
                            <div class="flex justify-center items-center h-64">
                                <Loader2
                                    class="h-8 w-8 animate-spin text-blue-500"
                                />
                                <span class="ml-2 text-lg"
                                    >Loading comparison data...</span
                                >
                            </div>
                        {:else if comparisonData}
                            <div class="bg-white rounded-lg shadow-md p-6">
                                <div class="mb-4">
                                    <h3 class="text-xl font-semibold">
                                        Case: {comparisonData.primary_diagnosis}
                                    </h3>
                                </div>

                                <div class="overflow-x-auto">
                                    <table
                                        class="w-full text-sm border-collapse"
                                    >
                                        <thead>
                                            <tr class="bg-gray-100">
                                                <th
                                                    class="py-3 px-4 text-left border-b border-gray-200"
                                                    >Category</th
                                                >
                                                <th
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                    >Your Score</th
                                                >
                                                <th
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                    >Avg Score</th
                                                >
                                                <th
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                    >Max Score</th
                                                >
                                                <th
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                    >Comparison</th
                                                >
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- History -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >History Taking</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_history.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_history.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_history.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_history /
                                                                comparisonData.max_history) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_history /
                                                                    comparisonData.max_history) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_history.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Physical Examination -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >Physical Examination</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_physicals.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_physicals.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_physicals.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_physicals /
                                                                comparisonData.max_physicals) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_physicals /
                                                                    comparisonData.max_physicals) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_physicals.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Diagnostic Tests -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >Diagnostic Tests</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_tests.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_tests.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_tests.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_tests /
                                                                comparisonData.max_tests) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_tests /
                                                                    comparisonData.max_tests) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_tests.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Diagnosis -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >Diagnosis</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_diagnosis.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_diagnosis.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_diagnosis.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_diagnosis /
                                                                comparisonData.max_diagnosis) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_diagnosis /
                                                                    comparisonData.max_diagnosis) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_diagnosis.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Clinical Reasoning -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >Clinical Reasoning</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_reasoning.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_reasoning.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_reasoning.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_reasoning /
                                                                comparisonData.max_reasoning) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_reasoning /
                                                                    comparisonData.max_reasoning) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_reasoning.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>

                                            <!-- Differential Diagnosis -->
                                            <tr class="hover:bg-gray-50">
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200 font-medium"
                                                    >Differential Diagnosis</td
                                                >
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.student_differentials.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.avg_differentials.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 text-center border-b border-gray-200"
                                                >
                                                    {comparisonData.max_differentials.toFixed(
                                                        1,
                                                    )}
                                                </td>
                                                <td
                                                    class="py-3 px-4 border-b border-gray-200"
                                                >
                                                    <div
                                                        class="w-full bg-gray-200 h-3 rounded-full relative"
                                                    >
                                                        <!-- Average score indicator -->
                                                        <div
                                                            class="absolute h-3 top-0 w-1 bg-gray-500 z-10"
                                                            style="left: {(comparisonData.avg_differentials /
                                                                comparisonData.max_differentials) *
                                                                100}%"
                                                        ></div>

                                                        <!-- Student score bar -->
                                                        <div
                                                            class="h-full bg-blue-500 rounded-l-full"
                                                            style="width: {Math.max(
                                                                0.5,
                                                                (comparisonData.student_differentials /
                                                                    comparisonData.max_differentials) *
                                                                    100,
                                                            )}%"
                                                        ></div>
                                                    </div>
                                                    <div
                                                        class="flex justify-between mt-1 text-xs text-gray-500"
                                                    >
                                                        <span>0</span>
                                                        <span
                                                            >{comparisonData.max_differentials.toFixed(
                                                                1,
                                                            )}</span
                                                        >
                                                    </div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="mt-8 flex justify-center">
                                    <Button
                                        variant="outline"
                                        onclick={returnToEndScreen}
                                        class="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                    >
                                        <ArrowLeft class="mr-2 h-4 w-4" />
                                        Return to Results
                                    </Button>
                                </div>
                            </div>
                        {:else}
                            <div
                                class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center"
                            >
                                <p>No comparison data available.</p>
                            </div>
                        {/if}
                    </div>
                {:else if showEndScreen}
                    <!-- End Screen -->
                    <div
                        class="flex-grow flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div class="flex items-center justify-center mb-4">
                            <h2 class="text-3xl font-bold mr-2">Well Done!</h2>
                            <div
                                class="rounded-full p-1 border-2 border-green-500 inline-flex"
                            >
                                <CheckCheck class="h-5 w-5 text-green-500" />
                            </div>
                        </div>

                        <p class="text-base mb-2 text-gray-600">
                            You've completed all questions in this OSCE case. 🎉
                        </p>

                        <div
                            class="bg-gray-50 rounded-lg p-6 mb-8 w-full max-w-md shadow-md"
                        >
                            <h3
                                class="text-xl font-semibold mb-6 text-center text-black"
                            >
                                Your Final Score 🩺
                            </h3>

                            <!-- Overall score with progress bar -->
                            <div class="mb-10">
                                <div
                                    class="flex justify-between items-center mb-2"
                                >
                                    <div class="text-5xl font-bold text-black">
                                        {totalScore.toFixed(1)} / {caseData
                                            .osce_questions.length}
                                    </div>
                                    <div class="text-black text-lg">
                                        {Math.round(totalPercentage)}% correct
                                        {#if totalPercentage >= 80}
                                            🏆
                                        {:else if totalPercentage >= 60}
                                            👍
                                        {:else if totalPercentage >= 40}
                                            🤔
                                        {:else}
                                            📚
                                        {/if}
                                    </div>
                                </div>
                                <div
                                    class="w-full bg-gray-200 h-4 rounded-full"
                                >
                                    <div
                                        class="h-full bg-blue-500 rounded-full"
                                        style="width: {totalPercentage}%"
                                    ></div>
                                </div>
                            </div>

                            <!-- Score breakdown by question type -->
                            <div class="mt-6 text-left">
                                <!-- MCQ Questions -->
                                {#if mcqQuestions.length > 0}
                                    <div class="mb-8">
                                        <div
                                            class="flex justify-between items-center mb-1"
                                        >
                                            <h5
                                                class="font-medium text-black text-lg"
                                            >
                                                Multiple Choice Questions 🔍
                                            </h5>
                                            <div class="text-black font-medium">
                                                {mcqScore.toFixed(1)} / {mcqMaxScore}
                                                {#if mcqPercentage >= 80}
                                                    ✅
                                                {:else if mcqPercentage >= 40}
                                                    ⚠️
                                                {:else}
                                                    ❌
                                                {/if}
                                            </div>
                                        </div>
                                        <div
                                            class="w-full bg-gray-200 h-4 rounded-full"
                                        >
                                            <div
                                                class="h-full bg-blue-500 rounded-full"
                                                style="width: {mcqPercentage}%"
                                            ></div>
                                        </div>
                                    </div>
                                {/if}

                                <!-- Written Questions -->
                                {#if writtenQuestions.length > 0}
                                    <div class="mb-8">
                                        <div
                                            class="flex justify-between items-center mb-1"
                                        >
                                            <h5
                                                class="font-medium text-black text-lg"
                                            >
                                                Written Questions 📝
                                            </h5>
                                            <div class="text-black font-medium">
                                                {writtenScore.toFixed(1)} / {writtenMaxScore}
                                                {#if writtenPercentage >= 80}
                                                    ✅
                                                {:else if writtenPercentage >= 40}
                                                    ⚠️
                                                {:else}
                                                    ❌
                                                {/if}
                                            </div>
                                        </div>
                                        <div
                                            class="w-full bg-gray-200 h-4 rounded-full"
                                        >
                                            <div
                                                class="h-full bg-blue-500 rounded-full"
                                                style="width: {writtenPercentage}%"
                                            ></div>
                                        </div>
                                    </div>
                                {/if}

                                <!-- Image-Based Questions -->
                                {#if imageQuestions.length > 0}
                                    <div class="mb-8">
                                        <div
                                            class="flex justify-between items-center mb-1"
                                        >
                                            <h5
                                                class="font-medium text-black text-lg"
                                            >
                                                Image-Based Questions 🔬
                                            </h5>
                                            <div class="text-black font-medium">
                                                {imageScore.toFixed(1)} / {imageMaxScore}
                                                {#if imagePercentage >= 80}
                                                    ✅
                                                {:else if imagePercentage >= 40}
                                                    ⚠️
                                                {:else}
                                                    ❌
                                                {/if}
                                            </div>
                                        </div>
                                        <div
                                            class="w-full bg-gray-200 h-4 rounded-full"
                                        >
                                            <div
                                                class="h-full bg-blue-500 rounded-full"
                                                style="width: {imagePercentage}%"
                                            ></div>
                                        </div>
                                    </div>
                                {/if}
                            </div>

                            <!-- After the fun fact section -->
                            <div class="mt-4 flex flex-col space-y-3">
                                <!-- See what others scored button -->
                                <Button
                                    variant="outline"
                                    class="w-full bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200"
                                    onclick={(e) => {
                                        console.log("Compare button clicked!");
                                        e.preventDefault();
                                        showComparisonData();
                                    }}
                                    disabled={isLoadingComparison}
                                >
                                    {#if isLoadingComparison}
                                        <Loader2
                                            class="mr-2 h-4 w-4 animate-spin"
                                        />
                                        Loading...
                                    {:else}
                                        <BarChart class="mr-2 h-4 w-4" />
                                        See how you compare to others
                                    {/if}
                                </Button>

                                <!-- Debug information during development -->

                                <div class="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        onclick={returnToQuestions}
                                        class="w-full bg-green-100 text-green-700 border-green-200 hover:bg-green-200"
                                    >
                                        <RefreshCw class="mr-2 h-4 w-4" />
                                        Replay OSCE
                                    </Button>

                                    <!-- Go to Case Library button -->
                                    <Link to="/case-library">
                                        <Button
                                            variant="outline"
                                            onclick={closePopup}
                                            class="w-full bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                        >
                                            <Library class="mr-2 h-4 w-4" />
                                            Go to Case Library
                                        </Button>
                                    </Link>
                                </div>
                                <!-- Replay Case button -->
                            </div>
                        </div>
                    </div>
                {:else}
                    <!-- Question navigation -->
                    <div
                        class="bg-gray-200 p-2 flex items-center justify-between"
                    >
                        <div class="text-lg font-medium ml-4">
                            Question {currentQuestionIndex + 1} of {caseData
                                .osce_questions.length}
                        </div>
                    </div>

                    <!-- Question content -->
                    <div class="p-6 overflow-y-auto flex-grow">
                        {#if getCurrentQuestion()}
                            <div class="mb-6">
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
                                        <!-- Add explanation popover above the first option when explanation is shown -->
                                        {#if showExplanation}
                                            <div
                                                class="mb-3 flex justify-start"
                                            >
                                                <OSCEExplanationPopover
                                                    currentQuestion={getCurrentQuestion()}
                                                />
                                            </div>
                                        {/if}

                                        {#each Object.entries(getCurrentQuestion().options) as [key, text]}
                                            <div
                                                class="border rounded-lg p-4 transition-colors {showExplanation &&
                                                key ===
                                                    getCurrentQuestion()
                                                        .mcq_correct_answer_key
                                                    ? 'border-green-500 bg-green-50'
                                                    : showExplanation &&
                                                        selectedAnswer ===
                                                            key &&
                                                        key !==
                                                            getCurrentQuestion()
                                                                .mcq_correct_answer_key
                                                      ? 'border-red-500 bg-red-50'
                                                      : selectedAnswer === key
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-200'} {isQuestionAttempted(
                                                    currentQuestionIndex,
                                                )
                                                    ? 'cursor-not-allowed opacity-80'
                                                    : 'cursor-pointer'}"
                                                onclick={() => {
                                                    if (
                                                        !showExplanation &&
                                                        !isQuestionAttempted(
                                                            currentQuestionIndex,
                                                        )
                                                    ) {
                                                        selectedAnswer = key;
                                                    }
                                                }}
                                                onkeydown={(e) => {
                                                    if (
                                                        (e.key === "Enter" ||
                                                            e.key === " ") &&
                                                        !showExplanation &&
                                                        !isQuestionAttempted(
                                                            currentQuestionIndex,
                                                        )
                                                    ) {
                                                        selectedAnswer = key;
                                                    }
                                                }}
                                                tabindex={isQuestionAttempted(
                                                    currentQuestionIndex,
                                                )
                                                    ? -1
                                                    : 0}
                                                role="radio"
                                                aria-checked={selectedAnswer ===
                                                    key}
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
                                                            disabled={showExplanation ||
                                                                isQuestionAttempted(
                                                                    currentQuestionIndex,
                                                                )}
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
                                                                class="mt-2 text-sm font-semibold text-gray-900"
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
                                        <!-- Add explanation popover above the textarea when explanation is shown -->
                                        {#if showExplanation}
                                            <div
                                                class="mb-3 flex justify-start"
                                            >
                                                <OSCEExplanationPopover
                                                    currentQuestion={getCurrentQuestion()}
                                                />
                                            </div>
                                        {/if}

                                        <textarea
                                            class="w-full p-3 border border-gray-300 rounded-lg h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 {isQuestionAttempted(
                                                currentQuestionIndex,
                                            )
                                                ? 'opacity-80'
                                                : ''}"
                                            placeholder="Type your answer here..."
                                            value={writtenAnswer}
                                            oninput={(e) => {
                                                if (
                                                    !isQuestionAttempted(
                                                        currentQuestionIndex,
                                                    )
                                                ) {
                                                    const target =
                                                        e.target as HTMLTextAreaElement;
                                                    writtenAnswer =
                                                        target.value;
                                                }
                                            }}
                                            disabled={showExplanation ||
                                                isQuestionAttempted(
                                                    currentQuestionIndex,
                                                )}
                                        ></textarea>

                                        <!-- Show feedback first -->
                                        {#if showExplanation && feedbackResponse?.feedback}
                                            <div
                                                class="mt-4 p-4 rounded-lg {feedbackResponse
                                                    .feedback
                                                    .evaluation_result ===
                                                'Correct'
                                                    ? 'bg-green-50 border border-green-200'
                                                    : 'bg-amber-50 border border-amber-200'}"
                                            >
                                                <div class="flex items-center">
                                                    <span class="text-gray-700"
                                                        >{feedbackResponse
                                                            .feedback
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
                                                        <p
                                                            class="text-gray-800"
                                                        >
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
                                <div
                                    class="flex items-center justify-between mt-4"
                                >
                                    <div class="flex items-center space-x-3">
                                        <Button
                                            onclick={submitAnswer}
                                            disabled={showExplanation ||
                                                isSubmitting ||
                                                isQuestionAttempted(
                                                    currentQuestionIndex,
                                                ) ||
                                                (getCurrentQuestion()
                                                    .question_format ===
                                                    "MCQ" &&
                                                    !selectedAnswer) ||
                                                (getCurrentQuestion()
                                                    .question_format ===
                                                    "written" &&
                                                    !writtenAnswer)}
                                        >
                                            {#if isSubmitting}
                                                <Loader2
                                                    class="mr-2 h-4 w-4 animate-spin"
                                                />
                                                Submitting...
                                            {:else if isQuestionAttempted(currentQuestionIndex)}
                                                Already Submitted
                                            {:else}
                                                Submit Answer
                                            {/if}
                                        </Button>

                                        <!-- Add End Test button after all questions are answered -->
                                        {#if questionsAnswered === caseData.osce_questions.length && !showEndScreen}
                                            <Button
                                                variant="outline"
                                                onclick={showEndScreenManually}
                                                class="ml-2 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
                                            >
                                                View Results
                                            </Button>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <!-- Footer with progress indicator -->
                    <OSCEProgressIndicator
                        {currentQuestionIndex}
                        totalQuestions={caseData.osce_questions.length}
                        {questionScores}
                        {totalScore}
                        {questionsAnswered}
                        {isQuestionAttempted}
                        onQuestionSelect={handleQuestionSelect}
                        {prevQuestion}
                        {nextQuestion}
                    />
                {/if}
            {/key}
        </div>
    </div>
{/if}
