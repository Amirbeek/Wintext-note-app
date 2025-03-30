<template>
  <div class=" flex bg-zinc-900 h-screen">

    <!--  sidebar  -->
    <div class="bg-black w-[338px] p-8">
      <Logo/>
<!--      Today Main Container -->
     <div>
       <p class="font-sm font-bold text-[#C2C2C5] mt-12 mb-4">Today</p>
       <div class="ml-2 space-y-2">
         <div
             v-for="note in todaysNotes"
             class="p-3 rounded-lg cursor-pointer"
             :class="{
               'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
              }"
              @click="selectedNote = note"
         >
           <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
             {{note.text.substring(0,50)}}
           </h3>
           <div class="leading-none  text-[#d6d6d6] truncate">
             <span class="text-xs text-[#F4F4F5] mr-4">{{
                 new Date(note.updatedAt).toDateString() ===
                 new Date().toDateString()
                     ? 'Today'
                     : new Date(note.updatedAt).toLocaleDateString()
               }}</span>
             <span class="text-xs text-[#d6d6d6]  "> ...{{note.text.substring(50,70)}}</span>
           </div>
         </div>
       </div>
     </div>
      <!--      Yesterday Main Container -->
      <div>
        <p class="font-sm font-bold text-[#C2C2C5] mt-12 mb-4">Yesterday</p>
        <div class="ml-2 ">
          <div class="p-3  rounded-lg">
            <h3 class="text-sm font-bold text-[#F4F4F5]">
              Just finished reading...
            </h3>
            <div class="leading-none">
              <span class="text-xs text-[#F4F4F5] mr-4">Today</span>
              <span class="text-xs text-[#d6d6d6]">The Midnight Library...</span>
            </div>
          </div>
        </div>
        <div class="ml-2">
          <div class="p-2">
            <h3 class="text-sm font-bold text-[#F4F4F5]">
              Just finished reading...
            </h3>
            <div class="leading-none">
              <span class="text-xs text-[#F4F4F5] mr-4">Today</span>
              <span class="text-xs text-[#C2C2C5]">The Midnight Library...</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  sidebar  -->
    <div class="w-full">
      <div class="flex justify-between w-full items-start p-8 ">
        <button class="text-xs items-center text-[#C2c2c5] font-bold inline-flex space-x-2 hover:text-white">
          <PencilIcon/>
          <span>Create Note</span>
        </button>
        <Button ><TrashIcon/></Button>
      </div>
      <div class="max-w-[437px] mx-auto">
        <p class="text-[#929292]">{{selectedNote.updatedAt}}</p>
        <p class="text-[#d4d4d4] my-4 font-playfair">{{selectedNote.text}}</p>
      </div>
    </div>
    <!--    node introduction-->

  </div>

</template>
<<script setup>
import { ref, computed, onMounted } from 'vue';
import { definePageMeta } from '#imports';
import TrashIcon from "~/components/TrashIcon.vue";
import PencilIcon from "~/components/PencilIcon.vue";

// Define middleware for this page
definePageMeta({
  middleware: ['auth'],
});

const notes = ref([]);
const selectedNote = ref({});

// Computed property to filter today's notes
const todaysNotes = computed(() => {
  return notes.value.filter(note => {
    const noteDate = new Date(note.updatedAt);
    return noteDate.toDateString() === new Date().toDateString();
  });
});

// Fetch notes on mounted and set the first note as selected if available
onMounted(async () => {
  const fetchedNotes = await $fetch('/api/notes'); // Ensure the fetch URL is correct
  notes.value = fetchedNotes; // Update the reactive reference correctly
  if (fetchedNotes.length > 0) {
    selectedNote.value = fetchedNotes[0];
  }
});
</script>
