<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { fade } from 'svelte/transition';
  import { Menu } from '@lucide/svelte'; // Butuh icon menu untuk mobile trigger
  import './layout.css'; // Pastikan path css benar (biasanya app.css atau layout.css)

  // Svelte 5: Ambil 'children' dari props untuk menggantikan <slot />
  let { children } = $props();

  let sidebarOpen = $state(true); 
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
  
  <Sidebar bind:isOpen={sidebarOpen} />

  <main class="
    transition-all duration-300 ease-in-out
    {sidebarOpen ? 'md:ml-64' : 'md:ml-20'}
  ">
    
    <div class="md:hidden p-4 flex items-center sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm z-30 border-b border-gray-200 dark:border-gray-800">
      <button 
        onclick={() => sidebarOpen = true}
        class="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      <span class="ml-3 font-semibold text-lg">AgungPixel</span>
    </div>

    <div class="p-4 md:p-8" in:fade={{ duration: 300 }}>
      {@render children()} 
    </div>

  </main>
</div>