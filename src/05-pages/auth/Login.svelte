<script lang="ts">
  import { navigate, Link } from "svelte-routing";
  import { authStore, type AuthState } from "$lib/stores/authStore";
  import bg1 from "$lib/assets/bg4.png";
  import logoLight from "$lib/assets/logo-light.png"; // Import the logo

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

  <!-- Right side with login form -->
  <div class="w-full md:w-1/2 flex items-center justify-center p-8">
    <div class="w-full max-w-md space-y-8">
      <!-- <div class="flex justify-end">
        <Link to="/signup" class="text-sm font-medium">Sign Up</Link>
      </div> -->

      <div>
        <h2 class="text-3xl font-bold">Sign in to your account</h2>
        <p class="mt-2 text-gray-500">
          Enter your email below to sign in to your account
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
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Your email here"
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
              class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
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
            Sign In
          {/if}
        </button>
      </form>

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

      <!-- <p class="text-center text-sm text-gray-500">
        Don't have an account?
        <Link
          to="/signup"
          class="font-medium text-blue-600 hover:text-blue-500"
        >
          Sign up
        </Link>
      </p> -->
    </div>
  </div>
</div>
