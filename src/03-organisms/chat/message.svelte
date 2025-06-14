<script lang="ts">
    import type {
        ExaminationResult,
        Message,
        TestResult,
        FeedbackResponse,
    } from "$lib/types/index";
    import { Avatar } from "$lib/components/ui/avatar";
    import User from "lucide-svelte/icons/user";
    import Bot from "lucide-svelte/icons/bot";
    import LoadingMessage from "$lib/components/LoadingMessage.svelte";
    import TestResultCard from "./chat-cards/test-result-card.svelte";
    import ExaminationCard from "./chat-cards/examination-card.svelte";
    import DiagnosisCard from "./chat-cards/diagnosis-card.svelte";
    import RelevantInfoCard from "./chat-cards/relevant-info-card.svelte";
    import FeedbackCard from "./chat-cards/feedback-card.svelte";
    import PreTreatmentCard from "./chat-cards/pre-treatment-card.svelte";
    import TreatmentProtocolCard from "./chat-cards/treatment-protocol-card.svelte";
    import FeedbackStepsCard from "./chat-cards/feedback-diagnosis-card.svelte";
    import FeedbackProtocolCard from "./chat-cards/feedback-treatment-protocol-card.svelte";
    import { onMount, onDestroy } from "svelte";
    import { createEventDispatcher } from "svelte";
    const { message } = $props<{ message: Message }>();

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

    const isStudent = $derived(message.sender === "student");

    function parseDiagnosisMessage(
        content: string,
        type: "initial" | "final" = "initial",
    ) {
        try {
            const diagnosisMatch = content.match(
                /(Primary|Final) Diagnosis: (.*?)\n/,
            );
            const justificationMatch = content.match(
                /Justification: ([\s\S]*?)(?=\nDifferential Diagnoses:|$)/,
            );
            const differentialMatch = content.match(
                /Differential Diagnoses: (.*?)$/,
            );

            return {
                primaryDiagnosis: {
                    text: diagnosisMatch?.[2] || "",
                    justification: justificationMatch?.[1] || "",
                },
                differentialDiagnoses:
                    type === "initial"
                        ? differentialMatch?.[1]
                              .split(",")
                              .map((d) => d.trim()) || []
                        : [],
            };
        } catch (error) {
            console.error("Error parsing diagnosis message:", error);
            return null;
        }
    }

    function parseRelevantInfo(content: string): string[] {
        try {
            // If content is already an array, return it
            if (Array.isArray(content)) return content;

            // If content is a string, split by newlines or commas
            return content
                .split(/[,\n]/)
                .map((point) => point.trim())
                .filter((point) => point.length > 0);
        } catch (error) {
            console.error("Error parsing relevant info:", error);
            return [];
        }
    }

    let relativeTimeString: string;
    let intervalId: ReturnType<typeof setInterval>;

    const dispatch = createEventDispatcher();

    onMount(() => {
        // Update immediately
        console.log("message-----", message);
        relativeTimeString = getRelativeTime(message.timestamp);

        // Then update every minute
        intervalId = setInterval(() => {
            relativeTimeString = getRelativeTime(message.timestamp);
        }, 60000); // Update every minute
    });

    onDestroy(() => {
        if (intervalId) clearInterval(intervalId);
    });

    // type MessageComponentProps = {
    //     diagnosis?: {
    //         primaryDiagnosis: { text: string; justification: string };
    //         differentialDiagnoses?: string[];
    //     };
    //     type?: "initial" | "final";
    //     relevantInfo?: string[];
    //     result?: TestResult | ExaminationResult;
    //     feedback?: FeedbackResponse;
    // };

    const messageTypeComponents = {
        loading: () => LoadingMessage,
        diagnosis: (msg: Message) => {
            const diagnosisData = parseDiagnosisMessage(
                msg.content as string,
                "initial",
            );
            return diagnosisData ? DiagnosisCard : null;
        },
        "final-diagnosis": (msg: Message) => {
            const diagnosisData = parseDiagnosisMessage(
                msg.content as string,
                "final",
            );
            return diagnosisData ? DiagnosisCard : null;
        },
        "relevant-info": () => RelevantInfoCard,
        "test-result": () => TestResultCard,
        examination: () => ExaminationCard,
        feedback: () => FeedbackCard,
        "pre-treatment": () => PreTreatmentCard,
        "treatment-protocol": () => TreatmentProtocolCard,
        "feedback-steps": () => FeedbackStepsCard,
        "feedback-protocol": () => FeedbackProtocolCard,
    } as const;

    function getComponentProps(msg: Message) {
        switch (msg.type) {
            case "diagnosis":
            case "final-diagnosis": {
                const diagnosisType =
                    msg.type === "final-diagnosis" ? "final" : "initial";
                const diagnosisData = parseDiagnosisMessage(
                    msg.content as string,
                    diagnosisType,
                );
                if (!diagnosisData) return null;
                return {
                    diagnosis: diagnosisData,
                    type: diagnosisType,
                };
            }
            case "relevant-info":
                return {
                    relevantInfo: parseRelevantInfo(msg.content as string),
                };
            case "test-result":
                return {
                    result: msg.content as TestResult,
                };
            case "examination":
                return {
                    result: msg.content as ExaminationResult,
                };
            case "feedback":
                return {
                    feedback: msg.content as FeedbackResponse,
                };
            case "pre-treatment":
                return {
                    pretreatment: JSON.parse(msg.content as string),
                };
            case "treatment-protocol":
                return {
                    treatment: JSON.parse(msg.content as string),
                };
            case "feedback-steps":
                return {
                    historyFeedback: msg.content.historyFeedback,
                    aetcomFeedback: msg.content.aetcomFeedback,
                    diagnosisFeedback: msg.content.diagnosisFeedback,
                };
            case "feedback-protocol":
                return {
                    feedback: msg.content,
                };
            default:
                return {};
        }
    }
