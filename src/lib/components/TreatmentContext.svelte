<script lang="ts">
    import type { TreatmentContextResponse } from "$lib/services/treatmentContextService";
    import { Button } from "$lib/components/ui/button";
    import {
        Edit,
        MoreVertical,
        Pencil,
        PlusCircle,
        User,
        Pill,
        PlusSquare,
        HeartPulse,
        Stethoscope,
        ClipboardList,
        Timer,
        AlertCircle,
        Microscope,
        Flame,
        Ban,
        FileText,
        Link,
    } from "lucide-svelte";

    export let treatmentContext: TreatmentContextResponse;
</script>

<div class="space-y-8 max-w-4xl mx-auto">
    <h2
        class="text-2xl font-bold text-gray-800 dark:text-gray-100 border-b pb-2 border-gray-200 dark:border-gray-700 flex items-center gap-2"
    >
        <Stethoscope class="h-6 w-6 text-primary" />
        Treatment Context
    </h2>

    <!-- Patient Summary -->
    <div
        class="mb-8 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <div
            class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
        >
            <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-2"
            >
                <User class="h-5 w-5" />
                Patient Summary
            </h3>
        </div>
        <div class="p-5">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500 mb-1">Age</p>
                    <p class="font-medium">
                        {treatmentContext.content.patient_summary.age}
                    </p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Gender</p>
                    <p class="font-medium">
                        {treatmentContext.content.patient_summary.gender}
                    </p>
                </div>
                <div class="col-span-2">
                    <p class="text-sm text-gray-500 mb-1">Diagnosis</p>
                    <p class="font-medium">
                        {treatmentContext.content.patient_summary.diagnosis}
                    </p>
                </div>
            </div>
            <div
                class="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-600 rounded-r-lg shadow-sm"
            >
                <p
                    class="text-base font-medium text-red-700 dark:text-red-300 mb-3 flex items-center gap-2"
                >
                    <AlertCircle
                        class="h-5 w-5 text-red-600 dark:text-red-400"
                    />
                    Critical Factors
                </p>
                <ul class="list-disc pl-6 space-y-2">
                    {#each treatmentContext.content.patient_summary.critical_factors as factor}
                        <li
                            class="text-gray-800 dark:text-gray-100 font-medium"
                        >
                            {factor}
                        </li>
                    {/each}
                </ul>
            </div>
        </div>
    </div>

    <!-- Pre-treatment Investigations -->
    <div
        class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <div
            class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
        >
            <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-2"
            >
                <Microscope class="h-5 w-5" />
                Pre-treatment Investigations
            </h3>
        </div>
        <div class="p-5 space-y-4">
            {#each treatmentContext.content.pre_treatment_investigations as investigation}
                <div
                    class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                >
                    <h4
                        class="font-medium text-lg mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                        <ClipboardList class="h-4 w-4 text-gray-500" />
                        {investigation.test_name}
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-500 mb-1">Purpose</p>
                            <p class="text-gray-700 dark:text-gray-200">
                                {investigation.purpose}
                            </p>
                        </div>
                        <div>
                            <p
                                class="text-sm text-gray-500 mb-1 flex items-center gap-1"
                            >
                                <Pill class="h-4 w-4 text-gray-500" />
                                Relevant Drugs
                            </p>
                            <div class="flex flex-wrap gap-1">
                                {#each investigation.relevant_drugs as drug}
                                    <span
                                        class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                                    >
                                        {drug}
                                    </span>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        </div>
    </div>

    <!-- Monitoring During Treatment -->
    <div
        class=" bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <div
            class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
        >
            <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-2"
            >
                <HeartPulse class="h-5 w-5" />
                Monitoring During Treatment
            </h3>
        </div>
        <div class="p-5 overflow-x-auto">
            <table
                class="w-full bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
            >
                <thead class="bg-gray-50 dark:bg-gray-700">
                    <tr>
                        <th
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >Parameter</th
                        >
                        <th
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >Timing</th
                        >
                        <th
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >Purpose</th
                        >
                        <th
                            class="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                            >Drugs</th
                        >
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
                    {#each treatmentContext.content.monitoring_during_treatment as monitoring}
                        <tr>
                            <td
                                class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
                            >
                                {monitoring.parameter_to_monitor}
                            </td>
                            <td
                                class="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1"
                            >
                                <Timer class="h-4 w-4 text-gray-500" />
                                {monitoring.frequency_timing}
                            </td>
                            <td
                                class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                            >
                                {monitoring.purpose}
                            </td>
                            <td
                                class="px-4 py-3 text-sm text-gray-700 dark:text-gray-300"
                            >
                                <div class="flex flex-wrap gap-1">
                                    {#each monitoring.relevant_drugs as drug}
                                        <span
                                            class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                                        >
                                            {drug}
                                        </span>
                                    {/each}
                                </div>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Treatment Plan -->
    <div class="mb-8">
        <div
            class=" dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
            <div
                class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
            >
                <h3
                    class="text-lg font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-2"
                >
                    <ClipboardList class="h-5 w-5" />
                    Treatment Plan
                </h3>
            </div>
            <div class="p-5">
                <!-- First Line -->
                <div class="mb-10">
                    <h4
                        class="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                        <PlusSquare class="h-5 w-5" />
                        First Line
                    </h4>
                    <div class="space-y-3">
                        {#each treatmentContext.content.treatment_plan.first_line as treatment}
                            <div
                                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border border-gray-500 dark:border-gray-500 dark:border-l-4 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div class="p-4">
                                    <div
                                        class="flex flex-row items-center justify-between"
                                    >
                                        <div
                                            class="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold text-lg"
                                        >
                                            <Link
                                                class="h-5 w-5 text-gray-700"
                                            />
                                            {treatment.drug_name}
                                        </div>
                                        <div
                                            class="text-gray-600 dark:text-gray-300"
                                        >
                                            {treatment.details}
                                        </div>
                                    </div>
                                    {#if treatment.rationale}
                                        <div class="mt-2 text-sm text-gray-500">
                                            <span class="font-medium"
                                                >Rationale:</span
                                            >
                                            {treatment.rationale}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Escalation -->
                <div class="mb-10">
                    <h4
                        class="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300 flex items-center gap-2"
                    >
                        <Flame class="h-5 w-5" />
                        Escalation Therapy
                    </h4>
                    <div class="space-y-3">
                        {#each treatmentContext.content.treatment_plan.escalation as treatment}
                            <div
                                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border border-gray-500 dark:border-gray-500 dark:border-l-4 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div class="p-4">
                                    <div
                                        class="flex flex-row items-center justify-between"
                                    >
                                        <div
                                            class="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold text-lg"
                                        >
                                            <Link
                                                class="h-5 w-5 text-gray-500"
                                            />
                                            {treatment.drug_name}
                                        </div>
                                        <div
                                            class="text-gray-600 dark:text-gray-300"
                                        >
                                            {treatment.details}
                                        </div>
                                    </div>
                                    {#if treatment.rationale}
                                        <div class="mt-2 text-sm text-gray-500">
                                            <span class="font-medium"
                                                >Rationale:</span
                                            >
                                            {treatment.rationale}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>

                <!-- Contraindicated -->
                <div class="mb-10">
                    <h4
                        class="text-lg font-medium mb-3 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                        <Ban class="h-5 w-5" />
                        Contraindicated
                    </h4>
                    <div class="space-y-3">
                        {#each treatmentContext.content.treatment_plan.contraindicated as treatment}
                            <div
                                class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border-l-4 border border-red-400 dark:border-red-500 dark:border-l-4 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div class="p-4">
                                    <div
                                        class="flex flex-row items-center justify-between"
                                    >
                                        <div
                                            class="flex items-center gap-2 text-red-700 dark:text-red-300 font-semibold text-lg"
                                        >
                                            <Link
                                                class="h-5 w-5 text-red-500"
                                            />
                                            {treatment.drug_name}
                                        </div>
                                        <div
                                            class="text-gray-600 dark:text-gray-300"
                                        >
                                            {treatment.details}
                                        </div>
                                    </div>
                                    {#if treatment.rationale}
                                        <div class="mt-2 text-sm text-gray-500">
                                            <span class="font-medium"
                                                >Rationale:</span
                                            >
                                            {treatment.rationale}
                                        </div>
                                    {/if}
                                </div>
                            </div>
                        {/each}
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Additional Notes -->
    <div
        class="bg-gray-50 dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
        <div
            class="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600"
        >
            <h3
                class="text-lg font-semibold text-gray-800 dark:text-gray-300 flex items-center gap-2"
            >
                <FileText class="h-5 w-5" />
                Additional Notes
            </h3>
        </div>
        <div class="p-5">
            <ul class="list-disc pl-5 space-y-2">
                {#each treatmentContext.content.additional_notes as note}
                    <li class="text-gray-700 dark:text-gray-200">
                        {note}
                    </li>
                {/each}
            </ul>
        </div>
    </div>
</div>
