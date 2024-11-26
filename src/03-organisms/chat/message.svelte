<script lang="ts">
    import type { ExaminationResult, Message, TestResult } from "$lib/types";
    import { statusColors } from "$lib/types";
    import { Avatar } from "$lib/components/ui/avatar";
    import * as Card from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import User from "lucide-svelte/icons/user";
    import Bot from "lucide-svelte/icons/bot";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import TestResultCard from "./test-result-card.svelte";
    import ExaminationCard from "./examination-card.svelte";
    import DiagnosisCard from "./diagnosis-card.svelte";

    export let message: Message;

    function getRelativeTime(date: Date): string {
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60),
        );

        if (diffInMinutes < 1) return "just now";
        if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} hours ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays} days ago`;
    }

    $: isStudent = message.sender === "student";

    function parseDiagnosisMessage(content: string) {
        try {
            const primaryMatch = content.match(/Primary Diagnosis: (.*?)\n/);
            const justificationMatch = content.match(/Justification: (.*?)\n/);
            const differentialMatch = content.match(/Differential Diagnoses: (.*?)$/);

            return {
                primaryDiagnosis: {
                    text: primaryMatch?.[1] || "",
                    justification: justificationMatch?.[1] || ""
                },
                differentialDiagnoses: differentialMatch?.[1].split(',').map(d => d.trim()) || []
            };
        } catch (error) {
            console.error('Error parsing diagnosis message:', error);
            return null;
        }
    }
</script>

<div
    class="flex items-start gap-3 {isStudent ? 'justify-end' : 'justify-start'}"
>   
    {#if !isStudent}
        <Avatar class="h-8 w-8 mt-1">
            <div
                class="rounded-full bg-secondary w-full h-full flex items-center justify-center"
            >
                <Bot class="h-4 w-4" />
            </div>
        </Avatar>
    {/if}

    <div class="max-w-[80%]">
        {#if message.type === "loading"}
            <LoadingMessage />
        {:else if message.type === "diagnosis"}
            {@const diagnosisData = parseDiagnosisMessage(message.content as string)}
            {#if diagnosisData}
                <DiagnosisCard diagnosis={diagnosisData} />
            {:else}
                <div class="bg-card rounded-lg p-4 shadow-sm border">
                    <p class="text-sm">{message.content}</p>
                </div>
            {/if}
        {:else if message.type === "image"}
            <div class="bg-card rounded-lg overflow-hidden shadow-sm border">
                <img
                    src={message.imageUrl}
                    alt={message.title}
                    class="w-full h-64 object-cover"
                />
                <div class="p-4">
                    <h3 class="font-medium text-lg mb-1">{message.title}</h3>
                    {#if message.content}
                        <p class="text-sm text-muted-foreground">
                            {message.content}
                        </p>
                    {/if}
                    <div class="flex items-center gap-2 mt-2">
                        <span class="text-xs text-muted-foreground"
                            >{getRelativeTime(message.timestamp)}</span
                        >
                    </div>
                </div>
            </div>
        {:else if message.type === "test-result" && typeof message.content !== "string"}
            <TestResultCard result={message.content as TestResult} />
        {:else if message.type === "examination" && typeof message.content !== "string"}
            <ExaminationCard result={message.content as ExaminationResult} />
        {:else}
            <div
                class="bg-card rounded-lg p-4 shadow-sm border {isStudent
                    ? ' bg-primary/70 text-primary-foreground'
                    : ''}"
            >
                <div class="flex items-center gap-2 mb-1">
                    <span class="font-medium">@{message.sender}</span>
                    <span
                        class="text-xs {isStudent
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'}"
                        >{getRelativeTime(message.timestamp)}</span
                    >
                </div>
                <p class="text-sm">{message.content}</p>
            </div>
        {/if}
    </div>

    {#if isStudent}
        <Avatar class="h-8 w-8 mt-1">
            <div
                class="rounded-full bg-secondary w-full h-full flex items-center justify-center"
            >
                <User class="h-4 w-4" />
            </div>
        </Avatar>
    {/if}
</div>
