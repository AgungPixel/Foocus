<script lang="ts">
    import { fly } from 'svelte/transition';
    import { ChevronRight } from 'lucide-svelte';

    let { 
        href, 
        title, 
        description, 
        linkText,
        iconBgClass,
        iconColorClass,
        iconBoxClass,
        hoverShadowClass,
        delay,
        icon 
    } = $props();
</script>

<a
    {href}
    class="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/50 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800/80 {hoverShadowClass}"
    in:fly={{ y: 20, duration: 400, delay }}
>
    <!-- Background Icon -->
    <div class="absolute -right-4 -top-4 rounded-full {iconBgClass} p-8 transition-transform duration-500 group-hover:scale-150">
        {@render icon(`opacity-50 ${iconColorClass}`, 48)}
    </div>
    <div class="relative z-10">
        <!-- Foreground Icon -->
        <div class="mb-4 inline-flex rounded-xl {iconBoxClass} p-3 {iconColorClass}">
            {@render icon('', 28)}
        </div>
        <h3 class="mb-2 text-xl font-bold text-white">{title}</h3>
        <p class="text-gray-400">{description}</p>
        <div class="mt-6 flex items-center text-sm font-semibold opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100 {iconColorClass}">
            {linkText} <ChevronRight size={16} class="ml-1" />
        </div>
    </div>
</a>
