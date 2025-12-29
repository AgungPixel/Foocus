<script lang="ts">
  import { page } from '$app/stores';
  import { fade } from 'svelte/transition';
  import { House, NotebookPen, ListTodo, ChevronLeft, ChevronRight, X } from '@lucide/svelte';

  interface Props {
    isOpen?: boolean;
    isMobile?: boolean; // Opsional, jika kamu mau pass dari parent
  }

  let { isOpen = $bindable(true), isMobile = false }: Props = $props();

  const menuItems = [
    { name: 'Home', href: '/', icon: House },
    { name: 'Notes', href: '/notes', icon: NotebookPen },
    { name: 'To-Do List', href: '/todos', icon: ListTodo }
  ];

  function isActive(href: string): boolean {
    if (href === '/') return $page.url.pathname === '/';
    return $page.url.pathname.startsWith(href);
  }

  // --- PERBAIKAN 1: Auto Close di Mobile ---
  function handleLinkClick() {
    // Cek lebar layar. Jika < 768px (md), berarti mobile.
    if (window.innerWidth < 768) {
      isOpen = false;
    }
  }

  // ... import lainnya

  // Tambahkan logika ini
  $effect(() => {
    if (isOpen) {
      // Saat sidebar terbuka: Kunci scroll di mobile (overflow-hidden), tapi biarkan di desktop (md:overflow-auto)
      document.body.classList.add('overflow-hidden', 'md:overflow-auto');
    } else {
      // Saat sidebar tertutup: Hapus class tersebut
      document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
    }

    // Cleanup function: Dijalankan saat component di-destroy atau state berubah
    return () => {
      document.body.classList.remove('overflow-hidden', 'md:overflow-auto');
    };
  });
</script>

{#if isOpen}
  <div 
    class="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden"
    transition:fade={{ duration: 200 }}
    role="button"
    tabindex="0"
    aria-label="Close sidebar"
    onclick={() => isOpen = false}
    onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') isOpen = false; }}
  ></div>
{/if}

<aside class="
    bg-black text-white h-screen flex flex-col border-r border-gray-800
    transition-all duration-300 ease-in-out
    fixed top-0 left-0 z-50
    {isOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
    md:translate-x-0 
    {isOpen ? 'md:w-64' : 'md:w-20'}
  ">
  
  <div class="h-16 flex items-center justify-between px-4 border-b border-gray-800">
    <span class="font-bold text-xl overflow-hidden whitespace-nowrap transition-all duration-300 
      {isOpen ? 'opacity-100 w-auto' : 'md:opacity-0 md:w-0'}">
      AgungPixel
    </span>

    <button 
      class="hidden md:flex p-1.5 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
      onclick={() => isOpen = !isOpen}
      aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
    >
      {#if isOpen} <ChevronLeft size={20} /> {:else} <ChevronRight size={20} /> {/if}
    </button>

    <button class="md:hidden p-1 hover:bg-gray-800 rounded" onclick={() => isOpen = false}>
      <X size={20} />
    </button>
  </div>

  <nav class="flex-1 py-4 overflow-y-auto overflow-x-hidden">
    <ul class="space-y-2 px-2">
      {#each menuItems as item}
        {@const active = isActive(item.href)}
        <li>
          <a 
            href={item.href}
            onclick={handleLinkClick} 
            class="
              flex items-center px-3 py-3 rounded-lg transition-all duration-200 group relative
              {active 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                : 'text-gray-400 hover:bg-gray-900 hover:text-white'}
            "
          >
            <div class="shrink-0 flex items-center justify-center w-6 h-6">
              <item.icon size={22} />
            </div>

            <span class="ml-3 font-medium whitespace-nowrap overflow-hidden transition-all duration-300
              {isOpen ? 'opacity-100 w-auto' : 'md:opacity-0 md:w-0 md:ml-0'}
            ">
              {item.name}
            </span>

            {#if !isOpen}
              <div class="
                absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2 py-1 
                bg-gray-800 text-white text-xs rounded border border-gray-700
                opacity-0 group-hover:opacity-100 
                pointer-events-none transition-opacity z-50 hidden md:block whitespace-nowrap shadow-xl
              ">
                {item.name}
              </div>
            {/if}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
</aside>