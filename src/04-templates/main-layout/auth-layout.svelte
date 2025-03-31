<script lang="ts">
    // Auth layout doesn't need any special imports for now
</script>

<div class="flex min-h-screen">
    <!-- Left side with dark image and testimonial -->
    <div
        class="hidden lg:flex lg:w-1/2 flex-col justify-between p-10 text-white relative"
    >
        <div class="z-10">
            <h1 class="text-xl font-bold">Acme Inc</h1>
        </div>

        <div class="relative z-10 mb-10">
            <blockquote class="text-xl md:text-2xl">
                "This platform has transformed how we teach and assess medical
                knowledge. Our students are more engaged and better prepared for
                real clinical scenarios."
            </blockquote>
            <p class="mt-4 font-medium">Dr. Sarah Johnson</p>
        </div>

        <!-- Dark background image from Unsplash -->
        <div
            class="absolute inset-0 bg-gradient-to-b from-black/60 to-black/90 z-0"
        ></div>
        <div
            class="absolute inset-0 bg-[url('https://source.unsplash.com/random/1920x1080/?dark,abstract')] bg-cover bg-center z-[-1]"
        ></div>
    </div>

    <!-- Right side with auth form on white background -->
    <div
        class="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white text-gray-900"
    >
        <div class="w-full max-w-md space-y-8">
            <slot></slot>
        </div>
    </div>
</div>
