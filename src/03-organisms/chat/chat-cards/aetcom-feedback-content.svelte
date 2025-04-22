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
</script>

<div class="p-4 space-y-4">
    <!-- Communication -->
    <div class="bg-gray-50 p-3 rounded-md">
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">💬</span>
            Communication
            <span
                class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800"
            >
                {feedback.feedback_result.aetcom_evaluation.communication
                    .performance_level}
            </span>
        </h4>
        <p class="text-sm">
            {feedback.feedback_result.aetcom_evaluation.communication.feedback}
        </p>
    </div>

    <!-- Empathy -->
    <div class="bg-gray-50 p-3 rounded-md">
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">❤️</span>
            Empathy & Patient-Centeredness
            <span
                class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800"
            >
                {feedback.feedback_result.aetcom_evaluation
                    .empathy_patient_centeredness.performance_level}
            </span>
        </h4>
        <p class="text-sm">
            {feedback.feedback_result.aetcom_evaluation
                .empathy_patient_centeredness.feedback}
        </p>
    </div>

    <!-- Professionalism -->
    <div class="bg-gray-50 p-3 rounded-md">
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">👨‍⚕️</span>
            Professionalism & Ethics
            <span
                class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800"
            >
                {feedback.feedback_result.aetcom_evaluation
                    .professionalism_ethics.performance_level}
            </span>
        </h4>
        <p class="text-sm">
            {feedback.feedback_result.aetcom_evaluation.professionalism_ethics
                .feedback}
        </p>
    </div>

    <!-- Information Gathering -->
    <div class="bg-gray-50 p-3 rounded-md">
        <h4 class="font-medium text-sm mb-1 flex items-center gap-2">
            <span class="text-base">📝</span>
            Information Gathering
            <span
                class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-800"
            >
                {feedback.feedback_result.aetcom_evaluation
                    .information_gathering.performance_level}
            </span>
        </h4>
        <p class="text-sm">
            {feedback.feedback_result.aetcom_evaluation.information_gathering
                .feedback}
        </p>
    </div>
</div>