</script>

<div
    class="flex items-start gap-3 {isStudent ? 'justify-end' : 'justify-start'}"
>
    {#if message.content || message.type === "loading" || message.type === "image"}
        {#if !isStudent}
            <Avatar class="h-8 w-8 mt-1">
                <div
                    class="rounded-full bg-secondary w-full h-full flex items-center justify-center"
                >
                    <Bot class="h-4 w-4" />
                </div>
            </Avatar>
        {/if}

        <div
            class={message.type === "feedback-steps" ||
            message.type === "feedback-protocol"
                ? "w-full"
                : "max-w-[80%]"}
        >
            {#if message.type === "image"}
                <div
                    class="bg-card w-[400px] rounded-lg overflow-hidden flex justify-start items-start flex-row shadow-sm border"
                >
                    <img
                        src={message.imageUrl}
                        alt={message.title}
                        class=" h-32 object-contain"
                    />
                    <div class="p-4">
                        <h3 class="font-medium text-md mb-1">
                            "{message.content}"
                        </h3>

                        <div class="flex items-center gap-2 mt-2">
                            <span class="text-sm text-muted-foreground"
                                >You may ask the patient questions about their
                                condition</span
                            >
                        </div>
                    </div>
                </div>
            {:else if message.type in messageTypeComponents}
                {@const MessageComponent =
                    messageTypeComponents[
                        message.type as keyof typeof messageTypeComponents
                    ](message)}
                {#key message.type}
                    <!-- @ts-ignore  fix the type error -->
                    <MessageComponent
                        {...getComponentProps(message) as any}
                        on:messageAction={(e) =>
                            dispatch("messageAction", e.detail)}
                    />
                {/key}
            {:else}
                <div
                    class="bg-card rounded-lg p-4 shadow-sm border {isStudent
                        ? ' bg-primary/70 text-primary-foreground'
                        : ''}"
                >
                    <div class="flex items-center gap-2 mb-1">
                        <!-- <span class="font-medium">{message.sender}</span> -->
                        <!-- <span
                            class="text-xs {isStudent
                                ? 'text-primary-foreground/70'
                                : 'text-muted-foreground'}"
                            >{getRelativeTime(message.timestamp)}</span
                        > -->
                    </div>
                    <p class="text-sm">{message.content}</p>
                </div>
            {/if}
        </div>
    {/if}

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

<style>
    /* Component styles */
</style>
