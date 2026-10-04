import { useState } from 'react';
import { Link } from 'react-router-dom';
import copy from '../../data/siteCopy.json';
import { skillsData } from '../../data/skillsData';
import { MusicControls } from './RainMusic';
import JourneyScroll from './JourneyScroll';
import InterfaceIcon from './InterfaceIcon';
import ExternalLink from './ExternalLink';
import FramedAward from './FramedAward';
export function Heading({ page }) {
  return <div className="rain-page-heading"><h1 id="rain-page-title" tabIndex={-1}>{page.title}</h1><p>{page.subtitle}</p></div>;
}
export function HomePage({ setHovered }) {
  return <><div className="rain-hero-copy"><h1 id="rain-page-title" tabIndex={-1}>{copy.landingPage.fullName}</h1><p className="rain-subtitle">{copy.landingPage.subtitle}</p><p className="rain-description">{copy.landingPage.descriptionLines[0]}</p></div><nav className="rain-destinations" aria-label="Explore Ray’s work">{copy.mainSections.items.map((item, i) => <Link key={item.id} to={`/${item.id}`} onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)} onFocus={() => setHovered(i)} onBlur={() => setHovered(-1)}><span className="rain-destination-mark" aria-hidden="true" /><span>{item.title}</span><small>{item.description}</small></Link>)}</nav></>;
}
export function WorksPage({ setHovered }) {
  return <nav className="rain-works" aria-label="Works categories">{copy.works.categories.map((category, i) => <Link key={category.id} to={`/works/${category.id}`} onPointerEnter={() => setHovered(i)} onPointerLeave={() => setHovered(-1)} onFocus={() => setHovered(i)} onBlur={() => setHovered(-1)}><span className="rain-work-mark" aria-hidden="true" /><h2>{category.title}</h2><p>{category.description}</p><InterfaceIcon name="arrow-right" className="rain-work-enter" /></Link>)}</nav>;
}
export function JourneyPage(props) { return <JourneyScroll {...props} />; }
export function ProjectsPage({ selected, select }) {
  const project = copy.projectsSection.items[selected];
  return <><nav className="rain-project-selector" aria-label="Choose a project">{copy.projectsSection.items.map((p, i) => <button key={p.name} aria-pressed={selected === i} onClick={() => select(i)}><span className="rain-project-thread" aria-hidden="true" /><span>{p.name}</span><small>{p.tag}</small></button>)}</nav><article className="rain-reading rain-project-detail"><h2>{project.name}</h2><p className="rain-project-description">{project.description}</p><ExternalLink href={project.link}>Visit {project.name}</ExternalLink></article></>;
}
export function MusicPage() { return <div className="rain-music-content"><MusicControls /></div>; }
export function ThoughtsPage() {
  return <article className="rain-reading rain-thoughts"><div className="rain-prose">{copy.philosophySection.paragraphs.map(p => <p key={p}>{p}</p>)}</div><div className="rain-tags">{copy.philosophySection.badges.map(b => <span key={b}>{b}</span>)}</div><ExternalLink href="https://medium.com/@DarrenX">Read on Medium</ExternalLink></article>;
}
export function SkillsPage({ selected, select }) {
  const groups = Object.values(skillsData); const group = groups[selected];
  const branches = group.branches || [{category: group.name, skills: group.skills}];
  return <><nav className="rain-skill-tabs" aria-label="Skill groups">{groups.map((g, i) => <button key={g.name} aria-pressed={i === selected} onClick={() => select(i)}>{g.name}</button>)}</nav><div className="rain-reading rain-skill-groups">{branches.map(branch => <section key={branch.category}><h2>{branch.category}</h2>{branch.skills.map(skill => <details key={skill.id} className="rain-skill"><summary>{skill.name}<InterfaceIcon name="plus" className="rain-skill-toggle" /></summary><div className="rain-skill-details"><div className="rain-skill-level"><span style={{width:`${skill.level}%`}} /></div><p>{skill.level}%</p>{skill.projects?.length ? <div className="rain-skill-projects"><span>{copy.skillsSection.modalLabels.projects}</span>{skill.projects.map(project => <small key={project}>{project}</small>)}</div> : null}</div></details>)}</section>)}</div></>;
}
export function AwardsPage({ select, active }) {
  const [filter, setFilter] = useState('all');
  const items = copy.designSection.items.filter(item => filter === 'all' || item.type === filter);
  return <><nav className="rain-award-filters" aria-label="Award categories">{[['all','All'],['design','Design'],['recognition','Recognition']].map(([key,label]) => <button key={key} aria-pressed={filter === key} onClick={() => setFilter(key)}>{label}</button>)}</nav><div className="rain-reading rain-awards-grid">{items.map((award,index) => <FramedAward key={award.title} award={award} index={index} active={active} onSelect={()=>select(copy.designSection.items.indexOf(award))} />)}</div></>;
}
