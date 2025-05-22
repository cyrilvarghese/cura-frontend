<script>
    import PrimaryDiagnosisCard from "./PrimaryDiagnosisCard.svelte";
    import DifferentialDiagnosisCard from "./DifferentialDiagnosisCard.svelte";
    import EducationalResourcesCard from "./EducationalResourcesCard.svelte";
</script>

<section class="pt-4 pb-8">
    <!-- Three-column layout on large screens, single column on mobile -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
            <PrimaryDiagnosisCard />
        </div>
        <div>
            <DifferentialDiagnosisCard />
        </div>
        <div>
            <EducationalResourcesCard />
        </div>
    </div>
</section>

<!-- Alternative Two-column mixed layout option -->
<section class="pt-8 pb-8">
    <h2 class="text-xl font-bold mb-4 text-gray-800">Alternative Layout</h2>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Primary diagnosis takes full width on small screens, one column on large -->
        <div class="lg:col-span-1">
            <PrimaryDiagnosisCard />
        </div>

        <!-- These two cards stack vertically on one column on large screens -->
        <div class="lg:col-span-2 space-y-6">
            <DifferentialDiagnosisCard />
            <EducationalResourcesCard />
        </div>
    </div>
</section>
