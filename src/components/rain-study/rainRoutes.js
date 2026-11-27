import copy from '../../data/siteCopy.json';
export const rainRoutes = [
  { path: '/', title: copy.landingPage.fullName, subtitle: copy.landingPage.subtitle, shape: 0, kind: 'home' },
  { path: '/milestones', title: copy.milestones.header.title, subtitle: copy.milestones.header.tagline, shape: 1, kind: 'journey' },
  { path: '/works', title: copy.works.headerLabel, subtitle: copy.mainSections.items[1].description, shape: 2, kind: 'works' },
  { path: '/works/projects', title: copy.projectsSection.header.title, subtitle: copy.projectsSection.header.tagline, shape: 3, kind: 'projects' },
  { path: '/works/art', title: copy.art.title, subtitle: copy.art.subtitle, shape: 4, kind: 'art' },
  { path: '/works/art/music', parent:'/works/art', breadcrumbLabel:'Music', title: copy.musicShowcase.title, subtitle: copy.musicShowcase.tagline, shape: 4, kind: 'music' },
  { path: '/works/philosophy', title: copy.philosophySection.title, subtitle: copy.philosophySection.subtitle, shape: 5, kind: 'thoughts' },
  { path: '/works/skills', title: copy.skillsSection.headerLabel, subtitle: copy.works.categories[3].description, shape: 6, kind: 'skills' },
  { path: '/works/art/photography', parent:'/works/art', title: 'Photography', subtitle: 'Places, light, and moments from my camera.', shape: 2, kind: 'photography' },
  { path: '/design', title: copy.designSection.headerLabel, subtitle: copy.mainSections.items[2].description, shape: 7, kind: 'awards' },
];
export const rainRouteAliases={'/works/music':'/works/art/music','/works/photography':'/works/art/photography'};
