<script lang="ts">
  import { navigate, Link } from "svelte-routing";
  import { authStore, type AuthState } from "$lib/stores/authStore";
  import bg1 from "$lib/assets/bg1.png";

  let email = $state("");
  let password = $state("");
  let isLoading = $state(false);
  let error = $state<string | null>(null);
  let user: AuthState["user"] | undefined = $state();
  authStore.subscribe((state) => {
    user = state.user;
    if (user) {
      console.log("Current user role:", user.role);
    }
  });
  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    isLoading = true;
    error = null;

    try {
      await authStore.login(email, password);
      if (user?.role === "student") {
        navigate("/", { replace: true });
      } else {
        navigate("/case-library", { replace: true });
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "Login failed";
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="flex min-h-screen">
  <!-- Left side with image and testimonial -->
  <div class="hidden md:flex md:w-1/2 bg-black text-white relative">
    <div class="absolute inset-0">
      <img
        src={bg1}
        alt="Medical molecules"
        class="w-full h-full object-cover opacity-80"
      />
      <div
        class="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60"
      ></div>
    </div>

    <div class="relative z-10 flex flex-col justify-between p-12 w-full">
      <div>
        <h1 class="text-xl font-bold">Cura | Simulate</h1>
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

  <!-- Right side with login form -->
  <div class="w-full md:w-1/2 flex items-center justify-center p-8">
    <div class="w-full max-w-md space-y-8">
      <div class="flex justify-end">
        <Link to="/signup" class="text-sm font-medium">Sign Up</Link>
      </div>

      <div>
        <h2 class="text-3xl font-bold">Create an account</h2>
        <p class="mt-2 text-gray-500">
          Enter your email below to create your account
        </p>
      </div>

      <form class="mt-8 space-y-6" onsubmit={handleLogin}>
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
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium mb-2"
                >Password</label
              >
              <a href="#" class="text-sm text-blue-600 hover:text-blue-500"
                >Forgot password?</a
              >
            </div>
            <input
              id="password"
              type="password"
              bind:value={password}
              required
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          class="w-full py-2 px-4 bg-black text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex justify-center"
          disabled={isLoading}
        >
          {#if isLoading}
            <span class="mr-2">Loading...</span>
          {:else}
            Sign In
          {/if}
        </button>
      </form>

      <div class="mt-6">
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
      </div>

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
        Don't have an account?
        <Link
          to="/signup"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </Link>
      </p>
    </div>
  </div>
</div>
