<script lang="ts">
  import { navigate, Link } from "svelte-routing";
  import { authStore } from "$lib/stores/authStore";
  import bg2 from "$lib/assets/bg4.png"; // Import the image
  import logoLight from "$lib/assets/logo-light.png"; // Import the logo
  import * as AlertDialog from "$lib/components/ui/alert-dialog/index.js";

  let username = $state("");
  let email = $state("");
  let password = $state("");
  let role = $state("student"); // Default role
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let inviteCode = $state("No invite code");
  let showInviteAlert = $state(false);

  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      inviteCode = code;
      showInviteAlert = true;
    }
  }

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

<!-- Alert Dialog for Invite Code -->
{#if showInviteAlert && inviteCode !== "No invite code"}
  <AlertDialog.Root open={showInviteAlert}>
    <AlertDialog.Content class="max-w-md">
      <AlertDialog.Header>
        <div class="flex items-center gap-3 mb-2">
          <div
            class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 text-green-600 animate-pulse"
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
          <AlertDialog.Title class="text-green-800"
            >Invite Code Activated!</AlertDialog.Title
          >
        </div>
        <AlertDialog.Description class="text-gray-600">
          You have been provided early access to CaseChat. Welcome to our
          exclusive case base learning platform!
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Action
          class="bg-green-600 hover:bg-green-700 text-white"
          onclick={() => (showInviteAlert = false)}
        >
          Continue
        </AlertDialog.Action>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>
{/if}

<div class="flex min-h-screen">
  <!-- Left side with image and testimonial -->
  <div class="hidden md:flex md:w-1/2 bg-black text-white relative">
    <div class="absolute inset-0">
      <img
        src={bg2}
        alt="Medical molecules"
        class="w-full h-full object-cover opacity-80"
      />
      <div class="absolute inset-0 bg-[#00183C]/70"></div>
    </div>

    <div class="relative z-10 flex flex-col justify-between p-12 w-full">
      <div>
        <div class="flex items-center">
          <img src={logoLight} alt="Case Chat Logo" class="w-[auto] h-14" />
          <!-- <h1
            class="text-3xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
          >
            CaseChat
          </h1> -->
        </div>
      </div>

      <div class="mb-12">
        <blockquote class="text-2xl font-medium mb-4">
          "Finally, medical education that's engaging and practical. The cases
          feel like real patients I might encounter during rotations"
        </blockquote>
        <cite class="block">Ameena Rafath, 4th Year MBBS, GMC Cochin</cite>
      </div>
    </div>
  </div>

  <!-- Right side with signup form -->
  <div class="w-full md:w-1/2 flex items-center justify-center p-8">
    <div class="w-full max-w-md space-y-8">
      <div class="flex justify-end">
        <Link to="/login" class="text-sm font-medium">Login</Link>
      </div>

      <div>
        <h2 class="text-3xl font-bold">Create an account</h2>
        <p class="mt-2 text-gray-500">
          Enter your email below to create your account
        </p>
      </div>

      <form class="mt-8 space-y-6" onsubmit={handleSignup}>
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium mb-2"
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
            <label for="name" class="block text-sm font-medium mb-2">Name</label
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
            <label for="password" class="block text-sm font-medium mb-2"
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
            <label for="role" class="block text-sm font-medium mb-2">Role</label
            >
            <select
              id="role"
              disabled
              bind:value={role}
              required
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="student">Student</option>
              <!-- <option value="teacher">Teacher</option>
              <option value="admin">Admin</option> -->
            </select>
          </div>

          <div>
            <label for="inviteCode" class="block text-sm font-medium mb-2"
              >Invite Code</label
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
            <span class="mr-2">Loading...</span>
          {:else}
            Sign Up
          {/if}
        </button>
      </form>

      <!-- <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">OR CONTINUE WITH</span>
          </div>
        </div>

        <div class="mt-6">
          <button
            type="button"
            class="w-full py-2 px-4 border border-gray-300 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-50"
          >
            <svg
              class="h-5 w-5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Google</span>
          </button>
        </div>
      </div> -->

      <p class="mt-8 text-center text-sm text-gray-500">
        By clicking continue, you agree to our
        <a href="/terms" class="font-medium text-blue-600 hover:text-blue-500"
          >Terms of Service</a
        >
        and
        <a href="/privacy" class="font-medium text-blue-600 hover:text-blue-500"
          >Privacy Policy</a
        >.
      </p>

      <p class="text-center text-sm text-gray-500">
        Already have an account?
        <Link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </Link>
      </p>
    </div>
  </div>
</div>
