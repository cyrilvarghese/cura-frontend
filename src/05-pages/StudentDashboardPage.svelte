<script lang="ts">
    import { onMount } from "svelte";
    import PageLayout from "../04-templates/page-layout.svelte";
    import { authStore } from "$lib/stores/authStore";
    import { Link } from "svelte-routing";
    import {
        Card,
        CardContent,
        CardDescription,
        CardFooter,
        CardHeader,
        CardTitle,
    } from "$lib/components/ui/card";
    import { Badge } from "$lib/components/ui/badge";
    import { Button } from "$lib/components/ui/button";
    import { Progress } from "$lib/components/ui/progress";
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from "$lib/components/ui/table";
    import {
        BookOpenText,
        Brain,
        ChevronRight,
        FileText,
        HelpCircle,
        Search,
        TimerIcon,
        Trophy,
        Users2,
        History,
        Zap,
        XCircle,
        CheckCircle2,
        AlertCircle,
        MessageSquare,
        Users,
    } from "lucide-svelte";

    // Use authenticated user data instead of mock data
    $: student = {
        name: $authStore.user?.username || "Student",
        id: $authStore.user?.id || "Unknown ID",
        year: 3, // This could be stored in user data if available
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${$authStore.user?.username || "Student"}`,
    };

    // Mock department data with pending assignments
    const departments = [
        {
            id: 1,
            name: "Cardiology",
            color: "bg-red-200",
            pendingCases: 2,
            totalCases: 5,
            urgency: "due-soon",
            nextDeadline: "2 days left",
            progress: 60,
            percentileRank: 72,
        },
        {
            id: 2,
            name: "Dermatology",
            color: "bg-teal-200",
            pendingCases: 1,
            totalCases: 4,
            urgency: "safe",
            nextDeadline: "5 days left",
            progress: 75,
            percentileRank: 68,
        },
        {
            id: 3,
            name: "Neurology",
            color: "bg-amber-200",
            pendingCases: 3,
            totalCases: 6,
            urgency: "overdue",
            nextDeadline: "Overdue by 1 day",
            progress: 50,
            percentileRank: 55,
        },
        {
            id: 4,
            name: "Gastroenterology",
            color: "bg-purple-200",
            pendingCases: 0,
            totalCases: 3,
            urgency: "completed",
            nextDeadline: "All completed",
            progress: 100,
            percentileRank: 89,
        },
    ];

    // Mock performance data
    const performanceData = {
        averageScore: 76,
        scoreChange: "+5.2",
        trend: "improving",
        mostMissedCompetencies: [
            {
                code: "DR9.3",
                name: "Interpretation of diagnostic tests",
                count: 5,
            },
            { code: "CS2.1", name: "Patient interview techniques", count: 3 },
            {
                code: "KM4.2",
                name: "Pathophysiology of GI disorders",
                count: 2,
            },
        ],
    };

    // Mock next case data
    const nextCase = {
        id: "C-1032",
        title: "58yr Male with Acute Chest Pain",
        department: "Cardiology",
        deadline: "March 15, 2023 (2 days left)",
        tags: ["ECG Interpretation", "Cardiac Emergencies"],
        progress: 35,
    };

    // Mock recent activities
    const recentActivities = [
        {
            type: "case-completed",
            title: "Completed: Pediatric Respiratory Distress",
            department: "Pediatrics",
            timestamp: "Today, 10:23 AM",
            score: 82,
        },
        {
            type: "concept-viewed",
            title: "Viewed: ACE Inhibitors Mechanism of Action",
            category: "Pharmacology",
            timestamp: "Yesterday, 3:45 PM",
        },
        {
            type: "case-started",
            title: "Started: 58yr Male with Acute Chest Pain",
            department: "Cardiology",
            timestamp: "Yesterday, 2:12 PM",
            progress: 35,
        },
        {
            type: "concept-viewed",
            title: "Viewed: 12-Lead ECG Interpretation Guide",
            category: "Diagnostics",
            timestamp: "Yesterday, 1:30 PM",
        },
    ];

    // Mock learning trail - recently explored concepts
    const learningTrail = [
        {
            name: "ACE Inhibitors",
            type: "drug",
            timestamp: "2h ago",
            category: "Pharmacology",
        },
        {
            name: "12-Lead ECG Interpretation",
            type: "diagnostic",
            timestamp: "Yesterday",
            category: "Cardiology",
        },
        {
            name: "Pulmonary Auscultation",
            type: "skill",
            timestamp: "2 days ago",
            category: "Physical Examination",
        },
        {
            name: "Kawasaki Disease",
            type: "condition",
            timestamp: "3 days ago",
            category: "Pediatrics",
        },
        {
            name: "Complete Blood Count",
            type: "laboratory",
            timestamp: "3 days ago",
            category: "Diagnostics",
        },
    ];

    // Mock most-missed concepts by peers
    const peerMissedConcepts = [
        { name: "Cardiac Enzyme Interpretation", count: 42, percentage: 65 },
        { name: "Skin Lesion Classification", count: 38, percentage: 59 },
        { name: "Cranial Nerve Assessment", count: 35, percentage: 54 },
        { name: "Respiratory Distress Triage", count: 31, percentage: 48 },
        { name: "Abdominal Pain Localization", count: 27, percentage: 42 },
    ];

    function getUrgencyClass(urgency: string) {
        switch (urgency) {
            case "overdue":
                return "bg-red-100 text-red-800";
            case "due-soon":
                return "bg-orange-100 text-orange-800";
            case "safe":
                return "bg-green-100 text-green-800";
            case "completed":
                return "bg-blue-100 text-blue-700";
            default:
                return "bg-gray-100 text-gray-800";
        }
    }

    function getUrgencyIcon(urgency: string) {
        switch (urgency) {
            case "overdue":
                return XCircle;
            case "due-soon":
                return AlertCircle;
            case "safe":
                return TimerIcon;
            case "completed":
                return CheckCircle2;
            default:
                return TimerIcon;
        }
    }
</script>

<PageLayout breadcrumbs={[{ label: "Home", href: "/" }]}>
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Dashboard</h1>
        <div class="relative">
            <Search
                class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4"
            />
            <input
                type="search"
                placeholder="Search cases or concepts..."
                class="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
        </div>
    </div>

    <!-- Welcome section with summary metrics -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card class="col-span-3">
            <CardHeader class="pb-2">
                <CardTitle class="flex justify-between">
                    <span class="capitalize"
                        >Welcome back, {student.name} !</span
                    >
                    <Badge class="bg-blue-100 text-blue-800 hover:bg-blue-200"
                        >Year {student.year}</Badge
                    >
                </CardTitle>
                <CardDescription>
                    Your case-based learning progress
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div class="border rounded-lg p-4 bg-white shadow-sm">
                        <div class="text-sm text-gray-500 mb-1">
                            Average Score
                        </div>
                        <div class="flex items-end gap-2">
                            <div class="text-3xl font-bold">
                                {performanceData.averageScore}%
                            </div>
                            <div class="text-green-600 text-sm">
                                {performanceData.scoreChange}%
                            </div>
                        </div>
                        <Badge variant="outline" class="mt-2 text-xs">
                            {performanceData.trend === "improving"
                                ? "Improving"
                                : "Needs Attention"}
                        </Badge>
                    </div>
                    <div class="border rounded-lg p-4 bg-white shadow-sm">
                        <div class="text-sm text-gray-500 mb-1">
                            Completed Cases
                        </div>
                        <div class="flex items-center justify-between">
                            <div class="text-3xl font-bold">
                                {departments.reduce(
                                    (sum, dept) =>
                                        sum +
                                        (dept.totalCases - dept.pendingCases),
                                    0,
                                )}
                                <span class="text-gray-400 text-xl font-normal"
                                    >/{departments.reduce(
                                        (sum, dept) => sum + dept.totalCases,
                                        0,
                                    )}</span
                                >
                            </div>
                            <div class="text-xl font-semibold text-blue-600">
                                {Math.round(
                                    (departments.reduce(
                                        (sum, dept) =>
                                            sum +
                                            (dept.totalCases -
                                                dept.pendingCases),
                                        0,
                                    ) /
                                        departments.reduce(
                                            (sum, dept) =>
                                                sum + dept.totalCases,
                                            0,
                                        )) *
                                        100,
                                )}%
                            </div>
                        </div>
                        <Progress
                            value={(departments.reduce(
                                (sum, dept) =>
                                    sum + (dept.totalCases - dept.pendingCases),
                                0,
                            ) /
                                departments.reduce(
                                    (sum, dept) => sum + dept.totalCases,
                                    0,
                                )) *
                                100}
                            class="mt-2 bg-gray-100"
                        ></Progress>
                    </div>
                    <div class="border rounded-lg p-4 bg-white shadow-sm">
                        <div class="text-sm text-gray-500 mb-1">
                            Peer Ranking
                        </div>
                        <div class="text-3xl font-bold">Top 25%</div>
                        <div class="text-sm text-gray-600 mt-1">
                            You're outperforming 75% of your peers
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader class="pb-2">
                <CardTitle class="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent class="p-4">
                <div class="flex flex-col space-y-2">
                    <Button variant="outline" class="justify-start">
                        <BookOpenText class="h-4 w-4 mr-2" />
                        Resume Last Case
                    </Button>
                    <Button variant="outline" class="justify-start">
                        <Brain class="h-4 w-4 mr-2" />
                        Review Missed Concepts
                    </Button>
                    <Button variant="outline" class="justify-start">
                        <Search class="h-4 w-4 mr-2" />
                        Explore Knowledge Graph
                    </Button>
                    <Button variant="outline" class="justify-start">
                        <MessageSquare class="h-4 w-4 mr-2" />
                        Contact Teaching Doctor
                    </Button>
                </div>
            </CardContent>
        </Card>
    </div>

    <!-- Two column layout for main content -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Left column (2/3 width) -->
        <div class="col-span-2 space-y-6">
            <!-- Assignment Overview Panel -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex justify-between items-center">
                        <span>Department Assignments</span>
                        <Badge
                            variant="outline"
                            class="bg-blue-50 text-blue-800"
                        >
                            {departments.reduce(
                                (sum, dept) => sum + dept.pendingCases,
                                0,
                            )} pending cases
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Your current assignments organized by department
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {#each departments as dept}
                            <div
                                class="rounded-lg overflow-hidden shadow-sm border border-gray-100"
                            >
                                <div class={`h-2 ${dept.color}`}></div>
                                <div class="p-5">
                                    <div
                                        class="flex justify-between items-start mb-3"
                                    >
                                        <h3 class="font-semibold text-lg">
                                            {dept.name}
                                        </h3>
                                        <Badge
                                            class={getUrgencyClass(
                                                dept.urgency,
                                            )}
                                        >
                                            <svelte:component
                                                this={getUrgencyIcon(
                                                    dept.urgency,
                                                )}
                                                class="h-3 w-3 mr-1"
                                            />
                                            {dept.nextDeadline}
                                        </Badge>
                                    </div>
                                    <div
                                        class="flex justify-between items-center mb-3"
                                    >
                                        <div class="text-gray-600 text-sm">
                                            {dept.totalCases -
                                                dept.pendingCases}/{dept.totalCases}
                                            completed
                                        </div>
                                        <div class="text-sm font-medium">
                                            {dept.progress}%
                                        </div>
                                    </div>
                                    <Progress
                                        value={dept.progress}
                                        class="mb-4 bg-gray-100"
                                    />
                                    <div
                                        class="flex justify-between items-center"
                                    >
                                        <div
                                            class="flex items-center space-x-1 text-xs text-gray-500"
                                        >
                                            <Users class="h-3.5 w-3.5" />
                                            <span
                                                >You outperform {dept.percentileRank}%
                                                of peers</span
                                            >
                                        </div>
                                        {#if dept.pendingCases > 0}
                                            <Link to="/case-library" let:active>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    class="text-xs h-7 text-blue-500 px-2 {active
                                                        ? 'bg-gray-100'
                                                        : ''}"
                                                >
                                                    View Cases <ChevronRight
                                                        class="h-3 w-3 ml-1"
                                                    />
                                                </Button>
                                            </Link>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </CardContent>
            </Card>

            <!-- Next Case to Work On -->
            <Card>
                <CardHeader class="pb-2">
                    <CardTitle>Next Up: Continue Your Learning</CardTitle>
                    <CardDescription>
                        Pick up where you left off
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="border rounded-lg p-4 bg-gray-50">
                        <div class="flex justify-between items-start">
                            <div>
                                <div class="flex items-center">
                                    <Badge
                                        class="bg-blue-100 text-blue-800 mr-2"
                                        >{nextCase.department}</Badge
                                    >
                                    <h3 class="font-medium">
                                        {nextCase.title}
                                    </h3>
                                </div>
                                <div
                                    class="flex items-center mt-1 text-sm text-gray-600"
                                >
                                    <FileText class="h-3.5 w-3.5 mr-1" />
                                    <span>{nextCase.id}</span>
                                    <span class="mx-2">•</span>
                                    <TimerIcon class="h-3.5 w-3.5 mr-1" />
                                    <span>{nextCase.deadline}</span>
                                </div>
                            </div>
                            <div>
                                <Badge
                                    variant="outline"
                                    class="bg-orange-50 text-orange-800"
                                >
                                    {nextCase.progress}% complete
                                </Badge>
                            </div>
                        </div>
                        <div class="mt-3">
                            <Progress value={nextCase.progress} class="mb-4" />
                        </div>
                        <div class="flex space-x-2 mt-1">
                            {#each nextCase.tags as tag}
                                <Badge variant="outline" class="bg-gray-100"
                                    >{tag}</Badge
                                >
                            {/each}
                        </div>
                        <div class="mt-4 flex justify-end">
                            <Button size="sm">
                                Resume Case <ChevronRight
                                    class="h-4 w-4 ml-1"
                                />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <!-- Performance Insights -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center">
                        <Brain class="h-5 w-5 mr-2" />
                        Areas for Improvement
                    </CardTitle>
                    <CardDescription>
                        Most missed competencies in your recent cases
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Competency Code</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead class="text-right">Count</TableHead>
                                <TableHead class="w-[100px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#each performanceData.mostMissedCompetencies as competency}
                                <TableRow>
                                    <TableCell class="font-medium"
                                        >{competency.code}</TableCell
                                    >
                                    <TableCell>{competency.name}</TableCell>
                                    <TableCell class="text-right"
                                        >{competency.count}</TableCell
                                    >
                                    <TableCell>
                                        <Button size="sm" variant="ghost">
                                            <HelpCircle class="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            {/each}
                        </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" class="w-full"
                        >View All Competencies</Button
                    >
                </CardFooter>
            </Card>
        </div>

        <!-- Right column (1/3 width) -->
        <div class="space-y-6">
            <!-- Recent Activity -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center">
                        <History class="h-5 w-5 mr-2" />
                        Recent Activity
                    </CardTitle>
                    <CardDescription>
                        Your learning journey so far
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-4">
                        {#each recentActivities as activity}
                            <div class="border-b pb-3 last:border-0">
                                <div class="flex gap-2">
                                    {#if activity.type === "case-completed"}
                                        <div
                                            class="bg-green-100 text-green-700 p-1 rounded-full"
                                        >
                                            <CheckCircle2 class="h-4 w-4" />
                                        </div>
                                    {:else if activity.type === "concept-viewed"}
                                        <div
                                            class="bg-blue-100 text-blue-700 p-1 rounded-full"
                                        >
                                            <Search class="h-4 w-4" />
                                        </div>
                                    {:else if activity.type === "case-started"}
                                        <div
                                            class="bg-orange-100 text-orange-700 p-1 rounded-full"
                                        >
                                            <Zap class="h-4 w-4" />
                                        </div>
                                    {/if}
                                    <div class="flex-1">
                                        <div class="text-sm font-medium">
                                            {activity.title}
                                        </div>
                                        <div class="text-xs text-gray-500 mt-1">
                                            {activity.department ||
                                                activity.category} • {activity.timestamp}
                                        </div>
                                        {#if activity.score}
                                            <div class="flex items-center mt-1">
                                                <Trophy
                                                    class="h-3.5 w-3.5 text-yellow-500 mr-1"
                                                />
                                                <span
                                                    class="text-xs font-medium"
                                                    >Score: {activity.score}%</span
                                                >
                                            </div>
                                        {/if}
                                        {#if activity.progress}
                                            <div class="mt-1">
                                                <div class="text-xs mb-1">
                                                    Progress: {activity.progress}%
                                                </div>
                                                <Progress
                                                    value={activity.progress}
                                                    class="h-1"
                                                />
                                            </div>
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {/each}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button variant="outline" class="w-full"
                        >View All Activity</Button
                    >
                </CardFooter>
            </Card>

            <!-- Learning Trail -->
            <Card>
                <CardHeader>
                    <CardTitle>Knowledge Trail</CardTitle>
                    <CardDescription>
                        Recently explored medical concepts
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-2">
                        {#each learningTrail as concept}
                            <div
                                class="flex items-center p-2 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            >
                                <div class="flex-1">
                                    <div class="font-medium">
                                        {concept.name}
                                    </div>
                                    <div
                                        class="flex items-center text-xs text-gray-500"
                                    >
                                        <Badge
                                            variant="outline"
                                            class="mr-2 text-[10px] px-1.5 py-0"
                                        >
                                            {concept.type}
                                        </Badge>
                                        {concept.category} • {concept.timestamp}
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    class="h-8 w-8 p-0"
                                >
                                    <ChevronRight class="h-4 w-4" />
                                </Button>
                            </div>
                        {/each}
                    </div>
                </CardContent>
                <CardFooter class="pt-0">
                    <Button variant="outline" size="sm" class="w-full">
                        View Knowledge Graph
                    </Button>
                </CardFooter>
            </Card>

            <!-- Peer Benchmarks -->
            <Card>
                <CardHeader>
                    <CardTitle class="flex items-center">
                        <Users2 class="h-5 w-5 mr-2" />
                        Peer Insights
                    </CardTitle>
                    <CardDescription>
                        Most challenging concepts among your peers
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div class="space-y-3">
                        {#each peerMissedConcepts as concept}
                            <div>
                                <div class="flex justify-between mb-1">
                                    <span class="text-sm font-medium"
                                        >{concept.name}</span
                                    >
                                    <span class="text-sm text-gray-500"
                                        >{concept.percentage}%</span
                                    >
                                </div>
                                <Progress
                                    value={concept.percentage}
                                    class="h-2"
                                />
                            </div>
                        {/each}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
</PageLayout>
