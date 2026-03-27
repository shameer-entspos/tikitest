import LinkifyIt from "linkify-it";

const LinkifyText = ({ text }: { text: string }) => {
  const linkify = new LinkifyIt({ fuzzyLink: true });

  const textWithLinks = linkify.match(text);

  if (!textWithLinks) {
    return <div>{text}</div>;
  }

  const parts = [];
  let currentIndex = 0;

  textWithLinks.forEach((link) => {
    const { index, lastIndex } = link;
    const beforeLink = text.substring(currentIndex, index);
    const linkText = text.substring(index, lastIndex);

    if (beforeLink) {
      parts.push(<span key={`before-${currentIndex}`}>{beforeLink}</span>);
    }

    parts.push(
      <a
        href={link.url}
        target="_blank"
        key={link.url}
        style={{ color: "blue" }}
      >
        {linkText}
      </a>
    );

    currentIndex = lastIndex;
  });

  const remainingText = text.substring(currentIndex);
  if (remainingText) {
    parts.push(<span key={`remaining-${currentIndex}`}>{remainingText}</span>);
  }

  return <div >{parts}</div>;
};

export { LinkifyText };
