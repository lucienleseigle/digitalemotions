export default function Italicify({ text }) {
    const replacedText = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
    return <div dangerouslySetInnerHTML={{ __html: replacedText }} />;
  }