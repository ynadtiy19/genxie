import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import React, { useRef, useEffect } from 'react';
import Tooltip from './Tooltip'; // Import the new Tooltip component

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const RichTextEditor = ({ value, onChange, fontSize, lineSpacing, textAlign }) => {
  const quillRef = useRef(); // Create a ref for ReactQuill

  const modules = {
    toolbar: {
      container: [
        [{ 
          'header': [1, 2, false] 
        }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'font': [] }], // Added font style
        [{ 'size': ['small', false, 'large', 'huge'] }], // Added font size
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  };

  // Define tooltip contents
  const tooltipContent = {
    'header': 'Heading Style',
    'bold': 'Bold',
    'italic': 'Italic',
    'underline': 'Underline',
    'strike': 'Strikethrough',
    'list': 'List',
    'link': 'Insert Link',
    'image': 'Insert Image',
    'align': 'Text Alignment',
    'clean': 'Clear Formatting'
  };

  // Add a custom image handler
  const imageHandler = () => {
    if (quillRef.current && quillRef.current.getEditor) { // Check if quillRef is defined and has getEditor
      const editor = quillRef.current.getEditor(); // Get the editor instance
      const input = document.createElement('input');
      input.setAttribute('type', 'file');
      input.setAttribute('accept', 'image/*');
      input.click();

      input.onchange = async () => {
        const file = input.files[0];
        const reader = new FileReader();
        reader.onload = () => {
          const range = editor.getSelection();
          editor.insertEmbed(range.index, 'image', reader.result);
          editor.setSelection(range.index + 1);
        };
        reader.readAsDataURL(file);
      };
    }
  };

  // Add tooltips after component mounts
  useEffect(() => {
    const addTooltips = () => {
      const toolbar = document.querySelector('.ql-toolbar');
      if (toolbar) {
        toolbar.classList.add('bg-gray-300'); // Changed from bg-pink-500 to bg-gray-300
        const buttons = toolbar.querySelectorAll('button');
        buttons.forEach(button => {
          // Get the format from the class name
          const format = Array.from(button.classList)
            .find(className => className.startsWith('ql-'))
            ?.replace('ql-', '');

          if (format && tooltipContent[format]) {
            // Use Tooltip component for custom tooltip
            Tooltip(button, tooltipContent[format]); // Call Tooltip function
          }
        });

        // Add custom image button functionality
        const imageButton = toolbar.querySelector('.ql-image');
        if (imageButton) {
          imageButton.onclick = imageHandler; // Call imageHandler directly
        }
      }
    };

    // Wait for toolbar to be rendered
    setTimeout(addTooltips, 100);
  }, []); // Removed tooltipContent as a dependency

  return (
    <div className="bg-gray-100 border border-zink-800 rounded-lg p-4 mt-5 mb-4" style={{ width: '215.9mm', height: '279.4mm', margin: '0 auto', lineHeight: lineSpacing, textAlign: textAlign }}>
      <ReactQuill 
        ref={quillRef}
        value={value} 
        onChange={onChange} 
        modules={modules}
        placeholder="Your content here..."
        style={{ fontSize: `${fontSize}px` }} // Apply font size
        onRef={(instance) => { quillRef.current = instance }}
        className="border border-zink-800"
      />
    </div>
  );
};

export default RichTextEditor;
