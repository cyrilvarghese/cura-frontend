<script lang="ts">
  import DiagnosisCard from "../chat-cards/diagnosis-card.svelte";
  
  let { content, type } = $props<{
    content: string;
    type: "diagnosis" | "final-diagnosis";
  }>();

  function parseDiagnosisMessage(content: string, type: "initial" | "final" = "initial") {
    try {
      const diagnosisMatch = content.match(/(Primary|Final) Diagnosis: (.*?)\n/);
      const justificationMatch = content.match(/Justification: (.*?)\n/);
      const differentialMatch = content.match(/Differential Diagnoses: (.*?)$/);

      return {
        primaryDiagnosis: {
          text: diagnosisMatch?.[2] || "",
          justification: justificationMatch?.[1] || "",
        },
        differentialDiagnoses:
          type === "initial"
            ? differentialMatch?.[1].split(",").map((d) => d.trim()) || []
            : [],
      };
    } catch (error) {
      console.error("Error parsing diagnosis message:", error);
      return null;
    }
  }

  const diagnosisType = $derived(type === "final-diagnosis" ? "final" : "initial");
  const diagnosisData = $derived(parseDiagnosisMessage(content, diagnosisType));
</script>

{#if diagnosisData}
  <DiagnosisCard diagnosis={diagnosisData} type={diagnosisType} />
{:else}
  <div class="bg-card rounded-lg p-4 shadow-sm border">
    <p class="text-sm">{content}</p>
  </div>
{/if} 