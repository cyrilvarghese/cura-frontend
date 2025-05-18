<script lang="ts">
    import historyMatchStore, {
        unmatchedQuestionsStore,
    } from "$lib/stores/historyMatchStore";
    import { slide } from "svelte/transition";
    import { apiStore, sendMessage } from "$lib/stores/apiStore";

    // Number of conversation starters to show
    const MAX_STARTERS = 5;

    // Define allowed domains for conversation starters
    const allowedDomains = [
        "associated_symptoms",
        "past_medical_history",
        "chief_complaint",
    ];

    // Get unmatched questions
    let unmatchedQuestions = $derived($unmatchedQuestionsStore || []);

    // Track which starters have been clicked/used - using array for direct reactivity
    let visibleStarters = $state<string[]>([]);
    let initialized = $state(false);

    // Initialize with some default conversation starters
    let initialStarters = $state<string[]>([
        "How are you doing?",
        "What brings you here?",
    ]);

    $effect(() => {
        console.log("unmatchedQuestions", unmatchedQuestions);
        if (!initialized) {
            if (unmatchedQuestions.length > 0) {
                // Filter questions to only include allowed domains
                const filteredQuestions = unmatchedQuestions.filter((q) =>
                    allowedDomains.includes(q.domain),
                );

                // Group questions by domain
                const questionsByDomain: { [key: string]: string[] } = {};
                filteredQuestions.forEach((q) => {
                    const domain = q.domain || "unknown";
                    if (!questionsByDomain[domain]) {
                        questionsByDomain[domain] = [];
                    }
                    questionsByDomain[domain].push(q.question);
                });

                // Take one question from each domain, up to MAX_STARTERS
                const starters = [...visibleStarters];
                for (const domain in questionsByDomain) {
                    if (starters.length < MAX_STARTERS) {
                        starters.push(questionsByDomain[domain][0]);
                    } else {
                        break;
                    }
                }

                visibleStarters = starters;
                initialized = true;
            } else {
                // Use initial starters if no unmatched questions are available
                visibleStarters = [...initialStarters];
            }
        }
    });

    // Function to handle clicking on a conversation starter
    function handleStarterClick(starter: string) {
        // Send the selected question to the chat
        sendMessage(starter, "student", "patient_history", "text");

        // Remove this starter from visible starters
        visibleStarters = visibleStarters.filter((s) => s !== starter);
    }
</script>

{#if visibleStarters.length > 0}
    <div
        transition:slide|local
        class="mt-4 mb-2 absolute bottom-2"
        id="conversation-starters"
    >
        <div class="flex flex-wrap gap-2">
            {#each visibleStarters as starter}
                <button
                    onclick={() => handleStarterClick(starter)}
                    class="w-[150px] px-3 py-1.5 bg-muted hover:bg-muted/80 hover:bg-primary-foreground text-sm rounded-full
                          border border-muted-foreground/20 transition-colors text-foreground
                          hover:text-primary hover:border-primary/80 cursor-pointer
                          overflow-hidden whitespace-nowrap"
                    title={starter}
                >
                    <span class="block truncate">{starter}</span>
                </button>
            {/each}
        </div>
    </div>
{/if}
