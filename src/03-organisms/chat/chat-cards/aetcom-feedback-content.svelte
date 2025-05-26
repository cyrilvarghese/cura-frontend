<script lang="ts">
    type AETCOMFeedback = {
        feedback_result: {
            aetcom_evaluation: {
                communication: {
                    performance_level: string;
                    feedback: string;
                };
                empathy_patient_centeredness: {
                    performance_level: string;
                    feedback: string;
                };
                professionalism_ethics: {
                    performance_level: string;
                    feedback: string;
                };
                information_gathering: {
                    performance_level: string;
                    feedback: string;
                };
            };
        };
    };

    export let feedback: AETCOMFeedback;

    function splitFeedback(text: string) {
        if (text.includes("Action:")) {
            const [feedback, action] = text.split("Action:");
            return { feedback: feedback.trim(), action: action.trim() };
        }
        return { feedback: text, action: null };
    }

    $: commFeedback = splitFeedback(
        feedback.feedback_result.aetcom_evaluation.communication.feedback,
    );
    $: empathyFeedback = splitFeedback(
        feedback.feedback_result.aetcom_evaluation.empathy_patient_centeredness
            .feedback,
    );
    $: profFeedback = splitFeedback(
        feedback.feedback_result.aetcom_evaluation.professionalism_ethics
            .feedback,
    );
    $: infoFeedback = splitFeedback(
        feedback.feedback_result.aetcom_evaluation.information_gathering
            .feedback,
    );
</script>

<div class="flex flex-wrap gap-8 gap-y-8 justify-start px-2">
    <!-- Communication -->
    <div
        class="bg-gray-50 p-3 rounded-md w-full max-w-full md:w-[320px] shadow flex flex-col items-start"
    >
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">💬</span>
            Communication
        </h4>
        <span
            class={`text-xs px-2 py-0.5 rounded mb-2 ${
                feedback.feedback_result.aetcom_evaluation.communication
                    .performance_level === "Satisfactory"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
        >
            {feedback.feedback_result.aetcom_evaluation.communication
                .performance_level}
        </span>
        <p class="text-sm text-left">{commFeedback.feedback}</p>
        {#if commFeedback.action}
            <div class="mt-2 pl-4 border-l-2 border-blue-200">
                <p class="text-sm text-blue-700 font-medium mb-1">
                    Suggested action:
                </p>
                <p class="text-sm italic text-gray-700">
                    {commFeedback.action}
                </p>
            </div>
        {/if}
    </div>

    <!-- Empathy -->
    <div
        class="bg-gray-50 p-3 rounded-md w-full max-w-full md:w-[320px] shadow flex flex-col items-start"
    >
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">❤️</span>
            Empathy & Patient-Centeredness
        </h4>
        <span
            class={`text-xs px-2 py-0.5 rounded mb-2 ${
                feedback.feedback_result.aetcom_evaluation
                    .empathy_patient_centeredness.performance_level ===
                "Satisfactory"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
        >
            {feedback.feedback_result.aetcom_evaluation
                .empathy_patient_centeredness.performance_level}
        </span>
        <p class="text-sm text-left">{empathyFeedback.feedback}</p>
        {#if empathyFeedback.action}
            <div class="mt-2 pl-4 border-l-2 border-blue-200">
                <p class="text-sm text-blue-700 font-medium mb-1">
                    Suggested action:
                </p>
                <p class="text-sm italic text-gray-700">
                    {empathyFeedback.action}
                </p>
            </div>
        {/if}
    </div>

    <!-- Professionalism -->
    <div
        class="bg-gray-50 p-3 rounded-md w-full max-w-full md:w-[320px] shadow flex flex-col items-start"
    >
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">👨‍⚕️</span>
            Professionalism & Ethics
        </h4>
        <span
            class={`text-xs px-2 py-0.5 rounded mb-2 ${
                feedback.feedback_result.aetcom_evaluation
                    .professionalism_ethics.performance_level === "Satisfactory"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
        >
            {feedback.feedback_result.aetcom_evaluation.professionalism_ethics
                .performance_level}
        </span>
        <p class="text-sm text-left">{profFeedback.feedback}</p>
        {#if profFeedback.action}
            <div class="mt-2 pl-4 border-l-2 border-blue-200">
                <p class="text-sm text-blue-700 font-medium mb-1">
                    Suggested action:
                </p>
                <p class="text-sm italic text-gray-700">
                    {profFeedback.action}
                </p>
            </div>
        {/if}
    </div>

    <!-- Information Gathering -->
    <div
        class="bg-gray-50 p-3 rounded-md w-full max-w-full md:w-[320px] shadow flex flex-col items-start"
    >
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">📝</span>
            Information Gathering
        </h4>
        <span
            class={`text-xs px-2 py-0.5 rounded mb-2 ${
                feedback.feedback_result.aetcom_evaluation.information_gathering
                    .performance_level === "Satisfactory"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
            }`}
        >
            {feedback.feedback_result.aetcom_evaluation.information_gathering
                .performance_level}
        </span>
        <p class="text-sm text-left">{infoFeedback.feedback}</p>
        {#if infoFeedback.action}
            <div class="mt-2 pl-4 border-l-2 border-blue-200">
                <p class="text-sm text-blue-700 font-medium mb-1">
                    Suggested action:
                </p>
                <p class="text-sm italic text-gray-700">
                    {infoFeedback.action}
                </p>
            </div>
        {/if}
    </div>
</div>
