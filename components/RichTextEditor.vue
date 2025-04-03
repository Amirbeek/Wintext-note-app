<template>
  <div v-if="editor" class="w-full max-w-[780px] mx-auto shadow-md hover:shadow-lg hover:shadow-indigo-500/50 shadow-indigo-500/50 rounded-lg transition-shadow duration-300 ease-in-out shimmer-wrapper p-8 space-y-6">
    <div class="flex justify-between w-full items-start p-6 pb-0 ">
      <span class="text-sm text-zinc-400 italic">
  {{ formattedRelativeTime }}
</span>


      <div class="flex gap-2">
        <button @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()" class="text-black font-bold py-1 px-2 rounded">
          <Undo />
        </button>
        <button @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()" class="text-black font-bold py-1 px-2 rounded">
          <Redo />
        </button>
      </div>
    </div>
    <div class="control-group">
      <div class="button-group flex flex-wrap gap-2 p-4 space-x-1 pt-0">
        <button @click="toggleBold" :disabled="!canToggleBold" :class="buttonClass(editor.isActive('bold'))" title="Bold">
          <Bold class="w-5 h-5" />
        </button>
        <button @click="toggleItalic" :disabled="!canToggleItalic" :class="buttonClass(editor.isActive('italic'))" title="Italic">
          <Italic class="w-5 h-5" />
        </button>
        <button @click="toggleStrike" :disabled="!canToggleStrike" :class="buttonClass(editor.isActive('strike'))" title="Strike">
          <Strikethrough class="w-5 h-5" />
        </button>
        <button @click="toggleCode" :disabled="!canToggleCode" :class="buttonClass(editor.isActive('code'))" title="Code">
          <Code class="w-5 h-5" />
        </button>
        <button @click="clearMarks" class="bg-gray-300 px-2 py-1 rounded-full" title="Clear Marks">
          <Trash class="w-5 h-5" />
        </button>
        <button @click="toggleHeading(1)" :class="buttonClass(editor.isActive('heading', { level: 1 }))" title="Heading 1">
          <Heading1 class="w-5 h-5" />
        </button>
        <button @click="toggleHeading(2)" :class="buttonClass(editor.isActive('heading', { level: 2 }))" title="Heading 2">
          <Heading2 class="w-5 h-5" />
        </button>
        <button @click="toggleHeading(3)" :class="buttonClass(editor.isActive('heading', { level: 3 }))" title="Heading 3">
          <Heading3 class="w-5 h-5" />
        </button>
        <button @click="toggleBulletList" :class="buttonClass(editor.isActive('bulletList'))" title="Bullet List">
          <List class="w-5 h-5" />
        </button>
        <button @click="toggleOrderedList" :class="buttonClass(editor.isActive('orderedList'))" title="Ordered List">
          <ListOrdered class="w-5 h-5" />
        </button>
        <button @click="toggleBlockquote" :class="buttonClass(editor.isActive('blockquote'))" title="Blockquote">
          <Quote class="w-5 h-5" />
        </button>
        <button @click="setHorizontalRule" class="bg-gray-300 px-2 py-1 rounded-full" title="Horizontal Rule">
          <Minus class="w-5 h-5" />
        </button>
        <button @click="setHardBreak" class="bg-gray-300 px-2 py-1 rounded-full" title="Hard Break">
          <CornerDownLeft class="w-5 h-5" />
        </button>
        <button @click="setPurpleColor" :class="buttonClass(editor.isActive('textStyle', { color: '#958DF1' }))" title="Purple">
          <Paintbrush class="w-5 h-5" />
        </button>
      </div>
    </div>
    <div class="editor-container text-[#D4D4D4] my-4 font-playfair w-full bg-transparent focus:outline-none">
      <editor-content :editor="editor" />
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

