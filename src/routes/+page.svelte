<script lang="ts">
    import { FloatingPanel, Portal } from '@skeletonlabs/skeleton-svelte';
    import { MinusIcon, MaximizeIcon, MinimizeIcon, XIcon, SaveIcon, NotebookPen } from 'lucide-svelte';

    // State untuk menyimpan isi catatan (Svelte 5 Runes)
    let noteContent = $state("");

    function handleSave() {
        console.log("Menyimpan catatan:", noteContent);
        alert("Catatan disimpan! (Cek console)");
    }
</script>

<FloatingPanel>
    <FloatingPanel.Trigger class="btn preset-outlined fixed bottom-5 right-5">
        <NotebookPen size={18} />
        Buka Catatan
    </FloatingPanel.Trigger>

    <Portal>
        <FloatingPanel.Positioner class="fixed bottom-10 right-10 z-50">
            
            <FloatingPanel.Content class="flex flex-col w-80 h-96 bg-surface-100-800-token rounded-container-token shadow-2xl border border-surface-200-700-token overflow-hidden">
                
                <FloatingPanel.DragTrigger class="cursor-move bg-surface-200-700-token border-b border-surface-300-600-token">
                    <FloatingPanel.Header class="flex justify-between items-center">
                        <FloatingPanel.Title class="font-bold flex items-center gap-2 text-sm">
                            <NotebookPen size={16} />
                            Quick Note
                        </FloatingPanel.Title>
                        
                        <FloatingPanel.Control class="flex gap-1">
                            <FloatingPanel.StageTrigger stage="minimized" class="hover:bg-surface-300/20 p-1 rounded">
                                <MinusIcon size={14} />
                            </FloatingPanel.StageTrigger>
                            <FloatingPanel.StageTrigger stage="maximized" class="hover:bg-surface-300/20 p-1 rounded">
                                <MaximizeIcon size={14} />
                            </FloatingPanel.StageTrigger>
                            <FloatingPanel.StageTrigger stage="default" class="hover:bg-surface-300/20 p-1 rounded">
                                <MinimizeIcon size={14} />
                            </FloatingPanel.StageTrigger>
                            <FloatingPanel.CloseTrigger class="hover:bg-error-500/20 hover:text-error-500 p-1 rounded">
                                <XIcon size={14} />
                            </FloatingPanel.CloseTrigger>
                        </FloatingPanel.Control>
                    </FloatingPanel.Header>
                </FloatingPanel.DragTrigger>
                
                <FloatingPanel.Body class="grow flex flex-col relative">
                    <textarea 
                        bind:value={noteContent}
                        class="textarea w-full h-full p-4 bg-transparent border-0 focus:ring-0 resize-none outline-none font-mono text-sm"
                        placeholder="Tulis ide anda di sini..."
                    ></textarea>

                    <button 
                        onclick={handleSave}
                        class="absolute bottom-4 right-8 btn btn-sm preset-filled-primary opacity-80 hover:opacity-100"
                    >
                        <SaveIcon size={14} class="mr-1"/> Save
                    </button>
                </FloatingPanel.Body>
                
                <FloatingPanel.ResizeTrigger axis="se" class="absolute bottom-1 right-1 text-surface-400 cursor-se-resize p-1" />
            
            </FloatingPanel.Content>
        </FloatingPanel.Positioner>
    </Portal>
</FloatingPanel>