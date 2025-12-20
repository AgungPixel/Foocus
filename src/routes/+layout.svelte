<script>
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { fade } from 'svelte/transition';
  import './layout.css';  // <-- Import dari lokasi yang benar
  
  let sidebarOpen = true;
</script>

<div class="flex h-screen bg-gray-100">
  <Sidebar bind:isOpen={sidebarOpen} />
  
  <main class="flex-1 overflow-hidden">
    <div class="p-4 h-full" in:fade={{ duration: 300 }}>
      <slot />
    </div>
  </main>
</div>