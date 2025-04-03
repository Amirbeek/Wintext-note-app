<template>
  <div class=" flex bg-zinc-900 h-screen">

    <!--  sidebar  -->
    <div class="bg-black w-[338px] p-8 flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
      <div>
        <Logo/>
      </div>
      <!--      Today Main Container -->
      <div class="flex-grow">
        <p class="font-sm font-bold text-[#C2C2C5] mt-12 mb-4">Today</p>
        <NoteSkeleton v-if="loadingNotesSidebar" v-for="i in 3" :key="'today'+i" />
        <div class="ml-2 space-y-2">
          <div
              v-for="note in todaysNotes"
              class="p-3 rounded-lg cursor-pointer"
              :class="{
               'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
              }"
              @click="setNote(note)">
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{stripHtml(note.text).substring(0,50)}}
            </h3>
            <div class="leading-none  text-[#d6d6d6] truncate">
             <span class="text-xs text-[#F4F4F5] mr-4">{{
                  formatRelative(note.updatedAt)
               }}</span>
              <span class="text-xs text-[#d6d6d6]  "> ...{{stripHtml(note.text).substring(50,70)}}</span>
            </div>
          </div>
        </div>
      </div>
      <!--      Yesterday Main Container -->
      <div>
        <p class="font-sm font-bold text-[#C2C2C5] mt-12 mb-4">Yesterday</p>
        <NoteSkeleton v-if="loadingNotesSidebar" v-for="i in 3" :key="'today'+i" />
        <div class="ml-2 space-y-2">
          <div
              v-for="note in yesterdayNotes"
              class="p-3 rounded-lg cursor-pointer"
              :class="{
               'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
              }"
              @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{stripHtml(note.text).substring(0,50)}}
            </h3>
            <div class="leading-none  text-[#d6d6d6] truncate">
            <span class="text-xs text-[#F4F4F5] mr-4">
              {{ formatRelative(note.updatedAt) }}
            </span>
              <span class="text-xs text-[#d6d6d6]  "> ...{{stripHtml(note.text).substring(50,70)}}</span>
            </div>
          </div>
        </div>
      </div>
      <!--      Earlier Main Container -->
      <div>
        <p class="font-sm font-bold text-[#C2C2C5] mt-12 mb-4">Earlier</p>
        <NoteSkeleton v-if="loadingNotesSidebar" v-for="i in 3" :key="'today'+i" />
        <div class="ml-2 space-y-2">
          <div
              v-for="note in earlierNotes"
              class="p-3 rounded-lg cursor-pointer"
              :class="{
               'bg-[#A1842C]': note.id === selectedNote.id,
              'hover:bg-[#A1842C]/50': note.id !== selectedNote.id,
              }"
              @click="setNote(note)"
          >
            <h3 class="text-sm font-bold text-[#F4F4F5] truncate">
              {{stripHtml(note.text).substring(0,50)}}
            </h3>
            <div class="leading-none  text-[#d6d6d6] truncate">
             <span class="text-xs text-[#F4F4F5] mr-4">
                {{ formatRelative(note.updatedAt) }}
              </span>
              <span class="text-xs text-[#d6d6d6]" v-if="stripHtml(note.text).length > 50"> ...{{stripHtml(note.text).substring(50,70)}}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!--  sidebar  -->
    <!--    node container-->
    <div class="w-full flex flex-col relative shadow-indigo-500">
      <div class="flex justify-between w-full items-start p-8 ">
        <button class="text-xs items-center text-[#C2c2c5] font-bold inline-flex space-x-2 hover:text-white"
                @click="createNewNote">
          <PencilIcon/>
          <span>Create Note</span>
        </button>
        <Button @click="deleteNote"><TrashIcon/></Button>
      </div>
      <div class="max-w-[820px] mx-auto flex-grow flex flex-col">
        <NoteEditorSkeleton v-if="loadingEditor" />
        <RichTextEditor
            v-else
            :selectedNote="selectedNote"
            @content-updated="handleContentUpdate"
            :updatedNote="updatedNote"
        />
      </div>

      <button class="text-zinc-500 hover:text-white text-sm font-bold bottom-0 absolute right-0 p-8 transition-colors duration-200 ease-in-out" @click="logout">Logout</button>
      <div class="bottom-0  absolute left-0 p-8">
        <AIcomponent
            :noteText="selectedNote"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
