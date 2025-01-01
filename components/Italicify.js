import React from 'react';
import Linkify from 'react-linkify';

export default function Italicify({ text }) {
  const replacedText = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  return (
    <Linkify
      componentDecorator={(decoratedHref, decoratedText, key) => (
        <a target="_blank" rel="noopener noreferrer" href={decoratedHref} key={key}>
          {decoratedText}
        </a>
      )}
    >
      <div dangerouslySetInnerHTML={{ __html: replacedText }} />
    </Linkify>
  );
}