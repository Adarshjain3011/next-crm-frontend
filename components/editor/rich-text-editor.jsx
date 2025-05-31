'use client'

import * as React from 'react'
import {
  Editor,
//   type JSONContent,
  useEditor,
  EditorContent,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Button } from '@/components/ui/button'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Bold, Italic, Strikethrough, Underline } from 'lucide-react'

// interface RichTextEditorProps {
//   value?: JSONContent
//   onChange?: (content: JSONContent) => void
// }

export function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value ?? '<p>Enter your note here...</p>',
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON())
    },
  })

  if (!editor) return null

  return (
    <div className="border rounded-md p-4 space-y-2">
      <ToggleGroup type="multiple">
        <ToggleGroupItem
          value="bold"
          aria-label="Bold"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive('bold') ? 'bg-muted' : ''}
        >
          <Bold className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="italic"
          aria-label="Italic"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive('italic') ? 'bg-muted' : ''}
        >
          <Italic className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="strike"
          aria-label="Strikethrough"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={editor.isActive('strike') ? 'bg-muted' : ''}
        >
          <Strikethrough className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>

      <EditorContent editor={editor} className="min-h-[200px] p-2 border rounded-sm" />
    </div>
  )
}
