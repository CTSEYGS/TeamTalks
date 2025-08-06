// Utility function to strip HTML tags and check if content is empty
export const stripHtmlTags = (html) => {
  if (!html) return '';
  
  // Create a temporary div element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // Get the text content without HTML tags
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  
  return textContent.trim();
};

// Check if rich text content is effectively empty
export const isRichTextEmpty = (html) => {
  if (!html) return true;
  
  // Check for common empty states
  if (html === '<p><br></p>' || html === '<p></p>' || html === '<br>') {
    return true;
  }
  
  // Strip HTML and check if there's any meaningful content
  const textContent = stripHtmlTags(html);
  return textContent.length === 0;
};