const loadingNotesSidebar = ref(true)
const loadingEditor = ref(true)


definePageMeta({
  middleware: ['auth'],
});
import Swal from "sweetalert2";
const updatedNote = ref('')
import { ref, computed, onMounted } from 'vue';
import { definePageMeta } from '#imports';
import TrashIcon from "~/components/TrashIcon.vue";
import PencilIcon from "~/components/PencilIcon.vue";
import NoteEditorSkeleton from "~/components/NoteEditorSkeleton.vue";
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const formatRelative = (date) => dayjs(date).fromNow()



const notes = ref([]);
const selectedNote = ref({});
const stripHtml = (html) => {
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = html
  return tempDiv.textContent || tempDiv.innerText || ''
}

function setNote(note) {
  selectedNote.value = note
  updatedNote.value = note.text
}

const handleContentUpdate = (newContent) => {
  updatedNote.value = newContent;
  selectedNote.value.text = updatedNote.value
  updateNote()
};

const todaysNotes = computed(() => {
  return notes.value.filter(note => {
    const noteDate = new Date(note.updatedAt);
    return noteDate.toDateString() === new Date().toDateString();
  }).sort((a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt));
});
const createNewNote = (async ()=>{
  try {
    const newNote = await $fetch(`/api/notes`, {
      method: 'POST',
    })
    notes.value.unshift(newNote)
    selectedNote.value = notes.value[0]
  } catch (err) {
    console.log(err)
  }
})


async function updateNote() {
  try {
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: 'PATCH',
      body: {
        updatedNote: updatedNote.value,
      },
    })
  } catch (err) {
    console.log(err)
  }
}

const yesterdayNotes = computed(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return notes.value.filter(note => {
    const noteDate = new Date(note.updatedAt);
    return noteDate.toDateString() === yesterday.toDateString();
  });
});


async function deleteNote() {
  const { isConfirmed } = await Swal.fire({
    title: 'Are you sure?',
    text: 'This will delete your note permanently, are you extra sure you like to do this?',
    icon: 'warning',
    confirmButtonText: 'Yes, delete',
    showCancelButton: true,
  })

  if (isConfirmed) {
    await $fetch(`/api/notes/${selectedNote.value.id}`, {
      method: 'DELETE',
    })

    const index = notes.value.findIndex((note) => {
      return note.id === selectedNote.value.id
    })
    notes.value.splice(index, 1)
    selectedNote.value = notes.value[0]
  }
}
const earlierNotes = computed(() => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return notes.value.filter(note => {
    const noteDate = new Date(note.updatedAt);
    return noteDate < yesterday && noteDate.toDateString() !== yesterday.toDateString();
  });
});

const logout = (async ()=>{
  const jwtCookies = useCookie('AppleNoteJWT')
  jwtCookies.value = null
  navigateTo('/login')
})
onMounted(async () => {
  loadingNotesSidebar.value = true
  loadingEditor.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  notes.value = await $fetch('/api/notes');
  notes.value.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  if (notes.value.length > 0) selectedNote.value = notes.value[0]
  else {
    await createNewNote()
    selectedNote.value = notes.value[0]
  }
  updatedNote.value = selectedNote.value.text
  loadingNotesSidebar.value = false

  // give Vue a tick to show skeleton
  await nextTick()
  requestAnimationFrame(() => {
    setTimeout(() => {
      loadingEditor.value = false
    }, 300)
  })

})

</script>