<script lang="ts">
    import { navigate, Link } from "svelte-routing";
    import { authStore } from "$lib/stores/authStore";
    import {
        partnerService,
        type PartnerData,
    } from "$lib/services/partnerService";
    import bg2 from "$lib/assets/bg2.png";
    import logoLight from "$lib/assets/logo-light.png";
    import logoDfc from "$lib/assets/logo-dfc.png";
    import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";
    import LoadingOverlay from "$lib/components/ui/loading-overlay.svelte";
    let username = $state("");
    let email = $state("");
    let password = $state("");
    let role = $state("student");
    let isLoading = $state(false);
    let error = $state<string | null>(null);
    let inviteCode = $state("No invite code");
    let showInviteAlert = $state(false);
    let partnerCode = $state<string | null>(null);
    let partnerData = $state<PartnerData | null>(null);
    let isLoadingPartner = $state(true);
    let partnerError = $state<string | null>(null);
    let isRedirecting = $state(false);

    // Default partner data (fallback)
    const defaultPartnerData: PartnerData = {
        logo: logoDfc,
        text: "Enter your email below to create your account",
        name: "CaseChat",
        code: "",
    };

    // Initialize partner data on mount using Svelte 5 effect
    $effect(() => {
        const loadPartnerData = async () => {
            if (typeof window !== "undefined") {
                const params = new URLSearchParams(window.location.search);
                const code = params.get("code");
                partnerCode = code;

                if (code) {
                    try {
                        // Fetch partner data from API
                        partnerData =
                            await partnerService.getPartnerByCode(code);
                        inviteCode = code;
                        showInviteAlert = true;
                    } catch (err) {
                        console.error("Failed to fetch partner data:", err);
                        // Partner code not found - redirect to login
                        partnerError = "Partner code not found";
                        isLoadingPartner = false;

                        // Show error for 2 seconds, then redirect
                        setTimeout(() => {
                            isRedirecting = true;
                            setTimeout(() => {
                                navigate("/login", { replace: true });
                            }, 1000);
                        }, 2000);

                        return;
                    }
                } else {
                    // No code provided, redirect to login
                    partnerError = "Partner code not found";
                    isLoadingPartner = false;

                    // Show error for 2 seconds, then redirect
                    setTimeout(() => {
                        isRedirecting = true;
                        setTimeout(() => {
                            navigate("/login", { replace: true });
                        }, 1000);
                    }, 2000);

                    return;
                }

                isLoadingPartner = false;
            }
        };

        loadPartnerData();
    });

    async function handleSignup(e: SubmitEvent) {
        e.preventDefault();
        isLoading = true;
        error = null;

        try {
            await authStore.signup(email, password, username, role, inviteCode);
            navigate("/", { replace: true });
        } catch (err) {
            error = err instanceof Error ? err.message : "Signup failed";
        } finally {
            isLoading = false;
        }
    }
</script>

