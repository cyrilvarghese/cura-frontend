<script lang="ts">
    import logoNew from "$lib/assets/logo-new.png";
</script>

<div
    class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
>
    <div class="max-w-md mx-auto text-center">
        <!-- Logo -->
        <div class="mb-8">
            <img
                src={logoNew}
                alt="Case Chat Logo"
                class="w-32 h-32 mx-auto drop-shadow-lg"
            />
        </div>

        <!-- Warning Message -->
        <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">
                Desktop Experience Only
            </h1>

            <p class="text-gray-600 mb-6 leading-relaxed">
                Case Chat is currently optimized for desktop and tablet
                experiences. For the best learning experience, please access our
                site using:
            </p>

            <div class="space-y-3 mb-6">
                <div
                    class="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                    <div
                        class="w-6 h-6 bg-gray-400 rounded-sm flex items-center justify-center"
                    >
                        <span class="text-white text-xs font-bold">💻</span>
                    </div>
                    <span class="text-gray-700 font-medium"
                        >Desktop Computer</span
                    >
                </div>

                <div
                    class="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                    <div
                        class="w-6 h-6 bg-gray-400 rounded-sm flex items-center justify-center"
                    >
                        <span class="text-white text-xs font-bold">💻</span>
                    </div>
                    <span class="text-gray-700 font-medium">Laptop</span>
                </div>

                <div
                    class="flex items-center justify-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                    <div
                        class="w-6 h-6 bg-gray-400 rounded-sm flex items-center justify-center"
                    >
                        <span class="text-white text-xs font-bold">📱</span>
                    </div>
                    <span class="text-gray-700 font-medium">iPad / Tablet</span>
                </div>
            </div>

            <p class="text-sm text-gray-500">
                We're working hard to bring you a mobile-optimized experience
                soon!
            </p>
        </div>

        <!-- Decorative elements -->
        <div class="mt-8 flex justify-center space-x-2">
            <div class="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
            <div
                class="w-2 h-2 bg-indigo-300 rounded-full animate-pulse delay-75"
            ></div>
            <div
                class="w-2 h-2 bg-purple-300 rounded-full animate-pulse delay-150"
            ></div>
        </div>
    </div>
</div>
