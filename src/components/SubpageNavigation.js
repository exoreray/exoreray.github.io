import { Link } from 'react-router-dom';

const ArrowLeft = () => (
  <svg
    aria-hidden="true"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="1.5"
    viewBox="0 0 24 24"
  >
    <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

const SubpageNavigation = ({ parentTo, parentLabel, parentCompactLabel }) => (
  <nav className="subpage-navigation" aria-label="Page navigation">
    <Link className="subpage-navigation__link" to="/">
      <ArrowLeft />
      <span className="subpage-navigation__label--full">Back home</span>
      <span className="subpage-navigation__label--compact">Home</span>
    </Link>

    {parentTo && parentLabel && (
      <Link
        className="subpage-navigation__link subpage-navigation__link--secondary"
        to={parentTo}
      >
        <ArrowLeft />
        <span className="subpage-navigation__label--full">{parentLabel}</span>
        <span className="subpage-navigation__label--compact">
          {parentCompactLabel || parentLabel}
        </span>
      </Link>
    )}
  </nav>
);

export default SubpageNavigation;
