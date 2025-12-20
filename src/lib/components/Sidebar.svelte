<script>
  import { page } from '$app/stores';
  import { fly } from 'svelte/transition';
  
  export let isOpen = true;
  
  const menuItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Notes', href: '/notes', icon: '📝' },
    { name: 'To-Do List', href: '/todos', icon: '✅' }
  ];
</script>

<aside class="flex flex-col h-screen bg-black text-white transition-all duration-300 ease-in-out"
      style="width: {isOpen ? '16rem' : '4rem'};"
      in:fly={{ y: 20, duration: 200 }}
      out:fly={{ y: 20, duration: 200 }}>
  
  <!-- Toggle Button -->
  <button 
    class="p-4 hover:bg-gray-800 transition-colors"
    on:click={() => isOpen = !isOpen}
    title="{isOpen ? 'Collapse sidebar' : 'Expand sidebar'}">
    {#if isOpen}
      ← Collapse
    {:else}
      →
    {/if}
  </button>

  <!-- Menu Items -->
  <nav class="flex-1 px-2">
    {#each menuItems as item}
      <a 
        href={item.href}
        class="flex items-center p-3 rounded-lg mb-1 transition-all
               {($page.url.pathname === item.href || 
                ($page.url.pathname === '/' && item.href === '/')) ? 
                 'bg-white text-black' : 
                 'hover:bg-gray-800'}"
        title="{isOpen ? '' : item.name}">
        <span class="text-xl">{item.icon}</span>
        {#if isOpen}
          <span class="ml-3 font-medium">{item.name}</span>
        {/if}
      </a>
    {/each}
  </nav>

  <!-- App Info -->
  {#if isOpen}
    <div class="p-4 text-xs text-gray-400 border-t border-gray-800">
      <p>Simple Notes App</p>
      <p>Data saved locally</p>
    </div>
  {/if}
</aside>

<style>
  a {
    display: block;
    text-decoration: none;
  }
</style>