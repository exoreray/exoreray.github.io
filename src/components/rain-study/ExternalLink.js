import InterfaceIcon from './InterfaceIcon';

// Keep the authored label; render its former typographic arrow as an icon.
function labelWithoutArrow(label) {
  return typeof label === 'string' ? label.replace(/\s*[\u2190-\u2199\u2794]\s*$/u, '') : label;
}
export default function ExternalLink({ href, children, className = '' }) {
  return <a className={`rain-external ${className}`} href={href} target="_blank" rel="noopener noreferrer"><span className="rain-link-label">{labelWithoutArrow(children)}</span><InterfaceIcon name="external" /><span className="rain-sr-only">Opens a new tab</span></a>;
}