import { Editor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import Blockquote from '@tiptap/extension-blockquote'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import HardBreak from '@tiptap/extension-hard-break'
import Color from '@tiptap/extension-color'
import TextStyle from '@tiptap/extension-text-style'
import ListItem from '@tiptap/extension-list-item'
import { watch } from 'vue'
import Undo from '@/components/Undo.vue'
import Redo from '@/components/Redo.vue'

import {
  Bold, Italic, Strikethrough, Code, Trash,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, CornerDownLeft, Paintbrush,
} from 'lucide-vue-next'

export default {
  components: {
    EditorContent,
    Undo,
    Redo,
    Bold,
    Italic,
    Strikethrough,
    Code,
    Trash,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Quote,
    Minus,
    CornerDownLeft,
    Paintbrush
  },
  props: {
    selectedNote: Object,
    updatedNote: Object,
    content: String,
    myDebounce: { type: Function, default: () => (fn) => setTimeout(fn, 0) }
  },
  data() {
    return { editor: null }
  },
  mounted() {
    this.initializeEditor()
    watch(() => this.selectedNote, (newVal, oldVal) => {
      if (this.editor && newVal && newVal.text !== (oldVal ? oldVal.text : '')) {
        this.editor.commands.setContent(newVal.text || '<p></p>')
      }
    }, { deep: true })
  },
  beforeUnmount() {
    this.editor?.destroy()
  },
  methods: {
    initializeEditor() {
      this.editor = new Editor({
        extensions: [
          StarterKit.configure({
            heading: false, bulletList: false, orderedList: false,
            blockquote: false, horizontalRule: false, hardBreak: false,
          }),
          Heading.configure({ levels: [1, 2, 3] }),
          BulletList, OrderedList, ListItem, Blockquote,
          HorizontalRule, HardBreak, TextStyle,
          Color.configure({ types: ['textStyle'] }),
        ],
        content: this.selectedNote.text || '<p></p>',
        onUpdate: ({ editor }) => {
          this.$emit('content-updated', editor.getHTML())
        },
      })
    },
    toggleBold() { this.editor.chain().focus().toggleBold().run() },
    canToggleBold() { return this.editor.can().chain().focus().toggleBold().run() },
    toggleItalic() { this.editor.chain().focus().toggleItalic().run() },
    canToggleItalic() { return this.editor.can().chain().focus().toggleItalic().run() },
    toggleStrike() { this.editor.chain().focus().toggleStrike().run() },
    canToggleStrike() { return this.editor.can().chain().focus().toggleStrike().run() },
    toggleCode() { this.editor.chain().focus().toggleCode().run() },
    canToggleCode() { return this.editor.can().chain().focus().toggleCode().run() },
    clearMarks() { this.editor.chain().focus().unsetAllMarks().run() },
    toggleHeading(level) { this.editor.chain().focus().toggleHeading({ level }).run() },
    toggleBulletList() { this.editor.chain().focus().toggleBulletList().run() },
    toggleOrderedList() { this.editor.chain().focus().toggleOrderedList().run() },
    toggleBlockquote() { this.editor.chain().focus().toggleBlockquote().run() },
    setHorizontalRule() { this.editor.chain().focus().setHorizontalRule().run() },
    setHardBreak() { this.editor.chain().focus().setHardBreak().run() },
    setPurpleColor() { this.editor.chain().focus().setColor('#958DF1').run() },
    buttonClass(isActive) {
      const base = 'px-2 py-2 rounded-full'
      const active = 'bg-[#FFAC00] text-white'
      const inactive = 'bg-gray-300 text-gray-800'
      return `${base} ${isActive ? active : inactive}`
    },

  },
  computed: {
    formattedRelativeTime() {
      const updatedAt = this.selectedNote?.updatedAt
      if (!updatedAt) return ''

      const date = dayjs(updatedAt).format('MMM D, YYYY')
      const relative = dayjs(updatedAt).fromNow()

      return `${date} • ${relative}`
    }
  },
}
</script>



<style lang="scss">
.tiptap {
  color: #D4D4D4;
  outline: none;

  :first-child {
    margin-top: 0;
  }

  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    color: white;
    line-height: 1.1;
    margin-top: 2.5rem;
    text-wrap: pretty;
  }

  h1,
  h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.5rem;
  }

  h1 {
    font-size: 1.4rem;
  }

  h2 {
    font-size: 1.2rem;
  }

  h3 {
    font-size: 1.1rem;
  }

  h4,
  h5,
  h6 {
    font-size: 1rem;
  }

  code {
    background-color: #958DF1;
    border-radius: 0.4rem;
    color: var(--black);
    font-size: 0.85rem;
    padding: 0.25em 0.3em;
  }

  pre {
    background: var(--black);
    border-radius: 0.5rem;
    color: var(--white);
    font-family: 'JetBrainsMono', monospace;
    margin: 1.5rem 0;
    padding: 0.75rem 1rem;

    code {
      background: none;
      color: inherit;
      font-size: 0.8rem;
      padding: 0;
    }
  }

  blockquote {
    border-left: 3px solid var(--gray-3);
    margin: 1.5rem 0;
    padding-left: 1rem;
  }
  .ul {
    list-style-type: disc;
    padding-left: 1.5rem;
  }

  .ol {
    list-style-type: decimal;
    padding-left: 1.5rem;
  }

  hr {
    border: none;
    border-top: 1px solid var(--gray-2);
    margin: 2rem 0;
  }
}
.editor-container {
  color: #D4D4D4;
  background-color: transparent;
  outline: none;
  width: 100%;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
  scrollbar-width: thin;
  scrollbar-color: #606060 transparent;

  &::-webkit-scrollbar {
    width: 8px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #606060;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }
}
</style>