<template>

  <div v-if="editor" class="container">
    <div class="flex justify-between w-full items-start p-8 ">
      <span class="text-[#929292]">{{ new Date(selectedNote.updatedAt).toLocaleDateString() }}</span>
      <div>
        <button
            @click="editor.chain().focus().undo().run()"
            :disabled="!editor.can().chain().focus().undo().run()">
          <Undo/>
        </button>
        <button
            @click="editor.chain().focus().redo().run()"
            :disabled="!editor.can().chain().focus().redo().run()">
          <Redo/>
        </button>
      </div>
    </div>
    <div class="control-group">
      <div class="button-group flex flex-wrap space-x-2">
        <button
            @click="editor.chain().focus().toggleBold().run()"
            :disabled="!editor.can().chain().focus().toggleBold().run()"
            :class="buttonClass('bold')">
          Bold
        </button>
        <button
            @click="editor.chain().focus().toggleItalic().run()"
            :disabled="!editor.can().chain().focus().toggleItalic().run()"
            :class="buttonClass('italic')">
          Italic
        </button>
        <button
            @click="editor.chain().focus().toggleStrike().run()"
            :disabled="!editor.can().chain().focus().toggleStrike().run()"
            :class="buttonClass('strike')">
          Strike
        </button>
        <button
            @click="editor.chain().focus().toggleCode().run()"
            :disabled="!editor.can().chain().focus().toggleCode().run()"
            :class="buttonClass('code')">
          Code
        </button>
        <button
            @click="editor.chain().focus().unsetAllMarks().run()"
            :class="buttonClass('clearMarks')">
          Clear marks
        </button>
        <button
            @click="editor.chain().focus().clearNodes().run()"
            :class="buttonClass('clearNodes')">
          Clear nodes
        </button>
        <button
            @click="editor.chain().focus().setParagraph().run()"
            :class="buttonClass('paragraph')">
          Paragraph
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
            :class="buttonClass('heading', { level: 1 })">
          H1
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
            :class="buttonClass('heading', { level: 2 })">
          H2
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
            :class="buttonClass('heading', { level: 3 })">
          H3
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 4 }).run()"
            :class="buttonClass('heading', { level: 4 })">
          H4
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 5 }).run()"
            :class="buttonClass('heading', { level: 5 })">
          H5
        </button>
        <button
            @click="editor.chain().focus().toggleHeading({ level: 6 }).run()"
            :class="buttonClass('heading', { level: 6 })">
          H6
        </button>
        <button
            @click="editor.chain().focus().toggleBulletList().run()"
            :class="buttonClass('bulletList')">
          Bullet list
        </button>
        <button
            @click="editor.chain().focus().toggleOrderedList().run()"
            :class="buttonClass('orderedList')">
          Ordered list
        </button>
        <button
            @click="editor.chain().focus().toggleCodeBlock().run()"
            :class="buttonClass('codeBlock')">
          Code block
        </button>
        <button
            @click="editor.chain().focus().toggleBlockquote().run()"
            :class="buttonClass('blockquote')">
          Blockquote
        </button>
        <button
            @click="editor.chain().focus().setHorizontalRule().run()"
            :class="buttonClass('horizontalRule')">
          Horizontal rule
        </button>
        <button
            @click="editor.chain().focus().setHardBreak().run()"
            :class="buttonClass('hardBreak')">
          Hard break
        </button>

        <button
            @click="editor.chain().focus().setColor('#958DF1').run()"
            :class="buttonClass('textStyle', { color: '#958DF1' })">
          Purple
        </button>
      </div>
    </div>
    <div class="editor-container text-[#D4D4D4] my-4 font-playfair w-full bg-transparent focus:outline-none">
      <editor-content :editor="editor" />
    </div>

  </div>
</template>


<script>
import { Color } from '@tiptap/extension-color';
import ListItem from '@tiptap/extension-list-item';
import TextStyle from '@tiptap/extension-text-style';
import StarterKit from '@tiptap/starter-kit';
import { Editor, EditorContent } from '@tiptap/vue-3';
import { watch} from 'vue';

export default {
  components: {
    EditorContent,
  },
  props: {
    selectedNote: {
      type: Object,
      required: true,
    },
    updatedNote: {
      type: Object,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    myDebounce: {
      type: Function,
      default: () => (fn) => setTimeout(fn, 0)
    }
  },
  data() {
    return {
      editor: null,
    }
  },
  mounted() {
    this.initializeEditor();
    watch(() => this.selectedNote, (newVal, oldVal) => {
      if (this.editor && newVal && newVal.text !== (oldVal ? oldVal.text : '')) {
        this.editor.commands.setContent(newVal.text || '<p></p>');
      }
    }, { deep: true });
  },
  beforeUnmount() {
    if (this.editor) {
      this.editor.destroy();
      this.editor = null;
    }
  },
  methods: {
    initializeEditor() {
      this.editor = new Editor({
        extensions: [StarterKit, Color.configure({ types: [TextStyle.name, ListItem.name] }), TextStyle],
        content: this.selectedNote.text || '<p></p>',
        onUpdate: ({ editor }) => {
          const htmlContent = editor.getHTML();
          this.$emit('content-updated', htmlContent);
        },
      });
    },
    updateContent() {
      if (this.editor) {
        const htmlContent = this.editor.getHTML();
        this.$emit('content-updated', htmlContent);
      } else {
        console.log('Error: Editor instance is not available.');
      }
    },
    buttonClass(type, options = {}) {
      const baseClasses = 'px-2 m-1 py-1 rounded-xl';
      const activeClasses = 'bg-[#FFAC00] text-white';
      const inactiveClasses = 'bg-gray-200 text-gray-800';
      const isActive = this.editor?.isActive(type, options) || false;
      return `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
    },
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

  /* List styles */
  ul,
  ol {
    padding: 0 1rem;
    margin: 1.25rem 1rem 1.25rem 0.4rem;

    li p {
      margin-top: 0.25em;
      margin-bottom: 0.25em;
    }
  }

  /* Heading styles */
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
  max-height: 490px;
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