<!-- Alert Dialog for Partner Invite Code -->
{#if showInviteAlert && partnerCode}
    <AlertDialog.Root open={showInviteAlert}>
        <AlertDialog.Content class="max-w-md">
            <AlertDialog.Header>
                <div class="flex items-center gap-3 mb-2">
                    <div
                        class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                    >
                        <svg
                            class="w-5 h-5 text-blue-600 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M5 13l4 4L19 7"
                            ></path>
                        </svg>
                    </div>
                    <AlertDialog.Title class="text-blue-800"
                        >Partner Access Activated!</AlertDialog.Title
                    >
                </div>
                <AlertDialog.Description class="text-gray-600">
                    You have been provided access to CaseChat through {partnerData?.name ||
                        "our partner"}. Welcome to our case-based learning
                    platform!
                </AlertDialog.Description>
            </AlertDialog.Header>
            <AlertDialog.Footer>
                <AlertDialog.Action
                    class="bg-primary hover:bg-primary/90 text-primary-foreground"
                    onclick={() => (showInviteAlert = false)}
                >
                    Continue
                </AlertDialog.Action>
            </AlertDialog.Footer>
        </AlertDialog.Content>
    </AlertDialog.Root>
{/if}

{#if isLoadingPartner}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-center">
            <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"
            ></div>
            <p class="text-gray-500">Loading partner information...</p>
        </div>
    </div>
{:else if partnerError}
    <div class="flex min-h-screen items-center justify-center">
        <div class="text-center space-y-4">
            <div
                class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto"
            >
                <svg
                    class="w-8 h-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                    ></path>
                </svg>
            </div>
            <h2 class="text-2xl font-bold text-gray-900">
                Partner code not found
            </h2>
            <p class="text-gray-600">
                The partner code you provided is invalid or has expired.
            </p>
        </div>
    </div>

    <!-- Loading overlay for redirect -->
    <LoadingOverlay
        isVisible={isRedirecting}
        message="Redirecting to login..."
    />
{:else}
    <div class="flex min-h-screen">
        <!-- Left side with partner logo and text -->
        <div class="hidden md:flex md:w-1/2 bg-black text-white relative">
            <div class="absolute inset-0">
                <img
                    src={bg2}
                    alt="Medical molecules"
                    class="w-full h-full object-cover opacity-80 grayscale"
                />
                <div class="absolute inset-0 bg-[#00183C]/60"></div>
            </div>

            <div
                class="relative z-10 flex flex-col justify-center items-center p-12 w-full"
            >
                <div class="flex flex-col items-center text-center space-y-8">
                    <!-- Main CaseChat Logo -->
                    <div class="flex items-center mb-4">
                        <img
                            src={logoLight}
                            alt="CaseChat Logo"
                            class="h-12 w-auto"
                        />
                    </div>

                    <!-- Partnership Text -->
                    <div class="text-white/80 text-sm font-medium">
                        Exclusively partnering with
                    </div>

                    <!-- Partner Logo -->
                    <div class="bg-white p-6 rounded-lg shadow-lg">
                        <img
                            src={partnerData?.logo || logoDfc}
                            alt={partnerData?.name || "Partner Logo"}
                            class="h-12 w-auto"
                        />
                    </div>

                    <!-- Partner Text/Quote -->
                    <div class="mt-8">
                        <blockquote class="text-2xl font-medium mb-4">
                            "{partnerData?.quote ||
                                `Finally, medical education that's engaging and practical. The cases feel like real patients I might encounter during rotations`}"
                        </blockquote>
                        <cite class="block">
                            {partnerData?.quoteAuthor ||
                                "Ameena Rafath, 4th Year MBBS, GMC Cochin"}
                        </cite>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right side with signup form -->
        <div class="w-full md:w-1/2 flex items-center justify-center p-8">
            <div class="w-full max-w-md space-y-8">
                <div class="flex justify-end">
                    <Link
                        to="/login"
                        class="text-sm font-medium text-primary hover:text-primary/80"
                        >Login</Link
                    >
                </div>

                <div>
                    <h2 class="text-3xl font-bold">Create an account</h2>
                    <p class="mt-2 text-gray-500">
                        {partnerData?.text ||
                            "Enter your email below to create your account"}
                    </p>
                </div>

                {#if error}
                    <div
                        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md"
                    >
                        {error}
                    </div>
                {/if}

                <form class="mt-8 space-y-6" onsubmit={handleSignup}>
                    <div class="space-y-4">
                        <div>
                            <label
                                for="email"
                                class="block text-sm font-medium mb-2"
                                >Email</label
                            >
                            <input
                                id="email"
                                type="email"
                                bind:value={email}
                                required
                                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your email here"
                            />
                        </div>

                        <div>
                            <label
                                for="name"
                                class="block text-sm font-medium mb-2"
                                >Name</label
                            >
                            <input
                                id="name"
                                type="text"
                                bind:value={username}
                                required
                                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your name here"
                            />
                        </div>

                        <div>
                            <label
                                for="password"
                                class="block text-sm font-medium mb-2"
                                >Password</label
                            >
                            <input
                                id="password"
                                type="password"
                                bind:value={password}
                                required
                                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        <div>
                            <label
                                for="role"
                                class="block text-sm font-medium mb-2"
                                >Role</label
                            >
                            <select
                                id="role"
                                disabled
                                bind:value={role}
                                required
                                class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="student">Student</option>
                            </select>
                        </div>

                        <div>
                            <label
                                for="inviteCode"
                                class="block text-sm font-medium mb-2"
                                >Partner Code</label
                            >
                            <input
                                id="inviteCode"
                                type="text"
                                value={inviteCode}
                                readonly
                                class="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        class="w-full py-2 px-4 bg-primary text-primary-foreground font-medium rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary flex justify-center"
                        disabled={isLoading}
                    >
                        {#if isLoading}
                            <div class="flex items-center">
                                <div
                                    class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"
                                ></div>
                                <span>Creating account...</span>
                            </div>
                        {:else}
                            Sign Up
                        {/if}
                    </button>
                </form>

                <p class="mt-8 text-center text-sm text-gray-500">
                    By clicking continue, you agree to our
                    <a
                        href="/terms"
                        class="font-medium text-primary hover:text-primary/80"
                        >Terms of Service</a
                    >
                    and
                    <a
                        href="/privacy"
                        class="font-medium text-primary hover:text-primary/80"
                        >Privacy Policy</a
                    >.
                </p>

                <p class="text-center text-sm text-gray-500">
                    Already have an account?
                    <Link
                        to="/login"
                        class="font-medium text-primary hover:text-primary/80"
                        >Sign in</Link
                    >
                </p>
            </div>
        </div>
    </div>
{/if}
